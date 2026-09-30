import { supabase } from '@/lib/supabase';

// statuses stored in goals.status (goal_status_enum). the nightly
// update_expired_goals job moves active goals past their end_date to missed.
export type GoalStatus = 'active' | 'completed' | 'missed';

export type GoalType =
  'daily_time' | 'weekly_time' | 'monthly_vocab' | 'lessons_completed' | 'skill_level' | 'custom';

export type Goal = {
  id: string;
  user_id: string;
  language_id: string | null;
  title: string;
  description: string | null;
  goal_type: GoalType;
  target_value_numeric: number | null;
  target_value_text: string | null;
  start_date: string; // YYYY-MM-DD
  end_date: string; // YYYY-MM-DD
  status: GoalStatus;
  created_at: string | null;
  updated_at: string | null;
};

// what the app shows. "Not started" and "In progress" are derived from the
// dates of an active goal and are never stored.
export type GoalDisplayStatus = 'Not started' | 'In progress' | 'Completed' | 'Missed';

export type TimeGoalProgress = {
  minutes: number;
  targetMinutes: number;
  percent: number;
  period: 'today' | 'this week';
};

const MS_PER_DAY = 24 * 60 * 60 * 1000;

// a Date as a local calendar day, YYYY-MM-DD. start_date and end_date are
// date columns, so they must not go through toISOString(), which uses UTC and
// can land on the next or previous day.
export function toDateString(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');

  return `${year}-${month}-${day}`;
}

// a YYYY-MM-DD date column as local midnight. new Date('YYYY-MM-DD') would
// parse it as UTC midnight, which is the previous evening west of UTC.
export function parseDateOnly(value: string): Date {
  const [year, month, day] = value.slice(0, 10).split('-').map(Number);

  return new Date(year, month - 1, day);
}

export function getGoalDisplayStatus(
  goal: Pick<Goal, 'status' | 'start_date' | 'end_date'>,
  today: string = toDateString(new Date())
): GoalDisplayStatus {
  if (goal.status === 'completed') return 'Completed';
  if (goal.status === 'missed') return 'Missed';

  // YYYY-MM-DD strings compare correctly as text
  if (goal.start_date > today) return 'Not started';

  // past its end date but the nightly job hasn't marked it missed yet
  if (goal.end_date < today) return 'Missed';

  return 'In progress';
}

// active and missed goals can still be marked as completed by hand
export function canMarkCompleted(goal: Pick<Goal, 'status'>): boolean {
  return goal.status === 'active' || goal.status === 'missed';
}

export function isTimeGoal(goal: Pick<Goal, 'goal_type'>): boolean {
  return goal.goal_type === 'daily_time' || goal.goal_type === 'weekly_time';
}

// the days whose logged time counts toward a time goal right now: today for a
// daily goal, the current Monday to Sunday week for a weekly goal. clipped to
// the goal's own dates. null when the goal isn't in progress.
function getProgressWindow(
  goal: Goal,
  now: Date
): { from: Date; toExclusive: Date; period: TimeGoalProgress['period'] } | null {
  const today = toDateString(now);

  if (getGoalDisplayStatus(goal, today) !== 'In progress') return null;

  const todayStart = parseDateOnly(today);
  let from = todayStart;
  let toExclusive = new Date(todayStart.getTime() + MS_PER_DAY);
  let period: TimeGoalProgress['period'] = 'today';

  if (goal.goal_type === 'weekly_time') {
    // getDay() is 0 for Sunday, so Sunday belongs to the week that started 6 days earlier
    const daysSinceMonday = (todayStart.getDay() + 6) % 7;
    from = new Date(todayStart);
    from.setDate(from.getDate() - daysSinceMonday);
    toExclusive = new Date(from);
    toExclusive.setDate(toExclusive.getDate() + 7);
    period = 'this week';
  }

  const goalStart = parseDateOnly(goal.start_date);
  const goalEndExclusive = parseDateOnly(goal.end_date);
  goalEndExclusive.setDate(goalEndExclusive.getDate() + 1);

  if (from < goalStart) from = goalStart;
  if (toExclusive > goalEndExclusive) toExclusive = goalEndExclusive;

  return { from, toExclusive, period };
}

// minutes logged toward a daily_time or weekly_time goal, from time_entries.
// counts only the goal's language, or every language if the goal has none.
// returns null for other goal types and for goals that aren't in progress.
export async function fetchTimeGoalProgress(
  goal: Goal,
  now: Date = new Date()
): Promise<TimeGoalProgress | null> {
  if (!isTimeGoal(goal) || !goal.target_value_numeric) return null;

  const range = getProgressWindow(goal, now);
  if (!range) return null;

  let query = supabase
    .from('time_entries')
    .select('duration_seconds')
    .eq('user_id', goal.user_id)
    .gte('activity_date', range.from.toISOString())
    .lt('activity_date', range.toExclusive.toISOString());

  if (goal.language_id) {
    query = query.eq('language_id', goal.language_id);
  }

  const { data, error } = await query;

  if (error) throw error;

  const totalSeconds = (data || []).reduce((sum, entry) => sum + (entry.duration_seconds || 0), 0);
  const minutes = Math.floor(totalSeconds / 60);
  const targetMinutes = goal.target_value_numeric;

  return {
    minutes,
    targetMinutes,
    percent: Math.min(Math.round((minutes / targetMinutes) * 100), 100),
    period: range.period,
  };
}

// sets a goal's status to completed. throws if the update fails or matches no row.
export async function markGoalCompleted(goalId: string): Promise<Goal> {
  const { data, error } = await supabase
    .from('goals')
    .update({ status: 'completed' })
    .eq('id', goalId)
    .select()
    .single();

  if (error) throw error;
  if (!data) throw new Error('Goal not found');

  return data as Goal;
}
