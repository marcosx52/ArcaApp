import { test, expect } from '@playwright/test';

test('new invoice page loads', async ({ page }) => {
  await page.goto('/login');
  await page.getByLabel(/email/i).fill('admin@demo.com');
  await page.getByLabel(/password/i).fill('admin12345');
  await page.getByRole('button', { name: /ingresar|iniciar sesión|login/i }).click();

  await page.goto('/invoices/new');
  await expect(page.getByText(/nueva factura|nuevo comprobante|borrador|invoice/i).first()).toBeVisible();
});
