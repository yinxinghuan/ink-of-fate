// Orchestrates: optional upload (or use the player's Aigram avatar URL
// directly) + LLM single-call JSON reading + img2img tattoo render.
//
// The LLM decides placement + style + design, then we build a
// subject-agnostic img2img prompt around it (see feedback in prompts.ts).

import { useCallback, useRef, useState } from 'react';
import { useGenImage, useUpload } from '@shared/runtime';
import { prepareSelfie } from '../utils/selfie';
import {
  FATE_SYSTEM,
  buildFateUserPrompt,
  buildTattooImagePrompt,
  parseFateReading,
} from '../utils/prompts';
import { newSeed, newTattooId, signedDate } from '../utils/booking';
import type { FateReading, Tattoo } from '../types';

const CHAT_URL = 'https://chat.aiwaves.tech/aigram/api/game-chat';

async function chatOnce(system: string, user: string): Promise<string> {
  const res = await fetch(CHAT_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      messages: [
        { role: 'system', content: system },
        { role: 'user', content: user },
      ],
    }),
  });
  if (!res.ok) throw new Error(`chat failed: HTTP ${res.status}`);
  const json = (await res.json()) as { choices?: Array<{ message?: { content?: string } }> };
  return json.choices?.[0]?.message?.content ?? '';
}

export type Stage = '' | 'sourcing' | 'studying' | 'inking' | 'stamping';

export type SelfieSource =
  | { kind: 'file'; file: File }
  | { kind: 'avatar-url'; url: string };

interface GenInput {
  source: SelfieSource;
  question?: string;
  ticketNumber: string;
}

export interface UseFateGen {
  generate: (input: GenInput) => Promise<Tattoo>;
  loading: boolean;
  stage: Stage;
  error: Error | null;
}

export function useFateGen(): UseFateGen {
  const { generate: genImg } = useGenImage();
  const { upload } = useUpload();

  const [loading, setLoading] = useState(false);
  const [stage, setStage] = useState<Stage>('');
  const [error, setError] = useState<Error | null>(null);
  const inFlight = useRef(false);

  const generate = useCallback(
    async ({ source, question, ticketNumber }: GenInput): Promise<Tattoo> => {
      if (inFlight.current) throw new Error('fate-gen: already in flight');
      inFlight.current = true;
      setLoading(true);
      setError(null);

      try {
        // 1) Source the selfie URL. Either upload a fresh file, or use the
        //    Aigram avatar URL directly (already public HTTPS).
        setStage('sourcing');
        const selfieUrl = await sourceSelfieUrl(source, upload);

        // 2) Chat — single call returns JSON. Use the question (if any) and
        //    a fresh seed so the verdict varies between runs.
        setStage('studying');
        const seed = newSeed();
        const userTurn = buildFateUserPrompt({ question, seed });
        const raw = await chatOnce(FATE_SYSTEM, userTurn);
        const reading: FateReading = parseFateReading(raw);

        // 3) Image — img2img with the selfie ref + scene-only prompt.
        setStage('inking');
        const prompt = buildTattooImagePrompt(reading);
        const imageUrl = await genImg({ prompt, ref_url: selfieUrl });

        // 4) Pre-warm + settle.
        await preloadImage(imageUrl);
        setStage('stamping');
        await new Promise((r) => setTimeout(r, 380));

        const tattoo: Tattoo = {
          id: newTattooId(),
          imageUrl,
          selfieUrl,
          reading,
          ticketNumber,
          signedDate: signedDate(),
          createdAt: Date.now(),
        };
        return tattoo;
      } catch (e) {
        const err = e instanceof Error ? e : new Error(String(e));
        setError(err);
        throw err;
      } finally {
        inFlight.current = false;
        setLoading(false);
        setStage('');
      }
    },
    [genImg, upload],
  );

  return { generate, loading, stage, error };
}

async function sourceSelfieUrl(
  source: SelfieSource,
  upload: (file: Blob, name?: string) => Promise<{ url: string }>,
): Promise<string> {
  if (source.kind === 'avatar-url') {
    return source.url;
  }
  const prepared = await prepareSelfie(source.file);
  const up = await upload(prepared, 'selfie.jpg');
  return up.url;
}

function preloadImage(url: string): Promise<void> {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => resolve();
    img.onerror = () => resolve();
    img.src = url;
  });
}
