import type { ReactNode } from "react";
import {
  Bell,
  BadgeCheck,
  Braces,
  Check,
  CircleUserRound,
  Copy,
  Layers3,
  LayoutDashboard,
  Menu,
} from "lucide-react";
import { useState } from "react";
import { APP_VERSION, NETWORK_LABEL } from "./config";
import { shortAddress } from "./stellar";

export type Tab = "dashboard" | "modulos" | "certificados" | "perfil";

export function NetworkPill({ compact = false }: { compact?: boolean }) {
  return (
    <span className={`da-pill da-pill-network ${compact ? "compact" : ""}`}>
      <span className="da-dot" aria-hidden="true" />
      {NETWORK_LABEL}
    </span>
  );
}

export function Header({
  onMenu,
  onProfile,
  userMode,
}: {
  onMenu?: () => void;
  onProfile?: () => void;
  userMode?: "new" | "returning";
}) {
  return (
    <header className="da-header">
      <div className="da-header-row">
        <div className="da-header-left">
          <button
            type="button"
            className="da-icon-button"
            aria-label="Abrir menú"
            onClick={onMenu}
          >
            <Menu size={22} />
          </button>
          <a href="#" className="da-brand">
            <span className="da-brand-icon">
              <Braces size={20} strokeWidth={1.8} />
            </span>
            <span>
              <strong>FSH Hub</strong>
              <small>DASHBOARD</small>
            </span>
          </a>
        </div>
        <div className="da-header-right">
          <NetworkPill />
          <button
            type="button"
            className="da-icon-button"
            aria-label="Notificaciones"
          >
            <Bell size={20} />
          </button>
          <button
            type="button"
            className="da-avatar"
            aria-label="Perfil"
            onClick={onProfile}
          >
            <CircleUserRound size={22} />
          </button>
        </div>
      </div>
      <div className="da-header-sub">
        <div className="da-mode-tags">
          <span className={userMode === "new" ? "active" : ""}>Nuevo</span>
          <span className={userMode === "returning" ? "active" : ""}>
            Recurrente
          </span>
        </div>
        <span className="da-version">
          <Layers3 size={13} /> {APP_VERSION}
        </span>
      </div>
    </header>
  );
}

export function BottomNav({
  active,
  onSelect,
}: {
  active: Tab;
  onSelect: (tab: Tab) => void;
}) {
  const items: [Tab, string, ReactNode][] = [
    ["dashboard", "Dashboard", <LayoutDashboard size={22} />],
    ["modulos", "Módulos", <Layers3 size={22} />],
    ["certificados", "Certificados", <BadgeCheck size={22} />],
    ["perfil", "Perfil", <CircleUserRound size={22} />],
  ];
  return (
    <nav className="da-bottom-nav" aria-label="Navegación de la dApp">
      {items.map(([tab, label, icon]) => (
        <button
          key={tab}
          type="button"
          className={active === tab ? "active" : ""}
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

export function CopyAddress({
  address,
  label = "Wallet",
  size = 4,
}: {
  address: string;
  label?: string;
  size?: number;
}) {
  const [copied, setCopied] = useState(false);
  async function copy() {
    try {
      await navigator.clipboard.writeText(address);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1600);
    } catch {
      setCopied(false);
    }
  }
  return (
    <button
      type="button"
      className="da-copy"
      onClick={copy}
      aria-label={`Copiar ${label}: ${address}`}
      title={address}
    >
      <code>{shortAddress(address, size)}</code>
      {copied ? <Check size={14} /> : <Copy size={14} />}
    </button>
  );
}

export function Notice({
  tone = "info",
  children,
  role = "status",
}: {
  tone?: "info" | "error" | "success";
  children: ReactNode;
  role?: "status" | "alert";
}) {
  return (
    <p className={`da-notice ${tone}`} role={role}>
      {children}
    </p>
  );
}

export function Spinner() {
  return <span className="da-spinner" aria-hidden="true" />;
}
