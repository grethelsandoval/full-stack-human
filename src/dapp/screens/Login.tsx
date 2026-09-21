import { Braces, Sparkles, TerminalSquare, Zap } from "lucide-react";
import { DOCS_URL, LANDING_URL, STELLAR_URL } from "../config";
import { repository } from "../../data";
import { NetworkPill, Notice } from "../ui";

function GoogleMark() {
  return (
    <svg viewBox="0 0 48 48" width="20" height="20" aria-hidden="true">
      <path
        fill="#FFC107"
        d="M43.6 20.1H42V20H24v8h11.3C33.7 32.7 29.2 36 24 36c-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.8 1.2 8 3l5.7-5.7C34.1 6.1 29.3 4 24 4 13 4 4 13 4 24s9 20 20 20 20-9 20-20c0-1.3-.1-2.6-.4-3.9z"
      />
      <path
        fill="#FF3D00"
        d="M6.3 14.7l6.6 4.8C14.7 15.1 19 12 24 12c3.1 0 5.8 1.2 8 3l5.7-5.7C34.1 6.1 29.3 4 24 4 16.3 4 9.7 8.3 6.3 14.7z"
      />
      <path
        fill="#4CAF50"
        d="M24 44c5.2 0 9.9-2 13.4-5.2l-6.2-5.2C29.2 35.1 26.7 36 24 36c-5.2 0-9.6-3.3-11.3-8l-6.5 5C9.5 39.6 16.2 44 24 44z"
      />
      <path
        fill="#1976D2"
        d="M43.6 20.1H42V20H24v8h11.3c-.8 2.2-2.2 4.2-4.1 5.6l6.2 5.2C41.4 35.4 44 30.1 44 24c0-1.3-.1-2.6-.4-3.9z"
      />
    </svg>
  );
}

export default function Login({
  onLogin,
  configured,
  error,
}: {
  onLogin: () => void;
  configured: boolean;
  error?: string | null;
}) {
  return (
    <main className="da-login">
      <div className="da-login-top">
        <a href={LANDING_URL} className="da-brand da-brand-lg">
          <span className="da-brand-icon">
            <Braces size={22} strokeWidth={1.8} />
          </span>
          <span>
            <strong>FSH Hub</strong>
            <small>WEB3 / FRAMEWORK</small>
          </span>
        </a>
        <NetworkPill />
      </div>

      <section className="da-login-hero">
        <p className="da-eyebrow">
          <Sparkles size={14} /> Para Builders en Web3
        </p>
        <h1>
          Tu arquitectura técnica ya es fuerte.
          <span>Ahora construye tu arquitectura humana.</span>
        </h1>
        <p className="da-lead">
          Entrenamiento conductual personalizado basado en evidencia científica
          (BESSI &amp; Big Five), respaldado por Soroban Escrow y credenciales
          ACTA.
        </p>

        {!configured && (
          <Notice tone="error" role="alert">
            Falta configurar <code>VITE_POLLAR_PUBLISHABLE_KEY</code>. El inicio
            de sesión con Google se habilita al definir la clave publicable de
            Pollar.
          </Notice>
        )}
        {error && (
          <Notice tone="error" role="alert">
            {error}
          </Notice>
        )}

        <button
          type="button"
          className="da-google"
          onClick={onLogin}
          disabled={!configured}
        >
          <GoogleMark /> Iniciar Sesión con Google
        </button>
        <p className="da-login-foot">
          Infraestructura Web3 impulsada por Pollar SDK (Onboarding), Escrow
          Contracts, Protocolo ACTA (Certificación) y la red de Stellar.
        </p>
        <p className="da-login-meta">
          <Zap size={13} /> Tu billetera Stellar se crea automáticamente al
          iniciar sesión y se fondea con XLM de prueba vía Friendbot.
        </p>
      </section>

      <footer className="da-login-footer">
        <div>
          <span>FSH © 2026</span>
          <span>Argentina Builder Challenge</span>
        </div>
        <div>
          <a href={repository} target="_blank" rel="noreferrer">
            GitHub
          </a>
          <span aria-hidden="true">•</span>
          <a href={DOCS_URL} target="_blank" rel="noreferrer">
            Docs
          </a>
          <span aria-hidden="true">•</span>
          <a href={STELLAR_URL} target="_blank" rel="noreferrer">
            Stellar
          </a>
        </div>
        <div className="da-terminal">
          <TerminalSquare size={14} />
          <span>FSH_NODE // 0.9.4</span>
          <a href={DOCS_URL} target="_blank" rel="noreferrer">
            DOCS
          </a>
          <a href={STELLAR_URL} target="_blank" rel="noreferrer">
            STELLAR
          </a>
        </div>
      </footer>
    </main>
  );
}
