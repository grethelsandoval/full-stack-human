import type { Booking, BookingStatus } from "./bookings";
import { findModule } from "./catalog";

/**
 * Recupera las sesiones desde los escrows en blockchain (indexador de
 * Trustless Work), para no perderlas si se borran los datos del navegador.
 */

/** Lo que la app necesita de un escrow del indexador. */
export interface ChainEscrow {
  contractId?: string;
  engagementId: string;
  description: string;
  amount: number;
  balance?: number;
  flags?: {
    approved?: boolean;
    released?: boolean;
    disputed?: boolean;
    resolved?: boolean;
  };
  /** El indexador lo entrega como fecha o texto según la versión. */
  createdAt?: unknown;
}

/** engagementId = `<módulo>-s<número de sesión>-<marca de tiempo>` */
const ENGAGEMENT = /^(.+)-s(\d+)-[0-9A-Z]+$/;
const ISO_DATE = /\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d{3})?Z/;

const RANK: Record<BookingStatus, number> = {
  created: 0,
  funded: 1,
  approved: 2,
  released: 3,
  disputed: 3,
};

function toIso(value: unknown) {
  if (typeof value !== "string" && !(value instanceof Date)) return null;
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date.toISOString();
}

export function statusFromEscrow(escrow: ChainEscrow): BookingStatus {
  const flags = escrow.flags ?? {};
  if (flags.disputed && !flags.resolved) return "disputed";
  if (flags.released) return "released";
  if (flags.approved) return "approved";
  if ((escrow.balance ?? 0) > 0) return "funded";
  return "created";
}

export function bookingFromEscrow(
  escrow: ChainEscrow,
  wallet: string,
  timezone: string,
): Booking | null {
  const match = ENGAGEMENT.exec(escrow.engagementId);
  const contractId = escrow.contractId;
  if (!match || !contractId || !findModule(match[1])) return null;
  const sessionAt = ISO_DATE.exec(escrow.description)?.[0];
  if (!sessionAt) return null;
  return {
    id: contractId,
    moduleId: match[1],
    sessionNumber: Number(match[2]),
    wallet,
    contractId,
    engagementId: escrow.engagementId,
    amount: escrow.amount,
    sessionAt,
    timezone,
    status: statusFromEscrow(escrow),
    txHashes: {},
    createdAt: toIso(escrow.createdAt) ?? sessionAt,
  };
}

/**
 * Devuelve las reservas que hay que guardar: las que faltan en el navegador
 * y las que en blockchain avanzaron más que la copia local.
 */
export function bookingsToRestore(
  local: Booking[],
  recovered: Booking[],
): Booking[] {
  const byContract = new Map(local.map((b) => [b.contractId, b]));
  const changes: Booking[] = [];
  for (const chain of recovered) {
    const mine = byContract.get(chain.contractId);
    if (!mine) {
      changes.push(chain);
    } else if (RANK[chain.status] > RANK[mine.status]) {
      changes.push({ ...mine, status: chain.status });
    }
  }
  return changes;
}
