import {
  DEMO_MODE,
  MEET_OPENS_MINUTES,
  RESCHEDULE_NOTICE_HOURS,
  SESSION_MINUTES,
  SESSIONS_PER_MODULE,
} from "./config";

/**
 * Cada sesión es un escrow single-release propio. Un módulo tiene
 * SESSIONS_PER_MODULE sesiones; se agenda y paga una a la vez.
 */
export type BookingStatus =
  | "created"
  | "funded"
  | "approved"
  | "released"
  | "disputed";

export type TxKey = "deploy" | "fund" | "approve" | "release" | "dispute";

export interface Booking {
  id: string;
  moduleId: string;
  sessionNumber: number;
  wallet: string;
  contractId: string;
  engagementId: string;
  amount: number;
  sessionAt: string;
  timezone: string;
  status: BookingStatus;
  txHashes: Partial<Record<TxKey, string>>;
  createdAt: string;
}

const STORAGE_KEY = "fsh-hub:bookings:v2";

export const NEXT_STATUS: Record<BookingStatus, BookingStatus | null> = {
  created: "funded",
  funded: "approved",
  approved: "released",
  released: null,
  disputed: null,
};

const TX_KEYS: Record<BookingStatus, TxKey> = {
  created: "deploy",
  funded: "fund",
  approved: "approve",
  released: "release",
  disputed: "dispute",
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
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  } catch {
    /* storage unavailable: the booking lives only for this visit */
  }
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

export function markDisputed(
  booking: Booking,
  hash: string | undefined,
): Booking {
  return {
    ...booking,
    status: "disputed",
    txHashes: hash ? { ...booking.txHashes, dispute: hash } : booking.txHashes,
  };
}

export function rescheduleBooking(booking: Booking, sessionAt: Date): Booking {
  return { ...booking, sessionAt: sessionAt.toISOString() };
}

export interface ModuleProgress {
  sessions: Booking[];
  released: number;
  /** Sesión agendada que aún no terminó su ciclo de escrow. */
  active: Booking | null;
  disputed: Booking | null;
  nextSessionNumber: number;
  completed: boolean;
  lastReleased: Booking | null;
}

export function moduleProgress(
  bookings: Booking[],
  moduleId: string,
): ModuleProgress {
  const sessions = bookings
    .filter((booking) => booking.moduleId === moduleId)
    .sort((a, b) => a.sessionNumber - b.sessionNumber);
  const releasedSessions = sessions.filter((b) => b.status === "released");
  const released = releasedSessions.length;
  const active =
    sessions.find((b) =>
      ["created", "funded", "approved"].includes(b.status),
    ) ?? null;
  const disputed = sessions.find((b) => b.status === "disputed") ?? null;
  return {
    sessions,
    released,
    active,
    disputed,
    nextSessionNumber: released + 1,
    completed: released >= SESSIONS_PER_MODULE,
    lastReleased: releasedSessions.at(-1) ?? null,
  };
}

export function sessionStart(booking: Booking) {
  return new Date(booking.sessionAt);
}

export function sessionEnd(booking: Booking) {
  return new Date(
    new Date(booking.sessionAt).getTime() + SESSION_MINUTES * 60_000,
  );
}

export function sessionHasPassed(booking: Booking, now = new Date()) {
  return sessionStart(booking).getTime() <= now.getTime();
}

export function canReschedule(booking: Booking, now = new Date()) {
  if (booking.status !== "funded") return false;
  const hours = (sessionStart(booking).getTime() - now.getTime()) / 3_600_000;
  return hours >= RESCHEDULE_NOTICE_HOURS;
}

export function rescheduleDeadline(booking: Booking) {
  return new Date(
    sessionStart(booking).getTime() - RESCHEDULE_NOTICE_HOURS * 3_600_000,
  );
}

export function meetIsOpen(booking: Booking, now = new Date()) {
  const opens = sessionStart(booking).getTime() - MEET_OPENS_MINUTES * 60_000;
  return (
    now.getTime() >= opens && now.getTime() <= sessionEnd(booking).getTime()
  );
}

/** La persona confirma al terminar; en testnet puede hacerlo antes (demo). */
export function canConfirm(booking: Booking, now = new Date()) {
  if (booking.status !== "funded" && booking.status !== "approved")
    return false;
  return DEMO_MODE || sessionHasPassed(booking, now);
}

export function minutesUntil(booking: Booking, now = new Date()) {
  return Math.ceil((sessionStart(booking).getTime() - now.getTime()) / 60_000);
}
