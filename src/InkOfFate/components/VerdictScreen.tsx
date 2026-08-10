import { useEffect, useState } from 'react';
import { isInAigramNow, openAigramProfile } from '@shared/runtime';
import {
  threadFor,
  timeAgo,
  cleanText,
  MAX_LEN,
  type GuestMessage,
} from '@shared/social/guestbook';
import { t, getLocale } from '../i18n';
import { placementLabel, styleLabel } from '../utils/prompts';
import type { Tattoo } from '../types';

const ALTERU_APP_URL = 'https://apps.apple.com/app/id6769646546';

interface Author {
  userId: string;
  userName?: string;
  userAvatarUrl?: string;
}

interface Props {
  tattoo: Tattoo;
  viewMode: 'booking' | 'gallery';
  shareLabel?: string;
  shareDisabled?: boolean;
  onNew: () => void;
  onWall: () => void;
  onShare?: () => void;
  author?: Author;
  /** Best-effort guestbook notes grouped by tattoo id (from the wall fetch). */
  messagesByTarget?: Map<string, GuestMessage[]>;
  /** The viewer's own outgoing notes (local mirror) for instant echo. */
  myMessages?: GuestMessage[];
  /** The viewer's telegram id (to render self notes as "you"). */
  myUserId?: string;
  /** Send a note on this tattoo. */
  onSendNote?: (artifactId: string, text: string) => void;
}

const TONE_LABEL_EN: Record<string, string> = {
  intense: 'INTENSE',
  smirk: 'SMIRK',
  squint: 'SQUINT',
  shrug: 'SHRUG',
};

export default function VerdictScreen({
  tattoo,
  viewMode,
  shareLabel,
  shareDisabled,
  onNew,
  onWall,
  onShare,
  author,
  messagesByTarget,
  myMessages,
  myUserId,
  onSendNote,
}: Props) {
  const { reading } = tattoo;
  const [typed, setTyped] = useState('');
  const [skipped, setSkipped] = useState(false);
  const [showBefore, setShowBefore] = useState(false);
  const [readingOpen, setReadingOpen] = useState(false);
  const [readingTouched, setReadingTouched] = useState(false);
  const [draft, setDraft] = useState('');

  const lang = getLocale();
  const thread =
    viewMode === 'gallery'
      ? threadFor(tattoo.id, messagesByTarget ?? new Map(), myMessages, myUserId)
      : [];

  const submitNote = () => {
    const clean = cleanText(draft);
    if (!clean || !onSendNote) return;
    onSendNote(tattoo.id, clean);
    setDraft('');
  };

  useEffect(() => {
    setTyped('');
    setSkipped(false);
    setShowBefore(false);
    setReadingOpen(false);
    setReadingTouched(false);
    setDraft('');
  }, [reading.meaning]);

  useEffect(() => {
    if (!readingOpen || !readingTouched) return;
    if (typed.length >= reading.meaning.length) return;
    const target = reading.meaning;
    let i = typed.length;
    const id = setInterval(() => {
      i++;
      setTyped(target.slice(0, i));
      if (i >= target.length) clearInterval(id);
    }, 14);
    return () => clearInterval(id);
  }, [readingOpen, readingTouched, reading.meaning, typed.length]);

  const readingText = skipped ? reading.meaning : typed;
  const skipTypewriter = () => {
    if (typed.length < reading.meaning.length) setSkipped(true);
  };
  const toggleReading = () => {
    setReadingTouched(true);
    setReadingOpen((o) => !o);
  };

  const mainUrl = showBefore ? tattoo.selfieUrl : tattoo.imageUrl;
  const insetUrl = showBefore ? tattoo.imageUrl : tattoo.selfieUrl;
  const mainLabel = showBefore ? t('result_before') : t('result_after');
  const insetLabel = showBefore ? t('result_after') : t('result_before');

  const swap = () => setShowBefore((b) => !b);

  return (
    <div className="iof-verdict">
      {/* ───── Hero photo + before/after polaroid swap ───── */}
      <div className="iof-verdict__hero">
        <div
          className="iof-verdict__photo"
          // onClick (not onPointerDown) — verdict page scrolls; pointerdown
          // on the photo would swap before the user could scroll past it.
          onClick={swap}
          role="button"
          tabIndex={-1}
        >
          <img src={mainUrl} alt={reading.tattoo_description} />
          <div className="iof-verdict__photo-stamp">
            INK OF FATE · {tattoo.signedDate}
          </div>
          <div className="iof-verdict__photo-tag">{mainLabel}</div>
          <div className="iof-verdict__attachment" aria-hidden>
            <img src={insetUrl} alt="" />
            <div className="iof-verdict__attachment-label">{insetLabel}</div>
          </div>
          <div className="iof-verdict__swap-hint">{t('result_tap_to_swap')}</div>
        </div>
      </div>

      {/* ───── Title block: ticket label + headline + meta chips ───── */}
      <div className="iof-verdict__title-block">
        <div className="iof-verdict__ticket-line">
          {tattoo.ticketNumber} · {tattoo.signedDate}
        </div>
        {author && viewMode === 'gallery' && (
          <button
            type="button"
            className="iof-verdict__author-chip"
            // Tap author chip → opens that user's Aigram profile.
            // See cross-user-profile-tap skill.
            onClick={(ev) => {
              ev.stopPropagation();
              if (isInAigramNow()) openAigramProfile(author.userId);
            }}
            disabled={!isInAigramNow()}
            aria-label={`Open ${author.userName || 'user'}'s profile`}
          >
            <span className="iof-verdict__author-label">— marked:</span>
            <span className="iof-verdict__author-avatar" aria-hidden>
              {author.userAvatarUrl ? (
                <img src={author.userAvatarUrl} alt="" draggable={false} />
              ) : (
                <span className="iof-verdict__author-letter">
                  {(author.userName || '?')[0]?.toUpperCase()}
                </span>
              )}
            </span>
            <span className="iof-verdict__author-name">{author.userName || '·'}</span>
          </button>
        )}
        <h1 className="iof-verdict__headline">{reading.headline}</h1>
        <div className="iof-verdict__meta-chips">
          <span className="iof-meta-chip">{styleLabel(reading.style)}</span>
          <span className="iof-meta-chip">{placementLabel(reading.placement)}</span>
          <span className="iof-meta-chip iof-meta-chip--accent">
            {TONE_LABEL_EN[reading.verdict_tone] ?? reading.verdict_tone}
          </span>
        </div>
      </div>

      {/* ───── Card 01 — the artist's spoken quip + matched face ───── */}
      <div className="iof-verdict__card">
        <div className="iof-verdict__card-head">
          <span className="iof-verdict__card-num">01</span>
          <span className="iof-verdict__card-title">{t('result_artist_says')}</span>
        </div>
        <div className="iof-verdict__artist-row">
          <div className="iof-verdict__artist-face" aria-hidden>
            <img
              src={
                import.meta.env.BASE_URL +
                `scenes/artist_${reading.verdict_tone}.jpg`
              }
              alt=""
            />
          </div>
          <div className="iof-verdict__quip">
            <span className="iof-verdict__quote">“</span>
            {reading.artist_quip}
            <span className="iof-verdict__quote">”</span>
          </div>
        </div>
      </div>

      {/* ───── Card 02 — the long reading, collapsed by default ───── */}
      <div
        className={
          'iof-verdict__card iof-verdict__card--toggle ' +
          (readingOpen ? 'iof-verdict__card--open' : '')
        }
      >
        <button
          type="button"
          className="iof-verdict__card-head iof-verdict__card-head--toggle"
          onPointerDown={toggleReading}
        >
          <span className="iof-verdict__card-num">02</span>
          <span className="iof-verdict__card-title">{t('result_meaning')}</span>
          <span className="iof-verdict__card-state">
            {readingOpen ? t('result_collapse') : t('result_read_more')}
          </span>
          <span className="iof-verdict__card-chevron" aria-hidden>
            {readingOpen ? '▾' : '▸'}
          </span>
        </button>
        {readingOpen && (
          <div
            className="iof-verdict__reading"
            // onClick (not onPointerDown) — reading sits inside the
            // scrollable verdict page; pointerdown would skip the
            // typewriter mid-scroll. See feedback_onclick_for_scrollable_lists.md.
            onClick={skipTypewriter}
            role="button"
            tabIndex={-1}
          >
            {readingText || ' '}
          </div>
        )}
      </div>

      {/* ───── Invoice strip — the bill ───── */}
      <div className="iof-verdict__invoice-line">
        <span className="iof-verdict__invoice-label">INVOICE</span>
        <span className="iof-verdict__invoice-amount">$200</span>
        <span className="iof-verdict__invoice-tail">{t('result_invoice_tail')}</span>
      </div>

      {/* ───── Guestbook — public notes on this tattoo (gallery only) ───── */}
      {viewMode === 'gallery' && (
        <div className="iof-verdict__card iof-notes">
          <div className="iof-verdict__card-head">
            <span className="iof-verdict__card-num">03</span>
            <span className="iof-verdict__card-title">{t('notes_title')}</span>
            {thread.length > 0 && (
              <span className="iof-notes__count">{thread.length}</span>
            )}
          </div>

          {thread.length === 0 ? (
            <div className="iof-notes__empty">{t('notes_empty')}</div>
          ) : (
            <ul className="iof-notes__list">
              {thread.map((m) => {
                const isMine =
                  (!!myUserId && m.fromUserId === myUserId) ||
                  (!m.fromUserId && !!myMessages?.some((x) => x.id === m.id));
                const name = isMine ? t('notes_you') : m.userName || '·';
                return (
                  <li key={m.id} className="iof-notes__item">
                    {isMine ? (
                      <span className="iof-notes__who iof-notes__who--me" aria-hidden>
                        <span className="iof-notes__avatar iof-notes__avatar--me">
                          {name[0]?.toUpperCase()}
                        </span>
                        <span className="iof-notes__name iof-notes__name--me">
                          {name}
                        </span>
                      </span>
                    ) : (
                      <button
                        type="button"
                        className="iof-notes__who"
                        // onClick + stopPropagation — note rows live inside
                        // the scrollable verdict page. See scroll-vs-click.
                        onClick={(ev) => {
                          ev.stopPropagation();
                          if (isInAigramNow() && m.fromUserId)
                            openAigramProfile(m.fromUserId);
                        }}
                        disabled={!isInAigramNow() || !m.fromUserId}
                        aria-label={`Open ${m.userName || 'user'}'s profile`}
                      >
                        <span className="iof-notes__avatar" aria-hidden>
                          {m.userAvatarUrl ? (
                            <img src={m.userAvatarUrl} alt="" draggable={false} />
                          ) : (
                            (m.userName || '?')[0]?.toUpperCase()
                          )}
                        </span>
                        <span className="iof-notes__name">{name}</span>
                      </button>
                    )}
                    <span className="iof-notes__text">{m.text}</span>
                    <span className="iof-notes__time">{timeAgo(m.ts, lang)}</span>
                  </li>
                );
              })}
            </ul>
          )}

          {isInAigramNow() ? (
            <div className="iof-notes__compose">
              <input
                className="iof-notes__input"
                type="text"
                value={draft}
                maxLength={MAX_LEN}
                placeholder={t('notes_placeholder')}
                onChange={(e) => setDraft(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') submitNote();
                }}
              />
              <button
                type="button"
                className="iof-notes__send"
                onPointerDown={submitNote}
                disabled={!cleanText(draft)}
              >
                {t('notes_send')}
              </button>
            </div>
          ) : (
            <div className="iof-notes__hint iof-notes__download">
              <span>{t('notes_open_in_app')}</span>
              <a href={ALTERU_APP_URL} target="_blank" rel="noopener noreferrer">
                {t('download_alteru')}
              </a>
            </div>
          )}
        </div>
      )}

      {/* ───── CTAs ───── */}
      <div className="iof-verdict__ctas">
        <button
          type="button"
          className="iof-verdict__cta iof-verdict__cta--primary"
          onPointerDown={onWall}
        >
          {t('result_cta_wall')}
        </button>
        <div className="iof-verdict__ctas-row">
          <button
            type="button"
            className="iof-verdict__cta iof-verdict__cta--secondary"
            onPointerDown={onNew}
          >
            {viewMode === 'gallery' ? t('result_back_to_studio') : t('result_cta_again')}
          </button>
          {onShare && (
            <button
              type="button"
              className="iof-verdict__cta iof-verdict__cta--secondary"
              onPointerDown={onShare}
              disabled={shareDisabled}
            >
              {shareLabel || t('result_cta_share')}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
