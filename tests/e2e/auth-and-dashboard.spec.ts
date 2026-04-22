import { test, expect } from '@playwright/test';

test('login and dashboard smoke flow', async ({ page }) => {
  await page.goto('/login');
  await page.getByLabel(/email/i).fill('admin@demo.com');
  await page.getByLabel(/password/i).fill('admin12345');
  await page.getByRole('button', { name: /ingresar|iniciar sesión|login/i }).click();

  await page.waitForURL((url) => !url.pathname.includes('/login'));
  await expect(page.getByText(/panel de facturación|dashboard|facturado hoy|estado general/i).first()).toBeVisible();
});
