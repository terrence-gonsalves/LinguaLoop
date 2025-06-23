import { supabase } from '@/lib/supabase';
import { useEffect, useState } from 'react';

interface WeeklyProgressData {
  labels: string[];
  data: number[];
}

export function useWeeklyProgress(userId: string | undefined, userCreatedAt: string | undefined, selectedLanguageId: string | null) {
  const [progressData, setProgressData] = useState<WeeklyProgressData>({
    labels: [],
    data: [],
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!userId || !userCreatedAt) {
      setIsLoading(false);
      return;
    }

    const loadWeeklyProgressData = async () => {
      setIsLoading(true);
      try {
        let query = supabase
          .from('time_entries')
          .select('duration_seconds, created_at')
          .eq('user_id', userId);

        if (selectedLanguageId) {
          query = query.eq('language_id', selectedLanguageId);
        }

        const { data: timeData, error: timeError } = await query;
        if (timeError) throw timeError;

        const startDate = new Date(userCreatedAt);
        const todayDate = new Date();
        
        startDate.setHours(0, 0, 0, 0);
        todayDate.setHours(0, 0, 0, 0);

        const dayOfWeek = startDate.getDay();
        const startDayMonday = new Date(startDate);
        startDayMonday.setDate(startDate.getDate() - (dayOfWeek === 0 ? 6 : dayOfWeek - 1));

        const weeksSinceSignup = Math.floor((todayDate.getTime() - startDayMonday.getTime()) / (1000 * 60 * 60 * 24 * 7));
        
        const currentWeek = weeksSinceSignup + 1;
        const startWeek = Math.max(1, currentWeek - 5);
        const endWeek = startWeek + 5;

        const weeklyTimeMap = new Map<number, number>();
        (timeData || []).forEach(entry => {
            const entryDate = new Date(entry.created_at);
            entryDate.setHours(0,0,0,0);
            const weekNum = Math.floor((entryDate.getTime() - startDayMonday.getTime()) / (1000 * 60 * 60 * 24 * 7)) + 1;
            
            if(weekNum >= startWeek && weekNum <= endWeek) {
                const current = weeklyTimeMap.get(weekNum) || 0;
                weeklyTimeMap.set(weekNum, current + entry.duration_seconds);
            }
        });

        const labels: string[] = [];
        const data: number[] = [];
        for (let i = startWeek; i <= endWeek; i++) {
            labels.push(`${i}`);
            const weeklyHours = (weeklyTimeMap.get(i) || 0) / 3600;
            data.push(weeklyHours);
        }
        
        setProgressData({ labels, data });

      } catch (error) {
        console.error("Error loading weekly progress data:", error);
      } finally {
        setIsLoading(false);
      }
    };

    loadWeeklyProgressData();

    const subscription = supabase
      .channel('time-entries-weekly-progress-changes')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'time_entries', filter: `user_id=eq.${userId}` },
        loadWeeklyProgressData
      )
      .subscribe();

    return () => {
      supabase.removeChannel(subscription);
    };
  }, [userId, userCreatedAt, selectedLanguageId]);

  return { progressData, isLoading };
} 