export const NETWORK = "testnet" as const;
export const NETWORK_LABEL = "Stellar Testnet";
export const APP_VERSION = "v0.9.4";

export const HORIZON_URL = "https://horizon-testnet.stellar.org";
export const FRIENDBOT_URL = "https://friendbot.stellar.org/";
export const STELLAR_EXPERT = "https://stellar.expert/explorer/testnet";

/** Blend Capital testnet faucet (same endpoint the official Blend UI uses). */
export const BLEND_FAUCET_URL =
  "https://ewqw4hx7oa.execute-api.us-east-1.amazonaws.com/getAssets";

/** USDC issued by the Blend Capital testnet faucet. */
export const USDC = {
  code: "USDC",
  issuer: "GATALTGTWIOT6BUDBCZM3Q4OQ4BO2COLOAZ7IYSKPLC2PMSOPPGF5V56",
  contract: "CAQCFVLOBK5GIULPNZRGATJJMIZL5BSP7X5YJVMGCPTUEPFM4AVSRCJU",
} as const;

/** FSH Hub testnet role accounts (public keys only). */
export const FSH_PLATFORM_ADDRESS =
  "GC2QIRT6HRQCOCUKJZ27E7CXJ2QH4O7FWYYNBSIG2B2JG4KMBWWTSM6X";
export const FSH_TRAINER_ADDRESS =
  "GC6ZG3IFQ5PH74RCYFTB352KM7CN22RG2AKOOFESGNNB2W7HKNTSUV6Y";

export const SESSION_PRICE_USD = 30;
export const PLATFORM_FEE_PERCENT = 0;

export const env = {
  pollarKey: import.meta.env.VITE_POLLAR_PUBLISHABLE_KEY as string | undefined,
  trustlessWorkKey: import.meta.env.VITE_TRUSTLESS_WORK_API_KEY as
    | string
    | undefined,
};

export const LANDING_URL = "/";
export const DOCS_URL = "https://github.com/grethelsandoval/full-stack-human";
export const STELLAR_URL = "https://stellar.org";
