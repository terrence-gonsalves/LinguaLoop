import { supabase } from '@/lib/supabase';
import { useEffect, useState } from 'react';

export interface Activity {
  id: string;
  name: string;
  created_at: string;
}

// activities is reference data (Reading, Writing, Listening, Speaking) that only
// the service role can change, and it isn't in the supabase_realtime publication,
// so it's loaded once with no Realtime subscription.
export function useActivities() {
  const [activities, setActivities] = useState<Activity[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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

    loadActivities();

    return () => {
      isMounted = false;
    };
  }, []);

  return { activities, isLoading, error };
}
