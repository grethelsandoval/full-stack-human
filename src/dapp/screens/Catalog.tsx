import { useState } from "react";
import { Bell, ChevronRight } from "lucide-react";
import {
  catalog,
  type Layer,
  LAYER_ORDER,
  LAYERS,
  layerLabel,
  type TrainingModule,
  UPCOMING_LAYERS,
} from "../catalog";
import { SESSION_PRICE_USD, SESSIONS_PER_MODULE } from "../config";
import { type Booking, moduleProgress } from "../bookings";
import { Label, ModuleGlyph } from "../ui";

export function ModuleCard({
  module,
  recommended,
  bookings,
  onSelect,
}: {
  module: TrainingModule;
  recommended: boolean;
  bookings: Booking[];
  onSelect: (module: TrainingModule) => void;
}) {
  const info = LAYERS[module.layer];
  const progress = moduleProgress(bookings, module.id);
  const status = progress.completed
    ? "Completado"
    : progress.sessions.length > 0
      ? `En curso · ${progress.released} de ${SESSIONS_PER_MODULE}`
      : null;
  return (
    <button
      type="button"
      className="fa-mod"
      style={recommended ? { borderColor: `${info.color}73` } : undefined}
      onClick={() => onSelect(module)}
    >
      <span className="fa-mod-stripe" style={{ background: info.color }} />
      <span className="fa-mod-body">
        <Label as="span" color={info.color}>
          {layerLabel(module.layer)}
        </Label>
        <span className="fa-row fa-top fa-mt-12">
          <span className="fa-mod-icon" style={{ color: info.color }}>
            <ModuleGlyph icon={module.icon} />
          </span>
          <span>
            <span className="fa-h3 fa-block">{module.skill}</span>
            <span className="fa-sm fa-muted fa-block fa-mt-4">
              {module.definition}
            </span>
          </span>
        </span>
        <span className="fa-row fa-between fa-mt-14">
          <span className="fa-xs fa-muted fa-mono">
            {status ??
              `~${SESSIONS_PER_MODULE} sesiones · ${SESSION_PRICE_USD} USDC`}
          </span>
          {recommended && !status && (
            <span className="fa-tag" style={{ background: info.color }}>
              Según tu check
            </span>
          )}
        </span>
      </span>
    </button>
  );
}

export default function Catalog({
  recommendedLayers,
  bookings,
  onSelect,
}: {
  recommendedLayers: Layer[];
  bookings: Booking[];
  onSelect: (module: TrainingModule) => void;
}) {
  const [filter, setFilter] = useState<Layer | "all">("all");
  const ordered = [...catalog].sort(
    (a, b) =>
      Number(recommendedLayers.includes(b.layer)) -
      Number(recommendedLayers.includes(a.layer)),
  );
  const visible = ordered.filter(
    (module) => filter === "all" || module.layer === filter,
  );

  return (
    <main className="fa-main fa-with-tabs">
      <div className="fa-page">
        <Label>Módulos</Label>
        <h1 className="fa-h1 fa-mt-12">
          32 habilidades. 5 capas. Un plan hecho para ti.
        </h1>

        <div
          className="fa-chips fa-mt-20"
          role="group"
          aria-label="Filtrar por capa"
        >
          <button
            type="button"
            className={`fa-chip ${filter === "all" ? "is-on" : ""}`}
            aria-pressed={filter === "all"}
            onClick={() => setFilter("all")}
          >
            Todas
          </button>
          {LAYER_ORDER.map((layer) => (
            <button
              key={layer}
              type="button"
              className={`fa-chip ${filter === layer ? "is-on" : ""}`}
              aria-pressed={filter === layer}
              onClick={() => setFilter(layer)}
            >
              {LAYERS[layer].name}
            </button>
          ))}
        </div>

        <Label as="h2">
          <span className="fa-block fa-mt-28">Disponibles ahora</span>
        </Label>
        <div className="fa-stack-16 fa-mt-12">
          {visible.map((module) => (
            <ModuleCard
              key={module.id}
              module={module}
              recommended={recommendedLayers.includes(module.layer)}
              bookings={bookings}
              onSelect={onSelect}
            />
          ))}
          {visible.length === 0 && filter !== "all" && (
            <p className="fa-sm fa-muted">
              Aún no hay módulos disponibles en {layerLabel(filter)}.
            </p>
          )}
        </div>

        <Label as="h2">
          <span className="fa-block fa-mt-32">Próximamente</span>
        </Label>
        <p className="fa-sm fa-muted fa-mt-8">
          Nuestro equipo de psicología suma nuevas habilidades cada mes.
        </p>
        <ul className="fa-card fa-list fa-mt-12">
          {UPCOMING_LAYERS.map((item) => (
            <li key={item.label} className="fa-kv fa-kv--row">
              <span>
                <span className="fa-dot" style={{ background: item.color }} />
                {item.label}
              </span>
              <ChevronRight size={20} className="fa-muted" aria-hidden="true" />
            </li>
          ))}
        </ul>
        <button
          type="button"
          className="fa-btn fa-btn--secondary fa-mt-16"
          disabled
        >
          <Bell size={20} /> Avísame de nuevos módulos · pronto
        </button>
      </div>
    </main>
  );
}
