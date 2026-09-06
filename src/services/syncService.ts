import {getQueue, removeQueuedLocation} from '../storage/offlineQueue';
import {saveLocationLog} from './locationLogService';

const activeSyncs = new Map<string, Promise<void>>();

async function performSync(uid: string): Promise<void> {
  const queue = await getQueue();
  for (const log of queue.filter(item => item.riderId === uid)) {
    try {
      await saveLocationLog(log);
      await removeQueuedLocation(log.id);
    } catch (error) {
      console.warn(`Retaining queued location ${log.id}`, error);
    }
  }
}

export function syncOfflineQueue(uid: string): Promise<void> {
  const existing = activeSyncs.get(uid);
  if (existing) {
    return existing;
  }
  const operation = performSync(uid).finally(() => {
    if (activeSyncs.get(uid) === operation) {
      activeSyncs.delete(uid);
    }
  });
  activeSyncs.set(uid, operation);
  return operation;
}
