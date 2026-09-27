import { useMemo, useState, type ReactNode } from "react";
import { ChevronLeft, ChevronRight, Globe } from "lucide-react";
import { type Psychologist, timeSlots } from "../catalog";
import { SESSION_MINUTES } from "../config";
import {
  browserTimezone,
  buildMonthGrid,
  combineDateTime,
  isSelectableDay,
  offsetLabel,
} from "../scheduling";
import { Avatar, Label, TopBar } from "../ui";

const WEEKDAYS = ["L", "M", "M", "J", "V", "S", "D"];

function monthTitle(year: number, month: number) {
  const text = new Intl.DateTimeFormat("es-ES", {
    month: "long",
    year: "numeric",
  }).format(new Date(year, month, 1));
  return text.replace(" de ", " ").replace(/^\p{L}/u, (c) => c.toUpperCase());
}

/** El calendario abre en el mes del primer día agendable. */
function firstSelectableDay(now: Date) {
  const day = new Date(now);
  for (let i = 0; i < 10; i++) {
    day.setDate(day.getDate() + 1);
    if (isSelectableDay(day, now)) return new Date(day);
  }
  return new Date(now);
}

function dayTitle(day: Date) {
  const text = new Intl.DateTimeFormat("es-ES", {
    weekday: "long",
    day: "numeric",
    month: "long",
  }).format(day);
  return text.replace(/^\p{L}/u, (c) => c.toUpperCase());
}

export default function Schedule({
  title,
  step,
  psychologist,
  ctaLabel,
  busy = false,
  notice,
  onBack,
  onConfirm,
  now = new Date(),
}: {
  title: string;
  step?: string;
  psychologist: Psychologist;
  ctaLabel: string;
  busy?: boolean;
  notice?: ReactNode;
  onBack: () => void;
  onConfirm: (sessionAt: Date, timezone: string) => void;
  now?: Date;
}) {
  const timezone = browserTimezone();
  const [view, setView] = useState(() => {
    const first = firstSelectableDay(now);
    return { year: first.getFullYear(), month: first.getMonth() };
  });
  const [day, setDay] = useState<Date | null>(null);
  const [slot, setSlot] = useState<number | null>(null);

  const cells = useMemo(
    () => buildMonthGrid(view.year, view.month),
    [view.year, view.month],
  );
  const chosen = slot === null ? null : timeSlots[slot];
  const sessionAt =
    day && chosen ? combineDateTime(day, chosen.hour, chosen.minute) : null;

  function shiftMonth(delta: number) {
    setView((current) => {
      const date = new Date(current.year, current.month + delta, 1);
      return { year: date.getFullYear(), month: date.getMonth() };
    });
  }

  return (
    <main className="fa-main">
      <TopBar title={title} step={step} onBack={onBack} />
      <div className="fa-flow">
        <div className="fa-flow-body">
          {notice}
          <p className="fa-row fa-sm fa-gap-10">
            <Avatar initials={psychologist.initials} size={36} />
            <span>
              Con <b>{psychologist.name}</b> · {SESSION_MINUTES} min · Meet
            </span>
          </p>

          <div className="fa-row fa-between fa-mt-20">
            <h2 className="fa-h3" id="fa-month">
              {monthTitle(view.year, view.month)}
            </h2>
            <div className="fa-row fa-gap-0">
              <button
                type="button"
                className="fa-iconbtn"
                aria-label="Mes anterior"
                onClick={() => shiftMonth(-1)}
              >
                <ChevronLeft size={22} />
              </button>
              <button
                type="button"
                className="fa-iconbtn"
                aria-label="Mes siguiente"
                onClick={() => shiftMonth(1)}
              >
                <ChevronRight size={22} />
              </button>
            </div>
          </div>
          <div
            className="fa-cal fa-mt-8"
            role="grid"
            aria-labelledby="fa-month"
          >
            {WEEKDAYS.map((label, index) => (
              <span key={index} className="fa-cal-w" role="columnheader">
                {label}
              </span>
            ))}
            {cells.map((cell) => {
              const inMonth = cell.getMonth() === view.month;
              if (!inMonth) return <span key={cell.toISOString()} />;
              const selectable = isSelectableDay(cell, now);
              const selected = day?.toDateString() === cell.toDateString();
              return (
                <button
                  key={cell.toISOString()}
                  type="button"
                  role="gridcell"
                  className={`fa-cal-d ${selectable ? "is-av" : ""} ${
                    selected ? "is-sel" : ""
                  }`}
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

          <Label as="h2">
            <span className="fa-block fa-mt-20">
              {day ? dayTitle(day) : "Elige un día"}
            </span>
          </Label>
          <div className="fa-slots fa-mt-12" role="group" aria-label="Horarios">
            {timeSlots.map((time, index) => (
              <button
                key={time.label}
                type="button"
                className={`fa-slot ${slot === index ? "is-sel" : ""}`}
                disabled={!day}
                aria-pressed={slot === index}
                onClick={() => setSlot(index)}
              >
                {time.label}
              </button>
            ))}
          </div>
          <p className="fa-xs fa-muted fa-row fa-gap-6 fa-mt-12">
            <Globe size={16} aria-hidden="true" /> Horario de tu zona:{" "}
            {timezone} ({offsetLabel(sessionAt ?? now, timezone)})
          </p>
        </div>
        <div className="fa-cta">
          <button
            type="button"
            className="fa-btn fa-btn--primary"
            disabled={!sessionAt || busy}
            onClick={() => sessionAt && onConfirm(sessionAt, timezone)}
          >
            {ctaLabel}
          </button>
        </div>
      </div>
    </main>
  );
}
