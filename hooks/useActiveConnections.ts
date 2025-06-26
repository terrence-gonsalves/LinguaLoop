import { useEffect, useRef, useState } from 'react';

import { supabase } from '@/lib/supabase';



export interface Connection {
  id: string;
  name: string | null;
  user_name: string | null;
  about_me: string | null;
  avatar_url: string | null;
  native_language: string | null;
  streak: number;
}

interface FollowData {
  following_id: string;
  following: {
    id: string;
    name: string;
    user_name: string;
    about_me: string;
    avatar_url: string;
    native_language: string;
  };
}

export function useActiveConnections(userId: string) {
  const [connections, setConnections] = useState<Connection[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const subscriptionRef = useRef<ReturnType<typeof supabase.channel> | null>(null);

  async function calculateUserStreak(userId: string): Promise<number> {
    try {

      // get all time entries for the user, ordered by date
      const { data: timeEntries, error } = await supabase
        .from('time_entries')
        .select('activity_date')
        .eq('user_id', userId)
        .not('activity_date', 'is', null)
        .order('activity_date', { ascending: false });

      if (error) throw error;

      if (!timeEntries || timeEntries.length === 0) {
        return 0;
      }

      // get unique dates (in case multiple entries on same day)
      const uniqueDates = [...new Set(
        timeEntries.map(entry => 
          new Date(entry.activity_date).toDateString()
        )
      )].sort((a, b) => new Date(b).getTime() - new Date(a).getTime());

      // calculate consecutive days
      let currentStreak = 0;
      const today = new Date().toDateString();
      const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000).toDateString();

      // check if user has activity today or yesterday to start counting
      if (uniqueDates.includes(today) || uniqueDates.includes(yesterday)) {
        let currentDate = uniqueDates[0];
        let expectedDate = new Date(currentDate);

        for (let i = 0; i < uniqueDates.length; i++) {
          const entryDate = new Date(uniqueDates[i]);
          const expectedDateStr = expectedDate.toDateString();

          if (entryDate.toDateString() === expectedDateStr) {
            currentStreak++;
            expectedDate.setDate(expectedDate.getDate() - 1);
          } else {

            // if there's a gap, break the streak
            break;
          }
        }
      }

      return currentStreak;
    } catch (error) {
      console.error('Error calculating streak for user:', userId, error);
      return 0;
    }
  }

  async function loadConnections() {
    try {
      setIsLoading(true);
      setError(null);

      // get total count first
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

      // calculate streaks for all connections
      const connectionsWithStreaks = await Promise.all(
        ((followData || []) as unknown as FollowData[]).map(async (follow) => {
          const streak = await calculateUserStreak(follow.following.id);
          return {
            id: follow.following.id,
            name: follow.following.name,
            user_name: follow.following.user_name,
            about_me: follow.following.about_me,
            avatar_url: follow.following.avatar_url,
            native_language: languageMap.get(follow.following.native_language) || 'Unknown',
            streak,
          };
        })
      );

      setConnections(connectionsWithStreaks);
    } catch (err) {
      console.error('Error loading connections:', err);
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    let isMounted = true;

    // clean up any existing subscription
    if (subscriptionRef.current) {
      subscriptionRef.current.unsubscribe();
      subscriptionRef.current = null;
    }

    loadConnections();

    // set up real-time subscription
    const channelName = `active-connections-changes-${userId}-${Date.now()}`;
    subscriptionRef.current = supabase
      .channel(channelName)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'follows',
          filter: `follower_id=eq.${userId}`,
        },
        () => {
          if (isMounted) {
            
            // reload data when changes occur
            loadConnections();
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

  return { connections, totalCount, isLoading, error, refresh: loadConnections };
} 