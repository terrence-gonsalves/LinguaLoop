import { supabase } from '@/lib/supabase';
import { useEffect, useRef, useState } from 'react';

interface ReportsData {
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
  milestone: {
    currentTotal: number;
    nextMilestone: number;
    remaining: number;
    progressPercentage: number;
  };
}

const MILESTONE_INCREMENTS = [50, 150, 300, 600, 1000, 1500];

export function useReportsData(userId: string | undefined, selectedLanguageId: string | null) {
  const [data, setData] = useState<ReportsData>({
    totalTime: { hours: 0, minutes: 0, seconds: 0 },
    averageSession: { currentDay: 0, previousDay: 0, changePercent: null },
    milestone: { currentTotal: 0, nextMilestone: 50, remaining: 50, progressPercentage: 0 },
  });
  const [isLoading, setIsLoading] = useState(true);
  const subscriptionRef = useRef<ReturnType<typeof supabase.channel> | null>(null);

  useEffect(() => {
    if (!userId) return;
    let isMounted = true;

    async function loadReportsData() {
      try {
        if (!isMounted) return;
        setIsLoading(true);

        // get total time across all languages (or filtered by selected language)
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

        // calculate average session for current day and previous day
        const now = new Date();
        const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        const yesterday = new Date(today.getTime() - 24 * 60 * 60 * 1000);

        // get today's sessions
        let todayQuery = supabase
          .from('time_entries')
          .select('duration_seconds')
          .eq('user_id', userId)
          .gte('activity_date', today.toISOString())
          .lt('activity_date', new Date(today.getTime() + 24 * 60 * 60 * 1000).toISOString());
        
        if (selectedLanguageId) {
          todayQuery = todayQuery.eq('language_id', selectedLanguageId);
        }
        
        const { data: todayData, error: todayError } = await todayQuery;

        if (todayError) throw todayError;

        // get yesterday's sessions
        let yesterdayQuery = supabase
          .from('time_entries')
          .select('duration_seconds')
          .eq('user_id', userId)
          .gte('activity_date', yesterday.toISOString())
          .lt('activity_date', today.toISOString());
        
        if (selectedLanguageId) {
          yesterdayQuery = yesterdayQuery.eq('language_id', selectedLanguageId);
        }
        
        const { data: yesterdayData, error: yesterdayError } = await yesterdayQuery;

        // calculate averages
        const todaySessions = todayData || [];
        const yesterdaySessions = yesterdayData || [];
        
        const todayTotalSeconds = todaySessions.reduce((sum, entry) => sum + entry.duration_seconds, 0);
        const yesterdayTotalSeconds = yesterdaySessions.reduce((sum, entry) => sum + entry.duration_seconds, 0);
        
        const todayAverage = todaySessions.length > 0 ? todayTotalSeconds / todaySessions.length : 0;
        const yesterdayAverage = yesterdaySessions.length > 0 ? yesterdayTotalSeconds / yesterdaySessions.length : 0;
        
        // calculate change percentage
        let changePercent: number | null = null;
        if (yesterdayAverage > 0) {
          changePercent = ((todayAverage - yesterdayAverage) / yesterdayAverage) * 100;
        }

        // calculate milestone data
        const currentTotalHours = totalSeconds / 3600;
        let nextMilestone = 50;
        
        // find the next milestone
        for (let i = 0; i < MILESTONE_INCREMENTS.length; i++) {
          if (currentTotalHours < MILESTONE_INCREMENTS[i]) {
            nextMilestone = MILESTONE_INCREMENTS[i];
            break;
          }
        }
        
        // if we've passed all predefined milestones, calculate the next one
        if (currentTotalHours >= MILESTONE_INCREMENTS[MILESTONE_INCREMENTS.length - 1]) {
          const lastMilestone = MILESTONE_INCREMENTS[MILESTONE_INCREMENTS.length - 1];
          const milestoneIndex = Math.floor((currentTotalHours - lastMilestone) / 500) + 1;
          nextMilestone = lastMilestone + (milestoneIndex * 500);
        }

        const remaining = Math.max(0, nextMilestone - currentTotalHours);
        const progressPercentage = Math.min((currentTotalHours / nextMilestone) * 100, 100);

        if (!isMounted) return;

        setData({
          totalTime: { hours: totalHours, minutes: totalMinutes, seconds: remainingSeconds },
          averageSession: { 
            currentDay: todayAverage, 
            previousDay: yesterdayAverage, 
            changePercent 
          },
          milestone: {
            currentTotal: currentTotalHours,
            nextMilestone,
            remaining,
            progressPercentage
          }
        });
      } catch (err) {
        if (!isMounted) return;
        console.error('Error loading reports data:', err);
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    }

    // clean up any existing subscription
    if (subscriptionRef.current) {
      subscriptionRef.current.unsubscribe();
      subscriptionRef.current = null;
    }

    loadReportsData();

    // set up real-time subscriptions
    const channelName = `reports-data-changes-${userId}-${Date.now()}`;
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
            loadReportsData();
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
  }, [userId, selectedLanguageId]);

  return { data, isLoading };
} 