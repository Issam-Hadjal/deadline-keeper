import { expect, test, type Page } from "@playwright/test";

// The dashboard reads the browser's storage: a run starts from an empty one. A
// script added with addInitScript runs again on every navigation, and this tab
// clears the storage once, then lets its own navigations read what the form
// wrote.
test.beforeEach(async ({ page }) => {
  await page.addInitScript(() => {
    if (window.sessionStorage.getItem("deadline-keeper:e2e:storage-cleared") === null) {
      window.localStorage.clear();
      window.sessionStorage.setItem("deadline-keeper:e2e:storage-cleared", "1");
    }
  });
});

// Tomorrow, in the browser's own calendar: new Date().toISOString() writes the
// UTC day, which is already tomorrow east of Greenwich at night.
function tomorrow(): string {
  const now = new Date();
  const date = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1);
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${date.getFullYear()}-${month}-${day}`;
}

// Adding goes through the form only: the test never writes the storage itself.
async function addDeadline(page: Page, title: string) {
  await page.goto("/deadlines");
  await page.getByLabel("Titre", { exact: true }).fill(title);
  await page.getByLabel("Catégorie", { exact: true }).selectOption("Contrats");
  await page.getByLabel("Date", { exact: true }).fill(tomorrow());
  await page.getByLabel("Fréquence", { exact: true }).selectOption("Une fois");
  await page.getByRole("button", { name: "Ajouter l'échéance" }).click();
  await expect(page.getByRole("listitem")).toHaveCount(1);
}

test("the dashboard lists a deadline dated tomorrow and counts it as urgent", async ({ page }) => {
  await addDeadline(page, "Assurance habitation");

  await page.goto("/");
  const row = page.getByTestId("timeline-item");
  await expect(row).toHaveCount(1);
  await expect(row).toContainText("Assurance habitation");
  await expect(row).toContainText("Contrats");
  await expect(row).toContainText("dans 1 jour");
  await expect(row).toContainText("Urgente");
  await expect(page.getByTestId("counter-urgente")).toHaveText("1");
});

test("/ does not scroll horizontally at 375 px", async ({ page }) => {
  await addDeadline(page, "Assurance habitation et multirisque du logement");
  await page.setViewportSize({ width: 375, height: 667 });
  await page.goto("/");
  await expect(page.getByTestId("timeline-item")).toHaveCount(1);
  const overflow = await page.evaluate(
    () => document.documentElement.scrollWidth - document.documentElement.clientWidth,
  );
  expect(overflow).toBeLessThanOrEqual(0);
});
