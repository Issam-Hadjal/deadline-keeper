import { render, screen, within } from "@testing-library/react";
import { beforeEach, describe, expect, it } from "vitest";
import Home from "./page";

beforeEach(() => {
  localStorage.clear();
});

describe("Home", () => {
  it("shows the project title as the page heading", () => {
    render(<Home />);
    const heading = screen.getByRole("heading", { level: 1 });
    expect(heading.textContent).toBe("Deadline Keeper");
  });

  it("leads to the deadlines page", () => {
    render(<Home />);
    const link = screen.getByRole("link", { name: "Mes échéances" });
    expect(link.getAttribute("href")).toBe("/deadlines");
  });

  it("invites the user to add a first deadline when the storage is empty", () => {
    render(<Home />);
    const empty = screen.getByTestId("empty-state");
    expect(empty.textContent).toContain("Aucune échéance pour le moment.");
    const link = within(empty).getByRole("link", { name: "Ajouter une échéance" });
    expect(link.getAttribute("href")).toBe("/deadlines");
    // The four counters are there, at zero, and no row is listed.
    for (const id of ["counter-a-venir", "counter-urgente", "counter-en-retard", "counter-faite"]) {
      expect(screen.getByTestId(id).textContent).toBe("0");
    }
    expect(screen.queryAllByTestId("timeline-item")).toHaveLength(0);
  });
});
