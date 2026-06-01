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
      {/* Stacked wordmark — INK over FATE with a small italic "of" between.
          Two sheriff stars flank vertically so the unit reads tall + dense.
          No frame — the wordmark stands free against the scene. */}
      <div className="iof-mark__rows">
        <Star className="iof-mark__star iof-mark__star--left" />
        <div className="iof-mark__words">
          <div className="iof-mark__title iof-mark__title--ink" aria-hidden>
            <span className="iof-mark__title-back">INK</span>
            <span className="iof-mark__title-front">INK</span>
          </div>
          <div className="iof-mark__of" aria-hidden>of</div>
          <div className="iof-mark__title iof-mark__title--fate" aria-hidden>
            <span className="iof-mark__title-back">FATE</span>
            <span className="iof-mark__title-front">FATE</span>
          </div>
        </div>
        <Star className="iof-mark__star iof-mark__star--right" />
      </div>
      <div className="iof-mark__banner" aria-hidden>
        <span className="iof-mark__banner-rule" />
        <span className="iof-mark__banner-text">est. 1973 &middot; no cuts</span>
        <span className="iof-mark__banner-rule" />
      </div>
    </div>
  );
}

function Star({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      aria-hidden
      preserveAspectRatio="xMidYMid meet"
    >
      {/* five-point sheriff star */}
      <path
        d="M 12 1 L 14.6 8.6 L 22.8 8.6 L 16.1 13.6 L 18.7 21.2 L 12 16.4 L 5.3 21.2 L 7.9 13.6 L 1.2 8.6 L 9.4 8.6 Z"
        fill="currentColor"
        stroke="rgba(0,0,0,0.85)"
        strokeWidth="0.6"
        strokeLinejoin="round"
      />
      {/* center pip */}
      <circle cx="12" cy="12" r="1.3" fill="rgba(0,0,0,0.65)" />
    </svg>
  );
}
