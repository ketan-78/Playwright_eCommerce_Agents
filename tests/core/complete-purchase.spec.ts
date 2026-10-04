import { expect, test } from '@playwright/test';
import { CartPage } from '../../pages/CartPage';
import { CheckoutCompletePage } from '../../pages/CheckoutCompletePage';
import { CheckoutOverviewPage } from '../../pages/CheckoutOverviewPage';
import { CheckoutStepOnePage } from '../../pages/CheckoutStepOnePage';
import { InventoryPage } from '../../pages/InventoryPage';
import { LoginPage } from '../../pages/LoginPage';

test.describe('Core shopping flows', () => {
  test('Complete purchase and end the session', async ({ page }) => {
    const loginPage = new LoginPage(page);
    const inventoryPage = new InventoryPage(page);
    const cartPage = new CartPage(page);
    const checkoutStepOnePage = new CheckoutStepOnePage(page);
    const checkoutOverviewPage = new CheckoutOverviewPage(page);
    const checkoutCompletePage = new CheckoutCompletePage(page);

    // 1. Log in, add an item, open the cart, and proceed to checkout.
    await loginPage.open();
    await loginPage.loginAsStandardUser();
    await inventoryPage.addProductToCart('Sauce Labs Backpack');
    await inventoryPage.goToCart();
    await cartPage.checkout();

    // 2. Enter valid customer information and continue to the checkout overview.
    await checkoutStepOnePage.fillCustomerInfo('Jane', 'Doe', '12345');
    await checkoutStepOnePage.continue();
    await expect(checkoutOverviewPage.summaryHeading).toBeVisible();
    await expect(page).toHaveURL(/\/checkout-step-two\.html$/);

    // 3. Finish the order and verify the purchase confirmation.
    await checkoutOverviewPage.finishOrder();
    await expect(checkoutCompletePage.confirmationHeading).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Thank you for your order!' })).toBeVisible();
    await expect(page).toHaveURL(/\/checkout-complete\.html$/);

    // 4. Log out from the app menu and verify reauthentication is required.
    await inventoryPage.logout();
    await expect(page).toHaveURL('https://www.saucedemo.com/');
    await expect(loginPage.usernameInput).toBeVisible();
    await expect(loginPage.passwordInput).toBeVisible();
    await expect(loginPage.loginButton).toBeVisible();
  });
});
