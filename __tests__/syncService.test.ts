const mockGetQueue = jest.fn();
const mockRemoveQueuedLocation = jest.fn();
const mockSaveLocationLog = jest.fn();

jest.mock('../src/storage/offlineQueue', () => ({
  getQueue: (...args: unknown[]) => mockGetQueue(...args),
  removeQueuedLocation: (...args: unknown[]) =>
    mockRemoveQueuedLocation(...args),
}));

jest.mock('../src/services/locationLogService', () => ({
  saveLocationLog: (...args: unknown[]) => mockSaveLocationLog(...args),
}));

import {syncOfflineQueue} from '../src/services/syncService';

const riderOne = {
  id: 'one',
  riderId: 'rider-1',
  latitude: 1,
  longitude: 1,
  timestamp: 1,
  distanceMoved: 31,
};
const riderTwo = {...riderOne, id: 'two', riderId: 'rider-2'};

describe('syncOfflineQueue', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockGetQueue.mockResolvedValue([riderOne, riderTwo]);
    mockSaveLocationLog.mockResolvedValue(undefined);
    mockRemoveQueuedLocation.mockResolvedValue(undefined);
  });

  it('syncs only the signed-in rider and removes after success', async () => {
    await syncOfflineQueue('rider-1');
    expect(mockSaveLocationLog).toHaveBeenCalledWith(riderOne);
    expect(mockSaveLocationLog).not.toHaveBeenCalledWith(riderTwo);
    expect(mockRemoveQueuedLocation).toHaveBeenCalledWith('one');
  });

  it('retains a record when the remote write fails', async () => {
    const warning = jest.spyOn(console, 'warn').mockImplementation(() => undefined);
    mockSaveLocationLog.mockRejectedValueOnce(new Error('offline'));
    await syncOfflineQueue('rider-1');
    expect(mockRemoveQueuedLocation).not.toHaveBeenCalled();
    warning.mockRestore();
  });
});
