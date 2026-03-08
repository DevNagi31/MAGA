import { DarkColors } from '../constants/theme';

// These are fallback static options. TabNavigator uses makeStackOptions(Colors) for dynamic theming.
export const defaultStackOptions = {
  headerStyle: {
    backgroundColor: DarkColors.bg,
  },
  headerTintColor: DarkColors.textPrimary,
  headerTitleStyle: {
    fontWeight: '600',
    fontSize: 17,
    color: DarkColors.textPrimary,
  },
  headerShadowVisible: false,
  headerBackTitle: '',
  contentStyle: {
    backgroundColor: DarkColors.bg,
  },
  animation: 'slide_from_right',
};

export const modalStackOptions = {
  ...defaultStackOptions,
  animation: 'slide_from_bottom',
  presentation: 'modal',
};
