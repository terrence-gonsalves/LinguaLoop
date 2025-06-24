import { getAvatarUrl } from '@/lib/supabase/storage';
import { Session } from '@supabase/supabase-js';
import { router } from 'expo-router';
import * as SecureStore from 'expo-secure-store';
import { createContext, useContext, useEffect, useState } from 'react';
import Toast from 'react-native-toast-message';
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

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadSession();
    
    // listen for auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log('Auth state changed:', event, session?.user?.id);
      if (session) {
        await SecureStore.setItemAsync(SESSION_KEY, JSON.stringify(session));
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
      const storedSession = await SecureStore.getItemAsync(SESSION_KEY);
      if (storedSession) {
        const session = JSON.parse(storedSession);
        setSession(session);
        await loadProfile(session.user.id, false); // don't skip navigation on initial load
      }
    } catch (error) {
      console.error('Error loading session:', error);
    } finally {
      setIsLoading(false);
    }
  }

  async function loadProfile(userId: string, skipNavigation: boolean = false) {
    console.log('Loading profile for user:', userId);
    try {
      const { data: profile, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (error) {
        console.error('Error in loadProfile query:', error);
        throw error;
      }
      
      // get the signed URL for the avatar if it exists
      if (profile) {
        const avatarUrl = await getAvatarUrl(userId);
        if (avatarUrl) {
          profile.avatar_url = avatarUrl;
        }
      }

      console.log('Profile loaded with avatar:', profile);
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
      console.error('Error loading profile:', error);
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
      Toast.show({
        type: 'error',
        text1: 'Error signing in',
        text2: (error as Error).message,
      });
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

      Toast.show({
        type: 'success',
        text1: 'Account created successfully',
        text2: 'Please check your email to verify your account',
      });

      // navigate to onboarding immediately without waiting for auth state change
      router.replace('/(stack)/onboarding');
    } catch (error) {
      console.error('Error signing up:', error);
      Toast.show({
        type: 'error',
        text1: 'Error creating account',
        text2: (error as Error).message,
      });
    } finally {
      setIsLoading(false);
    }
  }

  async function signOut() {
    try {
      setIsLoading(true);
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      router.replace('/(auth)/login');
    } catch (error) {
      console.error('Error signing out:', error);
      Toast.show({
        type: 'error',
        text1: 'Error signing out',
        text2: (error as Error).message,
      });
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