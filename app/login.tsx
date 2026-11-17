import { useState } from 'react';
import { ActivityIndicator, Image, Pressable, ScrollView, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Text, View } from '@/components/Themed';
import { useColorScheme } from '@/components/useColorScheme';
import { useResponsiveLayout } from '@/components/useResponsiveLayout';
import { getAppColors } from '@/constants/AppColors';
import { useAuth } from '@/contexts/AuthContext';

export default function LoginScreen() {
  const colorScheme = useColorScheme();
  const { sessionError, signInWithGoogle } = useAuth();
  const colors = getAppColors(colorScheme === 'dark');
  const { horizontalPadding, isCompact, isWide } = useResponsiveLayout();

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  async function handleGoogleSignIn() {
    setFormError(null);
    setIsSubmitting(true);
    try {
      await signInWithGoogle();
    } catch (error) {
      setFormError(error instanceof Error ? error.message : 'Google ဖြင့် ဝင်ရောက်မရပါ။');
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <View style={[styles.root, { backgroundColor: colors.background }]}>
      <Image
        accessibilityLabel="All In One Express delivery center background"
        source={require('../assets/images/login-background.png')}
        resizeMode="cover"
        style={styles.backgroundImage}
      />
      <View pointerEvents="none" style={styles.backgroundOverlay} />
      <SafeAreaView style={styles.safeArea}>
        <ScrollView
          contentContainerStyle={[
            styles.scrollContent,
            { paddingHorizontal: horizontalPadding, paddingVertical: isWide ? 48 : 20 },
          ]}>
          <View
            style={[
              styles.card,
              {
                backgroundColor: colors.surface,
                borderColor: colors.border,
                padding: isCompact ? 20 : 30,
              },
            ]}>
            <View style={[styles.brandMark, { backgroundColor: colors.badge }]}>
              <Image
                accessibilityLabel="All In One Express logo"
                source={require('../assets/images/logo.png')}
                resizeMode="contain"
                style={styles.brandLogo}
              />
            </View>
            <Text style={[styles.brandName, { color: colors.text }]}>AIO CUSTOMERS</Text>
            <Text style={[styles.eyebrow, { color: colors.primary }]}>Percel Tracking</Text>
            <View style={styles.welcomeHeading}>
              <Text style={[styles.welcomeKicker, { color: colors.muted }]}>WELCOME TO</Text>
              <Text
                adjustsFontSizeToFit
                minimumFontScale={0.75}
                numberOfLines={1}
                style={[
                  styles.title,
                  { color: colors.text, fontSize: isCompact ? 22 : 26 },
                ]}>
                ALL IN ONE <Text style={{ color: colors.primary }}>EXPRESS</Text>
              </Text>
            </View>
            <Text style={[styles.subtitle, { color: colors.muted }]}>
              သင့် Google အကောင့်ဖြင့် ဝင်ရောက်ပါ
            </Text>

            {(formError || sessionError) && (
              <Text accessibilityRole="alert" style={[styles.errorText, { color: colors.danger }]}>
                {formError ?? sessionError}
              </Text>
            )}

            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Google ဖြင့် ဝင်ရောက်မည်"
              disabled={isSubmitting}
              onPress={handleGoogleSignIn}
              style={({ pressed }) => [
                styles.submitButton,
                {
                  backgroundColor: pressed ? '#F8F9FA' : '#FFFFFF',
                  borderColor: pressed ? '#C6C9CC' : '#DADCE0',
                  opacity: isSubmitting ? 0.65 : 1,
                },
              ]}>
              {isSubmitting ? (
                <ActivityIndicator color="#4285F4" />
              ) : (
                <View style={styles.submitButtonContent}>
                  <Text style={styles.googleMark}>G</Text>
                  <Text style={styles.submitButtonText}>Google ဖြင့် ဝင်ရောက်မည်</Text>
                </View>
              )}
            </Pressable>
          </View>
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
  backgroundImage: {
    position: 'absolute',
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
    width: '100%',
    height: '100%',
  },
  backgroundOverlay: {
    position: 'absolute',
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
    backgroundColor: 'rgba(11, 18, 32, 0.4)',
  },
  safeArea: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  scrollContent: {
    flexGrow: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  card: {
    width: '100%',
    maxWidth: 440,
    borderRadius: 28,
    borderWidth: 1,
    padding: 30,
    shadowColor: '#101828',
    shadowOffset: { width: 0, height: 16 },
    shadowOpacity: 0.1,
    shadowRadius: 30,
    elevation: 6,
  },
  brandMark: {
    width: 60,
    height: 60,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'center',
    marginBottom: 12,
    overflow: 'hidden',
  },
  brandLogo: {
    width: 52,
    height: 52,
    borderRadius: 16,
  },
  brandName: {
    alignSelf: 'center',
    fontSize: 13,
    fontWeight: '800',
    letterSpacing: 2.4,
    marginBottom: 22,
  },
  eyebrow: {
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 1.4,
    textAlign: 'center',
    marginBottom: 16,
  },
  welcomeHeading: {
    alignItems: 'center',
    backgroundColor: 'transparent',
  },
  welcomeKicker: {
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 2.2,
    marginBottom: 5,
  },
  title: {
    lineHeight: 34,
    fontWeight: '800',
    textAlign: 'center',
    alignSelf: 'stretch',
  },
  subtitle: {
    fontSize: 15,
    lineHeight: 24,
    textAlign: 'center',
    marginTop: 8,
    marginBottom: 22,
  },
  errorText: {
    fontSize: 13,
    lineHeight: 20,
    marginBottom: 12,
  },
  submitButton: {
    minHeight: 56,
    borderRadius: 12,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 4,
    paddingHorizontal: 16,
    shadowColor: '#3C4043',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.12,
    shadowRadius: 2,
    elevation: 1,
  },
  submitButtonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'transparent',
  },
  googleMark: {
    color: '#4285F4',
    fontSize: 22,
    fontWeight: '700',
    marginRight: 14,
    fontFamily: 'Arial',
  },
  submitButtonText: {
    color: '#3C4043',
    fontSize: 14,
    fontWeight: '600',
  },
});
