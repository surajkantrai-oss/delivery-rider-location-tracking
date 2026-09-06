import React, {useEffect, useState} from 'react';
import {
  Alert,
  AppState,
  FlatList,
  Pressable,
  RefreshControl,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import {
  startBackgroundLocation,
  stopBackgroundLocation,
} from '../background/backgroundLocationService';
import {DutyToggle} from '../components/DutyToggle';
import {EmptyState} from '../components/EmptyState';
import {ErrorState} from '../components/ErrorState';
import {LoadingView} from '../components/LoadingView';
import {LocationItem} from '../components/LocationItem';
import {useLocationLogs} from '../hooks/useLocationLogs';
import {logout} from '../services/authService';
import {syncOfflineQueue} from '../services/syncService';
import {getDutyState, setDutyState} from '../storage/locationStorage';
import type {FirebaseAuthTypes} from '@react-native-firebase/auth';
import {requestLocationPermissions} from '../utils/permissions';

const explainPermission = () =>
  new Promise<boolean>(resolve => {
    Alert.alert(
      'Background location',
      'Delivery Rider needs precise and background location while you are On Duty to record route movement. Android also shows a permanent tracking notification.',
      [
        {text: 'Not now', style: 'cancel', onPress: () => resolve(false)},
        {text: 'Continue', onPress: () => resolve(true)},
      ],
      {cancelable: false},
    );
  });

export function HomeScreen({user}: {user: FirebaseAuthTypes.User}) {
  const [onDuty, setOnDuty] = useState(false);
  const [dutyBusy, setDutyBusy] = useState(true);
  const {logs, loading, refreshing, error, refresh} = useLocationLogs(user.uid);

  useEffect(() => {
    let cancelled = false;
    const restoreDuty = async () => {
      try {
        const storedDuty = await getDutyState(user.uid);
        if (cancelled) {
          return;
        }
        setOnDuty(storedDuty);
        if (storedDuty) {
          await startBackgroundLocation(user.uid);
        }
      } catch (restoreError) {
        console.warn('Could not restore duty tracking', restoreError);
        if (!cancelled) {
          Alert.alert(
            'Tracking not restored',
            'Your On Duty status was restored, but location tracking could not start. Toggle Off Duty and try again.',
          );
        }
      } finally {
        if (!cancelled) {
          setDutyBusy(false);
        }
      }
    };
    void restoreDuty();
    return () => {
      cancelled = true;
    };
  }, [user.uid]);

  useEffect(() => {
    const subscription = AppState.addEventListener('change', state => {
      if (state === 'active') {
        void syncOfflineQueue(user.uid).catch(syncError =>
          console.warn('Foreground queue sync failed', syncError),
        );
      }
    });
    return () => subscription.remove();
  }, [user.uid]);

  const toggleDuty = async () => {
    if (dutyBusy) {
      return;
    }
    setDutyBusy(true);
    try {
      if (onDuty) {
        // Persist first so an in-flight callback observes Off Duty and exits.
        await setDutyState(user.uid, false);
        try {
          await stopBackgroundLocation();
        } finally {
          setOnDuty(false);
        }
      } else {
        if (!(await explainPermission()) || !(await requestLocationPermissions())) {
          return;
        }
        await setDutyState(user.uid, true);
        try {
          await startBackgroundLocation(user.uid);
        } catch (startError) {
          await setDutyState(user.uid, false);
          throw startError;
        }
        setOnDuty(true);
        void syncOfflineQueue(user.uid).catch(syncError =>
          console.warn('On Duty queue sync failed', syncError),
        );
      }
    } catch (trackingError) {
      console.warn('Duty toggle failed', trackingError);
      Alert.alert(
        'Could not update duty status',
        'Please verify location permissions and try again.',
      );
    } finally {
      setDutyBusy(false);
    }
  };

  const handleLogout = () => {
    Alert.alert('Log out?', 'Location tracking will stop and you will go Off Duty.', [
      {text: 'Cancel', style: 'cancel'},
      {
        text: 'Log Out',
        style: 'destructive',
        onPress: () => {
          void (async () => {
            setDutyBusy(true);
            try {
              await setDutyState(user.uid, false);
              try {
                await stopBackgroundLocation();
              } catch (stopError) {
                console.warn('Tracking stop failed during logout', stopError);
              }
              await logout();
            } catch (logoutError) {
              console.warn('Logout failed', logoutError);
              Alert.alert('Logout failed', 'Please try again.');
              setDutyBusy(false);
            }
          })();
        },
      },
    ]);
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <View style={styles.header}>
        <View>
          <Text style={styles.title}>Delivery Rider</Text>
          <Text style={styles.email}>{user.email ?? 'Authenticated rider'}</Text>
        </View>
        <Pressable onPress={handleLogout} hitSlop={12}>
          <Text style={styles.logout}>Logout</Text>
        </Pressable>
      </View>
      <DutyToggle onDuty={onDuty} busy={dutyBusy} onToggle={() => void toggleDuty()} />
      <Text style={styles.sectionTitle}>Location History</Text>
      {loading ? (
        <LoadingView />
      ) : error && logs.length === 0 ? (
        <ErrorState message={error} onRetry={() => void refresh()} />
      ) : (
        <FlatList
          data={logs}
          keyExtractor={item => item.id}
          renderItem={({item}) => <LocationItem log={item} />}
          ListHeaderComponent={
            error ? <ErrorState message={error} onRetry={() => void refresh()} /> : null
          }
          ListEmptyComponent={EmptyState}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={() => void refresh()} tintColor="#176B5B" />
          }
          contentContainerStyle={logs.length === 0 ? styles.emptyList : styles.list}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {flex: 1, backgroundColor: '#FAFBFA'},
  header: {paddingHorizontal: 18, paddingTop: 14, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center'},
  title: {fontSize: 25, fontWeight: '800', color: '#183B34'},
  email: {marginTop: 3, color: '#6B7774'},
  logout: {color: '#A13D3D', fontWeight: '700'},
  sectionTitle: {fontSize: 18, fontWeight: '700', color: '#1B2A27', marginHorizontal: 16, marginBottom: 12},
  list: {paddingBottom: 24},
  emptyList: {flexGrow: 1, justifyContent: 'center'},
});
