// The shape of a deadline. The interface speaks French, so the values of the
// closed lists are French; the identifiers are not.

export type Category =
  | "Abonnements"
  | "Contrats"
  | "Garanties"
  | "Démarches administratives"
  | "Autre";

export type Frequency = "Une fois" | "Mensuelle" | "Annuelle";

export interface Deadline {
  id: string;
  title: string;
  description: string;
  category: Category;
  date: string;
  frequency: Frequency;
  done: boolean;
}

// What a form collects: the identifier and the state come from elsewhere.
export type DeadlineInput = Pick<
  Deadline,
  "title" | "description" | "category" | "date" | "frequency"
>;

export type DeadlineErrors = Partial<Record<keyof DeadlineInput, string>>;

// The order of these lists is the order of the interface's choices.
export const CATEGORIES = [
  "Abonnements",
  "Contrats",
  "Garanties",
  "Démarches administratives",
  "Autre",
] as const satisfies readonly Category[];

export const FREQUENCIES = [
  "Une fois",
  "Mensuelle",
  "Annuelle",
] as const satisfies readonly Frequency[];
