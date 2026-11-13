import type { Category, Deadline } from "./types";

// The category narrows the list, then the search narrows it again in the title
// and the description, ignoring case. An empty search and "Toutes" filter
// nothing: the list comes back whole, in the order it was received.
export function filterDeadlines(
  deadlines: Deadline[],
  criteria: { category: Category | "Toutes"; query: string },
): Deadline[] {
  const query = criteria.query.trim().toLowerCase();
  return deadlines.filter((deadline) => {
    if (criteria.category !== "Toutes" && deadline.category !== criteria.category) return false;
    if (query.length === 0) return true;
    return (
      deadline.title.toLowerCase().includes(query) ||
      deadline.description.toLowerCase().includes(query)
    );
  });
}
