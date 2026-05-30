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
  // Toggle: main photo = the finished tattoo by default; tap to swap the
  // user's original selfie into the main slot. The OTHER one always
  // appears as the small tilted polaroid attachment in the upper-left.
  const [showBefore, setShowBefore] = useState(false);

  useEffect(() => {
    setTyped('');
    setSkipped(false);
    setShowBefore(false);
    const target = reading.meaning;
    let i = 0;
    const id = setInterval(() => {
      i++;
      setTyped(target.slice(0, i));
      if (i >= target.length) clearInterval(id);
    }, 14);
    return () => clearInterval(id);
  }, [reading.meaning]);

  const readingText = skipped ? reading.meaning : typed;
  const skipTypewriter = () => {
    if (typed.length < reading.meaning.length) setSkipped(true);
  };

  const metaLine =
    `${tattoo.ticketNumber} · ${tattoo.signedDate} · ` +
    `${placementLabel(reading.placement)} · ${styleLabel(reading.style)}`;

  // Main = whichever is currently "front"; inset = the other.
  const mainUrl = showBefore ? tattoo.selfieUrl : tattoo.imageUrl;
  const insetUrl = showBefore ? tattoo.imageUrl : tattoo.selfieUrl;
  const mainLabel = showBefore ? t('result_before') : t('result_after');
  const insetLabel = showBefore ? t('result_after') : t('result_before');

  const swap = () => setShowBefore((b) => !b);

  return (
    <div className="iof-verdict">
      <div className="iof-verdict__photo" onPointerDown={swap} role="button" tabIndex={-1}>
        <img src={mainUrl} alt={reading.tattoo_description} />
        <div className="iof-verdict__photo-stamp">
          INK OF FATE · {tattoo.signedDate}
        </div>
        <div className="iof-verdict__photo-tag">{mainLabel}</div>

        {/* Tilted polaroid attachment — the original selfie when we're
            showing the tattoo, or vice versa. The whole photo container
            is tappable to swap, so this is presented as a label only. */}
        <div className="iof-verdict__attachment" aria-hidden>
          <img src={insetUrl} alt="" />
          <div className="iof-verdict__attachment-label">{insetLabel}</div>
        </div>

        <div className="iof-verdict__swap-hint">{t('result_tap_to_swap')}</div>
      </div>

      <div className="iof-verdict__reaction">
        <img
          src={
            import.meta.env.BASE_URL +
            `scenes/artist_${reading.verdict_tone}.jpg`
          }
          alt=""
        />
        <div className="iof-verdict__reaction-headline">{reading.headline}</div>
      </div>

      <div className="iof-verdict__paper">
        <div className="iof-verdict__paper-inner">
          {authorName && viewMode === 'gallery' && (
            <div className="iof-verdict__author">— marked: {authorName}</div>
          )}

          <div className="iof-verdict__quip">
            <span className="iof-verdict__quote-mark">“</span>
            {reading.artist_quip}
            <span className="iof-verdict__quote-mark">”</span>
          </div>

          <div className="iof-verdict__meta-line">{metaLine}</div>

          <div className="iof-verdict__reading-label">{t('result_meaning')}</div>
          <div
            className="iof-verdict__reading"
            onPointerDown={skipTypewriter}
            role="button"
            tabIndex={-1}
          >
            {readingText || ' '}
          </div>

          <div className="iof-verdict__invoice">{t('result_invoice')}</div>
        </div>
      </div>

      <div className="iof-verdict__ctas">
        <button
          type="button"
          className="iof-cta iof-cta--primary iof-cta--big"
          onPointerDown={onWall}
        >
          {t('result_cta_wall')}
        </button>
        <div className="iof-verdict__ctas-row">
          <button
            type="button"
            className="iof-cta iof-cta--secondary"
            onPointerDown={onNew}
          >
            {viewMode === 'gallery' ? t('result_back_to_studio') : t('result_cta_again')}
          </button>
          {onShare && (
            <button
              type="button"
              className="iof-cta iof-cta--secondary"
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
