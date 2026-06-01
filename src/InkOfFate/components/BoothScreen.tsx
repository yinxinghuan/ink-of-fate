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
      <div className="iof-scene-bg iof-scene-bg--breathe" aria-hidden>
        <img src={import.meta.env.BASE_URL + 'scenes/scene_splash.jpg'} alt="" />
        <div className="iof-scene-bg__vignette" />
        <div className="iof-booth__top-darken" />
      </div>

      {/* SVG smoke wisps layered over the lamp / artist face area. Three
          paths rise on staggered loops so the curl never reads as canned. */}
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
          <ellipse cx="50" cy="80" rx="14" ry="9" fill="url(#iof-smoke-grad)" />
        </g>
        <g className="iof-booth__smoke-wisp iof-booth__smoke-wisp--b">
          <ellipse cx="50" cy="80" rx="11" ry="7" fill="url(#iof-smoke-grad)" />
        </g>
        <g className="iof-booth__smoke-wisp iof-booth__smoke-wisp--c">
          <ellipse cx="50" cy="80" rx="9" ry="6" fill="url(#iof-smoke-grad)" />
        </g>
      </svg>

      <header className="iof-booth__hero">
        <div className="iof-booth__hero-title">INK OF FATE</div>
        <div className="iof-booth__hero-rule" aria-hidden />
        <div className="iof-booth__hero-pitch-top">{t('booth_pitch_top')}</div>
      </header>

      <div className="iof-booth__ctas">
        <button
          className="iof-booth__cta iof-booth__cta--primary"
          onPointerDown={onStepIn}
          type="button"
        >
          <span className="iof-booth__cta-label">{t('booth_step_in')}</span>
          <span className="iof-booth__cta-sub">{t('booth_open_since')}</span>
        </button>
        <button
          className="iof-booth__cta iof-booth__cta--secondary"
          onPointerDown={onWall}
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

      {!hasFirstTouched && (
        <div className="iof-firsttouch" aria-hidden>
          {t('tip_first_touch')}
        </div>
      )}
    </div>
  );
}
