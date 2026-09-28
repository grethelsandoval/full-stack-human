import { Alert } from "../ui";

function GoogleMark() {
  return (
    <svg viewBox="0 0 48 48" width="20" height="20" aria-hidden="true">
      <path
        fill="#EA4335"
        d="M24 9.5c3.5 0 6.6 1.2 9.1 3.6l6.8-6.8C35.8 2.4 30.3 0 24 0 14.6 0 6.6 5.4 2.6 13.2l7.9 6.2C12.4 13.7 17.7 9.5 24 9.5z"
      />
      <path
        fill="#4285F4"
        d="M46.1 24.5c0-1.6-.1-3.1-.4-4.5H24v9h12.4c-.5 2.9-2.2 5.3-4.6 6.9l7.4 5.7c4.3-4 6.9-9.9 6.9-17.1z"
      />
      <path
        fill="#FBBC05"
        d="M10.5 28.6c-.5-1.4-.8-3-.8-4.6s.3-3.2.8-4.6l-7.9-6.2C.9 16.5 0 20.1 0 24s.9 7.5 2.6 10.8l7.9-6.2z"
      />
      <path
        fill="#34A853"
        d="M24 48c6.5 0 11.9-2.1 15.9-5.8l-7.4-5.7c-2.1 1.4-4.8 2.3-8.5 2.3-6.3 0-11.6-4.2-13.5-10l-7.9 6.2C6.6 42.6 14.6 48 24 48z"
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
    <main className="fa-main fa-login">
      <div className="fa-blueprint" aria-hidden="true" />
      <div className="fa-login-body">
        <img
          src="/brand/fsh-simbolo-color-dark.svg"
          alt="Full Stack Human"
          width={224}
          height={120}
        />
        <p className="fa-label fa-mt-40">
          Entrenamiento de habilidades blandas
        </p>
        <h1 className="fa-display">Tu arquitectura técnica ya es fuerte.</h1>
        <p className="fa-lead fa-muted">
          Ahora fortalece tu arquitectura humana. 1 a 1, en vivo, con psicólogas
          y psicólogos.
        </p>
      </div>

      <div className="fa-login-foot">
        {!configured && (
          <Alert tone="error">
            Falta configurar <code>VITE_POLLAR_PUBLISHABLE_KEY</code>. El inicio
            de sesión con Google se activa al definir la clave de Pollar.
          </Alert>
        )}
        {error && <Alert tone="error">{error}</Alert>}
        <button
          type="button"
          className="fa-btn fa-btn--google"
          onClick={onLogin}
          disabled={!configured}
        >
          <GoogleMark /> Continuar con Google
        </button>
      </div>
    </main>
  );
}
