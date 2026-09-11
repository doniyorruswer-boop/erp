const { test, expect } = require('@playwright/test');

test.describe('Autentifikatsiya (Login Flow)', () => {
  test('Login sahifasi to\'g\'ri ochilishi va elementlar mavjudligi', async ({ page }) => {
    await page.goto('/auth/login');
    await expect(page).toHaveTitle(/EduHub/i);
    
    const emailInput = page.locator('#floating_email');
    const passwordInput = page.locator('#floating_password');
    const submitBtn = page.locator('button[type="submit"]');

    await expect(emailInput).toBeVisible();
    await expect(passwordInput).toBeVisible();
    await expect(submitBtn).toBeVisible();
  });

  test('Super Admin hisobi orqali tizimga kirish', async ({ page }) => {
    await page.goto('/auth/login');

    await page.locator('#floating_email').fill('admin@eduhub.uz');
    await page.locator('#floating_password').fill('admin123');

    await page.locator('button[type="submit"]').click();

    // Tizimga muvaffaqiyatli kirgach dashboard sahifasiga o'tishi kerak
    await page.waitForURL((url) => !url.pathname.includes('/auth/login'), { timeout: 10000 });
    
    // localStorage'da token mavjudligini tekshirish
    const token = await page.evaluate(() => localStorage.getItem('token'));
    expect(token).toBeTruthy();
  });
});
