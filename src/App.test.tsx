import { describe, expect, it } from "vitest";
import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import App from "./App";
import { domains, evidence, modules, transversalSkills } from "./data";
import { catalog, LAYERS } from "./dapp/catalog";

describe("Full Stack Human landing", () => {
  it("connects every local navigation link to a section", () => {
    render(<App />);
    for (const link of screen.getAllByRole("link")) {
      const href = link.getAttribute("href");
      if (href?.startsWith("#"))
        expect(document.getElementById(href.slice(1))).not.toBeNull();
    }
  });

  it("shows all 32 skills grouped in six layer columns like the brand manual", () => {
    render(<App />);
    let total = 0;
    for (const domain of domains) {
      const column = screen.getByRole("article", {
        name: domain.layer,
      });
      expect(column).toHaveClass(domain.color);
      expect(
        within(column).getByText(
          `(${domain.name.charAt(0)}${domain.name.slice(1).toLowerCase()}) · ${domain.skills.length}`,
        ),
      ).toBeVisible();
      for (const skill of domain.skills)
        expect(within(column).getByText(skill)).toBeVisible();
      total += domain.skills.length;
    }
    const transversal = screen.getByRole("article", { name: "Transversales" });
    for (const skill of transversalSkills)
      expect(within(transversal).getByText(skill)).toBeVisible();
    expect(total + transversalSkills.length).toBe(32);
  });

  it("maps each layer to the domain color of the brand manual", () => {
    const expected: Record<string, string> = {
      Runtime: "cyan",
      API: "coral",
      Merge: "mint",
      Firewall: "amber",
      Fork: "lime",
    };
    for (const domain of domains)
      expect(domain.color).toBe(expected[domain.layer]);
    for (const module of modules)
      expect(module.color).toBe(expected[module.layer]);
  });

  it("shows the same modules as the dApp catalog and links each one to /app", () => {
    render(<App />);
    expect(modules.map((m) => m.id)).toEqual(catalog.map((m) => m.id));
    for (const module of modules) {
      const source = catalog.find((m) => m.id === module.id)!;
      expect(module.title).toBe(source.skill);
      expect(module.layer).toBe(LAYERS[source.layer].name);
      expect(module.psychologist).toBe(source.psychologist.name);
    }
    const links = screen.getAllByRole("link", { name: "Agenda tu sesión 1" });
    expect(links.map((link) => link.getAttribute("href"))).toEqual(
      modules.map((module) => `/app#/modulo/${module.id}`),
    );
    for (const cta of screen.getAllByRole("link", {
      name: "Haz el Human Stack Check",
    }))
      expect(cta).toHaveAttribute("href", "/app");
    expect(
      screen.getAllByRole("link", { name: "Comienza tu evolución" })[0],
    ).toHaveAttribute("href", "/app");
  });

  it("cites a source next to every statistic", () => {
    render(<App />);
    for (const item of evidence) {
      const card = screen.getByText(item.text).closest("article")!;
      expect(within(card).getByText(`Fuente · ${item.source}`)).toBeVisible();
    }
    expect(screen.queryByText(/68%\s*[–-]\s*84/)).toBeNull();
    expect(screen.queryByText(/pérdidas directas/i)).toBeNull();
  });

  it("discloses the MVP state of the credential and links Stellar documentation", async () => {
    const user = userEvent.setup();
    render(<App />);
    await user.click(
      screen.getByRole("button", { name: "Explorar la credencial" }),
    );
    const dialog = screen.getByRole("dialog");
    expect(within(dialog).getByText(/Estado del MVP/)).toBeVisible();
    expect(
      within(dialog).getByRole("link", { name: "Conocer Soroban en Stellar" }),
    ).toHaveAttribute(
      "href",
      "https://developers.stellar.org/docs/build/smart-contracts/overview",
    );
    await user.click(
      within(dialog).getByRole("button", { name: "Cerrar ventana" }),
    );
    expect(screen.queryByRole("dialog")).toBeNull();
    expect(document.body.style.overflow).toBe("");
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
