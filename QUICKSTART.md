# 🍄 AR Organic Cashbook - Quick Start

## Installation (One-Time Setup)

### Step 1: Install Tailwind CSS
```bash
npm install -D tailwindcss postcss autoprefixer
npx tailwindcss init -p
```

### Step 2: Configure tailwind.config.js
Replace the content of `tailwind.config.js` with:

```javascript
/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {},
  },
  plugins: [],
}
```

### Step 3: Install Dependencies
```bash
npm install
```

## Running the App

```bash
npm run dev
```

Open http://localhost:5173 in your browser.

---

## 📋 Features at a Glance

### Top Section
- **4 Summary Cards** showing Total Packs, Total Amount, Paid Amount, Pending Amount

### Filter Section
- Filter by month (dropdown)
- Filter by date range (from - to dates)
- Export data as CSV
- Clear all filters

### Tab Navigation
- **Sold Tab** (default) - Shows entries grouped by date
- **Pending Tab** - Shows only pending entries in a table

### Daily Sections (Sold Tab)
- Date header with add entry button
- List of entries with:
  - Time | Customer | Packs | Amount | Status
- Daily totals showing packs, total amount, paid, pending

### Add Entry Modal
Open by clicking "+ Add Entry" anywhere on the page
- Date picker
- Time picker  
- Customer name
- Description (optional)
- Packs (number)
- Amount (rupees)
- Status (Paid / Pending)

### Bottom Summary
Same totals as the top, but for filtered data only

---

## 🎮 Usage Example

1. **View Sales**: App loads with sample data grouped by date
2. **Add New Entry**: Click "+ Add Entry", fill form, submit
3. **Filter Data**: Select month or date range
4. **Check Pending**: Click "Pending" tab to see unpaid entries
5. **Export**: Click "Export" to download as CSV

---

## 📖 File Structure

```
src/
├── components/           # Reusable UI components
│   ├── Header.tsx       # App header with title
│   ├── SummaryCards.tsx # Top 4 cards
│   ├── Filters.tsx      # Filter controls
│   ├── Tabs.tsx         # Tab navigation
│   ├── DaySection.tsx   # Daily grouped entries
│   ├── EntryTable.tsx   # Pending tab table
│   └── AddEntryModal.tsx # Entry form
├── pages/               # Page components
│   └── Dashboard.tsx    # Main page with logic
├── utils/               # Helper functions
│   ├── groupByDate.ts   # Group entries by date
│   ├── calculateTotals.ts # Calculate sums
│   └── filters.ts       # Filter functions
├── types.ts             # TypeScript interfaces
├── data.ts              # Sample data
└── App.tsx              # Root component
```

---

## ✨ Key Data Structure

Each entry has:
```typescript
{
  id: string              // Unique ID
  date: "2026-03-23"      // Date
  time: "10:30"           // Time (24h format)
  customer: "Name"        // Customer name
  packs: 5                // Number of packs
  amount: 500             // Amount in rupees
  status: "paid"          // "paid" or "pending"
  description: "..."      // Optional description
}
```

---

## 🔧 Troubleshooting

**Issue**: Tailwind styles not showing
- Make sure you ran `npx tailwindcss init -p`
- Check that `tailwind.config.js` has correct content paths
- Make sure `index.css` has the @tailwind directives
- Clear browser cache and restart dev server

**Issue**: Import errors
- Run `npm install` again
- Delete `node_modules` and `package-lock.json`, then reinstall

**Issue**: TypeScript errors
- Make sure `types.ts` is in `src/` root
- Verify all import paths are correct

---

## 🚀 Next Steps (Backend Integration)

To connect to a backend (Supabase, Firebase, etc.):

1. Replace SAMPLE_DATA with API fetch in `src/pages/Dashboard.tsx`
2. Add async function to fetch entries on component mount
3. Update `handleAddEntry()` to POST to backend
4. All filtering and display logic remains the same

---

## 📝 Sample Data

The app includes 8 sample entries across 3 days:
- **March 21, 2026**: 2 entries
- **March 22, 2026**: 3 entries  
- **March 23, 2026**: 3 entries

Mix of paid and pending entries for demo purposes.

---

**You're all set! Start tracking sales! 🍄**
