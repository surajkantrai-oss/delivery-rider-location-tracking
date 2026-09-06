const mockStorage = new Map<string, string>();

jest.mock('@react-native-async-storage/async-storage', () => ({
  getItem: jest.fn((key: string) =>
    Promise.resolve(mockStorage.get(key) ?? null),
  ),
  setItem: jest.fn((key: string, value: string) => {
    mockStorage.set(key, value);
    return Promise.resolve();
  }),
}));

import {
  enqueueLocation,
  getQueue,
  removeQueuedLocation,
} from '../src/storage/offlineQueue';
import type {LocationLog} from '../src/types/location';

const log: LocationLog = {
  id: 'stable-client-id',
  riderId: 'rider-1',
  latitude: 23.2599,
  longitude: 77.4126,
  timestamp: 1,
  distanceMoved: 31,
};

describe('offline location queue', () => {
  beforeEach(() => {
    mockStorage.clear();
  });

  it('persists a reading and de-duplicates its stable ID', async () => {
    await Promise.all([enqueueLocation(log), enqueueLocation(log)]);
    expect(await getQueue()).toEqual([log]);
  });

  it('removes only the successfully synchronized item', async () => {
    const second = {...log, id: 'second'};
    await enqueueLocation(log);
    await enqueueLocation(second);
    await removeQueuedLocation(log.id);
    expect(await getQueue()).toEqual([second]);
  });

  it('recovers safely from corrupt local data', async () => {
    mockStorage.set('@delivery_rider/offline_location_queue', '{bad json');
    const warning = jest.spyOn(console, 'warn').mockImplementation(() => undefined);
    expect(await getQueue()).toEqual([]);
    warning.mockRestore();
  });
});
