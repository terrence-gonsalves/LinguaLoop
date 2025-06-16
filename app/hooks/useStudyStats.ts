import { supabase } from '@/lib/supabase';
import { useEffect, useState } from 'react';

interface Goal {
  id: string;
  title: string;
  description: string | null;
  goal_type: 'daily_time' | 'weekly_time' | 'monthly_vocab' | 'lessons_completed' | 'skill_level' | 'custom';
  target_value_numeric: number | null;
  target_value_text: string | null;
  start_date: string;
  end_date: string;
  status: 'active' | 'completed' | 'failed' | 'paused' | 'archived';
  progress: number;
}

interface StudyStats {
  goal: Goal | null;
  totalStudyTime: {
    hours: number;
    minutes: number;
  };
  languageCount: number;
}

export function useStudyStats(userId: string | undefined) {
  const [stats, setStats] = useState<StudyStats>({
    goal: null,
    totalStudyTime: { hours: 0, minutes: 0 },
    languageCount: 0,
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!userId) return;
    let subscription: ReturnType<typeof supabase.channel>;

    async function loadStudyStats() {
      try {
        setIsLoading(true);

        // Fetch most recent active goal
        const { data: goalData, error: goalError } = await supabase
          .from('goals')
          .select('*')
          .eq('user_id', userId)
          .eq('status', 'active')
          .order('created_at', { ascending: false })
          .limit(1)
          .single();

        if (goalError && goalError.code !== 'PGRST116') throw goalError;

        // Calculate goal progress if it's a time-based goal
        let goalProgress = 0;
        if (goalData) {
          const now = new Date();
          const startDate = new Date(goalData.start_date);
          const endDate = new Date(goalData.end_date);
          const totalDuration = endDate.getTime() - startDate.getTime();
          const elapsedDuration = now.getTime() - startDate.getTime();
          goalProgress = Math.min(Math.round((elapsedDuration / totalDuration) * 100), 100);
        }

        // Fetch total study time
        const { data: timeData, error: timeError } = await supabase
          .from('time_entries')
          .select('duration_seconds')
          .eq('user_id', userId);

        if (timeError) throw timeError;

        const totalSeconds = (timeData || []).reduce((sum, entry) => sum + entry.duration_seconds, 0);
        const hours = Math.floor(totalSeconds / 3600);
        const minutes = Math.floor((totalSeconds % 3600) / 60);

        // Count unique languages
        const { count: languageCount, error: languageError } = await supabase
          .from('languages')
          .select('*', { count: 'exact', head: true })
          .eq('user_id', userId);

        if (languageError) throw languageError;

        setStats({
          goal: goalData ? { ...goalData, progress: goalProgress } : null,
          totalStudyTime: { hours, minutes },
          languageCount: languageCount || 0,
        });
      } catch (err) {
        console.error('Error loading study stats:', err);
      } finally {
        setIsLoading(false);
      }
    }

    loadStudyStats();

    // Set up real-time subscriptions
    subscription = supabase
      .channel('study-stats-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'time_entries',
          filter: `user_id=eq.${userId}`,
        },
        () => {
          loadStudyStats();
        }
      )
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'goals',
          filter: `user_id=eq.${userId}`,
        },
        () => {
          loadStudyStats();
        }
      )
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'languages',
          filter: `user_id=eq.${userId}`,
        },
        () => {
          loadStudyStats();
        }
      )
      .subscribe();

    return () => {
      subscription?.unsubscribe();
    };
  }, [userId]);

  return { stats, isLoading };
} 