import { useRef, useState } from 'react';
import { t } from '../i18n';
import type { PlayerProfile } from '../hooks/usePlayerProfile';
import type { SelfieSource } from '../hooks/useFateGen';

interface Props {
  profile: PlayerProfile | null;
  onBack: () => void;
  onSubmit: (source: SelfieSource, question: string) => void;
  errorLabel: string;
}

type Step = 'face' | 'mark';
type PickedSource =
  | { kind: 'avatar'; url: string }
  | { kind: 'file'; file: File; previewUrl: string };

export default function StudioScreen({ profile, onBack, onSubmit, errorLabel }: Props) {
  // Step-by-step flow per UX feedback: don't dump every choice at once.
  // Step 1: pick face. Step 2: optional question + Mark me.
  const [step, setStep] = useState<Step>('face');
  const [question, setQuestion] = useState('');
  const [picked, setPicked] = useState<PickedSource | null>(null);
  const fileRef = useRef<HTMLInputElement | null>(null);

  // Auto-advance after the player picks a face. Beat lets the chip's
  // selected state register visually before transitioning.
  const advanceAfter = (next: PickedSource) => {
    setPicked(next);
    setTimeout(() => setStep('mark'), 320);
  };

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (!f) return;
    const previewUrl = URL.createObjectURL(f);
    advanceAfter({ kind: 'file', file: f, previewUrl });
  };

  const handleUseAvatar = () => {
    if (!profile?.avatarUrl) return;
    advanceAfter({ kind: 'avatar', url: profile.avatarUrl });
  };

  const handleChangeFace = () => {
    setStep('face');
  };

  const handleSubmit = () => {
    if (!picked) return;
    const source: SelfieSource =
      picked.kind === 'avatar'
        ? { kind: 'avatar-url', url: picked.url }
        : { kind: 'file', file: picked.file };
    onSubmit(source, question.trim());
  };

  const previewSrc =
    picked?.kind === 'avatar' ? picked.url : picked?.kind === 'file' ? picked.previewUrl : null;

  return (
    <div className="iof-studio">
      <div className="iof-scene-bg" aria-hidden>
        <img src={import.meta.env.BASE_URL + 'scenes/scene_studio.jpg'} alt="" />
        <div className="iof-scene-bg__vignette iof-scene-bg__vignette--studio" />
      </div>

      <button className="iof-studio__back" type="button" onPointerDown={onBack}>
        ← {t('studio_back')}
      </button>

      <p className="iof-studio__intro">{t('studio_artist_intro')}</p>

      {step === 'face' && (
        <div className="iof-studio__sheet iof-studio__sheet--enter">
          <div className="iof-studio__step-head">
            <span className="iof-studio__step-num">01</span>
            <span className="iof-studio__step-label">{t('studio_step_face')}</span>
          </div>

          {/* No placeholder preview circle in step 1 — without a picked
              image, the "?" disc just eats space and blocks the artist. The
              preview re-appears in step 2 once the player has chosen. */}
          <div className="iof-studio__face-stack">
            {profile?.avatarUrl && (
              <button
                type="button"
                className="iof-cta iof-cta--big iof-studio__face-cta"
                onPointerDown={handleUseAvatar}
              >
                {t('studio_use_my_avatar')}
              </button>
            )}
            <label className="iof-cta iof-cta--secondary iof-studio__face-cta">
              <input
                ref={fileRef}
                type="file"
                accept="image/*"
                onChange={handleFile}
                hidden
              />
              {t('studio_upload')}
            </label>
          </div>
        </div>
      )}

      {step === 'mark' && (
        <div className="iof-studio__mark-stage iof-studio__sheet--enter">
          {/* Hero preview — the user's face stays prominent, not buried.
              Tap it to go back to step 1 and pick a different photo. */}
          <button
            type="button"
            className="iof-studio__preview iof-studio__preview--hero"
            onPointerDown={handleChangeFace}
            aria-label={t('studio_change_face')}
          >
            {previewSrc ? (
              <img src={previewSrc} alt="" className="iof-studio__preview-img" />
            ) : (
              <div className="iof-studio__preview-placeholder">?</div>
            )}
            <span className="iof-studio__change-badge iof-studio__change-badge--hero">
              ↻ {t('studio_change_face')}
            </span>
          </button>

          <div className="iof-studio__sheet iof-studio__sheet--enter">
            <div className="iof-studio__step-head">
              <span className="iof-studio__step-num">02</span>
              <span className="iof-studio__step-label">{t('studio_step_q')}</span>
            </div>
            <input
              className="iof-studio__question"
              placeholder={t('studio_question')}
              value={question}
              maxLength={80}
              onChange={(e) => setQuestion(e.target.value)}
            />

            <button
              type="button"
              className="iof-cta iof-cta--big iof-cta--primary iof-studio__mark-cta"
              onPointerDown={handleSubmit}
            >
              {t('studio_cta')}
            </button>
            {errorLabel && <div className="iof-studio__error">{errorLabel}</div>}
          </div>
        </div>
      )}
    </div>
  );
}
