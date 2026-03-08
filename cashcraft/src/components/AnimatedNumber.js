import React, { useState, useEffect } from 'react';
import { Text } from 'react-native';
import {
  useSharedValue,
  withTiming,
  useAnimatedReaction,
  runOnJS,
  Easing,
} from 'react-native-reanimated';

const AnimatedNumber = ({ value, prefix = '$', suffix = '', style, duration = 800, decimals = 2 }) => {
  const animatedValue = useSharedValue(0);
  const [display, setDisplay] = useState(0);

  useAnimatedReaction(
    () => animatedValue.value,
    (v) => { runOnJS(setDisplay)(v); }
  );

  useEffect(() => {
    animatedValue.value = withTiming(value, { duration, easing: Easing.out(Easing.cubic) });
  }, [value]);

  const formatted = display.toFixed(decimals);
  const withCommas = parseFloat(formatted).toLocaleString('en-US', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });

  return <Text style={style}>{prefix}{withCommas}{suffix}</Text>;
};

export default AnimatedNumber;
