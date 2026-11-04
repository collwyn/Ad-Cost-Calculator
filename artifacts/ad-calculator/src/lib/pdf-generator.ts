import { jsPDF } from "jspdf";
import { format } from "date-fns";
import { AD_INVENTORY, ANALYTICS, NEWSLETTER_PRICE_PER_SEND, NEWSLETTER_UNIT_ID, PRINT_ADDON_MONTHLY } from "./constants";
import { calculateQuote } from "./calculator";

export function generatePDFQuote(
  adIds: string[],
  days: number,
  printBundle: boolean,
  newsletterSends: number = 0
) {
  // Always use 0 discount for PDF — no client/discount info in output
  const calc = calculateQuote(adIds, days, 0, printBundle, newsletterSends);

  const doc = new jsPDF({
    orientation: "portrait",
    unit: "mm",
    format: "a4"
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  const margin = 20;
  let y = margin;

  const formatCurrency = (val: number) =>
    new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(val);
  const formatNumber = (val: number) =>
    new Intl.NumberFormat('en-US').format(val);

  doc.setFont("helvetica");
  const primaryColor = "#0f172a";
  const secondaryColor = "#64748b";
  const accentColor = "#2563eb";

  // Header
  doc.setTextColor(primaryColor);
  doc.setFontSize(24);
  doc.setFont("helvetica", "bold");
  doc.text("DBG Media Group", margin, y);

  y += 8;
  doc.setFontSize(12);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(secondaryColor);
  doc.text("Advertising Rate Quote  |  OurTimePress · ourtimepress.com", margin, y);

  y += 15;
  doc.setDrawColor(226, 232, 240);
  doc.line(margin, y, pageWidth - margin, y);
  y += 15;

  // Campaign details
  doc.setTextColor(primaryColor);
  doc.setFontSize(16);
  doc.setFont("helvetica", "bold");
  doc.text("Campaign Proposal", margin, y);

  y += 10;
  doc.setFontSize(11);
  doc.setFont("helvetica", "normal");

  const selectedAds = adIds
    .map(id => AD_INVENTORY.find(a => a.id === id))
    .filter(Boolean) as typeof AD_INVENTORY;
  const formatNames = selectedAds.map(a => `${a.name} (${a.dimensions})`).join(" + ");

  doc.text(`Format: ${formatNames}`, margin, y); y += 7;
  doc.text(`Duration: ${days} Days`, margin, y); y += 7;
  doc.text(`Print Bundle Included: ${printBundle ? "Yes" : "No"}`, margin, y); y += 15;

  // Audience stats
  doc.setFillColor(248, 250, 252);
  doc.rect(margin, y, pageWidth - (margin * 2), 35, 'F');

  let statY = y + 8;
  doc.setFontSize(10);
  doc.setFont("helvetica", "bold");
  doc.text("Verified Audience Metrics", margin + 5, statY);

  statY += 7;
  doc.setFont("helvetica", "normal");
  doc.text(`Monthly Active Users: ${formatNumber(ANALYTICS.MONTHLY_ACTIVE_USERS)}`, margin + 5, statY);
  doc.text(`Daily Page Views: ~${formatNumber(ANALYTICS.DAILY_PAGE_VIEWS)}`, margin + 80, statY);

  statY += 7;
  doc.text(`Daily Unique Readers: ~${formatNumber(ANALYTICS.DAILY_UNIQUE_READERS)}`, margin + 5, statY);
  doc.text(`Avg. Engagement: ${ANALYTICS.AVG_ENGAGEMENT_SEC} sec`, margin + 80, statY);

  statY += 7;
  doc.setFontSize(8);
  doc.setTextColor(secondaryColor);
  doc.text(`Data Period: ${ANALYTICS.DATA_PERIOD}`, margin + 5, statY);

  y += 45;

  // Rate breakdown
  doc.setTextColor(primaryColor);
  doc.setFontSize(14);
  doc.setFont("helvetica", "bold");
  doc.text("Investment Breakdown", margin, y);
  y += 10;

  doc.setFontSize(11);

  selectedAds.forEach(ad => {
    doc.setFont("helvetica", "bold");
    doc.text(ad.name, margin, y);
    doc.setFont("helvetica", "normal");
    const isNewsletter = ad.id === NEWSLETTER_UNIT_ID;
    const lineTotal = isNewsletter ? NEWSLETTER_PRICE_PER_SEND * newsletterSends : ad.baseDay * days;
    doc.text(
      isNewsletter
        ? `${formatCurrency(NEWSLETTER_PRICE_PER_SEND)}/send × ${newsletterSends} sends`
        : `${formatCurrency(ad.baseDay)}/day × ${days} days`,
      margin + 80,
      y
    );
    doc.text(formatCurrency(lineTotal), pageWidth - margin, y, { align: "right" });
    y += 8;
  });

  if (printBundle) {
    doc.setFont("helvetica", "bold");
    doc.text("Print Bundle Add-on", margin, y);
    doc.setFont("helvetica", "normal");
    const printCost = (PRINT_ADDON_MONTHLY / 30) * days;
    doc.text("Our Time Press + Bed-Stuy Villager", margin + 80, y);
    doc.text(formatCurrency(printCost), pageWidth - margin, y, { align: "right" });
    y += 10;
  }

  y += 5;
  doc.setDrawColor(226, 232, 240);
  doc.line(margin, y, pageWidth - margin, y);
  y += 10;

  doc.setFontSize(14);
  doc.setFont("helvetica", "bold");
  doc.text("Campaign Total", margin + 80, y);
  doc.setTextColor(accentColor);
  doc.text(formatCurrency(calc.total), pageWidth - margin, y, { align: "right" });

  y += 15;
  doc.setTextColor(secondaryColor);
  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  if (calc.impressions > 0) {
    doc.text(`Estimated Website Impressions: ${formatNumber(calc.impressions)}`, margin, y); y += 6;
    doc.text(`Effective CPM (website): ${formatCurrency(calc.effectiveCPM)}`, margin, y);
  }

  // Footer
  const footerY = doc.internal.pageSize.getHeight() - 20;
  doc.setFontSize(9);
  doc.setTextColor(secondaryColor);
  doc.text("Rates are example values. Contact DBG Media for custom quotes.", margin, footerY);
  doc.text(`Generated: ${format(new Date(), "MMM dd, yyyy")}`, pageWidth - margin, footerY, { align: "right" });

  const adNameSlug = selectedAds.length > 0 ? selectedAds[0].name.replace(/\s+/g, '') : 'Custom';
  const filename = `DBG_Quote_${adNameSlug}_${days}days_${format(new Date(), "yyyy-MM-dd")}.pdf`;
  doc.save(filename);
}
