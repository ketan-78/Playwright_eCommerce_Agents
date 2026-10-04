import { type Locator, type Page } from '@playwright/test';

export class CheckoutOverviewPage {
  readonly page: Page;
  readonly summaryHeading: Locator;
  readonly finishButton: Locator;

  constructor(page: Page) {
    this.page = page;
    this.summaryHeading = page.getByText('Checkout: Overview', { exact: true });
    this.finishButton = page.getByRole('button', { name: 'Finish' });
  }

  async finishOrder() {
    await this.finishButton.click();
  }
}
