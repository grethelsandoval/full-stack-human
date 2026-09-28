import { Check, CircleDashed } from "lucide-react";

const stack = [
  { name: "frontend", status: "compila" },
  { name: "backend", status: "compila" },
  { name: "smart contracts", status: "compila" },
  { name: "infra / devops", status: "compila" },
] as const;

/** Terminal "fsh stack --status": el stack técnico compila, la capa humana no se mide. */
export default function HumanCore() {
  return (
    <div
      className="stack-terminal"
      role="img"
      aria-label="Terminal: fsh stack --status. Frontend, backend, smart contracts e infra compilan; la capa humana está sin medir y sin entrenar."
    >
      <div className="terminal-top">
        <span className="window-dots" aria-hidden="true">
          <i />
          <i />
          <i />
        </span>
        <span>fsh — zsh</span>
      </div>
      <pre className="terminal-body" aria-hidden="true">
        fsh stack --status{"\n"}
        {stack.map((layer) => (
          <span key={layer.name} className="terminal-row">
            <span className="terminal-name">{layer.name}</span>
            <span className="terminal-ok">
              <Check size={14} strokeWidth={2.5} /> {layer.status}
            </span>
          </span>
        ))}
        <span className="terminal-row human">
          <span className="terminal-name">capa humana</span>
          <span className="terminal-warn">
            <CircleDashed size={14} /> sin medir · sin entrenar
          </span>
        </span>
        <span className="terminal-comment">
          // tu stack está completo. te falta una capa.
        </span>
      </pre>
    </div>
  );
}
