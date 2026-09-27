import { useState } from "react";

export default function NameStep({
  initial,
  onSave,
}: {
  initial: string;
  onSave: (name: string) => void;
}) {
  const [name, setName] = useState(initial);
  const valid = name.trim().length >= 2;

  return (
    <main className="fa-main">
      <form
        className="fa-flow"
        onSubmit={(event) => {
          event.preventDefault();
          if (valid) onSave(name);
        }}
      >
        <div className="fa-flow-body fa-pt-40">
          <h1 className="fa-h1">¿Cómo te llamas?</h1>
          <p className="fa-muted fa-mt-12">
            Así aparecerá tu nombre en tu credencial verificable.
          </p>
          <div className="fa-field fa-mt-28">
            <label htmlFor="fa-name">Nombre y apellido</label>
            <input
              id="fa-name"
              name="name"
              autoComplete="name"
              value={name}
              onChange={(event) => setName(event.target.value)}
              aria-describedby="fa-name-help"
            />
            <p id="fa-name-help" className="fa-xs fa-muted">
              Puedes cambiarlo en tu perfil antes de reclamar tu primera
              credencial.
            </p>
          </div>
        </div>
        <div className="fa-cta">
          <button
            type="submit"
            className="fa-btn fa-btn--primary"
            disabled={!valid}
          >
            Continuar
          </button>
        </div>
      </form>
    </main>
  );
}
