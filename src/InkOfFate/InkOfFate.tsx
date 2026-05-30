import { useEffect, useMemo, useRef, useState } from 'react';
import { useGameSave } from '@shared/save';
import { isInAigram } from '@shared/runtime';
import BoothScreen from './components/BoothScreen';
import StudioScreen from './components/StudioScreen';
import ProcessingScreen from './components/ProcessingScreen';
import VerdictScreen from './components/VerdictScreen';
import ParlorWall from './components/ParlorWall';
import { useFateGen, type SelfieSource } from './hooks/useFateGen';
import { useGallery } from './hooks/useGallery';
import { usePlayerProfile } from './hooks/usePlayerProfile';
import { prependTattoo, ticketNumber } from './utils/booking';
import { startAmbient, stopAmbient, playClick } from './utils/audio';
import { t } from './i18n';
import type { InkOfFateSave, Phase, Tattoo, WallEntry } from './types';
import './InkOfFate.less';

const DEMO_PHOTO = '/ink-of-fate/demo_tattoo.jpg';

const DEMO_TATTOO: Tattoo = {
  id: 'demo',
  imageUrl: DEMO_PHOTO,
  selfieUrl: DEMO_PHOTO,
  reading: {
    headline: '100 GHOSTS, ONE THROAT',
    artist_quip: "Hold still. This one's yours, kid.",
    meaning:
      "You came in dressed like someone who answers texts. We both know you don't. " +
      "There's a centipede on your throat now. Hundred legs. Each one is a person you " +
      "left on read. Every time you swallow your morning coffee, you'll feel them moving. " +
      "Stop running. Or don't. The centipede's not picky.",
    tattoo_description: 'a long black centipede curling around the throat, 100 small legs',
    placement: 'throat',
    style: 'stick-and-poke',
    verdict_tone: 'squint',
  },
  ticketNumber: 'IOF-03142',
  signedDate: '2026-05-30',
  createdAt: Date.now(),
};

const DEMO_WALL: Array<{ name: string; t: Tattoo }> = [
  { name: 'Algram', t: { ...DEMO_TATTOO, id: 'a', ticketNumber: 'IOF-03141', reading: { ...DEMO_TATTOO.reading, headline: 'A SAINT FOR THE 3AM' } } },
  { name: 'Jenny',  t: { ...DEMO_TATTOO, id: 'b', ticketNumber: 'IOF-03140', reading: { ...DEMO_TATTOO.reading, headline: 'YOUR FATHER\'S WRISTWATCH' } } },
  { name: 'JM·F',   t: { ...DEMO_TATTOO, id: 'c', ticketNumber: 'IOF-03139', reading: { ...DEMO_TATTOO.reading, headline: 'A DOG THAT KNOWS' } } },
  { name: 'Isaya',  t: { ...DEMO_TATTOO, id: 'd', ticketNumber: 'IOF-03138', reading: { ...DEMO_TATTOO.reading, headline: 'TINY UNREAD ENVELOPE' } } },
  { name: 'Isabel', t: { ...DEMO_TATTOO, id: 'e', ticketNumber: 'IOF-03137', reading: { ...DEMO_TATTOO.reading, headline: 'CROW WITH ONE EYE' } } },
  { name: 'ghostpixel', t: { ...DEMO_TATTOO, id: 'f', ticketNumber: 'IOF-03136', reading: { ...DEMO_TATTOO.reading, headline: 'THE WORD MAYBE' } } },
];

export default function InkOfFate() {
  const demo = useMemo(() => {
    if (typeof window === 'undefined') return null;
    return new URLSearchParams(window.location.search).get('demo');
  }, []);

  const profile = usePlayerProfile();
  const { savedData, persist } = useGameSave<InkOfFateSave>('ink-of-fate');
  const fateGen = useFateGen();
  const gallery = useGallery();

  const [phase, setPhase] = useState<Phase>('booth');
  const [current, setCurrent] = useState<Tattoo | null>(null);
  const [pendingTicket, setPendingTicket] = useState<string | null>(null);
  const [shareLabel, setShareLabel] = useState('');
  const [errorLabel, setErrorLabel] = useState('');
  const [hasFirstTouched, setHasFirstTouched] = useState(false);
  const [cameFromWall, setCameFromWall] = useState(false);
  const [authorOfCurrent, setAuthorOfCurrent] = useState<string | undefined>();
  const [localExtra, setLocalExtra] = useState<Tattoo[]>([]);

  // ─── Demo overrides ──────────────────────────────────────────
  useEffect(() => {
    if (!demo) return;
    if (demo === 'booth') setPhase('booth');
    else if (demo === 'studio') setPhase('studio');
    else if (demo === 'processing' || demo === 'loading') {
      setPendingTicket('IOF-03142');
      setPhase('processing');
    } else if (demo === 'result' || demo === 'poster') {
      setCurrent(DEMO_TATTOO);
      setPhase('result');
    } else if (demo === 'wall') {
      setPhase('wall');
    }
  }, [demo]);

  // First-touch unlock
  const firstTouchRef = useRef(false);
  useEffect(() => {
    function onPointer() {
      if (firstTouchRef.current) return;
      firstTouchRef.current = true;
      setHasFirstTouched(true);
      startAmbient();
    }
    window.addEventListener('pointerdown', onPointer, { once: true });
    return () => window.removeEventListener('pointerdown', onPointer);
  }, []);

  useEffect(() => {
    if (phase === 'processing' || phase === 'result') {
      stopAmbient();
    } else if (hasFirstTouched) {
      startAmbient();
    }
  }, [phase, hasFirstTouched]);

  // ─── Global tap feedback (per feedback_global_tap_feedback_pattern) ──
  useEffect(() => {
    function onTap(e: Event) {
      const target = e.target as HTMLElement | null;
      if (!target) return;
      const hit = target.closest('button, [role="button"], a[href], label.iof-chip');
      if (!hit) return;
      if (hit.closest('[data-no-feedback]')) return;
      playClick();
    }
    document.addEventListener('pointerdown', onTap, true);
    return () => document.removeEventListener('pointerdown', onTap, true);
  }, []);

  const bookedCount = (savedData?.tattoos?.length ?? 0) + localExtra.length;
  const ownTattoos: Tattoo[] = [...localExtra, ...(savedData?.tattoos ?? [])];

  const handleStepIn = () => {
    setErrorLabel('');
    setPhase('studio');
  };
  const handleBackFromStudio = () => {
    setPhase('booth');
  };

  const handleSubmit = async (source: SelfieSource, question: string) => {
    const ticket = ticketNumber(bookedCount);
    setPendingTicket(ticket);
    setErrorLabel('');
    setPhase('processing');
    try {
      const t = await fateGen.generate({ source, question, ticketNumber: ticket });
      setCurrent(t);
      setAuthorOfCurrent(undefined);
      setPhase('result');
      const nextTs = prependTattoo(savedData?.tattoos, t);
      persist({ tattoos: nextTs });
      setLocalExtra((prev) => [t, ...prev].slice(0, 12));
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e);
      setErrorLabel(`${t('err_processing')} (${msg.slice(0, 100)})`);
      setPhase('studio');
    } finally {
      setPendingTicket(null);
    }
  };

  const handleNew = () => {
    setShareLabel('');
    setCameFromWall(false);
    setPhase('studio');
  };
  const handleWall = () => {
    gallery.refresh();
    setPhase('wall');
  };
  const handleBackFromWall = () => {
    setPhase(current ? 'result' : 'booth');
  };
  const handleViewFromWall = (entry: WallEntry) => {
    setCurrent(entry.tattoo);
    setAuthorOfCurrent(entry.userName);
    setCameFromWall(true);
    setPhase('result');
  };
  const handleShare = () => {
    if (!current) return;
    const text = `${current.reading.headline} — ticket ${current.ticketNumber} · alteru.studio/ink-of-fate`;
    try { navigator.clipboard?.writeText(text); } catch { /* ignore */ }
    setShareLabel(t('result_cta_share_done'));
    setTimeout(() => setShareLabel(''), 1600);
  };

  const wallEntries: WallEntry[] =
    demo === 'wall' || demo === 'poster'
      ? DEMO_WALL.map((d, i) => ({
          userId: `demo-${i}`,
          userName: d.name,
          userAvatarUrl: undefined,
          tattoo: d.t,
        }))
      : gallery.entries;
  const wallLoaded = demo === 'wall' || demo === 'poster' ? true : gallery.loaded;

  return (
    <div className="iof-root">
      <div className="iof-noise" aria-hidden />
      {phase === 'booth' && (
        <BoothScreen
          bookedTonight={bookedCount}
          hasFirstTouched={hasFirstTouched}
          onStepIn={handleStepIn}
          onWall={handleWall}
        />
      )}
      {phase === 'studio' && (
        <StudioScreen
          profile={profile}
          onBack={handleBackFromStudio}
          onSubmit={handleSubmit}
          errorLabel={errorLabel}
        />
      )}
      {phase === 'processing' && pendingTicket && (
        <ProcessingScreen stage={fateGen.stage} ticketNumber={pendingTicket} />
      )}
      {phase === 'result' && current && (
        <VerdictScreen
          tattoo={current}
          viewMode={cameFromWall ? 'gallery' : 'booking'}
          onNew={handleNew}
          onWall={handleWall}
          onShare={isInAigram ? undefined : handleShare}
          shareLabel={shareLabel || undefined}
          shareDisabled={!!shareLabel}
          authorName={authorOfCurrent}
        />
      )}
      {phase === 'wall' && (
        <ParlorWall
          entries={wallEntries}
          loaded={wallLoaded}
          onBack={handleBackFromWall}
          onView={handleViewFromWall}
          onNew={() => {
            setCameFromWall(false);
            setPhase('studio');
          }}
        />
      )}
      <div className="iof-own-counter" aria-hidden>
        {ownTattoos.length > 0 && phase !== 'wall' ? `${ownTattoos.length} on you` : null}
      </div>
    </div>
  );
}
