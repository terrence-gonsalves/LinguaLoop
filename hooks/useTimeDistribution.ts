import Colors from '@/constants/Colors';
import { supabase } from '@/lib/supabase';
import { useEffect, useState } from 'react';

interface TimeDistributionData {
  labels: string[];
  data: number[];
  activityColors: string[];
}

export function useTimeDistribution(userId: string | undefined, selectedLanguageId: string | null) {
  const [distribution, setDistribution] = useState<TimeDistributionData>({
    labels: [],
    data: [],
    activityColors: [],
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!userId) {
      setIsLoading(false);
      return;
    }

    const loadDistributionData = async () => {
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

        const totalActivityTime = Array.from(timePerActivity.values()).reduce((sum, time) => sum + time, 0);
        const allActivityColors = [
          Colors.light.activityBlue1,
          Colors.light.activityBlue2,
          Colors.light.activityOrange,
          Colors.light.activityPink,
        ];

        const labels: string[] = [];
        const data: number[] = [];
        const activityColors: string[] = [];

        (activitiesData || []).forEach((activity, index) => {
          labels.push(activity.name);
          const activityTime = timePerActivity.get(activity.id) || 0;
          const percentage = totalActivityTime > 0 ? activityTime / totalActivityTime : 0;
          data.push(percentage);
          activityColors.push(allActivityColors[index % allActivityColors.length]);
        });
        
        setDistribution({ labels, data, activityColors });

      } catch (error) {
        console.error("Error loading time distribution data:", error);
      } finally {
        setIsLoading(false);
      }
    };

    loadDistributionData();

    const subscription = supabase
      .channel('time-entries-distribution-changes')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'time_entries', filter: `user_id=eq.${userId}` },
        loadDistributionData
      )
      .subscribe();

    return () => {
      supabase.removeChannel(subscription);
    };
  }, [userId, selectedLanguageId]);

  return { distribution, isLoading };
} 