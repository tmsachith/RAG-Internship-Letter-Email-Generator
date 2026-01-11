import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { COLORS, SPACING } from '../utils/constants';

interface AlertProps {
  type: 'success' | 'error' | 'warning' | 'info';
  message: string;
  description?: string;
}

export const Alert: React.FC<AlertProps> = ({ type, message, description }) => {
  const getColor = () => {
    switch (type) {
      case 'success':
        return COLORS.secondary;
      case 'error':
        return COLORS.danger;
      case 'warning':
        return COLORS.warning;
      default:
        return COLORS.primary;
    }
  };

  return (
    <View style={[styles.container, { borderLeftColor: getColor() }]}>
      <Text style={styles.message}>{message}</Text>
      {description && <Text style={styles.description}>{description}</Text>}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: COLORS.backgroundSecondary,
    borderLeftWidth: 4,
    borderRadius: 8,
    padding: SPACING.md,
    marginVertical: SPACING.sm,
  },
  message: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: 4,
  },
  description: {
    fontSize: 14,
    color: COLORS.textSecondary,
  },
});
