import { test, expect } from '@playwright/test';
import { LoginPage } from '../pages/LoginPage';
import { InventoryPage } from '../pages/InventoryPage';
import { CartPage } from '../pages/CartPage';
import { CheckoutStepOnePage } from '../pages/CheckoutStepOnePage';
import { CheckoutOverviewPage } from '../pages/CheckoutOverviewPage';
import { CheckoutCompletePage } from '../pages/CheckoutCompletePage';

test.describe('SauceDemo end-user flows', () => {
  test('user can log in successfully and see the inventory', async ({ page }) => {
    const loginPage = new LoginPage(page);
    const inventoryPage = new InventoryPage(page);

    await loginPage.open();
    await loginPage.loginAsStandardUser();

    await expect(inventoryPage.title).toBeVisible();
    await expect(inventoryPage.cartLink).toBeVisible();
    await expect(page).toHaveURL(/\/inventory\.html$/);
  });

  test('user sees an error when login credentials are invalid', async ({ page }) => {
    const loginPage = new LoginPage(page);

    await loginPage.open();
    await loginPage.login('standard_user', 'wrong_password');

    await expect(loginPage.errorMessage).toBeVisible();
    await expect(page).not.toHaveURL(/\/inventory\.html$/);
  });

  test('user can browse, sort, and open a product detail page', async ({ page }) => {
    const loginPage = new LoginPage(page);
    const inventoryPage = new InventoryPage(page);

    await loginPage.open();
    await loginPage.loginAsStandardUser();

    await expect(page.locator('.inventory_item')).toHaveCount(6);
    await expect(inventoryPage.sortDropdown).toBeVisible();

    await inventoryPage.sortBy('lohi');
    await expect(page.locator('.inventory_item_price').first()).toBeVisible();

    await inventoryPage.openProduct('Sauce Labs Backpack');
    await expect(page.getByText('Sauce Labs Backpack', { exact: true })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Back to products' })).toBeVisible();
  });

  test('user can add items, review the cart, and remove an item', async ({ page }) => {
    const loginPage = new LoginPage(page);
    const inventoryPage = new InventoryPage(page);
    const cartPage = new CartPage(page);

    await loginPage.open();
    await loginPage.loginAsStandardUser();

    await inventoryPage.addProductToCart('Sauce Labs Backpack');
    await inventoryPage.addProductToCart('Sauce Labs Bike Light');

    await expect(inventoryPage.cartBadge).toHaveText('2');

    await inventoryPage.goToCart();
    await expect(cartPage.item('Sauce Labs Backpack')).toBeVisible();
    await expect(cartPage.item('Sauce Labs Bike Light')).toBeVisible();

    await cartPage.removeProduct('Sauce Labs Bike Light');
    await expect(cartPage.item('Sauce Labs Bike Light')).toHaveCount(0);

    await cartPage.continueShopping();
    await expect(inventoryPage.title).toBeVisible();
  });

  test('user can complete checkout with valid data and finish an order', async ({ page }) => {
    const loginPage = new LoginPage(page);
    const inventoryPage = new InventoryPage(page);
    const cartPage = new CartPage(page);
    const checkoutStepOnePage = new CheckoutStepOnePage(page);
    const checkoutOverviewPage = new CheckoutOverviewPage(page);
    const checkoutCompletePage = new CheckoutCompletePage(page);

    await loginPage.open();
    await loginPage.loginAsStandardUser();

    await inventoryPage.addProductToCart('Sauce Labs Backpack');
    await inventoryPage.goToCart();
    await cartPage.checkout();

    await checkoutStepOnePage.fillCustomerInfo('Jane', 'Doe', '12345');
    await checkoutStepOnePage.continue();

    await expect(checkoutOverviewPage.summaryHeading).toBeVisible();
    await checkoutOverviewPage.finishOrder();

    await expect(checkoutCompletePage.confirmationHeading).toBeVisible();
    await expect(page).toHaveURL(/\/checkout-complete\.html$/);
  });

  test('user can fail checkout validation and then log out', async ({ page }) => {
    const loginPage = new LoginPage(page);
    const inventoryPage = new InventoryPage(page);
    const cartPage = new CartPage(page);
    const checkoutStepOnePage = new CheckoutStepOnePage(page);

    await loginPage.open();
    await loginPage.loginAsStandardUser();

    await inventoryPage.addProductToCart('Sauce Labs Backpack');
    await inventoryPage.goToCart();
    await cartPage.checkout();

    await checkoutStepOnePage.continue();
    await expect(checkoutStepOnePage.errorMessage).toBeVisible();

    await checkoutStepOnePage.fillCustomerInfo('Jane', 'Doe', '12345');
    await checkoutStepOnePage.continue();

    await inventoryPage.logout();
    await expect(page).toHaveURL(/https:\/\/www\.saucedemo\.com\/$/);
  });
});
