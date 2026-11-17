import { getSupabaseClient } from '@/lib/supabase';

export type SenderOption = {
  id: string | number;
  name: string;
};

export async function getSendersForUser(userId: string): Promise<SenderOption[]> {
  const supabase = getSupabaseClient();
  const { data: userSenders, error: userSendersError } = await supabase
    .from('user_senders')
    .select('sender_id')
    .eq('user_id', userId);

  if (userSendersError) {
    throw userSendersError;
  }

  const senderIds = [...new Set(userSenders.map(({ sender_id }) => sender_id))];
  if (senderIds.length === 0) {
    return [];
  }

  const { data: senders, error: sendersError } = await supabase
    .from('senders')
    .select('id, name')
    .in('id', senderIds);

  if (sendersError) {
    throw sendersError;
  }

  return senders
    .filter(
      ({ id, name }) =>
        (typeof id === 'string' || typeof id === 'number') &&
        typeof name === 'string' &&
        name.trim().length > 0
    )
    .map(({ id, name }) => ({ id, name: name.trim() }));
}
