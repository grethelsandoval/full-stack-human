import { useCallback, useEffect, useMemo, useState } from "react";
import {
  advanceBooking,
  type Booking,
  canReschedule,
  loadBookings,
  markDisputed,
  moduleProgress,
  rescheduleBooking,
  saveBooking,
} from "./bookings";
import { catalog, findModule, type TrainingModule } from "./catalog";
import { SESSION_PRICE_USD } from "./config";
import { useEscrow } from "./escrow";
import {
  type CheckResult,
  loadCheck,
  lowestLayers,
  saveCheck,
} from "./humanStackCheck";
import {
  firstName,
  loadClaims,
  loadName,
  saveClaim,
  saveName,
} from "./profile";
import { parseRoute, type Route, routeToHash } from "./routes";
import { formatDay } from "./scheduling";
import Catalog from "./screens/Catalog";
import { CheckIntro, CheckQuestions, CheckResultView } from "./screens/Check";
import {
  ClaimCredential,
  CredentialList,
  CredentialView,
} from "./screens/Credential";
import Home from "./screens/Home";
import Login from "./screens/Login";
import ModuleDetail from "./screens/ModuleDetail";
import NameStep from "./screens/NameStep";
import Payment, { type PayState, TopUp } from "./screens/Payment";
import Profile from "./screens/Profile";
import Schedule from "./screens/Schedule";
import {
  type ConfirmState,
  ConfirmSession,
  Released,
  Reschedule,
  Ticket,
} from "./screens/Session";
import Sessions from "./screens/Sessions";
import { Alert, type Tab, TabBar, TopBar } from "./ui";
import { useWallet } from "./useWallet";

function useHashRoute() {
  const [route, setRoute] = useState<Route>(() =>
    parseRoute(window.location.hash),
  );
  useEffect(() => {
    const onChange = () => {
      setRoute(parseRoute(window.location.hash));
      window.scrollTo({ top: 0 });
    };
    window.addEventListener("hashchange", onChange);
    return () => window.removeEventListener("hashchange", onChange);
  }, []);
  const navigate = useCallback((next: Route) => {
    const hash = routeToHash(next);
    if (window.location.hash !== hash) window.location.hash = hash;
    setRoute(next);
    window.scrollTo({ top: 0 });
  }, []);
  return [route, navigate] as const;
}

/** Re-renders every 30 s so countdowns and Meet windows stay current. */
function useNow() {
  const [now, setNow] = useState(() => new Date());
  useEffect(() => {
    const id = window.setInterval(() => setNow(new Date()), 30_000);
    return () => window.clearInterval(id);
  }, []);
  return now;
}

function describeError(error: unknown) {
  return error instanceof Error
    ? error.message
    : "Ocurrió un error inesperado.";
}

const TAB_FOR: Partial<Record<Route["name"], Tab>> = {
  inicio: "inicio",
  "check-resultado": "inicio",
  perfil: "inicio",
  modulos: "modulos",
  sesiones: "sesiones",
  sesion: "sesiones",
  credenciales: "credenciales",
  credencial: "credenciales",
};

interface PendingSlot {
  moduleId: string;
  sessionAt: Date;
  timezone: string;
}

function NotFound({ onHome, text }: { onHome: () => void; text: string }) {
  return (
    <main className="fa-main">
      <TopBar onBack={onHome} />
      <div className="fa-page">
        <Alert tone="error">{text}</Alert>
      </div>
    </main>
  );
}

export default function DApp({
  escrowConfigured,
}: {
  escrowConfigured: boolean;
}) {
  const wallet = useWallet();
  const escrow = useEscrow();
  const [route, navigate] = useHashRoute();
  const now = useNow();
  const [version, setVersion] = useState(0);
  const bump = () => setVersion((v) => v + 1);
  const [checkSkipped, setCheckSkipped] = useState(false);
  const [pending, setPending] = useState<PendingSlot | null>(null);
  const [pay, setPay] = useState<PayState>({ step: "idle", error: null });
  const [confirm, setConfirm] = useState<ConfirmState>({
    step: "idle",
    error: null,
  });
  const [freshId, setFreshId] = useState<string | null>(null);
  const [loginError, setLoginError] = useState<string | null>(null);

  const address = wallet.address;
  const data = useMemo(() => {
    void version;
    if (!address) return null;
    return {
      name: loadName(address),
      check: loadCheck(address),
      bookings: loadBookings(address),
      claims: loadClaims(address),
    };
  }, [address, version]);

  const signer = address ? { address, signXdr: wallet.signXdr } : null;

  function persist(booking: Booking) {
    saveBooking(booking);
    bump();
  }

  async function handlePay(module: TrainingModule, slot: PendingSlot) {
    if (!signer || !data) return;
    const sessionNumber = moduleProgress(
      data.bookings,
      module.id,
    ).nextSessionNumber;
    setPay({ step: "deploy", error: null });
    let booking: Booking | null = null;
    try {
      const deployed = await escrow.deploy(
        module,
        sessionNumber,
        signer,
        `${formatDay(slot.sessionAt, slot.timezone)} ${slot.sessionAt.toISOString()}`,
      );
      booking = {
        id: deployed.contractId,
        moduleId: module.id,
        sessionNumber,
        wallet: signer.address,
        contractId: deployed.contractId,
        engagementId: deployed.engagementId,
        amount: SESSION_PRICE_USD,
        sessionAt: slot.sessionAt.toISOString(),
        timezone: slot.timezone,
        status: "created",
        txHashes: deployed.hash ? { deploy: deployed.hash } : {},
        createdAt: new Date().toISOString(),
      };
      persist(booking);
      setPay({ step: "fund", error: null });
      const fundHash = await escrow.fund(booking.contractId, signer);
      booking = advanceBooking(booking, fundHash);
      persist(booking);
      setPay({ step: "idle", error: null });
      setPending(null);
      setFreshId(booking.id);
      void wallet.refresh();
      navigate({ name: "sesion", id: booking.id });
    } catch (cause) {
      setPay({ step: "idle", error: describeError(cause) });
      if (booking) {
        setPending(null);
        navigate({ name: "sesion", id: booking.id });
      }
    }
  }

  async function handleFundExisting(booking: Booking) {
    if (!signer) return;
    setConfirm({ step: "fund", error: null });
    try {
      const hash = await escrow.fund(booking.contractId, signer);
      persist(advanceBooking(booking, hash));
      void wallet.refresh();
      setConfirm({ step: "idle", error: null });
    } catch (cause) {
      setConfirm({ step: "idle", error: describeError(cause) });
    }
  }

  async function handleConfirm(booking: Booking) {
    if (!signer) return;
    let current = booking;
    try {
      if (current.status === "funded") {
        setConfirm({ step: "approve", error: null });
        const hash = await escrow.approve(current.contractId, signer);
        current = advanceBooking(current, hash);
        persist(current);
      }
      setConfirm({ step: "release", error: null });
      const hash = await escrow.release(current.contractId, signer);
      current = advanceBooking(current, hash);
      persist(current);
      setConfirm({ step: "idle", error: null });
      navigate({ name: "liberada", id: current.id });
    } catch (cause) {
      setConfirm({ step: "idle", error: describeError(cause) });
    }
  }

  async function handleDispute(booking: Booking) {
    if (!signer) return;
    setConfirm({ step: "dispute", error: null });
    try {
      const hash = await escrow.dispute(booking.contractId, signer);
      persist(markDisputed(booking, hash));
      setConfirm({ step: "idle", error: null });
      navigate({ name: "sesion", id: booking.id });
    } catch (cause) {
      setConfirm({ step: "idle", error: describeError(cause) });
    }
  }

  if (!wallet.isAuthenticated || !address || !data) {
    return (
      <div className="fa-app">
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
      </div>
    );
  }

  if (!data.name) {
    return (
      <div className="fa-app">
        <NameStep
          initial={wallet.profileName ?? ""}
          onSave={(name) => {
            saveName(address, name);
            bump();
            navigate({ name: data.check ? "inicio" : "check" });
          }}
        />
      </div>
    );
  }

  const { bookings, check, claims } = data;
  const name = data.name;
  const home = () => navigate({ name: "inicio" });
  const toModule = (module: TrainingModule) =>
    navigate({ name: "modulo", id: module.id });
  const toBooking = (booking: Booking) => {
    setConfirm({ step: "idle", error: null });
    setPay({ step: "idle", error: null });
    navigate({ name: "sesion", id: booking.id });
  };
  const toSchedule = (module: TrainingModule) => {
    setPay({ step: "idle", error: null });
    navigate({ name: "agendar", id: module.id });
  };
  const checkRoute = route.name.startsWith("check");
  const effective: Route =
    !check && !checkSkipped && !checkRoute ? { name: "check" } : route;

  function onCheckComplete(result: CheckResult) {
    saveCheck(result);
    bump();
    navigate({ name: "check-resultado" });
  }

  const moduleRoute = (id: string) => findModule(id);
  const bookingById = (id: string) =>
    bookings.find((booking) => booking.id === id) ?? null;
  const missingBooking = (
    <NotFound onHome={home} text="Sesión no encontrada en este navegador." />
  );
  const missingModule = <NotFound onHome={home} text="Módulo no encontrado." />;

  let screen;
  switch (effective.name) {
    case "check":
      screen = (
        <CheckIntro
          onStart={() => navigate({ name: "check-preguntas" })}
          onSkip={
            check
              ? home
              : () => {
                  setCheckSkipped(true);
                  home();
                }
          }
        />
      );
      break;
    case "check-preguntas":
      screen = (
        <CheckQuestions
          wallet={address}
          onExit={() => navigate({ name: "check" })}
          onComplete={onCheckComplete}
        />
      );
      break;
    case "check-resultado":
      screen = check ? (
        <CheckResultView
          result={check}
          onOpenModule={toModule}
          onCatalog={() => navigate({ name: "modulos" })}
        />
      ) : (
        <CheckIntro onStart={() => navigate({ name: "check-preguntas" })} />
      );
      break;
    case "modulos":
      screen = (
        <Catalog
          recommendedLayers={check ? lowestLayers(check.scores) : []}
          bookings={bookings}
          onSelect={toModule}
        />
      );
      break;
    case "modulo": {
      const module = moduleRoute(effective.id);
      screen = module ? (
        <ModuleDetail
          module={module}
          progress={moduleProgress(bookings, module.id)}
          onBack={() => navigate({ name: "modulos" })}
          onSchedule={() => toSchedule(module)}
          onOpenSession={(id) => navigate({ name: "sesion", id })}
          onClaim={() => navigate({ name: "credencial", id: module.id })}
        />
      ) : (
        missingModule
      );
      break;
    }
    case "agendar":
    case "pagar": {
      const module = moduleRoute(effective.id);
      if (!module) {
        screen = missingModule;
        break;
      }
      const progress = moduleProgress(bookings, module.id);
      if (progress.active || progress.completed || progress.disputed) {
        screen = (
          <ModuleDetail
            module={module}
            progress={progress}
            onBack={() => navigate({ name: "modulos" })}
            onSchedule={() => toSchedule(module)}
            onOpenSession={(id) => navigate({ name: "sesion", id })}
            onClaim={() => navigate({ name: "credencial", id: module.id })}
          />
        );
        break;
      }
      const slot =
        effective.name === "pagar" && pending?.moduleId === module.id
          ? pending
          : null;
      screen = slot ? (
        <Payment
          module={module}
          sessionNumber={progress.nextSessionNumber}
          sessionAt={slot.sessionAt}
          timezone={slot.timezone}
          wallet={wallet}
          pay={pay}
          escrowConfigured={escrowConfigured}
          onBack={() => navigate({ name: "agendar", id: module.id })}
          onPay={() => void handlePay(module, slot)}
          onTopUp={() => navigate({ name: "recarga", id: module.id })}
        />
      ) : (
        <Schedule
          title={`Agenda tu sesión ${progress.nextSessionNumber}`}
          step="1 / 2"
          psychologist={module.psychologist}
          ctaLabel="Continuar al pago"
          now={now}
          onBack={() => toModule(module)}
          onConfirm={(sessionAt, timezone) => {
            setPending({ moduleId: module.id, sessionAt, timezone });
            navigate({ name: "pagar", id: module.id });
          }}
        />
      );
      break;
    }
    case "recarga": {
      const id = effective.id;
      screen = (
        <TopUp wallet={wallet} onBack={() => navigate({ name: "pagar", id })} />
      );
      break;
    }
    case "sesion": {
      const booking = bookingById(effective.id);
      const module = booking && findModule(booking.moduleId);
      screen =
        booking && module ? (
          <Ticket
            booking={booking}
            module={module}
            now={now}
            fresh={freshId === booking.id}
            busy={confirm.step !== "idle"}
            error={pay.error ?? confirm.error}
            onBack={() => navigate({ name: "sesiones" })}
            onFund={() => void handleFundExisting(booking)}
            onReschedule={() =>
              navigate({ name: "reprogramar", id: booking.id })
            }
            onConfirm={() => {
              setConfirm({ step: "idle", error: null });
              navigate({ name: "confirmar", id: booking.id });
            }}
          />
        ) : (
          missingBooking
        );
      break;
    }
    case "reprogramar": {
      const booking = bookingById(effective.id);
      const module = booking && findModule(booking.moduleId);
      if (!booking || !module) {
        screen = missingBooking;
        break;
      }
      screen = canReschedule(booking, now) ? (
        <Reschedule booking={booking}>
          {(notice) => (
            <Schedule
              title={`Reprogramar sesión ${booking.sessionNumber}`}
              psychologist={module.psychologist}
              ctaLabel="Confirmar nuevo horario"
              notice={notice}
              now={now}
              onBack={() => toBooking(booking)}
              onConfirm={(sessionAt, timezone) => {
                persist({ ...rescheduleBooking(booking, sessionAt), timezone });
                toBooking(booking);
              }}
            />
          )}
        </Reschedule>
      ) : (
        <NotFound
          onHome={() => toBooking(booking)}
          text="Ya no es posible reprogramar esta sesión: faltan menos de 24 h o ya fue confirmada."
        />
      );
      break;
    }
    case "confirmar": {
      const booking = bookingById(effective.id);
      const module = booking && findModule(booking.moduleId);
      screen =
        booking && module ? (
          <ConfirmSession
            booking={booking}
            module={module}
            state={confirm}
            onClose={() => toBooking(booking)}
            onConfirm={() => void handleConfirm(booking)}
            onDispute={() => void handleDispute(booking)}
          />
        ) : (
          missingBooking
        );
      break;
    }
    case "liberada": {
      const booking = bookingById(effective.id);
      const module = booking && findModule(booking.moduleId);
      screen =
        booking && module ? (
          <Released
            booking={booking}
            progress={moduleProgress(bookings, module.id)}
            onNext={() => toSchedule(module)}
            onHome={home}
            onClaim={() => navigate({ name: "reclamar", id: module.id })}
          />
        ) : (
          missingBooking
        );
      break;
    }
    case "sesiones":
      screen = (
        <Sessions
          bookings={bookings}
          onOpenBooking={toBooking}
          onSchedule={toSchedule}
          onCatalog={() => navigate({ name: "modulos" })}
        />
      );
      break;
    case "reclamar":
    case "credencial": {
      const module = moduleRoute(effective.id);
      if (!module) {
        screen = missingModule;
        break;
      }
      const progress = moduleProgress(bookings, module.id);
      const claim = claims.find((item) => item.moduleId === module.id);
      if (!progress.completed || !progress.lastReleased) {
        screen = (
          <NotFound
            onHome={() => toModule(module)}
            text="Completa las sesiones del módulo para reclamar tu credencial."
          />
        );
      } else if (!claim) {
        screen = (
          <ClaimCredential
            module={module}
            onClaim={() => {
              saveClaim({
                wallet: address,
                moduleId: module.id,
                holder: name,
                claimedAt: new Date().toISOString(),
              });
              bump();
              navigate({ name: "credencial", id: module.id });
            }}
          />
        );
      } else {
        screen = (
          <CredentialView
            module={module}
            claim={claim}
            lastSession={progress.lastReleased}
            onExplore={() => navigate({ name: "modulos" })}
          />
        );
      }
      break;
    }
    case "credenciales": {
      const items = claims
        .map((claim) => ({ claim, module: findModule(claim.moduleId) }))
        .filter(
          (
            item,
          ): item is { claim: typeof item.claim; module: TrainingModule } =>
            Boolean(item.module),
        );
      const pendingClaims = catalog.filter(
        (module) =>
          moduleProgress(bookings, module.id).completed &&
          !claims.some((claim) => claim.moduleId === module.id),
      );
      screen = (
        <CredentialList
          items={items}
          pending={pendingClaims}
          onOpen={(module) => navigate({ name: "credencial", id: module.id })}
          onCatalog={() => navigate({ name: "modulos" })}
        />
      );
      break;
    }
    case "perfil":
      screen = (
        <Profile
          name={name}
          wallet={wallet}
          onBack={home}
          onRename={(next) => {
            saveName(address, next);
            bump();
          }}
          onCheck={() => navigate({ name: "check" })}
        />
      );
      break;
    default:
      screen = (
        <Home
          name={firstName(name)}
          bookings={bookings}
          check={check}
          now={now}
          onOpenBooking={toBooking}
          onOpenModule={toModule}
          onCheck={() =>
            navigate({ name: check ? "check-resultado" : "check" })
          }
          onCatalog={() => navigate({ name: "modulos" })}
          onProfile={() => navigate({ name: "perfil" })}
        />
      );
  }

  const tab = TAB_FOR[effective.name] ?? null;
  return (
    <div className="fa-app">
      {screen}
      {tab && (
        <TabBar active={tab} onSelect={(next) => navigate({ name: next })} />
      )}
    </div>
  );
}
