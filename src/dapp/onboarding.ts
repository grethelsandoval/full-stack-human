export interface TourStep {
  target: string;
  title: string;
  body: string;
}

export const TOUR_STEPS: TourStep[] = [
  {
    target: "wallet",
    title: "Tu billetera Stellar",
    body: "Pollar creó una billetera embebida ligada a tu cuenta de Google. Todo ocurre en Stellar Testnet: sin fondos reales.",
  },
  {
    target: "balances",
    title: "XLM y USDC",
    body: "XLM cubre el gas de cada transacción; USDC (Circle testnet) es lo que se deposita en el escrow de la sesión.",
  },
  {
    target: "faucets",
    title: "Fondos de prueba",
    body: "Friendbot te regala XLM automáticamente. Con “Obtener USDC de prueba” creas la trustline y abres el faucet de Circle. Cada acción muestra un enlace a la transacción on-chain.",
  },
  {
    target: "catalog",
    title: "Elige tu módulo",
    body: "Abre un módulo, agenda la sesión y paga al escrow Soroban. Los fondos quedan bloqueados y solo se liberan a la entrenadora cuando confirmas que la sesión ocurrió.",
  },
];

const KEY = "fsh-hub:onboarding";

export function hasSeenOnboarding(wallet: string) {
  try {
    return window.localStorage.getItem(`${KEY}:${wallet}`) === "done";
  } catch {
    return true;
  }
}

export function markOnboardingSeen(wallet: string) {
  try {
    window.localStorage.setItem(`${KEY}:${wallet}`, "done");
  } catch {
    /* storage unavailable: the tour simply shows again next time */
  }
}

export function resetOnboarding(wallet: string) {
  window.localStorage.removeItem(`${KEY}:${wallet}`);
}
