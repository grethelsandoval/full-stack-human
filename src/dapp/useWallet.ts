import { useCallback, useEffect, useRef, useState } from "react";
import { usePollar } from "@pollar/react";
import { USDC, USDC_FAUCET_URL } from "./config";
import {
  EMPTY_BALANCES,
  fetchBalances,
  fundWithFriendbot,
  type Balances,
} from "./stellar";

export type WalletTask = "idle" | "friendbot" | "faucet" | "refreshing";

export interface WalletState {
  address: string | null;
  email: string | null;
  isAuthenticated: boolean;
  verified: boolean;
  balances: Balances;
  loading: boolean;
  task: WalletTask;
  error: string | null;
  notice: string | null;
  login: () => void;
  logout: () => void;
  refresh: () => Promise<Balances>;
  fundXlm: () => Promise<void>;
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
      await fundWithFriendbot(address);
      await refresh();
      setNotice("Friendbot depositó XLM de prueba para cubrir el gas.");
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

  /**
   * Ensures the USDC trustline exists (signed by the Pollar wallet) and then
   * opens the Circle testnet faucet so the user can request test USDC.
   */
  const claimUsdc = useCallback(async () => {
    if (!address) return;
    setTask("faucet");
    setError(null);
    try {
      const current = await refresh();
      if (!current.hasUsdcTrustline) {
        const outcome = await pollar.setTrustline({
          code: USDC.code,
          issuer: USDC.issuer,
        });
        if (outcome.status === "error")
          throw new Error(
            outcome.details ?? "No se pudo crear la trustline de USDC.",
          );
        await refresh();
      }
      window.open(USDC_FAUCET_URL, "_blank", "noopener");
      setNotice(
        "Trustline USDC lista. Pide USDC de prueba en el faucet de Circle (red Stellar) con tu dirección y pulsa actualizar.",
      );
    } catch (cause) {
      setError(describeError(cause));
    } finally {
      setTask("idle");
    }
  }, [address, pollar, refresh]);

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

  return {
    address,
    email: pollar.isAuthenticated
      ? (pollar.getClient().getUserProfile()?.mail ?? null)
      : null,
    isAuthenticated: pollar.isAuthenticated,
    verified: pollar.verified,
    balances: address ? balances : EMPTY_BALANCES,
    loading,
    task,
    error: address ? error : null,
    notice: address ? notice : null,
    login: () => pollar.login({ provider: "google" }),
    logout: () => {
      setBalances(EMPTY_BALANCES);
      setNotice(null);
      setError(null);
      pollar.logout();
    },
    refresh,
    fundXlm,
    claimUsdc,
    signXdr,
    signAndSubmit,
  };
}
