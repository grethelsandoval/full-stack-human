import type { CSSProperties } from "react";
import { Lock } from "lucide-react";
import { LAYERS, layerLabel, type TrainingModule } from "../catalog";
import {
  SESSION_MINUTES,
  SESSION_PRICE_USD,
  SESSIONS_PER_MODULE,
} from "../config";
import type { ModuleProgress } from "../bookings";
import { Alert, Avatar, Label, ModuleGlyph, Segments, TopBar } from "../ui";

export default function ModuleDetail({
  module,
  progress,
  onBack,
  onSchedule,
  onOpenSession,
  onClaim,
}: {
  module: TrainingModule;
  progress: ModuleProgress;
  onBack: () => void;
  onSchedule: () => void;
  onOpenSession: (id: string) => void;
  onClaim: () => void;
}) {
  const info = LAYERS[module.layer];
  const started = progress.sessions.length > 0;

  let cta;
  if (progress.completed) {
    cta = (
      <button
        type="button"
        className="fa-btn fa-btn--primary"
        onClick={onClaim}
      >
        Ver mi credencial
      </button>
    );
  } else if (progress.active) {
    const active = progress.active;
    cta = (
      <button
        type="button"
        className="fa-btn fa-btn--primary"
        onClick={() => onOpenSession(active.id)}
      >
        Ver mi sesión {active.sessionNumber}
      </button>
    );
  } else if (progress.disputed) {
    cta = (
      <Alert tone="warn">
        Tu sesión {progress.disputed.sessionNumber} está en disputa. El equipo
        FSH la revisará antes de agendar la siguiente.
      </Alert>
    );
  } else {
    cta = (
      <button
        type="button"
        className="fa-btn fa-btn--human"
        onClick={onSchedule}
      >
        {started
          ? `Agenda tu sesión ${progress.nextSessionNumber}`
          : "Agenda tu primera sesión"}
      </button>
    );
  }

  return (
    <main className="fa-main">
      <TopBar title="Módulo" onBack={onBack} />
      <div className="fa-flow">
        <div className="fa-flow-body">
          <div
            className="fa-thumb"
            style={{ "--c": info.color } as CSSProperties}
          >
            <Label color={info.color}>Módulos · {info.domain}</Label>
            <div className="fa-row fa-between fa-bottom">
              <div>
                <p className="fa-brk">
                  <span className="fa-cyan">&lt;</span>
                  {info.name}
                  <span className="fa-mint">&gt;</span>
                </p>
                <p className="fa-muted fa-mt-6">({info.domain})</p>
              </div>
              <span style={{ color: info.color }}>
                <ModuleGlyph icon={module.icon} size={48} />
              </span>
            </div>
          </div>

          <h1 className="fa-h1 fa-mt-24">{module.skill}</h1>
          <p className="fa-sm fa-mt-6" style={{ color: info.color }}>
            {module.skill} · {layerLabel(module.layer)}
          </p>
          <p className="fa-muted fa-mt-12">
            {module.definition} {module.summary}
          </p>

          {started && (
            <div className="fa-mt-20">
              <div className="fa-row fa-between">
                <Label>Tu avance</Label>
                <span className="fa-mono fa-xs fa-muted">
                  {progress.released} / {SESSIONS_PER_MODULE}
                </span>
              </div>
              <div className="fa-mt-10">
                <Segments
                  total={SESSIONS_PER_MODULE}
                  done={progress.released}
                />
              </div>
            </div>
          )}

          <dl className="fa-facts fa-mt-20">
            <div className="fa-fact">
              <dt>~{SESSIONS_PER_MODULE}</dt>
              <dd>sesiones</dd>
            </div>
            <div className="fa-fact">
              <dt>{SESSION_MINUTES} min</dt>
              <dd>por sesión</dd>
            </div>
            <div className="fa-fact">
              <dt>1 a 1</dt>
              <dd>en vivo por Meet</dd>
            </div>
            <div className="fa-fact">
              <dt>{SESSION_PRICE_USD} USDC</dt>
              <dd>por sesión · gas incluido</dd>
            </div>
          </dl>

          <Label as="h2">
            <span className="fa-block fa-mt-28">Quién te entrena</span>
          </Label>
          <div className="fa-card fa-card--tight fa-row fa-mt-12">
            <Avatar initials={module.psychologist.initials} />
            <div>
              <b>{module.psychologist.name}</b>
              <p className="fa-sm fa-muted">{module.psychologist.role}</p>
            </div>
          </div>

          <Label as="h2">
            <span className="fa-block fa-mt-28">Cómo funciona</span>
          </Label>
          <ol className="fa-steps fa-mt-6">
            <li>
              <span>
                <b>Sesión 1:</b> tu psicóloga aplica el BESSI oficial y el Big
                Five. El BESSI dice qué entrenar; el Big Five, cómo.
              </span>
            </li>
            <li>
              <span>
                <b>Sesiones 2 a {SESSIONS_PER_MODULE}:</b> práctica aplicada a
                tu trabajo real.
              </span>
            </li>
            <li>
              <span>Cada sesión se confirma y agendas la siguiente.</span>
            </li>
            <li>
              <span>
                Al confirmar la última, reclamas tu credencial verificable en
                blockchain.
              </span>
            </li>
          </ol>
          <div className="fa-mt-12">
            <Alert tone="ok" icon={<Lock size={20} />}>
              <b>Tu pago se libera solo cuando la sesión ocurre.</b> Queda en
              escrow hasta que tu psicóloga y tú confirmen la sesión.
            </Alert>
          </div>
        </div>
        <div className="fa-cta">{cta}</div>
      </div>
    </main>
  );
}
