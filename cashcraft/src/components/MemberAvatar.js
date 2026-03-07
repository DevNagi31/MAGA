import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Radius } from '../constants/theme';

const MemberAvatar = ({ name = '', color = '#34D399', size = 36 }) => {
  const initial = name.charAt(0).toUpperCase();

  return (
    <View
      style={[
        styles.avatar,
        {
          width: size,
          height: size,
          borderRadius: size / 2,
          backgroundColor: `${color}22`,
          borderColor: color,
        },
      ]}
    >
      <Text style={[styles.initial, { fontSize: size * 0.38, color }]}>{initial}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  avatar: {
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
  },
  initial: {
    fontWeight: '700',
  },
});

export default MemberAvatar;
