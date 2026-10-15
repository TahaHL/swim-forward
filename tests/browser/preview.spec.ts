import { test, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";
for (const width of [390, 768, 1440])
  for (const colorScheme of ["light", "dark"] as const) {
    test(`parent and poolside ${width}px ${colorScheme}`, async ({ page }) => {
      await page.setViewportSize({ width, height: 900 });
      await page.emulateMedia({ colorScheme });
      await page.goto("/demo");
      await expect(
        page.getByRole("heading", { name: "Oliver’s swimming" }),
      ).toBeVisible();
      await expect(
        page.getByText(
          "Oliver points his toes more often, but his ankles tighten when he concentrates on his arms.",
        ),
      ).toBeVisible();
      expect(
        await page.evaluate(
          () => document.documentElement.scrollWidth <= innerWidth,
        ),
      ).toBe(true);
      const axe = await new AxeBuilder({ page })
        .withTags(["wcag2a", "wcag2aa", "wcag21aa", "wcag22aa"])
        .analyze();
      expect(axe.violations).toEqual([]);
      await page.screenshot({
        path: `test-results/parent-${width}-${colorScheme}.png`,
        fullPage: true,
      });
      await page.getByRole("button", { name: "Skills", exact: true }).click();
      await page.getByRole("button", { name: /Relaxed ankles/ }).click();
      await expect(page.getByRole("dialog")).toBeVisible();
      await page.getByRole("button", { name: "Close", exact: true }).click();
      await page.getByRole("button", { name: "Journey", exact: true }).click();
      await expect(page.getByLabel("From", { exact: true })).toBeVisible();
      await page.getByLabel("Preview role").selectOption("instructor");
      await expect(
        page.getByRole("heading", { name: "Oliver’s assessment" }),
      ).toBeVisible();
      await page
        .getByRole("group", { name: "Horizontal alignment rating" })
        .getByRole("button", { name: "Good", exact: true })
        .click();
      await page
        .getByLabel("How the session went")
        .fill("Fictional browser test note");
      await page.reload();
      await page.getByLabel("Preview role").selectOption("instructor");
      await expect(page.getByLabel("How the session went")).toHaveValue(
        "Fictional browser test note",
      );
      expect(
        await page.evaluate(
          () => document.documentElement.scrollWidth <= innerWidth,
        ),
      ).toBe(true);
      const poolside = await new AxeBuilder({ page })
        .withTags(["wcag2a", "wcag2aa", "wcag21aa", "wcag22aa"])
        .analyze();
      expect(poolside.violations).toEqual([]);
      await page.screenshot({
        path: `test-results/instructor-${width}-${colorScheme}.png`,
        fullPage: true,
      });
    });
  }
test("unauthenticated production is denied and sign-in does not simulate success", async ({
  page,
  request,
}) => {
  const denied = await request.get("/api/data");
  expect(denied.status()).toBe(401);
  await page.goto("/app");
  await expect(page).toHaveURL(/sign-in/);
  await expect(
    page.getByRole("button", { name: "Send sign-in code" }),
  ).toBeDisabled();
  await page.goto("/");
  await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
});
test("pricing is only a placeholder and direct checkout is disabled", async ({
  page,
  request,
}) => {
  await page.goto("/demo");
  await page.getByRole("button", { name: "Bookings", exact: true }).click();
  await expect(
    page.getByRole("heading", { name: "Online booking and pricing" }),
  ).toBeVisible();
  await expect(
    page.getByRole("button", { name: "Book this block" }),
  ).toHaveCount(0);
  expect((await request.post("/api/checkout")).status()).toBe(410);
  await page.getByLabel("Preview role").selectOption("admin");
  await page.getByRole("button", { name: "block", exact: true }).click();
  await expect(page.getByText("Full block price in pence")).toHaveCount(0);
});
for (const width of [390, 1440]) {
  test(`instructor and parent portals stay separate at ${width}px`, async ({
    page,
  }) => {
    await page.setViewportSize({ width, height: 900 });
    await page.goto("/demo");
    await page.getByLabel("Preview role").selectOption("instructor");
    const nav = page.getByRole("navigation", {
      name: "Main navigation",
      exact: true,
    });
    await expect(
      nav.getByRole("button", { name: "Parent preview", exact: true }),
    ).toHaveCount(0);
    await expect(
      page.getByRole("heading", { name: "Oliver’s swimming" }),
    ).toHaveCount(0);
    await page.getByRole("button", { name: "Swimmers", exact: true }).click();
    await expect(
      page.getByRole("region", { name: "Swimmer profile" }),
    ).toContainText("Oliver");
    await page
      .getByRole("button", { name: "Preview as parent", exact: true })
      .click();
    await expect(
      page.getByRole("heading", { name: "Viewing as a parent" }),
    ).toBeVisible();
    await expect(
      page.getByRole("heading", { name: "Oliver’s swimming" }),
    ).toBeVisible();
    await page.getByRole("button", { name: "Skills", exact: true }).click();
    await expect(
      page.getByRole("heading", { name: "Skills, one step at a time" }),
    ).toBeVisible();
    await page.screenshot({
      path: `test-results/parent-preview-${width}.png`,
      fullPage: true,
    });
    await page
      .getByRole("button", { name: "Return to instructor view" })
      .click();
    await expect(
      page.getByRole("heading", { name: "Your swimmers" }),
    ).toBeVisible();
    await page.screenshot({
      path: `test-results/swimmers-${width}.png`,
      fullPage: true,
    });
    await page.getByRole("button", { name: "Profile", exact: true }).click();
    await expect(
      page.getByText("Download records", { exact: true }),
    ).toHaveCount(0);
    await page.getByLabel("Preview role").selectOption("parent");
    await expect(
      page.getByRole("heading", { name: "Oliver’s swimming" }),
    ).toBeVisible();
    await expect(
      page.getByRole("button", { name: "Swimmers", exact: true }),
    ).toHaveCount(0);
  });
}
