import React from 'react';
import { View, StyleSheet } from 'react-native';
import { useColors } from '../hooks/useColors';

export default function OnboardingDots({ total, current }) {
  const Colors = useColors();

  const styles = StyleSheet.create({
    row: {
      flexDirection: 'row',
      gap: 6,
      alignItems: 'center',
      justifyContent: 'center',
    },
    dot: {
      height: 6,
      borderRadius: 3,
    },
    dotActive: {
      width: 20,
      backgroundColor: Colors.accent,
    },
    dotInactive: {
      width: 6,
      backgroundColor: Colors.textTertiary,
      opacity: 0.4,
    },
  });

  return (
    <View style={styles.row}>
      {Array.from({ length: total }).map((_, i) => (
        <View
          key={i}
          style={[
            styles.dot,
            i === current ? styles.dotActive : styles.dotInactive,
          ]}
        />
      ))}
    </View>
  );
}
