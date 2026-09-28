import { useState } from "react";
import {
  Check,
  CreditCard,
  Droplets,
  Lock,
  RefreshCw,
  Users,
  Wallet,
} from "lucide-react";
import type { TrainingModule } from "../catalog";
import {
  NETWORK,
  SESSION_PRICE_USD,
  SESSIONS_PER_MODULE,
  USDC,
} from "../config";
import { formatShort } from "../scheduling";
import { formatAmount, hasEnoughUsdc } from "../stellar";
import type { WalletState } from "../useWallet";
import {
  Alert,
  CopyButton,
  IconBlockchain,
  Kv,
  Label,
  Spinner,
  TopBar,
  TxLink,
} from "../ui";

export type PayStep = "idle" | "deploy" | "fund";

export interface PayState {
  step: PayStep;
  error: string | null;
}

const PAY_LABELS: Record<PayStep, string> = {
  idle: `Pagar ${formatAmount(SESSION_PRICE_USD)} USDC`,
  deploy: "Firma 1 de 2 · preparando tu escrow…",
  fund: "Firma 2 de 2 · depositando en el escrow…",
};

function EscrowFlow() {
  const steps = [
    { icon: <Wallet size={18} />, label: "Pagas" },
    { icon: <Lock size={18} />, label: "Queda retenido" },
    { icon: <Users size={18} />, label: "Ambas confirman" },
    { icon: <Check size={18} />, label: "Se libera", done: true },
  ];
  return (
    <ol className="fa-flowline" aria-label="Cómo protege tu pago el escrow">
      {steps.map((step) => (
        <li key={step.label}>
          <span className={`fa-flowline-dot ${step.done ? "is-done" : ""}`}>
            {step.icon}
          </span>
          {step.label}
        </li>
      ))}
    </ol>
  );
}

export default function Payment({
  module,
  sessionNumber,
  sessionAt,
  timezone,
  wallet,
  pay,
  escrowConfigured,
  onBack,
  onPay,
  onTopUp,
}: {
  module: TrainingModule;
  sessionNumber: number;
  sessionAt: Date;
  timezone: string;
  wallet: WalletState;
  pay: PayState;
  escrowConfigured: boolean;
  onBack: () => void;
  onPay: () => void;
  onTopUp: () => void;
}) {
  const enough = hasEnoughUsdc(wallet.balances, SESSION_PRICE_USD);
  const missing = Math.max(
    0,
    SESSION_PRICE_USD - Number.parseFloat(wallet.balances.usdc || "0"),
  );
  const busy = pay.step !== "idle";

  return (
    <main className="fa-main">
      <TopBar
        title={`Paga tu sesión ${sessionNumber}`}
        step="2 / 2"
        onBack={busy ? undefined : onBack}
      />
      <div className="fa-flow">
        <div className="fa-flow-body">
          <dl className="fa-card fa-card--list">
            <Kv k="Módulo">{module.skill}</Kv>
            <Kv k="Sesión">
              {sessionNumber} de ~{SESSIONS_PER_MODULE}
            </Kv>
            <Kv k="Fecha">{formatShort(sessionAt, timezone)}</Kv>
            <Kv k="Psicóloga">{module.psychologist.name}</Kv>
            <Kv k={<span className="fa-text">Total</span>}>
              <span className="fa-amount">
                {formatAmount(SESSION_PRICE_USD)}
              </span>{" "}
              <span className="fa-mono fa-sm fa-muted">USDC</span>
              <span className="fa-xs fa-muted fa-block fa-regular">
                gas incluido
              </span>
            </Kv>
          </dl>

          <Label as="h2">
            <span className="fa-block fa-mt-24">
              Cómo protege tu pago el escrow
            </span>
          </Label>
          <EscrowFlow />

          <div className="fa-card fa-card--tight fa-row fa-between fa-mt-24">
            <div>
              <p className="fa-xs fa-muted">Tu saldo</p>
              <p className="fa-balance">
                {formatAmount(wallet.balances.usdc)}{" "}
                <span className="fa-mono fa-sm fa-muted">USDC</span>
              </p>
            </div>
            <button
              type="button"
              className="fa-iconbtn"
              aria-label="Actualizar saldo"
              onClick={() => void wallet.refresh()}
            >
              {wallet.loading ? <Spinner /> : <RefreshCw size={20} />}
            </button>
          </div>

          <div className="fa-stack fa-mt-12">
            {!enough && (
              <Alert tone="warn">
                Te faltan <b>{formatAmount(missing)} USDC</b> para pagar esta
                sesión.
              </Alert>
            )}
            {!escrowConfigured && (
              <Alert tone="error">
                Falta configurar <code>VITE_TRUSTLESS_WORK_API_KEY</code>; el
                pago al escrow no está disponible.
              </Alert>
            )}
            {busy && (
              <Alert tone="info">
                Confirma cada firma con tu passkey. No cierres esta pantalla.
              </Alert>
            )}
            {pay.error && <Alert tone="error">{pay.error}</Alert>}
          </div>
        </div>
        <div className="fa-cta">
          {enough ? (
            <button
              type="button"
              className="fa-btn fa-btn--primary"
              disabled={busy || !escrowConfigured}
              onClick={onPay}
            >
              {busy ? <Spinner /> : <Lock size={20} />}
              {PAY_LABELS[pay.step]}
            </button>
          ) : (
            <button
              type="button"
              className="fa-btn fa-btn--primary"
              onClick={onTopUp}
            >
              Recarga tu saldo
            </button>
          )}
        </div>
      </div>
    </main>
  );
}

export function TopUp({
  wallet,
  onBack,
}: {
  wallet: WalletState;
  onBack: () => void;
}) {
  const [amount, setAmount] = useState(6);
  const enough = hasEnoughUsdc(wallet.balances, SESSION_PRICE_USD);
  const trustline = wallet.balances.hasUsdcTrustline;

  return (
    <main className="fa-main">
      <TopBar title="Recarga tu saldo" onBack={onBack} />
      <div className="fa-flow">
        <div className="fa-flow-body">
          <Label as="h2">¿Cuánto quieres recargar?</Label>
          <div className="fa-chips fa-mt-12" role="group" aria-label="Monto">
            {[3, 6, 15].map((value) => (
              <button
                key={value}
                type="button"
                className={`fa-chip ${amount === value ? "is-on" : ""}`}
                aria-pressed={amount === value}
                onClick={() => setAmount(value)}
              >
                {value} USDC
              </button>
            ))}
          </div>
          <p className="fa-xs fa-muted fa-mt-8">
            {SESSION_PRICE_USD * SESSIONS_PER_MODULE} USDC cubre un módulo
            completo (~{SESSIONS_PER_MODULE} sesiones).
          </p>

          <Label as="h2">
            <span className="fa-block fa-mt-24">Método</span>
          </Label>
          <div className="fa-stack fa-mt-12">
            <div className="fa-option fa-option--tall is-selected">
              <span className="fa-mint">
                <IconBlockchain />
              </span>
              <span>
                <b className="fa-block">Deposita USDC desde otra wallet</b>
                <span className="fa-xs fa-muted">
                  Solo USDC en la red Stellar.
                </span>
              </span>
            </div>
            <div
              className="fa-option fa-option--tall is-disabled"
              aria-disabled="true"
            >
              <span className="fa-muted">
                <CreditCard size={24} />
              </span>
              <span>
                <b className="fa-block">Compra USDC con tarjeta</b>
                <span className="fa-tbd">[PROVEEDOR POR COMPLETAR]</span>
              </span>
            </div>
          </div>

          {wallet.address && (
            <div className="fa-card fa-card--tight fa-mt-16">
              <p className="fa-xs fa-muted">Tu dirección</p>
              <p className="fa-mono fa-sm fa-break fa-mt-4">{wallet.address}</p>
              <div className="fa-mt-12">
                <CopyButton
                  value={wallet.address}
                  label="Copiar dirección"
                  className="fa-btn fa-btn--secondary"
                />
              </div>
            </div>
          )}

          <div className="fa-stack fa-mt-12">
            {!trustline && (
              <Alert tone="info">
                Antes de recibir USDC, activa USDC en tu wallet (una firma, una
                sola vez).
              </Alert>
            )}
            {wallet.notice && <Alert tone="ok">{wallet.notice}</Alert>}
            {wallet.error && <Alert tone="error">{wallet.error}</Alert>}
            {wallet.lastTx && (
              <TxLink
                hash={wallet.lastTx.hash}
                label={`${wallet.lastTx.label}: ver transacción`}
              />
            )}
          </div>

          <div className="fa-card fa-card--tight fa-row fa-between fa-mt-16">
            <div>
              <p className="fa-xs fa-muted">Tu saldo</p>
              <p className="fa-balance">
                {formatAmount(wallet.balances.usdc)}{" "}
                <span className="fa-mono fa-sm fa-muted">USDC</span>
              </p>
            </div>
            <button
              type="button"
              className="fa-btn fa-btn--secondary fa-btn--inline"
              onClick={() => void wallet.refresh()}
            >
              {wallet.loading ? <Spinner /> : <RefreshCw size={18} />}
              Actualizar
            </button>
          </div>
          <p className="fa-xs fa-muted fa-mt-8">
            Tu saldo se actualiza cuando llega el depósito.
          </p>
        </div>

        <div className="fa-cta">
          {enough ? (
            <button
              type="button"
              className="fa-btn fa-btn--primary"
              onClick={onBack}
            >
              Volver al pago
            </button>
          ) : !trustline ? (
            <button
              type="button"
              className="fa-btn fa-btn--primary"
              disabled={wallet.task !== "idle"}
              onClick={() => void wallet.enableUsdc()}
            >
              {wallet.task === "trustline" && <Spinner />}
              Activar USDC en mi wallet
            </button>
          ) : NETWORK === "testnet" ? (
            <button
              type="button"
              className="fa-btn fa-btn--primary"
              disabled={wallet.task !== "idle"}
              onClick={() => void wallet.claimUsdc()}
            >
              {wallet.task === "faucet" ? <Spinner /> : <Droplets size={20} />}
              Obtener USDC de prueba
            </button>
          ) : null}
          <p className="fa-xs fa-muted fa-center">
            Estás en {USDC.label}: sin dinero real.
          </p>
        </div>
      </div>
    </main>
  );
}
