import React, { useEffect } from 'react';
import { Text } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedProps,
  withTiming,
  Easing,
} from 'react-native-reanimated';

const AnimatedText = Animated.createAnimatedComponent(Text);

const AnimatedNumber = ({
  value,
  prefix = '$',
  suffix = '',
  style,
  duration = 800,
  decimals = 2,
}) => {
  const animatedValue = useSharedValue(0);

  useEffect(() => {
    animatedValue.value = withTiming(value, {
      duration,
      easing: Easing.out(Easing.cubic),
    });
  }, [value]);

  const animatedProps = useAnimatedProps(() => {
    const formatted = animatedValue.value.toFixed(decimals);
    const withCommas = parseFloat(formatted).toLocaleString('en-US', {
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals,
    });
    return {
      text: `${prefix}${withCommas}${suffix}`,
      defaultValue: `${prefix}${withCommas}${suffix}`,
    };
  });

  return <AnimatedText style={style} animatedProps={animatedProps} />;
};

export default AnimatedNumber;
