import { supabase } from '@/lib/supabase';
import { useEffect, useState } from 'react';

export interface StreakDay {
  date: Date;
  tracked: boolean;
}

function getStartOfWeek(date: Date) {

  // Monday as first day of week
  const d = new Date(date);
  const day = d.getDay();
  const diff = d.getDate() - day + (day === 0 ? -6 : 1); // adjust when day is Sunday
  return new Date(d.setDate(diff));
}

export function useWeeklyStreak(userId: string | undefined) {
  const [week, setWeek] = useState<StreakDay[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!userId) return;
    let subscription: ReturnType<typeof supabase.channel>;
    async function fetchWeek() {
      setIsLoading(true);
      const today = new Date();
      const startOfWeek = getStartOfWeek(today);
      const weekDays: Date[] = [];
      for (let i = 0; i < 7; i++) {
        const d = new Date(startOfWeek);
        d.setDate(startOfWeek.getDate() + i);
        weekDays.push(d);
      }

      // query all entries for this user in this week
      const fromDate = weekDays[0].toISOString().split('T')[0];
      const toDate = weekDays[6].toISOString().split('T')[0];
      const { data, error } = await supabase
        .from('time_entries')
        .select('activity_date')
        .eq('user_id', userId)
        .gte('activity_date', fromDate)
        .lte('activity_date', toDate);
      const userTimeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;
      const trackedDates = new Set(
        (data || []).map((entry: any) =>
          new Date(entry.activity_date).toLocaleDateString(undefined, { timeZone: userTimeZone })
        )
      );
      setWeek(
        weekDays.map((date) => ({
          date,
          tracked: trackedDates.has(date.toLocaleDateString(undefined, { timeZone: userTimeZone })),
        }))
      );
      setIsLoading(false);
    }
    fetchWeek();

    // real-time subscription for time_entries
    subscription = supabase
      .channel('weekly-streak-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'time_entries',
          filter: `user_id=eq.${userId}`,
        },
        () => {
          fetchWeek();
        }
      )
      .subscribe();

    return () => {
      subscription?.unsubscribe();
    };
  }, [userId]);

  return { week, isLoading };
} 