import { test, expect } from '@playwright/test';

test.describe('Sanakampa', () => {
  test('should display title and search input', async ({ page }) => {
    await page.goto('/');

    await expect(page.getByRole('heading', { name: 'Sanakampa' })).toBeVisible();
    await expect(page.getByPlaceholder('Etsi')).toBeVisible();
  });

  test('should search for words', async ({ page }) => {
    await page.goto('/');

    const searchInput = page.getByPlaceholder('Etsi');
    await searchInput.fill('hattu');

    await expect(page.getByText(/sanaa löytyi/)).toBeVisible({ timeout: 10000 });
    await expect(page.getByText('hattu')).toBeVisible();
  });

  test('should show help panel when clicking help button', async ({ page }) => {
    await page.goto('/');

    await page.getByRole('button', { name: 'Näytä ohjeet' }).click();

    await expect(page.getByRole('heading', { name: 'Ohjeet' })).toBeVisible();
    await expect(page.getByText(/Asteriski antaa mahdollisuuden/)).toBeVisible();
  });

  test('should show clear button when search has text', async ({ page }) => {
    await page.goto('/');

    await page.getByPlaceholder('Etsi').fill('test');
    await expect(page.getByRole('button', { name: 'Tyhjennä haku' })).toBeVisible();

    await page.getByRole('button', { name: 'Tyhjennä haku' }).click();
    await expect(page.getByPlaceholder('Etsi')).toHaveValue('');
  });
});
