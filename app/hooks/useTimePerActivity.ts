import { supabase } from '@/lib/supabase';
import { useEffect, useState } from 'react';

interface TimePerActivityData {
  labels: string[];
  data: number[];
}

export function useTimePerActivity(userId: string | undefined, selectedLanguageId: string | null) {
  const [activityData, setActivityData] = useState<TimePerActivityData>({
    labels: [],
    data: [],
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!userId) {
      setIsLoading(false);
      return;
    }

    const loadTimePerActivityData = async () => {
      setIsLoading(true);
      try {
        const { data: activitiesData, error: activitiesError } = await supabase
          .from('activities')
          .select('id, name')
          .order('created_at', { ascending: true });
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

        const labels: string[] = [];
        const data: number[] = [];

        (activitiesData || []).forEach(activity => {
          labels.push(activity.name);
          const hours = (timePerActivity.get(activity.id) || 0) / 3600;
          data.push(hours);
        });
        
        setActivityData({ labels, data });

      } catch (error) {
        console.error("Error loading time per activity data:", error);
      } finally {
        setIsLoading(false);
      }
    };

    loadTimePerActivityData();

    const subscription = supabase
      .channel('time-entries-per-activity-changes')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'time_entries', filter: `user_id=eq.${userId}` },
        loadTimePerActivityData
      )
      .subscribe();

    return () => {
      supabase.removeChannel(subscription);
    };
  }, [userId, selectedLanguageId]);

  return { activityData, isLoading };
} 