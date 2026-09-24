import { AtSign, Coins, Droplets, RefreshCw, Zap } from "lucide-react";
import { STELLAR_EXPERT } from "../config";
import { formatAmount } from "../stellar";
import { CopyAddress, Notice, Spinner, TxLink } from "../ui";
import type { WalletState } from "../useWallet";

export default function WalletCard({
  wallet,
  compact = false,
}: {
  wallet: WalletState;
  compact?: boolean;
}) {
  const { address, balances, task } = wallet;
  if (!address) return null;
  const busy = task !== "idle";
  return (
    <section
      className={`da-card da-wallet ${compact ? "compact" : ""}`}
      aria-labelledby="wallet-title"
      data-tour="wallet"
    >
      <header className="da-wallet-head">
        {wallet.email && (
          <span className="da-identity">
            <AtSign size={14} /> {wallet.email}
            <em>Google ID</em>
          </span>
        )}
        <div className="da-wallet-row">
          <span className="da-wallet-label" id="wallet-title">
            <Zap size={14} /> Pollar Embedded Wallet
          </span>
          <span className="da-wallet-address">
            <span>Stellar:</span>
            <CopyAddress address={address} label="dirección Stellar" />
          </span>
        </div>
      </header>

      <dl className="da-balances" data-tour="balances">
        <div>
          <dt>USDC (Circle Testnet)</dt>
          <dd data-testid="usdc-balance">
            {wallet.loading && !balances.exists ? (
              <Spinner />
            ) : (
              <>
                {formatAmount(balances.usdc)} <small>USDC</small>
              </>
            )}
          </dd>
        </div>
        <div>
          <dt>XLM (gas)</dt>
          <dd data-testid="xlm-balance">
            {wallet.loading && !balances.exists ? (
              <Spinner />
            ) : (
              <>
                {formatAmount(balances.xlm)} <small>XLM</small>
              </>
            )}
          </dd>
        </div>
      </dl>

      <div className="da-wallet-actions" data-tour="faucets">
        <button
          type="button"
          className="da-button da-button-ghost"
          onClick={wallet.fundXlm}
          disabled={busy}
        >
          {task === "friendbot" ? <Spinner /> : <Droplets size={16} />}
          Fondear XLM (Friendbot)
        </button>
        <button
          type="button"
          className="da-button da-button-mint"
          onClick={wallet.claimUsdc}
          disabled={busy || !balances.exists}
          title={
            balances.exists
              ? undefined
              : "Primero fondea la cuenta con XLM para poder firmar."
          }
        >
          {task === "faucet" ? <Spinner /> : <Coins size={16} />}
          Obtener USDC de prueba
        </button>
        <button
          type="button"
          className="da-icon-button"
          aria-label="Actualizar saldos"
          onClick={() => void wallet.refresh()}
          disabled={busy || wallet.loading}
        >
          <RefreshCw size={16} className={wallet.loading ? "spin" : ""} />
        </button>
      </div>

      {wallet.notice && (
        <Notice tone="success">
          {wallet.notice}
          {wallet.lastTx && (
            <>
              {" "}
              <TxLink
                hash={wallet.lastTx.hash}
                label={`Tx ${wallet.lastTx.label}`}
              />
            </>
          )}
        </Notice>
      )}
      {wallet.error && (
        <Notice tone="error" role="alert">
          {wallet.error}
        </Notice>
      )}
      {!compact && (
        <a
          className="da-link"
          href={`${STELLAR_EXPERT}/account/${address}`}
          target="_blank"
          rel="noreferrer"
        >
          Ver cuenta en Stellar Expert (testnet)
        </a>
      )}
    </section>
  );
}
