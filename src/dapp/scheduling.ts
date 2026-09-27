export function isSelectableDay(day: Date, today: Date) {
  const start = new Date(today);
  start.setHours(0, 0, 0, 0);
  start.setDate(start.getDate() + 1);
  const limit = new Date(start);
  limit.setDate(limit.getDate() + 45);
  const weekday = day.getDay();
  return day >= start && day <= limit && weekday !== 0 && weekday !== 6;
}

export function buildMonthGrid(year: number, month: number) {
  const first = new Date(year, month, 1);
  const offset = (first.getDay() + 6) % 7;
  const cells: Date[] = [];
  for (let i = -offset; cells.length < 42; i++) {
    cells.push(new Date(year, month, 1 + i));
  }
  return cells;
}

export function combineDateTime(day: Date, hour: number, minute: number) {
  const date = new Date(day);
  date.setHours(hour, minute, 0, 0);
  return date;
}

export function browserTimezone() {
  return Intl.DateTimeFormat().resolvedOptions().timeZone;
}

function capitalize(text: string) {
  return text.replace(/\./g, "").replace(/^\p{L}/u, (c) => c.toUpperCase());
}

/** "Martes 6 oct 2026" */
export function formatDay(date: Date, timeZone?: string) {
  const parts = new Intl.DateTimeFormat("es-ES", {
    weekday: "long",
    day: "numeric",
    month: "short",
    year: "numeric",
    timeZone,
  }).formatToParts(date);
  const get = (type: string) => parts.find((p) => p.type === type)?.value ?? "";
  return capitalize(
    `${get("weekday")} ${get("day")} ${get("month")} ${get("year")}`,
  );
}

/** "Mar 6 oct · 19:00" */
export function formatShort(date: Date, timeZone?: string) {
  const day = new Intl.DateTimeFormat("es-ES", {
    weekday: "short",
    day: "numeric",
    month: "short",
    timeZone,
  })
    .format(date)
    .replace(",", "");
  return `${capitalize(day)} · ${formatTime(date, timeZone)}`;
}

/** "19:00" */
export function formatTime(date: Date, timeZone?: string) {
  return new Intl.DateTimeFormat("es-ES", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
    timeZone,
  }).format(date);
}

/** "GMT-4" */
export function offsetLabel(date: Date, timeZone?: string) {
  try {
    const part = new Intl.DateTimeFormat("en-US", {
      timeZone,
      timeZoneName: "shortOffset",
    })
      .formatToParts(date)
      .find((p) => p.type === "timeZoneName");
    return part?.value.replace("-", "−") ?? "";
  } catch {
    return "";
  }
}
