import ReactNativeHapticFeedback from 'react-native-haptic-feedback';

const options = { enableVibrateFallback: true, ignoreAndroidSystemSettings: false };

export const useHaptic = () => {
  const light = () => ReactNativeHapticFeedback.trigger('impactLight', options);
  const medium = () => ReactNativeHapticFeedback.trigger('impactMedium', options);
  const heavy = () => ReactNativeHapticFeedback.trigger('impactHeavy', options);
  const success = () => ReactNativeHapticFeedback.trigger('notificationSuccess', options);
  const warning = () => ReactNativeHapticFeedback.trigger('notificationWarning', options);
  const error = () => ReactNativeHapticFeedback.trigger('notificationError', options);
  const selection = () => ReactNativeHapticFeedback.trigger('selection', options);

  return { light, medium, heavy, success, warning, error, selection };
};
