import Colors from '@/constants/Colors';
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
  timeDistribution: {
    labels: string[];
    data: number[];
    activityColors: string[];
  };
  timePerActivity: {
    labels: string[];
    data: number[];
  };
  weeklyProgress: {
    labels: string[];
    data: number[];
  };
  inputOutputAnalysis: {
    data: number[];
    total: number;
  };
}

const MILESTONE_INCREMENTS = [50, 150, 300, 600, 1000, 1500];

export function useReportsData(
  userId: string | undefined, 
  userCreatedAt: string | undefined, 
  selectedLanguageId: string | null
) {
  const [data, setData] = useState<ReportsData>({
    totalTime: { hours: 0, minutes: 0, seconds: 0 },
    averageSession: { currentDay: 0, previousDay: 0, changePercent: null },
    milestone: { currentTotal: 0, nextMilestone: 50, remaining: 50, progressPercentage: 0 },
    timeDistribution: { labels: [], data: [], activityColors: [] },
    timePerActivity: { labels: [], data: [] },
    weeklyProgress: { labels: [], data: [] },
    inputOutputAnalysis: { data: [], total: 0 },
  });
  const [isLoading, setIsLoading] = useState(true);
  const subscriptionRef = useRef<ReturnType<typeof supabase.channel> | null>(null);

  useEffect(() => {
    if (!userId || !userCreatedAt) return;
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

        // calculate time distribution by activity
        // first get all activities
        const { data: activitiesData, error: activitiesError } = await supabase
          .from('activities')
          .select('id, name')
          .order('created_at', { ascending: true });

        if (activitiesError) throw activitiesError;

        // then get time entries with activity filtering. also get created_at for weekly calc
        let timeDistributionQuery = supabase
          .from('time_entries')
          .select('duration_seconds, activity_id, created_at')
          .eq('user_id', userId);
        
        if (selectedLanguageId) {
          timeDistributionQuery = timeDistributionQuery.eq('language_id', selectedLanguageId);
        }
        
        const { data: timeDistributionData, error: timeDistributionError } = await timeDistributionQuery;

        if (timeDistributionError) throw timeDistributionError;

        // group time by activity_id
        const timePerActivity = new Map<string, number>();
        (timeDistributionData || []).forEach(entry => {
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
        const timePerActivityData: number[] = [];

        (activitiesData || []).forEach((activity, index) => {
            labels.push(activity.name);
            
            const activityTime = timePerActivity.get(activity.id) || 0;
            const percentage = totalActivityTime > 0 ? activityTime / totalActivityTime : 0;
            data.push(percentage);
            timePerActivityData.push(activityTime / 3600); // Convert seconds to hours

            activityColors.push(allActivityColors[index % allActivityColors.length]);
        });
        
        // --- weekly progress calculation ---
        const weeklyProgressLabels: string[] = [];
        const weeklyProgressData: number[] = [];
        
        if (userCreatedAt) {
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
            (timeDistributionData || []).forEach(entry => {
                const entryDate = new Date(entry.created_at);
                entryDate.setHours(0,0,0,0);
                const weekNum = Math.floor((entryDate.getTime() - startDayMonday.getTime()) / (1000 * 60 * 60 * 24 * 7)) + 1;
                
                if(weekNum >= startWeek && weekNum <= endWeek) {
                    const current = weeklyTimeMap.get(weekNum) || 0;
                    weeklyTimeMap.set(weekNum, current + entry.duration_seconds);
                }
            });

            for (let i = startWeek; i <= endWeek; i++) {
                weeklyProgressLabels.push(`${i}`);
                const weeklyHours = (weeklyTimeMap.get(i) || 0) / 3600;
                weeklyProgressData.push(weeklyHours);
            }
        }
        
        // --- input/output analysis ---
        const inputOutputData = [0, 0]; // [Input, Output]
        let inputOutputTotal = 0;
        const inputActivities = ['Reading', 'Listening'];
        const outputActivities = ['Writing', 'Speaking'];

        labels.forEach((label, index) => {
            const hours = timePerActivityData[index];
            if (inputActivities.includes(label)) {
                inputOutputData[0] += hours;
            } else if (outputActivities.includes(label)) {
                inputOutputData[1] += hours;
            }
        });
        inputOutputTotal = inputOutputData[0] + inputOutputData[1];

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
          },
          timeDistribution: {
            labels,
            data,
            activityColors
          },
          timePerActivity: {
            labels,
            data: timePerActivityData,
          },
          weeklyProgress: {
            labels: weeklyProgressLabels,
            data: weeklyProgressData
          },
          inputOutputAnalysis: {
              data: inputOutputData,
              total: inputOutputTotal,
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
  }, [userId, userCreatedAt, selectedLanguageId]);

  return { data, isLoading };
} 