import AsyncStorage from '@react-native-async-storage/async-storage';
import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import { Platform } from 'react-native';

let supabase: SupabaseClient | null = null;

export function getSupabaseClient() {
  if (supabase) {
    return supabase;
  }

  const url = process.env.EXPO_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !anonKey) {
    throw new Error('Supabase URL သို့မဟုတ် anon key မသတ်မှတ်ရသေးပါ။');
  }

  supabase = createClient(url, anonKey, {
    auth: {
      storage: AsyncStorage,
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: Platform.OS === 'web',
    },
  });

  return supabase;
}

export function getAuthErrorMessage(error: unknown) {
  const message =
    error instanceof Error
      ? error.message
      : typeof error === 'object' && error !== null && 'message' in error
        ? String(error.message)
        : String(error);
  const normalizedMessage = message.toLowerCase();

  if (normalizedMessage.includes('supabase url') || normalizedMessage.includes('anon key')) {
    return 'Supabase ချိတ်ဆက်မှုကို ပြင်ဆင်ထားခြင်း မရှိသေးပါ။';
  }

  if (
    normalizedMessage.includes('signup_disabled') ||
    normalizedMessage.includes('signups not allowed') ||
    /sign.?up.{0,30}(disabled|not allowed)/.test(normalizedMessage) ||
    /(disabled|not allowed).{0,30}sign.?up/.test(normalizedMessage)
  ) {
    return 'ဤအကောင့်ဖြင့် ဝင်ရောက်ခွင့် မပြုထားပါ။ အကောင့်ဖွင့်ပေးရန် တာဝန်ရှိသူထံ ဆက်သွယ်ပါ။';
  }

  return 'Google ဖြင့် ဝင်ရောက်မရပါ။ ခဏနေပြီး ထပ်မံကြိုးစားပါ။';
}
