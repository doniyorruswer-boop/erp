const { test, expect } = require('@playwright/test');
const { setupAuthenticatedPage } = require('./helpers');

test.describe('O\'quvchilar Moduli (Students View)', () => {
  test.beforeEach(async ({ page }) => {
    await setupAuthenticatedPage(page);
  });

  test('Maktab o\'quvchilari ro\'yxati va jadval elementlari yuklanishi', async ({ page }) => {
    await page.goto('/school/students');
    await page.waitForLoadState('domcontentloaded');

    // Jadval mavjudligini tekshirish
    const table = page.locator('.app-table-component');
    await expect(table).toBeVisible({ timeout: 10000 });

    // Qidiruv inputi
    const searchInput = page.locator('input[placeholder*="qidirish" i], input[placeholder*="F.I.SH" i], input[type="text"]').first();
    await expect(searchInput).toBeVisible();

    // Jadvalda ma'lumotlar qatori
    const rows = page.locator('tbody tr');
    await expect(rows.first()).toBeVisible({ timeout: 10000 });
  });

  test('O\'quvchilar qidiruvi va filtri ishlashi', async ({ page }) => {
    await page.goto('/school/students');
    await page.waitForLoadState('domcontentloaded');

    const searchInput = page.locator('input[placeholder*="qidirish" i], input[placeholder*="F.I.SH" i], input[type="text"]').first();
    await searchInput.fill('Alisher');

    await page.waitForTimeout(500);
    const table = page.locator('.app-table-component');
    await expect(table).toBeVisible();
  });
});
