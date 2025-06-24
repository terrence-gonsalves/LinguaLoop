import { supabase } from '@/lib/supabase';
import { useEffect, useState } from 'react';

interface AnalysisData {
  data: number[];
  total: number;
}

export function useInputOutputAnalysis(userId: string | undefined, selectedLanguageId: string | null) {
  const [analysis, setAnalysis] = useState<AnalysisData>({
    data: [],
    total: 0,
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!userId) {
      setIsLoading(false);
      return;
    }

    const loadAnalysisData = async () => {
      setIsLoading(true);
      try {
        const { data: activities, error: activitiesError } = await supabase
          .from('activities')
          .select('id, name');
        if (activitiesError) throw activitiesError;

        let timeQuery = supabase
          .from('time_entries')
          .select('duration_seconds, activity_id')
          .eq('user_id', userId);
        if (selectedLanguageId) {
          timeQuery = timeQuery.eq('language_id', selectedLanguageId);
        }
        const { data: timeData, error: timeError } = await timeQuery;
        if (timeError) throw timeError;

        const timePerActivity = new Map<string, number>();
        (timeData || []).forEach(entry => {
          const current = timePerActivity.get(entry.activity_id) || 0;
          timePerActivity.set(entry.activity_id, current + entry.duration_seconds);
        });

        const inputActivities = ['Reading', 'Listening'];
        const outputActivities = ['Writing', 'Speaking'];
        const inputIds = (activities || []).filter(a => inputActivities.includes(a.name)).map(a => a.id);
        const outputIds = (activities || []).filter(a => outputActivities.includes(a.name)).map(a => a.id);

        let inputTotal = 0;
        let outputTotal = 0;

        for(const [activityId, time] of timePerActivity.entries()){
            if(inputIds.includes(activityId)){
                inputTotal += time;
            } else if(outputIds.includes(activityId)){
                outputTotal += time;
            }
        }
        
        const total = inputTotal + outputTotal;
        
        setAnalysis({
          data: [inputTotal / 3600, outputTotal / 3600], // in hours
          total: total,
        });

      } catch (error) {
        console.error("Error loading analysis data:", error);
      } finally {
        setIsLoading(false);
      }
    };

    loadAnalysisData();

    const subscription = supabase
      .channel('time-entries-analysis-changes')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'time_entries', filter: `user_id=eq.${userId}` },
        loadAnalysisData
      )
      .subscribe();

    return () => {
      supabase.removeChannel(subscription);
    };
  }, [userId, selectedLanguageId]);

  return { analysis, isLoading };
} 