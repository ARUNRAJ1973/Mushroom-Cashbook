import type { CashbookEntry } from './types';

export const SAMPLE_DATA: CashbookEntry[] = [
  {
    id: '1',
    date: '2026-03-23',
    time: '10:30',
    customer: 'Kathir',
    description: 'Button Mushrooms - Premium Grade',
    packs: 5,
    amount: 500,
    status: 'paid'
  },
  {
    id: '2',
    date: '2026-03-23',
    time: '11:15',
    customer: 'Priya',
    description: 'Oyster Mix - Fresh',
    packs: 3,
    amount: 300,
    status: 'paid'
  },
  {
    id: '3',
    date: '2026-03-23',
    time: '14:45',
    customer: 'siva',
    description: 'Shiitake - Organic',
    packs: 2,
    amount: 200,
    status: 'pending'
  },
  {
    id: '4',
    date: '2026-03-22',
    time: '09:00',
    customer: 'praveen',
    description: 'Mixed Mushrooms',
    packs: 4,
    amount: 600,
    status: 'paid'
  },
  {
    id: '5',
    date: '2026-03-22',
    time: '13:30',
    customer: 'Aravindh',
    description: 'Premium Button Mix',
    packs: 6,
    amount: 720,
    status: 'paid'
  },
  {
    id: '6',
    date: '2026-03-22',
    time: '15:20',
    customer: 'Sathish',
    description: 'Seasonal Varieties',
    packs: 3,
    amount: 450,
    status: 'pending'
  },
  {
    id: '7',
    date: '2026-03-21',
    time: '10:00',
    customer: 'Anitha',
    description: 'Farm Fresh Collection',
    packs: 2,
    amount: 280,
    status: 'paid'
  },
  {
    id: '8',
    date: '2026-03-21',
    time: '16:15',
    customer: 'mani',
    description: 'Organic Bundle Pack',
    packs: 4,
    amount: 500,
    status: 'pending'
  },
];
