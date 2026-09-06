import AsyncStorage from '@react-native-async-storage/async-storage';
import {STORAGE_KEYS} from '../constants/location';
import type {LocationLog} from '../types/location';

let queueMutation: Promise<void> = Promise.resolve();

async function readQueue(): Promise<LocationLog[]> {
  const value = await AsyncStorage.getItem(STORAGE_KEYS.queue);
  if (!value) {
    return [];
  }
  try {
    const parsed: unknown = JSON.parse(value);
    return Array.isArray(parsed) ? (parsed as LocationLog[]) : [];
  } catch (error) {
    console.warn('Offline queue is corrupt; preserving a fresh usable queue', error);
    return [];
  }
}

export const getQueue = readQueue;

function mutateQueue(mutation: (queue: LocationLog[]) => LocationLog[]) {
  const operation = queueMutation.then(async () => {
    const queue = await readQueue();
    await AsyncStorage.setItem(STORAGE_KEYS.queue, JSON.stringify(mutation(queue)));
  });
  queueMutation = operation.catch(() => undefined);
  return operation;
}

export const enqueueLocation = (log: LocationLog): Promise<void> =>
  mutateQueue(queue =>
    queue.some(item => item.id === log.id) ? queue : [...queue, log],
  );

export const removeQueuedLocation = (id: string): Promise<void> =>
  mutateQueue(queue => queue.filter(item => item.id !== id));
