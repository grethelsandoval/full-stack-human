import { useCallback, useEffect, useRef, useState } from "react";
import { usePollar } from "@pollar/react";
import { USDC, USDC_FAUCET_URL } from "./config";
import {
  EMPTY_BALANCES,
  fetchBalances,
  fundWithFriendbot,
  type Balances,
} from "./stellar";

export type WalletTask =
  | "idle"
  | "friendbot"
  | "trustline"
  | "faucet"
  | "refreshing";

export interface WalletTx {
  label: string;
  hash: string;
}

export interface WalletState {
  address: string | null;
  email: string | null;
  /** Nombre y apellido del perfil de Google (Pollar). */
  profileName: string | null;
  isAuthenticated: boolean;
  verified: boolean;
  balances: Balances;
  loading: boolean;
  task: WalletTask;
  error: string | null;
  notice: string | null;
  lastTx: WalletTx | null;
  login: () => void;
  logout: () => void;
  refresh: () => Promise<Balances>;
  fundXlm: () => Promise<void>;
  enableUsdc: () => Promise<boolean>;
  claimUsdc: () => Promise<void>;
  signXdr: (xdr: string) => Promise<string>;
  signAndSubmit: (xdr: string) => Promise<string>;
}

function describeError(error: unknown) {
  if (error instanceof Error) return error.message;
  return "Ocurrió un error inesperado.";
}

export function useWallet(): WalletState {
  const pollar = usePollar();
  const address = pollar.wallet?.address ?? null;
  const [balances, setBalances] = useState<Balances>(EMPTY_BALANCES);
  const [loading, setLoading] = useState(false);
  const [task, setTask] = useState<WalletTask>("idle");
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [lastTx, setLastTx] = useState<WalletTx | null>(null);
  const autoFunded = useRef<string | null>(null);

  const refresh = useCallback(async () => {
    if (!address) return EMPTY_BALANCES;
    setLoading(true);
    try {
      const next = await fetchBalances(address);
      setBalances(next);
      return next;
    } catch (cause) {
      setError(describeError(cause));
      return EMPTY_BALANCES;
    } finally {
      setLoading(false);
    }
  }, [address]);

  const fundXlm = useCallback(async () => {
    if (!address) return;
    setTask("friendbot");
    setError(null);
    try {
      const hash = await fundWithFriendbot(address);
      await refresh();
      setNotice("Friendbot depositó XLM de prueba para cubrir el gas.");
      if (hash) setLastTx({ label: "Friendbot", hash });
    } catch (cause) {
      setError(describeError(cause));
    } finally {
      setTask("idle");
    }
  }, [address, refresh]);

  const signXdr = useCallback(
    async (xdr: string) => {
      const outcome = await pollar.getClient().signTx(xdr);
      if (outcome.status !== "signed")
        throw new Error(
          outcome.message ??
            outcome.details ??
            "No se pudo firmar la transacción.",
        );
      return outcome.signedXdr;
    },
    [pollar],
  );

  const signAndSubmit = useCallback(
    async (xdr: string) => {
      const outcome = await pollar.signAndSubmitTx(xdr);
      if (outcome.status === "error")
        throw new Error(
          outcome.message ??
            outcome.details ??
            outcome.resultCode ??
            "La red rechazó la transacción.",
        );
      return outcome.hash;
    },
    [pollar],
  );

  /** Creates the USDC trustline (signed by the Pollar wallet) when missing. */
  const ensureTrustline = useCallback(async () => {
    const current = await refresh();
    if (current.hasUsdcTrustline) return;
    const outcome = await pollar.setTrustline({
      code: USDC.code,
      issuer: USDC.issuer,
    });
    if (outcome.status === "error")
      throw new Error(
        outcome.details ?? "No se pudo activar USDC en tu wallet.",
      );
    await refresh();
    if (outcome.hash) setLastTx({ label: "Activar USDC", hash: outcome.hash });
  }, [pollar, refresh]);

  const enableUsdc = useCallback(async () => {
    if (!address) return false;
    setTask("trustline");
    setError(null);
    try {
      await ensureTrustline();
      setNotice("Tu wallet ya puede recibir USDC.");
      return true;
    } catch (cause) {
      setError(describeError(cause));
      return false;
    } finally {
      setTask("idle");
    }
  }, [address, ensureTrustline]);

  /**
   * Ensures the USDC trustline exists and then opens the Circle testnet
   * faucet so the user can request test USDC.
   */
  const claimUsdc = useCallback(async () => {
    if (!address) return;
    setTask("faucet");
    setError(null);
    try {
      await ensureTrustline();
      window.open(USDC_FAUCET_URL, "_blank", "noopener");
      setNotice(
        "En el faucet de Circle elige «Stellar Testnet», pega tu dirección y vuelve para actualizar tu saldo.",
      );
    } catch (cause) {
      setError(describeError(cause));
    } finally {
      setTask("idle");
    }
  }, [address, ensureTrustline]);

  useEffect(() => {
    if (!address) return;
    let cancelled = false;
    (async () => {
      const current = await refresh();
      if (cancelled || current.exists || autoFunded.current === address) return;
      autoFunded.current = address;
      await fundXlm();
    })();
    return () => {
      cancelled = true;
    };
  }, [address, refresh, fundXlm]);

  const profile = pollar.isAuthenticated
    ? pollar.getClient().getUserProfile()
    : null;

  return {
    address,
    email: profile?.mail ?? null,
    profileName:
      [profile?.first_name, profile?.last_name].filter(Boolean).join(" ") ||
      null,
    isAuthenticated: pollar.isAuthenticated,
    verified: pollar.verified,
    balances: address ? balances : EMPTY_BALANCES,
    loading,
    task,
    error: address ? error : null,
    notice: address ? notice : null,
    lastTx: address ? lastTx : null,
    login: () => pollar.login({ provider: "google" }),
    logout: () => {
      setBalances(EMPTY_BALANCES);
      setNotice(null);
      setLastTx(null);
      setError(null);
      pollar.logout();
    },
    refresh,
    fundXlm,
    enableUsdc,
    claimUsdc,
    signXdr,
    signAndSubmit,
  };
}
