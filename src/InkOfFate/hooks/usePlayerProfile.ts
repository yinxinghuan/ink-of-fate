// Fetch the current player's Aigram profile (name + head_url) so the
// studio can offer "Use my face" as a one-tap entry. Returns null when
// not inside Aigram or when the call fails.

import { useEffect, useState } from 'react';
import {
  callAigramAPI,
  isInAigram,
  telegramId,
  type AigramResponse,
} from '@shared/runtime/bridge';

export interface PlayerProfile {
  telegramId: string;
  name?: string;
  avatarUrl?: string;
}

export function usePlayerProfile(): PlayerProfile | null {
  const [profile, setProfile] = useState<PlayerProfile | null>(null);

  useEffect(() => {
    if (!isInAigram || !telegramId) return;
    let cancelled = false;
    (async () => {
      try {
        const res = await callAigramAPI<
          AigramResponse<{ name?: string; head_url?: string }>
        >(
          `/note/telegram/user/get/info/by/telegram_id?telegram_id=${encodeURIComponent(telegramId!)}`,
          'GET',
        );
        const d = res?.data ?? null;
        if (cancelled) return;
        if (d && (d.name || d.head_url)) {
          setProfile({
            telegramId: telegramId!,
            name: d.name,
            avatarUrl: d.head_url,
          });
        }
      } catch {
        /* leave null */
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  return profile;
}
