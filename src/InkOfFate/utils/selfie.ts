// Selfie preparation — resize + recompress to keep upload payloads small
// and the gen-image ref well-conditioned.

const MAX_DIM = 1024;
const JPEG_QUALITY = 0.86;

export async function prepareSelfie(input: Blob): Promise<Blob> {
  const dataUrl = await readAsDataUrl(input);
  const img = await loadImage(dataUrl);
  const { width, height } = scaledSize(img.naturalWidth, img.naturalHeight);
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');
  if (!ctx) return input;
  ctx.drawImage(img, 0, 0, width, height);
  return new Promise<Blob>((resolve) => {
    canvas.toBlob(
      (blob) => resolve(blob ?? input),
      'image/jpeg',
      JPEG_QUALITY,
    );
  });
}

function scaledSize(w: number, h: number): { width: number; height: number } {
  if (!w || !h) return { width: w, height: h };
  const long = Math.max(w, h);
  if (long <= MAX_DIM) return { width: w, height: h };
  const ratio = MAX_DIM / long;
  return { width: Math.round(w * ratio), height: Math.round(h * ratio) };
}

function readAsDataUrl(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const fr = new FileReader();
    fr.onload = () => resolve(String(fr.result));
    fr.onerror = () => reject(fr.error ?? new Error('reader failed'));
    fr.readAsDataURL(blob);
  });
}

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error('image decode failed'));
    img.src = src;
  });
}

// Used when the player picks "Use my face" — convert the platform avatar URL
// to a Blob so the same prepare+upload path works. The platform R2 host
// lacks CORS headers (per feedback_cors_canvas_image_fallback), but
// fetch().blob() doesn't need to touch the pixels — it succeeds even when
// canvas wouldn't. If even fetch fails (Safari quirks), the caller should
// fall back to feeding the URL directly to gen-image as ref_url.
export async function fetchAvatarAsBlob(url: string): Promise<Blob | null> {
  try {
    const res = await fetch(url, { mode: 'cors' });
    if (!res.ok) return null;
    return await res.blob();
  } catch {
    return null;
  }
}
