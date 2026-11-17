import { getSupabaseClient } from '@/lib/supabase';

export type SenderOrderStats = {
  total: number;
  delivered: number;
  returned: number;
};

export async function getSenderOrderStats(
  senderId: string | number
): Promise<SenderOrderStats> {
  const { data, error } = await getSupabaseClient().rpc('get_sender_order_stats', {
    p_sender_id: String(senderId),
  });

  if (error) {
    throw error;
  }

  const row = data?.[0];
  if (!row) {
    throw new Error('The sender order stats RPC returned no result.');
  }

  const stats = {
    total: Number(row.total),
    delivered: Number(row.delivered),
    returned: Number(row.returned),
  };
  if (Object.values(stats).some((count) => !Number.isFinite(count) || count < 0)) {
    throw new Error('The sender order stats RPC returned invalid counts.');
  }

  return stats;
}
