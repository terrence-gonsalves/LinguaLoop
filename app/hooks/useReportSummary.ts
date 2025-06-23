import { supabase } from '@/lib/supabase';
import { useEffect, useState } from 'react';

interface ReportSummary {
  totalTime: {
    hours: number;
    minutes: number;
    seconds: number;
  };
  averageSession: {
    currentDay: number;
    previousDay: number;
    changePercent: number | null;
  };
}

export function useReportSummary(userId: string | undefined, selectedLanguageId: string | null) {
  const [summary, setSummary] = useState<ReportSummary>({
    totalTime: { hours: 0, minutes: 0, seconds: 0 },
    averageSession: { currentDay: 0, previousDay: 0, changePercent: null },
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!userId) {
      setIsLoading(false);
      return;
    }

    const loadSummaryData = async () => {
      setIsLoading(true);
      try {

        // --- total time ---
        let timeQuery = supabase
          .from('time_entries')
          .select('duration_seconds')
          .eq('user_id', userId);
        
        if (selectedLanguageId) {
          timeQuery = timeQuery.eq('language_id', selectedLanguageId);
        }
        
        const { data: timeData, error: timeError } = await timeQuery;
        if (timeError) throw timeError;

        const totalSeconds = (timeData || []).reduce((sum, entry) => sum + entry.duration_seconds, 0);
        const totalHours = Math.floor(totalSeconds / 3600);
        const totalMinutes = Math.floor((totalSeconds % 3600) / 60);
        const remainingSeconds = totalSeconds % 60;

        // --- average session ---
        const now = new Date();
        const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        const yesterday = new Date(today.getTime() - 24 * 60 * 60 * 1000);

        // today's sessions
        let todayQuery = supabase.from('time_entries').select('duration_seconds').eq('user_id', userId).gte('activity_date', today.toISOString()).lt('activity_date', new Date(today.getTime() + 24 * 60 * 60 * 1000).toISOString());
        if (selectedLanguageId) todayQuery = todayQuery.eq('language_id', selectedLanguageId);
        const { data: todayData, error: todayError } = await todayQuery;
        if (todayError) throw todayError;

        // yesterday's sessions
        let yesterdayQuery = supabase.from('time_entries').select('duration_seconds').eq('user_id', userId).gte('activity_date', yesterday.toISOString()).lt('activity_date', today.toISOString());
        if (selectedLanguageId) yesterdayQuery = yesterdayQuery.eq('language_id', selectedLanguageId);
        const { data: yesterdayData, error: yesterdayError } = await yesterdayQuery;
        if (yesterdayError) throw yesterdayError;
        
        const todayTotalSeconds = (todayData || []).reduce((sum, entry) => sum + entry.duration_seconds, 0);
        const yesterdayTotalSeconds = (yesterdayData || []).reduce((sum, entry) => sum + entry.duration_seconds, 0);
        
        const todayAverage = todayData.length > 0 ? todayTotalSeconds / todayData.length : 0;
        const yesterdayAverage = yesterdayData.length > 0 ? yesterdayTotalSeconds / yesterdayData.length : 0;
        
        let changePercent: number | null = null;
        if (yesterdayAverage > 0) {
          changePercent = ((todayAverage - yesterdayAverage) / yesterdayAverage) * 100;
        }

        setSummary({
          totalTime: { hours: totalHours, minutes: totalMinutes, seconds: remainingSeconds },
          averageSession: { currentDay: todayAverage, previousDay: yesterdayAverage, changePercent },
        });

      } catch (error) {
        console.error("Error loading report summary:", error);
      } finally {
        setIsLoading(false);
      }
    };

    loadSummaryData();

    const subscription = supabase
      .channel('time-entries-summary-changes')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'time_entries', filter: `user_id=eq.${userId}` },
        loadSummaryData
      )
      .subscribe();

    return () => {
      supabase.removeChannel(subscription);
    };
  }, [userId, selectedLanguageId]);

  return { summary, isLoading };
} 