import { useCallback, useEffect, useMemo, useState } from 'react';
import { getMessagesAction } from '@/actions/messages';
import { createClient } from '@/lib/supabase/client';
import type { Message } from '@/types/app';

export function useMessages(sessionId: string) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentSessionId, setCurrentSessionId] = useState(sessionId);
  const supabase = useMemo(() => createClient(), []);

  let currentMessages = messages;
  let currentLoading = loading;

  if (sessionId !== currentSessionId) {
    setCurrentSessionId(sessionId);
    setMessages([]);
    setLoading(true);
    currentMessages = [];
    currentLoading = true;
  }

  useEffect(() => {
    if (!sessionId || sessionId === 'new') return;

    let ignore = false;

    const fetchMessages = async () => {
      try {
        const data = await getMessagesAction(sessionId);

        if (!ignore) {
          setMessages(data);
        }
      } finally {
        if (!ignore) {
          setLoading(false);
        }
      }
    };

    fetchMessages();

    const channel = supabase
      .channel(`messages-${sessionId}`)
      .on<Message>(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
          filter: `session_id=eq.${sessionId}`,
        },
        (payload) => {
          setMessages((prev) => [...prev, payload.new]);
        }
      )
      .subscribe();

    return () => {
      ignore = true;
      supabase.removeChannel(channel);
    };
  }, [sessionId, supabase]);

  const refetch = useCallback(async () => {
    if (!sessionId || sessionId === 'new') return;

    const data = await getMessagesAction(sessionId);

    setMessages(data);
  }, [sessionId]);

  return { messages: currentMessages, loading: currentLoading, refetch };
}
