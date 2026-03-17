import { jsPDF } from "jspdf";
import { format } from "date-fns";
import { AD_INVENTORY, ANALYTICS, PRINT_ADDON_MONTHLY } from "./constants";
import { calculateQuote } from "./calculator";

export function generatePDFQuote(
  adIds: string[],
  days: number,
  printBundle: boolean
) {
  // Always use 0 discount (SMB base rate) for PDF quote to avoid showing discounts
  const calc = calculateQuote(adIds, days, 'smb', printBundle);
  
  const doc = new jsPDF({
    orientation: "portrait",
    unit: "mm",
    format: "a4"
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  const margin = 20;
  let y = margin;

  // Helpers
  const formatCurrency = (val: number) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(val);
  const formatNumber = (val: number) => new Intl.NumberFormat('en-US').format(val);

  // Fonts & Colors
  doc.setFont("helvetica"); // Closest standard font to a clean editorial look
  const primaryColor = "#0f172a"; // Navy
  const secondaryColor = "#64748b"; // Gray
  const accentColor = "#2563eb"; // Blue

  // --- HEADER ---
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
  doc.setDrawColor(226, 232, 240); // light gray line
  doc.line(margin, y, pageWidth - margin, y);
  y += 15;

  // --- CAMPAIGN DETAILS ---
  doc.setTextColor(primaryColor);
  doc.setFontSize(16);
  doc.setFont("helvetica", "bold");
  doc.text("Campaign Proposal", margin, y);
  
  y += 10;
  doc.setFontSize(11);
  doc.setFont("helvetica", "normal");
  
  // Format names
  const selectedAds = adIds.map(id => AD_INVENTORY.find(a => a.id === id)).filter(Boolean) as typeof AD_INVENTORY;
  const formatNames = selectedAds.map(a => `${a.name} (${a.dimensions})`).join(" + ");
  
  doc.text(`Format: ${formatNames}`, margin, y); y += 7;
  doc.text(`Duration: ${days} Days`, margin, y); y += 7;
  doc.text(`Print Bundle Included: ${printBundle ? "Yes" : "No"}`, margin, y); y += 15;

  // --- AUDIENCE STATS (The "Why Us" section) ---
  doc.setFillColor(248, 250, 252); // Very light gray bg
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

  // --- RATE BREAKDOWN ---
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
    const lineTotal = ad.baseDay * days;
    const lineText = `${formatCurrency(ad.baseDay)}/day × ${days} days`;
    doc.text(lineText, margin + 80, y);
    doc.text(formatCurrency(lineTotal), pageWidth - margin, y, { align: "right" });
    y += 8;
  });

  if (printBundle) {
    doc.setFont("helvetica", "bold");
    doc.text("Print Bundle Add-on", margin, y);
    doc.setFont("helvetica", "normal");
    const printCost = (PRINT_ADDON_MONTHLY / 30) * days;
    doc.text(`Our Time Press + Bed-Stuy Villager`, margin + 80, y);
    doc.text(formatCurrency(printCost), pageWidth - margin, y, { align: "right" });
    y += 10;
  }

  y += 5;
  doc.setDrawColor(226, 232, 240);
  doc.line(margin, y, pageWidth - margin, y);
  y += 10;

  // TOTALS
  doc.setFontSize(14);
  doc.setFont("helvetica", "bold");
  doc.text("Campaign Total", margin + 80, y);
  doc.setTextColor(accentColor);
  doc.text(formatCurrency(calc.total), pageWidth - margin, y, { align: "right" });
  
  y += 15;
  doc.setTextColor(secondaryColor);
  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  doc.text(`Estimated Impressions: ${formatNumber(calc.impressions)}`, margin, y); y += 6;
  doc.text(`Effective CPM: ${formatCurrency(calc.effectiveCPM)}`, margin, y);

  // --- FOOTER ---
  const footerY = doc.internal.pageSize.getHeight() - 20;
  doc.setFontSize(9);
  doc.setTextColor(secondaryColor);
  doc.text("Rates are example values. Contact DBG Media for custom quotes.", margin, footerY);
  doc.text(`Generated: ${format(new Date(), "MMM dd, yyyy")}`, pageWidth - margin, footerY, { align: "right" });

  // Save PDF
  const adNameSlug = selectedAds.length > 0 ? selectedAds[0].name.replace(/\s+/g, '') : 'Custom';
  const filename = `DBG_Quote_${adNameSlug}_${days}days_${format(new Date(), "yyyy-MM-dd")}.pdf`;
  doc.save(filename);
}
