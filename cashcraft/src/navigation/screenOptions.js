import { Colors } from '../constants/theme';

export const defaultStackOptions = {
  headerStyle: {
    backgroundColor: Colors.bg,
  },
  headerTintColor: Colors.textPrimary,
  headerTitleStyle: {
    fontWeight: '600',
    fontSize: 17,
    color: Colors.textPrimary,
  },
  headerShadowVisible: false,
  headerBackTitle: '',
  contentStyle: {
    backgroundColor: Colors.bg,
  },
  animation: 'slide_from_right',
};

export const modalStackOptions = {
  ...defaultStackOptions,
  animation: 'slide_from_bottom',
  presentation: 'modal',
};
