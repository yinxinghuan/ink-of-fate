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
  useEffect(() => {
    setTyped('');
    const target = reading.meaning;
    let i = 0;
    const id = setInterval(() => {
      i++;
      setTyped(target.slice(0, i));
      if (i >= target.length) clearInterval(id);
    }, 22);
    return () => clearInterval(id);
  }, [reading.meaning]);

  return (
    <div className="iof-verdict">
      <div className="iof-verdict__photo">
        <img src={tattoo.imageUrl} alt={reading.tattoo_description} />
        <div className="iof-verdict__photo-stamp">
          INK OF FATE · {tattoo.signedDate}
        </div>
      </div>

      <div className="iof-verdict__paper">
        <div className="iof-verdict__paper-inner">
          <div className="iof-verdict__headline">{reading.headline}</div>

          {authorName && viewMode === 'gallery' && (
            <div className="iof-verdict__author">— marked: {authorName}</div>
          )}

          <div className="iof-verdict__meta">
            <div>
              <span className="iof-verdict__meta-label">{t('result_ticket')}</span>
              <span className="iof-verdict__meta-value">{tattoo.ticketNumber}</span>
            </div>
            <div>
              <span className="iof-verdict__meta-label">{t('result_signed')}</span>
              <span className="iof-verdict__meta-value">{tattoo.signedDate}</span>
            </div>
            <div>
              <span className="iof-verdict__meta-label">{t('result_placement')}</span>
              <span className="iof-verdict__meta-value">{placementLabel(reading.placement)}</span>
            </div>
            <div>
              <span className="iof-verdict__meta-label">{t('result_style')}</span>
              <span className="iof-verdict__meta-value">{styleLabel(reading.style)}</span>
            </div>
          </div>

          <div className="iof-verdict__quip">
            <span className="iof-verdict__quote-mark">“</span>
            {reading.artist_quip}
            <span className="iof-verdict__quote-mark">”</span>
          </div>

          <div className="iof-verdict__reading-label">{t('result_meaning')}</div>
          <div className="iof-verdict__reading">{typed || ' '}</div>

          <div className="iof-verdict__invoice">{t('result_invoice')}</div>
        </div>
      </div>

      <div className="iof-verdict__ctas">
        <button
          type="button"
          className="iof-cta iof-cta--secondary"
          onPointerDown={onNew}
        >
          {viewMode === 'gallery' ? t('result_back_to_studio') : t('result_cta_again')}
        </button>
        <button
          type="button"
          className="iof-cta iof-cta--primary"
          onPointerDown={onWall}
        >
          {t('result_cta_wall')}
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
  );
}
