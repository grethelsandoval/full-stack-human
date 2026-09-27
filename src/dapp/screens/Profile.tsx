import { useState } from "react";
import { LogOut } from "lucide-react";
import { LANDING_URL, NETWORK_LABEL } from "../config";
import { formatAmount } from "../stellar";
import type { WalletState } from "../useWallet";
import { CopyButton, Kv, Label, TopBar } from "../ui";

export default function Profile({
  name,
  wallet,
  onBack,
  onRename,
  onCheck,
}: {
  name: string;
  wallet: WalletState;
  onBack: () => void;
  onRename: (name: string) => void;
  onCheck: () => void;
}) {
  const [draft, setDraft] = useState(name);
  const changed = draft.trim().length >= 2 && draft.trim() !== name;

  return (
    <main className="fa-main fa-with-tabs">
      <TopBar title="Perfil" onBack={onBack} />
      <div className="fa-page fa-pt-0">
        <form
          className="fa-field"
          onSubmit={(event) => {
            event.preventDefault();
            if (changed) onRename(draft);
          }}
        >
          <label htmlFor="fa-profile-name">Nombre en tu credencial</label>
          <input
            id="fa-profile-name"
            value={draft}
            autoComplete="name"
            onChange={(event) => setDraft(event.target.value)}
          />
          {changed && (
            <button type="submit" className="fa-btn fa-btn--secondary fa-mt-8">
              Guardar nombre
            </button>
          )}
        </form>

        <Label as="h2">
          <span className="fa-block fa-mt-28">Tu wallet</span>
        </Label>
        <dl className="fa-card fa-card--list fa-mt-12">
          {wallet.email && <Kv k="Cuenta">{wallet.email}</Kv>}
          <Kv k="Red">{NETWORK_LABEL}</Kv>
          <Kv k="Saldo">{formatAmount(wallet.balances.usdc)} USDC</Kv>
        </dl>
        {wallet.address && (
          <>
            <p className="fa-mono fa-xs fa-muted fa-break fa-mt-12">
              {wallet.address}
            </p>
            <div className="fa-mt-8">
              <CopyButton
                value={wallet.address}
                label="Copiar dirección"
                className="fa-btn fa-btn--secondary"
              />
            </div>
          </>
        )}

        <div className="fa-stack fa-mt-28">
          <button
            type="button"
            className="fa-btn fa-btn--secondary"
            onClick={onCheck}
          >
            Repetir el Human Stack Check
          </button>
          <a className="fa-btn fa-btn--secondary" href={LANDING_URL}>
            Ir a fullstackhuman
          </a>
          <button
            type="button"
            className="fa-btn fa-btn--secondary"
            onClick={wallet.logout}
          >
            <LogOut size={20} /> Cerrar sesión
          </button>
        </div>
      </div>
    </main>
  );
}
