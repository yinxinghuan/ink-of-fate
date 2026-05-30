import { useEffect, useState } from 'react';
import { t } from '../i18n';
import { placementLabel, styleLabel } from '../utils/prompts';
import type { Tattoo } from '../types';

interface Props {
  tattoo: Tattoo;
  viewMode: 'booking' | 'gallery';
  shareLabel?: string;
  shareDisabled?: boolean;
  onNew: () => void;
  onWall: () => void;
  onShare?: () => void;
  authorName?: string;
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
  authorName,
}: Props) {
  const { reading } = tattoo;
  const [typed, setTyped] = useState('');
  const [skipped, setSkipped] = useState(false);
  const [showBefore, setShowBefore] = useState(false);
  const [readingOpen, setReadingOpen] = useState(false);
  const [readingTouched, setReadingTouched] = useState(false);

  useEffect(() => {
    setTyped('');
    setSkipped(false);
    setShowBefore(false);
    setReadingOpen(false);
    setReadingTouched(false);
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
          onPointerDown={swap}
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
          {authorName && viewMode === 'gallery' ? ` · ${authorName}` : ''}
        </div>
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
            onPointerDown={skipTypewriter}
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
