import { Session } from '@supabase/supabase-js';
import * as SecureStore from 'expo-secure-store';
import { createContext, useContext, useEffect, useState } from 'react';
import Toast from 'react-native-toast-message';
import { supabase, type Profile } from './supabase';

type AuthContextType = {
  session: Session | null;
  profile: Profile | null;
  isLoading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
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
      if (session) {
        await SecureStore.setItemAsync(SESSION_KEY, JSON.stringify(session));
        setSession(session);
        await loadProfile(session.user.id);
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
        await loadProfile(session.user.id);
      }
    } catch (error) {
      console.error('Error loading session:', error);
    } finally {
      setIsLoading(false);
    }
  }

  async function loadProfile(userId: string) {
    try {
      const { data: profile, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (error) throw error;
      setProfile(profile);
    } catch (error) {
      console.error('Error loading profile:', error);
      Toast.show({
        type: 'error',
        text1: 'Error loading profile',
      });
    }
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

  async function signOut() {
    try {
      setIsLoading(true);
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
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
        signOut,
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