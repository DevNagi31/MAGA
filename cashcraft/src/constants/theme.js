export const DarkColors = {
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

export const LightColors = {
  bg: '#F2F2F7',
  card: '#FFFFFF',
  cardElevated: '#F2F2F7',
  glass: 'rgba(0,0,0,0.02)',
  glassBorder: 'rgba(0,0,0,0.06)',
  textPrimary: '#1C1C1E',
  textSecondary: '#6C6C70',
  textTertiary: '#AEAEB2',
  accent: '#10B981',
  accentDim: 'rgba(16,185,129,0.10)',
  success: '#10B981',
  warning: '#D97706',
  danger: '#DC2626',
  info: '#2563EB',
  border: 'rgba(0,0,0,0.08)',
  borderMuted: 'rgba(0,0,0,0.04)',
};

export const Colors = {
  // Backgrounds
  bg: '#050505',
  card: '#111111',
  cardElevated: '#1A1A1A',
  glass: 'rgba(255, 255, 255, 0.04)',
  glassBorder: 'rgba(255, 255, 255, 0.08)',

  // Text
  textPrimary: '#F5F5F7',
  textSecondary: '#8E8E93',
  textTertiary: '#636366',

  // Accent
  accent: '#34D399',
  accentDim: 'rgba(52, 211, 153, 0.15)',

  // Status
  success: '#34D399',
  warning: '#FBBF24',
  danger: '#EF4444',
  info: '#60A5FA',

  // Borders
  border: 'rgba(255, 255, 255, 0.06)',
  borderMuted: 'rgba(255, 255, 255, 0.04)',
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

export const CategoryIcons = {
  food: 'coffee',
  transport: 'navigation',
  entertainment: 'film',
  rent: 'home',
  shopping: 'shopping-bag',
  subscriptions: 'repeat',
  utilities: 'zap',
  other: 'more-horizontal',
};

export const BudgetBuckets = {
  needs: ['food', 'transport', 'rent', 'utilities'],
  wants: ['entertainment', 'shopping', 'subscriptions', 'other'],
  savings: [],
};

export const Spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  base: 16,
  lg: 20,
  xl: 24,
  xxl: 32,
  xxxl: 48,
};

export const Radius = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  full: 999,
};

export const Typography = {
  hero: { fontSize: 48, fontWeight: '800', color: Colors.textPrimary },
  largeTitle: { fontSize: 34, fontWeight: '700', color: Colors.textPrimary },
  title: { fontSize: 28, fontWeight: '700', color: Colors.textPrimary },
  headline: { fontSize: 20, fontWeight: '600', color: Colors.textPrimary },
  subheadline: { fontSize: 17, fontWeight: '600', color: Colors.textPrimary },
  body: { fontSize: 15, fontWeight: '400', color: Colors.textPrimary },
  caption: { fontSize: 13, fontWeight: '400', color: Colors.textSecondary },
  captionSmall: { fontSize: 11, fontWeight: '400', color: Colors.textTertiary },
};

export const CATEGORIES = [
  { id: 'food', label: 'Food', icon: 'coffee', color: CategoryColors.food },
  { id: 'transport', label: 'Transport', icon: 'navigation', color: CategoryColors.transport },
  { id: 'entertainment', label: 'Fun', icon: 'film', color: CategoryColors.entertainment },
  { id: 'rent', label: 'Rent', icon: 'home', color: CategoryColors.rent },
  { id: 'shopping', label: 'Shopping', icon: 'shopping-bag', color: CategoryColors.shopping },
  { id: 'subscriptions', label: 'Subs', icon: 'repeat', color: CategoryColors.subscriptions },
  { id: 'utilities', label: 'Utilities', icon: 'zap', color: CategoryColors.utilities },
  { id: 'other', label: 'Other', icon: 'more-horizontal', color: CategoryColors.other },
];

export const BUDGET_RULES = [
  {
    id: '50-30-20',
    label: '50/30/20',
    description: 'Balanced',
    needs: 50,
    wants: 30,
    savings: 20,
  },
  {
    id: '60-20-20',
    label: '60/20/20',
    description: 'Needs-heavy',
    needs: 60,
    wants: 20,
    savings: 20,
  },
  {
    id: '70-20-10',
    label: '70/20/10',
    description: 'Survival mode',
    needs: 70,
    wants: 20,
    savings: 10,
  },
  {
    id: 'custom',
    label: 'Custom',
    description: 'You decide',
    needs: null,
    wants: null,
    savings: null,
  },
];
