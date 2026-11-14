import { render, screen, within } from "@testing-library/react";
import { renderToStaticMarkup } from "react-dom/server";
import { beforeEach, describe, expect, it } from "vitest";
import { STORAGE_KEY } from "@/lib/deadlines/storage";
import type { Deadline } from "@/lib/deadlines/types";
import { Dashboard } from "./dashboard";

// The dashboard classifies against the browser's day, so the dates of a test are
// written relative to it, in local components: new Date().toISOString() would
// write the UTC day instead.
function day(offset: number): string {
  const now = new Date();
  const date = new Date(now.getFullYear(), now.getMonth(), now.getDate() + offset);
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const dayOfMonth = String(date.getDate()).padStart(2, "0");
  return `${date.getFullYear()}-${month}-${dayOfMonth}`;
}

function deadline(fields: Partial<Deadline> & { id: string }): Deadline {
  return {
    title: "Échéance",
    description: "",
    category: "Autre",
    date: day(3),
    frequency: "Une fois",
    done: false,
    ...fields,
  };
}

function seed(deadlines: Deadline[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(deadlines));
}

const counter = (testId: string): string => screen.getByTestId(testId).textContent ?? "";

const rows = (): string[] =>
  screen.queryAllByTestId("timeline-item").map((row) => row.textContent ?? "");

describe("Dashboard", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("invites the user to add a first deadline, with no row, when nothing is stored", () => {
    render(<Dashboard />);
    const empty = screen.getByTestId("empty-state");
    expect(empty.textContent).toContain("Aucune échéance pour le moment.");
    expect(within(empty).getByRole("link", { name: "Ajouter une échéance" }).getAttribute("href")).toBe(
      "/deadlines",
    );
    expect([
      counter("counter-a-venir"),
      counter("counter-urgente"),
      counter("counter-en-retard"),
      counter("counter-faite"),
    ]).toEqual(["0", "0", "0", "0"]);
    expect(rows()).toHaveLength(0);
  });

  it("counts every class and lists what is left to do, the nearest date first", () => {
    seed([
      deadline({ id: "1", title: "Loin", date: day(30) }),
      deadline({ id: "2", title: "Demain", date: day(1), category: "Contrats" }),
      deadline({ id: "3", title: "Hier", date: day(-1) }),
      deadline({ id: "4", title: "Déjà faite", date: day(2), done: true }),
    ]);

    render(<Dashboard />);

    expect(counter("counter-a-venir")).toBe("1");
    expect(counter("counter-urgente")).toBe("1");
    expect(counter("counter-en-retard")).toBe("1");
    expect(counter("counter-faite")).toBe("1");

    const listed = rows();
    expect(listed).toHaveLength(3);
    expect(listed[0]).toContain("Hier");
    expect(listed[0]).toContain("en retard de 1 jour");
    expect(listed[0]).toContain("En retard");
    expect(listed[1]).toContain("Demain");
    expect(listed[1]).toContain("Contrats");
    expect(listed[1]).toContain("dans 1 jour");
    expect(listed[1]).toContain("Urgente");
    expect(listed[2]).toContain("Loin");
    expect(listed[2]).toContain("À venir");
    expect(listed.join(" ")).not.toContain("Déjà faite");
  });

  it("says nothing is due when every stored deadline is done", () => {
    seed([deadline({ id: "1", title: "Déjà faite", done: true })]);

    render(<Dashboard />);

    expect(rows()).toHaveLength(0);
    expect(screen.getByText("Aucune échéance à venir.")).not.toBeNull();
    expect(counter("counter-faite")).toBe("1");
  });

  it("carries no counted figure when the build renders it", () => {
    seed([deadline({ id: "1", title: "Demain", date: day(1) })]);

    // useSyncExternalStore answers with the server snapshot during a server
    // render: the containers and their labels leave, never a figure. A page
    // prerendered yesterday therefore cannot show a count the mounted page
    // then contradicts.
    const markup = renderToStaticMarkup(<Dashboard />);

    expect(markup).toContain("À venir");
    expect(markup).toContain("Chronologie");
    expect(markup).not.toContain("counter-");
    expect(markup).not.toContain("timeline-item");
    expect(markup).not.toContain("tabular-nums");
    expect(markup).not.toContain("Demain");
  });
});
