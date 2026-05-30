import { t } from '../i18n';
import NeonSign from './NeonSign';

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
      <div className="iof-scene-bg" aria-hidden>
        <img src={import.meta.env.BASE_URL + 'scenes/scene_booth.jpg'} alt="" />
        <div className="iof-scene-bg__vignette" />
      </div>

      <div className="iof-booth__sign-wrap">
        <NeonSign small />
      </div>

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
