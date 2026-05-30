// "INK OF FATE" wordmark.
// - Default (small=false): large two-row title + tagline. Unused now that
//   the painted bg neon carries the visual sign role.
// - small=true: single-line wordmark chip for top-of-screen branding,
//   doesn't compete with the painted store-front neon.

export default function NeonSign({ small = false }: { small?: boolean }) {
  if (small) {
    return (
      <div className="iof-neon iof-neon--chip">
        <div className="iof-neon__title">INK OF FATE</div>
      </div>
    );
  }
  return (
    <div className="iof-neon">
      <div className="iof-neon__sign">
        <div className="iof-neon__title">INK OF FATE</div>
        <div className="iof-neon__strike" aria-hidden />
        <div className="iof-neon__tag">a tattoo your face was asking for</div>
      </div>
    </div>
  );
}
