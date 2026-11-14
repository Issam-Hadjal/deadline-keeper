"use client";

import Link from "next/link";
import {
  classifyDeadline,
  countByBucket,
  formatFrenchDate,
  relativeDelayLabel,
  type DeadlineBucket,
} from "@/lib/deadlines";
import { sortDeadlines } from "@/lib/deadlines/sort";
import { useToday } from "@/lib/deadlines/use-today";
import { useStoredDeadlines } from "./use-stored-deadlines";

// The four counters, in the order the dashboard shows them. The label is the
// interface's word; the class and the test identifier are identifiers.
const COUNTERS: readonly { bucket: DeadlineBucket; label: string; testId: string }[] = [
  { bucket: "a-venir", label: "À venir", testId: "counter-a-venir" },
  { bucket: "urgente", label: "Urgentes", testId: "counter-urgente" },
  { bucket: "en-retard", label: "En retard", testId: "counter-en-retard" },
  { bucket: "faite", label: "Faites", testId: "counter-faite" },
];

// The word each row carries: urgency is written, never left to a colour alone.
const PILL: Record<DeadlineBucket, string> = {
  "a-venir": "À venir",
  urgente: "Urgente",
  "en-retard": "En retard",
  faite: "Faite",
};

const CARD = "min-w-0 rounded-md border border-zinc-200 p-4 dark:border-zinc-800";

// The home dashboard: four counters and the timeline of what is left to do,
// both computed from the browser's day and the stored list.
export function Dashboard() {
  const deadlines = useStoredDeadlines();
  const today = useToday();

  // The build has no browser date and cannot read the browser's storage: it
  // renders the shell - the containers and their labels - with no counted
  // figure and no timeline row, so the first client render matches its HTML.
  const counts = today === null ? null : countByBucket(deadlines, today);
  const timeline =
    today === null ? [] : sortDeadlines(deadlines.filter((deadline) => !deadline.done));

  return (
    <>
      <section aria-label="Compteurs" className="mt-8">
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {COUNTERS.map((counter) => (
            <div key={counter.bucket} className={CARD}>
              <p className="text-sm text-zinc-600 dark:text-zinc-400">{counter.label}</p>
              {counts !== null && (
                <p data-testid={counter.testId} className="text-2xl font-semibold tabular-nums">
                  {counts[counter.bucket]}
                </p>
              )}
            </div>
          ))}
        </div>
      </section>
      <section aria-labelledby="chronologie" className="mt-8">
        <h2 id="chronologie" className="text-xl font-semibold tracking-tight">
          Chronologie
        </h2>
        {today === null ? null : deadlines.length === 0 ? (
          <div data-testid="empty-state" className={`mt-4 flex flex-col gap-3 ${CARD}`}>
            <p className="text-zinc-700 dark:text-zinc-300">Aucune échéance pour le moment.</p>
            <Link
              href="/deadlines"
              className="inline-block w-fit rounded-md bg-zinc-900 px-4 py-2 text-center font-medium text-white dark:bg-zinc-100 dark:text-zinc-900"
            >
              Ajouter une échéance
            </Link>
          </div>
        ) : timeline.length === 0 ? (
          <p className="mt-4 text-zinc-700 dark:text-zinc-300">Aucune échéance à venir.</p>
        ) : (
          <ul className="mt-4 flex flex-col gap-3">
            {timeline.map((deadline) => (
              <li key={deadline.id} data-testid="timeline-item" className={`flex flex-col gap-1 ${CARD}`}>
                <p className="break-words font-medium">{deadline.title}</p>
                <p className="break-words text-sm text-zinc-600 dark:text-zinc-400">
                  {deadline.category} · {formatFrenchDate(deadline.date)} ·{" "}
                  {relativeDelayLabel(deadline.date, today)}
                </p>
                <p className="text-sm font-medium">{PILL[classifyDeadline(deadline, today)]}</p>
              </li>
            ))}
          </ul>
        )}
      </section>
    </>
  );
}
