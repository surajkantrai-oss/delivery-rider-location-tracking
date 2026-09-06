import React from 'react';
import {StyleSheet, Text, View} from 'react-native';
import type {LocationLog} from '../types/location';

export const LocationItem = ({log}: {log: LocationLog}) => (
  <View style={styles.card}>
    <Text style={styles.time}>
      {new Date(log.timestamp).toLocaleString(undefined, {
        dateStyle: 'medium',
        timeStyle: 'short',
      })}
    </Text>
    <Text style={styles.coordinate}>Lat: {log.latitude.toFixed(6)}</Text>
    <Text style={styles.coordinate}>Lng: {log.longitude.toFixed(6)}</Text>
    <Text style={styles.distance}>Distance: {log.distanceMoved.toFixed(1)} m</Text>
  </View>
);

const styles = StyleSheet.create({
  card: {
    marginHorizontal: 16,
    marginBottom: 10,
    padding: 16,
    borderRadius: 12,
    backgroundColor: '#FFFFFF',
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: '#D9DFDD',
  },
  time: {fontWeight: '700', color: '#1B2A27', marginBottom: 8},
  coordinate: {color: '#53605D', lineHeight: 20},
  distance: {color: '#176B5B', fontWeight: '600', marginTop: 5},
});
