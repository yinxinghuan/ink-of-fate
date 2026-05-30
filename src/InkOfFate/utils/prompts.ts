// LLM + img2img prompts for INK OF FATE.
//
// The artist is an old biker who's seen everything. He doesn't ask what the
// player wants — he looks at them for three seconds and tells them what
// they were always going to get. The reading should feel like he bought
// the player's life with a side of dry meanness.
//
// Tattoo placements are FACE-VISIBLE ONLY so img2img with a selfie ref
// produces "you with the tattoo there" instead of a forearm we have no
// reference for. See feedback_img2img_subject_agnostic_prompt — the image
// prompt below describes only the scene/skin/ink, never the subject.

import type { FateReading, Placement, TattooStyle, VerdictTone } from '../types';

// ─── Placement + style enumerations ──────────────────────────────────────

export const PLACEMENTS: Placement[] = [
  'left-cheek',
  'right-cheek',
  'throat',
  'side-of-neck',
  'behind-ear',
  'forehead',
  'jawline',
  'under-eye',
  'collarbone',
  'temple',
];

export const STYLES: TattooStyle[] = [
  'sailor-jerry',
  'japanese-irezumi',
  'stick-and-poke',
  'tribal-blackwork',
  'minimal-script',
  'fine-line',
  'gothic-blackletter',
];

export const VERDICT_TONES: VerdictTone[] = ['intense', 'smirk', 'squint', 'shrug'];

// ─── Human-readable mappings ─────────────────────────────────────────────

const PLACEMENT_LABEL: Record<Placement, string> = {
  'left-cheek': 'left cheek',
  'right-cheek': 'right cheek',
  'throat': 'front of the throat',
  'side-of-neck': 'side of the neck',
  'behind-ear': 'behind the right ear',
  'forehead': 'middle of the forehead',
  'jawline': 'along the jawline',
  'under-eye': 'just below the right eye',
  'collarbone': 'across the collarbone',
  'temple': 'right temple',
};

const STYLE_LABEL: Record<TattooStyle, string> = {
  'sailor-jerry': 'Sailor Jerry',
  'japanese-irezumi': 'Japanese Irezumi',
  'stick-and-poke': 'Stick & Poke',
  'tribal-blackwork': 'Tribal Blackwork',
  'minimal-script': 'Minimal Script',
  'fine-line': 'Fine Line',
  'gothic-blackletter': 'Gothic Blackletter',
};

// Long-form visual description fed to img2img. Each entry encodes ink color,
// line weight, shading philosophy. The image prompt below interpolates this
// AFTER asserting "the ref is the subject."
const STYLE_VISUAL: Record<TattooStyle, string> = {
  'sailor-jerry':
    'classic American traditional Sailor Jerry: heavy black outlines, ' +
    'bold spot-color fills (red, green, yellow) inside thick black borders, ' +
    'flat shading, slight ink bleed at corners, 1950s flash-sheet vocabulary',
  'japanese-irezumi':
    'Japanese irezumi: confident black outlines, layered gray wash shading, ' +
    'occasional vermilion accent, flowing negative space, woodblock-print attitude',
  'stick-and-poke':
    'hand-poked stick-and-poke: single-needle dotwork lines, ' +
    'imperfect contours, prison-grey ink, slight wobble, freshly done so ' +
    'the skin around it is faintly pink and shiny',
  'tribal-blackwork':
    'tribal blackwork: solid jet-black geometric forms, sharp negative space, ' +
    'thick interlocking shapes, matte black saturation, no shading',
  'minimal-script':
    'minimal cursive script: thin single-needle black ink, ' +
    'one short word or phrase, tasteful kerning, no ornament',
  'fine-line':
    'fine-line tattoo: hairline 1RL black ink, delicate botanical/symbolic ' +
    'forms, no shading, tasteful negative space',
  'gothic-blackletter':
    'Gothic blackletter / Old English typography in solid black ink, ' +
    'angular serifs, dense vertical strokes, looks scratched into the skin',
};

// ─── System prompt: the artist ───────────────────────────────────────────

export const FATE_SYSTEM = `
You are an old biker tattoo artist working the late shift at a parlor called
INK OF FATE on a dead street in a forgotten city. You have been doing this
for forty years. You do not ask the client what they want. You look at them
for three seconds and you know.

You speak in short, dry, road-worn sentences. Some meanness, no cruelty.
The "reading" is the meaning you assign — it should feel like you bought
their life and you are reading the receipt back to them. Concrete, specific,
slightly absurd. Avoid horoscope mush. Avoid therapy talk. Avoid emoji.

Pick exactly one of these PLACEMENTS (face-visible only, so the camera will
catch it): ${PLACEMENTS.join(', ')}.

Pick exactly one of these STYLES: ${STYLES.join(', ')}.

Also pick the EXPRESSION you wear while reading this one back to them. One of:
- intense — you've nailed who they are; deep eye-contact
- smirk   — you find them slightly funny; quiet knowing grin
- squint  — you pity them a little; grim concern
- shrug   — you don't care; this is just another receipt

The tattoo design itself should be a concrete image — an animal, an object,
a symbol, a short phrase, a small scene — never abstract "energy" or "vibes."

You will reply with ONLY a JSON object, no prose before or after, no
markdown fence. The JSON has exactly these fields:

{
  "headline": "ALL CAPS, MAX 6 WORDS — the verdict",
  "artist_quip": "one greasy line you say while reading the verdict",
  "meaning": "3 to 5 short sentences. What this tattoo means about them. Specific. Slightly dark. No emoji.",
  "tattoo_description": "1 short sentence describing the visible design (what the ink shows)",
  "placement": "one of the PLACEMENTS exactly",
  "style": "one of the STYLES exactly",
  "verdict_tone": "one of: intense, smirk, squint, shrug"
}
`.trim();

// ─── User prompt: includes the optional question + a fresh seed ──────────

export function buildFateUserPrompt(opts: {
  question?: string;
  seed: string;
}): string {
  const q = (opts.question || '').trim();
  const said = q
    ? `When asked what they're running from, the client said:\n"${truncate(q, 240)}"`
    : `The client refused to answer when asked what they're running from. ` +
      `Cold-read them from the photo alone.`;
  return [
    `New client just walked in. Mark them.`,
    ``,
    said,
    ``,
    `seed: ${opts.seed}`,
  ].join('\n');
}

function truncate(s: string, n: number): string {
  if (s.length <= n) return s;
  return s.slice(0, n - 1) + '…';
}

// ─── JSON parser (forgiving) ─────────────────────────────────────────────

export function parseFateReading(raw: string): FateReading {
  const json = extractJson(raw);
  const headline = clean(json.headline, 'A MARK FOR YOU').toUpperCase().slice(0, 80);
  const artistQuip = clean(json.artist_quip, "Hold still. This one's yours.");
  const meaning = clean(
    json.meaning,
    'You walked in here pretending. The needle will do the rest.',
  );
  const desc = clean(json.tattoo_description, 'a small black mark, simple, deliberate');
  const placement = (PLACEMENTS as string[]).includes(json.placement)
    ? (json.placement as Placement)
    : randomFrom(PLACEMENTS);
  const style = (STYLES as string[]).includes(json.style)
    ? (json.style as TattooStyle)
    : randomFrom(STYLES);
  const verdict_tone = (VERDICT_TONES as string[]).includes(json.verdict_tone)
    ? (json.verdict_tone as VerdictTone)
    : randomFrom(VERDICT_TONES);
  return {
    headline,
    artist_quip: artistQuip,
    meaning,
    tattoo_description: desc,
    placement,
    style,
    verdict_tone,
  };
}

function extractJson(raw: string): Record<string, string> {
  if (!raw) return {};
  // Strip markdown fences if any.
  let s = raw.trim();
  s = s.replace(/^```(?:json)?\s*/i, '').replace(/```\s*$/i, '').trim();
  // If the model wrapped the JSON in prose, find the first { ... last }.
  const first = s.indexOf('{');
  const last = s.lastIndexOf('}');
  if (first >= 0 && last > first) s = s.slice(first, last + 1);
  try {
    const obj = JSON.parse(s) as Record<string, unknown>;
    const out: Record<string, string> = {};
    for (const k of Object.keys(obj)) {
      const v = obj[k];
      if (typeof v === 'string') out[k] = v;
      else if (v != null) out[k] = String(v);
    }
    return out;
  } catch {
    return {};
  }
}

function clean(s: string | undefined, fallback: string): string {
  const v = (s ?? '').toString().trim();
  return v || fallback;
}

function randomFrom<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

// ─── Image prompt (subject-agnostic, scene-only) ─────────────────────────
//
// We never describe the human — the ref IS the subject. We only describe
// the scene/ink so the API trusts the ref and adds the tattoo to it.
// See feedback_img2img_subject_agnostic_prompt.md.

export function buildTattooImagePrompt(reading: FateReading): string {
  const placement = PLACEMENT_LABEL[reading.placement];
  const styleVisual = STYLE_VISUAL[reading.style];
  return [
    // ── IDENTITY LOCK ──
    // Framed as a one-edit photo retouch, not a new portrait. The same
    // emphatic pattern the pet-filter "hybrid" prompt used to hold faces.
    `Photo EDIT, NOT a new portrait. The subject in the reference image`,
    `is a real person — KEEP their EXACT facial structure, eye shape and`,
    `placement, eyebrows, nose, mouth, jawline, hairline, hair color and`,
    `style, skin tone, age, gender expression, and pose. The result must`,
    `be obviously, unmistakably the SAME PERSON from the reference photo,`,
    `recognizable at first glance — friends and family must instantly`,
    `identify them. Do NOT regenerate the face. Do NOT swap to a generic`,
    `model. Do NOT idealize or stylize the face.`,
    ``,
    // ── THE ONE EDIT ──
    `The only change vs the reference: ON the ${placement}, ADD a`,
    `freshly inked tattoo: ${reading.tattoo_description}. The tattoo is`,
    `the ONLY new element. Everything else — face, head, body, clothing,`,
    `background — stays as in the reference.`,
    ``,
    // ── INK ──
    `Tattoo rendering: ${styleVisual}. Ink is visibly fresh — skin`,
    `slightly pink and shiny around the design, tiny lamp highlights on`,
    `the wet ink, lines are deep and clean. The tattoo sits ON the skin,`,
    `following the natural contour of the ${placement}, with subtle`,
    `shadow where the design crosses skin folds.`,
    ``,
    // ── LIGHTING ──
    `Light the scene like a dim late-night tattoo parlor: warm amber`,
    `tungsten lamp from above-left, cool neon pink-and-cyan rim light`,
    `from a buzzing sign just out of frame. Subtle 35mm film grain,`,
    `shallow depth of field, true-to-life skin texture. Same crop as the`,
    `reference photo if reasonable.`,
    ``,
    `No watermark, no text overlay other than what is on the tattoo`,
    `design. No new logos.`,
  ].join(' ');
}

// ─── Display helpers for UI ──────────────────────────────────────────────

export function placementLabel(p: Placement): string {
  return PLACEMENT_LABEL[p];
}

export function styleLabel(s: TattooStyle): string {
  return STYLE_LABEL[s];
}
