import { type Locator, type Page } from '@playwright/test';

export class CheckoutCompletePage {
  readonly page: Page;
  readonly confirmationHeading: Locator;
  readonly backHomeButton: Locator;

  constructor(page: Page) {
    this.page = page;
    this.confirmationHeading = page.getByText('Checkout: Complete!', { exact: true });
    this.backHomeButton = page.getByRole('button', { name: 'Back Home' });
  }
}
