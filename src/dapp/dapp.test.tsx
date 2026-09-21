import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import App from "../App";
import {
  advanceBooking,
  type Booking,
  loadBookings,
  saveBooking,
  sessionHasPassed,
} from "./bookings";
import { catalog, timeSlots } from "./catalog";
import {
  FSH_PLATFORM_ADDRESS,
  FSH_TRAINER_ADDRESS,
  NETWORK,
  SESSION_PRICE_USD,
  USDC,
} from "./config";
import { buildEscrowPayload, ESCROW_TYPE } from "./escrow";
import { isDAppPath, parseRoute, routeToHash } from "./routes";
import { buildMonthGrid, combineDateTime, isSelectableDay } from "./scheduling";
import BookingView from "./screens/BookingView";
import Dashboard from "./screens/Dashboard";
import Login from "./screens/Login";
import Schedule from "./screens/Schedule";
import WalletCard from "./screens/WalletCard";
import {
  type Balances,
  EMPTY_BALANCES,
  fetchBalances,
  formatAmount,
  fundWithFriendbot,
  hasEnoughUsdc,
  shortAddress,
} from "./stellar";
import type { WalletState } from "./useWallet";

const USER = "GAUSERXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXA";

function walletState(overrides: Partial<WalletState> = {}): WalletState {
  return {
    address: USER,
    email: "builder@fsh.dev",
    isAuthenticated: true,
    verified: true,
    balances: {
      exists: true,
      xlm: "9999.5",
      usdc: "50",
      hasUsdcTrustline: true,
    },
    loading: false,
    task: "idle",
    error: null,
    notice: null,
    login: vi.fn(),
    logout: vi.fn(),
    refresh: vi.fn(async () => EMPTY_BALANCES),
    fundXlm: vi.fn(async () => undefined),
    claimUsdc: vi.fn(async () => undefined),
    signXdr: vi.fn(async (xdr: string) => xdr),
    signAndSubmit: vi.fn(async () => "hash"),
    ...overrides,
  };
}

function booking(overrides: Partial<Booking> = {}): Booking {
  return {
    id: "CCONTRACT",
    moduleId: catalog[0].id,
    wallet: USER,
    contractId: "CCONTRACT",
    engagementId: "fsh-1",
    amount: SESSION_PRICE_USD,
    sessionAt: "2026-10-05T15:00:00.000Z",
    timezone: "America/Mexico_City",
    status: "created",
    txHashes: {},
    createdAt: "2026-09-20T00:00:00.000Z",
    ...overrides,
  };
}

describe("landing → dApp link", () => {
  it("routes the evolution CTAs to /app and detects the dApp path", () => {
    render(<App />);
    const ctas = screen
      .getAllByRole("link")
      .filter((link) => /evolución/i.test(link.textContent ?? ""));
    expect(ctas.length).toBeGreaterThan(0);
    for (const cta of ctas) expect(cta).toHaveAttribute("href", "/app");
    expect(isDAppPath("/app")).toBe(true);
    expect(isDAppPath("/app/")).toBe(true);
    expect(isDAppPath("/")).toBe(false);
    expect(isDAppPath("/application")).toBe(false);
  });

  it("round-trips hash routes", () => {
    const routes = [
      { name: "dashboard" },
      { name: "module", id: "m1" },
      { name: "schedule", id: "m1" },
      { name: "booking", id: "CABC" },
      { name: "certificados" },
      { name: "perfil" },
    ] as const;
    for (const route of routes)
      expect(parseRoute(routeToHash(route))).toEqual(route);
    expect(parseRoute("#/desconocido")).toEqual({ name: "dashboard" });
    expect(parseRoute("")).toEqual({ name: "dashboard" });
  });
});

describe("configuration", () => {
  it("is testnet-only and uses Trustless Work's documented testnet USDC", () => {
    expect(NETWORK).toBe("testnet");
    expect(USDC.issuer).toBe(
      "GBBD47IF6LWK7P7MDEVSCWR7DPUWV3NY3DTQEVFL4NAT4AQH3ZLLFLA5",
    );
    expect(FSH_PLATFORM_ADDRESS).toMatch(/^G[A-Z2-7]{55}$/);
    expect(FSH_TRAINER_ADDRESS).toMatch(/^G[A-Z2-7]{55}$/);
    expect(USDC.issuer).toMatch(/^G[A-Z2-7]{55}$/);
  });

  it("disables Google sign-in and explains when the Pollar key is missing", () => {
    render(<Login configured={false} onLogin={vi.fn()} />);
    expect(
      screen.getByRole("button", { name: /Iniciar Sesión con Google/ }),
    ).toBeDisabled();
    expect(screen.getByRole("alert")).toHaveTextContent(
      /VITE_POLLAR_PUBLISHABLE_KEY/,
    );
  });

  it("invokes Google login when configured", async () => {
    const onLogin = vi.fn();
    render(<Login configured onLogin={onLogin} />);
    await userEvent.click(
      screen.getByRole("button", { name: /Iniciar Sesión con Google/ }),
    );
    expect(onLogin).toHaveBeenCalledOnce();
    expect(screen.getByText("Stellar Testnet")).toBeInTheDocument();
  });
});

describe("stellar helpers", () => {
  const fetchMock = vi.fn<typeof fetch>();
  beforeEach(() => vi.stubGlobal("fetch", fetchMock));
  afterEach(() => {
    fetchMock.mockReset();
    vi.unstubAllGlobals();
  });

  it("reads XLM + USDC balances from Horizon and matches the issuer", async () => {
    fetchMock.mockResolvedValueOnce(
      new Response(
        JSON.stringify({
          balances: [
            { asset_type: "native", balance: "10000.0000000" },
            {
              asset_type: "credit_alphanum4",
              asset_code: "USDC",
              asset_issuer: "GOTHER",
              balance: "999",
            },
            {
              asset_type: "credit_alphanum4",
              asset_code: "USDC",
              asset_issuer: USDC.issuer,
              balance: "42.5000000",
            },
          ],
        }),
      ),
    );
    const balances = await fetchBalances(USER);
    expect(balances).toEqual<Balances>({
      exists: true,
      xlm: "10000.0000000",
      usdc: "42.5000000",
      hasUsdcTrustline: true,
    });
    expect(fetchMock.mock.calls[0][0]).toBe(
      `https://horizon-testnet.stellar.org/accounts/${USER}`,
    );
  });

  it("treats an unknown Horizon account as unfunded", async () => {
    fetchMock.mockResolvedValueOnce(new Response("", { status: 404 }));
    expect(await fetchBalances(USER)).toEqual(EMPTY_BALANCES);
  });

  it("funds through Friendbot and tolerates already-funded accounts", async () => {
    fetchMock.mockResolvedValueOnce(new Response("{}", { status: 200 }));
    await fundWithFriendbot(USER);
    expect(String(fetchMock.mock.calls[0][0])).toBe(
      `https://friendbot.stellar.org/?addr=${USER}`,
    );
    fetchMock.mockResolvedValueOnce(
      new Response(JSON.stringify({ detail: "createAccountAlreadyExist" }), {
        status: 400,
      }),
    );
    await expect(fundWithFriendbot(USER)).resolves.toBeUndefined();
    fetchMock.mockResolvedValueOnce(new Response("boom", { status: 500 }));
    await expect(fundWithFriendbot(USER)).rejects.toThrow();
  });

  it("formats amounts and addresses", () => {
    expect(formatAmount("42.5000000")).toBe("42.50");
    expect(formatAmount("abc")).toBe("0.00");
    expect(shortAddress(USER)).toBe("GAUS...XXXA");
    expect(
      hasEnoughUsdc({ ...EMPTY_BALANCES, usdc: "30" }, SESSION_PRICE_USD),
    ).toBe(true);
    expect(
      hasEnoughUsdc({ ...EMPTY_BALANCES, usdc: "29.99" }, SESSION_PRICE_USD),
    ).toBe(false);
  });
});

describe("wallet card", () => {
  it("shows the address, both balances, and the funding actions", async () => {
    const wallet = walletState();
    render(<WalletCard wallet={wallet} />);
    expect(screen.getByText("50.00")).toBeInTheDocument();
    expect(screen.getByText("9,999.50")).toBeInTheDocument();
    expect(screen.getByText("builder@fsh.dev")).toBeInTheDocument();
    await userEvent.click(
      screen.getByRole("button", { name: /Fondear XLM \(Friendbot\)/ }),
    );
    expect(wallet.fundXlm).toHaveBeenCalledOnce();
    await userEvent.click(
      screen.getByRole("button", { name: /Obtener USDC de prueba/ }),
    );
    expect(wallet.claimUsdc).toHaveBeenCalledOnce();
  });

  it("blocks the USDC faucet until the account exists on testnet", () => {
    render(
      <WalletCard
        wallet={walletState({
          balances: EMPTY_BALANCES,
          error: "Friendbot falló",
        })}
      />,
    );
    expect(
      screen.getByRole("button", { name: /Obtener USDC de prueba/ }),
    ).toBeDisabled();
    expect(screen.getByRole("alert")).toHaveTextContent("Friendbot falló");
  });
});

describe("dashboard", () => {
  it("lists the Spanish catalog and selects a module", async () => {
    const onSelectModule = vi.fn();
    render(
      <Dashboard
        wallet={walletState()}
        bookings={[]}
        mode="new"
        onMode={vi.fn()}
        onSelectModule={onSelectModule}
        onOpenBooking={vi.fn()}
      />,
    );
    for (const module of catalog)
      expect(screen.getByText(module.title)).toBeInTheDocument();
    const buttons = screen.getAllByRole("button", { name: /Iniciar Módulo/ });
    expect(buttons).toHaveLength(catalog.length);
    await userEvent.click(buttons[1]);
    expect(onSelectModule).toHaveBeenCalledWith(catalog[1]);
  });

  it("shows returning-user bookings with their escrow state", async () => {
    const onOpenBooking = vi.fn();
    const funded = booking({ status: "funded" });
    render(
      <Dashboard
        wallet={walletState()}
        bookings={[funded]}
        mode="returning"
        onMode={vi.fn()}
        onSelectModule={vi.fn()}
        onOpenBooking={onOpenBooking}
      />,
    );
    expect(screen.getByText(/fondos en escrow/i)).toBeInTheDocument();
    await userEvent.click(
      screen.getByRole("button", { name: new RegExp(catalog[0].title) }),
    );
    expect(onOpenBooking).toHaveBeenCalledWith(funded);
  });
});

describe("scheduling", () => {
  const today = new Date(2026, 8, 21, 10, 0, 0); // Monday

  it("only allows future weekdays within 45 days", () => {
    expect(isSelectableDay(new Date(2026, 8, 21), today)).toBe(false);
    expect(isSelectableDay(new Date(2026, 8, 22), today)).toBe(true);
    expect(isSelectableDay(new Date(2026, 8, 26), today)).toBe(false); // Saturday
    expect(isSelectableDay(new Date(2026, 8, 27), today)).toBe(false); // Sunday
    expect(isSelectableDay(new Date(2026, 10, 2), today)).toBe(true);
    expect(isSelectableDay(new Date(2026, 10, 9), today)).toBe(false);
  });

  it("builds a Monday-first grid and combines date + slot", () => {
    const grid = buildMonthGrid(2026, 8);
    expect(grid.length % 7).toBe(0);
    expect(grid[0].getDay()).toBe(1);
    expect(grid.some((d) => d.getMonth() === 8 && d.getDate() === 1)).toBe(
      true,
    );
    const at = combineDateTime(new Date(2026, 8, 22), 15, 0);
    expect(at.getHours()).toBe(15);
    expect(at.getDate()).toBe(22);
    expect(timeSlots.map((slot) => slot.label)).toEqual(
      expect.arrayContaining([
        "09:00 AM",
        "11:30 AM",
        "03:00 PM",
        "04:00 PM",
        "05:30 PM",
      ]),
    );
  });

  it("requires a date, a slot, wallet payment and enough USDC before paying", async () => {
    const onPay = vi.fn();
    render(
      <Schedule
        module={catalog[0]}
        wallet={walletState()}
        pay={{ step: "idle", error: null }}
        onBack={vi.fn()}
        onPay={onPay}
        now={today}
      />,
    );
    const payButton = screen.getByRole("button", {
      name: /Pagar \$30\.00 USD/,
    });
    expect(payButton).toBeDisabled();
    const day22 = screen
      .getAllByRole("gridcell")
      .find(
        (cell) => cell.textContent === "22" && !cell.hasAttribute("disabled"),
      );
    expect(day22).toBeDefined();
    await userEvent.click(day22!);
    expect(payButton).toBeDisabled();
    await userEvent.click(screen.getByRole("button", { name: "03:00 PM" }));
    expect(payButton).toBeEnabled();
    await userEvent.click(screen.getByRole("tab", { name: /Rampa Fiat/ }));
    expect(payButton).toBeDisabled();
    await userEvent.click(screen.getByRole("tab", { name: /Wallet Pollar/ }));
    await userEvent.click(payButton);
    const [sessionAt, timezone] = onPay.mock.calls[0] as [Date, string];
    expect(sessionAt.getDate()).toBe(22);
    expect(sessionAt.getHours()).toBe(15);
    expect(timezone).toBe(Intl.DateTimeFormat().resolvedOptions().timeZone);
  });

  it("refuses payment without enough test USDC", () => {
    render(
      <Schedule
        module={catalog[0]}
        wallet={walletState({
          balances: {
            exists: true,
            xlm: "100",
            usdc: "5",
            hasUsdcTrustline: true,
          },
        })}
        pay={{ step: "idle", error: null }}
        onBack={vi.fn()}
        onPay={vi.fn()}
        now={today}
      />,
    );
    expect(screen.getByRole("alert")).toHaveTextContent(/al menos 30 USDC/);
    expect(screen.getByRole("button", { name: /Pagar/ })).toBeDisabled();
  });

  it("surfaces the missing Trustless Work key error and busy states", () => {
    const { rerender } = render(
      <Schedule
        module={catalog[0]}
        wallet={walletState()}
        pay={{
          step: "idle",
          error:
            "Falta configurar VITE_TRUSTLESS_WORK_API_KEY para desplegar el escrow.",
        }}
        onBack={vi.fn()}
        onPay={vi.fn()}
        now={today}
      />,
    );
    expect(screen.getByRole("alert")).toHaveTextContent(
      /VITE_TRUSTLESS_WORK_API_KEY/,
    );
    rerender(
      <Schedule
        module={catalog[0]}
        wallet={walletState()}
        pay={{ step: "deploy", error: null }}
        onBack={vi.fn()}
        onPay={vi.fn()}
        now={today}
      />,
    );
    expect(
      screen.getByRole("button", { name: /Creando escrow en Soroban/ }),
    ).toBeDisabled();
  });
});

describe("escrow", () => {
  it("builds a single-release Trustless Work payload with the right roles", () => {
    const payload = buildEscrowPayload(
      catalog[0],
      USER,
      "lunes, 5 de octubre de 2026, 10:00",
      "fsh-42",
    );
    expect(ESCROW_TYPE).toBe("single-release");
    expect(payload.signer).toBe(USER);
    expect(payload.roles.approver).toBe(USER);
    expect(payload.roles.releaseSigner).toBe(USER);
    expect(payload.roles.serviceProvider).toBe(FSH_TRAINER_ADDRESS);
    expect(payload.roles.receiver).toBe(FSH_TRAINER_ADDRESS);
    expect(payload.roles.platformAddress).toBe(FSH_PLATFORM_ADDRESS);
    expect(payload.amount).toBe(SESSION_PRICE_USD);
    expect(payload.trustline).toEqual({ address: USDC.issuer, symbol: "USDC" });
    expect(payload.milestones).toHaveLength(1);
    expect(payload.engagementId).toBe("fsh-42");
  });

  it("advances bookings through created → funded → approved → released", () => {
    let current = booking();
    current = advanceBooking(current, "h-fund");
    expect(current.status).toBe("funded");
    expect(current.txHashes.fund).toBe("h-fund");
    current = advanceBooking(current, undefined);
    expect(current.status).toBe("approved");
    current = advanceBooking(current, "h-release");
    expect(current).toMatchObject({
      status: "released",
      txHashes: { fund: "h-fund", release: "h-release" },
    });
    expect(advanceBooking(current, "x")).toBe(current);
  });

  it("persists bookings per wallet", () => {
    window.localStorage.clear();
    saveBooking(booking());
    saveBooking(booking({ id: "C2", contractId: "C2", wallet: "GOTHER" }));
    expect(loadBookings(USER)).toHaveLength(1);
    expect(loadBookings("GOTHER")[0].contractId).toBe("C2");
    saveBooking(booking({ status: "funded" }));
    expect(loadBookings(USER)).toHaveLength(1);
    expect(loadBookings(USER)[0].status).toBe("funded");
  });

  it("only offers release after the session has happened and been approved", async () => {
    const before = new Date("2026-10-01T00:00:00Z");
    const after = new Date("2026-10-06T00:00:00Z");
    const funded = booking({ status: "funded" });
    expect(sessionHasPassed(funded, before)).toBe(false);
    expect(sessionHasPassed(funded, after)).toBe(true);

    const onApprove = vi.fn();
    const onRelease = vi.fn();
    const props = {
      module: catalog[0],
      onchain: null,
      release: { step: "idle" as const, error: null },
      onBack: vi.fn(),
      onFund: vi.fn(),
      onApprove,
      onRelease,
      onRefresh: vi.fn(),
    };
    const { rerender } = render(
      <BookingView {...props} booking={funded} now={before} />,
    );
    expect(screen.getByText("CCONTRACT")).toBeInTheDocument();
    expect(
      screen.queryByRole("button", { name: /Liberar pago/ }),
    ).not.toBeInTheDocument();
    await userEvent.click(
      screen.getByRole("button", { name: /Confirmar sesión completada/ }),
    );
    expect(onApprove).toHaveBeenCalledOnce();

    rerender(
      <BookingView
        {...props}
        booking={booking({ status: "approved" })}
        now={after}
      />,
    );
    await userEvent.click(
      screen.getByRole("button", { name: /Liberar pago a la entrenadora/ }),
    );
    expect(onRelease).toHaveBeenCalledOnce();

    rerender(
      <BookingView
        {...props}
        booking={booking({ status: "released" })}
        now={after}
      />,
    );
    expect(screen.queryByRole("button", { name: /Liberar/ })).toBeNull();
    expect(screen.getAllByText(/liberado/i).length).toBeGreaterThan(0);
  });
});
