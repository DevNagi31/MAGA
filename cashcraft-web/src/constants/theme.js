export const Colors = {
  bg: '#050505',
  card: '#111111',
  cardElevated: '#1A1A1A',
  glass: 'rgba(255,255,255,0.04)',
  glassBorder: 'rgba(255,255,255,0.08)',
  textPrimary: '#F5F5F7',
  textSecondary: '#8E8E93',
  textTertiary: '#636366',
  accent: '#34D399',
  accentDim: 'rgba(52,211,153,0.15)',
  success: '#34D399',
  warning: '#FBBF24',
  danger: '#EF4444',
  info: '#60A5FA',
  border: 'rgba(255,255,255,0.06)',
  borderMuted: 'rgba(255,255,255,0.04)',
};

export const CategoryColors = {
  food: '#F97316',
  transport: '#60A5FA',
  entertainment: '#A78BFA',
  rent: '#F472B6',
  shopping: '#FBBF24',
  subscriptions: '#34D399',
  utilities: '#6EE7B7',
  other: '#8E8E93',
};

export const BudgetBuckets = {
  needs: ['food', 'transport', 'rent', 'utilities'],
  wants: ['entertainment', 'shopping', 'subscriptions', 'other'],
  savings: [],
};

export const CATEGORIES = [
  { id: 'food', label: 'Food', icon: 'Coffee', color: CategoryColors.food },
  { id: 'transport', label: 'Transport', icon: 'Navigation', color: CategoryColors.transport },
  { id: 'entertainment', label: 'Fun', icon: 'Film', color: CategoryColors.entertainment },
  { id: 'rent', label: 'Rent', icon: 'Home', color: CategoryColors.rent },
  { id: 'shopping', label: 'Shopping', icon: 'ShoppingBag', color: CategoryColors.shopping },
  { id: 'subscriptions', label: 'Subs', icon: 'Repeat', color: CategoryColors.subscriptions },
  { id: 'utilities', label: 'Utilities', icon: 'Zap', color: CategoryColors.utilities },
  { id: 'other', label: 'Other', icon: 'MoreHorizontal', color: CategoryColors.other },
];

export const BUDGET_RULES = [
  { id: '50-30-20', label: '50/30/20', description: 'Balanced', needs: 50, wants: 30, savings: 20 },
  { id: '60-20-20', label: '60/20/20', description: 'Needs-heavy', needs: 60, wants: 20, savings: 20 },
  { id: '70-20-10', label: '70/20/10', description: 'Survival mode', needs: 70, wants: 20, savings: 10 },
];

export const MEMBER_COLORS = [
  '#34D399', '#60A5FA', '#F97316', '#A78BFA',
  '#F472B6', '#FBBF24', '#6EE7B7', '#EF4444',
];
