const { test, expect } = require('@playwright/test');
const { setupAuthenticatedPage } = require('./helpers');

test.describe('Moliya va To\'lovlar Moduli (Finance)', () => {
  test.beforeEach(async ({ page }) => {
    await setupAuthenticatedPage(page);
  });

  test('Moliya sahifasi va kassa ko\'rsatkichlari yuklanishi', async ({ page }) => {
    await page.goto('/finance');
    await page.waitForLoadState('domcontentloaded');

    await expect(page).toHaveURL(/finance/);
    const bodyContent = page.locator('body');
    await expect(bodyContent).toBeVisible();
  });

  test('To\'lovlar statistikasi sahifasi yuklanishi', async ({ page }) => {
    await page.goto('/payment-stats');
    await page.waitForLoadState('domcontentloaded');

    await expect(page).toHaveURL(/payment-stats/);
    const bodyContent = page.locator('body');
    await expect(bodyContent).toBeVisible();
  });
});
