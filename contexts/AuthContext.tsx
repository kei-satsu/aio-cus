import * as Linking from 'expo-linking';
import * as WebBrowser from 'expo-web-browser';
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type PropsWithChildren,
} from 'react';
import { Platform } from 'react-native';
import type { User } from '@supabase/supabase-js';

import { getAuthErrorMessage, getSupabaseClient } from '@/lib/supabase';

WebBrowser.maybeCompleteAuthSession();

type AuthContextValue = {
  isAuthenticated: boolean;
  isLoading: boolean;
  sessionError: string | null;
  displayName: string | null;
  user: User | null;
  signInWithGoogle: () => Promise<void>;
  signOut: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

function getDisplayName(metadata: Record<string, unknown> | undefined) {
  for (const key of ['full_name', 'name', 'display_name', 'given_name']) {
    const value = metadata?.[key];
    if (typeof value === 'string' && value.trim()) {
      return value.trim();
    }
  }

  return null;
}

function getOAuthCallbackError(url: URL) {
  const searchParams = new URLSearchParams(url.search);
  const hashParams = new URLSearchParams(url.hash.slice(1));

  return (
    searchParams.get('error_description') ??
    searchParams.get('error_code') ??
    searchParams.get('error') ??
    hashParams.get('error_description') ??
    hashParams.get('error_code') ??
    hashParams.get('error')
  );
}

export function AuthProvider({ children }: PropsWithChildren) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [sessionError, setSessionError] = useState<string | null>(null);
  const [displayName, setDisplayName] = useState<string | null>(null);
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    let isMounted = true;
    let unsubscribe: (() => void) | undefined;
    const callbackError =
      Platform.OS === 'web' && typeof window !== 'undefined'
        ? getOAuthCallbackError(new URL(window.location.href))
        : null;
    const callbackErrorMessage = callbackError
      ? getAuthErrorMessage(new Error(callbackError))
      : null;

    try {
      const supabase = getSupabaseClient();
      const {
        data: { subscription },
      } = supabase.auth.onAuthStateChange((_event, session) => {
        if (isMounted) {
          setIsAuthenticated(Boolean(session));
          setUser(session?.user ?? null);
          setDisplayName(getDisplayName(session?.user.user_metadata));
          setSessionError(session ? null : callbackErrorMessage);
        }
      });
      unsubscribe = () => subscription.unsubscribe();

      supabase.auth
        .getSession()
        .then(({ data, error }) => {
          if (error) {
            throw error;
          }
          if (isMounted) {
            setIsAuthenticated(Boolean(data.session));
            setUser(data.session?.user ?? null);
            setDisplayName(getDisplayName(data.session?.user.user_metadata));
            setSessionError(data.session ? null : callbackErrorMessage);
          }
        })
        .catch((error: unknown) => {
          console.error('Unable to restore the Supabase auth session.', error);
          if (isMounted) {
            setSessionError(
              callbackErrorMessage ?? 'အကောင့်အခြေအနေကို ဖတ်မရပါ။ ပြန်လည်ဝင်ရောက်ကြည့်ပါ။'
            );
          }
        })
        .finally(() => {
          if (isMounted) {
            setIsLoading(false);
          }
        });
    } catch (error) {
      console.error('Unable to initialize Supabase Auth.', error);
      setSessionError('Supabase ချိတ်ဆက်မှုကို ပြင်ဆင်ထားခြင်း မရှိသေးပါ။');
      setIsLoading(false);
    }

    return () => {
      isMounted = false;
      unsubscribe?.();
    };
  }, []);

  const signInWithGoogle = useCallback(async () => {
    setSessionError(null);
    try {
      const supabase = getSupabaseClient();
      const redirectTo =
        Platform.OS === 'web' && typeof window !== 'undefined'
          ? `${window.location.origin}${window.location.pathname}`
          : Linking.createURL('login');
      if (__DEV__) {
        console.info('Google OAuth redirect URL:', redirectTo);
      }
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo,
          skipBrowserRedirect: Platform.OS !== 'web',
        },
      });

      if (error) {
        throw error;
      }

      if (Platform.OS === 'web') {
        return;
      }

      if (!data.url) {
        throw new Error('Supabase did not return a Google sign-in URL.');
      }

      const result = await WebBrowser.openAuthSessionAsync(data.url, redirectTo);
      if (result.type !== 'success') {
        return;
      }

      const callbackUrl = new URL(result.url);
      const callbackParams = new URLSearchParams(callbackUrl.search);
      const callbackError = getOAuthCallbackError(callbackUrl);
      if (callbackError) {
        throw new Error(callbackError);
      }

      const code = callbackParams.get('code');
      if (!code) {
        throw new Error('Google sign-in callback did not include an authorization code.');
      }

      const { error: exchangeError } = await supabase.auth.exchangeCodeForSession(code);
      if (exchangeError) {
        throw exchangeError;
      }
    } catch (error) {
      console.error('Google sign-in failed.', error);
      throw new Error(getAuthErrorMessage(error));
    }
  }, []);

  const signOut = useCallback(async () => {
    const { error } = await getSupabaseClient().auth.signOut();
    if (error) {
      throw error;
    }
    setSessionError(null);
  }, []);

  return (
    <AuthContext.Provider
      value={{
        isAuthenticated,
        isLoading,
        sessionError,
        displayName,
        user,
        signInWithGoogle,
        signOut,
      }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider.');
  }

  return context;
}
