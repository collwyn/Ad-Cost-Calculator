import { AD_INVENTORY, PRINT_ADDON_MONTHLY, ANALYTICS, NEWSLETTER_PRICE_PER_SEND, NEWSLETTER_UNIT_ID } from './constants';

export type CalculationResult = {
  totalDailyRate: number;
  subtotal: number;
  printAddOn: number;
  newsletterCost: number;
  total: number;
  impressions: number;
  effectiveCPM: number;
  discount: number;
};

export function calculateQuote(
  adIds: string[],
  days: number,
  discountRate: number,
  printBundle: boolean,
  newsletterSends: number = 0
): CalculationResult {
  const totalDailyRate = adIds.reduce((sum, id) => {
    const ad = AD_INVENTORY.find(a => a.id === id);
    if (!ad) return sum;
    return sum + (ad.baseDay * (1 - discountRate));
  }, 0);

  const subtotal = totalDailyRate * days;
  const printAddOn = printBundle ? (PRINT_ADDON_MONTHLY / 30) * days : 0;
  const newsletterCost = adIds.includes(NEWSLETTER_UNIT_ID)
    ? NEWSLETTER_PRICE_PER_SEND * newsletterSends * (1 - discountRate)
    : 0;
  const total = subtotal + printAddOn + newsletterCost;

  // Impressions are website page views, so a newsletter-only quote has no estimate
  // and newsletter cost stays out of the CPM.
  const newsletterOnly = adIds.length > 0 && adIds.every(id => id === NEWSLETTER_UNIT_ID);
  const impressions = newsletterOnly ? 0 : ANALYTICS.DAILY_PAGE_VIEWS * days;
  const cpmCost = total - newsletterCost;
  const effectiveCPM = impressions > 0 && cpmCost > 0 ? (cpmCost / impressions) * 1000 : 0;

  return {
    totalDailyRate,
    subtotal,
    printAddOn,
    newsletterCost,
    total,
    impressions,
    effectiveCPM,
    discount: discountRate,
  };
}
