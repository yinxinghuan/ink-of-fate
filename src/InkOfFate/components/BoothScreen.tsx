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

      <button
        className="iof-cta iof-cta--neon"
        onPointerDown={onStepIn}
        type="button"
      >
        {t('booth_step_in')}
      </button>

      <button
        className="iof-booth__wall-link"
        onPointerDown={onWall}
        type="button"
      >
        {t('wall_title')} →
      </button>

      <div className="iof-booth__meta">
        <div>{t('booth_open_since')}</div>
        {bookedTonight > 0 && <div>{t('booth_clients_today', { n: bookedTonight })}</div>}
      </div>

      {!hasFirstTouched && (
        <div className="iof-firsttouch" aria-hidden>
          {t('tip_first_touch')}
        </div>
      )}
    </div>
  );
}
