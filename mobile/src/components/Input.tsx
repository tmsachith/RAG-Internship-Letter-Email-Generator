import React from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TextInputProps,
} from 'react-native';
import { COLORS, SPACING } from '../utils/constants';

interface InputProps extends TextInputProps {
  label?: string;
  error?: string;
}

export const Input: React.FC<InputProps> = ({
  label,
  error,
  secureTextEntry,
  multiline,
  editable,
  autoCorrect,
  autoFocus,
  allowFontScaling,
  caretHidden,
  contextMenuHidden,
  selectTextOnFocus,
  showSoftInputOnFocus,
  spellCheck,
  ...props
}) => {
  return (
    <View style={styles.container}>
      {label && <Text style={styles.label}>{label}</Text>}
      <TextInput
        style={[styles.input, error && styles.inputError]}
        placeholderTextColor={COLORS.textSecondary}
        secureTextEntry={secureTextEntry === true}
        multiline={multiline === true}
        editable={editable !== false}
        autoCorrect={autoCorrect === true}
        autoFocus={autoFocus === true}
        allowFontScaling={allowFontScaling !== false}
        caretHidden={caretHidden === true}
        contextMenuHidden={contextMenuHidden === true}
        selectTextOnFocus={selectTextOnFocus === true}
        showSoftInputOnFocus={showSoftInputOnFocus !== false}
        spellCheck={spellCheck === true}
        {...props}
      />
      {error && <Text style={styles.errorText}>{error}</Text>}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: SPACING.md,
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
    marginBottom: SPACING.xs,
    color: COLORS.text,
  },
  input: {
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 8,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm + 4,
    fontSize: 16,
    backgroundColor: COLORS.background,
    color: COLORS.text,
  },
  inputError: {
    borderColor: COLORS.danger,
  },
  errorText: {
    color: COLORS.danger,
    fontSize: 12,
    marginTop: SPACING.xs,
  },
});
