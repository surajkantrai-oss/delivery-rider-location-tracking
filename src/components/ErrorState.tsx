import React from 'react';
import {Pressable, StyleSheet, Text, View} from 'react-native';

export const ErrorState = ({message, onRetry}: {message: string; onRetry: () => void}) => (
  <View style={styles.container}>
    <Text style={styles.message}>{message}</Text>
    <Pressable onPress={onRetry} style={styles.button}>
      <Text style={styles.buttonText}>Retry</Text>
    </Pressable>
  </View>
);

const styles = StyleSheet.create({
  container: {alignItems: 'center', padding: 24},
  message: {color: '#A13030', textAlign: 'center'},
  button: {marginTop: 12, paddingHorizontal: 20, paddingVertical: 9},
  buttonText: {color: '#176B5B', fontWeight: '700'},
});
