import React, { useRef, useEffect } from 'react';
import { View, Text, TextInput, StyleSheet, Pressable } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  Easing,
} from 'react-native-reanimated';
import { Spacing } from '../constants/theme';
import { useColors } from '../hooks/useColors';

const AmountInput = ({ value, onChange, placeholder = '0.00', autoFocus = true }) => {
  const Colors = useColors();
  const inputRef = useRef(null);
  const cursorOpacity = useSharedValue(1);

  useEffect(() => {
    cursorOpacity.value = withRepeat(
      withTiming(0, { duration: 500, easing: Easing.linear }),
      -1,
      true
    );
    if (autoFocus) {
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, []);

  const cursorStyle = useAnimatedStyle(() => ({
    opacity: cursorOpacity.value,
  }));

  const displayValue = value ? value : '';

  const styles = StyleSheet.create({
    container: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      paddingVertical: Spacing.xxl,
    },
    dollar: {
      fontSize: 32,
      fontWeight: '300',
      color: Colors.accent,
      marginRight: 4,
      marginTop: 6,
    },
    inputRow: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    amount: {
      fontSize: 56,
      fontWeight: '700',
      color: Colors.textPrimary,
      letterSpacing: -2,
    },
    placeholder: {
      color: Colors.textTertiary,
    },
    cursor: {
      width: 3,
      height: 52,
      backgroundColor: Colors.accent,
      borderRadius: 2,
      marginLeft: 2,
    },
    hiddenInput: {
      position: 'absolute',
      opacity: 0,
      width: 1,
      height: 1,
    },
  });

  return (
    <Pressable style={styles.container} onPress={() => inputRef.current?.focus()}>
      <Text style={styles.dollar}>$</Text>
      <View style={styles.inputRow}>
        <Text style={styles.amount}>
          {displayValue || <Text style={styles.placeholder}>{placeholder}</Text>}
        </Text>
        {!displayValue && <Animated.View style={[styles.cursor, cursorStyle]} />}
      </View>
      <TextInput
        ref={inputRef}
        value={value}
        onChangeText={(text) => {
          // Only allow valid decimal number
          const cleaned = text.replace(/[^0-9.]/g, '');
          const parts = cleaned.split('.');
          if (parts.length > 2) return;
          if (parts[1] && parts[1].length > 2) return;
          onChange(cleaned);
        }}
        keyboardType="decimal-pad"
        style={styles.hiddenInput}
        caretHidden
        maxLength={10}
      />
    </Pressable>
  );
};

export default AmountInput;
