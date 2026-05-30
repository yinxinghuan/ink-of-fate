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

type PickedSource =
  | { kind: 'avatar'; url: string }
  | { kind: 'file'; file: File; previewUrl: string };

export default function StudioScreen({ profile, onBack, onSubmit, errorLabel }: Props) {
  const [question, setQuestion] = useState('');
  const [picked, setPicked] = useState<PickedSource | null>(
    profile?.avatarUrl ? { kind: 'avatar', url: profile.avatarUrl } : null,
  );
  const fileRef = useRef<HTMLInputElement | null>(null);

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (!f) return;
    const previewUrl = URL.createObjectURL(f);
    setPicked({ kind: 'file', file: f, previewUrl });
  };

  const handleUseAvatar = () => {
    if (!profile?.avatarUrl) return;
    setPicked({ kind: 'avatar', url: profile.avatarUrl });
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
      <button className="iof-studio__back" type="button" onPointerDown={onBack}>
        ← {t('studio_back')}
      </button>

      <div className="iof-studio__lamp" aria-hidden>
        <div className="iof-studio__lamp-cone" />
      </div>

      <div className="iof-studio__inner">
        <p className="iof-studio__intro">{t('studio_artist_intro')}</p>

        <section className="iof-studio__section">
          <h3 className="iof-studio__heading">{t('studio_face_section')}</h3>

          <div className="iof-studio__face-row">
            <div className="iof-studio__preview">
              {previewSrc ? (
                <img src={previewSrc} alt="" className="iof-studio__preview-img" />
              ) : (
                <div className="iof-studio__preview-placeholder">?</div>
              )}
            </div>

            <div className="iof-studio__face-actions">
              {profile?.avatarUrl && (
                <button
                  type="button"
                  className={
                    'iof-chip ' +
                    (picked?.kind === 'avatar' ? 'iof-chip--selected' : '')
                  }
                  onPointerDown={handleUseAvatar}
                >
                  {t('studio_use_my_avatar')}
                </button>
              )}
              <label className="iof-chip iof-chip--upload">
                <input
                  ref={fileRef}
                  type="file"
                  accept="image/*"
                  onChange={handleFile}
                  hidden
                />
                {picked?.kind === 'file' ? t('studio_change') : t('studio_upload')}
              </label>
            </div>
          </div>
        </section>

        <section className="iof-studio__section">
          <h3 className="iof-studio__heading">{t('studio_question')}</h3>
          <textarea
            className="iof-studio__question"
            placeholder={t('studio_question_placeholder')}
            value={question}
            maxLength={80}
            rows={2}
            onChange={(e) => setQuestion(e.target.value)}
          />
          <div className="iof-studio__count">{question.length}/80</div>
        </section>

        <div className="iof-studio__cta-wrap">
          <button
            type="button"
            className="iof-cta iof-cta--big"
            disabled={!picked}
            onPointerDown={handleSubmit}
          >
            {picked ? t('studio_cta_pending') : t('studio_cta_disabled')}
          </button>
          {errorLabel && <div className="iof-studio__error">{errorLabel}</div>}
        </div>
      </div>
    </div>
  );
}
