import { describe, expect, it } from "vitest";
import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import App from "./App";
import { domains, modules, repository } from "./data";

describe("FSH Hub", () => {
  it("connects every local navigation link to a section", () => {
    render(<App />);
    for (const link of screen.getAllByRole("link")) {
      const href = link.getAttribute("href");
      if (href?.startsWith("#"))
        expect(document.getElementById(href.slice(1))).not.toBeNull();
    }
  });

  it("selects every BESSI domain with accessible mouse and keyboard navigation", async () => {
    const user = userEvent.setup();
    render(<App />);
    for (const domain of domains) {
      const tab = screen.getByRole("tab", { name: domain.name });
      await user.click(tab);
      expect(tab).toHaveAttribute("aria-selected", "true");
      expect(
        within(screen.getByRole("tabpanel")).getByText(domain.title),
      ).toBeVisible();
      expect(
        screen.getAllByRole("tab").filter((item) => item.tabIndex === 0),
      ).toHaveLength(1);
    }
    await user.keyboard("{ArrowRight}");
    expect(screen.getByRole("tab", { name: "Autogestión" })).toHaveFocus();
    await user.keyboard("{End}");
    expect(screen.getByRole("tab", { name: "Innovación" })).toHaveFocus();
    await user.keyboard("{Home}{ArrowLeft}");
    expect(screen.getByRole("tab", { name: "Innovación" })).toHaveFocus();
  });

  it("opens the correct module and prepares an explicit, unconfirmed session request", async () => {
    const user = userEvent.setup();
    render(<App />);
    const buttons = screen.getAllByRole("button", {
      name: "Agendar Sesión con Entrenadora",
    });
    for (let i = 0; i < modules.length; i++) {
      await user.click(buttons[i]);
      const dialog = screen.getByRole("dialog");
      expect(
        within(dialog).getByRole("heading", { name: modules[i].title }),
      ).toBeVisible();
      await user.type(
        within(dialog).getByLabelText("Fecha propuesta"),
        "2099-10-25",
      );
      await user.click(
        within(dialog).getByRole("button", { name: "Preparar solicitud" }),
      );
      const link = within(dialog).getByRole("link", {
        name: "Enviar solicitud en GitHub",
      });
      const url = new URL(link.getAttribute("href")!);
      expect(url.origin + url.pathname).toBe(`${repository}/issues/new`);
      expect(url.searchParams.get("body")).toContain(modules[i].title);
      expect(url.searchParams.get("body")).toContain("2099-10-25");
      expect(
        within(dialog).getByText(/todavía no está reservado/),
      ).toBeVisible();
      await user.clear(within(dialog).getByLabelText("Fecha propuesta"));
      expect(
        within(dialog).queryByRole("link", {
          name: "Enviar solicitud en GitHub",
        }),
      ).toBeNull();
      await user.click(
        within(dialog).getByRole("button", { name: "Cerrar ventana" }),
      );
      expect(screen.queryByRole("dialog")).toBeNull();
      expect(buttons[i]).toHaveFocus();
      expect(document.body.style.overflow).toBe("");
    }
  });

  it("does not prepare a session request without a future date", async () => {
    const user = userEvent.setup();
    render(<App />);
    await user.click(
      screen.getAllByRole("button", {
        name: "Agendar Sesión con Entrenadora",
      })[0],
    );
    await user.click(
      screen.getByRole("button", { name: "Preparar solicitud" }),
    );
    expect(
      screen.queryByRole("link", { name: "Enviar solicitud en GitHub" }),
    ).toBeNull();
    await user.type(screen.getByLabelText("Fecha propuesta"), "2020-01-01");
    await user.click(
      screen.getByRole("button", { name: "Preparar solicitud" }),
    );
    expect(
      screen.queryByRole("link", { name: "Enviar solicitud en GitHub" }),
    ).toBeNull();
  });

  it("discloses the credential mockup and provides working Stellar documentation", async () => {
    const user = userEvent.setup();
    render(<App />);
    await user.click(
      screen.getByRole("button", { name: "Explorar la credencial" }),
    );
    const dialog = screen.getByRole("dialog");
    expect(
      within(dialog).getByText(/no conecta wallets, emite credenciales/),
    ).toBeVisible();
    expect(
      within(dialog).getByRole("link", { name: "Conocer Soroban en Stellar" }),
    ).toHaveAttribute(
      "href",
      "https://developers.stellar.org/docs/build/smart-contracts/overview",
    );
  });

  it("closes the mobile menu after choosing a destination", async () => {
    const user = userEvent.setup();
    render(<App />);
    await user.click(screen.getByRole("button", { name: "Abrir menú" }));
    expect(screen.getByRole("button", { name: "Cerrar menú" })).toHaveAttribute(
      "aria-expanded",
      "true",
    );
    await user.click(
      within(
        screen.getByRole("navigation", { name: "Navegación móvil" }),
      ).getByRole("link", { name: "Módulos" }),
    );
    expect(
      screen.queryByRole("navigation", { name: "Navegación móvil" }),
    ).toBeNull();
  });
});
