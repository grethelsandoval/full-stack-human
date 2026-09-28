/* Símbolo "Código sonriente" — geometría del manual de marca (retícula 64 u).
   Fino ≥ 32 px, bold < 32 px. Colores: corchete cian, corchete menta, cabeza coral. */

type SymbolProps = {
  size?: number;
  mono?: "white" | "midnight";
  className?: string;
  title?: string;
};

const FINE = { bracket: 2.3, head: 2.3, eye: 1.9, smile: 2.1 };
const BOLD = { bracket: 4.2, head: 4.0, eye: 3.2, smile: 3.4 };

export function FshSymbol({
  size = 32,
  mono,
  className,
  title = "Full Stack Human",
}: SymbolProps) {
  const w = size < 32 ? BOLD : FINE;
  const cyan = mono ? "currentColor" : "#22C8EE";
  const mint = mono ? "currentColor" : "#3CF0B4";
  const coral = mono ? "currentColor" : "#FF6B3D";
  return (
    <svg
      className={className}
      width={size}
      height={size}
      viewBox="0 0 64 64"
      fill="none"
      strokeLinecap="round"
      strokeLinejoin="round"
      role="img"
      aria-label={title}
      style={mono === "white" ? { color: "#fff" } : mono ? { color: "#0A0F1E" } : undefined}
    >
      <polyline points="15,18 5,32 15,46" stroke={cyan} strokeWidth={w.bracket} />
      <polyline points="49,18 59,32 49,46" stroke={mint} strokeWidth={w.bracket} />
      <circle cx="32" cy="32" r="13" stroke={coral} strokeWidth={w.head} />
      <path d="M25.8 31.6 Q27.6 29.4 29.4 31.6" stroke={coral} strokeWidth={w.eye} />
      <path d="M34.6 31.6 Q36.4 29.4 38.2 31.6" stroke={coral} strokeWidth={w.eye} />
      <path d="M28.2 36.5 Q32 41.1 35.8 36.5" stroke={coral} strokeWidth={w.smile} />
    </svg>
  );
}

type LockupProps = {
  size?: number;
  href?: string;
  className?: string;
  mono?: "white" | "midnight";
};

/* Lockup horizontal: símbolo + wordmark (Bricolage Grotesque 500, tracking −2.5 %). */
export function FshLogo({ size = 32, href, className, mono }: LockupProps) {
  const content = (
    <>
      <FshSymbol size={size} mono={mono} />
      <span
        className="fsh-wordmark"
        style={{ fontSize: size * 0.74, marginLeft: size * 0.34 }}
      >
        Full Stack Human
      </span>
    </>
  );
  const cls = ["fsh-logo", className].filter(Boolean).join(" ");
  return href ? (
    <a href={href} className={cls} aria-label="Full Stack Human — inicio">
      {content}
    </a>
  ) : (
    <span className={cls}>{content}</span>
  );
}
