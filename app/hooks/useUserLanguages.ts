import { supabase } from '@/lib/supabase';
import { useEffect, useState } from 'react';

export interface UserLanguage {
  id: string;
  name: string;
}

export function useUserLanguages(userId: string) {
  const [languages, setLanguages] = useState<UserLanguage[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let subscription: ReturnType<typeof supabase.channel>;

    async function loadUserLanguages() {
      try {
        setIsLoading(true);
        setError(null);

        const { data: languagesData, error: languagesError } = await supabase
          .from('languages')
          .select(`
            id,
            master_languages (
              name
            )
          `)
          .eq('user_id', userId);

        if (languagesError) throw languagesError;

        const formattedLanguages = (languagesData || []).map(lang => ({
          id: lang.id,
          name: lang.master_languages.name || 'Unknown Language'
        }));

        setLanguages(formattedLanguages);
      } catch (err) {
        console.error('Error loading user languages:', err);
        setError(err instanceof Error ? err.message : 'An error occurred');
      } finally {
        setIsLoading(false);
      }
    }

    // initial load
    loadUserLanguages();

    // set up real-time subscription
    subscription = supabase
      .channel('user-languages-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'languages',
          filter: `user_id=eq.${userId}`,
        },
        () => {
            
          // reload data when changes occur
          loadUserLanguages();
        }
      )
      .subscribe();

    return () => {
      subscription?.unsubscribe();
    };
  }, [userId]);

  return { languages, isLoading, error };
} 