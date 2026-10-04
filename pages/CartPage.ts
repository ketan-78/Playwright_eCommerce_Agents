import { type Locator, type Page } from '@playwright/test';

export class CartPage {
  readonly page: Page;
  readonly itemList: Locator;
  readonly checkoutButton: Locator;
  readonly continueShoppingButton: Locator;

  constructor(page: Page) {
    this.page = page;
    this.itemList = page.locator('.cart_item');
    this.checkoutButton = page.getByRole('button', { name: 'Checkout' });
    this.continueShoppingButton = page.getByRole('button', { name: 'Continue Shopping' });
  }

  item(productName: string): Locator {
    return this.page.locator('.cart_item').filter({
      has: this.page.getByText(productName, { exact: true }),
    });
  }

  async removeProduct(productName: string) {
    await this.item(productName).getByRole('button', { name: 'Remove' }).click();
  }

  async checkout() {
    await this.checkoutButton.click();
  }

  async continueShopping() {
    await this.continueShoppingButton.click();
  }
}
