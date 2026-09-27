import { CircleCheck, FileText, UserRound, Video } from "lucide-react";
import { catalog, LAYER_ORDER, LAYERS, type TrainingModule } from "../catalog";
import {
  type Booking,
  meetIsOpen,
  minutesUntil,
  moduleProgress,
  sessionHasPassed,
} from "../bookings";
import { DEMO_MODE, NETWORK_LABEL, SESSIONS_PER_MODULE } from "../config";
import type { CheckResult } from "../humanStackCheck";
import { formatDay, formatTime } from "../scheduling";
import { Alert, BrandSymbol, Label, RowLink, Segments } from "../ui";

function greetingDate(now: Date) {
  return new Intl.DateTimeFormat("es-ES", {
    weekday: "long",
    day: "numeric",
    month: "long",
  })
    .format(now)
    .replace(/^\p{L}/u, (c) => c.toUpperCase());
}

function NextSession({
  booking,
  module,
  now,
  onOpen,
}: {
  booking: Booking;
  module: TrainingModule;
  now: Date;
  onOpen: () => void;
}) {
  const minutes = minutesUntil(booking, now);
  const start = new Date(booking.sessionAt);
  const open = meetIsOpen(booking, now);
  const meetUrl = module.psychologist.meetUrl;
  const soon = minutes > 0 && minutes <= 60;
  const psychologistReady = DEMO_MODE || sessionHasPassed(booking, now);

  return (
    <section className="fa-card fa-next" aria-labelledby="fa-next-title">
      <Label color="var(--fsh-coral)">
        {soon
          ? "Tu sesión empieza en"
          : minutes <= 0
            ? "Tu sesión"
            : "Tu próxima sesión"}
      </Label>
      {soon ? (
        <p className="fa-bignum">
          {minutes} <span>min</span>
        </p>
      ) : (
        <p className="fa-h3 fa-mt-6">{formatDay(start, booking.timezone)}</p>
      )}
      <p className="fa-mt-6" id="fa-next-title">
        <b>{module.skill}</b> · sesión {booking.sessionNumber}
      </p>
      <p className="fa-sm fa-muted">
        {formatTime(start, booking.timezone)} · Google Meet con{" "}
        {module.psychologist.name}
      </p>
      {psychologistReady &&
        booking.status === "funded" &&
        (soon || minutes <= 0) && (
          <div className="fa-mt-16">
            <Alert tone="ok" icon={<CircleCheck size={20} />}>
              <b>{module.psychologist.name} confirmó</b> que está lista para
              darte la sesión.
            </Alert>
          </div>
        )}
      <div className="fa-stack fa-mt-16">
        {open && meetUrl && (
          <a
            className="fa-btn fa-btn--human"
            href={meetUrl}
            target="_blank"
            rel="noreferrer"
          >
            <Video size={20} /> Entrar a Meet
          </a>
        )}
        <button
          type="button"
          className="fa-btn fa-btn--secondary"
          onClick={onOpen}
        >
          Ver ticket
        </button>
      </div>
    </section>
  );
}

export default function Home({
  name,
  bookings,
  check,
  onOpenBooking,
  onOpenModule,
  onCheck,
  onCatalog,
  onProfile,
  now = new Date(),
}: {
  name: string;
  bookings: Booking[];
  check: CheckResult | null;
  onOpenBooking: (booking: Booking) => void;
  onOpenModule: (module: TrainingModule) => void;
  onCheck: () => void;
  onCatalog: () => void;
  onProfile: () => void;
  now?: Date;
}) {
  const inProgress = catalog
    .map((module) => ({
      module,
      progress: moduleProgress(bookings, module.id),
    }))
    .filter(({ progress }) => progress.sessions.length > 0);
  const upcoming = inProgress
    .map(({ module, progress }) => ({ module, booking: progress.active }))
    .filter((item): item is { module: TrainingModule; booking: Booking } =>
      Boolean(item.booking),
    )
    .sort(
      (a, b) =>
        new Date(a.booking.sessionAt).getTime() -
        new Date(b.booking.sessionAt).getTime(),
    )[0];

  return (
    <main className="fa-main fa-with-tabs fa-glow-coral">
      <div className="fa-page">
        <header className="fa-row fa-between">
          <div>
            <p className="fa-sm fa-muted">{greetingDate(now)}</p>
            <h1 className="fa-h1 fa-h1--sm">Hola, {name}</h1>
          </div>
          <div className="fa-row fa-gap-8">
            <BrandSymbol size={44} />
            <button
              type="button"
              className="fa-iconbtn fa-iconbtn--ring"
              aria-label="Perfil"
              onClick={onProfile}
            >
              <UserRound size={22} />
            </button>
          </div>
        </header>
        <p className="fa-net fa-mt-8">
          <span aria-hidden="true" /> {NETWORK_LABEL}
        </p>

        <div className="fa-stack-16 fa-mt-24">
          {upcoming ? (
            <NextSession
              booking={upcoming.booking}
              module={upcoming.module}
              now={now}
              onOpen={() => onOpenBooking(upcoming.booking)}
            />
          ) : !check ? (
            <section className="fa-card">
              <Label color="var(--fsh-mint)">Empieza aquí</Label>
              <h2 className="fa-h2 fa-mt-10">¿Tu stack está completo?</h2>
              <p className="fa-muted fa-mt-8">
                Haz el Human Stack Check: 1 minuto para saber qué capa entrenar
                primero.
              </p>
              <button
                type="button"
                className="fa-btn fa-btn--primary fa-mt-16"
                onClick={onCheck}
              >
                Haz el Human Stack Check
              </button>
            </section>
          ) : inProgress.length === 0 ? (
            <section className="fa-card">
              <Label color="var(--fsh-coral)">Siguiente paso</Label>
              <h2 className="fa-h2 fa-mt-10">Elige tu primer módulo.</h2>
              <p className="fa-muted fa-mt-8">
                Entrena 1 a 1, en vivo, con psicólogas del equipo FSH.
              </p>
              <button
                type="button"
                className="fa-btn fa-btn--primary fa-mt-16"
                onClick={onCatalog}
              >
                Ver módulos
              </button>
            </section>
          ) : null}

          {inProgress.map(({ module, progress }) => (
            <RowLink key={module.id} onClick={() => onOpenModule(module)}>
              <span className="fa-row fa-between">
                <Label as="span" color={LAYERS[module.layer].color}>
                  {progress.completed ? "Módulo completado" : "Tu módulo"}
                </Label>
                <span className="fa-mono fa-xs fa-muted">
                  {progress.released} / {SESSIONS_PER_MODULE}
                </span>
              </span>
              <b className="fa-mt-8 fa-block">{module.skill}</b>
              <span className="fa-block fa-mt-10">
                <Segments
                  total={SESSIONS_PER_MODULE}
                  done={progress.released}
                />
              </span>
            </RowLink>
          ))}

          {inProgress.length > 0 && (
            <div className="fa-card fa-card--tight fa-row">
              <span className="fa-muted">
                <FileText size={24} />
              </span>
              <div>
                <b className="fa-sm">Tus recursos</b>
                <p className="fa-xs fa-muted">
                  Tu psicóloga los compartirá aquí después de cada sesión.
                </p>
              </div>
            </div>
          )}

          {check && (
            <RowLink onClick={onCheck}>
              <Label as="span">Tu Human Stack Check</Label>
              <span className="fa-minibars fa-mt-10" aria-hidden="true">
                {LAYER_ORDER.map((layer) => (
                  <i
                    key={layer}
                    style={{
                      height: `${check.scores[layer] * 10}%`,
                      background: LAYERS[layer].color,
                    }}
                  />
                ))}
              </span>
              <span className="fa-xs fa-muted fa-block fa-mt-8">
                {LAYER_ORDER.map(
                  (l) => `${LAYERS[l].name} ${check.scores[l]}`,
                ).join(" · ")}
              </span>
            </RowLink>
          )}
        </div>
      </div>
    </main>
  );
}
