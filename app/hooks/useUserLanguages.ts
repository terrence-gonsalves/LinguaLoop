import { supabase } from '@/lib/supabase';
import { useEffect, useRef, useState } from 'react';

export interface UserLanguage {
  id: string;
  name: string;
  flag?: string | null;
}

export function useUserLanguages(userId: string) {
  const [languages, setLanguages] = useState<UserLanguage[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const subscriptionRef = useRef<ReturnType<typeof supabase.channel> | null>(null);

  useEffect(() => {
    let isMounted = true;

    async function loadUserLanguages() {
      try {
        if (!isMounted) return;
        setIsLoading(true);
        setError(null);

        const { data: languagesData, error: languagesError } = await supabase
          .from('languages')
          .select(`
            id,
            master_languages (
              name,
              flag
            )
          `)
          .eq('user_id', userId);

        if (languagesError) throw languagesError;

        if (!isMounted) return;

        const formattedLanguages = (languagesData || []).map((lang: any) => ({
          id: lang.id,
          name: lang.master_languages.name || 'Unknown Language',
          flag: lang.master_languages.flag || null,
        }));

        setLanguages(formattedLanguages);
      } catch (err) {
        if (!isMounted) return;
        console.error('Error loading user languages:', err);
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

    // initial load
    loadUserLanguages();

    // set up real-time subscription
    const channelName = `user-languages-changes-${userId}-${Date.now()}`;
    subscriptionRef.current = supabase
      .channel(channelName)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'languages',
          filter: `user_id=eq.${userId}`,
        },
        () => {
          if (isMounted) {
            
            // reload data when changes occur
            loadUserLanguages();
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
  }, [userId]);

  return { languages, isLoading, error };
} 