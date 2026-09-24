import { FRIENDBOT_URL, HORIZON_URL, STELLAR_EXPERT, USDC } from "./config";

export interface Balances {
  exists: boolean;
  xlm: string;
  usdc: string;
  hasUsdcTrustline: boolean;
}

interface HorizonBalance {
  asset_type: string;
  asset_code?: string;
  asset_issuer?: string;
  balance: string;
}

export const EMPTY_BALANCES: Balances = {
  exists: false,
  xlm: "0",
  usdc: "0",
  hasUsdcTrustline: false,
};

export async function fetchBalances(address: string): Promise<Balances> {
  const response = await fetch(`${HORIZON_URL}/accounts/${address}`, {
    headers: { Accept: "application/json" },
  });
  if (response.status === 404) return EMPTY_BALANCES;
  if (!response.ok)
    throw new Error(`Horizon respondió ${response.status} al leer la cuenta.`);
  const account = (await response.json()) as { balances: HorizonBalance[] };
  const native = account.balances.find((b) => b.asset_type === "native");
  const usdc = account.balances.find(
    (b) => b.asset_code === USDC.code && b.asset_issuer === USDC.issuer,
  );
  return {
    exists: true,
    xlm: native?.balance ?? "0",
    usdc: usdc?.balance ?? "0",
    hasUsdcTrustline: Boolean(usdc),
  };
}

export async function fundWithFriendbot(
  address: string,
): Promise<string | undefined> {
  const response = await fetch(
    `${FRIENDBOT_URL}?addr=${encodeURIComponent(address)}`,
  );
  const body = await response.text();
  if (response.ok) {
    try {
      const parsed: unknown = JSON.parse(body);
      if (hasHash(parsed)) return parsed.hash;
    } catch {
      /* Friendbot answered without a JSON body */
    }
    return undefined;
  }
  if (response.status === 400 && /createAccountAlreadyExist/i.test(body))
    return undefined;
  throw new Error(`Friendbot respondió ${response.status}.`);
}

function hasHash(value: unknown): value is { hash: string } {
  return (
    typeof value === "object" &&
    value !== null &&
    "hash" in value &&
    typeof value.hash === "string"
  );
}

/** Hash of the most recent transaction submitted by `address` (Horizon). */
export async function latestTxHash(
  address: string,
): Promise<string | undefined> {
  try {
    const response = await fetch(
      `${HORIZON_URL}/accounts/${address}/transactions?order=desc&limit=1`,
      { headers: { Accept: "application/json" } },
    );
    if (!response.ok) return undefined;
    const page = (await response.json()) as {
      _embedded?: { records?: { hash?: string }[] };
    };
    return page._embedded?.records?.[0]?.hash;
  } catch {
    return undefined;
  }
}

export function txUrl(hash: string) {
  return `${STELLAR_EXPERT}/tx/${hash}`;
}

export function shortAddress(address: string, size = 4) {
  if (address.length <= size * 2 + 3) return address;
  return `${address.slice(0, size)}...${address.slice(-size)}`;
}

export function formatAmount(value: string | number, decimals = 2) {
  const number = typeof value === "number" ? value : Number.parseFloat(value);
  if (!Number.isFinite(number)) return "0.00";
  return number.toLocaleString("en-US", {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });
}

export function hasEnoughUsdc(balances: Balances, amount: number) {
  return Number.parseFloat(balances.usdc) >= amount;
}
