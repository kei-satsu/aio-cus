import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  View,
} from 'react-native';

import { Text } from '@/components/Themed';
import { useColorScheme } from '@/components/useColorScheme';
import { useResponsiveLayout } from '@/components/useResponsiveLayout';
import { getAppColors } from '@/constants/AppColors';
import { useAuth } from '@/contexts/AuthContext';
import { getSendersForUser } from '@/lib/senders';

export default function ProfileScreen() {
  const { displayName, signOut, user } = useAuth();
  const colorScheme = useColorScheme();
  const colors = getAppColors(colorScheme === 'dark');
  const responsive = useResponsiveLayout();

  const userId = user?.id;
  const avatarValue = user?.user_metadata.avatar_url ?? user?.user_metadata.picture;
  const avatarUrl = typeof avatarValue === 'string' ? avatarValue : null;
  const [senderNames, setSenderNames] = useState<string[]>([]);
  const [isLoadingSenders, setIsLoadingSenders] = useState(true);
  const [senderError, setSenderError] = useState<string | null>(null);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [signOutError, setSignOutError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    async function loadSenders() {
      if (!userId) {
        setSenderNames([]);
        setIsLoadingSenders(false);
        return;
      }

      setIsLoadingSenders(true);
      setSenderError(null);
      try {
        const senders = await getSendersForUser(userId);
        if (isMounted) {
          setSenderNames(senders.map(({ name }) => name));
        }
      } catch (error) {
        console.error('Unable to load senders for the current user.', error);
        if (isMounted) {
          setSenderError('Sender စာရင်းကို ဖတ်မရပါ။');
        }
      } finally {
        if (isMounted) {
          setIsLoadingSenders(false);
        }
      }
    }

    void loadSenders();

    return () => {
      isMounted = false;
    };
  }, [userId]);

  async function handleSignOut() {
    setSignOutError(null);
    setIsLoggingOut(true);
    try {
      await signOut();
    } catch (error) {
      console.error('Unable to sign out the Supabase session.', error);
      setSignOutError('Logout မလုပ်နိုင်ပါ။ ထပ်မံကြိုးစားပါ။');
    } finally {
      setIsLoggingOut(false);
    }
  }

  return (
    <ScrollView
      contentContainerStyle={[
        styles.container,
        { paddingHorizontal: responsive.horizontalPadding },
      ]}
      style={{ backgroundColor: colors.background }}>
      <View
        style={[
          styles.content,
          { maxWidth: responsive.isTablet ? 760 : 560 },
        ]}>
        <Text style={[styles.eyebrow, { color: colors.primary }]}>ACCOUNT</Text>
        <Text style={[styles.pageTitle, { color: colors.text }]}>သင့်အကောင့်</Text>
        <Text style={[styles.pageSubtitle, { color: colors.muted }]}>
          Profile နှင့် ချိတ်ဆက်ထားသော Sender များကို စီမံပါ။
        </Text>
        <View
          style={[
            styles.profileCard,
            {
              backgroundColor: colors.surface,
              borderColor: colors.border,
              shadowColor: colors.shadow,
              padding: responsive.isCompact ? 16 : 20,
            },
          ]}>
          <View style={styles.profile}>
            <View style={[styles.avatarFrame, { backgroundColor: colors.primarySoft }]}>
              {avatarUrl ? (
                <Image source={{ uri: avatarUrl }} style={styles.avatar} />
              ) : (
                <View style={[styles.avatarFallback, { backgroundColor: colors.surface }]}>
                  <Text style={[styles.avatarInitial, { color: colors.primary }]}>
                    {displayName?.charAt(0).toUpperCase() ?? 'A'}
                  </Text>
                </View>
              )}
            </View>
            <View style={styles.profileText}>
              <Text numberOfLines={2} ellipsizeMode="tail" style={[styles.name, { color: colors.text }]}>
                {displayName ?? 'အမည်မရရှိပါ'}
              </Text>
              <Text numberOfLines={1} ellipsizeMode="middle" style={[styles.email, { color: colors.muted }]}>
                {user?.email ?? 'အီးမေးလ်မရရှိပါ'}
              </Text>
            </View>
          </View>
        </View>

        <View style={styles.sectionHeading}>
          <View style={styles.sectionCopy}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>
              ချိတ်ဆက်ထားသော Sender များ
            </Text>
            <Text style={[styles.sectionSubtitle, { color: colors.muted }]}>
              သင့်အကောင့်နဲ့ ချိတ်ဆက်ထားသော စာရင်း
            </Text>
          </View>
          {!isLoadingSenders && !senderError && senderNames.length > 0 && (
            <View style={[styles.countBadge, { backgroundColor: colors.primarySoft }]}>
              <Text style={[styles.countText, { color: colors.primary }]}>
                {senderNames.length}
              </Text>
            </View>
          )}
        </View>
        <View
          style={[
            styles.senderCard,
            {
              backgroundColor: colors.surface,
              borderColor: colors.border,
              shadowColor: colors.shadow,
            },
          ]}>
          {isLoadingSenders ? (
            <View style={styles.emptyState}>
              <ActivityIndicator color={colors.primary} />
            </View>
          ) : senderError ? (
            <View style={styles.emptyState}>
              <Text style={[styles.statusText, { color: colors.danger }]}>{senderError}</Text>
            </View>
          ) : senderNames.length > 0 ? (
            senderNames.map((name, index) => (
              <View
                key={`${name}-${index}`}
                style={[
                  styles.senderRow,
                  index > 0 && {
                    borderTopColor: colors.border,
                    borderTopWidth: StyleSheet.hairlineWidth,
                  },
                ]}>
                <View style={[styles.senderMark, { backgroundColor: colors.primarySoft }]}>
                  <Text style={[styles.senderInitial, { color: colors.primary }]}>
                    {name.trim().charAt(0).toUpperCase() || 'S'}
                  </Text>
                </View>
                <View style={styles.senderText}>
                  <Text
                    numberOfLines={1}
                    ellipsizeMode="tail"
                    style={[styles.senderName, { color: colors.text }]}>
                    {name}
                  </Text>
                  <Text style={[styles.senderCaption, { color: colors.muted }]}>
                    Connected sender
                  </Text>
                </View>
                <View style={[styles.connectedDot, { backgroundColor: colors.success }]} />
              </View>
            ))
          ) : (
            <View style={styles.emptyState}>
              <Text style={[styles.statusText, { color: colors.muted }]}>
                ချိတ်ဆက်ထားသော Sender မရှိပါ။
              </Text>
            </View>
          )}
        </View>

        {signOutError && (
          <View style={[styles.errorCard, { backgroundColor: colors.surface, borderColor: colors.danger }]}>
            <Text style={[styles.statusText, { color: colors.danger }]}>{signOutError}</Text>
          </View>
        )}
        <Pressable
          accessibilityRole="button"
          disabled={isLoggingOut}
          onPress={handleSignOut}
          style={({ pressed }) => [
            styles.signOutButton,
            {
              backgroundColor: colors.surface,
              borderColor: colors.border,
              opacity: pressed || isLoggingOut ? 0.8 : 1,
            },
          ]}>
          {isLoggingOut ? (
            <ActivityIndicator color={colors.danger} />
          ) : (
            <Text style={[styles.signOutText, { color: colors.danger }]}>Logout</Text>
          )}
        </Pressable>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    alignItems: 'center',
    paddingTop: 28,
    paddingBottom: 36,
  },
  content: {
    width: '100%',
    maxWidth: 560,
  },
  eyebrow: {
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 1.5,
    marginBottom: 6,
  },
  pageTitle: {
    fontSize: 30,
    fontWeight: '800',
  },
  pageSubtitle: {
    fontSize: 14,
    lineHeight: 22,
    marginTop: 7,
    marginBottom: 26,
  },
  profileCard: {
    borderWidth: 1,
    borderRadius: 24,
    padding: 20,
    marginBottom: 28,
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.055,
    shadowRadius: 20,
    elevation: 2,
  },
  profile: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  avatarFrame: {
    width: 82,
    height: 82,
    borderRadius: 26,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 5,
  },
  avatar: {
    width: '100%',
    height: '100%',
    borderRadius: 21,
  },
  avatarFallback: {
    width: '100%',
    height: '100%',
    borderRadius: 21,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarInitial: {
    fontSize: 28,
    fontWeight: '800',
  },
  profileText: {
    flex: 1,
    minWidth: 0,
  },
  name: {
    fontSize: 21,
    fontWeight: '800',
    flexShrink: 1,
  },
  email: {
    fontSize: 14,
    marginTop: 6,
    flexShrink: 1,
  },
  sectionHeading: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
    marginBottom: 12,
  },
  sectionCopy: {
    flex: 1,
    minWidth: 0,
  },
  sectionTitle: {
    fontSize: 17,
    fontWeight: '800',
  },
  sectionSubtitle: {
    fontSize: 13,
    lineHeight: 19,
    marginTop: 4,
  },
  countBadge: {
    minWidth: 36,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 12,
    paddingHorizontal: 10,
  },
  countText: {
    fontSize: 13,
    fontWeight: '800',
  },
  senderCard: {
    borderWidth: 1,
    borderRadius: 20,
    paddingHorizontal: 16,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.045,
    shadowRadius: 18,
    elevation: 2,
  },
  senderRow: {
    minHeight: 68,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 12,
  },
  senderMark: {
    width: 40,
    height: 40,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  senderInitial: {
    fontSize: 16,
    fontWeight: '800',
  },
  senderText: {
    flex: 1,
    minWidth: 0,
  },
  senderName: {
    fontSize: 15,
    fontWeight: '700',
  },
  senderCaption: {
    fontSize: 12,
    marginTop: 3,
  },
  connectedDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  emptyState: {
    minHeight: 88,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
  },
  errorCard: {
    borderWidth: 1,
    borderRadius: 16,
    padding: 14,
    marginTop: 16,
  },
  statusText: {
    fontSize: 14,
    lineHeight: 20,
  },
  signOutButton: {
    minHeight: 52,
    borderWidth: 1,
    borderRadius: 17,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 22,
  },
  signOutText: {
    fontSize: 15,
    fontWeight: '800',
  },
});
