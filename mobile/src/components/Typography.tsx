import React from 'react';
import { Text as RNText, TextProps as RNTextProps, StyleSheet, TextInput as RNTextInput, TextInputProps as RNTextInputProps } from 'react-native';
import { FONTS } from '../utils/constants';

// Custom Text component with default font
export const Text: React.FC<RNTextProps> = ({ style, ...props }) => {
  return <RNText style={[styles.defaultText, style]} {...props} />;
};

// Custom TextInput component with default font
export const TextInput: React.FC<RNTextInputProps> = ({ style, ...props }) => {
  return <RNTextInput style={[styles.defaultText, style]} {...props} />;
};

const styles = StyleSheet.create({
  defaultText: {
    fontFamily: FONTS.regular,
  },
});
