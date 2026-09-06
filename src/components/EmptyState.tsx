import React from 'react';
import {StyleSheet, Text, View} from 'react-native';

export const EmptyState = () => (
  <View style={styles.container}>
    <Text style={styles.title}>No locations yet</Text>
    <Text style={styles.body}>Go On Duty to begin recording your route.</Text>
  </View>
);

const styles = StyleSheet.create({
  container: {alignItems: 'center', padding: 32},
  title: {fontSize: 18, fontWeight: '600', color: '#1B2A27'},
  body: {marginTop: 6, color: '#64706D', textAlign: 'center'},
});
