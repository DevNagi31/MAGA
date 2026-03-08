import { useAppStore } from '../context/store';
import { DarkColors, LightColors } from '../constants/theme';

export const useColors = () => {
  const themeMode = useAppStore((s) => s.themeMode);
  return themeMode === 'light' ? LightColors : DarkColors;
};
