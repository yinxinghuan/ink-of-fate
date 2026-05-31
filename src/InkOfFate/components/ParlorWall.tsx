import { useState } from 'react';
import { isInAigram, openAigramProfile } from '@shared/runtime';
import { t } from '../i18n';
import { placementLabel, styleLabel } from '../utils/prompts';
import type { Tattoo, WallEntry } from '../types';

interface Props {
  entries: WallEntry[];
  mine: Tattoo[];
  loaded: boolean;
  onBack: () => void;
  onView: (entry: WallEntry) => void;
  onNew: () => void;
}

type Scope = 'all' | 'mine';

export default function ParlorWall({
  entries,
  mine,
  loaded,
  onBack,
  onView,
  onNew,
}: Props) {
  const [scope, setScope] = useState<Scope>('all');

  const mineEntries: WallEntry[] = mine.map((t) => ({
    userId: 'me',
    userName: undefined,
    userAvatarUrl: undefined,
    tattoo: t,
  }));

  // Optimistic merge for ALL view — useGameSave.persist() is debounced
  // ~1s and the cloud RTT adds another second or two, so a just-published
  // tattoo lives in `mine` (local mirror) for 1-3s before `entries` from
  // useGallery returns it. Without this merge, the user finishes the
  // verdict, taps "Tonight's Marked", and doesn't see their own publish
  // → "发表后的内容展示不全" bug. Dedupe by tattoo.id so the same entry
  // doesn't double-render once cloud sync catches up (same tattoo appears
  // as 'me' before sync and real telegram_id after).
  const allEntries: WallEntry[] = (() => {
    const seen = new Set(mineEntries.map((m) => m.tattoo.id));
    return [...mineEntries, ...entries.filter((e) => !seen.has(e.tattoo.id))]
      .sort((a, b) => (b.tattoo.createdAt ?? 0) - (a.tattoo.createdAt ?? 0));
  })();

  const list = scope === 'all' ? allEntries : mineEntries;
  const count = list.length;
  const visibleEmpty =
    loaded && list.length === 0
      ? scope === 'mine'
        ? t('wall_empty_mine')
        : t('wall_empty_all')
      : null;

  return (
    <div className="iof-wall">
      <header className="iof-wall__head">
        <button type="button" className="iof-wall__back" onPointerDown={onBack}>
          ← {t('wall_back')}
        </button>
        <div className="iof-wall__title">{t('wall_title')}</div>
        <div className="iof-wall__head-spacer" />
      </header>

      <div className="iof-wall__tabs" role="tablist">
        <button
          type="button"
          role="tab"
          aria-selected={scope === 'all'}
          className={
            'iof-wall__tab ' +
            (scope === 'all' ? 'iof-wall__tab--active' : '')
          }
          onPointerDown={() => setScope('all')}
        >
          {t('wall_tab_all')}
        </button>
        <button
          type="button"
          role="tab"
          aria-selected={scope === 'mine'}
          className={
            'iof-wall__tab ' +
            (scope === 'mine' ? 'iof-wall__tab--active' : '')
          }
          onPointerDown={() => setScope('mine')}
        >
          {t('wall_tab_mine')}
          {mine.length > 0 && (
            <span className="iof-wall__tab-badge">{mine.length}</span>
          )}
        </button>
      </div>

      {loaded && count > 0 && (
        <div className="iof-wall__count">
          {count} {scope === 'mine' ? t('wall_count_mine') : t('wall_count_all')}
        </div>
      )}

      {!loaded && <div className="iof-wall__loading">{t('wall_loading')}</div>}
      {visibleEmpty && <div className="iof-wall__empty">{visibleEmpty}</div>}

      <div className="iof-wall__grid">
        {list.map((e, i) => (
          <button
            key={`${e.userId}-${e.tattoo.id}`}
            className="iof-wall__card"
            type="button"
            // onClick (not onPointerDown) — the rack scrolls vertically and
            // onPointerDown fires before the browser disambiguates tap from
            // scroll, so swiping over a card would open it mid-scroll.
            // See feedback_onclick_for_scrollable_lists.md.
            onClick={() => onView(e)}
          >
            <div className="iof-wall__card-num">{String(i + 1).padStart(2, '0')}</div>
            <div className="iof-wall__card-photo">
              <img src={e.tattoo.imageUrl} alt={e.tattoo.reading.tattoo_description} />
            </div>
            <div className="iof-wall__card-body">
              <div className="iof-wall__card-headline">{e.tattoo.reading.headline}</div>
              <div className="iof-wall__card-tags">
                <span className="iof-meta-chip">{styleLabel(e.tattoo.reading.style)}</span>
                <span className="iof-meta-chip">{placementLabel(e.tattoo.reading.placement)}</span>
              </div>
              <div className="iof-wall__card-foot">
                {e.userId === 'me' ? (
                  <span className="iof-wall__card-name iof-wall__card-name--me">YOU</span>
                ) : (
                  <button
                    type="button"
                    className="iof-wall__author-chip"
                    // Tap the author chip → opens that user's Aigram
                    // profile. stopPropagation so the parent card's
                    // onClick (open verdict detail) doesn't also fire.
                    // See cross-user-profile-tap skill.
                    onClick={(ev) => {
                      ev.stopPropagation();
                      if (isInAigram) openAigramProfile(e.userId);
                    }}
                    disabled={!isInAigram}
                    aria-label={`Open ${e.userName || 'user'}'s profile`}
                  >
                    <span className="iof-wall__card-avatar" aria-hidden>
                      {e.userAvatarUrl ? (
                        <img src={e.userAvatarUrl} alt="" draggable={false} />
                      ) : (
                        <span className="iof-wall__card-avatar-letter">
                          {(e.userName || '?')[0]?.toUpperCase()}
                        </span>
                      )}
                    </span>
                    <span className="iof-wall__card-name">{e.userName || '·'}</span>
                  </button>
                )}
                <span className="iof-wall__card-ticket">{e.tattoo.ticketNumber}</span>
              </div>
            </div>
          </button>
        ))}
      </div>

      <button
        type="button"
        className="iof-wall__fab"
        onPointerDown={onNew}
      >
        + {t('wall_fab')}
      </button>
    </div>
  );
}
