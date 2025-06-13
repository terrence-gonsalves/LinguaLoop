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
  const [languages, setLanguages] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let subscription: ReturnType<typeof supabase.channel>;

    async function loadLanguageSummary() {
      try {
        setIsLoading(true);
        setError(null);

        // fetch all activities
        const { data: activitiesData, error: activitiesError } = await supabase
          .from('activities')
          .select('id, name');
        if (activitiesError) throw activitiesError;
        const activitiesList = (activitiesData || []).map((a: any) => ({
          id: a.id,
          name: a.name,
        }));

        // get the user's languages
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
          .eq('user_id', userId);
        if (languagesError) throw languagesError;

        // for each language, get the time entries and sum durations by activity
        const languagesWithTime = await Promise.all(
          (languagesData || []).map(async (rawLanguage: any) => {
            const language = {
              ...rawLanguage,
              master_languages: {
                name: rawLanguage.master_languages?.[0]?.name || rawLanguage.master_languages?.name || '',
              },
            };

            // fetch time entries for this language
            const { data: timeData, error: timeError } = await supabase
              .from('time_entries')
              .select('duration_seconds, activity_id')
              .eq('user_id', userId)
              .eq('language_id', language.id);
            if (timeError) throw timeError;

            // sum durations for each activity type
            const activityDurations: Record<string, number> = {};
            activitiesList.forEach((activity) => {
              activityDurations[activity.name] = 0;
            });
            (timeData || []).forEach((entry: any) => {
              const activity = activitiesList.find((a) => a.id === entry.activity_id);
              if (activity) {
                activityDurations[activity.name] += entry.duration_seconds;
              }
            });

            // use master language name if available, fallback to direct name
            const languageName = language.master_languages.name || language.name || 'Unknown Language';

            return {
              id: language.id,
              name: languageName,
              level: language.level || 'Beginner',
              activities: activityDurations,
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

    loadLanguageSummary();

    // real-time subscription (optional, can be kept as is)
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