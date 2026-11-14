"use client";

import { useId, useState, type FormEvent, type ReactNode } from "react";
import {
  CATEGORIES,
  FREQUENCIES,
  type Category,
  type DeadlineErrors,
  type DeadlineInput,
  type Frequency,
} from "@/lib/deadlines/types";
import { validateDeadline } from "@/lib/deadlines/validation";

const FIELD =
  "w-full rounded-md border border-zinc-300 bg-white px-3 py-2 text-base dark:border-zinc-700 dark:bg-zinc-900";
const BUTTON = "w-full rounded-md px-4 py-2 font-medium sm:w-auto";
// iOS Safari gives input[type="date"] an intrinsic width wider than its column and
// a native box of its own. appearance-none and min-w-0 bring it back inside the
// column, the arbitrary variant left-aligns the value, and passing FIELD through
// gives it the height classes of the text fields (px-3, py-2, text-base) instead
// of a new height value. The control keeps its type and its native picker: no
// readOnly, no disabled, no pointer-events-none, no overlay, no rule in
// app/globals.css.
const DATE_FIELD = `${FIELD} appearance-none min-w-0 [&::-webkit-date-and-time-value]:text-left`;

type Values = Record<keyof DeadlineInput, string>;
const EMPTY: Values = { title: "", description: "", category: "", date: "", frequency: "" };

// The label, the control and its message form one block: the message is bound to
// the control by aria-describedby, never laid out somewhere else on the page.
function Field(props: { id: string; label: string; error?: string; className?: string; children: ReactNode }) {
  return (
    <div className={`flex flex-col gap-1 ${props.className ?? ""}`}>
      <label htmlFor={props.id} className="text-sm font-medium">
        {props.label}
      </label>
      {props.children}
      {props.error ? (
        <p id={`${props.id}-erreur`} className="text-sm text-red-700 dark:text-red-400">
          {props.error}
        </p>
      ) : null}
    </div>
  );
}

type Props = {
  /** The values to fill in when editing, null when adding. */
  initial: DeadlineInput | null;
  onSubmit: (input: DeadlineInput) => void;
  /** Null when adding: the Annuler button only exists while editing. */
  onCancel: (() => void) | null;
};

// The same form adds and edits: the page changes its key from one deadline to the
// next, which resets the state.
export function DeadlineForm({ initial, onSubmit, onCancel }: Props) {
  const [values, setValues] = useState<Values>(initial ?? EMPTY);
  const [errors, setErrors] = useState<DeadlineErrors>({});
  const prefix = useId();
  const id = (field: keyof DeadlineInput) => `${prefix}-${field}`;
  const describedBy = (field: keyof DeadlineInput) => (errors[field] ? `${id(field)}-erreur` : undefined);
  const invalid = (field: keyof DeadlineInput) => (errors[field] ? true : undefined);
  const update = (field: keyof DeadlineInput, value: string) =>
    setValues((current) => ({ ...current, [field]: value }));

  function submit(event: FormEvent<HTMLFormElement>) {
    // The rules are those of lib/deadlines: the browser decides nothing here.
    event.preventDefault();
    const input: DeadlineInput = {
      title: values.title,
      description: values.description,
      category: values.category as Category,
      date: values.date,
      frequency: values.frequency as Frequency,
    };
    const found = validateDeadline(input);
    setErrors(found);
    if (Object.keys(found).length > 0) return;
    onSubmit({ ...input, title: input.title.trim(), description: input.description.trim() });
    // Adding leaves an empty form behind, ready for the next deadline.
    if (initial === null) setValues(EMPTY);
  }

  return (
    <form noValidate onSubmit={submit} className="grid gap-4 sm:grid-cols-2">
      <Field id={id("title")} label="Titre" error={errors.title} className="sm:col-span-2">
        <input id={id("title")} className={FIELD} value={values.title} aria-invalid={invalid("title")}
          aria-describedby={describedBy("title")} onChange={(event) => update("title", event.target.value)} />
      </Field>
      <Field id={id("description")} label="Description" error={errors.description} className="sm:col-span-2">
        <textarea id={id("description")} className={FIELD} rows={3} value={values.description}
          aria-invalid={invalid("description")} aria-describedby={describedBy("description")}
          onChange={(event) => update("description", event.target.value)} />
      </Field>
      <Field id={id("category")} label="Catégorie" error={errors.category}>
        <select id={id("category")} className={FIELD} value={values.category} aria-invalid={invalid("category")}
          aria-describedby={describedBy("category")} onChange={(event) => update("category", event.target.value)}>
          <option value="">Choisir une catégorie</option>
          {CATEGORIES.map((category) => (
            <option key={category} value={category}>{category}</option>
          ))}
        </select>
      </Field>
      <Field id={id("frequency")} label="Fréquence" error={errors.frequency}>
        <select id={id("frequency")} className={FIELD} value={values.frequency} aria-invalid={invalid("frequency")}
          aria-describedby={describedBy("frequency")} onChange={(event) => update("frequency", event.target.value)}>
          <option value="">Choisir une fréquence</option>
          {FREQUENCIES.map((frequency) => (
            <option key={frequency} value={frequency}>{frequency}</option>
          ))}
        </select>
      </Field>
      {/* The value stays the AAAA-MM-JJ string of the control: no Date object. */}
      <Field id={id("date")} label="Date" error={errors.date}>
        <input id={id("date")} type="date" className={DATE_FIELD} value={values.date} aria-invalid={invalid("date")}
          aria-describedby={describedBy("date")} onChange={(event) => update("date", event.target.value)} />
      </Field>
      <div className="flex flex-col gap-2 sm:col-span-2 sm:flex-row">
        {/* The issue spells the straight apostrophe; inside a JS string the
            react/no-unescaped-entities rule does not apply. */}
        <button type="submit" className={`bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900 ${BUTTON}`}>
          {initial === null ? "Ajouter l'échéance" : "Enregistrer les modifications"}
        </button>
        {onCancel ? (
          <button type="button" onClick={onCancel} className={`border border-zinc-300 dark:border-zinc-700 ${BUTTON}`}>
            Annuler
          </button>
        ) : null}
      </div>
    </form>
  );
}
