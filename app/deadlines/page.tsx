"use client";

import { useMemo, useState, useSyncExternalStore } from "react";
import { filterDeadlines } from "@/lib/deadlines/filter";
import { sortDeadlines } from "@/lib/deadlines/sort";
import { parseDeadlines, STORAGE_KEY, writeDeadlines } from "@/lib/deadlines/storage";
import type { Category, Deadline, DeadlineInput } from "@/lib/deadlines/types";
import { DeadlineFilters } from "./deadline-filters";
import { DeadlineForm } from "./deadline-form";
import { DeadlineList } from "./deadline-list";

function toInput({ title, description, category, date, frequency }: Deadline): DeadlineInput {
  return { title, description, category, date, frequency };
}

// The stored list belongs to the browser: the page subscribes to it instead of
// copying it into a state from an effect. The snapshot is the raw string under
// STORAGE_KEY, so React re-renders only on a real change.
const listeners = new Set<() => void>();

function readSnapshot(): string | null {
  try {
    return window.localStorage.getItem(STORAGE_KEY);
  } catch {
    // A browser that refuses storage starts an empty list instead of an error.
    return null;
  }
}

// The server knows nothing of the browser's storage: the prerender starts empty,
// then the mounted page reads what the browser kept.
function readServerSnapshot(): string | null {
  return null;
}

function subscribe(listener: () => void): () => void {
  listeners.add(listener);
  // Another tab's write arrives as a "storage" event; this page's own writes fire
  // none, so notifyListeners tells the page itself.
  window.addEventListener("storage", listener);
  return () => {
    listeners.delete(listener);
    window.removeEventListener("storage", listener);
  };
}

function notifyListeners(): void {
  for (const listener of listeners) listener();
}

function writeSnapshot(deadlines: Deadline[]): void {
  writeDeadlines(window.localStorage, deadlines);
  notifyListeners();
}

export default function DeadlinesPage() {
  const raw = useSyncExternalStore(subscribe, readSnapshot, readServerSnapshot);
  const deadlines = useMemo(() => parseDeadlines(raw), [raw]);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [category, setCategory] = useState<Category | "Toutes">("Toutes");
  const [query, setQuery] = useState("");

  function persist(next: Deadline[]) {
    writeSnapshot(next);
  }

  function add(input: DeadlineInput) {
    persist([...deadlines, { ...input, id: crypto.randomUUID(), done: false }]);
  }

  function save(input: DeadlineInput) {
    persist(deadlines.map((entry) => (entry.id === editingId ? { ...entry, ...input } : entry)));
    setEditingId(null);
  }

  function toggle(id: string) {
    persist(deadlines.map((entry) => (entry.id === id ? { ...entry, done: !entry.done } : entry)));
  }

  function remove(id: string) {
    persist(deadlines.filter((entry) => entry.id !== id));
    setEditingId((current) => (current === id ? null : current));
  }

  const edited = deadlines.find((entry) => entry.id === editingId) ?? null;
  const visible = sortDeadlines(filterDeadlines(deadlines, { category, query }));

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-12">
      <h1 className="text-3xl font-semibold tracking-tight">Mes échéances</h1>
      <section className="mt-6">
        <DeadlineForm key={editingId ?? "nouvelle"} initial={edited ? toInput(edited) : null}
          onSubmit={editingId === null ? add : save} onCancel={edited ? () => setEditingId(null) : null} />
      </section>
      <section className="mt-8 flex flex-col gap-4">
        <DeadlineFilters category={category} query={query}
          onCategoryChange={setCategory} onQueryChange={setQuery} />
        {deadlines.length === 0 ? (
          <p className="text-zinc-700 dark:text-zinc-300">Aucune échéance pour le moment. Ajoutez votre première échéance.</p>
        ) : visible.length === 0 ? (
          <p className="text-zinc-700 dark:text-zinc-300">Aucune échéance ne correspond à votre recherche.</p>
        ) : (
          <DeadlineList deadlines={visible} onToggle={toggle} onEdit={setEditingId} onDelete={remove} />
        )}
      </section>
    </main>
  );
}
