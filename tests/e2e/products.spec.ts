import { test, expect } from '@playwright/test';

test('products page loads and create action is visible', async ({ page }) => {
  await page.goto('/login');
  await page.getByLabel(/email/i).fill('admin@demo.com');
  await page.getByLabel(/password/i).fill('admin12345');
  await page.getByRole('button', { name: /ingresar|iniciar sesión|login/i }).click();

  await page.goto('/products');
  await expect(page.getByText(/productos|products/i).first()).toBeVisible();
  await expect(
    page.getByRole('link', { name: /nuevo producto|crear producto|nuevo/i }).or(
      page.getByRole('button', { name: /nuevo producto|crear producto|nuevo/i })
    ).first()
  ).toBeVisible();
});
