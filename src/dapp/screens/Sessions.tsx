import { Check, ChevronRight, FileText, Lock } from "lucide-react";
import { catalog, LAYERS, layerLabel, type TrainingModule } from "../catalog";
import { type Booking, moduleProgress } from "../bookings";
import { SESSIONS_PER_MODULE } from "../config";
import { formatShort } from "../scheduling";
import { Label, Segments } from "../ui";

function sessionNote(booking: Booking) {
  switch (booking.status) {
    case "released":
      return booking.sessionNumber === 1
        ? "BESSI oficial + Big Five · pago liberado"
        : "Confirmada · pago liberado";
    case "funded":
      return `Agendada · ${booking.amount}.00 USDC en escrow`;
    case "approved":
      return "Confirmada · falta liberar el pago";
    case "created":
      return "Escrow creado · falta el depósito";
    case "disputed":
      return "En disputa · pago retenido";
  }
}

function ModuleTimeline({
  module,
  bookings,
  onOpenBooking,
  onSchedule,
}: {
  module: TrainingModule;
  bookings: Booking[];
  onOpenBooking: (booking: Booking) => void;
  onSchedule: (module: TrainingModule) => void;
}) {
  const progress = moduleProgress(bookings, module.id);
  const rows = Array.from({ length: SESSIONS_PER_MODULE }, (_, index) => {
    const number = index + 1;
    return {
      number,
      booking:
        [...progress.sessions]
          .reverse()
          .find((b) => b.sessionNumber === number) ?? null,
    };
  });

  return (
    <section className="fa-section" aria-labelledby={`fa-tl-${module.id}`}>
      <Label color={LAYERS[module.layer].color}>
        {layerLabel(module.layer)}
      </Label>
      <h2 className="fa-h1 fa-h1--sm fa-mt-10" id={`fa-tl-${module.id}`}>
        {module.skill}
      </h2>
      <div className="fa-row fa-between fa-mt-16">
        <span className="fa-sm fa-muted">
          {progress.released} de {SESSIONS_PER_MODULE} sesiones confirmadas
        </span>
        <span className="fa-mono fa-xs fa-muted">
          {progress.released} / {SESSIONS_PER_MODULE}
        </span>
      </div>
      <div className="fa-mt-10">
        <Segments total={SESSIONS_PER_MODULE} done={progress.released} />
      </div>
      <ol className="fa-timeline fa-mt-24">
        {rows.map(({ number, booking }) => {
          const done = booking?.status === "released";
          const active = booking && !done;
          const canBook =
            !booking &&
            number === progress.nextSessionNumber &&
            !progress.active &&
            !progress.disputed;
          return (
            <li key={number}>
              <span
                className={`fa-tl-mark ${done ? "is-done" : active ? "is-next" : ""}`}
              >
                {done ? <Check size={16} /> : String(number).padStart(2, "0")}
              </span>
              <div className="fa-tl-body">
                <p>
                  <b className={booking ? "" : "fa-muted"}>Sesión {number}</b>
                  {booking && (
                    <span className="fa-sm fa-muted">
                      {" "}
                      ·{" "}
                      {formatShort(
                        new Date(booking.sessionAt),
                        booking.timezone,
                      )}
                    </span>
                  )}
                </p>
                {booking ? (
                  <p
                    className={`fa-xs ${active ? "fa-cyan fa-row fa-gap-6" : "fa-muted"}`}
                  >
                    {active && <Lock size={14} aria-hidden="true" />}
                    {sessionNote(booking)}
                  </p>
                ) : (
                  <p className="fa-xs fa-muted">Por agendar</p>
                )}
                {booking && (
                  <button
                    type="button"
                    className="fa-link fa-link--sm"
                    onClick={() => onOpenBooking(booking)}
                  >
                    Ver ticket <ChevronRight size={16} aria-hidden="true" />
                  </button>
                )}
                {canBook && (
                  <button
                    type="button"
                    className="fa-link fa-link--sm"
                    onClick={() => onSchedule(module)}
                  >
                    Agendar <ChevronRight size={16} aria-hidden="true" />
                  </button>
                )}
              </div>
            </li>
          );
        })}
      </ol>

      <Label as="h2">
        <span className="fa-block fa-mt-8">Tus recursos</span>
      </Label>
      <div className="fa-card fa-card--tight fa-row fa-mt-12">
        <span className="fa-muted">
          <FileText size={24} />
        </span>
        <p className="fa-sm fa-muted">
          {module.psychologist.name} compartirá aquí recursos elegidos para ti
          después de cada sesión.
        </p>
      </div>
    </section>
  );
}

export default function Sessions({
  bookings,
  onOpenBooking,
  onSchedule,
  onCatalog,
}: {
  bookings: Booking[];
  onOpenBooking: (booking: Booking) => void;
  onSchedule: (module: TrainingModule) => void;
  onCatalog: () => void;
}) {
  const modules = catalog.filter(
    (module) => moduleProgress(bookings, module.id).sessions.length > 0,
  );
  return (
    <main className="fa-main fa-with-tabs">
      <div className="fa-page">
        <Label>Sesiones</Label>
        {modules.length === 0 ? (
          <div className="fa-card fa-mt-16">
            <h1 className="fa-h2">Aún no tienes sesiones.</h1>
            <p className="fa-muted fa-mt-8">
              Elige un módulo y agenda tu primera sesión 1 a 1.
            </p>
            <button
              type="button"
              className="fa-btn fa-btn--primary fa-mt-16"
              onClick={onCatalog}
            >
              Ver módulos
            </button>
          </div>
        ) : (
          <div className="fa-stack-40 fa-mt-16">
            {modules.map((module) => (
              <ModuleTimeline
                key={module.id}
                module={module}
                bookings={bookings}
                onOpenBooking={onOpenBooking}
                onSchedule={onSchedule}
              />
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
