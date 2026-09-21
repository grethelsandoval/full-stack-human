import { Fingerprint, ScanLine, ShieldCheck, Sparkles } from "lucide-react";

export default function HumanCore() {
  return (
    <div
      className="human-visual"
      aria-label="Representación de la arquitectura humana: habilidades, personalidad y potencial"
    >
      <div className="visual-coordinate top-coordinate">
        <span className="status-dot" /> HUMAN PROTOCOL <span>v.1.0</span>
      </div>
      <div className="core-glow" />
      <svg
        className="orbital-art"
        viewBox="0 0 540 540"
        fill="none"
        aria-hidden="true"
      >
        <defs>
          <linearGradient
            id="orbit"
            x1="80"
            y1="80"
            x2="430"
            y2="440"
            gradientUnits="userSpaceOnUse"
          >
            <stop stopColor="#60a5fa" />
            <stop offset=".48" stopColor="#a78bfa" />
            <stop offset="1" stopColor="#6d28d9" />
          </linearGradient>
          <radialGradient id="sphere">
            <stop stopColor="#8b5cf6" stopOpacity=".15" />
            <stop offset="1" stopColor="#8b5cf6" stopOpacity=".025" />
          </radialGradient>
        </defs>
        <circle
          cx="270"
          cy="267"
          r="188"
          stroke="#39445e"
          strokeDasharray="3 9"
          opacity=".55"
        />
        <circle
          cx="270"
          cy="267"
          r="155"
          fill="url(#sphere)"
          stroke="url(#orbit)"
          strokeOpacity=".55"
        />
        {Array.from({ length: 9 }, (_, i) => (
          <ellipse
            key={`long-${i}`}
            cx="270"
            cy="267"
            rx={16 + i * 16.8}
            ry="155"
            stroke="url(#orbit)"
            strokeOpacity={0.13 + i * 0.018}
          />
        ))}
        {Array.from({ length: 11 }, (_, i) => {
          const y = -135 + i * 27;
          return (
            <ellipse
              key={`lat-${i}`}
              cx="270"
              cy={267 + y}
              rx={Math.sqrt(155 ** 2 - y ** 2)}
              ry={14 + (1 - Math.abs(y) / 155) * 13}
              stroke="url(#orbit)"
              strokeOpacity=".26"
            />
          );
        })}
        <ellipse
          cx="270"
          cy="267"
          rx="233"
          ry="81"
          transform="rotate(-32 270 267)"
          stroke="url(#orbit)"
          strokeOpacity=".7"
        />
        <ellipse
          cx="270"
          cy="267"
          rx="208"
          ry="76"
          transform="rotate(43 270 267)"
          stroke="url(#orbit)"
          strokeOpacity=".27"
        />
        <path
          d="M110 395L140 370M400 130L433 105M107 130L86 109"
          stroke="#8793b4"
          strokeOpacity=".5"
        />
        <circle cx="455" cy="145" r="5" fill="#a78bfa" />
        <circle cx="455" cy="145" r="11" stroke="#a78bfa" strokeOpacity=".2" />
        <circle cx="83" cy="386" r="4" fill="#60a5fa" />
        <circle cx="365" cy="428" r="3" fill="#34d399" />
        <circle cx="151" cy="167" r="3" fill="#c4b5fd" />
        <circle cx="390" cy="322" r="3" fill="#c4b5fd" />
      </svg>
      <div className="core-identity">
        <Fingerprint size={112} strokeWidth={1} />
        <span>FULL STACK HUMAN</span>
      </div>
      <div className="floating-chip chip-top">
        <span className="chip-icon violet">
          <Sparkles size={18} />
        </span>
        <div>
          <small>Tu próximo upgrade</small>
          <strong>El potencial eres tú.</strong>
        </div>
      </div>
      <div className="floating-chip chip-bottom">
        <span className="chip-icon mint">
          <ShieldCheck size={19} />
        </span>
        <div>
          <small>Habilidades reales.</small>
          <strong>Impacto verificable.</strong>
        </div>
        <span className="tiny-dot" />
      </div>
      <div className="code-chip">
        <span className="text-violet-300">const</span> builder = {"{"}
        <br />
        <span className="code-indent">
          tech: <span className="text-emerald-300">'strong'</span>,
        </span>
        <br />
        <span className="code-indent">
          human: <span className="text-violet-300">'limitless'</span>
        </span>
        <br />
        {"}"};
      </div>
      <div className="visual-coordinate bottom-coordinate">
        <ScanLine size={13} /> DESIGNED FOR YOUR NEXT VERSION{" "}
        <span>01 / ∞</span>
      </div>
    </div>
  );
}
