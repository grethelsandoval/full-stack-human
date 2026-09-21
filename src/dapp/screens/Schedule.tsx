import {
  ArrowLeft,
  BadgeCheck,
  BrainCircuit,
  CalendarCheck2,
  CalendarDays,
  Check,
  ChevronLeft,
  ChevronRight,
  Clock3,
  CreditCard,
  Globe2,
  LockKeyhole,
  LockOpen,
  ShieldCheck,
  Wallet,
} from "lucide-react";
import { useMemo, useState } from "react";
import { timeSlots, trainer, type TrainingModule } from "../catalog";
import { SESSION_PRICE_USD } from "../config";
import {
  buildMonthGrid,
  combineDateTime,
  isSelectableDay,
} from "../scheduling";
import { hasEnoughUsdc } from "../stellar";
import { Notice, Spinner } from "../ui";
import type { WalletState } from "../useWallet";
import WalletCard from "./WalletCard";

export type PayStep = "idle" | "deploy" | "fund" | "done";

export interface PayState {
  step: PayStep;
  error: string | null;
}

const WEEKDAYS = ["LUN", "MAR", "MIÉ", "JUE", "VIE", "SÁB", "DOM"];
const MONTHS = [
  "Enero",
  "Febrero",
  "Marzo",
  "Abril",
  "Mayo",
  "Junio",
  "Julio",
  "Agosto",
  "Septiembre",
  "Octubre",
  "Noviembre",
  "Diciembre",
];

const PAY_LABELS: Record<PayStep, string> = {
  idle: `Pagar $${SESSION_PRICE_USD}.00 USD y Confirmar`,
  deploy: "Firma 1/2 · Creando escrow en Soroban…",
  fund: "Firma 2/2 · Depositando USDC en el escrow…",
  done: "¡Escrow Iniciado!",
};

export default function Schedule({
  module,
  wallet,
  pay,
  onBack,
  onPay,
  now = new Date(),
}: {
  module: TrainingModule;
  wallet: WalletState;
  pay: PayState;
  onBack: () => void;
  onPay: (sessionAt: Date, timezone: string) => void;
  now?: Date;
}) {
  const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
  const [view, setView] = useState({
    year: now.getFullYear(),
    month: now.getMonth(),
  });
  const [day, setDay] = useState<Date | null>(null);
  const [slot, setSlot] = useState<number | null>(null);
  const [method, setMethod] = useState<"wallet" | "fiat">("wallet");

  const cells = useMemo(
    () => buildMonthGrid(view.year, view.month),
    [view.year, view.month],
  );
  const chosen = timeSlots[slot ?? -1];
  const sessionAt =
    day && chosen ? combineDateTime(day, chosen.hour, chosen.minute) : null;
  const enough = hasEnoughUsdc(wallet.balances, SESSION_PRICE_USD);
  const busy = pay.step === "deploy" || pay.step === "fund";
  const canPay =
    sessionAt !== null &&
    method === "wallet" &&
    enough &&
    !busy &&
    pay.step !== "done";

  function shiftMonth(delta: number) {
    setView((current) => {
      const date = new Date(current.year, current.month + delta, 1);
      return { year: date.getFullYear(), month: date.getMonth() };
    });
  }

  const dayLabel = day
    ? new Intl.DateTimeFormat("es-ES", {
        weekday: "short",
        day: "numeric",
        month: "short",
      })
        .format(day)
        .replace(/\./g, "")
    : null;

  return (
    <main className="da-main">
      <div className="da-breadcrumb">
        <button type="button" className="da-back" onClick={onBack}>
          <ArrowLeft size={16} /> Volver al Detalle del Módulo
        </button>
      </div>

      <ol className="da-progress" aria-label="Progreso de la reserva">
        <li className="done">
          <span>
            <Check size={14} />
          </span>
          1. Módulo
        </li>
        <li className="current">
          <span>2</span>Agendar &amp; Pagar
        </li>
        <li className={pay.step === "done" ? "done" : ""}>
          <span>{pay.step === "done" ? <Check size={14} /> : 3}</span>
          Confirmado
        </li>
      </ol>

      <section className="da-card da-session">
        <span className="da-trainer-avatar" aria-hidden="true">
          MA
          <Check size={12} />
        </span>
        <div>
          <span className="da-tag violet">
            <BrainCircuit size={12} /> Sesión 1 Diagnóstica (45 min)
          </span>
          <h1>Diagnóstico Conductual</h1>
          <p>{module.title}</p>
          <small className="mint">
            <span className="da-dot" aria-hidden="true" /> 1 a 1 en vivo por
            Google Meet / Huddle
          </small>
        </div>
      </section>

      <section className="da-card" aria-labelledby="fecha-title">
        <div className="da-section-head da-tz">
          <span>
            <Globe2 size={16} /> <strong>{timezone}</strong>
            <small>(Detectado en tu navegador)</small>
          </span>
        </div>
        <div className="da-calendar-head">
          <h2 id="fecha-title" className="da-h2-icon">
            <CalendarDays size={20} className="blue" /> {MONTHS[view.month]}{" "}
            {view.year}
          </h2>
          <div>
            <button
              type="button"
              className="da-icon-button"
              aria-label="Mes anterior"
              onClick={() => shiftMonth(-1)}
            >
              <ChevronLeft size={18} />
            </button>
            <button
              type="button"
              className="da-icon-button"
              aria-label="Mes siguiente"
              onClick={() => shiftMonth(1)}
            >
              <ChevronRight size={18} />
            </button>
          </div>
        </div>
        <div className="da-calendar" role="grid" aria-label="Calendario">
          {WEEKDAYS.map((label) => (
            <span key={label} className="da-weekday" role="columnheader">
              {label}
            </span>
          ))}
          {cells.map((cell) => {
            const selectable = isSelectableDay(cell, now);
            const inMonth = cell.getMonth() === view.month;
            const selected = day?.toDateString() === cell.toDateString();
            return (
              <button
                key={cell.toISOString()}
                type="button"
                role="gridcell"
                className={`da-day ${inMonth ? "" : "muted"} ${
                  selectable ? "available" : ""
                } ${selected ? "selected" : ""}`}
                disabled={!selectable}
                aria-pressed={selected}
                aria-label={new Intl.DateTimeFormat("es-ES", {
                  dateStyle: "full",
                }).format(cell)}
                onClick={() => {
                  setDay(cell);
                  setSlot(null);
                }}
              >
                {cell.getDate()}
              </button>
            );
          })}
        </div>

        <div className="da-section-head">
          <h3 className="da-h2-icon">
            <Clock3 size={16} /> Horarios disponibles:{" "}
            <span className="blue">{dayLabel ?? "elige un día"}</span>
          </h3>
          <span className="da-mono mint">
            {timeSlots.filter((s) => s.available).length} vacantes
          </span>
        </div>
        <div className="da-slots">
          {timeSlots.map((time, index) => (
            <button
              key={time.label}
              type="button"
              className={`da-slot ${slot === index ? "selected" : ""}`}
              disabled={!day || !time.available}
              aria-pressed={slot === index}
              onClick={() => setSlot(index)}
            >
              {slot === index && <Check size={14} />}
              {time.label}
            </button>
          ))}
        </div>
        <p className="da-sync">
          <CalendarCheck2 size={16} />
          <span>
            Se sincronizará en tu <strong>Google Calendar</strong> y recibirás
            credenciales de acceso instantáneas tras la firma del contrato.
          </span>
        </p>
      </section>

      <section className="da-card da-summary" aria-labelledby="resumen-title">
        <div className="da-section-head">
          <h2 id="resumen-title">Resumen de Reserva</h2>
          <span className="da-mono mint">{module.id}</span>
        </div>
        <dl className="da-kv">
          <div>
            <dt>
              <strong>{module.shortTitle}</strong>
              <small>{module.sessions} Sesiones guiadas + Roadmap</small>
            </dt>
            <dd>
              <code>${SESSION_PRICE_USD}.00 USD</code>
            </dd>
          </div>
          <div>
            <dt>
              <CalendarDays size={14} /> Sesión 1 Agendada
            </dt>
            <dd data-testid="session-summary">
              <code>
                {sessionAt
                  ? `${dayLabel}, ${chosen.label}`
                  : "Selecciona fecha y hora"}
              </code>
            </dd>
          </div>
          <div>
            <dt>
              <BadgeCheck size={14} /> Especialista
            </dt>
            <dd>{trainer.name}</dd>
          </div>
          <div>
            <dt>Equivalencia en Ledger</dt>
            <dd>
              <code className="mint">
                {SESSION_PRICE_USD}.00 USDC (Stellar)
              </code>
            </dd>
          </div>
        </dl>
        <div className="da-total">
          <div>
            <small className="da-mono">TOTAL A PAGAR</small>
            <p className="da-amount">
              ${SESSION_PRICE_USD}.00 <small>USD</small>
            </p>
          </div>
          <span className="da-tag mint">
            <ShieldCheck size={12} /> Garantía Soroban
          </span>
        </div>
      </section>

      <WalletCard wallet={wallet} compact />

      <section className="da-card da-pay" aria-labelledby="pago-title">
        <h2 id="pago-title" className="da-visually-hidden">
          Método de pago
        </h2>
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
            <Wallet size={16} /> Wallet Pollar (USDC)
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={method === "fiat"}
            className={method === "fiat" ? "active" : ""}
            onClick={() => setMethod("fiat")}
          >
            <CreditCard size={16} /> Rampa Fiat / Tarjeta
          </button>
        </div>
        {method === "fiat" && (
          <Notice>
            La pasarela integrada Pollar (tarjeta / Apple Pay → USDC) llegará en
            la siguiente fase. En testnet, paga con USDC de prueba (Circle).
          </Notice>
        )}
        {method === "wallet" && !enough && (
          <Notice tone="error" role="alert">
            Necesitas al menos {SESSION_PRICE_USD} USDC de prueba. Usa el botón
            «Obtener USDC de prueba» y vuelve a intentar.
          </Notice>
        )}

        <p className="da-escrow-note">
          <LockOpen size={16} className="mint" />
          <span>
            <strong className="mint">Soroban Escrow Seguro</strong>{" "}
            <code>trustless_work_single_release</code>
            <br />
            Tus fondos quedan custodiados por el contrato inteligente y se
            liberan a la entrenadora <strong>únicamente después</strong> de
            finalizar y firmar la Sesión 1.
          </span>
        </p>

        {pay.error && (
          <Notice tone="error" role="alert">
            {pay.error}
          </Notice>
        )}

        <button
          type="button"
          className="da-button da-button-gradient"
          disabled={!canPay}
          onClick={() => sessionAt && onPay(sessionAt, timezone)}
        >
          {busy ? <Spinner /> : <LockKeyhole size={18} />}
          {PAY_LABELS[pay.step]}
        </button>
        <p className="da-footnote center">
          <ShieldCheck size={12} /> Cancelación o reprogramación flexible y
          gratuita hasta 24h antes.
        </p>
      </section>
    </main>
  );
}
