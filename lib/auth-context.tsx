import { router } from 'expo-router';
import * as SecureStore from 'expo-secure-store';

import { createContext, useContext, useEffect, useState } from 'react';

import { getAvatarUrl } from '@/lib/supabase/storage';
import { showErrorToast, showSuccessToast } from '@/lib/toast';

import { Session } from '@supabase/supabase-js';

import { supabase, type Profile } from './supabase';

type AuthContextType = {
  session: Session | null;
  profile: Profile | null;
  isLoading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  reloadProfile: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const SESSION_KEY = 'supabase-session';
const ACCESS_TOKEN_KEY = 'supabase-access-token';
const REFRESH_TOKEN_KEY = 'supabase-refresh-token';

// helper function to extract essential session data
function extractSessionData(session: Session) {
  return {
    access_token: session.access_token,
    refresh_token: session.refresh_token,
    expires_at: session.expires_at,
    user_id: session.user.id,
  };
}

// helper function to reconstruct session from stored data
async function reconstructSession(storedData: any): Promise<Session | null> {
  try {

    // get the current session from Supabase to get the full session object
    const { data: { session } } = await supabase.auth.getSession();
    return session;
  } catch (error) {
    console.error('Error reconstructing session:', error);
    return null;
  }
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadSession();
    
    // listen for auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (session) {
        
        // store only essential session data instead of entire session object
        const sessionData = extractSessionData(session);
        await SecureStore.setItemAsync(SESSION_KEY, JSON.stringify(sessionData));
        setSession(session);

        if (event === 'SIGNED_IN' && !profile) {

          // add a small delay to ensure the profile has been created
          await new Promise(resolve => setTimeout(resolve, 1000));
          await loadProfile(session.user.id, false); // don't skip navigation on initial sign in
        }
      } else {
        await SecureStore.deleteItemAsync(SESSION_KEY);
        setSession(null);
        setProfile(null);
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  async function loadSession() {
    try {
      const storedSessionData = await SecureStore.getItemAsync(SESSION_KEY);

      if (storedSessionData) {
        const sessionData = JSON.parse(storedSessionData);
        
        // check if the stored session is still valid
        if (sessionData.expires_at && new Date(sessionData.expires_at * 1000) > new Date()) {

          // try to reconstruct the session from Supabase
          const session = await reconstructSession(sessionData);
          if (session) {
            setSession(session);
            await loadProfile(session.user.id, false); // don't skip navigation on initial load
          } else {

            // if we can't reconstruct the session, clear stored data
            await SecureStore.deleteItemAsync(SESSION_KEY);
          }
        } else {

          // session has expired, clear stored data
          await SecureStore.deleteItemAsync(SESSION_KEY);
        }
      }
    } catch (error) {
      console.error('Error loading session:', error);

      // clear corrupted session data
      await SecureStore.deleteItemAsync(SESSION_KEY);
    } finally {
      setIsLoading(false);
    }
  }

  async function loadProfile(userId: string, skipNavigation: boolean = false) {
    try {
      const { data: profile, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (error) {
        throw error;
      }
      
      // get the signed URL for the avatar if it exists
      if (profile) {
        const avatarUrl = await getAvatarUrl(userId);
        if (avatarUrl) {
          profile.avatar_url = avatarUrl;
        }
      }
      
      setProfile(profile);

      // only handle navigation if skipNavigation is false
      if (!skipNavigation) {
        
        // check if onboarding is needed
        if (profile && !profile.onboarding_completed) {
          router.push('/(stack)/onboarding');
        } else if (profile && profile.onboarding_completed) {
          router.replace('/(tabs)');
        }
      }
    } catch (error) {
      // we can safley ignore this error as the user has not logged in yet
    }
  }

  // add reloadProfile function with skipNavigation
  async function reloadProfile() {
    if (!session?.user?.id) return;

    await loadProfile(session.user.id, true); // pass true to skip navigation
  }

  async function signIn(email: string, password: string) {
    try {
      setIsLoading(true);
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;

      // session will be handled by the auth state change listener
    } catch (error) {
      console.error('Error signing in:', error);
      showErrorToast(`Error signing in: ${(error as Error).message}`);
    } finally {
      setIsLoading(false);
    }
  }

  async function signUp(email: string, password: string) {
    try {
      setIsLoading(true);
      console.log('Starting signup process for:', email);
      
      // 1. sign up the user
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email,
        password,
      });

      if (authError) throw authError;
      if (!authData.user) throw new Error('No user data returned');

      console.log('User created:', authData.user.id);

      // 2. create a profile for the user
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .insert({
          id: authData.user.id,
          email: email,
          onboarding_completed: false,
        })
        .select()
        .single();

      if (profileError) {
        console.error('Error creating profile:', profileError);
        throw profileError;
      }

      console.log('Profile created:', profileData);

      // 3. set the profile immediately to avoid the flash
      setProfile(profileData);

      showSuccessToast('Account created successfully! Please check your email to verify your account.');

      // navigate to onboarding immediately without waiting for auth state change
      router.replace('/(stack)/onboarding');
    } catch (error) {
      showErrorToast(`Error creating account: ${(error as Error).message}`);
    } finally {
      setIsLoading(false);
    }
  }

  async function signOut() {
    try {
      setIsLoading(true);
      const { error } = await supabase.auth.signOut();

      if (error) throw error;
    } catch (error) {
      console.error('Error signing out:', error);
      showErrorToast(`Error signing out: ${(error as Error).message}`);
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <AuthContext.Provider
      value={{
        session,
        profile,
        isLoading,
        signIn,
        signUp,
        signOut,
        reloadProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

export default AuthContext; 