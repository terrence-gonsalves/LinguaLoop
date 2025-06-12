import { supabase } from '@/lib/supabase';
import { useEffect, useState } from 'react';

interface Language {
  id: string;
  name: string | null;
  level: string | null;
  master_language_id: string;
  master_languages: {
    name: string;
  };
}

interface TimeEntry {
  duration_seconds: number;
  activities: {
    name: string;
  };
}

export interface LanguageSummary {
  id: string;
  name: string;
  level: string;
  activities: {
    reading: number;
    writing: number;
    speaking: number;
    listening: number;
  };
}

export function useLanguageSummary(userId: string) {
  const [languages, setLanguages] = useState<LanguageSummary[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let subscription: ReturnType<typeof supabase.channel>;

    async function loadLanguageSummary() {
      try {
        setIsLoading(true);
        setError(null);

        // first, get the user's languages
        const { data: languagesData, error: languagesError } = await supabase
          .from('languages')
          .select(`
            id,
            name,
            level,
            master_language_id,
            master_languages (
              name
            )
          `)
          .eq('user_id', userId)
          .limit(2);

        if (languagesError) throw languagesError;

        // for each language, get the time entries
        const languagesWithTime = await Promise.all(
          (languagesData || []).map(async (rawLanguage) => {

            // type assertion for language data
            const language = {
              ...rawLanguage,
              master_languages: {
                name: rawLanguage.master_languages[0]?.name || '',
              },
            } as Language;

            const { data: timeData, error: timeError } = await supabase
              .from('time_entries')
              .select(`
                duration_seconds,
                activities!inner (
                  name
                )
              `)
              .eq('user_id', userId)
              .eq('language_id', language.id);

            if (timeError) throw timeError;

            // calculate total time for each activity type
            const activities = {
              reading: 0,
              writing: 0,
              speaking: 0,
              listening: 0,
            };

            (timeData || []).forEach((rawEntry) => {

              // type assertion for time entry data
              const entry = {
                ...rawEntry,
                activities: {
                  name: rawEntry.activities[0]?.name || '',
                },
              } as TimeEntry;

              const activityName = entry.activities.name.toLowerCase();
              if (activityName in activities) {
                activities[activityName as keyof typeof activities] += entry.duration_seconds;
              }
            });

            // use master language name if available, fallback to direct name
            const languageName = language.master_languages.name || language.name || 'Unknown Language';

            return {
              id: language.id,
              name: languageName,
              level: language.level || 'Beginner',
              activities,
            };
          })
        );

        setLanguages(languagesWithTime);
      } catch (err) {
        console.error('Error loading language summary:', err);
        setError(err instanceof Error ? err.message : 'An error occurred');
      } finally {
        setIsLoading(false);
      }
    }

    // initial load
    loadLanguageSummary();

    // set up real-time subscription
    subscription = supabase
      .channel('language-summary-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'time_entries',
          filter: `user_id=eq.${userId}`,
        },
        () => {

          // reload data when changes occur
          loadLanguageSummary();
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

          // reload data when changes occur
          loadLanguageSummary();
        }
      )
      .subscribe();

    return () => {
      subscription?.unsubscribe();
    };
  }, [userId]);

  return { languages, isLoading, error };
} 