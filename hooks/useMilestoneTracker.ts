import { supabase } from '@/lib/supabase';
import { useEffect, useState } from 'react';

const MILESTONE_INCREMENTS = [50, 150, 300, 600, 1000, 1500];

interface MilestoneData {
  currentTotal: number;
  nextMilestone: number;
  remaining: number;
  progressPercentage: number;
}

export function useMilestoneTracker(userId: string | undefined) {
  const [milestone, setMilestone] = useState<MilestoneData>({
    currentTotal: 0,
    nextMilestone: 50,
    remaining: 50,
    progressPercentage: 0,
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!userId) {
      setIsLoading(false);
      return;
    }

    const loadMilestoneData = async () => {
      setIsLoading(true);
      try {
        const { data: timeData, error: timeError } = await supabase
          .from('time_entries')
          .select('duration_seconds')
          .eq('user_id', userId);

        if (timeError) throw timeError;

        const totalSeconds = (timeData || []).reduce((sum, entry) => sum + entry.duration_seconds, 0);
        const currentTotalHours = totalSeconds / 3600;
        
        let nextMilestone = 50;
        for (let i = 0; i < MILESTONE_INCREMENTS.length; i++) {
          if (currentTotalHours < MILESTONE_INCREMENTS[i]) {
            nextMilestone = MILESTONE_INCREMENTS[i];
            break;
          }
        }
        
        if (currentTotalHours >= MILESTONE_INCREMENTS[MILESTONE_INCREMENTS.length - 1]) {
          const lastMilestone = MILESTONE_INCREMENTS[MILESTONE_INCREMENTS.length - 1];
          const milestoneIndex = Math.floor((currentTotalHours - lastMilestone) / 500) + 1;
          nextMilestone = lastMilestone + (milestoneIndex * 500);
        }

        const remaining = Math.max(0, nextMilestone - currentTotalHours);
        const progressPercentage = Math.min((currentTotalHours / nextMilestone) * 100, 100);

        setMilestone({
          currentTotal: currentTotalHours,
          nextMilestone,
          remaining,
          progressPercentage,
        });

      } catch (error) {
        console.error("Error loading milestone data:", error);
      } finally {
        setIsLoading(false);
      }
    };

    loadMilestoneData();

    const subscription = supabase
      .channel('time-entries-milestone-changes')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'time_entries', filter: `user_id=eq.${userId}` },
        loadMilestoneData
      )
      .subscribe();

    return () => {
      supabase.removeChannel(subscription);
    };
  }, [userId]);

  return { milestone, isLoading };
} 