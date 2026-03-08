import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { BUDGET_RULES } from '../constants/theme';

// ─── Seed Demo Data ───────────────────────────────────────────────────────────
const now = new Date();
const d = (daysAgo, hour = 12) => {
  const date = new Date(now);
  date.setDate(date.getDate() - daysAgo);
  date.setHours(hour, 0, 0, 0);
  return date.toISOString();
};

const SEED_EXPENSES = [
  { id: 'e1', amount: 24.50, category: 'food', description: 'Chipotle lunch', date: d(0, 13), createdAt: d(0, 13) },
  { id: 'e2', amount: 4.75, category: 'food', description: 'Morning coffee', date: d(0, 8), createdAt: d(0, 8) },
  { id: 'e3', amount: 45.00, category: 'transport', description: 'Uber rides', date: d(1, 19), createdAt: d(1, 19) },
  { id: 'e4', amount: 12.99, category: 'subscriptions', description: 'Spotify Premium', date: d(2, 10), createdAt: d(2, 10) },
  { id: 'e5', amount: 89.90, category: 'shopping', description: 'ASOS order', date: d(3, 15), createdAt: d(3, 15) },
  { id: 'e6', amount: 67.20, category: 'food', description: 'Weekly groceries', date: d(4, 11), createdAt: d(4, 11) },
  { id: 'e7', amount: 15.00, category: 'entertainment', description: 'Movie tickets', date: d(5, 20), createdAt: d(5, 20) },
  { id: 'e8', amount: 850.00, category: 'rent', description: 'Monthly rent', date: d(6, 9), createdAt: d(6, 9) },
  { id: 'e9', amount: 38.00, category: 'utilities', description: 'Electric bill', date: d(7, 14), createdAt: d(7, 14) },
  { id: 'e10', amount: 22.00, category: 'food', description: 'Thai takeout', date: d(8, 19), createdAt: d(8, 19) },
  { id: 'e11', amount: 9.99, category: 'subscriptions', description: 'Apple Music', date: d(9, 10), createdAt: d(9, 10) },
  { id: 'e12', amount: 55.40, category: 'shopping', description: 'Target run', date: d(10, 16), createdAt: d(10, 16) },
  { id: 'e13', amount: 18.50, category: 'food', description: 'Sushi dinner', date: d(11, 18), createdAt: d(11, 18) },
  { id: 'e14', amount: 30.00, category: 'transport', description: 'Gas station', date: d(12, 12), createdAt: d(12, 12) },
  { id: 'e15', amount: 14.99, category: 'subscriptions', description: 'Netflix', date: d(13, 10), createdAt: d(13, 10) },
];

const SEED_MEMBERS_ALPHA = [
  { id: 'm1', name: 'Alex', color: '#34D399', zelleId: 'alex@gmail.com' },
  { id: 'm2', name: 'Jordan', color: '#60A5FA', zelleId: '+1 (646) 555-0182' },
  { id: 'm3', name: 'Sam', color: '#F97316', zelleId: '+1 (917) 555-0134' },
];

const SEED_MEMBERS_BETA = [
  { id: 'm4', name: 'Me', color: '#34D399', zelleId: 'demo@cashcraft.app' },
  { id: 'm5', name: 'Riley', color: '#A78BFA', zelleId: 'riley@icloud.com' },
];

const SEED_GROUPS = [
  {
    id: 'g1',
    name: 'NYC Trip',
    members: SEED_MEMBERS_ALPHA,
    bills: [
      {
        id: 'b1',
        description: 'Hotel Night 1',
        amount: 240.00,
        paidBy: 'm1',
        splits: [
          { memberId: 'm1', amount: 80.00 },
          { memberId: 'm2', amount: 80.00 },
          { memberId: 'm3', amount: 80.00 },
        ],
        date: d(5),
        settled: false,
      },
      {
        id: 'b2',
        description: 'Dinner at Nobu',
        amount: 186.00,
        paidBy: 'm2',
        splits: [
          { memberId: 'm1', amount: 62.00 },
          { memberId: 'm2', amount: 62.00 },
          { memberId: 'm3', amount: 62.00 },
        ],
        date: d(4),
        settled: false,
      },
      {
        id: 'b3',
        description: 'Uber to JFK',
        amount: 54.00,
        paidBy: 'm3',
        splits: [
          { memberId: 'm1', amount: 18.00 },
          { memberId: 'm2', amount: 18.00 },
          { memberId: 'm3', amount: 18.00 },
        ],
        date: d(3),
        settled: false,
      },
    ],
    createdAt: d(7),
  },
  {
    id: 'g2',
    name: 'Apartment',
    members: SEED_MEMBERS_BETA,
    bills: [
      {
        id: 'b4',
        description: 'Groceries',
        amount: 120.00,
        paidBy: 'm4',
        splits: [
          { memberId: 'm4', amount: 60.00 },
          { memberId: 'm5', amount: 60.00 },
        ],
        date: d(2),
        settled: false,
      },
    ],
    createdAt: d(30),
  },
];

// ─── App Store ────────────────────────────────────────────────────────────────
export const useAppStore = create(
  persist(
    (set) => ({
      isOnboarded: false,
      setOnboarded: (value) => set({ isOnboarded: value }),
      themeMode: 'dark',
      setThemeMode: (mode) => set({ themeMode: mode }),
    }),
    {
      name: 'cashcraft-app',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);

// ─── Budget Store ─────────────────────────────────────────────────────────────
export const useBudgetStore = create(
  persist(
    (set, get) => ({
      salary: 4500,
      budgetRule: BUDGET_RULES[0],
      customAllocations: { needs: 50, wants: 30, savings: 20 },

      setSalary: (salary) => set({ salary }),
      setBudgetRule: (rule) => set({ budgetRule: rule }),
      setCustomAllocations: (allocs) => set({ customAllocations: allocs }),

      getBudgetAllocations: () => {
        const { salary, budgetRule, customAllocations } = get();
        const rule = budgetRule.id === 'custom' ? customAllocations : budgetRule;
        return {
          needs: (salary * rule.needs) / 100,
          wants: (salary * rule.wants) / 100,
          savings: (salary * rule.savings) / 100,
        };
      },
    }),
    {
      name: 'cashcraft-budget',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);

// ─── Expense Store ────────────────────────────────────────────────────────────
export const useExpenseStore = create(
  persist(
    (set, get) => ({
      expenses: SEED_EXPENSES,

      addExpense: (expense) =>
        set((state) => ({
          expenses: [
            {
              id: `e-${Date.now()}`,
              createdAt: new Date().toISOString(),
              ...expense,
            },
            ...state.expenses,
          ],
        })),

      deleteExpense: (id) =>
        set((state) => ({
          expenses: state.expenses.filter((e) => e.id !== id),
        })),

      getMonthlyExpenses: () => {
        const { expenses } = get();
        const now = new Date();
        return expenses.filter((e) => {
          const d = new Date(e.date);
          return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
        });
      },

      getTotalSpent: () => {
        const monthly = get().getMonthlyExpenses();
        return monthly.reduce((sum, e) => sum + e.amount, 0);
      },

      getExpensesByCategory: () => {
        const monthly = get().getMonthlyExpenses();
        const map = {};
        monthly.forEach((e) => {
          if (!map[e.category]) map[e.category] = 0;
          map[e.category] += e.amount;
        });
        return map;
      },
    }),
    {
      name: 'cashcraft-expenses',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);

// ─── Group Store ──────────────────────────────────────────────────────────────
export const useGroupStore = create(
  persist(
    (set, get) => ({
      groups: SEED_GROUPS,

      addGroup: (group) =>
        set((state) => ({
          groups: [
            {
              id: `g-${Date.now()}`,
              createdAt: new Date().toISOString(),
              bills: [],
              ...group,
            },
            ...state.groups,
          ],
        })),

      deleteGroup: (id) =>
        set((state) => ({
          groups: state.groups.filter((g) => g.id !== id),
        })),

      addBillToGroup: (groupId, bill) =>
        set((state) => ({
          groups: state.groups.map((g) =>
            g.id === groupId
              ? {
                  ...g,
                  bills: [
                    ...g.bills,
                    {
                      id: `b-${Date.now()}`,
                      date: new Date().toISOString(),
                      settled: false,
                      ...bill,
                    },
                  ],
                }
              : g
          ),
        })),

      settleBill: (groupId, billId) =>
        set((state) => ({
          groups: state.groups.map((g) =>
            g.id === groupId
              ? {
                  ...g,
                  bills: g.bills.map((b) =>
                    b.id === billId ? { ...b, settled: true } : b
                  ),
                }
              : g
          ),
        })),

      settleAllDebts: (groupId) =>
        set((state) => ({
          groups: state.groups.map((g) =>
            g.id === groupId
              ? { ...g, bills: g.bills.map((b) => ({ ...b, settled: true })) }
              : g
          ),
        })),

      getGroupById: (id) => get().groups.find((g) => g.id === id),
    }),
    {
      name: 'cashcraft-groups',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);

// ─── OCR Store ────────────────────────────────────────────────────────────────
export const useOCRStore = create((set) => ({
  scannedItems: [],
  scanTotal: 0,
  isScanning: false,
  scanProgress: 0,

  setScannedItems: (items, total) => set({ scannedItems: items, scanTotal: total }),
  setIsScanning: (val) => set({ isScanning: val }),
  setScanProgress: (val) => set({ scanProgress: val }),
  clearScan: () => set({ scannedItems: [], scanTotal: 0, isScanning: false, scanProgress: 0 }),
}));
