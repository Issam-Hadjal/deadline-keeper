import { expect, test, type Locator, type Page } from "@playwright/test";

// The field overflows its column on an iPhone: the checks run at 375 × 667, the
// size of an iPhone SE, the narrowest screen the app targets. Playwright drives
// Chromium here, not Safari iOS: this test measures the box and the activity of
// the control, it does not open the native picker. Run it after npm run build.
test.use({ viewport: { width: 375, height: 667 } });

// A pixel of tolerance: the content width of a control lands on a sub-pixel.
const TOLERANCE = 1;

function documentWidth(page: Page): Promise<number> {
  return page.evaluate(() => document.documentElement.scrollWidth);
}

function height(locator: Locator): Promise<number> {
  return locator.evaluate((element) => element.getBoundingClientRect().height);
}

// The width the content needs, against the width the field actually has: an input
// that keeps an intrinsic width larger than its column shows up here.
function widths(locator: Locator): Promise<{ client: number; scroll: number }> {
  return locator.evaluate((element) => {
    const input = element as HTMLInputElement;
    return { client: input.clientWidth, scroll: input.scrollWidth };
  });
}

async function expectSameHeight(date: Locator, text: Locator) {
  const [dateHeight, textHeight] = await Promise.all([height(date), height(text)]);
  expect(Math.abs(dateHeight - textHeight)).toBeLessThanOrEqual(TOLERANCE);
}

test("the date field fits its column and the text fields’ height at 375 px", async ({ page }) => {
  await page.goto("/deadlines");
  await expect(page.getByRole("heading", { level: 1 })).toHaveText("Mes échéances");

  const date = page.getByLabel("Date", { exact: true });
  // The form's first input of type text, found by its label: the control carries
  // no type attribute, so the selector input[type="text"] matches nothing — the
  // DOM property is what defaults to "text".
  const text = page.getByLabel("Titre", { exact: true });

  // The fix changes neither the type nor the activity of the control.
  await expect(date).toHaveAttribute("type", "date");
  await expect(date).toBeEditable();

  // Empty field: the computed style the classes must produce, and the layout.
  const empty = await date.evaluate((element) => {
    const input = element as HTMLInputElement;
    const style = getComputedStyle(input);
    return {
      // getPropertyValue reads the same computed declaration as style.appearance.
      appearance: style.getPropertyValue("appearance"),
      minWidth: style.minWidth,
    };
  });
  expect(empty.appearance).toBe("none");
  expect(empty.minWidth).toBe("0px");

  const emptyWidths = await widths(date);
  expect(emptyWidths.scroll).toBeLessThanOrEqual(emptyWidths.client + TOLERANCE);
  expect(await documentWidth(page)).toBeLessThanOrEqual(375);
  await expectSameHeight(date, text);

  // The control accepts a value and reads it back: it stays an active field.
  await date.fill("2026-12-01");
  await expect(date).toHaveValue("2026-12-01");

  // Filled field: same height, still inside its column and the page.
  const filledWidths = await widths(date);
  expect(filledWidths.scroll).toBeLessThanOrEqual(filledWidths.client + TOLERANCE);
  expect(await documentWidth(page)).toBeLessThanOrEqual(375);
  await expectSameHeight(date, text);
});
