import {useCallback, useEffect, useState} from 'react';
import {
  fetchLocationLogs,
  subscribeToLocationLogs,
} from '../services/locationLogService';
import type {LocationLog} from '../types/location';

export function useLocationLogs(uid: string) {
  const [logs, setLogs] = useState<LocationLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    const unsubscribe = subscribeToLocationLogs(
      uid,
      nextLogs => {
        setLogs(nextLogs);
        setError(null);
        setLoading(false);
      },
      message => {
        setError(message);
        setLoading(false);
      },
    );
    return unsubscribe;
  }, [uid]);

  const refresh = useCallback(async () => {
    setRefreshing(true);
    try {
      setLogs(await fetchLocationLogs(uid));
      setError(null);
    } catch (fetchError) {
      console.warn('Manual refresh failed', fetchError);
      setError('Refresh failed. Check your connection and try again.');
    } finally {
      setRefreshing(false);
    }
  }, [uid]);

  return {logs, loading, refreshing, error, refresh};
}
