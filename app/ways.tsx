import { useLocalSearchParams } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Pressable,
  ScrollView,
  StyleSheet,
  TextInput,
} from 'react-native';

import { Text, View } from '@/components/Themed';
import { useColorScheme } from '@/components/useColorScheme';
import { useResponsiveLayout } from '@/components/useResponsiveLayout';
import { WayRow } from '@/components/WayRow';
import { getAppColors } from '@/constants/AppColors';
import { useAuth } from '@/contexts/AuthContext';
import { getSendersForUser, type SenderOption } from '@/lib/senders';
import { getWaysPage, isValidReceivedDate, type Way, type WayFilters } from '@/lib/ways';

const pageSize = 50;

export default function WaysScreen() {
  const { user } = useAuth();
  const colorScheme = useColorScheme();
  const colors = getAppColors(colorScheme === 'dark');
  const responsive = useResponsiveLayout();
  const { senderId: senderIdParam } = useLocalSearchParams<{ senderId?: string }>();
  const userId = user?.id;
  const [senders, setSenders] = useState<SenderOption[]>([]);
  const [selectedSenderId, setSelectedSenderId] = useState<string | number | null>(null);
  const [ways, setWays] = useState<Way[]>([]);
  const [isLoadingSenders, setIsLoadingSenders] = useState(true);
  const [senderError, setSenderError] = useState<string | null>(null);
  const [isLoadingWays, setIsLoadingWays] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(false);
  const [waysError, setWaysError] = useState<string | null>(null);
  const [loadMoreError, setLoadMoreError] = useState<string | null>(null);
  const requestId = useRef(0);
  const isLoadingMoreRef = useRef(false);
  const [searchText, setSearchText] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [receivedDateStartInput, setReceivedDateStartInput] = useState('');
  const [receivedDateEndInput, setReceivedDateEndInput] = useState('');
  const [receiverLocationInput, setReceiverLocationInput] = useState('');
  const [statusInput, setStatusInput] = useState('');
  const [isFilterExpanded, setIsFilterExpanded] = useState(true);
  const [wayFilters, setWayFilters] = useState<WayFilters>({});
  const receivedDateStart = receivedDateStartInput.trim();
  const receivedDateEnd = receivedDateEndInput.trim();
  const hasInvalidReceivedDateStart =
    receivedDateStart !== '' && !isValidReceivedDate(receivedDateStart);
  const hasInvalidReceivedDateEnd = receivedDateEnd !== '' && !isValidReceivedDate(receivedDateEnd);
  const hasReversedReceivedDateRange =
    !hasInvalidReceivedDateStart &&
    !hasInvalidReceivedDateEnd &&
    receivedDateStart !== '' &&
    receivedDateEnd !== '' &&
    receivedDateStart > receivedDateEnd;
  const receivedDateError = hasInvalidReceivedDateStart
    ? 'စတင်ရက်ကို YYYY-MM-DD ပုံစံမှန်ဖြင့် ထည့်ပါ။'
    : hasInvalidReceivedDateEnd
      ? 'ပြီးဆုံးရက်ကို YYYY-MM-DD ပုံစံမှန်ဖြင့် ထည့်ပါ။'
      : hasReversedReceivedDateRange
        ? 'စတင်ရက်သည် ပြီးဆုံးရက်ထက် နောက်မကျရပါ။'
        : null;

  useEffect(() => {
    const timeout = setTimeout(() => setSearchTerm(searchText.trim()), 300);
    return () => clearTimeout(timeout);
  }, [searchText]);

  useEffect(() => {
    const timeout = setTimeout(() => {
      const filters: WayFilters = {};
      const receiverLocation = receiverLocationInput.trim();
      const status = statusInput.trim();

      if (!receivedDateError) {
        if (receivedDateStart) {
          filters.receivedDateFrom = receivedDateStart;
        }
        if (receivedDateEnd) {
          filters.receivedDateTo = receivedDateEnd;
        }
      }
      if (receiverLocation) {
        filters.receiverLocation = receiverLocation;
      }
      if (status) {
        filters.status = status;
      }

      setWayFilters((currentFilters) =>
        currentFilters.receivedDateFrom === filters.receivedDateFrom &&
        currentFilters.receivedDateTo === filters.receivedDateTo &&
        currentFilters.receiverLocation === filters.receiverLocation &&
        currentFilters.status === filters.status
          ? currentFilters
          : filters
      );
    }, 300);

    return () => clearTimeout(timeout);
  }, [
    receivedDateEnd,
    receivedDateError,
    receivedDateStart,
    receiverLocationInput,
    statusInput,
  ]);

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
        const senders = await getSendersForUser(userId);
        const requestedSenderId = Array.isArray(senderIdParam)
          ? senderIdParam[0]
          : senderIdParam;
        const selectedSender =
          senders.find((sender) => String(sender.id) === requestedSenderId) ??
          senders[0] ??
          null;

        if (isMounted) {
          setSenders(senders);
          setSelectedSenderId(selectedSender?.id ?? null);
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
  }, [senderIdParam, userId]);

  useEffect(() => {
    const currentRequestId = ++requestId.current;

    async function loadFirstPage() {
      setWays([]);
      setHasMore(false);
      setWaysError(null);
      setLoadMoreError(null);
      setIsLoadingMore(false);
      isLoadingMoreRef.current = false;

      if (selectedSenderId === null) {
        setIsLoadingWays(false);
        return;
      }

      setIsLoadingWays(true);
      try {
        const firstPage = await getWaysPage(selectedSenderId, 0, pageSize, searchTerm, wayFilters);
        if (currentRequestId === requestId.current) {
          setWays(firstPage);
          setHasMore(firstPage.length === pageSize);
        }
      } catch (error) {
        console.error('Unable to load ways for the selected sender.', error);
        if (currentRequestId === requestId.current) {
          setWaysError('Ways စာရင်းကို ဖတ်မရပါ။');
        }
      } finally {
        if (currentRequestId === requestId.current) {
          setIsLoadingWays(false);
        }
      }
    }

    void loadFirstPage();

    return () => {
      requestId.current += 1;
    };
  }, [searchTerm, selectedSenderId, wayFilters]);

  async function loadMoreWays() {
    if (
      selectedSenderId === null ||
      !hasMore ||
      isLoadingWays ||
      isLoadingMoreRef.current
    ) {
      return;
    }

    const currentRequestId = requestId.current;
    isLoadingMoreRef.current = true;
    setIsLoadingMore(true);
    setLoadMoreError(null);

    try {
      const nextPage = await getWaysPage(
        selectedSenderId,
        ways.length,
        pageSize,
        searchTerm,
        wayFilters
      );
      if (currentRequestId === requestId.current) {
        setWays((currentWays) => [...currentWays, ...nextPage]);
        setHasMore(nextPage.length === pageSize);
      }
    } catch (error) {
      console.error('Unable to load more ways for the selected sender.', error);
      if (currentRequestId === requestId.current) {
        setLoadMoreError('နောက်ထပ် ways များကို ဖတ်မရပါ။');
      }
    } finally {
      if (currentRequestId === requestId.current) {
        isLoadingMoreRef.current = false;
        setIsLoadingMore(false);
      }
    }
  }

  const hasFilterInput =
    receivedDateStart !== '' ||
    receivedDateEnd !== '' ||
    receiverLocationInput.trim() !== '' ||
    statusInput.trim() !== '';
  const activeFilterCount = Object.values(wayFilters).filter(Boolean).length;

  return (
    <FlatList
      style={{ backgroundColor: colors.background }}
      contentContainerStyle={[
        styles.container,
        { paddingHorizontal: responsive.horizontalPadding },
      ]}
      data={ways}
      keyExtractor={(way, index) => {
        const id = way.item_id;
        return id === undefined || id === null ? `way-${index}` : String(id);
      }}
      renderItem={({ item, index }) => (
        <View style={[styles.listItem, { maxWidth: responsive.isWide ? 960 : 720 }]}>
          <WayRow way={item} index={index} colors={colors} variant="card" />
        </View>
      )}
      onEndReached={() => void loadMoreWays()}
      onEndReachedThreshold={0.5}
      ListHeaderComponent={
        <View style={[styles.content, { maxWidth: responsive.isWide ? 960 : 720 }]}>
          {/* Header Title Section */}
        

          {/* Sender Selection Horizontal Scroll Panel */}
          <View
            style={[
              styles.senderPanel,
              {
                backgroundColor: colors.surface,
                borderColor: colors.border,
                shadowColor: colors.shadow,
              },
            ]}>
            {isLoadingSenders ? (
              <View style={styles.centerContainer}>
                <ActivityIndicator color={colors.primary} />
              </View>
            ) : senderError ? (
              <Text style={[styles.message, { color: colors.danger }]}>{senderError}</Text>
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
                      onPress={() => {
                        if (sender.id !== selectedSenderId) {
                          setWays([]);
                          setIsLoadingWays(true);
                          setSelectedSenderId(sender.id);
                        }
                      }}
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
              <Text style={[styles.message, { color: colors.muted }]}>
                ချိတ်ဆက်ထားသော Sender မရှိပါ။
              </Text>
            )}
          </View>

          {/* Search Bar */}
          <TextInput
            accessibilityLabel="Search ways"
            placeholder="🔍 ID၊ ဖုန်း၊ လိပ်စာ၊ status ဖြင့်ရှာပါ..."
            placeholderTextColor={colors.muted}
            returnKeyType="search"
            value={searchText}
            onChangeText={setSearchText}
            style={[
              styles.searchInput,
              {
                backgroundColor: colors.surface,
                borderColor: colors.border,
                color: colors.text,
              },
            ]}
          />

          <View
            style={[
              styles.filterPanel,
              { backgroundColor: colors.surface, borderColor: colors.border },
            ]}>
            <View
              style={[
                styles.filterHeader,
                { marginBottom: isFilterExpanded ? 10 : 0 },
              ]}>
              <Pressable
                accessibilityRole="button"
                accessibilityLabel={isFilterExpanded ? 'Collapse ways filters' : 'Expand ways filters'}
                accessibilityState={{ expanded: isFilterExpanded }}
                onPress={() => setIsFilterExpanded((expanded) => !expanded)}
                style={styles.filterToggle}>
                <View style={styles.filterHeaderCopy}>
                  <Text style={[styles.filterTitle, { color: colors.text }]}>
                    Ways စစ်ထုတ်ရန်
                    {!isFilterExpanded && activeFilterCount > 0
                      ? ` · ${activeFilterCount} ခု`
                      : ''}
                  </Text>
                  {isFilterExpanded && (
                    <Text style={[styles.filterSubtitle, { color: colors.muted }]}>
                      Received date၊ Location နှင့် Status
                    </Text>
                  )}
                </View>
                <View style={[styles.filterToggleIcon, { backgroundColor: colors.primarySoft }]}>
                  <Text style={[styles.filterToggleIconText, { color: colors.primary }]}>
                    {isFilterExpanded ? '-' : '+'}
                  </Text>
                </View>
              </Pressable>
              {hasFilterInput && (
                <Pressable
                  accessibilityRole="button"
                  style={[styles.clearFiltersButton, { backgroundColor: colors.primarySoft }]}
                  onPress={() => {
                    setReceivedDateStartInput('');
                    setReceivedDateEndInput('');
                    setReceiverLocationInput('');
                    setStatusInput('');
                  }}>
                  <Text style={[styles.clearFilters, { color: colors.primary }]}>ရှင်းမည်</Text>
                </Pressable>
              )}
            </View>
            {isFilterExpanded && (
              <View style={styles.filterBody}>
                <Text style={[styles.filterSectionLabel, { color: colors.primary }]}>
                  RECEIVED DATE
                </Text>
                <View style={styles.dateRangeFields}>
                  <View style={styles.filterField}>
                    <Text style={[styles.filterFieldLabel, { color: colors.muted }]}>
                      စတင်ရက်
                    </Text>
                    <TextInput
                      accessibilityLabel="Received date start"
                      keyboardType="numbers-and-punctuation"
                      placeholder="YYYY-MM-DD"
                      placeholderTextColor={colors.muted}
                      returnKeyType="done"
                      value={receivedDateStartInput}
                      onChangeText={setReceivedDateStartInput}
                      style={[
                        styles.filterInput,
                        {
                          backgroundColor: colors.background,
                          borderColor: colors.border,
                          color: colors.text,
                        },
                      ]}
                    />
                  </View>
                  <Text style={[styles.dateRangeSeparator, { color: colors.muted }]}>-</Text>
                  <View style={styles.filterField}>
                    <Text style={[styles.filterFieldLabel, { color: colors.muted }]}>
                      ပြီးဆုံးရက်
                    </Text>
                    <TextInput
                      accessibilityLabel="Received date end"
                      keyboardType="numbers-and-punctuation"
                      placeholder="YYYY-MM-DD"
                      placeholderTextColor={colors.muted}
                      returnKeyType="done"
                      value={receivedDateEndInput}
                      onChangeText={setReceivedDateEndInput}
                      style={[
                        styles.filterInput,
                        {
                          backgroundColor: colors.background,
                          borderColor: colors.border,
                          color: colors.text,
                        },
                      ]}
                    />
                  </View>
                </View>
                <View
                  style={[
                    styles.filterFields,
                    { flexDirection: responsive.isTablet ? 'row' : 'column' },
                  ]}>
                  <View style={styles.filterField}>
                    <Text style={[styles.filterFieldLabel, { color: colors.muted }]}>
                      Receiver location
                    </Text>
                    <TextInput
                      accessibilityLabel="Filter by receiver location"
                      placeholder="receiver_loc"
                      placeholderTextColor={colors.muted}
                      returnKeyType="done"
                      value={receiverLocationInput}
                      onChangeText={setReceiverLocationInput}
                      style={[
                        styles.filterInput,
                        {
                          backgroundColor: colors.background,
                          borderColor: colors.border,
                          color: colors.text,
                        },
                      ]}
                    />
                  </View>
                  <View style={styles.filterField}>
                    <Text style={[styles.filterFieldLabel, { color: colors.muted }]}>Status</Text>
                    <TextInput
                      accessibilityLabel="Filter by status"
                      placeholder="status"
                      placeholderTextColor={colors.muted}
                      returnKeyType="done"
                      value={statusInput}
                      onChangeText={setStatusInput}
                      style={[
                        styles.filterInput,
                        {
                          backgroundColor: colors.background,
                          borderColor: colors.border,
                          color: colors.text,
                        },
                      ]}
                    />
                  </View>
                </View>
                <Text
                  style={[
                    styles.filterHint,
                    { color: receivedDateError ? colors.danger : colors.muted },
                  ]}>
                  {receivedDateError ??
                    'စတင်ရက်နှင့် ပြီးဆုံးရက်ကို ထည့်ပါ။ ရွေးထားသော ရက်နှစ်ရက်လုံး ပါဝင်မည်။'}
                </Text>
              </View>
            )}
          </View>

          {/* Loading or Error State for Ways */}
          {isLoadingWays && ways.length === 0 ? (
            <View
              style={[
                styles.messageCard,
                { backgroundColor: colors.surface, borderColor: colors.border },
              ]}>
              <ActivityIndicator color={colors.primary} />
            </View>
          ) : waysError ? (
            <View
              style={[
                styles.messageCard,
                { backgroundColor: colors.surface, borderColor: colors.border },
              ]}>
              <Text style={[styles.message, { color: colors.danger }]}>{waysError}</Text>
            </View>
          ) : null}
        </View>
      }
      ListEmptyComponent={
        !isLoadingWays && !waysError && !senderError ? (
          <View
            style={[
              styles.messageCard,
              { backgroundColor: colors.surface, borderColor: colors.border },
            ]}>
            <Text style={[styles.emptyMessage, { color: colors.muted }]}>
              {searchTerm || hasFilterInput
                ? 'ရှာဖွေမှုနှင့် ကိုက်ညီသော ways မရှိပါ။'
                : 'ပြသရန် ways မရှိသေးပါ။'}
            </Text>
          </View>
        ) : undefined
      }
      ListFooterComponent={
        isLoadingMore ? (
          <View style={styles.footer}>
            <ActivityIndicator color={colors.primary} />
          </View>
        ) : loadMoreError ? (
          <Text style={[styles.loadMoreError, { color: colors.danger }]}>{loadMoreError}</Text>
        ) : undefined
      }
      ItemSeparatorComponent={() => <View style={{ height: 4 }} />}
    />
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    paddingTop: 12,
    paddingBottom: 40,
  },
  content: {
    width: '100%',
    maxWidth: 720,
    alignSelf: 'center',
    marginBottom: 12,
  },
  headerTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  title: {
    fontSize: 24,
    fontWeight: '800',
    letterSpacing: 0.3,
  },
  subtitle: {
    fontSize: 13,
    marginTop: 2,
    fontWeight: '500',
  },
  senderPanel: {
    minHeight: 48,
    justifyContent: 'center',
    borderWidth: 1,
    borderRadius: 12,
    paddingVertical: 6,
    paddingHorizontal: 8,
    marginTop: 8,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.04,
    shadowRadius: 10,
    elevation: 2,
  },
  centerContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
  },
  senderList: {
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 4,
  },
  senderOption: {
    height: 34,
    justifyContent: 'center',
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 12,
  },
  senderOptionText: {
    fontSize: 12,
    fontWeight: '700',
  },
  searchInput: {
    height: 42,
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 12,
    marginTop: 8,
    fontSize: 13,
  },
  filterPanel: {
    borderWidth: 1,
    borderRadius: 14,
    paddingVertical: 8,
    paddingHorizontal: 12,
    marginTop: 8,
  },
  filterHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 14,
    backgroundColor: 'transparent',
  },
  filterToggle: {
    flex: 1,
    minHeight: 36,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: 'transparent',
  },
  filterHeaderCopy: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  filterToggleIcon: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 8,
  },
  filterToggleIconText: {
    fontSize: 18,
    lineHeight: 22,
    fontWeight: '700',
  },
  filterBody: {
    backgroundColor: 'transparent',
  },
  filterTitle: {
    flexShrink: 1,
    fontSize: 14,
    fontWeight: '800',
  },
  filterSubtitle: {
    fontSize: 12,
    marginTop: 3,
  },
  clearFiltersButton: {
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 6,
  },
  clearFilters: {
    fontSize: 11,
    fontWeight: '700',
  },
  filterSectionLabel: {
    marginBottom: 8,
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 1,
  },
  dateRangeFields: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 8,
    backgroundColor: 'transparent',
  },
  dateRangeSeparator: {
    paddingBottom: 12,
    fontSize: 16,
    fontWeight: '600',
  },
  filterField: {
    flex: 1,
    minWidth: 0,
    backgroundColor: 'transparent',
  },
  filterFieldLabel: {
    marginBottom: 6,
    fontSize: 11,
    fontWeight: '600',
  },
  filterFields: {
    gap: 8,
    marginTop: 12,
    backgroundColor: 'transparent',
  },
  filterInput: {
    width: '100%',
    height: 44,
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 10,
    fontSize: 12,
  },
  filterHint: {
    marginTop: 10,
    fontSize: 12,
    lineHeight: 18,
  },
  messageCard: {
    minHeight: 64,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    marginTop: 12,
  },
  message: {
    fontSize: 14,
    lineHeight: 20,
    textAlign: 'center',
  },
  emptyMessage: {
    fontSize: 14,
    textAlign: 'center',
    fontWeight: '600',
  },
  footer: {
    paddingVertical: 20,
    alignItems: 'center',
  },
  loadMoreError: {
    paddingVertical: 16,
    fontSize: 13,
    textAlign: 'center',
    fontWeight: '600',
  },
  listItem: {
    width: '100%',
    maxWidth: 720,
    alignSelf: 'center',
    marginVertical: 4,
  },
});