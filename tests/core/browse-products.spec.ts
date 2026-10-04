import { expect, test } from '@playwright/test';
import { InventoryPage } from '../../pages/InventoryPage';
import { LoginPage } from '../../pages/LoginPage';

test.describe('Core shopping flows', () => {
  test('Browse products and filter the catalog', async ({ page }) => {
    const loginPage = new LoginPage(page);
    const inventoryPage = new InventoryPage(page);

    await loginPage.open();
    await loginPage.loginAsStandardUser();
    await expect(inventoryPage.title).toBeVisible();

    // 1. Review the inventory list and confirm each product card includes name, price, image, and Add to cart action.
    const productCards = page.locator('.inventory_item');
    await expect(productCards).toHaveCount(6);
    for (const card of await productCards.all()) {
      await expect(card.locator('.inventory_item_name')).toBeVisible();
      await expect(card.locator('.inventory_item_price')).toBeVisible();
      await expect(card.locator('img')).toBeVisible();
      await expect(card.getByRole('button', { name: 'Add to cart' })).toBeVisible();
    }

    // 2. Use the sort dropdown to reorder the list by price and assert displayed order follows the selected option.
    await inventoryPage.sortBy('lohi');
    const prices = await page.locator('.inventory_item_price').allTextContents();
    const numericPrices = prices.map((price) => Number(price.replace('$', '')));
    expect(numericPrices).toEqual([...numericPrices].sort((first, second) => first - second));

    // 3. Open a product detail page, assert selected product details, then use Back to products and assert inventory returns.
    await inventoryPage.openProduct('Sauce Labs Onesie');
    await expect(page).toHaveURL(/inventory-item\.html\?id=2/);
    await expect(page.getByRole('img', { name: 'Sauce Labs Onesie' })).toBeVisible();
    await expect(page.getByText('Sauce Labs Onesie', { exact: true })).toBeVisible();
    await expect(page.getByText('$7.99', { exact: true })).toBeVisible();
    await page.getByRole('button', { name: 'Back to products' }).click();
    await expect(page).toHaveURL('https://www.saucedemo.com/inventory.html');
    await expect(inventoryPage.itemCard('Sauce Labs Onesie')).toBeVisible();
  });
});