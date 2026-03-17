import { AD_INVENTORY, DISCOUNTS, ClientType, PRINT_ADDON_MONTHLY, ANALYTICS } from './constants';

export type CalculationResult = {
  totalDailyRate: number;
  subtotal: number;
  printAddOn: number;
  total: number;
  impressions: number;
  effectiveCPM: number;
  discount: number;
};

export function calculateQuote(
  adIds: string[],
  days: number,
  clientType: ClientType,
  printBundle: boolean
): CalculationResult {
  const discount = DISCOUNTS[clientType];
  
  const totalDailyRate = adIds.reduce((sum, id) => {
    const ad = AD_INVENTORY.find(a => a.id === id);
    if (!ad) return sum;
    return sum + (ad.baseDay * (1 - discount));
  }, 0);

  const subtotal = totalDailyRate * days;
  const printAddOn = printBundle ? (PRINT_ADDON_MONTHLY / 30) * days : 0;
  const total = subtotal + printAddOn;
  
  const impressions = ANALYTICS.DAILY_PAGE_VIEWS * days;
  
  // Guard against divide by zero or NaN if total is 0
  const effectiveCPM = impressions > 0 && total > 0 ? (total / impressions) * 1000 : 0;

  return {
    totalDailyRate,
    subtotal,
    printAddOn,
    total,
    impressions,
    effectiveCPM,
    discount,
  };
}
