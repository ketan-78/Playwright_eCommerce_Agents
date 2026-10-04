import { expect, test } from '@playwright/test';
import { CartPage } from '../../pages/CartPage';
import { CheckoutOverviewPage } from '../../pages/CheckoutOverviewPage';
import { CheckoutStepOnePage } from '../../pages/CheckoutStepOnePage';
import { InventoryPage } from '../../pages/InventoryPage';
import { LoginPage } from '../../pages/LoginPage';

test.describe('Core shopping flows', () => {
  test('Checkout with customer information', async ({ page }) => {
    const loginPage = new LoginPage(page);
    const inventoryPage = new InventoryPage(page);
    const cartPage = new CartPage(page);
    const checkoutStepOnePage = new CheckoutStepOnePage(page);
    const checkoutOverviewPage = new CheckoutOverviewPage(page);

    // 1. Log in, add an item, open the cart, and proceed to checkout.
    await loginPage.open();
    await loginPage.loginAsStandardUser();
    await inventoryPage.addProductToCart('Sauce Labs Backpack');
    await inventoryPage.goToCart();
    await cartPage.checkout();

    // 2. Confirm the first name, last name, and postal code fields are visible.
    await expect(checkoutStepOnePage.firstNameInput).toBeVisible();
    await expect(checkoutStepOnePage.lastNameInput).toBeVisible();
    await expect(checkoutStepOnePage.postalCodeInput).toBeVisible();

    // 3. Submit incomplete information and verify checkout is blocked with an error.
    await checkoutStepOnePage.continue();
    await expect(checkoutStepOnePage.errorMessage).toBeVisible();
    await expect(page).toHaveURL(/\/checkout-step-one\.html$/);

    // 4. Enter valid customer information, continue, and assert the checkout overview.
    await checkoutStepOnePage.fillCustomerInfo('Jane', 'Doe', '12345');
    await checkoutStepOnePage.continue();
    await expect(checkoutOverviewPage.summaryHeading).toBeVisible();
    await expect(page).toHaveURL(/\/checkout-step-two\.html$/);
  });
});
