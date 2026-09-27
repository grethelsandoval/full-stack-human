import type { ReactNode } from "react";
import { useState } from "react";
import {
  ArrowLeft,
  Check,
  ChevronRight,
  CircleAlert,
  CircleCheck,
  Copy,
  ExternalLink,
  House,
  Info,
  LayoutGrid,
  TriangleAlert,
  X,
} from "lucide-react";
import { LAYERS, layerLabel, type Layer, type ModuleIcon } from "./catalog";
import { shortAddress, txUrl } from "./stellar";

export type Tab = "inicio" | "modulos" | "sesiones" | "credenciales";

/* ---------- Íconos del set FSH (línea de 2 px, retícula de 24) ---------- */

function BrandSvg({
  size = 24,
  children,
}: {
  size?: number;
  children: ReactNode;
}) {
  return (
    <svg
      viewBox="0 0 24 24"
      width={size}
      height={size}
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      {children}
    </svg>
  );
}

export function IconMeta({ size }: { size?: number }) {
  return (
    <BrandSvg size={size}>
      <circle cx="12" cy="12" r="9" />
      <circle cx="12" cy="12" r="5" />
      <circle cx="12" cy="12" r="1" />
    </BrandSvg>
  );
}

export function IconEquipo({ size }: { size?: number }) {
  return (
    <BrandSvg size={size}>
      <circle cx="9" cy="8" r="3.2" />
      <path d="M3 20a6 6 0 0 1 12 0" />
      <circle cx="17" cy="9" r="2.5" />
      <path d="M16.5 14.1A5 5 0 0 1 21 19.5" />
    </BrandSvg>
  );
}

export function IconFirewall({ size }: { size?: number }) {
  return (
    <BrandSvg size={size}>
      <path d="M12 2.8 4.5 5.8v6c0 4.4 3.1 7.9 7.5 9.4 4.4-1.5 7.5-5 7.5-9.4v-6z" />
      <path d="m9 12 2.2 2.2L15.5 10" />
    </BrandSvg>
  );
}

export function IconCredencial({ size }: { size?: number }) {
  return (
    <BrandSvg size={size}>
      <circle cx="12" cy="9" r="6" />
      <path d="M8.6 13.9 7.5 21.5 12 19l4.5 2.5-1.1-7.6" />
      <path d="m9.6 9 1.7 1.7 3.2-3.2" />
    </BrandSvg>
  );
}

export function IconBlockchain({ size }: { size?: number }) {
  return (
    <BrandSvg size={size}>
      <path d="M12 2.5 20.5 7v10L12 21.5 3.5 17V7z" />
      <path d="M3.5 7 12 11.5 20.5 7M12 11.5v10" />
    </BrandSvg>
  );
}

export function IconCalendario({ size }: { size?: number }) {
  return (
    <BrandSvg size={size}>
      <rect x="3" y="5" width="18" height="16" rx="2.5" />
      <path d="M3 10h18M8 3v4M16 3v4" />
      <path d="M8 14h2M14 14h2M8 17.5h2" />
    </BrandSvg>
  );
}

export function ModuleGlyph({
  icon,
  size,
}: {
  icon: ModuleIcon;
  size?: number;
}) {
  if (icon === "meta") return <IconMeta size={size} />;
  if (icon === "equipo") return <IconEquipo size={size} />;
  return <IconFirewall size={size} />;
}

/* ---------- Marca ---------- */

export function BrandSymbol({ size = 44 }: { size?: number }) {
  return (
    <img
      src={
        size < 32
          ? "/brand/fsh-simbolo-bold-color-dark.svg"
          : "/brand/fsh-simbolo-color-dark.svg"
      }
      alt=""
      width={size}
      height={Math.round(size * 0.54)}
      className="fa-symbol"
    />
  );
}

/* ---------- Estructura ---------- */

export function TopBar({
  title,
  step,
  onBack,
  close = false,
}: {
  title?: string;
  step?: string;
  onBack?: () => void;
  close?: boolean;
}) {
  return (
    <div className="fa-topbar">
      {onBack ? (
        <button
          type="button"
          className="fa-iconbtn"
          aria-label={close ? "Cerrar" : "Volver"}
          onClick={onBack}
        >
          {close ? <X size={24} /> : <ArrowLeft size={24} />}
        </button>
      ) : (
        <span className="fa-iconbtn-space" />
      )}
      <span className="fa-topbar-title">{title}</span>
      {step ? <span className="fa-topbar-step">{step}</span> : null}
    </div>
  );
}

export function TabBar({
  active,
  onSelect,
}: {
  active: Tab | null;
  onSelect: (tab: Tab) => void;
}) {
  const items: [Tab, string, ReactNode][] = [
    ["inicio", "Inicio", <House size={24} />],
    ["modulos", "Módulos", <LayoutGrid size={24} />],
    ["sesiones", "Sesiones", <IconCalendario />],
    ["credenciales", "Credenciales", <IconCredencial />],
  ];
  return (
    <nav className="fa-tabbar" aria-label="Navegación principal">
      {items.map(([tab, label, icon]) => (
        <button
          key={tab}
          type="button"
          className={active === tab ? "is-active" : ""}
          aria-current={active === tab ? "page" : undefined}
          onClick={() => onSelect(tab)}
        >
          {icon}
          <span>{label}</span>
        </button>
      ))}
    </nav>
  );
}

/* ---------- Piezas ---------- */

export function Label({
  children,
  color,
  as: Tag = "p",
}: {
  children: ReactNode;
  color?: string;
  as?: "p" | "span" | "h2";
}) {
  return (
    <Tag className="fa-label" style={color ? { color } : undefined}>
      {children}
    </Tag>
  );
}

export function LayerLabel({ layer }: { layer: Layer }) {
  return <Label color={LAYERS[layer].color}>{layerLabel(layer)}</Label>;
}

export function LayerTag({ layer }: { layer: Layer }) {
  return (
    <span className="fa-tag" style={{ background: LAYERS[layer].color }}>
      {layerLabel(layer)}
    </span>
  );
}

export function Avatar({
  initials,
  size = 44,
  label,
}: {
  initials: string;
  size?: number;
  label?: string;
}) {
  return (
    <span
      className="fa-avatar"
      style={{ width: size, height: size, fontSize: Math.round(size * 0.36) }}
      role={label ? "img" : undefined}
      aria-label={label}
      aria-hidden={label ? undefined : true}
    >
      {initials}
    </span>
  );
}

export function Alert({
  tone = "info",
  children,
  icon,
  role,
}: {
  tone?: "info" | "warn" | "ok" | "error";
  children: ReactNode;
  icon?: ReactNode;
  role?: "status" | "alert";
}) {
  const fallback =
    tone === "ok" ? (
      <CircleCheck size={20} />
    ) : tone === "warn" ? (
      <TriangleAlert size={20} />
    ) : tone === "error" ? (
      <CircleAlert size={20} />
    ) : (
      <Info size={20} />
    );
  return (
    <div
      className={`fa-alert fa-alert--${tone}`}
      role={role ?? (tone === "error" ? "alert" : "status")}
    >
      <span className="fa-alert-icon">{icon ?? fallback}</span>
      <div>{children}</div>
    </div>
  );
}

export function Segments({
  total,
  done,
  current = false,
}: {
  total: number;
  done: number;
  current?: boolean;
}) {
  return (
    <div
      className="fa-segs"
      role="progressbar"
      aria-valuemin={0}
      aria-valuemax={total}
      aria-valuenow={done}
      aria-label={`${done} de ${total} sesiones confirmadas`}
    >
      {Array.from({ length: total }, (_, index) => (
        <i
          key={index}
          className={
            index < done
              ? "is-done"
              : current && index === done
                ? "is-current"
                : ""
          }
        />
      ))}
    </div>
  );
}

export function Kv({ k, children }: { k: ReactNode; children: ReactNode }) {
  return (
    <div className="fa-kv">
      <dt>{k}</dt>
      <dd>{children}</dd>
    </div>
  );
}

export function RowLink({
  children,
  onClick,
}: {
  children: ReactNode;
  onClick: () => void;
}) {
  return (
    <button type="button" className="fa-card fa-rowlink" onClick={onClick}>
      <span className="fa-rowlink-body">{children}</span>
      <ChevronRight size={20} className="fa-muted" aria-hidden="true" />
    </button>
  );
}

export function CopyButton({
  value,
  label,
  className = "fa-btn fa-btn--primary",
}: {
  value: string;
  label: string;
  className?: string;
}) {
  const [copied, setCopied] = useState(false);
  async function copy() {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1600);
    } catch {
      setCopied(false);
    }
  }
  return (
    <button type="button" className={className} onClick={copy}>
      {copied ? <Check size={20} /> : <Copy size={20} />}
      {copied ? "Copiada" : label}
    </button>
  );
}

export function ExplorerLink({
  href,
  children,
}: {
  href: string;
  children: ReactNode;
}) {
  return (
    <a className="fa-link" href={href} target="_blank" rel="noreferrer">
      {children} <ExternalLink size={16} aria-hidden="true" />
      <span className="fa-sr">(se abre en otra pestaña)</span>
    </a>
  );
}

export function TxLink({
  hash,
  label = "Ver en el explorador",
}: {
  hash: string;
  label?: string;
}) {
  return <ExplorerLink href={txUrl(hash)}>{label}</ExplorerLink>;
}

export function Hash({ value }: { value: string }) {
  return (
    <code className="fa-mono" title={value}>
      {shortAddress(value, 6)}
    </code>
  );
}

export function Spinner() {
  return <span className="fa-spinner" aria-hidden="true" />;
}
