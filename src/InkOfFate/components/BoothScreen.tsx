import { t } from '../i18n';

interface Props {
  bookedTonight: number;
  hasFirstTouched: boolean;
  onStepIn: () => void;
  onWall: () => void;
}

export default function BoothScreen({
  bookedTonight,
  hasFirstTouched,
  onStepIn,
  onWall,
}: Props) {
  return (
    <div className="iof-booth">
      {/* ─── Image zone (top ~62%) — TAP TO ENTER, no text overlay ── */}
      <div
        className="iof-booth__imagewrap"
        onPointerDown={onStepIn}
        role="button"
        aria-label={t('booth_step_in')}
      >
        <div className="iof-scene-bg iof-scene-bg--breathe" aria-hidden>
          <img src={import.meta.env.BASE_URL + 'scenes/scene_splash.jpg'} alt="" />
          <div className="iof-scene-bg__vignette iof-scene-bg__vignette--splash" />
        </div>

        <svg
          className="iof-booth__smoke"
          viewBox="0 0 100 160"
          preserveAspectRatio="xMidYMid slice"
          aria-hidden
        >
          <defs>
            <radialGradient id="iof-smoke-grad" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#e7f4f0" stopOpacity="0.5" />
              <stop offset="55%" stopColor="#a8c4bd" stopOpacity="0.2" />
              <stop offset="100%" stopColor="#a8c4bd" stopOpacity="0" />
            </radialGradient>
          </defs>
          <g className="iof-booth__smoke-wisp iof-booth__smoke-wisp--a">
            <ellipse cx="50" cy="110" rx="14" ry="9" fill="url(#iof-smoke-grad)" />
          </g>
          <g className="iof-booth__smoke-wisp iof-booth__smoke-wisp--b">
            <ellipse cx="50" cy="110" rx="11" ry="7" fill="url(#iof-smoke-grad)" />
          </g>
          <g className="iof-booth__smoke-wisp iof-booth__smoke-wisp--c">
            <ellipse cx="50" cy="110" rx="9" ry="6" fill="url(#iof-smoke-grad)" />
          </g>
        </svg>

        {!hasFirstTouched && (
          <div className="iof-booth__tap-hint" aria-hidden>
            <span className="iof-booth__tap-hint-arrow" />
            <span>{t('tip_first_touch')}</span>
            <span className="iof-booth__tap-hint-arrow" />
          </div>
        )}
      </div>

      {/* ─── Illustrated wordmark — overlaps the seam, visual focal point ─── */}
      <TattooMark />

      {/* ─── Dock (bottom ~38%) — pitch + CTAs ─── */}
      <div className="iof-booth__dock">
        <div className="iof-booth__pitch">{t('booth_pitch_top')}</div>

        <div className="iof-booth__ctas">
          <button
            className="iof-booth__cta iof-booth__cta--primary"
            onPointerDown={(ev) => {
              ev.stopPropagation();
              onStepIn();
            }}
            type="button"
          >
            <span className="iof-booth__cta-label">{t('booth_step_in')}</span>
          </button>
          <button
            className="iof-booth__cta iof-booth__cta--secondary"
            onPointerDown={(ev) => {
              ev.stopPropagation();
              onWall();
            }}
            type="button"
          >
            <span className="iof-booth__cta-label">{t('wall_title')}</span>
            <span className="iof-booth__cta-sub">
              {bookedTonight > 0
                ? t('booth_clients_today', { n: bookedTonight })
                : t('wall_sub')}
            </span>
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Tattoo-flash illustrated wordmark ────────────────────────────────────
// Pirata One blackletter as the letter foundation. Decorative SVG ornaments
// (paired daggers, banner ribbon with EST. 1973, ink-drop terminals) are
// hand-built to make it read as a designed mark, not "just a font". Sized
// to be the dominant visual element; positioned to overlap the seam.
function TattooMark() {
  return (
    <div className="iof-mark" aria-label="Ink of Fate">
      {/* dagger ornaments flank the wordmark */}
      <Dagger className="iof-mark__dagger iof-mark__dagger--left" />
      <div className="iof-mark__words">
        <div className="iof-mark__title" aria-hidden>
          <span className="iof-mark__title-back" aria-hidden>INK&nbsp;OF&nbsp;FATE</span>
          <span className="iof-mark__title-front">INK&nbsp;OF&nbsp;FATE</span>
        </div>
        <div className="iof-mark__banner" aria-hidden>
          <span className="iof-mark__banner-rule" />
          <span className="iof-mark__banner-text">parlor &middot; est. 1973</span>
          <span className="iof-mark__banner-rule" />
        </div>
      </div>
      <Dagger className="iof-mark__dagger iof-mark__dagger--right" />
    </div>
  );
}

function Dagger({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 16 64"
      aria-hidden
      preserveAspectRatio="xMidYMid meet"
    >
      {/* pommel + grip + crossguard + blade — sailor-jerry style flanking */}
      <g fill="currentColor" stroke="currentColor" strokeWidth="0.4">
        {/* pommel */}
        <circle cx="8" cy="3" r="1.6" />
        {/* grip */}
        <rect x="6.8" y="4.5" width="2.4" height="6" rx="0.8" />
        {/* grip wrap dashes */}
        <path d="M 6.8 5.7 L 9.2 5.7 M 6.8 7.1 L 9.2 7.1 M 6.8 8.5 L 9.2 8.5" stroke="rgba(0,0,0,0.45)" strokeWidth="0.4" fill="none" />
        {/* crossguard */}
        <rect x="3" y="10.4" width="10" height="1.6" rx="0.4" />
        {/* blade */}
        <path d="M 8 12 L 10.2 18 L 10.2 50 L 8 60 L 5.8 50 L 5.8 18 Z" />
        {/* blade center fuller */}
        <path d="M 8 14 L 8 56" stroke="rgba(0,0,0,0.35)" strokeWidth="0.5" />
      </g>
    </svg>
  );
}
