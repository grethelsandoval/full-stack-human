import { useState, type CSSProperties } from "react";
import { Check, Download, Share2 } from "lucide-react";
import { LAYERS, layerLabel, type TrainingModule } from "../catalog";
import type { Booking } from "../bookings";
import { SESSIONS_PER_MODULE } from "../config";
import { type CredentialClaim, credentialId } from "../profile";
import { formatDay } from "../scheduling";
import { txUrl } from "../stellar";
import {
  Alert,
  ExplorerLink,
  Hash,
  IconBlockchain,
  Kv,
  LayerTag,
  RowLink,
} from "../ui";

function Emblem({
  module,
  size = 132,
}: {
  module: TrainingModule;
  size?: number;
}) {
  return (
    <span
      className="fa-emblem"
      style={
        {
          width: size,
          height: size,
          "--c": LAYERS[module.layer].color,
        } as CSSProperties
      }
      aria-hidden="true"
    >
      <img
        src="/brand/fsh-simbolo-color-dark.svg"
        alt=""
        width={Math.round(size * 0.66)}
      />
    </span>
  );
}

export function ClaimCredential({
  module,
  onClaim,
}: {
  module: TrainingModule;
  onClaim: () => void;
}) {
  return (
    <main className="fa-main fa-glow-coral">
      <div className="fa-flow">
        <div className="fa-flow-body fa-pt-40 fa-center-col">
          <p className="fa-term fa-self-start">
            <span className="fa-term-p">$</span> git commit -m{" "}
            <span className="fa-term-o">"{module.skill.toLowerCase()}"</span>
          </p>
          <div className="fa-mt-40">
            <Emblem module={module} size={160} />
          </div>
          <h1 className="fa-h1 fa-mt-24">Completaste tu módulo.</h1>
          <p className="fa-muted fa-mt-12 fa-narrow">
            {SESSIONS_PER_MODULE} sesiones confirmadas de{" "}
            <b className="fa-text">{module.skill}</b> ·{" "}
            {layerLabel(module.layer)}.
          </p>
          <div className="fa-mt-24 fa-left">
            <Alert tone="info" icon={<IconBlockchain size={20} />}>
              Tu credencial queda respaldada por los pagos liberados en
              blockchain y es permanente.
            </Alert>
          </div>
        </div>
        <div className="fa-cta">
          <button
            type="button"
            className="fa-btn fa-btn--primary"
            onClick={onClaim}
          >
            Reclama tu credencial
          </button>
        </div>
      </div>
    </main>
  );
}

export function CredentialView({
  module,
  claim,
  lastSession,
  onExplore,
}: {
  module: TrainingModule;
  claim: CredentialClaim;
  lastSession: Booking;
  onExplore: () => void;
}) {
  const [shared, setShared] = useState(false);
  const hash = lastSession.txHashes.release;
  const id = credentialId(module.id, lastSession);
  const alt = `Credencial de ${module.skill}, capa ${layerLabel(module.layer)}, emitida por Full Stack Human y verificada en blockchain`;

  async function share() {
    const text = `Completé ${module.skill} · ${layerLabel(module.layer)} en Full Stack Human: ${SESSIONS_PER_MODULE} sesiones 1 a 1 con psicólogas.`;
    const url = hash ? txUrl(hash) : window.location.href;
    try {
      if (navigator.share) {
        await navigator.share({ title: "Mi credencial FSH", text, url });
      } else {
        await navigator.clipboard.writeText(`${text} ${url}`);
        setShared(true);
        window.setTimeout(() => setShared(false), 1800);
      }
    } catch {
      /* the person closed the share sheet */
    }
  }

  return (
    <main className="fa-main fa-with-tabs">
      <div className="fa-page">
        <div className="fa-row fa-between">
          <h1 className="fa-h2">Tu credencial</h1>
          <span className="fa-row fa-gap-6 fa-mint fa-sm fa-semibold">
            <IconBlockchain size={18} /> Emitida
          </span>
        </div>

        <article className="fa-cred fa-mt-16" role="img" aria-label={alt}>
          <p className="fa-mono fa-xs fa-muted">ID · {id}</p>
          <p className="fa-label fa-mt-14">
            Credencial verificable en blockchain
          </p>
          <div className="fa-mt-8">
            <Emblem module={module} />
          </div>
          <p className="fa-sm fa-muted fa-mt-18">Se certifica que</p>
          <p className="fa-holder">{claim.holder}</p>
          <p className="fa-sm fa-muted fa-mt-6">
            completó el módulo de entrenamiento
          </p>
          <p className="fa-cred-skill">
            <span className="fa-cyan">&lt;</span>
            {module.skill}
            <span className="fa-mint">&gt;</span>
          </p>
          <div className="fa-mt-12">
            <LayerTag layer={module.layer} />
          </div>
          <dl className="fa-cred-kv">
            <Kv k="Emisión">{formatDay(new Date(claim.claimedAt))}</Kv>
            <Kv k="Metodología">
              BESSI (Soto et al., 2022; Postigo et al., 2024)
            </Kv>
            <Kv k="Emisor">Full Stack Human</Kv>
            <Kv k="Entrenó con">{module.psychologist.name} · psicóloga</Kv>
          </dl>
          {hash && (
            <div className="fa-verified">
              <span className="fa-mint">
                <IconBlockchain size={20} />
              </span>
              <div>
                <p className="fa-mono fa-xs fa-mint fa-caps">
                  Verificado en blockchain
                </p>
                <p className="fa-xs fa-muted">
                  tx <Hash value={hash} />
                </p>
              </div>
            </div>
          )}
        </article>

        {hash && (
          <div className="fa-mt-8">
            <ExplorerLink href={txUrl(hash)}>
              Ver en el explorador de Stellar
            </ExplorerLink>
          </div>
        )}
        <div className="fa-stack fa-mt-8 fa-noprint">
          <button
            type="button"
            className="fa-btn fa-btn--primary"
            onClick={() => void share()}
          >
            {shared ? <Check size={20} /> : <Share2 size={20} />}
            {shared ? "Enlace copiado" : "Compartir credencial"}
          </button>
          <button
            type="button"
            className="fa-btn fa-btn--secondary"
            onClick={() => window.print()}
          >
            <Download size={20} /> Descargar PDF
          </button>
        </div>
        <p className="fa-xs fa-muted fa-mt-12">
          Registro: transacción que liberó tu última sesión. La emisión con el
          protocolo ACTA está en integración.
        </p>
        <div className="fa-mt-20 fa-noprint">
          <RowLink onClick={onExplore}>
            <span className="fa-label">Siguiente capa</span>
            <span className="fa-sm fa-block fa-mt-4">
              Explora otro módulo de tu stack.
            </span>
          </RowLink>
        </div>
      </div>
    </main>
  );
}

export function CredentialList({
  items,
  pending,
  onOpen,
  onCatalog,
}: {
  items: { module: TrainingModule; claim: CredentialClaim }[];
  pending: TrainingModule[];
  onOpen: (module: TrainingModule) => void;
  onCatalog: () => void;
}) {
  return (
    <main className="fa-main fa-with-tabs">
      <div className="fa-page">
        <p className="fa-label">Credenciales</p>
        <h1 className="fa-h1 fa-mt-12">Lo que entrenaste, verificable.</h1>
        <div className="fa-stack-16 fa-mt-20">
          {pending.map((module) => (
            <RowLink key={module.id} onClick={() => onOpen(module)}>
              <span className="fa-label" style={{ color: "var(--fsh-mint)" }}>
                Lista para reclamar
              </span>
              <b className="fa-block fa-mt-8">{module.skill}</b>
            </RowLink>
          ))}
          {items.map(({ module, claim }) => (
            <RowLink key={module.id} onClick={() => onOpen(module)}>
              <span className="fa-row">
                <Emblem module={module} size={56} />
                <span>
                  <b className="fa-block">{module.skill}</b>
                  <span className="fa-xs fa-muted fa-block">
                    {layerLabel(module.layer)} ·{" "}
                    {formatDay(new Date(claim.claimedAt))}
                  </span>
                </span>
              </span>
            </RowLink>
          ))}
          {items.length === 0 && pending.length === 0 && (
            <div className="fa-card">
              <p className="fa-muted">
                Aún no tienes credenciales. Completa las {SESSIONS_PER_MODULE}{" "}
                sesiones de un módulo para reclamar la tuya.
              </p>
              <button
                type="button"
                className="fa-btn fa-btn--primary fa-mt-16"
                onClick={onCatalog}
              >
                Ver módulos
              </button>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
