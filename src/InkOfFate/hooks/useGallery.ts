// Parlor wall — flatten every recent user's tattoos, sort newest-first
// across authors, cap at display. Follows the throttle-at-input rule
// (see feedback_throttle_at_input_not_output / note_wall_flatten_sweep).

import { useCallback, useEffect, useState } from 'react';
import {
  callAigramAPI,
  isInAigram,
  telegramId,
  type AigramResponse,
} from '@shared/runtime/bridge';
import { getGameUuid } from '@shared/runtime/game-id';
import type { InkOfFateSave, Tattoo, WallEntry } from '../types';

interface SaveRow {
  user_id: string;
  time?: string;
  resource_data?: string;
}

const DISPLAY_CAP = 24;

export interface UseGallery {
  entries: WallEntry[];
  loaded: boolean;
  refresh: () => void;
}

export function useGallery(): UseGallery {
  const [entries, setEntries] = useState<WallEntry[]>([]);
  const [loaded, setLoaded] = useState(false);
  const [nonce, setNonce] = useState(0);

  const refresh = useCallback(() => setNonce((n) => n + 1), []);

  useEffect(() => {
    const sessionId = getGameUuid();
    if (!isInAigram || !sessionId) {
      setLoaded(true);
      return;
    }
    let cancelled = false;
    (async () => {
      try {
        const res = await callAigramAPI<AigramResponse<SaveRow[]>>(
          `/note/aigram/ai/game/get/data/list?session_id=${encodeURIComponent(sessionId)}`,
          'GET',
        );
        const rows = Array.isArray(res?.data) ? res.data : [];

        // Flatten ALL tattoos from each user's save row (not just [0]).
        const pairs: Array<{ userId: string; tattoo: Tattoo }> = [];
        for (const row of rows) {
          if (!row.user_id || !row.resource_data) continue;
          try {
            const save = JSON.parse(row.resource_data) as InkOfFateSave;
            for (const t of save.tattoos || []) {
              if (t && t.imageUrl) {
                pairs.push({ userId: String(row.user_id), tattoo: t });
              }
            }
          } catch {
            /* skip corrupt row */
          }
        }
        pairs.sort((a, b) => (b.tattoo.createdAt ?? 0) - (a.tattoo.createdAt ?? 0));
        const limited = pairs.slice(0, DISPLAY_CAP);

        // Resolve each unique author's profile once.
        const uniqueIds = Array.from(new Set(limited.map((p) => p.userId)));
        const profileEntries = await Promise.all(
          uniqueIds.map(async (uid) => {
            try {
              const r = await callAigramAPI<
                AigramResponse<{ name?: string; head_url?: string }>
              >(
                `/note/telegram/user/get/info/by/telegram_id?telegram_id=${encodeURIComponent(uid)}`,
                'GET',
              );
              return [uid, r?.data ?? null] as const;
            } catch {
              return [uid, null] as const;
            }
          }),
        );
        const profileMap = new Map<string, { name?: string; head_url?: string } | null>(
          profileEntries,
        );

        if (cancelled) return;
        setEntries(
          limited.map(({ userId, tattoo }) => {
            const p = profileMap.get(userId) || null;
            return {
              userId,
              userName: p?.name,
              userAvatarUrl: p?.head_url,
              tattoo,
            };
          }),
        );
      } catch {
        if (!cancelled) setEntries([]);
      } finally {
        if (!cancelled) setLoaded(true);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [nonce]);

  return { entries, loaded, refresh };
}

export function isSelf(entry: WallEntry): boolean {
  return !!telegramId && String(entry.userId) === String(telegramId);
}
