import { useEffect, useRef, useState } from 'react';

import { supabase } from '@/lib/supabase';

interface Language {
  id: string;
  name: string | null;
  proficiency_level: string | null;
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
  const subscriptionRef = useRef<ReturnType<typeof supabase.channel> | null>(null);

  useEffect(() => {
    let isMounted = true;

    async function loadLanguageSummary() {
      try {
        if (!isMounted) return;
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
            proficiency_level,
            master_language_id,
            master_languages (
              name
            )
          `)
          .eq('user_id', userId);
        if (languagesError) throw languagesError;

        if (!isMounted) return;

        // for each language, get the time entries and sum durations by activity
        const languagesWithTime = await Promise.all(
          languagesData.map(async (rawLanguage: any) => {
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
              level: language.proficiency_level || 'Not Set',
              activities: activityDurations,
            };
          })
        );

        if (!isMounted) return;
        setLanguages(languagesWithTime);
      } catch (err) {
        if (!isMounted) return;
        console.error('Error loading language summary:', err);
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

    loadLanguageSummary();

    // real-time subscription (optional, can be kept as is)
    const channelName = `language-summary-changes-${userId}-${Date.now()}`;
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
            loadLanguageSummary();
          }
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
          if (isMounted) {
            loadLanguageSummary();
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