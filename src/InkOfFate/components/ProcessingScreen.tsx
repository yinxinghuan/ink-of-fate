import { useEffect, useState } from 'react';
import { t } from '../i18n';
import type { Stage } from '../hooks/useFateGen';

interface Props {
  stage: Stage;
  ticketNumber: string;
}

const STAGE_KEY: Record<Stage, string> = {
  '': 'processing_sourcing',
  sourcing: 'processing_sourcing',
  studying: 'processing_studying',
  inking: 'processing_inking',
  stamping: 'processing_stamping',
};

// Step ordinals — drives the progress bar. Each step covers a slice of
// the total fill so the bar visibly creeps forward as the LLM/gen-image
// calls complete.
const STAGE_STEP: Record<Stage, number> = {
  '': 0,
  sourcing: 0,
  studying: 1,
  inking: 2,
  stamping: 3,
};
const TOTAL_STEPS = 4;

export default function ProcessingScreen({ stage, ticketNumber }: Props) {
  const [dots, setDots] = useState('');
  useEffect(() => {
    const id = setInterval(() => {
      setDots((d) => (d.length >= 3 ? '' : d + '.'));
    }, 420);
    return () => clearInterval(id);
  }, []);
  const key = STAGE_KEY[stage] || 'processing_sourcing';
  const step = STAGE_STEP[stage] ?? 0;
  // Visible fill: completed steps full + a soft 50% glow on the active
  // step so the bar never sits flat.
  const fillPct = ((step + 0.5) / TOTAL_STEPS) * 100;
  return (
    <div className="iof-proc">
      <div className="iof-scene-bg" aria-hidden>
        <img src={import.meta.env.BASE_URL + 'scenes/scene_processing.jpg'} alt="" />
        <div className="iof-scene-bg__vignette iof-scene-bg__vignette--processing" />
      </div>
      <div className="iof-proc__stage">
        <div className="iof-proc__typed">{t(key)}{dots}</div>
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
