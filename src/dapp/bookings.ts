export type BookingStatus = "created" | "funded" | "approved" | "released";

export interface Booking {
  id: string;
  moduleId: string;
  wallet: string;
  contractId: string;
  engagementId: string;
  amount: number;
  sessionAt: string;
  timezone: string;
  status: BookingStatus;
  txHashes: Partial<Record<"deploy" | "fund" | "approve" | "release", string>>;
  createdAt: string;
}

const STORAGE_KEY = "fsh-hub:bookings:v1";

export const STATUS_LABELS: Record<BookingStatus, string> = {
  created: "Escrow creado · pendiente de pago",
  funded: "Pagado · fondos en escrow",
  approved: "Sesión confirmada · listo para liberar",
  released: "Pago liberado a la entrenadora",
};

export const NEXT_STATUS: Record<BookingStatus, BookingStatus | null> = {
  created: "funded",
  funded: "approved",
  approved: "released",
  released: null,
};

const TX_KEYS: Record<BookingStatus, keyof Booking["txHashes"]> = {
  created: "deploy",
  funded: "fund",
  approved: "approve",
  released: "release",
};

function readStorage(): Booking[] {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed: unknown = JSON.parse(raw);
    return Array.isArray(parsed) ? (parsed as Booking[]) : [];
  } catch {
    return [];
  }
}

export function loadBookings(wallet: string): Booking[] {
  return readStorage().filter((booking) => booking.wallet === wallet);
}

export function saveBooking(booking: Booking): Booking[] {
  const others = readStorage().filter((item) => item.id !== booking.id);
  const next = [booking, ...others];
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  return next.filter((item) => item.wallet === booking.wallet);
}

export function advanceBooking(
  booking: Booking,
  hash: string | undefined,
): Booking {
  const status = NEXT_STATUS[booking.status];
  if (!status) return booking;
  const key = TX_KEYS[status];
  return {
    ...booking,
    status,
    txHashes: hash ? { ...booking.txHashes, [key]: hash } : booking.txHashes,
  };
}

export function formatSession(iso: string, timezone: string) {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return "";
  const formatted = new Intl.DateTimeFormat("es-ES", {
    weekday: "short",
    day: "numeric",
    month: "short",
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
    timeZone: timezone,
  }).format(date);
  return formatted.replace(/\./g, "").replace(/^\w/, (c) => c.toUpperCase());
}

export function sessionHasPassed(booking: Booking, now = new Date()) {
  return new Date(booking.sessionAt).getTime() <= now.getTime();
}

export function completedBookings(bookings: Booking[]) {
  return bookings.filter((booking) => booking.status === "released");
}

export function certificateId(booking: Booking) {
  return `ACTA-${booking.moduleId}-${booking.contractId.slice(-6)}`;
}
