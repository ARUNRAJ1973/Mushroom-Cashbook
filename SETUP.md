# 🍄 AR Organic Cashbook - Setup Guide

## Overview

A complete React + TypeScript + Tailwind CSS frontend application for tracking daily sales of organic mushrooms. The app features:

✅ **Local State Management** - No backend required (easily extensible)
✅ **Daily Sales Tracking** - Group entries by date
✅ **Filtering & Sorting** - By month and date range  
✅ **Paid/Pending Status** - Track payment status
✅ **Summary Cards** - Real-time totals
✅ **Data Export** - CSV export functionality
✅ **Responsive Design** - Works on mobile and desktop
✅ **Clean Architecture** - Modular, reusable components

---

## ⚙️ Installation & Setup

### 1. **Install Tailwind CSS**

```bash
npm install -D tailwindcss postcss autoprefixer
npx tailwindcss init -p
```

### 2. **Configure Tailwind** (`tailwind.config.js`)

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

### 3. **Install Dependencies**

```bash
npm install
```

### 4. **Run Development Server**

```bash
npm run dev
```

The app should now be running at `http://localhost:5173`

---

## 📁 Project Structure

```
src/
├── components/
│   ├── Header.tsx                 # App header
│   ├── SummaryCards.tsx          # Top 4 summary cards
│   ├── Filters.tsx               # Month, date range filters
│   ├── Tabs.tsx                  # Sold / Pending tabs
│   ├── DaySection.tsx            # Daily grouped entries
│   ├── EntryTable.tsx            # Pending entries table
│   └── AddEntryModal.tsx         # Add entry form modal
├── pages/
│   └── Dashboard.tsx             # Main page & logic
├── utils/
│   ├── groupByDate.ts            # Group entries by date
│   ├── calculateTotals.ts        # Calculate sums
│   └── filters.ts                # Filter helpers
├── types.ts                       # TS interfaces
├── data.ts                        # Sample data
├── App.tsx                        # App component
├── App.css                        # minimal styles
├── index.css                      # Tailwind directives
└── main.tsx                       # Entry point
```

---

## 🎯 Key Features

### 1. **Data Structure**

```typescript
type CashbookEntry = {
  id: string;
  date: string;           // "2026-03-23"
  time: string;           // "10:30"
  customer: string;       // Customer name
  packs: number;          // Number of packs sold
  amount: number;         // Amount in rupees
  status: "paid" | "pending";  // Payment status
  description: string;    // Optional description
}
```

### 2. **Summary Cards (Top)**

- **Total Packs** - Sum of all packs
- **Total Amount** - Sum of all amounts
- **Total Paid** - Sum of paid amounts
- **Total Pending** - Sum of pending amounts

Updates dynamically based on filters and active tab.

### 3. **Filters & Controls**

- **Month Filter** - Dropdown of available months
- **Date Range** - From and To date inputs
- **Export** - Download filtered data as CSV
- **Clear Filters** - Reset all filters

### 4. **Tabs**

- **Sold Tab** - Shows all entries grouped by date (default view)
- **Pending Tab** - Shows only pending entries in a table format

### 5. **Daily Sections** (Sold Tab)

Each day card displays:
- Day name and formatted date
- All entries for that day with:
  - Time
  - Customer name
  - Packs
  - Amount
  - Status badge (✓ Paid / ⏳ Pending)
- Daily totals:
  - Total packs
  - Total amount
  - Paid amount
  - Pending amount

### 6. **Pending Tab**

Flat table showing:
- Time | Customer | Date | Packs | Amount | Status

### 7. **Add Entry Modal**

Fields:
- Date picker (defaults to today)
- Time picker
- Customer name
- Description (optional)
- Packs (number)
- Amount (number)
- Status dropdown (Paid / Pending)

Validation:
- All fields except description are required
- Packs and amount must be > 0

### 8. **Bottom Summary**

Shows the same totals as top, but for currently filtered data.

---

## 🔄 State Management

All state is managed using **React hooks** (`useState`, `useMemo`):

```typescript
const [entries, setEntries] = useState<CashbookEntry[]>(SAMPLE_DATA);
const [activeTab, setActiveTab] = useState<'sold' | 'pending'>('sold');
const [month, setMonth] = useState('');
const [fromDate, setFromDate] = useState('');
const [toDate, setToDate] = useState('');
```

Filtering and calculations are memoized for performance.

---

## 📊 Utility Functions

### `groupByDate(entries)`
Groups entries by date, sorted by newest first.

### `calculateTotals(entries)`
Calculates total packs, amount, paid, and pending.

### `filterByMonth(entries, month)`
Filters entries by month (format: "YYYY-MM").

### `filterByDateRange(entries, fromDate, toDate)`
Filters entries by date range (inclusive).

### `getMonthsFromEntries(entries)`
Extracts unique months from entries for dropdown.

---

## 🚀 Backend Integration (Future)

The app is structured to easily integrate with a backend:

1. **Replace `SAMPLE_DATA`** with API call:
   ```typescript
   const [entries, setEntries] = useState<CashbookEntry[]>([]);
   
   useEffect(() => {
     // Fetch from backend
     fetch('/api/entries')
       .then(res => res.json())
       .then(data => setEntries(data));
   }, []);
   ```

2. **Add entry to backend**:
   ```typescript
   const handleAddEntry = async (newEntry: Omit<CashbookEntry, 'id'>) => {
     const response = await fetch('/api/entries', {
       method: 'POST',
       body: JSON.stringify(newEntry)
     });
     // Update state...
   };
   ```

3. **All filtering logic remains the same** - client-side filtering works with any data source.

---

## 🎨 Styling

- **Tailwind CSS** for utility-first styling
- **Gradient backgrounds** for headers
- **Color-coded status badges**:
  - ✓ Paid → Green
  - ⏳ Pending → Orange
- **Responsive grid layout** for cards
- **Smooth animations** and transitions

---

## 📦 Sample Data

The app comes with 8 sample entries across 3 days:
- March 21, 2026 (2 entries)
- March 22, 2026 (3 entries)
- March 23, 2026 (3 entries)

You can modify `src/data.ts` to add/remove entries.

---

## 🛠️ Development Tips

1. **Add a new entry type field** - Update `types.ts`, then update components that display entries.

2. **Change date format** - Update `date.toLocaleDateString()` calls in components.

3. **Add more filters** - Create utility function in `utils/filters.ts`, then use it in `Dashboard.tsx`.

4. **Export to JSON** - Modify `handleExport()` in Dashboard to output JSON instead of CSV.

5. **Dark mode** - Tailwind has built-in dark mode support, add `dark:` prefixed classes.

---

## ✅ Testing Checklist

- [ ] Add a new entry
- [ ] Filter by month
- [ ] Filter by date range
- [ ] Switch to Pending tab
- [ ] Toggle between tabs
- [ ] Export data
- [ ] Check responsive layout on mobile
- [ ] Verify calculations are correct

---

## 📝 Notes

- All data is stored in local state - **refreshing the page will clear changes**
- The modal auto-closes on successful submission
- Entries are sorted by newest first within each day
- The export includes filtered data only
- Validation prevents invalid entries from being added

---

**Happy tracking! 🍄📊**
