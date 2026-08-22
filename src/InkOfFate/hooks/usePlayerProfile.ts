// Fetch the current player's Aigram profile (name + head_url) so the
// studio can offer "Use my face" as a one-tap entry. Returns null when
// not inside Aigram or when the call fails.

import { useEffect, useState } from 'react';
import {
  callAigramAPI,
  type AigramResponse,
} from '@shared/runtime/bridge';
import { waitForAigramIdentity } from '@shared/runtime/identity-ready';

export interface PlayerProfile {
  telegramId: string;
  name?: string;
  avatarUrl?: string;
}

export function usePlayerProfile(): PlayerProfile | null {
  const [profile, setProfile] = useState<PlayerProfile | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const telegramId = await waitForAigramIdentity();
      if (cancelled || !telegramId) return;
      try {
        const res = await callAigramAPI<
          AigramResponse<{ name?: string; head_url?: string }>
        >(
          `/note/telegram/user/get/info/by/telegram_id?telegram_id=${encodeURIComponent(telegramId)}`,
          'GET',
        );
        const d = res?.data ?? null;
        if (cancelled) return;
        if (d && (d.name || d.head_url)) {
          setProfile({
            telegramId,
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
