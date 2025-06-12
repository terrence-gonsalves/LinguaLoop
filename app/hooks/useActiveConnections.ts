import { supabase } from '@/lib/supabase';
import { useEffect, useState } from 'react';

export interface Connection {
  id: string;
  name: string | null;
  user_name: string | null;
  about_me: string | null;
  avatar_url: string | null;
  native_language: string | null;
}

interface FollowData {
  following_id: string;
  following: {
    id: string;
    name: string | null;
    user_name: string | null;
    about_me: string | null;
    avatar_url: string | null;
    native_language: string;
  };
}

export function useActiveConnections(userId: string) {
  const [connections, setConnections] = useState<Connection[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let subscription: ReturnType<typeof supabase.channel>;

    async function loadConnections() {
      try {
        setIsLoading(true);
        setError(null);

        // Get total count first
        const { count, error: countError } = await supabase
          .from('follows')
          .select('*', { count: 'exact', head: true })
          .eq('follower_id', userId);

        if (countError) throw countError;
        setTotalCount(count || 0);

        const { data: followData, error: followError } = await supabase
          .from('follows')
          .select(`
            following_id,
            following:profiles!following_id (
              id,
              name,
              user_name,
              about_me,
              avatar_url,
              native_language
            )
          `)
          .eq('follower_id', userId)
          .limit(2) as unknown as { 
            data: FollowData[] | null;
            error: any;
          };

        if (followError) throw followError;

        const profiles = followData?.map(f => f.following) || [];
        const languageIds = profiles.map(p => p.native_language).filter(Boolean);
        
        const { data: languageData } = await supabase
          .from('master_languages')
          .select('id, name')
          .in('id', languageIds);

        const languageMap = new Map(languageData?.map(l => [l.id, l.name]) || []);

        const connectionsData = ((followData || []) as unknown as FollowData[]).map((follow) => ({
          id: follow.following.id,
          name: follow.following.name,
          user_name: follow.following.user_name,
          about_me: follow.following.about_me,
          avatar_url: follow.following.avatar_url,
          native_language: languageMap.get(follow.following.native_language) || 'Unknown',
        }));

        setConnections(connectionsData);
      } catch (err) {
        console.error('Error loading connections:', err);
        setError(err instanceof Error ? err.message : 'An error occurred');
      } finally {
        setIsLoading(false);
      }
    }

    // initial load
    loadConnections();

    // set up real-time subscription
    subscription = supabase
      .channel('active-connections-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'follows',
          filter: `follower_id=eq.${userId}`,
        },
        () => {

          // reload data when changes occur
          loadConnections();
        }
      )
      .subscribe();

    return () => {
      subscription?.unsubscribe();
    };
  }, [userId]);

  return { connections, totalCount, isLoading, error };
} 