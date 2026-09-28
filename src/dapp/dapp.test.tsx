import { afterEach, describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import {
  advanceBooking,
  type Booking,
  canConfirm,
  canReschedule,
  loadBookings,
  markDisputed,
  moduleProgress,
  saveBooking,
} from "./bookings";
import { catalog, findModule, layerLabel } from "./catalog";
import {
  FSH_PLATFORM_ADDRESS,
  FSH_TRAINER_ADDRESS,
  SESSION_PRICE_USD,
  SESSIONS_PER_MODULE,
  USDC,
} from "./config";
import { buildEscrowPayload, createEngagementId } from "./escrow";
import {
  buildResult,
  type CheckResponse,
  lowestLayers,
  QUESTIONS,
  SCALE,
  scoreResponses,
} from "./humanStackCheck";
import { credentialId, firstName } from "./profile";
import { isDAppPath, parseRoute, type Route, routeToHash } from "./routes";
import { buildMonthGrid, isSelectableDay } from "./scheduling";
import Catalog from "./screens/Catalog";
import { CheckQuestions, CheckResultView } from "./screens/Check";
import { CredentialView } from "./screens/Credential";
import Login from "./screens/Login";
import ModuleDetail from "./screens/ModuleDetail";
import Payment from "./screens/Payment";
import { ConfirmSession, Ticket } from "./screens/Session";
import { EMPTY_BALANCES } from "./stellar";
import type { WalletState } from "./useWallet";

const WALLET = "GTESTWALLETADDRESS000000000000000000000000000000000000";
const confianza = findModule("regulacion-de-la-confianza")!;

function responses(values: number[]): CheckResponse[] {
  return QUESTIONS.map((question, index) => ({
    question_id: question.id,
    dimension: question.dimension,
    response_value: values[index],
    timestamp: "2026-10-01T00:00:00.000Z",
  }));
}

function booking(overrides: Partial<Booking> = {}): Booking {
  return {
    id: "CCONTRACT1",
    moduleId: confianza.id,
    sessionNumber: 1,
    wallet: WALLET,
    contractId: "CCONTRACTABCDEF123456",
    engagementId: "e-1",
    amount: SESSION_PRICE_USD,
    sessionAt: "2026-10-06T23:00:00.000Z",
    timezone: "America/La_Paz",
    status: "funded",
    txHashes: {},
    createdAt: "2026-09-27T00:00:00.000Z",
    ...overrides,
  };
}

function wallet(usdc: string): WalletState {
  return {
    address: WALLET,
    email: null,
    profileName: null,
    isAuthenticated: true,
    verified: true,
    balances: { ...EMPTY_BALANCES, exists: true, usdc, hasUsdcTrustline: true },
    loading: false,
    task: "idle",
    error: null,
    notice: null,
    lastTx: null,
    login: vi.fn(),
    logout: vi.fn(),
    refresh: vi.fn(async () => EMPTY_BALANCES),
    fundXlm: vi.fn(async () => undefined),
    enableUsdc: vi.fn(async () => true),
    claimUsdc: vi.fn(async () => undefined),
    signXdr: vi.fn(async (xdr: string) => xdr),
    signAndSubmit: vi.fn(async () => "hash"),
  };
}

afterEach(() => window.localStorage.clear());

describe("Human Stack Check V1", () => {
  it("keeps the 10 questions in the specified order and dimensions", () => {
    expect(QUESTIONS).toHaveLength(10);
    expect(QUESTIONS.map((q) => q.dimension)).toEqual([
      "runtime",
      "runtime",
      "api",
      "api",
      "merge",
      "merge",
      "firewall",
      "firewall",
      "fork",
      "fork",
    ]);
    expect(QUESTIONS[0].text).toBe(
      "Cuando tengo varias cosas importantes que hacer, decido qué atender primero y organizo mi tiempo para avanzar.",
    );
    expect(QUESTIONS[0].variable).toBe("runtime_q1");
    expect(SCALE.map((s) => s.label)).toEqual([
      "Casi nunca",
      "Pocas veces",
      "A veces",
      "Muchas veces",
      "Casi siempre",
    ]);
  });

  it("scores each dimension as the sum of its two items (2–10), without a global score", () => {
    const scores = scoreResponses(responses([4, 4, 3, 3, 4, 3, 2, 3, 4, 4]));
    expect(scores).toEqual({
      runtime: 8,
      api: 6,
      merge: 7,
      firewall: 5,
      fork: 8,
    });
    expect(Object.keys(scores)).not.toContain("global");
  });

  it("stores every individual response and reports ties as several focus layers", () => {
    const result = buildResult(
      WALLET,
      responses([1, 1, 1, 1, 5, 5, 5, 5, 5, 5]),
    );
    expect(result.responses).toHaveLength(10);
    expect(result.responses[0]).toMatchObject({
      question_id: 1,
      dimension: "runtime",
      response_value: 1,
    });
    expect(lowestLayers(result.scores)).toEqual(["runtime", "api"]);
  });
});

describe("catálogo", () => {
  it("offers the three available modules with their psychologists", () => {
    expect(catalog.map((m) => [m.skill, m.psychologist.name])).toEqual([
      ["Regulación de metas", "Madai Aramayo"],
      ["Habilidad de trabajo en equipo", "Yohana Condori"],
      ["Regulación de la confianza", "Shirley Ali"],
    ]);
  });

  it("always writes the layer with its domain", () => {
    expect(layerLabel("firewall")).toBe("Firewall (Resiliencia emocional)");
  });
});

describe("rutas", () => {
  it("round-trips every route through the hash", () => {
    const routes: Route[] = [
      { name: "inicio" },
      { name: "check" },
      { name: "check-preguntas" },
      { name: "check-resultado" },
      { name: "modulos" },
      { name: "modulo", id: "x" },
      { name: "agendar", id: "x" },
      { name: "pagar", id: "x" },
      { name: "recarga", id: "x" },
      { name: "sesion", id: "C1" },
      { name: "reprogramar", id: "C1" },
      { name: "confirmar", id: "C1" },
      { name: "liberada", id: "C1" },
      { name: "sesiones" },
      { name: "reclamar", id: "x" },
      { name: "credenciales" },
      { name: "credencial", id: "x" },
      { name: "perfil" },
    ];
    for (const route of routes)
      expect(parseRoute(routeToHash(route))).toEqual(route);
    expect(parseRoute("#/desconocida")).toEqual({ name: "inicio" });
    expect(isDAppPath("/app")).toBe(true);
    expect(isDAppPath("/")).toBe(false);
  });
});

describe("sesiones y escrow", () => {
  it("builds one single-release escrow per session at the session price", () => {
    const payload = buildEscrowPayload(
      confianza,
      2,
      WALLET,
      "mar 6 oct",
      "e-2",
    );
    expect(payload.amount).toBe(15);
    expect(payload.title).toBe("Regulación de la confianza · Sesión 2");
    expect(payload.roles).toMatchObject({
      approver: WALLET,
      releaseSigner: WALLET,
      serviceProvider: FSH_TRAINER_ADDRESS,
      disputeResolver: FSH_PLATFORM_ADDRESS,
    });
    expect(payload.trustline).toEqual({ address: USDC.issuer, symbol: "USDC" });
    expect(createEngagementId("m", 3, 0)).toBe("m-s3-0");
  });

  it("walks the escrow lifecycle and records each transaction", () => {
    let b = booking({ status: "created" });
    b = advanceBooking(b, "h-fund");
    b = advanceBooking(b, "h-approve");
    b = advanceBooking(b, "h-release");
    expect(b.status).toBe("released");
    expect(b.txHashes).toEqual({
      fund: "h-fund",
      approve: "h-approve",
      release: "h-release",
    });
    expect(advanceBooking(b, "again")).toBe(b);
    expect(markDisputed(booking(), "h-d")).toMatchObject({
      status: "disputed",
      txHashes: { dispute: "h-d" },
    });
  });

  it("tracks module progress until every session is released", () => {
    const released = Array.from({ length: SESSIONS_PER_MODULE }, (_, i) =>
      booking({ id: `C${i}`, sessionNumber: i + 1, status: "released" }),
    );
    const midway = moduleProgress(
      released.slice(0, 2).concat(booking({ id: "C9", sessionNumber: 3 })),
      confianza.id,
    );
    expect(midway).toMatchObject({
      released: 2,
      nextSessionNumber: 3,
      completed: false,
    });
    expect(midway.active?.id).toBe("C9");
    const done = moduleProgress(released, confianza.id);
    expect(done.completed).toBe(true);
    expect(done.lastReleased?.sessionNumber).toBe(SESSIONS_PER_MODULE);
  });

  it("allows rescheduling only with 24 h notice and persists bookings per wallet", () => {
    const b = booking();
    expect(canReschedule(b, new Date("2026-10-05T22:00:00.000Z"))).toBe(true);
    expect(canReschedule(b, new Date("2026-10-06T00:00:00.000Z"))).toBe(false);
    expect(canConfirm(b, new Date("2026-10-01T00:00:00.000Z"))).toBe(true);
    expect(canConfirm(booking({ status: "released" }))).toBe(false);
    saveBooking(b);
    expect(loadBookings(WALLET)).toHaveLength(1);
    expect(loadBookings("OTHER")).toHaveLength(0);
  });

  it("derives a readable credential id and the first name", () => {
    expect(credentialId(confianza.id, booking())).toBe("FSH-CRED-RC-123456");
    expect(firstName("Camila Rojas")).toBe("Camila");
  });

  it("only offers weekdays from tomorrow in a Monday-first grid", () => {
    const today = new Date(2026, 8, 27);
    expect(isSelectableDay(new Date(2026, 8, 28), today)).toBe(true);
    expect(isSelectableDay(new Date(2026, 9, 3), today)).toBe(false);
    expect(buildMonthGrid(2026, 9)[3].getDate()).toBe(1);
  });
});

describe("pantallas", () => {
  it("login uses Google", () => {
    render(<Login configured onLogin={vi.fn()} />);
    expect(
      screen.getByRole("button", { name: /Continuar con Google/ }),
    ).toBeEnabled();
  });

  it("answers the ten questions and returns the result", async () => {
    const user = userEvent.setup();
    const onComplete = vi.fn();
    render(
      <CheckQuestions
        wallet={WALLET}
        onExit={vi.fn()}
        onComplete={onComplete}
      />,
    );
    const next = () =>
      screen.getByRole("button", { name: /Siguiente|Ver mi resultado/ });
    expect(next()).toBeDisabled();
    for (let i = 0; i < 10; i++) {
      await user.click(screen.getByRole("radio", { name: /Muchas veces/ }));
      await user.click(next());
    }
    expect(onComplete).toHaveBeenCalledOnce();
    expect(onComplete.mock.calls[0][0].scores.firewall).toBe(8);
  });

  it("shows the profile without levels, the focus module and the disclaimer", () => {
    render(
      <CheckResultView
        result={buildResult(WALLET, responses([4, 4, 3, 3, 4, 3, 2, 3, 4, 4]))}
        onOpenModule={vi.fn()}
        onCatalog={vi.fn()}
      />,
    );
    expect(
      screen.getByText("Una capa para empezar a explorar"),
    ).toBeInTheDocument();
    expect(screen.getByText("Regulación de la confianza")).toBeInTheDocument();
    expect(
      screen.getByText(/No es el BESSI ni una versión oficial del BESSI/),
    ).toBeInTheDocument();
    expect(document.body.textContent).not.toMatch(/nivel|BESSI-10/i);
  });

  it("recommends the module that matches the check in the catalog", () => {
    render(
      <Catalog
        recommendedLayers={["firewall"]}
        bookings={[]}
        onSelect={vi.fn()}
      />,
    );
    expect(screen.getAllByRole("button", { name: /sesiones/ })).toHaveLength(3);
    expect(screen.getByText("Según tu check")).toBeInTheDocument();
  });

  it("invites to book the first session with the human CTA", () => {
    render(
      <ModuleDetail
        module={confianza}
        progress={moduleProgress([], confianza.id)}
        onBack={vi.fn()}
        onSchedule={vi.fn()}
        onOpenSession={vi.fn()}
        onClaim={vi.fn()}
      />,
    );
    expect(
      screen.getByRole("button", { name: "Agenda tu primera sesión" }),
    ).toHaveClass("fa-btn--human");
    expect(screen.getByText("Shirley Ali")).toBeInTheDocument();
  });

  it("asks to top up when the balance does not cover the session", async () => {
    const user = userEvent.setup();
    const onTopUp = vi.fn();
    render(
      <Payment
        module={confianza}
        sessionNumber={1}
        sessionAt={new Date("2026-10-06T23:00:00.000Z")}
        timezone="America/La_Paz"
        wallet={wallet("0")}
        pay={{ step: "idle", error: null }}
        escrowConfigured
        onBack={vi.fn()}
        onPay={vi.fn()}
        onTopUp={onTopUp}
      />,
    );
    expect(screen.getByText(/Te faltan/)).toHaveTextContent("15.00 USDC");
    await user.click(screen.getByRole("button", { name: "Recarga tu saldo" }));
    expect(onTopUp).toHaveBeenCalled();
  });

  it("shows the escrow as held on the ticket", () => {
    render(
      <Ticket
        booking={booking()}
        module={confianza}
        busy={false}
        error={null}
        fresh
        onBack={vi.fn()}
        onFund={vi.fn()}
        onReschedule={vi.fn()}
        onConfirm={vi.fn()}
        now={new Date("2026-10-01T00:00:00.000Z")}
      />,
    );
    expect(screen.getByText("Sesión agendada y pagada")).toBeInTheDocument();
    expect(
      screen.getByText("15.00 USDC retenidos en escrow"),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /Reprogramar/ }),
    ).toBeInTheDocument();
  });

  it("closes the module on the last session confirmation", () => {
    render(
      <ConfirmSession
        booking={booking({ sessionNumber: SESSIONS_PER_MODULE })}
        module={confianza}
        state={{ step: "idle", error: null }}
        onClose={vi.fn()}
        onConfirm={vi.fn()}
        onDispute={vi.fn()}
      />,
    );
    expect(
      screen.getByRole("button", { name: /Confirmar y completar el módulo/ }),
    ).toBeInTheDocument();
    expect(
      screen.getByText("Tuve un problema con la sesión"),
    ).toBeInTheDocument();
  });

  it("renders the credential with skill, layer and verifiable record", () => {
    const last = booking({
      status: "released",
      txHashes: { release: "abcdef1234567890" },
    });
    render(
      <CredentialView
        module={confianza}
        claim={{
          wallet: WALLET,
          moduleId: confianza.id,
          holder: "Camila Rojas",
          claimedAt: "2026-11-03T12:00:00.000Z",
        }}
        lastSession={last}
        onExplore={vi.fn()}
      />,
    );
    expect(screen.getByText("Camila Rojas")).toBeInTheDocument();
    expect(
      screen.getByRole("img", {
        name: /Credencial de Regulación de la confianza, capa Firewall \(Resiliencia emocional\)/,
      }),
    ).toBeInTheDocument();
    expect(screen.getByText("Verificado en blockchain")).toBeInTheDocument();
  });
});
