import {
  ArrowLeft,
  BadgeCheck,
  BrainCircuit,
  Check,
  Clock3,
  CreditCard,
  Hexagon,
  LockKeyhole,
  LockOpen,
  Radio,
  Wallet,
  Workflow,
} from "lucide-react";
import { useState } from "react";
import { trainer, type TrainingModule } from "../catalog";
import { SESSION_PRICE_USD, USDC } from "../config";
import { CopyAddress } from "../ui";
import type { WalletState } from "../useWallet";

type PayMethod = "wallet" | "fiat";

export default function ModuleDetail({
  module,
  wallet,
  onBack,
  onContinue,
}: {
  module: TrainingModule;
  wallet: WalletState;
  onBack: () => void;
  onContinue: () => void;
}) {
  const [method, setMethod] = useState<PayMethod>("wallet");

  return (
    <main className="da-main">
      <div className="da-breadcrumb">
        <button type="button" className="da-back" onClick={onBack}>
          <ArrowLeft size={16} /> Volver al Catálogo
        </button>
        <span className="da-mono">
          <Workflow size={12} /> Módulos MVP &gt; Checkout
        </span>
      </div>

      <section className="da-card da-hero-card">
        <div className="da-tags">
          <span className={`da-tag ${module.domainTone}`}>
            Dominio BESSI: {module.domain}
          </span>
          <span className="da-tag blue">
            <Clock3 size={12} /> {module.sessions} Sesiones (45 min)
          </span>
          <span className="da-tag mint">
            <Radio size={12} /> 1 a 1 en vivo
          </span>
        </div>
        <h1>{module.title}</h1>
        <p className="da-hero-summary">
          <BrainCircuit size={16} /> {module.summary}
        </p>
      </section>

      <section className="da-section" aria-labelledby="aprender-title">
        <h2 id="aprender-title" className="da-h2-icon">
          <BadgeCheck size={20} className="mint" /> ¿Qué aprenderás a hacer?
        </h2>
        <p className="da-muted">
          Competencias pragmáticas calibradas para desarrolladores, leads e
          ingenieros Web3:
        </p>
        <ul className="da-outcomes">
          {module.outcomes.map((outcome) => (
            <li key={outcome.title} className="da-card">
              <span className="da-step-icon">
                <Hexagon size={18} />
              </span>
              <div>
                <h3>{outcome.title}</h3>
                <p>{outcome.description}</p>
              </div>
            </li>
          ))}
        </ul>
      </section>

      <section
        className="da-card da-section"
        aria-labelledby="estructura-title"
      >
        <div className="da-section-head">
          <h2 id="estructura-title" className="da-h2-icon">
            <Workflow size={20} /> Estructura del Entrenamiento
          </h2>
          <span className="da-mono mint">{module.phases.length} Fases</span>
        </div>
        <p className="da-muted">
          {module.sessions} Sesiones personalizadas 1 a 1 guiadas por datos
          psicométricos e hitos ejecutables:
        </p>
        <ol className="da-phases">
          {module.phases.map((phase, index) => (
            <li key={phase.title}>
              <span
                className={`da-phase-number ${index === 0 ? "current" : ""} ${
                  index === module.phases.length - 1 ? "final" : ""
                }`}
              >
                {index + 1}
              </span>
              <div>
                <h3>
                  {phase.title} <code>{phase.duration}</code>
                </h3>
                <p>{phase.description}</p>
              </div>
            </li>
          ))}
        </ol>
        <p className="da-footnote">
          *La duración estándar es de {module.sessions} sesiones. Módulos
          avanzados pueden incluir sesiones adicionales según los requerimientos
          de la habilidad.
        </p>
      </section>

      <section className="da-card da-trainer" aria-labelledby="trainer-title">
        <div className="da-section-head">
          <span className="da-mono" id="trainer-title">
            ENTRENADORA ASIGNADA
          </span>
          <span className="da-tag mint">
            <BadgeCheck size={12} /> Verificada
          </span>
        </div>
        <div className="da-trainer-id">
          <span className="da-trainer-avatar" aria-hidden="true">
            MA
            <Check size={12} />
          </span>
          <div>
            <h3>{trainer.name}</h3>
            <p className="blue">{trainer.role}</p>
            <small className="da-mono">{trainer.faculty}</small>
          </div>
        </div>
        <p className="da-muted">{trainer.bio}</p>
        <div className="da-tags">
          {trainer.badges.map((badge) => (
            <span key={badge} className="da-tag neutral">
              {badge}
            </span>
          ))}
        </div>
      </section>

      <section className="da-card da-invest" aria-labelledby="inversion-title">
        <div className="da-section-head">
          <div>
            <span className="da-mono" id="inversion-title">
              INVERSIÓN DEL MÓDULO
            </span>
            <p className="da-amount">
              ${SESSION_PRICE_USD}.00 <small>USD</small>
            </p>
          </div>
          <div className="da-equiv">
            <strong className="mint">≈ {SESSION_PRICE_USD}.00 USDC</strong>
            <small>Red Stellar (Soroban)</small>
          </div>
        </div>
        <p className="da-escrow-note">
          <LockKeyhole size={16} className="mint" />
          <span>
            <strong className="mint">Smart Contract Escrow:</strong> Tus fondos
            quedan resguardados de forma no custodial en Soroban y se liberan
            únicamente por cada sesión completada y firmada.
          </span>
        </p>

        <h3 className="da-label">Selecciona Método de Pago</h3>
        <div
          className="da-segmented"
          role="tablist"
          aria-label="Método de pago"
        >
          <button
            type="button"
            role="tab"
            aria-selected={method === "wallet"}
            className={method === "wallet" ? "active" : ""}
            onClick={() => setMethod("wallet")}
          >
            <Wallet size={16} /> Billetera Stellar
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={method === "fiat"}
            className={method === "fiat" ? "active" : ""}
            onClick={() => setMethod("fiat")}
          >
            <CreditCard size={16} /> Tarjeta / Fiat
          </button>
        </div>

        {method === "wallet" ? (
          <div className="da-connected">
            <div className="da-section-head">
              <span>
                <span className="da-dot" aria-hidden="true" /> Billetera
                Conectada
              </span>
              <span className="da-mono">POLLAR</span>
            </div>
            <dl className="da-kv">
              <div>
                <dt>Wallet:</dt>
                <dd>
                  {wallet.address ? (
                    <CopyAddress address={wallet.address} />
                  ) : (
                    "—"
                  )}
                </dd>
              </div>
              <div>
                <dt>Activo del escrow:</dt>
                <dd>
                  <code>{USDC.code} · Blend Testnet</code>
                </dd>
              </div>
              <div>
                <dt>Contrato Soroban:</dt>
                <dd>
                  <code>trustless_work_single_release</code>
                </dd>
              </div>
            </dl>
          </div>
        ) : (
          <div className="da-connected da-fiat">
            <div className="da-section-head">
              <span>Rampa SEP-24 Anchor</span>
              <span className="da-mono">Próximamente</span>
            </div>
            <p className="da-muted">
              Paga con tarjeta de crédito/débito o depósito local. Se acuñarán
              tokens USDC de custodia temporal directamente a tu sesión de
              escrow. Disponible en la siguiente fase del MVP.
            </p>
          </div>
        )}

        <button
          type="button"
          className="da-button da-button-gradient"
          onClick={onContinue}
          disabled={method !== "wallet"}
        >
          <LockOpen size={18} /> Confirmar Inscripción y Agendar Sesión 1
        </button>
        <p className="da-footnote center">
          <Clock3 size={12} /> Cancelación o reprogramación flexible de sesiones
          hasta 24h antes.
        </p>
      </section>
    </main>
  );
}
