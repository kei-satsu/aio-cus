import { useState } from 'react';
import { Image, Modal, Pressable, StyleSheet, View } from 'react-native';

import { Text } from '@/components/Themed';
import { useResponsiveLayout } from '@/components/useResponsiveLayout';
import type { Way } from '@/lib/ways';

type WayRowColors = {
  surface: string;
  text: string;
  muted: string;
  border: string;
  primary: string;
  primarySoft: string;
  shadow: string;
};

const idKeys = ['item_id'];
const detailKeys = ['customer_name', 'recipient_name', 'receiver_name', 'name', 'phone', 'phone_number'];

function getDisplayValue(value: unknown): string | null {
  if (typeof value === 'string' || typeof value === 'number') {
    const displayValue = String(value).trim();
    return displayValue.length > 0 ? displayValue : null;
  }
  return null;
}

function getWayValue(way: Way, keys: string[]): string | null {
  for (const key of keys) {
    const value = getDisplayValue(way[key]);
    if (value) {
      return value;
    }
  }
  return null;
}

export function WayRow({
  way,
  index,
  colors,
  variant = 'card',
}: {
  way: Way;
  index: number;
  colors: WayRowColors;
  variant?: 'plain' | 'card';
}) {
  const id = getWayValue(way, idKeys);
  const detail = getWayValue(way, detailKeys);
  const receiverAddress = getDisplayValue(way.receiver_address);
  const receiverPhone = getDisplayValue(way.receiver_phone);
  const receiverLocation = getDisplayValue(way.receiver_loc);
  const imageUrl = getDisplayValue(way.image_url);
  const status = getDisplayValue(way.status);
  const normalizedStatus = status?.toLowerCase();
  const statusLabel = status
    ? normalizedStatus === 'at office'
      ? 'Confirmed'
      : normalizedStatus === 'delivered' || normalizedStatus === 'settled'
        ? 'Completed'
        : normalizedStatus === 'returned'
          ? 'Retruned'
        : 'Processing'
    : null;
  const createdAt = getDisplayValue(way.created_at);
  const timestamp = createdAt ? new Date(createdAt) : null;
  const date = timestamp && !Number.isNaN(timestamp.getTime())
    ? timestamp.toLocaleString()
    : null;

  const codAmount = getDisplayValue(way.cod_amount);
  const deliFee = getDisplayValue(way.deli_fee);
  const feeType = getDisplayValue(way.fee_type);
  const totalAmount = getDisplayValue(way.total_amount);

  const [isPreviewVisible, setIsPreviewVisible] = useState(false);
  const { isCompact } = useResponsiveLayout();

  return (
    <View
      style={[
        styles.rowContainer,
        variant === 'card'
          ? [
              styles.card,
              {
                backgroundColor: colors.surface,
                borderColor: colors.border,
                shadowColor: colors.shadow,
                paddingHorizontal: isCompact ? 12 : 16,
                paddingVertical: isCompact ? 12 : 16,
              },
            ]
          : [
              styles.plainRow,
              index > 0 && {
                borderTopColor: colors.border,
                borderTopWidth: StyleSheet.hairlineWidth,
              },
            ],
      ]}>
      
      {/* Top Header: ID & Status Pill */}
      <View style={styles.headerRow}>
        <View style={styles.idContainer}>
          <View style={[styles.idIndicator, { backgroundColor: colors.primary }]} />
          <Text style={[styles.title, { color: colors.text }]} numberOfLines={1}>
            {id ?? `#${index + 1}`}
          </Text>
        </View>
        {receiverLocation && (
          <View
            accessibilityLabel={`Location: ${receiverLocation}`}
            style={[
              styles.locationBadge,
              { backgroundColor: colors.primarySoft, borderColor: colors.border },
            ]}>
            <Text
              style={[styles.locationBadgeText, { color: colors.primary }]}
              numberOfLines={1}
              ellipsizeMode="tail">
              📍 {receiverLocation}
            </Text>
          </View>
        )}
        {statusLabel && (
          <View style={[styles.statusPill, { backgroundColor: colors.primarySoft }]}>
            <Text style={[styles.statusText, { color: colors.primary }]}>{statusLabel}</Text>
          </View>
        )}
      </View>

      {/* Main Content Body with Thumbnail on Left and Details on Right */}
      <View style={styles.mainContentRow}>
        {/* Thumbnail Image at the Front */}
        {imageUrl && (
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={`View image for way ${id ?? index + 1}`}
            onPress={() => setIsPreviewVisible(true)}
            style={({ pressed }) => [
              styles.thumbnailButton,
              {
                borderColor: colors.border,
                opacity: pressed ? 0.85 : 1,
                width: isCompact ? 60 : 72,
                height: isCompact ? 60 : 72,
              },
            ]}>
            <Image source={{ uri: imageUrl }} resizeMode="cover" style={styles.thumbnail} />
          </Pressable>
        )}

        {/* Details Information */}
        <View style={styles.detailsContainer}>
          {detail && (
            <Text style={[styles.customerName, { color: colors.text }]} numberOfLines={1}>
              {detail}
            </Text>
          )}

          {receiverPhone && (
            <Text style={[styles.infoText, { color: colors.muted }]} numberOfLines={1}>
              <Text style={{ fontWeight: '600', color: colors.text }}>{receiverPhone}</Text>
            </Text>
          )}

          {receiverAddress && (
            <Text style={[styles.infoText, { color: colors.muted }]} numberOfLines={2}>
              {receiverAddress}
            </Text>
          )}

        </View>
      </View>

      {/* Financial Summary Box */}
      {(codAmount || deliFee || totalAmount) && (
        <View
          style={[
            styles.financeBox,
            {
              backgroundColor: colors.primarySoft + '30',
              borderColor: colors.border,
              gap: isCompact ? 8 : 12,
              padding: isCompact ? 8 : 10,
            },
          ]}>
          {codAmount && (
            <View style={[styles.financeItem, { minWidth: isCompact ? '40%' : '22%' }]}>
              <Text style={[styles.financeLabel, { color: colors.muted }]}>COD</Text>
              <Text style={[styles.financeValue, { color: colors.text }]}>{codAmount}</Text>
            </View>
          )}
          {deliFee && (
            <View style={[styles.financeItem, { minWidth: isCompact ? '40%' : '22%' }]}>
              <Text style={[styles.financeLabel, { color: colors.muted }]}>Deli Fee</Text>
              <Text style={[styles.financeValue, { color: colors.text }]}>{deliFee}</Text>
            </View>
          )}
          {feeType && (
            <View style={[styles.financeItem, { minWidth: isCompact ? '40%' : '22%' }]}>
              <Text style={[styles.financeLabel, { color: colors.muted }]}>Fee Type</Text>
              <Text style={[styles.financeValue, { color: colors.text }]}>{feeType}</Text>
            </View>
          )}
          {totalAmount && (
            <View style={[styles.financeItem, styles.totalItem, { minWidth: isCompact ? '40%' : '22%' }]}>
              <Text style={[styles.financeLabel, { color: colors.primary, fontWeight: '700' }]}>Total</Text>
              <Text style={[styles.financeValue, { color: colors.primary, fontWeight: '800' }]}>{totalAmount}</Text>
            </View>
          )}
        </View>
      )}

      {/* Footer: Date */}
      {date && (
        <View style={styles.footerRow}>
          <Text style={[styles.dateText, { color: colors.muted }]} numberOfLines={1}>
            🕒 {date}
          </Text>
        </View>
      )}

      {/* Fullscreen Image Preview Modal */}
      {imageUrl && (
        <Modal
          visible={isPreviewVisible}
          transparent
          animationType="fade"
          onRequestClose={() => setIsPreviewVisible(false)}>
          <View style={styles.previewBackdrop}>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Close image preview"
              onPress={() => setIsPreviewVisible(false)}
              style={styles.previewDismissArea}
            />
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Close image preview"
              onPress={() => setIsPreviewVisible(false)}
              style={styles.previewImageButton}>
              <Image
                accessibilityLabel={`Way ${id ?? index + 1} image preview`}
                source={{ uri: imageUrl }}
                resizeMode="contain"
                style={styles.previewImage}
              />
            </Pressable>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Close image preview"
              onPress={() => setIsPreviewVisible(false)}
              style={styles.previewCloseButton}>
              <Text style={styles.previewCloseText}>✕</Text>
            </Pressable>
          </View>
        </Modal>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  rowContainer: {
    marginVertical: 6,
  },
  plainRow: {
    paddingVertical: 14,
    paddingHorizontal: 4,
  },
  card: {
    borderWidth: 1,
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 16,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.06,
    shadowRadius: 16,
    elevation: 3,
  },
  headerRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 7,
    marginBottom: 10,
  },
  idContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flex: 1,
    minWidth: 120,
    marginRight: 0,
  },
  idIndicator: {
    width: 6,
    height: 18,
    borderRadius: 3,
  },
  title: {
    fontSize: 17,
    fontWeight: '800',
    letterSpacing: 0.3,
  },
  statusPill: {
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  mainContentRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
    marginTop: 4,
  },
  thumbnailButton: {
    borderWidth: 1,
    borderRadius: 14,
    overflow: 'hidden',
    flexShrink: 0,
  },
  thumbnail: {
    width: '100%',
    height: '100%',
  },
  detailsContainer: {
    flex: 1,
    minWidth: 0,
    gap: 4,
  },
  customerName: {
    fontSize: 15,
    fontWeight: '700',
    
  },
  infoText: {
    fontSize: 13,
    lineHeight: 23,
  },
  locationBadge: {
    maxWidth: '35%',
    flexShrink: 1,
    borderWidth: 1,
    borderRadius: 9,
    paddingHorizontal: 7,
    paddingVertical: 4,
  },
  locationBadgeText: {
    fontSize: 11,
    lineHeight: 15,
    fontWeight: '600',
  },
  financeBox: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    borderWidth: 1,
    borderRadius: 12,
    padding: 10,
    marginTop: 12,
    gap: 12,
    justifyContent: 'space-between',
  },
  financeItem: {
    minWidth: '22%',
    flex: 1,
  },
  totalItem: {
    borderLeftWidth: 1,
    borderLeftColor: 'rgba(0,0,0,0.06)',
    paddingLeft: 8,
  },
  financeLabel: {
    fontSize: 10,
    fontWeight: '600',
    textTransform: 'uppercase',
    marginBottom: 2,
  },
  financeValue: {
    fontSize: 13,
    fontWeight: '700',
  },
  footerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-start',
    marginTop: 10,
    paddingTop: 8,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: 'rgba(150, 150, 150, 0.15)',
  },
  dateText: {
    fontSize: 11,
    fontWeight: '500',
  },
  previewBackdrop: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.92)',
    padding: 20,
  },
  previewDismissArea: {
    position: 'absolute',
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
  },
  previewImageButton: {
    width: '100%',
    height: '82%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  previewImage: {
    width: '100%',
    height: '100%',
  },
  previewCloseButton: {
    position: 'absolute',
    top: 48,
    right: 20,
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.16)',
  },
  previewCloseText: {
    color: '#FFFFFF',
    fontSize: 22,
    fontWeight: '600',
  },
});