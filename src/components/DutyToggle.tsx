import React from 'react';
import {ActivityIndicator, StyleSheet, Switch, Text, View} from 'react-native';

type Props = {
  onDuty: boolean;
  busy: boolean;
  onToggle: () => void;
};

export function DutyToggle({onDuty, busy, onToggle}: Props) {
  return (
    <View style={[styles.card, onDuty && styles.activeCard]}>
      <View>
        <Text style={styles.label}>CURRENT STATUS</Text>
        <Text style={[styles.status, onDuty && styles.activeText]}>
          {onDuty ? 'ON DUTY' : 'OFF DUTY'}
        </Text>
      </View>
      {busy ? (
        <ActivityIndicator color="#176B5B" />
      ) : (
        <Switch
          value={onDuty}
          onValueChange={onToggle}
          disabled={busy}
          accessibilityLabel={onDuty ? 'Go Off Duty' : 'Go On Duty'}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    margin: 16,
    padding: 18,
    borderRadius: 14,
    backgroundColor: '#F1F3F2',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E2E7E5',
  },
  activeCard: {backgroundColor: '#E5F4EF', borderColor: '#A8D9CB'},
  label: {fontSize: 11, letterSpacing: 1, color: '#687571'},
  status: {fontSize: 18, fontWeight: '800', marginTop: 3, color: '#616A68'},
  activeText: {color: '#176B5B'},
});
