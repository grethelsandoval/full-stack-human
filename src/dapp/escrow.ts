import { useCallback, useMemo } from "react";
import {
  useApproveMilestone,
  useFundEscrow,
  useGetEscrowFromIndexerByContractIds,
  useInitializeEscrow,
  useReleaseFunds,
  useSendTransaction,
  useStartDispute,
  type GetEscrowsFromIndexerResponse,
  type InitializeSingleReleaseEscrowPayload,
  type InitializeSingleReleaseEscrowResponse,
} from "@trustless-work/escrow";
import { layerLabel, type TrainingModule } from "./catalog";
import {
  FSH_PLATFORM_ADDRESS,
  FSH_TRAINER_ADDRESS,
  PLATFORM_FEE_PERCENT,
  SESSION_MINUTES,
  SESSION_PRICE_USD,
  USDC,
} from "./config";
import { latestTxHash } from "./stellar";

export const ESCROW_TYPE = "single-release" as const;

export interface EscrowSigner {
  address: string;
  signXdr: (xdr: string) => Promise<string>;
}

export function buildEscrowPayload(
  module: TrainingModule,
  sessionNumber: number,
  wallet: string,
  sessionAt: string,
  engagementId: string,
): InitializeSingleReleaseEscrowPayload {
  return {
    signer: wallet,
    engagementId,
    title: `${module.skill} · Sesión ${sessionNumber}`,
    description: `Sesión ${sessionNumber} (${SESSION_MINUTES} min, 1 a 1) de ${module.skill} · ${layerLabel(module.layer)} con ${module.psychologist.name}. Agendada para ${sessionAt}. El pago se libera cuando la sesión se confirma.`,
    roles: {
      approver: wallet,
      releaseSigner: wallet,
      serviceProvider: FSH_TRAINER_ADDRESS,
      receiver: FSH_TRAINER_ADDRESS,
      platformAddress: FSH_PLATFORM_ADDRESS,
      disputeResolver: FSH_PLATFORM_ADDRESS,
    },
    amount: SESSION_PRICE_USD,
    platformFee: PLATFORM_FEE_PERCENT,
    trustline: { address: USDC.issuer, symbol: USDC.code },
    milestones: [
      {
        description: `Sesión ${sessionNumber} completada — ${module.skill}`,
      },
    ],
  };
}

export function createEngagementId(
  moduleId: string,
  sessionNumber: number,
  now = Date.now(),
) {
  return `${moduleId}-s${sessionNumber}-${now.toString(36).toUpperCase()}`;
}

function assertSuccess<T extends { status: string; message?: string }>(
  response: T,
  fallback: string,
): T {
  if (response.status !== "SUCCESS")
    throw new Error(response.message || fallback);
  return response;
}

export interface EscrowActions {
  deploy: (
    module: TrainingModule,
    sessionNumber: number,
    signer: EscrowSigner,
    sessionAt: string,
  ) => Promise<{ contractId: string; engagementId: string; hash?: string }>;
  fund: (
    contractId: string,
    signer: EscrowSigner,
  ) => Promise<string | undefined>;
  approve: (
    contractId: string,
    signer: EscrowSigner,
  ) => Promise<string | undefined>;
  release: (
    contractId: string,
    signer: EscrowSigner,
  ) => Promise<string | undefined>;
  dispute: (
    contractId: string,
    signer: EscrowSigner,
  ) => Promise<string | undefined>;
  read: (contractId: string) => Promise<GetEscrowsFromIndexerResponse | null>;
}

export function useEscrow(): EscrowActions {
  const { deployEscrow } = useInitializeEscrow();
  const { fundEscrow } = useFundEscrow();
  const { approveMilestone } = useApproveMilestone();
  const { releaseFunds } = useReleaseFunds();
  const { startDispute } = useStartDispute();
  const { sendTransaction } = useSendTransaction();
  const { getEscrowByContractIds } = useGetEscrowFromIndexerByContractIds();

  const signAndSend = useCallback(
    async (
      unsigned: string | undefined,
      signer: EscrowSigner,
      step: string,
    ) => {
      if (!unsigned)
        throw new Error(`Trustless Work no devolvió la transacción (${step}).`);
      const signed = await signer.signXdr(unsigned);
      const result = assertSuccess(
        await sendTransaction(signed),
        `La red rechazó la transacción (${step}).`,
      );
      const hash = await latestTxHash(signer.address);
      return { ...result, hash };
    },
    [sendTransaction],
  );

  const deploy = useCallback<EscrowActions["deploy"]>(
    async (module, sessionNumber, signer, sessionAt) => {
      const engagementId = createEngagementId(module.id, sessionNumber);
      const payload = buildEscrowPayload(
        module,
        sessionNumber,
        signer.address,
        sessionAt,
        engagementId,
      );
      const { unsignedTransaction } = assertSuccess(
        await deployEscrow(payload, ESCROW_TYPE),
        "No se pudo preparar el contrato escrow.",
      );
      const result = (await signAndSend(
        unsignedTransaction,
        signer,
        "deploy",
      )) as Partial<InitializeSingleReleaseEscrowResponse> & { hash?: string };
      if (!result.contractId)
        throw new Error("Trustless Work no devolvió el ID del contrato.");
      return { contractId: result.contractId, engagementId, hash: result.hash };
    },
    [deployEscrow, signAndSend],
  );

  const fund = useCallback<EscrowActions["fund"]>(
    async (contractId, signer) => {
      const { unsignedTransaction } = assertSuccess(
        await fundEscrow(
          { contractId, signer: signer.address, amount: SESSION_PRICE_USD },
          ESCROW_TYPE,
        ),
        "No se pudo preparar el pago al escrow.",
      );
      const result = await signAndSend(unsignedTransaction, signer, "fund");
      return result.hash;
    },
    [fundEscrow, signAndSend],
  );

  const approve = useCallback<EscrowActions["approve"]>(
    async (contractId, signer) => {
      const { unsignedTransaction } = assertSuccess(
        await approveMilestone(
          {
            contractId,
            milestoneIndex: "0",
            approver: signer.address,
          },
          ESCROW_TYPE,
        ),
        "No se pudo preparar la confirmación de la sesión.",
      );
      const result = await signAndSend(unsignedTransaction, signer, "approve");
      return result.hash;
    },
    [approveMilestone, signAndSend],
  );

  const release = useCallback<EscrowActions["release"]>(
    async (contractId, signer) => {
      const { unsignedTransaction } = assertSuccess(
        await releaseFunds(
          { contractId, releaseSigner: signer.address },
          ESCROW_TYPE,
        ),
        "No se pudo preparar la liberación del pago.",
      );
      const result = await signAndSend(unsignedTransaction, signer, "release");
      return result.hash;
    },
    [releaseFunds, signAndSend],
  );

  const dispute = useCallback<EscrowActions["dispute"]>(
    async (contractId, signer) => {
      const { unsignedTransaction } = assertSuccess(
        await startDispute({ contractId, signer: signer.address }, ESCROW_TYPE),
        "No se pudo abrir la disputa.",
      );
      const result = await signAndSend(unsignedTransaction, signer, "dispute");
      return result.hash;
    },
    [startDispute, signAndSend],
  );

  const read = useCallback<EscrowActions["read"]>(
    async (contractId) => {
      const escrows = await getEscrowByContractIds({
        contractIds: [contractId],
        validateOnChain: true,
      });
      return escrows[0] ?? null;
    },
    [getEscrowByContractIds],
  );

  return useMemo(
    () => ({ deploy, fund, approve, release, dispute, read }),
    [deploy, fund, approve, release, dispute, read],
  );
}
