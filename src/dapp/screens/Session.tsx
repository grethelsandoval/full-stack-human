import { useState, type CSSProperties, type ReactNode } from "react";
import {
  Check,
  CircleCheck,
  Clock,
  Fingerprint,
  Lock,
  RefreshCw,
  User,
  Video,
} from "lucide-react";
import { LAYERS, layerLabel, type TrainingModule } from "../catalog";
import {
  type Booking,
  canConfirm,
  canReschedule,
  meetIsOpen,
  type ModuleProgress,
  rescheduleDeadline,
  sessionEnd,
  sessionHasPassed,
} from "../bookings";
import {
  DEMO_MODE,
  MEET_OPENS_MINUTES,
  RESCHEDULE_NOTICE_HOURS,
  SESSIONS_PER_MODULE,
  STELLAR_EXPERT,
} from "../config";
import { formatDay, formatShort, formatTime, offsetLabel } from "../scheduling";
import { formatAmount } from "../stellar";
import {
  Alert,
  Avatar,
  ExplorerLink,
  Hash,
  IconCredencial,
  Kv,
  Label,
  Segments,
  Spinner,
  TopBar,
  TxLink,
} from "../ui";

export type ConfirmStep = "idle" | "fund" | "approve" | "release" | "dispute";

export interface ConfirmState {
  step: ConfirmStep;
  error: string | null;
}

function EscrowStatus({ booking }: { booking: Booking }) {
  const amount = `${formatAmount(booking.amount)} USDC`;
  const copy: Record<Booking["status"], { title: string; body: string }> = {
    created: {
      title: "Escrow creado · falta el depósito",
      body: "El contrato existe, pero todavía no recibió tu pago.",
    },
    funded: {
      title: `${amount} retenidos en escrow`,
      body: "Se liberan cuando tu psicóloga confirme al inicio de la sesión y tú confirmes al terminar.",
    },
    approved: {
      title: "Sesión confirmada · falta liberar",
      body: "Registramos tu confirmación. Falta la firma que libera el pago.",
    },
    released: {
      title: `${amount} liberados`,
      body: "Ambas partes confirmaron la sesión y el escrow liberó el pago.",
    },
    disputed: {
      title: "Sesión en disputa",
      body: "El pago sigue retenido mientras el equipo FSH revisa lo que pasó.",
    },
  };
  const tone =
    booking.status === "released"
      ? "fa-mint"
      : booking.status === "disputed"
        ? "fa-warning"
        : "fa-cyan";
  return (
    <div className="fa-card fa-card--tight fa-mt-12">
      <div className="fa-row fa-top">
        <span className={tone}>
          {booking.status === "released" ? (
            <CircleCheck size={24} />
          ) : (
            <Lock size={24} />
          )}
        </span>
        <div>
          <b>{copy[booking.status].title}</b>
          <p className="fa-sm fa-muted fa-mt-4">{copy[booking.status].body}</p>
        </div>
      </div>
      <ExplorerLink href={`${STELLAR_EXPERT}/contract/${booking.contractId}`}>
        Ver escrow en el explorador
      </ExplorerLink>
    </div>
  );
}

export function Ticket({
  booking,
  module,
  busy,
  error,
  fresh,
  onBack,
  onFund,
  onReschedule,
  onConfirm,
  now = new Date(),
}: {
  booking: Booking;
  module: TrainingModule;
  busy: boolean;
  error: string | null;
  fresh: boolean;
  onBack: () => void;
  onFund: () => void;
  onReschedule: () => void;
  onConfirm: () => void;
  now?: Date;
}) {
  const info = LAYERS[module.layer];
  const start = new Date(booking.sessionAt);
  const open = meetIsOpen(booking, now);
  const meetUrl = module.psychologist.meetUrl;
  const confirmable = canConfirm(booking, now);
  const passed = sessionHasPassed(booking, now);

  return (
    <main className="fa-main fa-with-tabs">
      <TopBar title={`Sesión ${booking.sessionNumber}`} onBack={onBack} />
      <div className="fa-page fa-pt-0">
        {fresh && booking.status === "funded" && (
          <p className="fa-row fa-gap-10 fa-mint fa-semibold">
            <CircleCheck size={24} /> Sesión agendada y pagada
          </p>
        )}
        <article
          className="fa-ticket fa-mt-16"
          style={{ "--c": info.color } as CSSProperties}
          aria-label="Ticket de la sesión"
        >
          <div className="fa-ticket-top">
            <Label color={info.color}>{layerLabel(module.layer)}</Label>
            <h1 className="fa-h2 fa-mt-10">{module.skill}</h1>
            <p className="fa-mono fa-sm fa-muted fa-mt-6">
              Sesión {booking.sessionNumber} de ~{SESSIONS_PER_MODULE}
            </p>
          </div>
          <div className="fa-ticket-perf" aria-hidden="true" />
          <dl className="fa-ticket-bot">
            <Kv k="Fecha">{formatDay(start, booking.timezone)}</Kv>
            <Kv k="Hora">
              {formatTime(start, booking.timezone)} –{" "}
              {formatTime(sessionEnd(booking), booking.timezone)}{" "}
              <span className="fa-xs fa-muted">
                {offsetLabel(start, booking.timezone)}
              </span>
            </Kv>
            <Kv k="Psicóloga">
              <span className="fa-row fa-gap-8 fa-end">
                <Avatar initials={module.psychologist.initials} size={28} />
                {module.psychologist.name}
              </span>
            </Kv>
            <Kv k="Dónde">Google Meet</Kv>
          </dl>
        </article>

        <EscrowStatus booking={booking} />
        {booking.txHashes.fund && (
          <div className="fa-mt-4">
            <TxLink
              hash={booking.txHashes.fund}
              label="Ver tu pago en el explorador"
            />
          </div>
        )}

        {error && (
          <div className="fa-mt-12">
            <Alert tone="error">{error}</Alert>
          </div>
        )}

        <div className="fa-stack fa-mt-16">
          {booking.status === "created" && (
            <button
              type="button"
              className="fa-btn fa-btn--primary"
              disabled={busy}
              onClick={onFund}
            >
              {busy ? <Spinner /> : <Lock size={20} />}
              Depositar {formatAmount(booking.amount)} USDC en el escrow
            </button>
          )}

          {(booking.status === "funded" || booking.status === "approved") && (
            <>
              {open && meetUrl ? (
                <a
                  className="fa-btn fa-btn--human"
                  href={meetUrl}
                  target="_blank"
                  rel="noreferrer"
                >
                  <Video size={20} /> Entrar a Meet
                </a>
              ) : (
                <button type="button" className="fa-btn" disabled>
                  <Video size={20} />
                  {!meetUrl
                    ? "Enlace de Meet · pendiente"
                    : `Entrar a Meet · se activa ${MEET_OPENS_MINUTES} min antes`}
                </button>
              )}
              {confirmable && (
                <button
                  type="button"
                  className="fa-btn fa-btn--primary"
                  onClick={onConfirm}
                >
                  <Check size={20} /> Confirmar que recibí la sesión
                </button>
              )}
              {canReschedule(booking, now) && (
                <button
                  type="button"
                  className="fa-btn fa-btn--secondary"
                  onClick={onReschedule}
                >
                  <RefreshCw size={20} /> Reprogramar
                </button>
              )}
            </>
          )}
        </div>
        {(booking.status === "funded" || booking.status === "approved") && (
          <p className="fa-xs fa-muted fa-center fa-mt-12">
            {DEMO_MODE && !passed
              ? "Testnet: puedes confirmar antes de la hora para probar el flujo."
              : `Puedes reprogramar sin costo hasta ${RESCHEDULE_NOTICE_HOURS} h antes.`}
          </p>
        )}
      </div>
    </main>
  );
}

export function Reschedule({
  booking,
  children,
}: {
  booking: Booking;
  children: (notice: ReactNode) => ReactNode;
}) {
  const deadline = rescheduleDeadline(booking);
  const notice = (
    <div className="fa-stack fa-mb-20">
      <Alert tone="info" icon={<Clock size={20} />}>
        Puedes reprogramar sin costo hasta el{" "}
        <b>{formatShort(deadline, booking.timezone)}</b> (
        {RESCHEDULE_NOTICE_HOURS} h antes).
      </Alert>
      <div className="fa-card fa-card--tight">
        <p className="fa-xs fa-muted">Horario actual</p>
        <p className="fa-mt-4 fa-strike fa-muted">
          {formatShort(new Date(booking.sessionAt), booking.timezone)}
        </p>
      </div>
      <p className="fa-xs fa-muted">
        Tu pago sigue en el mismo escrow. Si no asistes y no reprogramaste a
        tiempo, la sesión entra en disputa.
      </p>
    </div>
  );
  return <>{children(notice)}</>;
}

export function ConfirmSession({
  booking,
  module,
  state,
  onClose,
  onConfirm,
  onDispute,
}: {
  booking: Booking;
  module: TrainingModule;
  state: ConfirmState;
  onClose: () => void;
  onConfirm: () => void;
  onDispute: () => void;
}) {
  const [disputeOpen, setDisputeOpen] = useState(false);
  const last = booking.sessionNumber >= SESSIONS_PER_MODULE;
  const busy = state.step !== "idle";
  const psychologist = module.psychologist;
  const stepLabel =
    state.step === "approve"
      ? "Firma 1 de 2 · registrando tu confirmación…"
      : state.step === "release"
        ? "Firma 2 de 2 · liberando el pago…"
        : state.step === "dispute"
          ? "Abriendo la disputa…"
          : null;

  return (
    <main className="fa-main">
      <TopBar close onBack={busy ? undefined : onClose} />
      <div className="fa-flow">
        <div className="fa-flow-body">
          <Label>
            {last
              ? `Sesión ${booking.sessionNumber} de ${SESSIONS_PER_MODULE} · la última`
              : `Sesión ${booking.sessionNumber} · ${module.skill}`}
          </Label>
          <h1 className="fa-h1 fa-mt-12">
            {last ? "¿Recibiste tu última sesión?" : "¿Recibiste tu sesión?"}
          </h1>
          <p className="fa-muted fa-mt-12">
            {last
              ? "Al confirmar se libera el último pago y completas el módulo."
              : `Al confirmar, los ${formatAmount(booking.amount)} USDC del escrow se liberan a tu psicóloga.`}
          </p>
          {last && (
            <div className="fa-mt-20">
              <Segments
                total={SESSIONS_PER_MODULE}
                done={SESSIONS_PER_MODULE - 1}
                current
              />
            </div>
          )}

          <ul
            className="fa-card fa-card--list fa-mt-24"
            aria-label="Confirmaciones"
          >
            <li className="fa-confirm-row">
              <span className="fa-check-dot is-done">
                <Check size={18} />
              </span>
              <div>
                <b>{psychologist.name} confirmó</b>
                <p className="fa-xs fa-muted">
                  {DEMO_MODE
                    ? "Al inicio · simulado en testnet"
                    : `Al inicio · ${formatTime(new Date(booking.sessionAt), booking.timezone)}`}
                </p>
              </div>
            </li>
            <li className="fa-confirm-row">
              <span
                className={`fa-check-dot ${booking.status === "approved" ? "is-done" : "is-pending"}`}
              >
                {booking.status === "approved" ? (
                  <Check size={18} />
                ) : (
                  <User size={16} />
                )}
              </span>
              <div>
                <b>Tu confirmación</b>
                <p
                  className={`fa-xs ${booking.status === "approved" ? "fa-muted" : "fa-cyan"}`}
                >
                  {booking.status === "approved"
                    ? "Registrada · falta liberar el pago"
                    : "Pendiente"}
                </p>
              </div>
            </li>
          </ul>

          {last && (
            <div className="fa-card fa-card--tight fa-row fa-mt-16">
              <span className="fa-warning">
                <IconCredencial />
              </span>
              <p className="fa-sm">
                Después podrás reclamar tu{" "}
                <b>credencial verificable en blockchain</b>.
              </p>
            </div>
          )}

          <p className="fa-xs fa-muted fa-mt-16">
            Si no confirmas ni reportas un problema en{" "}
            <span className="fa-tbd">[PLAZO POR COMPLETAR]</span>, la sesión
            entra en disputa.
          </p>

          <div className="fa-stack fa-mt-12">
            {stepLabel && <Alert tone="info">{stepLabel}</Alert>}
            {state.error && <Alert tone="error">{state.error}</Alert>}
            {disputeOpen && !busy && (
              <div className="fa-card fa-card--tight">
                <b>¿Abrir una disputa?</b>
                <p className="fa-sm fa-muted fa-mt-4">
                  El pago queda retenido y el equipo FSH revisará qué pasó con
                  tu sesión antes de liberarlo o devolverlo.
                </p>
                <div className="fa-stack fa-mt-12">
                  <button
                    type="button"
                    className="fa-btn fa-btn--secondary"
                    onClick={onDispute}
                  >
                    Sí, abrir disputa
                  </button>
                  <button
                    type="button"
                    className="fa-link fa-center-self"
                    onClick={() => setDisputeOpen(false)}
                  >
                    Cancelar
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
        <div className="fa-cta">
          <button
            type="button"
            className="fa-btn fa-btn--primary"
            disabled={busy}
            onClick={onConfirm}
          >
            {busy && state.step !== "dispute" ? (
              <Spinner />
            ) : (
              <Fingerprint size={20} />
            )}
            {booking.status === "approved"
              ? "Liberar el pago"
              : last
                ? "Confirmar y completar el módulo"
                : "Confirmar que recibí la sesión"}
          </button>
          {!disputeOpen && (
            <button
              type="button"
              className="fa-link fa-center-self"
              disabled={busy}
              onClick={() => setDisputeOpen(true)}
            >
              Tuve un problema con la sesión
            </button>
          )}
        </div>
      </div>
    </main>
  );
}

export function Released({
  booking,
  progress,
  onNext,
  onHome,
  onClaim,
}: {
  booking: Booking;
  progress: ModuleProgress;
  onNext: () => void;
  onHome: () => void;
  onClaim: () => void;
}) {
  const hash = booking.txHashes.release;
  return (
    <main className="fa-main fa-glow-mint">
      <div className="fa-flow">
        <div className="fa-flow-body fa-pt-48">
          <span className="fa-success-dot" aria-hidden="true">
            <Check size={36} />
          </span>
          <h1 className="fa-h1 fa-mt-24">
            Sesión {booking.sessionNumber} confirmada.
          </h1>
          <p className="fa-muted fa-mt-10">
            El escrow liberó el pago.{" "}
            {booking.sessionNumber === 1
              ? "Ya diste tu primer commit."
              : "Un commit más en tu stack."}
          </p>
          <dl className="fa-card fa-card--list fa-mt-24">
            <Kv k="Estado">
              <span className="fa-mint">Liberado</span>
            </Kv>
            <Kv k="Monto">{formatAmount(booking.amount)} USDC</Kv>
            {hash && (
              <Kv k="Transacción">
                <Hash value={hash} />
              </Kv>
            )}
          </dl>
          {hash && <TxLink hash={hash} />}
          <div className="fa-row fa-between fa-mt-24">
            <Label>Tu módulo</Label>
            <span className="fa-mono fa-xs fa-muted">
              {progress.released} / {SESSIONS_PER_MODULE}
            </span>
          </div>
          <div className="fa-mt-10">
            <Segments total={SESSIONS_PER_MODULE} done={progress.released} />
          </div>
        </div>
        <div className="fa-cta">
          {progress.completed ? (
            <button
              type="button"
              className="fa-btn fa-btn--primary"
              onClick={onClaim}
            >
              Continuar
            </button>
          ) : (
            <>
              <button
                type="button"
                className="fa-btn fa-btn--human"
                onClick={onNext}
              >
                Agenda tu siguiente sesión
              </button>
              <button
                type="button"
                className="fa-btn fa-btn--secondary"
                onClick={onHome}
              >
                Ir al inicio
              </button>
            </>
          )}
        </div>
      </div>
    </main>
  );
}
