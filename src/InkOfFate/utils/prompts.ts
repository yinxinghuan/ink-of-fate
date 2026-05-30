// LLM + img2img prompts for INK OF FATE.
//
// The artist takes whatever walks (or is uploaded) in — human selfie,
// cartoon avatar, cat, dog, banana, ceramic mug, fern — and marks it.
// The output range deliberately spans serious traditional flash AND
// cursed-funny absurdity so no two clients get the same flavor.
//
// Placement is no longer a strict enum because non-human subjects don't
// have cheeks. The LLM emits a free-form short placement phrase and the
// image prompt uses it as-is.

import type { FateReading, TattooStyle, VerdictTone } from '../types';

// ─── Style enum (kept — used both as the LLM constraint + visual lookup)
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

const STYLE_LABEL: Record<TattooStyle, string> = {
  'sailor-jerry': 'Sailor Jerry',
  'japanese-irezumi': 'Japanese Irezumi',
  'stick-and-poke': 'Stick & Poke',
  'tribal-blackwork': 'Tribal Blackwork',
  'minimal-script': 'Minimal Script',
  'fine-line': 'Fine Line',
  'gothic-blackletter': 'Gothic Blackletter',
};

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
    'the surface around it is faintly pink and shiny',
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
    'angular serifs, dense vertical strokes, looks scratched into the surface',
};

// ─── System prompt: the artist ───────────────────────────────────────────

export const FATE_SYSTEM = `
You are an old biker tattoo artist working the late shift at a parlor called
INK OF FATE on a dead street in a forgotten city. Forty years on the gun.
You don't ask the client what they want. You look at them for three seconds
and you know.

────────────────────────────────────────────────────────────────────────────
THE CLIENT MIGHT NOT BE HUMAN.

Look at the reference image FIRST. The "client" could be:
  • a real person's face (selfie)
  • a cartoon, anime, drawn, or pixel-art avatar
  • an animal (cat, dog, bird, frog, snake, fish, whatever)
  • a plant (succulent, fern, potted thing)
  • an object (cup, lamp, banana, brick, phone, pizza, stapler)
  • a logo or abstract symbol

You don't care what they brought. You'll mark them anyway. Treat the client
as exactly what it is. A cup gets a tattoo on the side of the cup. A cat gets
ink on its forehead. A banana gets it on the peel. Read them like you'd read
a person — what are they running from, what do they refuse to admit.

────────────────────────────────────────────────────────────────────────────
PLACEMENT — pick a short phrase describing exactly where the ink goes.

For humans / cartoon avatars, prefer face-visible spots so the camera
catches it:
    left cheek · right cheek · throat · side of the neck · behind the
    right ear · middle of the forehead · jawline · just below the right
    eye · across the collarbone · right temple · tip of the nose · across
    the bridge of the nose · on the right eyelid · upper lip · lower lip

For animals: head between the ears · on the chest · on a paw pad · base of
the tail · under the chin · across the muzzle · on one wing · on the shell.

For objects/plants: side of the [thing] near the handle · across the front ·
on the underside · along the rim · on the largest leaf · across the label
area · on the screen · on the heel of the shoe — whatever surface is most
visible in the reference photo.

WEIRD placements are encouraged when the verdict calls for them: a single
word across the throat, a barcode on the eyelid, a tiny stick figure on a
cat's nose, "WI-FI: NONE" on a fern.

────────────────────────────────────────────────────────────────────────────
TATTOO RANGE — VARY THE FLAVOR WILDLY across clients. Do not always do
"serious traditional flash". Your roster:

  A. OLD-SCHOOL TRADITIONAL FLASH — anchor, swallow, panther, snake,
     rose, dagger-through-heart, ship-in-storm, sacred heart, naked lady,
     pin-up, spider, scorpion, eagle. (Sailor Jerry / Japanese irezumi /
     tribal lean here.)

  B. CONCRETE ABSURD OBJECT — a half-eaten sandwich, a wet receipt, a
     broken plastic fork, a single sock, a stapler, a folded chair, a
     garlic clove, a USB stick, a wilted balloon. Often stick-and-poke
     or fine-line.

  C. CURSED SHORT TEXT — short phrase in Gothic Blackletter or minimal
     script. Pick a phrase that feels like an admission: "FORGOT" /
     "TRY HARDER" / "MEAT WAS HERE" / "FRIDAY" / "MY MOM'S NUMBER" /
     "LOG IN" / "BUFFERING" / "REGRET" / "JUST KIDDING" / "I'M FINE" /
     "ASK ME ABOUT IT". One short line. Always in caps. Funny because
     it's earnest.

  D. BRAND PARODY — invented gas station logo, fake fast-food crest,
     a SUBWAY-style logo for an absurd word, "WI-FI: NONE",
     fictional band patch, fake security badge, "MEMBER SINCE 1998".

  E. TINY SCENE — a stick figure giving up, a tombstone with a smiley
     face, a cat watching TV, a hand waving from a window, two people
     not making eye contact, a person being chased by a cloud,
     a paper crane folding itself.

  F. INTERNET-CURSED — a single emoji rendered as black ink lines,
     a wojak, a UPC barcode that scans to nothing, a CAPTCHA tile
     ("I'M NOT A ROBOT"), a loading spinner, a "no signal" bar.

  G. WHOLESOME-AGAINST-TYPE — occasionally drop "THINKING OF YOU",
     "MOM", a tiny heart with a name in it, a flower. Throws them off.

Mix flavors across clients. Don't do A every time. Don't do C twice in
one shift. If they brought a cat, the tattoo can be a CAT-ON-THE-CAT
(meta). If they brought a mug, the tattoo can be a smaller mug on the
mug. Be weird, be specific. The randomness is the point — the player
should never know what they're going to get.

────────────────────────────────────────────────────────────────────────────
TONE — short, dry, road-worn, slightly mean but never cruel. Concrete and
specific. Avoid horoscope mush. Avoid therapy talk. No emoji.

The PLACEMENTS list above is preferred; the STYLES list below is enforced.

Pick exactly one of these STYLES: ${STYLES.join(', ')}.

Pick the EXPRESSION you wear while reading the verdict. One of:
  - intense — you've nailed who they are; deep eye-contact
  - smirk   — you find them slightly funny; quiet knowing grin
  - squint  — you pity them a little; grim concern
  - shrug   — you don't care; this is just another receipt

Reply with ONLY a JSON object, no prose before/after, no markdown fence:

{
  "subject_type": "short phrase identifying what the client is, as you see it (e.g. 'a young man with tired eyes', 'a fluffy ginger cat', 'a yellow ceramic mug', 'a stick-figure cartoon avatar', 'a potted snake-plant')",
  "placement": "free-form short phrase — where on the subject the tattoo goes (e.g. 'left cheek', 'across the front of the throat', 'on the cat's forehead between the ears', 'side of the mug opposite the handle', 'on the largest leaf')",
  "tattoo_description": "1 short sentence describing the visible design — concrete, specific, range from traditional flash to cursed-text to absurd object",
  "style": "one of the STYLES exactly",
  "headline": "ALL CAPS, MAX 6 WORDS — the verdict",
  "artist_quip": "one greasy line you say while reading the verdict",
  "meaning": "3 to 5 short sentences. What this tattoo means about them. Specific. Slightly dark or absurd. No emoji.",
  "verdict_tone": "one of: intense, smirk, squint, shrug"
}
`.trim();

// ─── User prompt ─────────────────────────────────────────────────────────

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
    `New client just walked in. Look at the reference photo. Mark them.`,
    ``,
    said,
    ``,
    `Reminder: VARY THE FLAVOR. You've done this for forty years. Don't`,
    `lean on traditional anchors and roses every time. Cursed text,`,
    `absurd objects, fake logos, tiny scenes, weird placements are all`,
    `on the table. Match what feels right for THIS client.`,
    ``,
    `seed: ${opts.seed}`,
  ].join('\n');
}

function truncate(s: string, n: number): string {
  if (s.length <= n) return s;
  return s.slice(0, n - 1) + '…';
}

// ─── JSON parser ─────────────────────────────────────────────────────────

export function parseFateReading(raw: string): FateReading {
  const json = extractJson(raw);
  const headline = clean(json.headline, 'A MARK FOR YOU').toUpperCase().slice(0, 80);
  const artistQuip = clean(json.artist_quip, "Hold still. This one's yours.");
  const meaning = clean(
    json.meaning,
    'You walked in here pretending. The needle will do the rest.',
  );
  const desc = clean(json.tattoo_description, 'a small black mark, simple, deliberate');
  const placement = clean(json.placement, 'across the front of the throat');
  const subject = clean(json.subject_type, 'the client in front of you');
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
    subject_type: subject,
    style,
    verdict_tone,
  };
}

function extractJson(raw: string): Record<string, string> {
  if (!raw) return {};
  let s = raw.trim();
  s = s.replace(/^```(?:json)?\s*/i, '').replace(/```\s*$/i, '').trim();
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

// ─── Image prompt — subject-agnostic identity lock ──────────────────────
//
// The reference image might be a person, an animal, a cartoon, a plant,
// or an object. The prompt below preserves WHATEVER is in the ref and
// adds a tattoo to it. Tattoos sit on the natural surface of the subject
// (skin / fur / ceramic / plastic / peel / leaf / whatever).

export function buildTattooImagePrompt(reading: FateReading): string {
  const styleVisual = STYLE_VISUAL[reading.style];
  return [
    // ── IDENTITY LOCK — works for ANY subject type ──
    `Photo EDIT, NOT a new image. The subject in the reference photo —`,
    `whatever it is (a person, an animal, a cartoon character, a plant,`,
    `an object, anything) — must be KEPT EXACTLY AS SHOWN. Same identity,`,
    `same appearance, same proportions, same pose, same colors, same`,
    `environment, same crop. The result must be obviously and`,
    `unmistakably the SAME SUBJECT from the reference, recognizable at`,
    `first glance. Do NOT regenerate the subject. Do NOT swap to a`,
    `generic version. Do NOT stylize, idealize, or "fix" anything.`,
    `If it's a cat, it stays the same cat. If it's a mug, it stays the`,
    `same mug. If it's a cartoon, it stays in that cartoon style.`,
    ``,
    // ── THE ONE EDIT ──
    `The only change vs the reference: ON ${reading.placement}, ADD a`,
    `freshly inked tattoo: ${reading.tattoo_description}. The tattoo is`,
    `the ONLY new element. Everything else stays as in the reference.`,
    ``,
    // ── INK ──
    `Tattoo rendering: ${styleVisual}. Ink is visibly fresh, deep clean`,
    `lines. The tattoo sits naturally ON the subject's surface — whether`,
    `that's skin, fur, feathers, scales, ceramic, plastic, peel, leaf,`,
    `cloth, metal, or pixel-art shape — and follows the natural contour`,
    `of the surface at ${reading.placement}, with subtle shadow where`,
    `the design crosses surface folds or edges.`,
    ``,
    // ── BIG REMINDER ABOUT NON-HUMAN SUBJECTS ──
    `If the subject is non-human (an animal, an object, a plant, a logo,`,
    `etc) the tattoo still goes ON the subject — like a real tattoo on a`,
    `surface or a sticker that's been applied. Do NOT add a hand holding`,
    `the subject. Do NOT replace the subject with a person. Do NOT add`,
    `a person to the frame. The subject is the subject.`,
    ``,
    // ── LIGHTING / ATMOSPHERE ──
    `Lighting and crop: preserve the reference photo's lighting and crop`,
    `where reasonable. If the reference is plainly lit, you may add a`,
    `gentle warm amber tungsten lamp from above-left and a cool neon`,
    `pink-and-cyan rim light hinting at a buzzing sign just out of frame,`,
    `as if photographed in a dim tattoo parlor. Subtle 35mm film grain,`,
    `shallow depth of field, true-to-life surface texture.`,
    ``,
    `No watermark, no text overlay other than what is on the tattoo`,
    `design. No new logos.`,
  ].join(' ');
}

// ─── Display helpers ─────────────────────────────────────────────────────

/** Placement is free-form text now — return as-is, with whitespace
 *  collapsed and first letter lowercased for inline use. */
export function placementLabel(p: string): string {
  return (p || '').replace(/\s+/g, ' ').trim();
}

export function styleLabel(s: TattooStyle): string {
  return STYLE_LABEL[s];
}
