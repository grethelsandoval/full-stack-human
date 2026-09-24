import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { GetEscrowsFromIndexerResponse } from "@trustless-work/escrow";
import { BadgeCheck, LogOut, ShieldCheck } from "lucide-react";
import {
  advanceBooking,
  type Booking,
  loadBookings,
  saveBooking,
} from "./bookings";
import { findModule, type TrainingModule } from "./catalog";
import { LANDING_URL, NETWORK_LABEL, SESSION_PRICE_USD } from "./config";
import {
  clearDiagnostic,
  type DiagnosticResult,
  loadDiagnostic,
  saveDiagnostic,
} from "./diagnostic";
import { useEscrow } from "./escrow";
import { parseRoute, type Route, routeToHash } from "./routes";
import BookingView, { type ReleaseState } from "./screens/BookingView";
import Dashboard, { type UserMode } from "./screens/Dashboard";
import { DiagnosticResults, Questionnaire } from "./screens/Diagnostic";
import Login from "./screens/Login";
import ModuleDetail from "./screens/ModuleDetail";
import Schedule, { type PayState } from "./screens/Schedule";
import WalletCard from "./screens/WalletCard";
import { BottomNav, Header, Notice, type Tab } from "./ui";
import { useWallet } from "./useWallet";

function useHashRoute() {
  const [route, setRoute] = useState<Route>(() =>
    parseRoute(window.location.hash),
  );
  useEffect(() => {
    const onChange = () => setRoute(parseRoute(window.location.hash));
    window.addEventListener("hashchange", onChange);
    return () => window.removeEventListener("hashchange", onChange);
  }, []);
  const navigate = useCallback((next: Route) => {
    window.location.hash = routeToHash(next);
    setRoute(next);
    window.scrollTo({ top: 0 });
  }, []);
  return [route, navigate] as const;
}

function readBookings(wallet: string | null, version: number) {
  void version;
  return wallet ? loadBookings(wallet) : [];
}

function readDiagnostic(wallet: string | null, version: number) {
  void version;
  return wallet ? loadDiagnostic(wallet) : null;
}

function describeError(error: unknown) {
  return error instanceof Error
    ? error.message
    : "Ocurrió un error inesperado.";
}

function describeSession(date: Date, timezone: string) {
  return new Intl.DateTimeFormat("es-ES", {
    dateStyle: "full",
    timeStyle: "short",
    timeZone: timezone,
  }).format(date);
}

export default function DApp({
  escrowConfigured,
}: {
  escrowConfigured: boolean;
}) {
  const wallet = useWallet();
  const escrow = useEscrow();
  const [route, navigate] = useHashRoute();
  const [modeChoice, setMode] = useState<UserMode | null>(null);
  const [bookingsVersion, setBookingsVersion] = useState(0);
  const [pay, setPay] = useState<PayState>({ step: "idle", error: null });
  const [release, setRelease] = useState<ReleaseState>({
    step: "idle",
    error: null,
  });
  const [onchain, setOnchain] = useState<{
    contractId: string;
    data: GetEscrowsFromIndexerResponse | null;
  } | null>(null);
  const [loginError, setLoginError] = useState<string | null>(null);
  const [diagnosticVersion, setDiagnosticVersion] = useState(0);
  const [diagnosticSkipped, setDiagnosticSkipped] = useState(false);
  const [showResults, setShowResults] = useState(false);

  const diagnostic = useMemo(
    () => readDiagnostic(wallet.address, diagnosticVersion),
    [wallet.address, diagnosticVersion],
  );
  const completeDiagnostic = (result: DiagnosticResult) => {
    saveDiagnostic(result);
    setDiagnosticVersion((version) => version + 1);
    setShowResults(true);
  };
  const restartDiagnostic = () => {
    if (wallet.address) clearDiagnostic(wallet.address);
    setDiagnosticVersion((version) => version + 1);
    setDiagnosticSkipped(false);
    setShowResults(false);
    navigate({ name: "dashboard" });
  };

  const bookings = useMemo(
    () => readBookings(wallet.address, bookingsVersion),
    [wallet.address, bookingsVersion],
  );
  const mode: UserMode =
    modeChoice ?? (bookings.length > 0 ? "returning" : "new");
  const persist = (booking: Booking) => {
    saveBooking(booking);
    setBookingsVersion((version) => version + 1);
  };

  const signer = wallet.address
    ? { address: wallet.address, signXdr: wallet.signXdr }
    : null;

  const escrowRef = useRef(escrow);
  useEffect(() => {
    escrowRef.current = escrow;
  }, [escrow]);

  const refreshOnchain = useCallback(async (contractId: string) => {
    try {
      const data = await escrowRef.current.read(contractId);
      setOnchain({ contractId, data });
    } catch {
      setOnchain({ contractId, data: null });
    }
  }, []);

  const activeContract =
    route.name === "booking"
      ? (bookings.find((item) => item.id === route.id)?.contractId ?? null)
      : null;

  useEffect(() => {
    if (activeContract) void refreshOnchain(activeContract);
  }, [activeContract, refreshOnchain]);

  async function handlePay(
    module: TrainingModule,
    sessionAt: Date,
    timezone: string,
  ) {
    if (!signer) return;
    if (!escrowConfigured) {
      setPay({
        step: "idle",
        error:
          "Falta configurar VITE_TRUSTLESS_WORK_API_KEY para desplegar el escrow.",
      });
      return;
    }
    setPay({ step: "deploy", error: null });
    let booking: Booking | null = null;
    try {
      const deployed = await escrow.deploy(
        module,
        signer,
        describeSession(sessionAt, timezone),
      );
      booking = {
        id: deployed.contractId,
        moduleId: module.id,
        wallet: signer.address,
        contractId: deployed.contractId,
        engagementId: deployed.engagementId,
        amount: SESSION_PRICE_USD,
        sessionAt: sessionAt.toISOString(),
        timezone,
        status: "created",
        txHashes: deployed.hash ? { deploy: deployed.hash } : {},
        createdAt: new Date().toISOString(),
      };
      persist(booking);
      setPay({ step: "fund", error: null });
      const fundHash = await escrow.fund(booking.contractId, signer);
      booking = advanceBooking(booking, fundHash);
      persist(booking);
      setPay({ step: "done", error: null });
      void wallet.refresh();
      setMode("returning");
      navigate({ name: "booking", id: booking.id });
      setPay({ step: "idle", error: null });
    } catch (cause) {
      setPay({ step: "idle", error: describeError(cause) });
      if (booking) navigate({ name: "booking", id: booking.id });
    }
  }

  async function handleFundExisting(booking: Booking) {
    if (!signer) return;
    setRelease({ step: "fund", error: null });
    try {
      const hash = await escrow.fund(booking.contractId, signer);
      persist(advanceBooking(booking, hash));
      void wallet.refresh();
    } catch (cause) {
      setRelease({ step: "idle", error: describeError(cause) });
      return;
    }
    setRelease({ step: "idle", error: null });
  }

  async function handleApprove(booking: Booking) {
    if (!signer) return;
    setRelease({ step: "approve", error: null });
    try {
      const hash = await escrow.approve(booking.contractId, signer);
      persist(advanceBooking(booking, hash));
      setRelease({ step: "idle", error: null });
      void refreshOnchain(booking.contractId);
    } catch (cause) {
      setRelease({ step: "idle", error: describeError(cause) });
    }
  }

  async function handleRelease(booking: Booking) {
    if (!signer) return;
    setRelease({ step: "release", error: null });
    try {
      const hash = await escrow.release(booking.contractId, signer);
      persist(advanceBooking(booking, hash));
      setRelease({ step: "idle", error: null });
      void refreshOnchain(booking.contractId);
    } catch (cause) {
      setRelease({ step: "idle", error: describeError(cause) });
    }
  }

  if (!wallet.isAuthenticated || !wallet.address) {
    return (
      <Login
        configured
        error={loginError}
        onLogin={() => {
          setLoginError(null);
          try {
            wallet.login();
          } catch (cause) {
            setLoginError(describeError(cause));
          }
        }}
      />
    );
  }

  if (!diagnostic && !diagnosticSkipped) {
    return (
      <div className="da-shell">
        <Questionnaire
          wallet={wallet.address}
          onComplete={completeDiagnostic}
          onSkip={() => setDiagnosticSkipped(true)}
        />
      </div>
    );
  }

  if (diagnostic && showResults) {
    return (
      <div className="da-shell">
        <DiagnosticResults
          result={diagnostic}
          onOpenModule={(id) => {
            setShowResults(false);
            navigate({ name: "module", id });
          }}
          onDashboard={() => {
            setShowResults(false);
            navigate({ name: "dashboard" });
          }}
        />
      </div>
    );
  }

  const tab: Tab =
    route.name === "certificados"
      ? "certificados"
      : route.name === "perfil"
        ? "perfil"
        : route.name === "dashboard"
          ? "dashboard"
          : "modulos";

  function selectTab(next: Tab) {
    if (next === "dashboard") navigate({ name: "dashboard" });
    if (next === "certificados") navigate({ name: "certificados" });
    if (next === "perfil") navigate({ name: "perfil" });
    if (next === "modulos") {
      navigate({ name: "dashboard" });
      window.setTimeout(
        () =>
          document
            .getElementById("catalogo")
            ?.scrollIntoView({ behavior: "smooth" }),
        0,
      );
    }
  }

  let screen;
  if (route.name === "module" || route.name === "schedule") {
    const module = findModule(route.id);
    if (!module) {
      screen = (
        <main className="da-main">
          <Notice tone="error" role="alert">
            Módulo no encontrado.
          </Notice>
        </main>
      );
    } else if (route.name === "module") {
      screen = (
        <ModuleDetail
          module={module}
          wallet={wallet}
          onBack={() => navigate({ name: "dashboard" })}
          onContinue={() => navigate({ name: "schedule", id: module.id })}
        />
      );
    } else {
      screen = (
        <>
          {!escrowConfigured && (
            <div className="da-main" style={{ paddingBottom: 0 }}>
              <Notice tone="error" role="alert">
                Falta configurar <code>VITE_TRUSTLESS_WORK_API_KEY</code>; el
                pago al escrow no estará disponible.
              </Notice>
            </div>
          )}
          <Schedule
            module={module}
            wallet={wallet}
            pay={pay}
            onBack={() => navigate({ name: "module", id: module.id })}
            onPay={(sessionAt, timezone) =>
              void handlePay(module, sessionAt, timezone)
            }
          />
        </>
      );
    }
  } else if (route.name === "booking") {
    const booking = bookings.find((item) => item.id === route.id);
    screen = booking ? (
      <BookingView
        booking={booking}
        module={findModule(booking.moduleId)}
        onchain={
          onchain?.contractId === booking.contractId ? onchain.data : null
        }
        release={release}
        onBack={() => navigate({ name: "dashboard" })}
        onApprove={() => void handleApprove(booking)}
        onRelease={() => void handleRelease(booking)}
        onRefresh={() => void refreshOnchain(booking.contractId)}
        onFund={() => void handleFundExisting(booking)}
      />
    ) : (
      <main className="da-main">
        <Notice tone="error" role="alert">
          Reserva no encontrada en este navegador.
        </Notice>
      </main>
    );
  } else if (route.name === "certificados") {
    screen = (
      <main className="da-main">
        <section className="da-card da-intro">
          <span className="da-tag violet">
            <BadgeCheck size={12} /> Protocolo ACTA
          </span>
          <h1>Certificados On-Chain</h1>
          <p>
            Al completar las {5} sesiones de un módulo, tu credencial
            verificable se emitirá como contrato Soroban en {NETWORK_LABEL}.
            Todavía no tienes módulos completados.
          </p>
        </section>
      </main>
    );
  } else if (route.name === "perfil") {
    screen = (
      <main className="da-main">
        <WalletCard wallet={wallet} />
        <section className="da-card">
          <div className="da-section-head">
            <h2 className="da-h2-icon">
              <ShieldCheck size={18} /> Sesión
            </h2>
            <span className="da-mono">{NETWORK_LABEL}</span>
          </div>
          <p className="da-muted">
            Tu billetera embebida es administrada por Pollar con tu cuenta de
            Google. Todas las operaciones ocurren en Stellar Testnet.
          </p>
          <div className="da-wallet-actions">
            <button
              type="button"
              className="da-button da-button-ghost"
              onClick={wallet.logout}
            >
              <LogOut size={16} /> Cerrar sesión
            </button>
            {diagnostic ? (
              <button
                type="button"
                className="da-button da-button-ghost"
                onClick={() => setShowResults(true)}
              >
                Ver mi diagnóstico
              </button>
            ) : null}
            <button
              type="button"
              className="da-button da-button-ghost"
              onClick={restartDiagnostic}
            >
              {diagnostic ? "Repetir diagnóstico" : "Hacer diagnóstico"}
            </button>
            <a className="da-button da-button-ghost" href={LANDING_URL}>
              Volver a la landing
            </a>
          </div>
        </section>
      </main>
    );
  } else {
    screen = (
      <Dashboard
        wallet={wallet}
        bookings={bookings}
        mode={mode}
        onMode={setMode}
        onSelectModule={(module) => navigate({ name: "module", id: module.id })}
        onOpenBooking={(booking) =>
          navigate({ name: "booking", id: booking.id })
        }
      />
    );
  }

  return (
    <div className="da-shell">
      <Header
        userMode={mode}
        onMenu={() => navigate({ name: "dashboard" })}
        onProfile={() => navigate({ name: "perfil" })}
      />
      {screen}
      <BottomNav active={tab} onSelect={selectTab} />
    </div>
  );
}
