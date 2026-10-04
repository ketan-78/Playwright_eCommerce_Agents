import { expect, test } from '@playwright/test';
import { CartPage } from '../../pages/CartPage';
import { InventoryPage } from '../../pages/InventoryPage';
import { LoginPage } from '../../pages/LoginPage';

test.describe('Core shopping flows', () => {
  test('Add products to the cart and manage selection', async ({ page }) => {
    const loginPage = new LoginPage(page);
    const inventoryPage = new InventoryPage(page);

    await loginPage.open();
    await loginPage.loginAsStandardUser();
    await expect(inventoryPage.title).toBeVisible();

    // 1. Add at least two products to the cart from the inventory page; assert badge count and changed Remove button states.
    await inventoryPage.addProductToCart('Sauce Labs Backpack');
    await inventoryPage.addProductToCart('Sauce Labs Bike Light');
    await expect(inventoryPage.cartBadge).toHaveText('2');
    await expect(inventoryPage.itemCard('Sauce Labs Backpack').getByRole('button', { name: 'Remove' })).toBeVisible();
    await expect(inventoryPage.itemCard('Sauce Labs Bike Light').getByRole('button', { name: 'Remove' })).toBeVisible();

    // 2. Open the cart and review selected item names, prices, and subtotal.
    await inventoryPage.goToCart();
    const cartPage = new CartPage(page);
    await expect(cartPage.itemList).toHaveCount(2);
    await expect(cartPage.item('Sauce Labs Backpack')).toContainText('$29.99');
    await expect(cartPage.item('Sauce Labs Bike Light')).toContainText('$9.99');
    const displayedPrices = await cartPage.itemList.locator('.inventory_item_price').allTextContents();
    const cartTotal = displayedPrices.reduce((total, price) => total + Number(price.replace('$', '')), 0);
    expect(cartTotal).toBeCloseTo(39.98, 2);

    // 3. Remove an item, assert it disappears and badge count updates, then continue shopping and assert inventory returns.
    await cartPage.removeProduct('Sauce Labs Backpack');
    await expect(cartPage.itemList).toHaveCount(1);
    await expect(cartPage.item('Sauce Labs Backpack')).toHaveCount(0);
    await expect(cartPage.item('Sauce Labs Bike Light')).toBeVisible();
    await expect(inventoryPage.cartBadge).toHaveText('1');
    await cartPage.continueShopping();
    await expect(page).toHaveURL('https://www.saucedemo.com/inventory.html');
    await expect(inventoryPage.title).toBeVisible();
  });
});