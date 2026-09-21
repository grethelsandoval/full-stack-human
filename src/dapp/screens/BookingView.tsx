import {
  ArrowLeft,
  BadgeCheck,
  CalendarDays,
  Check,
  ExternalLink,
  LockKeyhole,
  LockOpen,
  PartyPopper,
  RefreshCw,
} from "lucide-react";
import type { GetEscrowsFromIndexerResponse } from "@trustless-work/escrow";
import {
  type Booking,
  formatSession,
  sessionHasPassed,
  STATUS_LABELS,
} from "../bookings";
import { trainer, type TrainingModule } from "../catalog";
import { FSH_TRAINER_ADDRESS, STELLAR_EXPERT } from "../config";
import { CopyAddress, Notice, Spinner } from "../ui";

export type ReleaseStep = "idle" | "fund" | "approve" | "release";

export interface ReleaseState {
  step: ReleaseStep;
  error: string | null;
}

const timeline: { status: Booking["status"]; label: string }[] = [
  { status: "created", label: "Escrow desplegado en Soroban" },
  { status: "funded", label: "USDC depositados en el escrow" },
  { status: "approved", label: "Sesión confirmada por el usuario" },
  { status: "released", label: "Pago liberado a la entrenadora" },
];

const ORDER: Booking["status"][] = [
  "created",
  "funded",
  "approved",
  "released",
];

export default function BookingView({
  booking,
  module,
  onchain,
  release,
  onBack,
  onFund,
  onApprove,
  onRelease,
  onRefresh,
  now = new Date(),
}: {
  booking: Booking;
  module: TrainingModule | null;
  onchain: GetEscrowsFromIndexerResponse | null;
  release: ReleaseState;
  onBack: () => void;
  onFund: () => void;
  onApprove: () => void;
  onRelease: () => void;
  onRefresh: () => void;
  now?: Date;
}) {
  const stage = ORDER.indexOf(booking.status);
  const passed = sessionHasPassed(booking, now);
  const busy = release.step !== "idle";

  return (
    <main className="da-main">
      <div className="da-breadcrumb">
        <button type="button" className="da-back" onClick={onBack}>
          <ArrowLeft size={16} /> Volver al Dashboard
        </button>
        <span className="da-mono">{booking.engagementId}</span>
      </div>

      <section className="da-card da-confirm">
        <span className="da-confirm-icon">
          {booking.status === "released" ? (
            <PartyPopper size={28} />
          ) : (
            <LockKeyhole size={28} />
          )}
        </span>
        <h1>
          {booking.status === "released"
            ? "¡Sesión completada y pago liberado!"
            : "¡Escrow Iniciado!"}
        </h1>
        <p className={`da-status ${booking.status}`}>
          {STATUS_LABELS[booking.status]}
        </p>
        <dl className="da-kv">
          <div>
            <dt>Módulo</dt>
            <dd>{module?.title ?? booking.moduleId}</dd>
          </div>
          <div>
            <dt>
              <CalendarDays size={14} /> Sesión 1
            </dt>
            <dd>
              <code>{formatSession(booking.sessionAt, booking.timezone)}</code>
            </dd>
          </div>
          <div>
            <dt>
              <BadgeCheck size={14} /> Entrenadora
            </dt>
            <dd>
              {trainer.name} · <CopyAddress address={FSH_TRAINER_ADDRESS} />
            </dd>
          </div>
          <div>
            <dt>Monto en escrow</dt>
            <dd>
              <code className="mint">{booking.amount}.00 USDC</code>
            </dd>
          </div>
          <div>
            <dt>Contrato Soroban</dt>
            <dd>
              <CopyAddress address={booking.contractId} size={6} />
              <a
                className="da-link"
                href={`${STELLAR_EXPERT}/contract/${booking.contractId}`}
                target="_blank"
                rel="noreferrer"
              >
                Ver <ExternalLink size={12} />
              </a>
            </dd>
          </div>
        </dl>
      </section>

      <section className="da-card" aria-labelledby="estado-title">
        <div className="da-section-head">
          <h2 id="estado-title">Estado del Escrow</h2>
          <button
            type="button"
            className="da-icon-button"
            aria-label="Actualizar estado on-chain"
            onClick={onRefresh}
          >
            <RefreshCw size={16} />
          </button>
        </div>
        <ol className="da-timeline">
          {timeline.map((item, index) => (
            <li
              key={item.status}
              className={
                index <= stage ? "done" : index === stage + 1 ? "next" : ""
              }
            >
              <span>{index <= stage ? <Check size={14} /> : index + 1}</span>
              {item.label}
            </li>
          ))}
        </ol>
        {onchain && (
          <dl className="da-kv da-onchain">
            <div>
              <dt>Balance on-chain</dt>
              <dd>
                <code>{onchain.balance ?? 0} USDC</code>
              </dd>
            </div>
            <div>
              <dt>Hito aprobado</dt>
              <dd>
                <code>{onchain.flags?.approved ? "sí" : "no"}</code>
              </dd>
            </div>
            <div>
              <dt>Fondos liberados</dt>
              <dd>
                <code>{onchain.flags?.released ? "sí" : "no"}</code>
              </dd>
            </div>
          </dl>
        )}
      </section>

      {booking.status !== "released" && (
        <section className="da-card da-release" aria-labelledby="liberar-title">
          <h2 id="liberar-title" className="da-h2-icon">
            <LockOpen size={20} className="mint" /> Después de la sesión
          </h2>
          <p className="da-muted">
            {booking.status === "created" &&
              "El escrow existe pero aún no está fondeado. Vuelve al checkout para completar el pago."}
            {booking.status === "funded" &&
              (passed
                ? "Tu sesión ya ocurrió. Confirma que se completó para aprobar el hito del escrow."
                : "Cuando termine tu Sesión 1, confirma aquí que se completó. Solo entonces podrás liberar los fondos.")}
            {booking.status === "approved" &&
              "Hito aprobado. Libera los fondos para que la entrenadora reciba el pago."}
          </p>
          {release.error && (
            <Notice tone="error" role="alert">
              {release.error}
            </Notice>
          )}
          {booking.status === "created" && (
            <button
              type="button"
              className="da-button da-button-gradient"
              onClick={onFund}
              disabled={busy}
            >
              {release.step === "fund" ? (
                <Spinner />
              ) : (
                <LockKeyhole size={16} />
              )}
              Depositar {booking.amount} USDC en el escrow
            </button>
          )}
          {booking.status === "funded" && (
            <button
              type="button"
              className="da-button da-button-primary"
              onClick={onApprove}
              disabled={busy}
            >
              {release.step === "approve" ? <Spinner /> : <Check size={16} />}
              Confirmar sesión completada
            </button>
          )}
          {booking.status === "approved" && (
            <button
              type="button"
              className="da-button da-button-gradient"
              onClick={onRelease}
              disabled={busy}
            >
              {release.step === "release" ? (
                <Spinner />
              ) : (
                <LockOpen size={16} />
              )}
              Liberar pago a la entrenadora
            </button>
          )}
          {!passed && booking.status === "funded" && (
            <p className="da-footnote">
              En este MVP el usuario confirma la sesión; en producción lo hará
              la entrenadora vía firma del hito.
            </p>
          )}
        </section>
      )}
    </main>
  );
}
