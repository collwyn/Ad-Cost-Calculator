# DBG Media — Internal Ad Rate Calculator
## Replit Build Spec

---

## Stack

- **Framework**: React + Vite (static output — no SSR, no API routes required)
- **Styling**: Tailwind CSS
- **PDF generation**: `jsPDF` + `html2canvas` (client-side, no server dependency)
- **State management**: React `useState` / `useReducer` (no external store needed)
- **No auth layer** — internal tool, deploy behind Replit access control or private URL

### Deployment (Vercel or Sevalla — identical config)
```
Build command:     npm run build
Publish directory: dist
```

---

## Constants (source: Google Analytics Feb 17–Mar 16, 2026)

```js
const ANALYTICS = {
  DAILY_PAGE_VIEWS: 1350,
  MONTHLY_ACTIVE_USERS: 21000,
  DAILY_UNIQUE_READERS: 750,
  AVG_ENGAGEMENT_SEC: 18,
  DATA_PERIOD: "Feb 17 – Mar 16, 2026"
}
```

---

## Client Type Discounts

| Key | Label | Discount |
|---|---|---|
| `smb` | Small business | 0% |
| `corp` | Corporate (Net 30) | 5% |
| `nonprofit` | Nonprofit | 20% |

> Internal-facing only. Do not expose discount tiers, client labels, or pricing logic in any client-deliverable output (PDF, shareable link, embed). PDF output renders standard rate only.

---

## Ad Inventory

### Display

| ID | Name | Dimensions | Base $/day | CPM |
|---|---|---|---|---|
| `med-rect` | Medium rectangle | 300×250 | $10.80 | $8.00 |
| `leaderboard` | Leaderboard | 728×90 | $13.50 | $10.00 |
| `mobile` | Mobile banner | 320×50 | $7.20 | $5.30 |
| `half-page` | Half page | 300×600 | $16.20 | $12.00 |
| `billboard` | Billboard | 970×250 | $18.00 | $13.30 |
| `skyscraper` | Wide skyscraper | 160×600 | $9.00 | $6.70 |

### Video

| ID | Name | Dimensions | Base $/day | CPM |
|---|---|---|---|---|
| `instream` | In-stream video | Various | $27.00 | $20.00 |
| `outstream` | Outstream video | Various | $22.50 | $16.70 |

### Premium / Takeover

| ID | Name | Units | Base $/day | CPM |
|---|---|---|---|---|
| `full-takeover` | Full-site takeover | Multiple | $54.00 | $40.00 |
| `home-takeover` | Homepage takeover | Multiple | $40.50 | $30.00 |

---

## Package Tiers

Three predefined bundles. Selecting a tier auto-populates ad format, duration, and toggles. All fields remain manually editable after selection.

### Starter — $500/mo
- Ad format: `med-rect`
- Duration: 30 days
- Print bundle: off
- Target client: `smb`
- Notes: Entry-level. Single display unit. No print.

### Growth — $1,500/mo
- Ad formats: `leaderboard` + `med-rect` (multi-unit)
- Duration: 30 days
- Print bundle: on
- Target client: `smb` or `corp`
- Notes: Print + digital combo. Two display units. Activates bundle toggle.

### Premium — $3,500/mo
- Ad formats: `home-takeover` + `instream` video
- Duration: 30 days
- Print bundle: on
- Target client: `corp`
- Notes: Full homepage takeover, video pre-roll, print placement.

> Tier pricing ($500 / $1,500 / $3,500) must NOT appear in PDF output. PDF shows only itemized ad rates and campaign total.

---

## UI Components

### 1. Analytics header strip
Static display. Pull from `ANALYTICS` constants.
- Monthly active users
- Daily page views
- Avg. engagement time
- Data period label

### 2. Tier picker
Horizontal card row. Three cards: Starter / Growth / Premium. Each card shows:
- Tier name
- Monthly price
- 2–3 bullet feature summary
- "Select" button

On select:
- Highlight active card
- Auto-populate: ad format tab, ad card selection, duration slider, print toggle
- Set `tierActive = true`; any manual field change sets `tierActive = false` (deselects tier highlight, shows "custom" state)

### 3. Campaign duration slider
- Range: 7–90 days, `step="1"`
- Live readout: `N days` and derived `~N weeks`
- On change: recalculate all outputs

### 4. Client type selector
- Toggle buttons: Small business / Corporate (Net 30) / Nonprofit
- Applies discount multiplier to daily rate
- **Never rendered in PDF output**

### 5. Ad format tabs + card grid
- Tabs: Display / Video / Premium
- Each tab renders a responsive 2-column card grid
- Card fields: name, dimensions, base $/day, effective CPM, short description
- Single-select. Selected card gets accent border.
- Multi-unit tiers (Growth, Premium) highlight multiple cards simultaneously

### 6. Print bundle toggle
- Switch component
- Label: "Add print bundle — Our Time Press + Bed-Stuy Villager · +$400/mo"
- Appends `(400 / 30) * days` to campaign total
- Shown in PDF as line item: "Print placement (both papers) — $X"

### 7. Results panel
Live-updating. Fields:

| Field | Formula |
|---|---|
| Est. impressions | `DAILY_PAGE_VIEWS × days` |
| Effective CPM | `(campaignCost / impressions) × 1000` |
| Daily rate | `baseDay × (1 - discount)` |
| Daily unique readers | `ANALYTICS.DAILY_UNIQUE_READERS` (static) |
| Campaign subtotal | `dailyRate × days` |
| Print add-on | `(400 / 30) × days` if toggled |
| **Campaign total** | `subtotal + printAddOn` |

Discount badge: visible only when `discount > 0`. Shows `N% applied` label inline with total. **Excluded from PDF.**

### 8. Generate PDF button
- Visible when an ad format is selected
- Label: "Generate PDF quote"
- Behavior: see PDF spec below

---

## PDF Output Spec

Use `jsPDF` + `html2canvas` OR construct programmatically with `jsPDF` text/rect calls (preferred for precision and file size).

### What to include

```
DBG Media Group — Advertising Rate Quote
OurTimePress · ourtimepress.com

Campaign details
  Ad format:          [name] [dimensions]
  Placement type:     [Display / Video / Premium]
  Duration:           [N] days
  Print bundle:       [Yes / No]

Audience (verified Feb 17–Mar 16, 2026)
  Monthly active users:    21,000
  Daily page views:        ~1,350
  Daily unique readers:    ~750
  Avg. engagement time:    18 seconds

Rate breakdown
  Ad placement:       $[dailyRate]/day × [N] days = $[subtotal]
  Print bundle:       $[printCost]               (if applicable)
  ─────────────────────────────────────────────
  Campaign total:     $[total]

Estimated impressions:    [N]
Effective CPM:            $[cpm]

Rates are example values. Contact DBG Media for custom quotes.
Generated: [current date]
```

### What to exclude from PDF

- Client type / discount tier
- Tier names (Starter / Growth / Premium)
- Internal CPM benchmark data
- Discount badge or adjusted pricing notation
- Any reference to nonprofit or corporate pricing

### PDF filename

`DBG_Quote_[AdFormat]_[Days]days_[YYYY-MM-DD].pdf`

Example: `DBG_Quote_Leaderboard_30days_2026-03-17.pdf`

---

## Calculation Logic (reference implementation)

```js
function calculate({ adId, days, clientType, printBundle, allAds }) {
  const ad = allAds.find(a => a.id === adId)
  if (!ad) return null

  const DISCOUNTS = { smb: 0, corp: 0.05, nonprofit: 0.20 }
  const discount = DISCOUNTS[clientType]
  const dailyRate = ad.baseDay * (1 - discount)
  const subtotal = dailyRate * days
  const printAddOn = printBundle ? (400 / 30) * days : 0
  const total = subtotal + printAddOn
  const impressions = 1350 * days
  const effectiveCPM = (total / impressions) * 1000

  return {
    dailyRate: round2(dailyRate),
    subtotal: round2(subtotal),
    printAddOn: round2(printAddOn),
    total: round2(total),
    impressions,
    effectiveCPM: round2(effectiveCPM),
    discountApplied: discount
  }
}

const round2 = n => Math.round(n * 100) / 100
```

---

## Multi-unit tier handling (Growth / Premium)

Growth and Premium tiers include multiple ad units. Aggregate daily rate:

```js
const selectedAdIds = ['leaderboard', 'med-rect'] // Growth example

const totalDailyRate = selectedAdIds.reduce((sum, id) => {
  const ad = allAds.find(a => a.id === id)
  return sum + ad.baseDay * (1 - discount)
}, 0)
```

PDF line items each ad unit separately:

```
Leaderboard (728×90):     $13.50/day × 30 days = $405.00
Medium rectangle (300×250): $10.80/day × 30 days = $324.00
Print bundle:                                       $400.00
──────────────────────────────────────────────────────────
Campaign total:                                   $1,129.00
```

---

## Suggested improvements over v1

- **Tier picker** auto-populates all fields; manual edits break tier selection gracefully (no hard reset)
- **Multi-select ad cards** for Growth/Premium tiers; single-select for custom/Starter
- **Duration presets** (7d / 14d / 30d / 60d / 90d) as quick-tap chips above the slider
- **Impression projections chart** — simple bar showing impressions at selected duration vs. 30/60/90 day options (Chart.js or Recharts, single-axis bar, 3 bars)
- **Copy-to-clipboard** button alongside PDF: copies plain-text summary for Slack/email use internally
- **Reset button** clears all selections back to default state
- **Tooltip on CPM field** explaining market context: "Display avg: $3–$12 · Video avg: $10–$25 (2026 benchmarks)"
- **No routing needed** — single-page tool, no URL params required
- **Responsive**: usable on tablet (minimum 768px); not required on mobile

---

## File structure suggestion

```
/app (or /src)
  /components
    AnalyticsStrip.jsx
    TierPicker.jsx
    DurationControl.jsx
    ClientTypeSelector.jsx
    AdFormatTabs.jsx
    AdCard.jsx
    PrintBundleToggle.jsx
    ResultsPanel.jsx
    GeneratePDFButton.jsx
  /lib
    constants.js        ← ANALYTICS, AD_INVENTORY, TIERS, DISCOUNTS
    calculate.js        ← pure calculation functions
    generatePDF.js      ← jsPDF document construction
  /app (Next.js) or App.jsx (Vite)
```

---

## Dependencies

```json
{
  "jspdf": "^2.5.1",
  "html2canvas": "^1.4.1"
}
```

> Prefer constructing PDF programmatically via `jsPDF` text/rect calls over `html2canvas` screenshot method. Screenshot method produces larger files and is sensitive to font rendering. Use `html2canvas` only as fallback for complex layout sections.

---

*Internal tool — not for client distribution. DBG Media Group, 2026.*
