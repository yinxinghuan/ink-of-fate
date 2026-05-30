// ─── Domain types ────────────────────────────────────────────────────────

export type TattooStyle =
  | 'sailor-jerry'
  | 'japanese-irezumi'
  | 'stick-and-poke'
  | 'tribal-blackwork'
  | 'minimal-script'
  | 'fine-line'
  | 'gothic-blackletter';

/** The artist's reaction face shown next to the verdict. The LLM picks one
 *  matching the tone of its reading. */
export type VerdictTone = 'intense' | 'smirk' | 'squint' | 'shrug';

export interface FateReading {
  /** ALL-CAPS, ≤6 words. */
  headline: string;
  /** Greasy one-liner the artist says. */
  artist_quip: string;
  /** 3-5 sentence "this is what you need" reading. */
  meaning: string;
  /** Short visual description of the design (used downstream in image prompt). */
  tattoo_description: string;
  /** Free-form short phrase describing WHERE the tattoo goes on the
   *  subject. May be a face spot ("left cheek", "throat") if the subject
   *  is human/cartoon, or a surface ("on the mug, opposite the handle",
   *  "across the cat's forehead", "on the banana peel") for anything else. */
  placement: string;
  /** Free-form short phrase identifying what the subject is. Used so the
   *  player sees the artist actually clocked what they brought in
   *  ("a fluffy ginger cat" / "a yellow ceramic mug"). */
  subject_type: string;
  style: TattooStyle;
  verdict_tone: VerdictTone;
}

export interface Tattoo {
  id: string;
  imageUrl: string;
  selfieUrl: string;
  reading: FateReading;
  ticketNumber: string;
  signedDate: string;
  createdAt: number;
}

export interface InkOfFateSave {
  tattoos: Tattoo[];
  _lastActive?: number;
}

export interface WallEntry {
  userId: string;
  userName?: string;
  userAvatarUrl?: string;
  tattoo: Tattoo;
}

export type Phase = 'booth' | 'studio' | 'processing' | 'result' | 'wall';
