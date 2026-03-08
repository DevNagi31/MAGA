import HapticFeedback from 'react-native-haptic-feedback';

const options = { enableVibrateFallback: true, ignoreAndroidSystemSettings: false };

export const useHaptic = () => {
  const light = () => HapticFeedback.trigger('impactLight', options);
  const medium = () => HapticFeedback.trigger('impactMedium', options);
  const heavy = () => HapticFeedback.trigger('impactHeavy', options);
  const success = () => HapticFeedback.trigger('notificationSuccess', options);
  const warning = () => HapticFeedback.trigger('notificationWarning', options);
  const error = () => HapticFeedback.trigger('notificationError', options);
  const selection = () => HapticFeedback.trigger('selection', options);

  return { light, medium, heavy, success, warning, error, selection };
};
