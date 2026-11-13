import { fireEvent, render, screen, within } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { STORAGE_KEY } from "@/lib/deadlines/storage";
import { CATEGORIES, FREQUENCIES, type Deadline } from "@/lib/deadlines/types";
import DeadlinesPage from "./page";

// A new deadline does not need an unpredictable identifier: rows are found by their
// title anyway, and a counter keeps the stored data readable.
let nextId = 0;

beforeEach(() => {
  localStorage.clear();
  nextId = 0;
  vi.stubGlobal("crypto", { randomUUID: () => `id-${++nextId}` });
});

afterEach(() => {
  vi.unstubAllGlobals();
});

type Fields = {
  title: string;
  category: string;
  date: string;
  frequency: string;
  description?: string;
};

function addDeadline({ title, category, date, frequency, description = "" }: Fields) {
  fireEvent.change(screen.getByLabelText("Titre"), { target: { value: title } });
  fireEvent.change(screen.getByLabelText("Description"), { target: { value: description } });
  fireEvent.change(screen.getByLabelText("Catégorie"), { target: { value: category } });
  fireEvent.change(screen.getByLabelText("Fréquence"), { target: { value: frequency } });
  fireEvent.change(screen.getByLabelText("Date"), { target: { value: date } });
  fireEvent.click(screen.getByRole("button", { name: "Ajouter l'échéance" }));
}

const stored = (): Deadline[] => JSON.parse(localStorage.getItem(STORAGE_KEY) ?? "[]");
const rows = (): string[] => screen.getAllByRole("listitem").map((row) => row.textContent ?? "");
const value = (label: string): string => (screen.getByLabelText(label) as HTMLInputElement).value;

describe("DeadlinesPage", () => {
  it("starts empty and leaves localStorage alone until mounted", () => {
    render(<DeadlinesPage />);
    expect(screen.getByText("Aucune échéance pour le moment. Ajoutez votre première échéance.")).not.toBeNull();
    expect(localStorage.getItem(STORAGE_KEY)).toBeNull();
  });

  it("offers the required choices, the date staying a AAAA-MM-JJ string", () => {
    render(<DeadlinesPage />);
    const options = (label: string) =>
      within(screen.getByLabelText(label)).getAllByRole("option").map((option) => option.textContent);
    expect(options("Catégorie")).toEqual(["Choisir une catégorie", ...CATEGORIES]);
    expect(options("Fréquence")).toEqual(["Choisir une fréquence", ...FREQUENCIES]);
    expect(options("Filtrer par catégorie")).toEqual(["Toutes", ...CATEGORIES]);
    expect(screen.getByLabelText("Rechercher")).not.toBeNull();
    const date = screen.getByLabelText("Date") as HTMLInputElement;
    expect(date.type).toBe("date");
    fireEvent.change(date, { target: { value: "2026-11-14" } });
    expect(date.value).toBe("2026-11-14");
  });

  it("adds a deadline, stores it and finds it again after a reload", () => {
    const { unmount } = render(<DeadlinesPage />);
    addDeadline({ title: "Assurance habitation", category: "Contrats", date: "2026-11-14", frequency: "Annuelle" });
    expect(rows()).toHaveLength(1);
    expect(rows()[0]).toContain("Assurance habitation");
    expect(rows()[0]).toContain("Contrats");
    expect(rows()[0]).toContain("14/11/2026");
    expect(rows()[0]).toContain("Annuelle");
    expect(stored()).toHaveLength(1);
    expect(localStorage.getItem("deadline-keeper:deadlines:v1")).not.toBeNull();
    expect(stored()[0]).toMatchObject({ id: "id-1", title: "Assurance habitation", done: false });
    unmount();
    render(<DeadlinesPage />);
    expect(rows()[0]).toContain("Assurance habitation");
  });

  it("refuses an invalid submission: message next to the field, nothing stored", () => {
    render(<DeadlinesPage />);
    fireEvent.click(screen.getByRole("button", { name: "Ajouter l'échéance" }));
    const message = screen.getByText("Le titre est obligatoire.");
    expect(message.id).toBe(screen.getByLabelText("Titre").getAttribute("aria-describedby"));
    expect(screen.getByText("Choisissez une catégorie.")).not.toBeNull();
    expect(screen.getByText("La date est obligatoire.")).not.toBeNull();
    expect(screen.getByText("Choisissez une fréquence.")).not.toBeNull();
    expect(localStorage.getItem(STORAGE_KEY)).toBeNull();
    expect(screen.queryAllByRole("listitem")).toHaveLength(0);
  });

  it("edits the chosen deadline without creating a second one", () => {
    render(<DeadlinesPage />);
    addDeadline({ title: "Assurance habitation", category: "Contrats", date: "2026-11-14", frequency: "Annuelle" });
    fireEvent.click(within(screen.getAllByRole("listitem")[0]).getByRole("button", { name: "Modifier" }));
    expect(value("Titre")).toBe("Assurance habitation");
    expect(value("Catégorie")).toBe("Contrats");
    expect(value("Date")).toBe("2026-11-14");
    fireEvent.change(screen.getByLabelText("Titre"), { target: { value: "Assurance auto" } });
    fireEvent.click(screen.getByRole("button", { name: "Enregistrer les modifications" }));
    expect(stored()).toHaveLength(1);
    expect(stored()[0]).toMatchObject({ id: "id-1", title: "Assurance auto" });
    expect(rows()).toHaveLength(1);
    expect(rows()[0]).toContain("Assurance auto");
  });

  it("leaves the edition through Annuler, without saving", () => {
    render(<DeadlinesPage />);
    addDeadline({ title: "Carte grise", category: "Démarches administratives", date: "2026-12-01", frequency: "Une fois" });
    fireEvent.click(screen.getByRole("button", { name: "Modifier" }));
    fireEvent.click(screen.getByRole("button", { name: "Annuler" }));
    expect(value("Titre")).toBe("");
    expect(screen.getByRole("button", { name: "Ajouter l'échéance" })).not.toBeNull();
    expect(stored()[0].title).toBe("Carte grise");
  });

  it("only deletes after Confirmer la suppression", () => {
    render(<DeadlinesPage />);
    addDeadline({ title: "Abonnement musique", category: "Abonnements", date: "2026-11-30", frequency: "Mensuelle" });
    fireEvent.click(screen.getByRole("button", { name: "Supprimer" }));
    expect(rows()).toHaveLength(1);
    expect(stored()).toHaveLength(1);
    fireEvent.click(screen.getByRole("button", { name: "Confirmer la suppression" }));
    expect(screen.queryAllByRole("listitem")).toHaveLength(0);
    expect(stored()).toEqual([]);
    expect(screen.getByText("Aucune échéance pour le moment. Ajoutez votre première échéance.")).not.toBeNull();
  });

  it("sorts pending deadlines before done ones, and reopens them", () => {
    render(<DeadlinesPage />);
    addDeadline({ title: "Plus tard", category: "Autre", date: "2027-03-01", frequency: "Une fois" });
    addDeadline({ title: "Plus tôt", category: "Autre", date: "2026-11-20", frequency: "Une fois" });
    expect(rows()[0]).toContain("Plus tôt");
    expect(rows()[1]).toContain("Plus tard");
    fireEvent.click(within(screen.getAllByRole("listitem")[0]).getByRole("button", { name: "Marquer comme faite" }));
    expect(rows()[1]).toContain("Plus tôt");
    expect(rows()[1]).toContain("Faite");
    fireEvent.click(within(screen.getAllByRole("listitem")[1]).getByRole("button", { name: "Rouvrir" }));
    expect(rows()[0]).toContain("Plus tôt");
    expect(rows()[0]).toContain("À faire");
    expect(stored().find((entry) => entry.title === "Plus tôt")?.done).toBe(false);
  });

  it("combines the filter and the search, and tells the two empty lists apart", () => {
    render(<DeadlinesPage />);
    addDeadline({ title: "Abonnement musique", category: "Abonnements", date: "2026-12-01", frequency: "Mensuelle" });
    addDeadline({ title: "Assurance habitation", category: "Contrats", date: "2026-11-20", frequency: "Annuelle" });
    fireEvent.change(screen.getByLabelText("Filtrer par catégorie"), { target: { value: "Abonnements" } });
    expect(rows()).toHaveLength(1);
    expect(rows()[0]).toContain("Abonnement musique");
    fireEvent.change(screen.getByLabelText("Rechercher"), { target: { value: "assurance" } });
    expect(screen.queryAllByRole("listitem")).toHaveLength(0);
    expect(screen.getByText("Aucune échéance ne correspond à votre recherche.")).not.toBeNull();
    fireEvent.change(screen.getByLabelText("Rechercher"), { target: { value: "" } });
    fireEvent.change(screen.getByLabelText("Filtrer par catégorie"), { target: { value: "Toutes" } });
    expect(rows()).toHaveLength(2);
  });
});
