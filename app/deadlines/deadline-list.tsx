"use client";

import { useState } from "react";
import { formatFrenchDate } from "@/lib/deadlines/format";
import type { Deadline } from "@/lib/deadlines/types";

const BUTTON = "rounded-md border border-zinc-300 px-3 py-1.5 text-sm font-medium dark:border-zinc-700";

type Props = {
  deadlines: Deadline[];
  onToggle: (id: string) => void;
  onEdit: (id: string) => void;
  onDelete: (id: string) => void;
};

// One row at a time waits for confirmation: the deletion is confirmed in the page,
// never through a browser dialog.
export function DeadlineList({ deadlines, onToggle, onEdit, onDelete }: Props) {
  const [confirmingId, setConfirmingId] = useState<string | null>(null);

  return (
    <ul className="flex flex-col gap-3">
      {deadlines.map((deadline) => (
        <li key={deadline.id} className="flex flex-col gap-3 rounded-md border border-zinc-200 p-4 sm:flex-row sm:items-center sm:justify-between dark:border-zinc-800">
          <div className="min-w-0">
            <p className="break-words font-medium">{deadline.title}</p>
            <p className="text-sm text-zinc-600 dark:text-zinc-400">
              {deadline.category} · {formatFrenchDate(deadline.date)} · {deadline.frequency}
            </p>
            <p className="text-sm">{deadline.done ? "Faite" : "À faire"}</p>
          </div>
          <div className="flex flex-wrap gap-2">
            {confirmingId === deadline.id ? (
              <>
                <button type="button" className={BUTTON}
                  onClick={() => { onDelete(deadline.id); setConfirmingId(null); }}>
                  Confirmer la suppression
                </button>
                <button type="button" className={BUTTON} onClick={() => setConfirmingId(null)}>Annuler</button>
              </>
            ) : (
              <>
                <button type="button" className={BUTTON} onClick={() => onToggle(deadline.id)}>
                  {deadline.done ? "Rouvrir" : "Marquer comme faite"}
                </button>
                <button type="button" className={BUTTON} onClick={() => onEdit(deadline.id)}>Modifier</button>
                <button type="button" className={BUTTON} onClick={() => setConfirmingId(deadline.id)}>Supprimer</button>
              </>
            )}
          </div>
        </li>
      ))}
    </ul>
  );
}
