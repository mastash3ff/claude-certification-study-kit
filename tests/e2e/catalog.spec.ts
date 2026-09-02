import { expect, test } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

test("catalog reaches every certification and starts a diagnostic", async ({ page }) => {
  await page.goto("./");
  await expect(page.getByRole("heading", { level: 1 })).toContainText("Prepare");
  await expect(page.locator(".track-card")).toHaveCount(4);
  await page.getByRole("link", { name: /Associate Foundations/ }).click();
  await page.getByRole("link", { name: /Take the 30-question diagnostic/ }).click();
  await expect(page.getByText("Question 1 of 30")).toBeVisible();
  await page.locator(".option").first().click();
  await expect(page.locator(".feedback")).toHaveCount(0);
  const results = await new AxeBuilder({ page }).analyze();
  expect(results.violations).toEqual([]);
});

test("domain drills reveal feedback and production search returns content", async ({ page }) => {
  await page.goto("./certifications/ccao-f/domains/prompting-task-execution/");
  await page.getByText("Loading practice session...").scrollIntoViewIfNeeded();
  await page.locator(".option").first().click();
  await page.getByRole("button", { name: "Check answer" }).click();
  await expect(page.locator(".feedback")).toBeVisible();

  await page.goto("./search/");
  await page.getByLabel("Search terms").fill("prompting");
  await expect(page.locator("#search-results .resource-card").first()).toBeVisible();
});
