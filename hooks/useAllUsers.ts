import { useAuth } from '@/lib/auth-context';
import { supabase } from '@/lib/supabase';
import { useEffect, useState } from 'react';

export interface User {
  id: string;
  name: string;
  user_name: string;
  avatar_url: string | null;
  native_language: string;
  target_languages: string[];
  is_following: boolean;
}

export function useAllUsers() {
  const { profile } = useAuth();
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  async function fetchUsers() {
    try {
      setIsLoading(true);
      setError(null);

      // fetch all users except current user who have completed onboarding
      const { data: userData, error: userError } = await supabase
        .from('profiles')
        .select('id, name, user_name, avatar_url, native_language, onboarding_completed')
        .neq('id', profile?.id)
        .eq('onboarding_completed', true);

      if (userError) throw userError;

      // fetch all master languages
      const { data: masterLangs, error: langError } = await supabase
        .from('master_languages')
        .select('id, name');

      if (langError) throw langError;

      // fetch all target languages for all users
      const { data: allLanguages, error: targetLangError } = await supabase
        .from('languages')
        .select('user_id, name');

      if (targetLangError) throw targetLangError;

      // fetch following list
      const { data: followingData, error: followError } = await supabase
        .from('follows')
        .select('following_id')
        .eq('follower_id', profile?.id);

      if (followError) throw followError;

      const followingIds = (followingData || []).map((f: any) => f.following_id);
      
      const usersList: User[] = (userData || []).map((u: any) => {
        const nativeLangName = masterLangs?.find((ml: any) => ml.id === u.native_language)?.name || 'Unknown';
        const targetLangs = (allLanguages || [])
          .filter((l: any) => l.user_id === u.id)
          .map((l: any) => l.name);
        return {
          id: u.id,
          name: u.name || 'User',
          user_name: u.user_name || 'user',
          avatar_url: u.avatar_url,
          native_language: nativeLangName,
          target_languages: targetLangs,
          is_following: followingIds.includes(u.id),
        };
      });

      setUsers(usersList);
    } catch (err) {
      console.error('Error fetching users:', err);
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setIsLoading(false);
    }
  }

  async function toggleFollow(userId: string) {
    const user = users.find((u) => u.id === userId);
    if (!user) return;

    try {
      if (user.is_following) {

        // unfollow
        const { error } = await supabase
          .from('follows')
          .delete()
          .match({ follower_id: profile?.id, following_id: userId });
        
        if (error) throw error;
      } else {

        // follow
        const { error } = await supabase
          .from('follows')
          .insert({ follower_id: profile?.id, following_id: userId });
        
        if (error) throw error;
      }

      // optimistic update
      setUsers((prev) =>
        prev.map((u) =>
          u.id === userId ? { ...u, is_following: !u.is_following } : u
        )
      );
    } catch (err) {
      console.error('Error toggling follow:', err);
      
      // revert optimistic update on error
      setUsers((prev) =>
        prev.map((u) =>
          u.id === userId ? { ...u, is_following: user.is_following } : u
        )
      );
    }
  }

  useEffect(() => {
    if (profile?.id) {
      fetchUsers();
    }
  }, [profile?.id]);

  return { 
    users, 
    isLoading, 
    error, 
    refresh: fetchUsers,
    toggleFollow 
  };
} 