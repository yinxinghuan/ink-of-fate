// ─── Domain types ────────────────────────────────────────────────────────

export type Placement =
  | 'left-cheek'
  | 'right-cheek'
  | 'throat'
  | 'side-of-neck'
  | 'behind-ear'
  | 'forehead'
  | 'jawline'
  | 'under-eye'
  | 'collarbone'
  | 'temple';

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
  placement: Placement;
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
