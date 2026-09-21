import {
  ArrowRight,
  BadgeCheck,
  BrainCircuit,
  Clock3,
  Compass,
  LockKeyhole,
  Mic2,
  Sparkles,
  SlidersHorizontal,
  UserPlus,
} from "lucide-react";
import { catalog, type TrainingModule } from "../catalog";
import { type Booking, formatSession, STATUS_LABELS } from "../bookings";
import { SESSION_PRICE_USD } from "../config";
import type { WalletState } from "../useWallet";
import WalletCard from "./WalletCard";

export type UserMode = "new" | "returning";

const steps = [
  {
    icon: Compass,
    title: "Paso 1: Elige tu desafío",
    text: "Elige el módulo que más te interese entrenar de nuestro catálogo adaptativo.",
  },
  {
    icon: BrainCircuit,
    title: "Paso 2: Diagnóstico Inicial Personalizado",
    text: "En tu 1.ª sesión, la entrenadora evaluará el nivel de tus habilidades blandas y tus rasgos de personalidad para adaptar el aprendizaje a tus fortalezas y necesidades, ¡es un entrenamiento totalmente personalizado!",
  },
  {
    icon: BadgeCheck,
    title: "Paso 3: Certificación On-Chain",
    text: "Completa el entrenamiento y reclama tu certificado inmutable en la red Stellar (Soroban ACTA).",
  },
];

function ModuleCard({
  module,
  onSelect,
}: {
  module: TrainingModule;
  onSelect: (module: TrainingModule) => void;
}) {
  const Icon = module.domainTone === "blue" ? Mic2 : Sparkles;
  return (
    <article className="da-card da-module">
      <div className="da-module-top">
        <span className={`da-tag ${module.domainTone}`}>
          <Icon size={12} /> {module.domain}
        </span>
        <span className="da-meta">
          <Clock3 size={13} /> {module.weeks}
        </span>
      </div>
      <h3>{module.title}</h3>
      <p>{module.summary}</p>
      <div className="da-module-bottom">
        <div className="da-price">
          <small>Inversión</small>
          <strong>
            ${SESSION_PRICE_USD} USDC <span>/ XLM</span>
          </strong>
        </div>
        <button
          type="button"
          className="da-button da-button-primary"
          onClick={() => onSelect(module)}
        >
          Iniciar Módulo (${SESSION_PRICE_USD}) <ArrowRight size={16} />
        </button>
      </div>
    </article>
  );
}

export default function Dashboard({
  wallet,
  bookings,
  mode,
  onMode,
  onSelectModule,
  onOpenBooking,
}: {
  wallet: WalletState;
  bookings: Booking[];
  mode: UserMode;
  onMode: (mode: UserMode) => void;
  onSelectModule: (module: TrainingModule) => void;
  onOpenBooking: (booking: Booking) => void;
}) {
  return (
    <main className="da-main">
      <div className="da-sim-bar">
        <span>
          <SlidersHorizontal size={14} /> Modo de Simulación
        </span>
        <span className="da-mono">MENÚ</span>
      </div>
      <div
        className="da-mode-switch"
        role="tablist"
        aria-label="Tipo de usuario"
      >
        <button
          type="button"
          role="tab"
          aria-selected={mode === "new"}
          className={mode === "new" ? "active" : ""}
          onClick={() => onMode("new")}
        >
          <UserPlus size={16} /> Usuario Nuevo
        </button>
        <button
          type="button"
          role="tab"
          aria-selected={mode === "returning"}
          className={mode === "returning" ? "active" : ""}
          onClick={() => onMode("returning")}
        >
          <BadgeCheck size={16} /> Usuario Recurrente
        </button>
      </div>

      <WalletCard wallet={wallet} />

      {mode === "returning" && (
        <section className="da-section" aria-labelledby="reservas-title">
          <div className="da-section-head">
            <h2 id="reservas-title">Mis Sesiones</h2>
            <span className="da-mono mint">
              {bookings.length} reserva{bookings.length === 1 ? "" : "s"}
            </span>
          </div>
          {bookings.length === 0 ? (
            <p className="da-empty">
              Todavía no tienes sesiones pagadas. Elige un módulo para crear tu
              primer escrow.
            </p>
          ) : (
            <ul className="da-booking-list">
              {bookings.map((booking) => {
                const module = catalog.find((m) => m.id === booking.moduleId);
                return (
                  <li key={booking.id}>
                    <button
                      type="button"
                      onClick={() => onOpenBooking(booking)}
                    >
                      <span>
                        <strong>{module?.title ?? booking.moduleId}</strong>
                        <small>
                          {formatSession(booking.sessionAt, booking.timezone)}
                        </small>
                      </span>
                      <span className={`da-status ${booking.status}`}>
                        {STATUS_LABELS[booking.status]}
                      </span>
                    </button>
                  </li>
                );
              })}
            </ul>
          )}
        </section>
      )}

      <section className="da-card da-intro">
        <span className="da-tag violet">
          <BrainCircuit size={12} /> FSH Human Framework
        </span>
        <h1>Construye tu arquitectura humana.</h1>
        <p>
          {mode === "new"
            ? "Aún no tienes un perfil evaluado. Selecciona tu primer módulo para agendar tu sesión de diagnóstico inicial con una Entrenadora certificada."
            : "Continúa tu entrenamiento. Revisa el estado de tus escrows, confirma sesiones completadas y libera los pagos a tu entrenadora."}
        </p>
      </section>

      <section className="da-section" aria-labelledby="como-title">
        <div className="da-section-head">
          <h2 id="como-title">¿Cómo funciona?</h2>
          <span className="da-mono mint">3 Pasos Simples</span>
        </div>
        <ol className="da-steps">
          {steps.map((step) => (
            <li key={step.title} className="da-card">
              <span className="da-step-icon">
                <step.icon size={20} />
              </span>
              <div>
                <h3>{step.title}</h3>
                <p>{step.text}</p>
              </div>
            </li>
          ))}
        </ol>
      </section>

      <section
        className="da-section"
        id="catalogo"
        aria-labelledby="catalogo-title"
      >
        <div className="da-section-head">
          <h2 id="catalogo-title">Catálogo de Módulos MVP</h2>
          <span className="da-mono">
            <LockKeyhole size={12} /> Escrow Protegido
          </span>
        </div>
        <div className="da-module-grid">
          {catalog.map((module) => (
            <ModuleCard
              key={module.id}
              module={module}
              onSelect={onSelectModule}
            />
          ))}
        </div>
      </section>
    </main>
  );
}
