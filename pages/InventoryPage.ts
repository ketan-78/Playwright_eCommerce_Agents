import { type Locator, type Page } from '@playwright/test';

export class InventoryPage {
  readonly page: Page;
  readonly title: Locator;
  readonly sortDropdown: Locator;
  readonly cartLink: Locator;
  readonly cartBadge: Locator;
  readonly menuButton: Locator;
  readonly logoutLink: Locator;

  constructor(page: Page) {
    this.page = page;
    this.title = page.getByText('Products', { exact: true });
    this.sortDropdown = page.getByRole('combobox', { name: 'Sort products' });
    this.cartLink = page.locator('.shopping_cart_link');
    this.cartBadge = page.locator('.shopping_cart_badge');
    this.menuButton = page.getByRole('button', { name: 'Open Menu' });
    this.logoutLink = page.getByRole('link', { name: 'Logout' });
  }

  itemCard(productName: string): Locator {
    return this.page.locator('.inventory_item').filter({
      has: this.page.getByText(productName, { exact: true }),
    });
  }

  async sortBy(value: 'az' | 'za' | 'lohi' | 'hilo') {
    await this.sortDropdown.selectOption(value);
  }

  async addProductToCart(productName: string) {
    await this.itemCard(productName).getByRole('button', { name: 'Add to cart' }).click();
  }

  async removeProductFromCart(productName: string) {
    await this.itemCard(productName).getByRole('button', { name: 'Remove' }).click();
  }

  async openProduct(productName: string) {
    const detailsButton = this.page.getByRole('button', {
      name: new RegExp(`View details for ${productName}`),
    }).first();
    await detailsButton.click();
  }

  async goToCart() {
    await this.cartLink.click();
  }

  async logout() {
    await this.menuButton.click();
    await this.page.getByRole('navigation').getByText('Logout').click();
  }
}
