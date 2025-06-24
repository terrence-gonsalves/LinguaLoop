import { supabase } from '@/lib/supabase';
import { useEffect, useRef, useState } from 'react';

export interface Activity {
  id: string;
  name: string;
  created_at: string;
}

export function useActivities() {
  const [activities, setActivities] = useState<Activity[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const subscriptionRef = useRef<ReturnType<typeof supabase.channel> | null>(null);

  useEffect(() => {
    let isMounted = true;

    async function loadActivities() {
      try {
        if (!isMounted) return;
        setIsLoading(true);
        setError(null);

        const { data, error: activitiesError } = await supabase
          .from('activities')
          .select('*')
          .order('created_at', { ascending: true });

        if (activitiesError) throw activitiesError;

        if (!isMounted) return;
        setActivities(data || []);
      } catch (err) {
        if (!isMounted) return;
        console.error('Error loading activities:', err);
        setError(err instanceof Error ? err.message : 'An error occurred');
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

    loadActivities();

    // set up real-time subscription
    const channelName = `activities-changes-global-${Date.now()}`;
    subscriptionRef.current = supabase
      .channel(channelName)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'activities',
        },
        () => {
          if (isMounted) {
            loadActivities();
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
  }, []);

  return { activities, isLoading, error };
} 