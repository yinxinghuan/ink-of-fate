import { useEffect, useState } from 'react';
import { t } from '../i18n';
import type { Stage } from '../hooks/useFateGen';

interface Props {
  stage: Stage;
  ticketNumber: string;
}

const STAGE_KEY: Record<Stage, string> = {
  '': 'processing_studying',
  sourcing: 'processing_studying',
  studying: 'processing_studying',
  inking: 'processing_inking',
  stamping: 'processing_stamping',
};

export default function ProcessingScreen({ stage, ticketNumber }: Props) {
  const [dots, setDots] = useState('');
  useEffect(() => {
    const id = setInterval(() => {
      setDots((d) => (d.length >= 3 ? '' : d + '.'));
    }, 420);
    return () => clearInterval(id);
  }, []);
  const key = STAGE_KEY[stage] || 'processing_studying';
  return (
    <div className="iof-proc">
      <div className="iof-scene-bg" aria-hidden>
        <img src={import.meta.env.BASE_URL + 'scenes/scene_processing.jpg'} alt="" />
        <div className="iof-scene-bg__vignette iof-scene-bg__vignette--processing" />
      </div>
      <div className="iof-proc__stage">
        <div className="iof-proc__typed">{t(key)}{dots}</div>
        <div className="iof-proc__ticket">
          {t('processing_ticket')} <strong>{ticketNumber}</strong>
        </div>
      </div>
    </div>
  );
}
