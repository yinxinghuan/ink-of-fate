import { useEffect, useState } from 'react';
import { t } from '../i18n';
import { startBuzz, stopBuzz } from '../utils/audio';
import { placementLabel } from '../utils/prompts';
import type { Stage } from '../hooks/useFateGen';
import type { FateReading } from '../types';
import TattooGun from './TattooGun';

interface Props {
  stage: Stage;
  ticketNumber: string;
  /** LLM reading — available from the end of `studying` onward. While
   *  null, we show a tease ("the master is reading you"). Once present,
   *  we stream the artist's quip + meaning into the panel so the user
   *  has something to read during the long inking wait. */
  reading: FateReading | null;
  /** Selfie ref URL — backdrop for the canvas being inked. */
  selfieUrl: string | null;
}

const STAGE_KEY: Record<Stage, string> = {
  '': 'processing_sourcing',
  sourcing: 'processing_sourcing',
  studying: 'processing_studying',
  inking: 'processing_inking',
  stamping: 'processing_stamping',
};

const STAGE_STEP: Record<Stage, number> = {
  '': 0,
  sourcing: 0,
  studying: 1,
  inking: 2,
  stamping: 3,
};
const TOTAL_STEPS = 4;

export default function ProcessingScreen({
  stage,
  ticketNumber,
  reading,
  selfieUrl,
}: Props) {
  const [dots, setDots] = useState('');
  useEffect(() => {
    const id = setInterval(() => {
      setDots((d) => (d.length >= 3 ? '' : d + '.'));
    }, 420);
    return () => clearInterval(id);
  }, []);

  // Tattoo-gun buzz drone for the whole phase except 'stamping' (the
  // sudden silence underscores the "Done. Hold still" beat).
  useEffect(() => {
    startBuzz();
    return () => stopBuzz();
  }, []);
  useEffect(() => {
    if (stage === 'stamping') stopBuzz();
  }, [stage]);

  // Stream the meaning as a typewriter only after the LLM resolves and we
  // entered inking. While studying, show a pre-text placeholder.
  const [typed, setTyped] = useState('');
  useEffect(() => {
    if (!reading) {
      setTyped('');
      return;
    }
    let i = 0;
    setTyped('');
    const id = setInterval(() => {
      i++;
      setTyped(reading.meaning.slice(0, i));
      if (i >= reading.meaning.length) clearInterval(id);
    }, 28);
    return () => clearInterval(id);
  }, [reading]);

  const key = STAGE_KEY[stage] || 'processing_sourcing';
  const step = STAGE_STEP[stage] ?? 0;
  const fillPct = ((step + 0.5) / TOTAL_STEPS) * 100;

  return (
    <div className="iof-proc">
      <div className="iof-proc__lamp" aria-hidden />

      <div className="iof-proc__stage-label">{t(key)}{dots}</div>

      {/* The canvas — a slab of skin where the design forms. The selfie
          ref provides the actual user's skin tone. A subtle pink wash
          marks the area being inked. The tattoo gun hovers over it,
          jittering, while ink dots appear under the needle. */}
      <div className="iof-proc__canvas-stage">
        <div className="iof-proc__canvas">
          {selfieUrl ? (
            <img src={selfieUrl} alt="" className="iof-proc__canvas-skin" />
          ) : (
            <div className="iof-proc__canvas-skin iof-proc__canvas-skin--default" />
          )}
          <div className="iof-proc__canvas-wash" aria-hidden />
          {/* Ink dots — appear in sequence to mimic a line being drawn */}
          <div className="iof-proc__ink-trail" aria-hidden>
            {Array.from({ length: 18 }).map((_, i) => (
              <span
                key={i}
                className="iof-proc__ink-dot"
                style={{ animationDelay: `${i * 0.16}s` }}
              />
            ))}
          </div>
          {reading && (
            <div className="iof-proc__placement-tag">
              {placementLabel(reading.placement)}
            </div>
          )}
        </div>

        <TattooGun className="iof-proc__gun" />
      </div>

      {/* Reading panel — fills the wait. Quip first (always short),
          meaning typewriter (long). Before reading is back, a holding
          line. */}
      <div className="iof-proc__panel">
        {reading ? (
          <>
            <div className="iof-proc__quip">
              <span className="iof-proc__quote">“</span>
              {reading.artist_quip}
              <span className="iof-proc__quote">”</span>
            </div>
            <div className="iof-proc__meaning">{typed || ' '}</div>
          </>
        ) : (
          <div className="iof-proc__pretext">
            {t('processing_studying_long')}
          </div>
        )}
      </div>

      <div className="iof-proc__footer">
        <div
          className="iof-proc__progress"
          role="progressbar"
          aria-valuenow={step + 1}
          aria-valuemin={1}
          aria-valuemax={TOTAL_STEPS}
        >
          <div
            className="iof-proc__progress-fill"
            style={{ width: `${fillPct}%` }}
          />
        </div>
        <div className="iof-proc__ticket">
          {t('processing_ticket')} <strong>{ticketNumber}</strong>
          <span className="iof-proc__step">{step + 1}/{TOTAL_STEPS}</span>
        </div>
      </div>
    </div>
  );
}
