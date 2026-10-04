import { expect, test } from '@playwright/test';
import { InventoryPage } from '../../pages/InventoryPage';

test.describe('Core shopping flows', () => {
  test('Login and access the storefront', async ({ page }) => {
    const inventoryPage = new InventoryPage(page);

    // 1. Open SauceDemo homepage and assert Swag Labs branding and username/password form visible.
    await page.goto('https://www.saucedemo.com/');
    await expect(page.getByText('Swag Labs')).toBeVisible();
    await expect(page.getByRole('textbox', { name: 'Username' })).toBeVisible();
    await expect(page.getByRole('textbox', { name: 'Password' })).toBeVisible();

    // 2. Enter standard_user / secret_sauce, click Login, assert inventory navigation plus visible product list and shopping cart icon.
    await page.getByRole('textbox', { name: 'Username' }).fill('standard_user');
    await page.getByRole('textbox', { name: 'Password' }).fill('secret_sauce');
    await page.getByRole('button', { name: 'Login' }).click();
    await expect(page).toHaveURL('https://www.saucedemo.com/inventory.html');
    await expect(page.getByText('Products', { exact: true })).toBeVisible();
    await expect(page.getByText('Sauce Labs Backpack', { exact: true })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Cart, empty' })).toBeVisible();

    await inventoryPage.logout();
    await expect(page).toHaveURL('https://www.saucedemo.com/');
    await expect(page.getByRole('textbox', { name: 'Username' })).toBeVisible();

    // 3. Attempt login with invalid credentials, assert error message and that storefront access is prevented.
    await page.getByRole('textbox', { name: 'Username' }).fill('invalid_user');
    await page.getByRole('textbox', { name: 'Password' }).fill('wrong_password');
    await page.getByRole('button', { name: 'Login' }).click();
    await expect(page.getByRole('alert')).toContainText(
      'Epic sadface: Username and password do not match any user in this service',
    );
    await expect(page).toHaveURL('https://www.saucedemo.com/');
  });
  
});
