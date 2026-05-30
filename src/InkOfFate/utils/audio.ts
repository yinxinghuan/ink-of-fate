// Minimal Web Audio for parlor ambience + tap feedback. All synthesized,
// no asset files. Ambient is a breathing neon-buzz drone (with real silent
// gaps per the instant-play audio rule).
//
// All entry points are guarded: nothing fires until first user gesture.

let ctx: AudioContext | null = null;
let ambientLoopId: number | null = null;
let ambientGain: GainNode | null = null;
let ambientStopAt = 0;
let started = false;

function getCtx(): AudioContext | null {
  if (ctx) return ctx;
  if (typeof window === 'undefined') return null;
  try {
    const C = (window.AudioContext ||
      (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext) as
      | typeof AudioContext
      | undefined;
    if (!C) return null;
    ctx = new C();
  } catch {
    ctx = null;
  }
  return ctx;
}

// ─── Ambient neon hum — breathes in/out with silent gaps ─────────────────

function scheduleAmbientCycle() {
  const ac = getCtx();
  if (!ac || !ambientGain) return;
  const now = ac.currentTime;
  // Random cycle: 6–10s rise, 8–14s hold, 5–9s fall, 8–18s silence
  const rise = 6 + Math.random() * 4;
  const hold = 8 + Math.random() * 6;
  const fall = 5 + Math.random() * 4;
  const silence = 8 + Math.random() * 10;
  const peak = 0.025 + Math.random() * 0.025;
  const g = ambientGain.gain;
  try {
    g.cancelScheduledValues(now);
    g.setValueAtTime(0.0001, now);
    g.exponentialRampToValueAtTime(peak, now + rise);
    g.setValueAtTime(peak, now + rise + hold);
    g.exponentialRampToValueAtTime(0.0001, now + rise + hold + fall);
  } catch {
    /* ignore */
  }
  ambientStopAt = (now + rise + hold + fall + silence) * 1000;
  ambientLoopId = window.setTimeout(scheduleAmbientCycle, (rise + hold + fall + silence) * 1000);
}

export function startAmbient(): void {
  const ac = getCtx();
  if (!ac) return;
  if (started) return;
  started = true;
  ambientGain = ac.createGain();
  ambientGain.gain.value = 0.0001;
  ambientGain.connect(ac.destination);
  // Two slightly detuned saws → buzzy neon hum.
  const o1 = ac.createOscillator();
  const o2 = ac.createOscillator();
  o1.type = 'sawtooth';
  o2.type = 'sawtooth';
  o1.frequency.value = 58;
  o2.frequency.value = 61;
  const lp = ac.createBiquadFilter();
  lp.type = 'lowpass';
  lp.frequency.value = 540;
  lp.Q.value = 0.6;
  o1.connect(lp);
  o2.connect(lp);
  lp.connect(ambientGain);
  o1.start();
  o2.start();
  scheduleAmbientCycle();
  void ambientStopAt;
}

export function stopAmbient(): void {
  if (ambientLoopId != null) {
    clearTimeout(ambientLoopId);
    ambientLoopId = null;
  }
  if (ambientGain) {
    try {
      const ac = getCtx();
      if (ac) {
        const now = ac.currentTime;
        ambientGain.gain.cancelScheduledValues(now);
        ambientGain.gain.linearRampToValueAtTime(0, now + 0.3);
      }
    } catch {
      /* ignore */
    }
  }
  started = false;
}

// ─── One-shot click / pop ────────────────────────────────────────────────

export function playClick(): void {
  const ac = getCtx();
  if (!ac) return;
  const now = ac.currentTime;
  const o = ac.createOscillator();
  const g = ac.createGain();
  o.type = 'triangle';
  o.frequency.setValueAtTime(820, now);
  o.frequency.exponentialRampToValueAtTime(420, now + 0.07);
  g.gain.setValueAtTime(0.0001, now);
  g.gain.exponentialRampToValueAtTime(0.06, now + 0.005);
  g.gain.exponentialRampToValueAtTime(0.0001, now + 0.09);
  o.connect(g).connect(ac.destination);
  o.start(now);
  o.stop(now + 0.1);
}

// ─── Tattoo-gun buzz (used during processing) ────────────────────────────

let buzzNodes: { osc: OscillatorNode; gain: GainNode } | null = null;

export function startBuzz(): void {
  const ac = getCtx();
  if (!ac || buzzNodes) return;
  const o = ac.createOscillator();
  const g = ac.createGain();
  o.type = 'square';
  o.frequency.value = 105; // gritty mosquito
  // Tremolo LFO for that needle-stutter feel.
  const lfo = ac.createOscillator();
  const lfoGain = ac.createGain();
  lfo.frequency.value = 22;
  lfoGain.gain.value = 0.04;
  lfo.connect(lfoGain).connect(g.gain);
  const lp = ac.createBiquadFilter();
  lp.type = 'bandpass';
  lp.frequency.value = 1400;
  lp.Q.value = 1.4;
  g.gain.value = 0.018;
  o.connect(lp).connect(g).connect(ac.destination);
  o.start();
  lfo.start();
  buzzNodes = { osc: o, gain: g };
}

export function stopBuzz(): void {
  const ac = getCtx();
  if (!ac || !buzzNodes) return;
  try {
    const now = ac.currentTime;
    buzzNodes.gain.gain.cancelScheduledValues(now);
    buzzNodes.gain.gain.linearRampToValueAtTime(0, now + 0.2);
    buzzNodes.osc.stop(now + 0.25);
  } catch {
    /* ignore */
  }
  buzzNodes = null;
}
