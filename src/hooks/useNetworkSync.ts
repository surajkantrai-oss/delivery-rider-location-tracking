import {useEffect} from 'react';
import NetInfo from '@react-native-community/netinfo';
import {syncOfflineQueue} from '../services/syncService';

export function useNetworkSync(uid: string | undefined) {
  useEffect(() => {
    if (!uid) {
      return;
    }
    const sync = () => {
      void syncOfflineQueue(uid).catch(error =>
        console.warn('Offline queue sync failed', error),
      );
    };
    sync();
    let wasAvailable = false;
    return NetInfo.addEventListener(state => {
      const available =
        Boolean(state.isConnected) && state.isInternetReachable !== false;
      if (available && !wasAvailable) {
        sync();
      }
      wasAvailable = available;
    });
  }, [uid]);
}
