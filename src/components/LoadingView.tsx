import React from 'react';
import {ActivityIndicator, StyleSheet, View} from 'react-native';

export const LoadingView = () => (
  <View style={styles.container}>
    <ActivityIndicator size="large" color="#176B5B" />
  </View>
);

const styles = StyleSheet.create({
  container: {flex: 1, alignItems: 'center', justifyContent: 'center'},
});
