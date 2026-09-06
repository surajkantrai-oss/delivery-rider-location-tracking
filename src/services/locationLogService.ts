import type {FirebaseFirestoreTypes} from '@react-native-firebase/firestore';
import {locationLogsCollection} from './firebaseService';
import type {LocationLog} from '../types/location';

export const saveLocationLog = (log: LocationLog) =>
  locationLogsCollection(log.riderId).doc(log.id).set(log);

export function subscribeToLocationLogs(
  uid: string,
  onData: (logs: LocationLog[]) => void,
  onError: (message: string) => void,
): () => void {
  return locationLogsCollection(uid)
    .orderBy('timestamp', 'desc')
    .onSnapshot(
      snapshot => {
        onData(snapshot.docs.map(document => document.data() as LocationLog));
      },
      error => {
        console.warn('Location log listener failed', error);
        onError('Could not load location history. Pull down to retry.');
      },
    );
}

export async function fetchLocationLogs(uid: string): Promise<LocationLog[]> {
  const snapshot: FirebaseFirestoreTypes.QuerySnapshot =
    await locationLogsCollection(uid).orderBy('timestamp', 'desc').get();
  return snapshot.docs.map(document => document.data() as LocationLog);
}
