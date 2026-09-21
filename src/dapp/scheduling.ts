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
