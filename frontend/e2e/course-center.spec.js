const { test, expect } = require('@playwright/test');
const { setupAuthenticatedPage } = require('./helpers');

test.describe('O\'quv Markazi va Kurslar Moduli (Course Center & Courses)', () => {
  test.beforeEach(async ({ page }) => {
    await setupAuthenticatedPage(page);
  });

  test('O\'quv markazi o\'quvchilar ro\'yxati yuklanishi va statistika kartochkalari', async ({ page }) => {
    await page.goto('/students');
    await page.waitForLoadState('domcontentloaded');

    // Sahifa sarlavhasi
    const heading = page.locator('h1').first();
    await expect(heading).toContainText(/O'quvchilar/);

    // Statistika kartochkalari
    const statsCards = page.locator('.stats-card, [class*="StatsCard"], .grid > div');
    await expect(statsCards.first()).toBeVisible({ timeout: 10000 });

    // Jadval mavjudligi
    const table = page.locator('.app-table-component');
    await expect(table).toBeVisible({ timeout: 10000 });
  });

  test('Kurslar ro\'yxati sahifasi yuklanishi', async ({ page }) => {
    await page.goto('/courses');
    await page.waitForLoadState('domcontentloaded');

    await expect(page).toHaveURL(/courses/);
    const heading = page.locator('h1').first();
    await expect(heading).toContainText(/Kurslar/);
  });
});
