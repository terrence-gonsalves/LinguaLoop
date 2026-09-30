import { router } from 'expo-router';

import { createContext, useContext, useEffect, useRef, useState } from 'react';

import { clearGoalNotifications } from '@/lib/goal-notifications';
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

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // the user whose profile is loaded, so a repeated SIGNED_IN event doesn't reload and re-navigate
  const loadedUserIdRef = useRef<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    // restore the session that supabase-js persisted in AsyncStorage
    async function restoreSession() {
      try {
        const { data: { session }, error } = await supabase.auth.getSession();

        if (error) throw error;
        if (!isMounted) return;

        setSession(session);

        // supabase-js may already have emitted SIGNED_IN for a restored session,
        // in which case the listener below is loading the profile
        if (session && loadedUserIdRef.current !== session.user.id) {
          loadedUserIdRef.current = session.user.id;
          await loadProfile(session.user.id, false); // don't skip navigation on initial load
        }
      } catch (error) {
        console.error('Error restoring session:', error);
      } finally {
        if (isMounted) setIsLoading(false);
      }
    }

    restoreSession();

    // listen for auth state changes. the callback must not await supabase calls:
    // supabase-js holds a lock while it runs and they can deadlock, so the
    // profile load is deferred with setTimeout.
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (!isMounted) return;

      setSession(session);

      if (!session) {
        loadedUserIdRef.current = null;
        setProfile(null);
        return;
      }

      if (event === 'SIGNED_IN' && loadedUserIdRef.current !== session.user.id) {
        loadedUserIdRef.current = session.user.id;
        setTimeout(() => {
          loadProfile(session.user.id, false); // don't skip navigation on sign in
        }, 0);
      }
    });

    return () => {
      isMounted = false;
      subscription.unsubscribe();
    };
  }, []);

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

      // the profiles row is created by the on_auth_user_created trigger in the database
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email,
        password,
      });

      if (authError) throw authError;
      if (!authData.user) throw new Error('No user data returned');

      if (authData.session) {

        // signed in straight away: the SIGNED_IN listener loads the profile and opens onboarding
        showSuccessToast("Account created! Let's set up your profile.");
      } else {

        // only happens if "Confirm email" is turned on in Supabase: no session until the user confirms
        showSuccessToast('Account created! Confirm your email, then sign in.');
      }
    } catch (error) {
      showErrorToast(`Error creating account: ${(error as Error).message}`);
    } finally {
      setIsLoading(false);
    }
  }

  async function signOut() {
    try {
      setIsLoading(true);

      // goal reminders are per user, so don't leave them for the next account on this device
      await clearGoalNotifications();

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