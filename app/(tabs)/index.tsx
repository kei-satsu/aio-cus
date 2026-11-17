import { Link } from 'expo-router';
import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
} from 'react-native';

import { Text, View } from '@/components/Themed';
import { useColorScheme } from '@/components/useColorScheme';
import { useResponsiveLayout } from '@/components/useResponsiveLayout';
import { WayRow } from '@/components/WayRow';
import { getAppColors } from '@/constants/AppColors';
import { useAuth } from '@/contexts/AuthContext';
import { getSenderOrderStats } from '@/lib/orderStats';
import { getSendersForUser, type SenderOption } from '@/lib/senders';
import { getLatestWays, type Way } from '@/lib/ways';

type OrderStats = {
  total: number;
  delivered: number;
  processing: number;
  returned: number;
};

export default function HomeScreen() {
  const { displayName, user } = useAuth();
  const colorScheme = useColorScheme();
  const colors = getAppColors(colorScheme === 'dark');
  const responsive = useResponsiveLayout();
  const avatarValue = user?.user_metadata.avatar_url ?? user?.user_metadata.picture;
  const avatarUrl =
    typeof avatarValue === 'string' && avatarValue.trim().length > 0
      ? avatarValue.trim()
      : null;

  const userId = user?.id;
  const [senders, setSenders] = useState<SenderOption[]>([]);
  const [selectedSenderId, setSelectedSenderId] = useState<string | number | null>(null);
  const [isLoadingSenders, setIsLoadingSenders] = useState(true);
  const [senderError, setSenderError] = useState<string | null>(null);
  const [orderStats, setOrderStats] = useState<OrderStats | null>(null);
  const [isLoadingStats, setIsLoadingStats] = useState(false);
  const [statsError, setStatsError] = useState<string | null>(null);
  const [recentWays, setRecentWays] = useState<Way[]>([]);
  const [isLoadingWays, setIsLoadingWays] = useState(false);
  const [waysError, setWaysError] = useState<string | null>(null);
  const [hasAvatarError, setHasAvatarError] = useState(false);

  useEffect(() => {
    let isMounted = true;

    async function loadSenders() {
      if (!userId) {
        setSenders([]);
        setSelectedSenderId(null);
        setIsLoadingSenders(false);
        return;
      }

      setIsLoadingSenders(true);
      setSenderError(null);
      try {
        const userSenders = await getSendersForUser(userId);
        if (isMounted) {
          setSenders(userSenders);
          setSelectedSenderId(userSenders[0]?.id ?? null);
        }
      } catch (error) {
        console.error('Unable to load senders for the current user.', error);
        if (isMounted) {
          setSenders([]);
          setSelectedSenderId(null);
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

  useEffect(() => {
    let isMounted = true;

    async function loadOrderStats() {
      if (selectedSenderId === null) {
        setOrderStats(null);
        setStatsError(null);
        setIsLoadingStats(false);
        return;
      }

      setIsLoadingStats(true);
      setStatsError(null);
      try {
        const stats = await getSenderOrderStats(selectedSenderId);

        if (isMounted) {
          setOrderStats({
            ...stats,
            processing: stats.total - stats.delivered - stats.returned,
          });
        }
      } catch (error) {
        console.error('Unable to load order counts for the selected sender.', error);
        if (isMounted) {
          setOrderStats(null);
          setStatsError('အော်ဒါအရေအတွက်ကို ဖတ်မရပါ။');
        }
      } finally {
        if (isMounted) {
          setIsLoadingStats(false);
        }
      }
    }

    void loadOrderStats();

    return () => {
      isMounted = false;
    };
  }, [selectedSenderId]);

  useEffect(() => {
    let isMounted = true;

    async function loadRecentWays() {
      if (selectedSenderId === null) {
        setRecentWays([]);
        setWaysError(null);
        setIsLoadingWays(false);
        return;
      }

      setIsLoadingWays(true);
      setWaysError(null);
      try {
        const ways = await getLatestWays(selectedSenderId);
        if (isMounted) {
          setRecentWays(ways);
        }
      } catch (error) {
        console.error('Unable to load the latest ways for the selected sender.', error);
        if (isMounted) {
          setRecentWays([]);
          setWaysError('နောက်ဆုံး ways စာရင်းကို ဖတ်မရပါ။');
        }
      } finally {
        if (isMounted) {
          setIsLoadingWays(false);
        }
      }
    }

    void loadRecentWays();

    return () => {
      isMounted = false;
    };
  }, [selectedSenderId]);

  const metrics = [
    { key: 'total', label: 'Total ways', color: colors.info },
    { key: 'delivered', label: 'Completed ways', color: colors.success },
    { key: 'processing', label: 'Processing ways', color: colors.warning },
    { key: 'returned', label: 'Return ways', color: colors.returned },
  ] as const;

  const parcelListContent = isLoadingWays ? (
    <View style={[styles.waysPanel, { backgroundColor: colors.surface, borderColor: colors.border }]}>
      <ActivityIndicator color={colors.primary} />
    </View>
  ) : waysError ? (
    <View style={[styles.waysPanel, { backgroundColor: colors.surface, borderColor: colors.border }]}>
      <Text style={[styles.statusText, { color: colors.danger }]}>{waysError}</Text>
    </View>
  ) : recentWays.length > 0 ? (
    recentWays.map((way, index) => (
      <WayRow
        key={String(way.item_id ?? `way-${index}`)}
        way={way}
        index={index}
        colors={colors}
        variant="card"
      />
    ))
  ) : (
    <View style={[styles.waysPanel, { backgroundColor: colors.surface, borderColor: colors.border }]}>
      <Text style={[styles.statusText, { color: colors.muted }]}>
        {selectedSenderId === null
          ? 'Ways ကြည့်ရန် Sender ကို ရွေးပါ။'
          : 'ပြသရန် ways မရှိသေးပါ။'}
      </Text>
    </View>
  );

  const summaryContent = (
    <>
        <View style={styles.welcomeHeader}>
          <View style={styles.welcomeCopy}>
            <View style={styles.brandEyebrowRow}>
             
              <Text style={[styles.welcomeEyebrow, { color: colors.primary }]}>DASHBOARD</Text>
            </View>
            <Text
              numberOfLines={1}
              ellipsizeMode="tail"
              style={[styles.welcome, { color: colors.text }]}>
              မင်္ဂလာပါ{displayName ? `၊ ${displayName}` : ''}
            </Text>
            <Text style={[styles.welcomeCaption, { color: colors.muted }]}>
              Percel အခြေအနေများကို ကြည့်ရှု့နိုင်ပါသည်။
            </Text>
          </View>
          {avatarUrl && !hasAvatarError ? (
            <Image
              accessibilityLabel="Google account profile photo"
              onError={() => setHasAvatarError(true)}
              source={{ uri: avatarUrl }}
              style={styles.welcomeBadge}
            />
          ) : (
            <View style={[styles.welcomeBadge, { backgroundColor: colors.primarySoft }]}>
              <Text style={[styles.welcomeInitial, { color: colors.primary }]}>
                {displayName?.trim().charAt(0).toUpperCase() || 'A'}
              </Text>
            </View>
          )}
        </View>

        <Text style={[styles.sectionTitle, styles.senderTitle, { color: colors.text }]}>
          Linked Senders
        </Text>
        <View
          style={[
            styles.panel,
            {
              backgroundColor: colors.surface,
              borderColor: colors.border,
              shadowColor: colors.shadow,
            },
          ]}>
          {isLoadingSenders ? (
            <ActivityIndicator color={colors.primary} />
          ) : senderError ? (
            <Text style={[styles.statusText, { color: colors.danger }]}>{senderError}</Text>
          ) : senders.length > 0 ? (
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.senderList}>
              {senders.map((sender) => {
                const isSelected = sender.id === selectedSenderId;

                return (
                  <Pressable
                    key={String(sender.id)}
                    accessibilityRole="button"
                    accessibilityState={{ selected: isSelected }}
                    onPress={() => setSelectedSenderId(sender.id)}
                    style={[
                      styles.senderOption,
                      {
                        backgroundColor: isSelected ? colors.primary : colors.surface,
                        borderColor: isSelected ? colors.primary : colors.border,
                      },
                    ]}>
                    <Text
                      style={[
                        styles.senderOptionText,
                        { color: isSelected ? colors.primaryText : colors.text },
                      ]}>
                      {sender.name}
                    </Text>
                  </Pressable>
                );
              })}
            </ScrollView>
          ) : (
            <Text style={[styles.statusText, { color: colors.muted }]}>
              ချိတ်ဆက်ထားသော Sender မရှိပါ။
            </Text>
          )}
        </View>

        <Text style={[styles.sectionTitle, styles.metricsTitle, { color: colors.text }]}>
         Summary for {senders.find((s) => s.id === selectedSenderId)?.name ?? '—'}
        </Text>
        {statsError && <Text style={[styles.errorText, { color: colors.danger }]}>{statsError}</Text>}
        <View style={styles.metricsGrid}>
          {metrics.map((metric) => (
            <View
              key={metric.key}
              style={[
                styles.metricCard,
                {
                  width: '47%',
                  backgroundColor: colors.surface,
                  borderColor: colors.border,
                  shadowColor: colors.shadow,
                },
              ]}>
              <Text style={[styles.metricLabel, { color: colors.muted }]}>{metric.label}</Text>
              {isLoadingStats ? (
                <ActivityIndicator color={metric.color} />
              ) : (
                <Text style={[styles.metricValue, { color: metric.color }]}>
                  {orderStats ? orderStats[metric.key].toLocaleString() : '—'}
                </Text>
              )}
            </View>
          ))}
        </View>
    </>
  );

  const seeAllWaysButton =
    selectedSenderId === null ? null : (
      <Link
        href={{ pathname: '/ways', params: { senderId: String(selectedSenderId) } }}
        asChild>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="See all ways"
          style={({ pressed }) => [
            styles.bottomSeeAllButton,
            {
              backgroundColor: colors.primarySoft,
              borderColor: colors.primarySoft,
            },
            pressed && styles.pressed,
          ]}>
          <Text style={[styles.bottomSeeAllText, { color: colors.primary }]}>See All</Text>
        </Pressable>
      </Link>
    );

  const parcelSection = (
    <View style={responsive.isWide ? styles.desktopParcelColumn : undefined}>
        <View
          style={[
            styles.waysHeading,
            responsive.isWide && styles.desktopWaysHeading,
          ]}>
          <Text style={[styles.sectionTitle, styles.waysTitle, { color: colors.text }]}>
            Percel List
          </Text>
          {selectedSenderId !== null && (
            <Link
              href={{ pathname: '/ways', params: { senderId: String(selectedSenderId) } }}
              asChild>
              <Pressable
                accessibilityRole="button"
                style={({ pressed }) => [styles.allWaysButton, pressed && styles.pressed]}>
                <Text style={[styles.allWaysText, { color: colors.primary }]}>
                  See All
                </Text>
              </Pressable>
            </Link>
          )}
        </View>
        {responsive.isWide ? (
          <ScrollView
            nestedScrollEnabled
            style={styles.desktopParcelScroll}
            contentContainerStyle={styles.waysList}>
            {parcelListContent}
            {seeAllWaysButton}
          </ScrollView>
        ) : (
          <View style={styles.waysList}>
            {parcelListContent}
            {seeAllWaysButton}
          </View>
        )}
    </View>
  );

  return responsive.isWide ? (
    <View style={[styles.desktopContainer, { backgroundColor: colors.background }]}>
      <View style={styles.desktopColumns}>
        <View style={styles.desktopSummaryColumn}>{summaryContent}</View>
        {parcelSection}
      </View>
    </View>
  ) : (
    <ScrollView
      style={{ backgroundColor: colors.background }}
      contentContainerStyle={[
        styles.container,
        { paddingHorizontal: responsive.horizontalPadding },
      ]}>
      <View style={styles.content}>
        {summaryContent}
        {parcelSection}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 36,
  },
  content: {
    width: '100%',
    maxWidth: 720,
    alignSelf: 'center',
  },
  desktopContainer: {
    flex: 1,
    paddingHorizontal: 32,
    paddingVertical: 20,
  },
  desktopColumns: {
    flex: 1,
    width: '100%',
    maxWidth: 1400,
    alignSelf: 'center',
    flexDirection: 'row',
    gap: 24,
    minHeight: 0,
  },
  desktopSummaryColumn: {
    width: '40%',
    minWidth: 0,
  },
  desktopParcelColumn: {
    flex: 1,
    minWidth: 0,
    minHeight: 0,
  },
  welcomeHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 26,
    gap: 14,
  },
  welcomeCopy: {
    flex: 1,
    minWidth: 0,
  },
  welcomeEyebrow: {
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 1.5,
  },
  brandEyebrowRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 7,
    marginBottom: 5,
  },
  homeLogoFrame: {
    width: 20,
    height: 20,
    borderRadius: 6,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
    overflow: 'hidden',
  },
  homeLogo: {
    width: 18,
    height: 18,
  },
  welcome: {
    fontSize: 22,
    fontWeight: '800',
  },
  welcomeCaption: {
    fontSize: 13,
    lineHeight: 19,
    marginTop: 4,
  },
  welcomeBadge: {
    width: 48,
    height: 48,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  welcomeInitial: {
    fontSize: 21,
    fontWeight: '800',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '800',
    marginBottom: 12,
  },
  senderTitle: {
    fontSize: 16,
    marginBottom: 8,
  },
  panel: {
    minHeight: 58,
    justifyContent: 'center',
    borderRadius: 16,
    borderWidth: 1,
    padding: 8,
    marginBottom: 22,
    shadowColor: '#101828',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.04,
    shadowRadius: 12,
    elevation: 1,
  },
  senderList: {
    alignItems: 'center',
    gap: 8,
  },
  senderOption: {
    minHeight: 38,
    justifyContent: 'center',
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 14,
  },
  senderOptionText: {
    fontSize: 13,
    fontWeight: '700',
  },
  statusText: {
    fontSize: 14,
    lineHeight: 20,
  },
  errorText: {
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 12,
  },
  metricsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: 12,
  },
  metricsTitle: {
    marginBottom: 14,
  },
  metricCard: {
    minHeight: 132,
    justifyContent: 'space-between',
    borderWidth: 1,
    borderRadius: 22,
    padding: 18,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.05,
    shadowRadius: 18,
    elevation: 2,
  },
  metricLabel: {
    fontSize: 14,
    fontWeight: '700',
  },
  metricValue: {
    fontSize: 30,
    fontWeight: '800',
  },
  waysHeading: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 30,
    marginBottom: 12,
  },
  desktopWaysHeading: {
    marginTop: 0,
    marginBottom: 14,
  },
  waysTitle: {
    marginBottom: 0,
  },
  allWaysButton: {
    minHeight: 40,
    justifyContent: 'center',
    paddingHorizontal: 8,
  },
  allWaysText: {
    fontSize: 14,
    fontWeight: '700',
  },
  bottomSeeAllButton: {
    minHeight: 44,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderRadius: 14,
    paddingHorizontal: 16,
  },
  bottomSeeAllText: {
    fontSize: 14,
    fontWeight: '800',
  },
  waysPanel: {
    borderRadius: 20,
    borderWidth: 1,
    paddingHorizontal: 16,
    paddingVertical: 6,
    shadowColor: '#101828',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.04,
    shadowRadius: 16,
    elevation: 2,
  },
  waysList: {
    width: '100%',
    gap: 10,
  },
  desktopParcelScroll: {
    flex: 1,
    minHeight: 0,
  },
  pressed: {
    opacity: 0.6,
  },
});
