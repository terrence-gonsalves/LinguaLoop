import { supabase } from '@/lib/supabase';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useEffect, useState } from 'react';

export interface Achievement {
  id: string;
  title: string;
  notes: string;
  icon: keyof typeof MaterialCommunityIcons.glyphMap;
  progress: number;
  is_completed: boolean;
  created_at: string;
  type: string;
  obtained_date: string;
}

export function useAchievements(userId: string) {
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  async function loadAchievements() {
    try {
      setIsLoading(true);
      setError(null);

      // get total count first
      const { count, error: countError } = await supabase
        .from('achievements')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', userId);

      if (countError) throw countError;
      setTotalCount(count || 0);

      const { data, error: achievementsError } = await supabase
        .from('achievements')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(2);

      if (achievementsError) throw achievementsError;

      setAchievements(data || []);
    } catch (err) {
      console.error('Error loading achievements:', err);
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    let subscription: ReturnType<typeof supabase.channel>;

    // initial load
    loadAchievements();

    // set up real-time subscription
    subscription = supabase
      .channel('achievements-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'achievements',
          filter: `user_id=eq.${userId}`,
        },
        () => {
          loadAchievements();
        }
      )
      .subscribe();

    return () => {
      subscription?.unsubscribe();
    };
  }, [userId]);

  return { achievements, totalCount, isLoading, error, refresh: loadAchievements };
} 