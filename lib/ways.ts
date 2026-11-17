import { getSupabaseClient } from '@/lib/supabase';

export type Way = Record<string, unknown>;

export type WayFilters = {
  receivedDateFrom?: string;
  receivedDateTo?: string;
  receiverLocation?: string;
  status?: string;
};

export function isValidReceivedDate(value: string): boolean {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    return false;
  }

  const date = new Date(`${value}T00:00:00.000Z`);
  return !Number.isNaN(date.getTime()) && date.toISOString().slice(0, 10) === value;
}

export async function getLatestWays(senderId: string | number): Promise<Way[]> {
  const { data, error } = await getSupabaseClient()
    .from('orders')
    .select('*')
    .eq('sender_id', senderId)
    .order('created_at', { ascending: false })
    .limit(10);

  if (error) {
    throw error;
  }

  return data ?? [];
}

export async function getWaysPage(
  senderId: string | number,
  offset: number,
  pageSize: number,
  searchTerm = '',
  filters: WayFilters = {}
): Promise<Way[]> {
  let query = getSupabaseClient()
    .from('orders')
    .select('*')
    .eq('sender_id', senderId)
    .order('created_at', { ascending: false });

  const sanitizeTerm = (value: string) =>
    value.replace(/[,*%_()\\'"]/g, ' ').replace(/\s+/g, ' ').trim();
  const term = sanitizeTerm(searchTerm.trim());
  if (term) {
    const pattern = `*${term}*`;
    const searchFilters = [
      `receiver_phone.ilike.${pattern}`,
      `receiver_loc.ilike.${pattern}`,
      `receiver_address.ilike.${pattern}`,
      `status.ilike.${pattern}`,
      `fee_type.ilike.${pattern}`,
    ];

    if (/^\d+(?:\.\d+)?$/.test(term)) {
      searchFilters.push(
        `item_id.eq.${term}`,
        `cod_amount.eq.${term}`,
        `deli_fee.eq.${term}`,
        `total_amount.eq.${term}`
      );
    }

    query = query.or(searchFilters.join(','));
  }

  const { receivedDateFrom, receivedDateTo } = filters;
  if (receivedDateFrom && !isValidReceivedDate(receivedDateFrom)) {
    throw new Error('received_date start must use YYYY-MM-DD format.');
  }
  if (receivedDateTo && !isValidReceivedDate(receivedDateTo)) {
    throw new Error('received_date end must use YYYY-MM-DD format.');
  }
  if (receivedDateFrom && receivedDateTo && receivedDateFrom > receivedDateTo) {
    throw new Error('received_date start cannot be after received_date end.');
  }

  if (receivedDateFrom) {
    query = query.gte('received_date', receivedDateFrom);
  }
  if (receivedDateTo) {
    const nextDay = new Date(`${receivedDateTo}T00:00:00.000Z`);
    nextDay.setUTCDate(nextDay.getUTCDate() + 1);
    query = query.lt('received_date', nextDay.toISOString().slice(0, 10));
  }

  const receiverLocation = sanitizeTerm(filters.receiverLocation?.trim() ?? '');
  if (receiverLocation) {
    query = query.ilike('receiver_loc', `%${receiverLocation}%`);
  }

  const status = sanitizeTerm(filters.status?.trim() ?? '');
  if (status) {
    query = query.ilike('status', `%${status}%`);
  }

  const { data, error } = await query.range(offset, offset + pageSize - 1);

  if (error) {
    throw error;
  }

  return data ?? [];
}
