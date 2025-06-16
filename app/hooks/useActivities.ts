import { supabase } from '@/lib/supabase';
import { useEffect, useState } from 'react';

export interface Activity {
  id: string;
  name: string;
  created_at: string;
}

export function useActivities() {
  const [activities, setActivities] = useState<Activity[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let subscription: ReturnType<typeof supabase.channel>;

    async function loadActivities() {
      try {
        setIsLoading(true);
        setError(null);

        const { data, error: activitiesError } = await supabase
          .from('activities')
          .select('*')
          .order('created_at', { ascending: true });

        if (activitiesError) throw activitiesError;

        setActivities(data || []);
      } catch (err) {
        console.error('Error loading activities:', err);
        setError(err instanceof Error ? err.message : 'An error occurred');
      } finally {
        setIsLoading(false);
      }
    }

    loadActivities();

    // Set up real-time subscription
    subscription = supabase
      .channel('activities-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'activities',
        },
        () => {
          loadActivities();
        }
      )
      .subscribe();

    return () => {
      subscription?.unsubscribe();
    };
  }, []);

  return { activities, isLoading, error };
} 