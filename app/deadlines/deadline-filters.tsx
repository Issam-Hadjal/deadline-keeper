import { CATEGORIES, type Category } from "@/lib/deadlines/types";

const FIELD =
  "w-full rounded-md border border-zinc-300 bg-white px-3 py-2 text-base dark:border-zinc-700 dark:bg-zinc-900";

type Props = {
  category: Category | "Toutes";
  query: string;
  onCategoryChange: (category: Category | "Toutes") => void;
  onQueryChange: (query: string) => void;
};

// The two criteria combine: the page hands them together to filterDeadlines.
export function DeadlineFilters({ category, query, onCategoryChange, onQueryChange }: Props) {
  return (
    <div className="flex flex-col gap-3 sm:flex-row">
      <div className="flex flex-col gap-1 sm:w-64">
        <label htmlFor="filtre-categorie" className="text-sm font-medium">Filtrer par catégorie</label>
        <select id="filtre-categorie" className={FIELD} value={category}
          onChange={(event) => onCategoryChange(event.target.value as Category | "Toutes")}>
          <option value="Toutes">Toutes</option>
          {CATEGORIES.map((value) => (
            <option key={value} value={value}>{value}</option>
          ))}
        </select>
      </div>
      <div className="flex flex-1 flex-col gap-1">
        <label htmlFor="recherche" className="text-sm font-medium">Rechercher</label>
        <input id="recherche" type="search" className={FIELD} value={query}
          onChange={(event) => onQueryChange(event.target.value)} />
      </div>
    </div>
  );
}
