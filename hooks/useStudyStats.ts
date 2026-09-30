import {
  fetchTimeGoalProgress,
  getGoalDisplayStatus,
  parseDateOnly,
  type Goal as GoalRow,
  type GoalDisplayStatus,
  type TimeGoalProgress,
} from '@/lib/goals';
import { supabase } from '@/lib/supabase';
import { useCallback, useEffect, useRef, useState } from 'react';

type Goal = GoalRow & {
  // percent shown in the dashboard ring
  progress: number;
  displayStatus: GoalDisplayStatus;

  // logged time for daily_time and weekly_time goals that are in progress
  timeProgress: TimeGoalProgress | null;
};

// share of the goal's days that have passed, 0 to 100. used for goals that
// aren't measured in logged time.
function getElapsedPercent(goal: GoalRow, now: Date): number {
  const start = parseDateOnly(goal.start_date).getTime();
  const endExclusive = parseDateOnly(goal.end_date);
  endExclusive.setDate(endExclusive.getDate() + 1);

  const total = endExclusive.getTime() - start;
  if (total <= 0) return 0;

  const elapsed = now.getTime() - start;
  return Math.max(0, Math.min(Math.round((elapsed / total) * 100), 100));
}

interface StudyStats {
  goal: Goal | null;
  totalStudyTime: {
    hours: number;
    minutes: number;
  };
  languageCount: number;
}

export function useStudyStats(userId: string | undefined) {
  const [stats, setStats] = useState<StudyStats>({
    goal: null,
    totalStudyTime: { hours: 0, minutes: 0 },
    languageCount: 0,
  });
  const [isLoading, setIsLoading] = useState(true);
  const subscriptionRef = useRef<ReturnType<typeof supabase.channel> | null>(null);
  const loadRef = useRef<((showLoading?: boolean) => Promise<void>) | null>(null);

  useEffect(() => {
    if (!userId) return;
    let isMounted = true;

    async function loadStudyStats(showLoading: boolean = true) {
      try {
        if (!isMounted) return;
        if (showLoading) setIsLoading(true);

        // fetch most recent active goal
        const { data: goalData, error: goalError } = await supabase
          .from('goals')
          .select('*')
          .eq('user_id', userId)
          .eq('status', 'active')
          .order('created_at', { ascending: false })
          .limit(1)
          .single();

        if (goalError && goalError.code !== 'PGRST116') throw goalError;

        // time goals show logged minutes against the target, other goals show elapsed days
        let goal: Goal | null = null;
        if (goalData) {
          const now = new Date();
          const timeProgress = await fetchTimeGoalProgress(goalData as GoalRow, now);

          goal = {
            ...(goalData as GoalRow),
            progress: timeProgress
              ? timeProgress.percent
              : getElapsedPercent(goalData as GoalRow, now),
            displayStatus: getGoalDisplayStatus(goalData as GoalRow),
            timeProgress,
          };
        }

        // fetch total study time
        const { data: timeData, error: timeError } = await supabase
          .from('time_entries')
          .select('duration_seconds')
          .eq('user_id', userId);

        if (timeError) throw timeError;

        const totalSeconds = (timeData || []).reduce(
          (sum, entry) => sum + entry.duration_seconds,
          0
        );
        const hours = Math.floor(totalSeconds / 3600);
        const minutes = Math.floor((totalSeconds % 3600) / 60);

        // count unique languages
        const { count: languageCount, error: languageError } = await supabase
          .from('languages')
          .select('*', { count: 'exact', head: true })
          .eq('user_id', userId);

        if (languageError) throw languageError;

        if (!isMounted) return;

        setStats({
          goal,
          totalStudyTime: { hours, minutes },
          languageCount: languageCount || 0,
        });
      } catch (err) {
        if (!isMounted) return;
        console.error('Error loading study stats:', err);
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    }

    loadRef.current = loadStudyStats;

    // clean up any existing subscription
    if (subscriptionRef.current) {
      subscriptionRef.current.unsubscribe();
      subscriptionRef.current = null;
    }

    loadStudyStats();

    // set up real-time subscriptions. goals isn't in the supabase_realtime
    // publication, so goal changes are picked up by refresh() on screen focus.
    const channelName = `study-stats-changes-${userId}-${Date.now()}`;
    subscriptionRef.current = supabase
      .channel(channelName)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'time_entries',
          filter: `user_id=eq.${userId}`,
        },
        () => {
          if (isMounted) {
            loadStudyStats();
          }
        }
      )
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'languages',
          filter: `user_id=eq.${userId}`,
        },
        () => {
          if (isMounted) {
            loadStudyStats();
          }
        }
      )
      .subscribe();

    return () => {
      isMounted = false;
      loadRef.current = null;

      if (subscriptionRef.current) {
        subscriptionRef.current.unsubscribe();
        subscriptionRef.current = null;
      }
    };
  }, [userId]);

  // reloads without showing the loading state. the dashboard calls this on focus.
  const refresh = useCallback(async () => {
    await loadRef.current?.(false);
  }, []);

  return { stats, isLoading, refresh };
}
