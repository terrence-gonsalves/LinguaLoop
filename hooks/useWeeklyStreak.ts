import { toDateString } from '@/lib/goals';
import { supabase } from '@/lib/supabase';
import { useEffect, useRef, useState } from 'react';

export interface StreakDay {
  date: Date;
  tracked: boolean;
}

function getStartOfWeek(date: Date): Date {
  const d = new Date(date);
  const day = d.getDay();
  const diff = d.getDate() - day + (day === 0 ? -6 : 1); // adjust when day is sunday
  return new Date(d.setDate(diff));
}

export function useWeeklyStreak(userId: string | undefined) {
  const [week, setWeek] = useState<StreakDay[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const subscriptionRef = useRef<ReturnType<typeof supabase.channel> | null>(null);

  useEffect(() => {
    if (!userId) return;
    let isMounted = true;

    async function fetchWeek() {
      if (!isMounted) return;
      setIsLoading(true);
      const today = new Date();
      const startOfWeek = getStartOfWeek(today);
      const weekDays: Date[] = [];

      for (let i = 0; i < 7; i++) {
        const d = new Date(startOfWeek);
        d.setDate(startOfWeek.getDate() + i);
        weekDays.push(d);
      }

      // query all entries for this user in this week. activity_date is a date
      // column, so compare local YYYY-MM-DD days
      const fromDate = toDateString(weekDays[0]);
      const toDate = toDateString(weekDays[6]);
      const { data } = await supabase
        .from('time_entries')
        .select('activity_date')
        .eq('user_id', userId)
        .gte('activity_date', fromDate)
        .lte('activity_date', toDate);

      if (!isMounted) return;

      const trackedDates = new Set(
        (data || []).map((entry: { activity_date: string }) => entry.activity_date)
      );
      setWeek(
        weekDays.map((date) => ({
          date,
          tracked: trackedDates.has(toDateString(date)),
        }))
      );
      setIsLoading(false);
    }

    // clean up any existing subscription
    if (subscriptionRef.current) {
      subscriptionRef.current.unsubscribe();
      subscriptionRef.current = null;
    }

    fetchWeek();

    // real-time subscription for time_entries
    const channelName = `weekly-streak-changes-${userId}-${Date.now()}`;
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
            fetchWeek();
          }
        }
      )
      .subscribe();

    return () => {
      isMounted = false;

      if (subscriptionRef.current) {
        subscriptionRef.current.unsubscribe();
        subscriptionRef.current = null;
      }
    };
  }, [userId]);

  return { week, isLoading };
}
