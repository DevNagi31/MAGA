import React, { useEffect } from 'react';
import { View, Text, StyleSheet, Dimensions } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withDelay,
  withSpring,
  Easing,
} from 'react-native-reanimated';
import LinearGradient from 'react-native-linear-gradient';
import Feather from '@react-native-vector-icons/feather';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Spacing, Radius } from '../../constants/theme';
import PremiumButton from '../../components/PremiumButton';
import { useColors } from '../../hooks/useColors';

const { width, height } = Dimensions.get('window');

export default function WelcomeScreen({ navigation }) {
  const Colors = useColors();
  const insets = useSafeAreaInsets();
  const logoScale = useSharedValue(0.6);
  const logoOpacity = useSharedValue(0);
  const taglineOpacity = useSharedValue(0);
  const taglineY = useSharedValue(20);
  const buttonOpacity = useSharedValue(0);
  const buttonY = useSharedValue(30);

  useEffect(() => {
    logoScale.value = withSpring(1, { damping: 12, stiffness: 100 });
    logoOpacity.value = withTiming(1, { duration: 600 });
    taglineOpacity.value = withDelay(400, withTiming(1, { duration: 600 }));
    taglineY.value = withDelay(400, withSpring(0, { damping: 15 }));
    buttonOpacity.value = withDelay(800, withTiming(1, { duration: 600 }));
    buttonY.value = withDelay(800, withSpring(0, { damping: 15 }));
  }, []);

  const logoStyle = useAnimatedStyle(() => ({
    transform: [{ scale: logoScale.value }],
    opacity: logoOpacity.value,
  }));

  const taglineStyle = useAnimatedStyle(() => ({
    opacity: taglineOpacity.value,
    transform: [{ translateY: taglineY.value }],
  }));

  const buttonStyle = useAnimatedStyle(() => ({
    opacity: buttonOpacity.value,
    transform: [{ translateY: buttonY.value }],
  }));

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: Colors.bg,
      paddingHorizontal: Spacing.xl,
    },
    glow: {
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      height: height * 0.4,
    },
    content: {
      flex: 1,
      justifyContent: 'center',
      gap: Spacing.xxl,
    },
    logoSection: {
      alignItems: 'center',
      gap: Spacing.base,
    },
    iconRing: {
      width: 90,
      height: 90,
      borderRadius: 26,
      overflow: 'hidden',
      shadowColor: Colors.accent,
      shadowOffset: { width: 0, height: 8 },
      shadowOpacity: 0.4,
      shadowRadius: 20,
      elevation: 12,
    },
    iconGradient: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
    },
    appName: {
      fontSize: 40,
      fontWeight: '800',
      color: Colors.textPrimary,
      letterSpacing: -1.5,
    },
    tagline: {
      fontSize: 42,
      fontWeight: '800',
      color: Colors.textPrimary,
      letterSpacing: -1.5,
      lineHeight: 50,
    },
    subtitle: {
      fontSize: 16,
      color: Colors.textSecondary,
      marginTop: Spacing.base,
      lineHeight: 24,
    },
    buttonSection: {
      paddingBottom: Spacing.xl,
      gap: Spacing.md,
      alignItems: 'center',
    },
    footnote: {
      fontSize: 13,
      color: Colors.textTertiary,
    },
  });

  return (
    <View style={[styles.container, { paddingTop: insets.top, paddingBottom: insets.bottom }]}>
      <LinearGradient
        colors={['rgba(52, 211, 153, 0.06)', 'transparent']}
        style={styles.glow}
      />

      <View style={styles.content}>
        <Animated.View style={[styles.logoSection, logoStyle]}>
          <View style={styles.iconRing}>
            <LinearGradient
              colors={['#34D399', '#10B981']}
              style={styles.iconGradient}
            >
              <Feather name="dollar-sign" size={36} color="#050505" />
            </LinearGradient>
          </View>
          <Text style={styles.appName}>CashCraft</Text>
        </Animated.View>

        <Animated.View style={taglineStyle}>
          <Text style={styles.tagline}>Smart money.</Text>
          <Text style={styles.tagline}>Split smart.</Text>
          <Text style={styles.subtitle}>
            Track expenses, split bills, and master your budget — all in one place.
          </Text>
        </Animated.View>
      </View>

      <Animated.View style={[styles.buttonSection, buttonStyle]}>
        <PremiumButton
          label="Get Started"
          onPress={() => navigation.navigate('Salary')}
        />
        <Text style={styles.footnote}>Takes 30 seconds to set up</Text>
      </Animated.View>
    </View>
  );
}
