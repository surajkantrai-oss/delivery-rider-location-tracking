import NetInfo from '@react-native-community/netinfo';
import {calculateDistanceMeters, shouldSaveLocation} from '../utils/distance';
import {isValidLocation} from '../utils/locationValidation';
import {enqueueLocation} from '../storage/offlineQueue';
import {
  getDutyState,
  getLastAcceptedLocation,
  setLastAcceptedLocation,
} from '../storage/locationStorage';
import {saveLocationLog} from './locationLogService';
import type {LocationLog, LocationReading} from '../types/location';

let processingTail: Promise<void> = Promise.resolve();

const createLocationId = (uid: string): string =>
  `${uid}_${Date.now()}_${Math.random().toString(36).slice(2, 12)}`;

async function persistOrQueue(log: LocationLog): Promise<void> {
  const network = await NetInfo.fetch();
  if (network.isConnected && network.isInternetReachable !== false) {
    try {
      await saveLocationLog(log);
      return;
    } catch (error) {
      console.warn('Firestore write failed; queueing location', error);
    }
  }
  await enqueueLocation(log);
}

async function processReading(uid: string, reading: LocationReading) {
  if (!(await getDutyState(uid)) || !isValidLocation(reading)) {
    return;
  }

  const last = await getLastAcceptedLocation(uid);
  const distanceMoved = last
    ? calculateDistanceMeters(
        last.latitude,
        last.longitude,
        reading.latitude,
        reading.longitude,
      )
    : 0;

  if (last && !shouldSaveLocation(distanceMoved)) {
    return;
  }

  // Recheck after asynchronous reads so an Off Duty action wins the race.
  if (!(await getDutyState(uid))) {
    return;
  }

  const log: LocationLog = {
    id: createLocationId(uid),
    riderId: uid,
    latitude: reading.latitude,
    longitude: reading.longitude,
    timestamp: reading.timestamp || Date.now(),
    distanceMoved,
    ...(reading.accuracy === undefined ? {} : {accuracy: reading.accuracy}),
  };

  // Advance only after either the remote write or durable local queue succeeds.
  await persistOrQueue(log);
  await setLastAcceptedLocation(uid, {
    latitude: reading.latitude,
    longitude: reading.longitude,
    accuracy: reading.accuracy,
  });
}

export function processLocationReading(
  uid: string,
  reading: LocationReading,
): Promise<void> {
  const operation = processingTail.then(() => processReading(uid, reading));
  processingTail = operation.catch(error => {
    console.warn('Location processing failed', error);
  });
  return operation;
}
