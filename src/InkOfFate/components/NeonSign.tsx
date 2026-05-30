// The buzzing "INK OF FATE" neon sign. SVG + CSS animations.
// Used on the booth (large) and faintly behind processing.

export default function NeonSign({ small = false }: { small?: boolean }) {
  return (
    <div className={small ? 'iof-neon iof-neon--small' : 'iof-neon'}>
      <div className="iof-neon__sign">
        <div className="iof-neon__title">INK OF FATE</div>
        <div className="iof-neon__strike">
          <span className="iof-neon__needle" aria-hidden />
          <span className="iof-neon__needle iof-neon__needle--2" aria-hidden />
          <span className="iof-neon__needle iof-neon__needle--3" aria-hidden />
        </div>
        <div className="iof-neon__tag">a tattoo your face was asking for</div>
      </div>
    </div>
  );
}
