import { expect, test } from "@playwright/test";

// The list lives in the browser's localStorage, so a run must start from an
// empty storage. A script added with addInitScript runs again on every
// navigation, and this test reloads twice to prove what the form wrote: the
// tab clears the storage once, then lets its own reloads read it back.
test.beforeEach(async ({ page }) => {
  await page.addInitScript(() => {
    if (window.sessionStorage.getItem("deadline-keeper:e2e:storage-cleared") === null) {
      window.localStorage.clear();
      window.sessionStorage.setItem("deadline-keeper:e2e:storage-cleared", "1");
    }
  });
});

test("a deadline added by the form survives a reload and a confirmed deletion", async ({ page }) => {
  await page.goto("/deadlines");
  await expect(page.getByRole("heading", { level: 1 })).toHaveText("Mes échéances");
  await expect(page.getByRole("listitem")).toHaveCount(0);

  // Adding goes through the form only: the test never writes the storage itself.
  await page.getByLabel("Titre", { exact: true }).fill("Assurance habitation");
  await page.getByLabel("Description", { exact: true }).fill("Résilier avant la reconduction");
  await page.getByLabel("Catégorie", { exact: true }).selectOption("Contrats");
  await page.getByLabel("Date", { exact: true }).fill("2027-03-31");
  await page.getByLabel("Fréquence", { exact: true }).selectOption("Annuelle");
  await page.getByRole("button", { name: "Ajouter l'échéance" }).click();

  const deadline = page.getByRole("listitem").filter({ hasText: "Assurance habitation" });
  await expect(deadline).toHaveCount(1);
  await expect(deadline).toContainText("Contrats");
  await expect(deadline).toContainText("31/03/2027");
  await expect(deadline).toContainText("Annuelle");

  // The form is the only writer; the key the page uses is read, never written.
  const stored = await page.evaluate(() =>
    window.localStorage.getItem("deadline-keeper:deadlines:v1"),
  );
  expect(stored).toContain("Assurance habitation");

  await page.reload();
  await expect(deadline).toHaveCount(1);

  // The deletion is confirmed in the page: no browser dialog is involved.
  await deadline.getByRole("button", { name: "Supprimer" }).click();
  await deadline.getByRole("button", { name: "Confirmer la suppression" }).click();
  await expect(page.getByRole("listitem")).toHaveCount(0);
  await expect(
    page.getByText("Aucune échéance pour le moment. Ajoutez votre première échéance."),
  ).toBeVisible();

  await page.reload();
  await expect(page.getByRole("listitem")).toHaveCount(0);
  await expect(
    page.getByText("Aucune échéance pour le moment. Ajoutez votre première échéance."),
  ).toBeVisible();
});
