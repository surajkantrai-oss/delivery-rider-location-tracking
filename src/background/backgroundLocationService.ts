import {Platform} from 'react-native';
import BackgroundService from 'react-native-background-actions';
import Geolocation from 'react-native-geolocation-service';
import {LOCATION_INTERVAL_MS} from '../constants/location';
import {processLocationReading} from '../services/locationService';

let watchId: number | null = null;
let starting: Promise<void> | null = null;

const sleep = (milliseconds: number) =>
  new Promise<void>(resolve => setTimeout(resolve, milliseconds));

const locationTask = async (taskData?: {uid: string}): Promise<void> => {
  if (!taskData) {
    return;
  }
  const {uid} = taskData;
  watchId = Geolocation.watchPosition(
    position => {
      void processLocationReading(uid, {
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          accuracy: position.coords.accuracy,
          timestamp: position.timestamp,
        }).catch(error => console.warn('Location callback failed', error));
    },
    error => console.warn('Location provider error', error.code, error.message),
    {
      enableHighAccuracy: true,
      distanceFilter: 0,
      interval: LOCATION_INTERVAL_MS,
      fastestInterval: LOCATION_INTERVAL_MS,
      showsBackgroundLocationIndicator: true,
      useSignificantChanges: false,
    },
  );

  try {
    while (BackgroundService.isRunning()) {
      await sleep(1_000);
    }
  } finally {
    if (watchId !== null) {
      Geolocation.clearWatch(watchId);
      watchId = null;
    }
  }
};

export async function startBackgroundLocation(uid: string): Promise<void> {
  if (BackgroundService.isRunning()) {
    return;
  }
  if (!starting) {
    starting = BackgroundService.start(locationTask, {
      taskName: 'DeliveryLocationTracking',
      taskTitle: 'Delivery Rider — Location tracking active',
      taskDesc: 'Your location is being recorded while you are On Duty.',
      taskIcon: {name: 'ic_launcher', type: 'mipmap'},
      color: '#176B5B',
      parameters: {uid},
      progressBar: {max: 100, value: 0, indeterminate: true},
      foregroundServiceType: ['location'],
    }).finally(() => {
      starting = null;
    });
  }
  await starting;
}

export async function stopBackgroundLocation(): Promise<void> {
  if (starting) {
    await starting.catch(() => undefined);
  }
  if (BackgroundService.isRunning()) {
    await BackgroundService.stop();
  }
  if (watchId !== null) {
    Geolocation.clearWatch(watchId);
    watchId = null;
  }
  if (Platform.OS === 'ios') {
    Geolocation.stopObserving();
  }
}

export const isBackgroundLocationRunning = () => BackgroundService.isRunning();
