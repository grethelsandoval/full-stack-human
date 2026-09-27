import type { Booking } from "./bookings";

const NAME_KEY = "fsh-hub:name";
const CLAIM_KEY = "fsh-hub:credentials";

export function loadName(wallet: string): string | null {
  try {
    return window.localStorage.getItem(`${NAME_KEY}:${wallet}`);
  } catch {
    return null;
  }
}

export function saveName(wallet: string, name: string) {
  try {
    window.localStorage.setItem(`${NAME_KEY}:${wallet}`, name.trim());
  } catch {
    /* storage unavailable: the name lives only for this visit */
  }
}

export function firstName(name: string | null) {
  return name?.trim().split(/\s+/)[0] ?? "";
}

export interface CredentialClaim {
  wallet: string;
  moduleId: string;
  holder: string;
  claimedAt: string;
}

function readClaims(): CredentialClaim[] {
  try {
    const raw = window.localStorage.getItem(CLAIM_KEY);
    const parsed: unknown = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? (parsed as CredentialClaim[]) : [];
  } catch {
    return [];
  }
}

export function loadClaims(wallet: string) {
  return readClaims().filter((claim) => claim.wallet === wallet);
}

export function saveClaim(claim: CredentialClaim) {
  const others = readClaims().filter(
    (item) =>
      !(item.wallet === claim.wallet && item.moduleId === claim.moduleId),
  );
  try {
    window.localStorage.setItem(CLAIM_KEY, JSON.stringify([claim, ...others]));
  } catch {
    /* storage unavailable */
  }
}

/** ID legible: FSH-CRED-<MÓDULO>-<últimos 6 del escrow de la última sesión>. */
export function credentialId(moduleId: string, lastSession: Booking) {
  const code = moduleId
    .split("-")
    .filter((part) => part.length > 2)
    .map((part) => part[0].toUpperCase())
    .join("");
  return `FSH-CRED-${code}-${lastSession.contractId.slice(-6).toUpperCase()}`;
}
