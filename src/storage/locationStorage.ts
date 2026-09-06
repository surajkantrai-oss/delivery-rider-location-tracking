import AsyncStorage from '@react-native-async-storage/async-storage';
import {STORAGE_KEYS} from '../constants/location';
import type {Coordinates} from '../types/location';

export async function getLastAcceptedLocation(
  uid: string,
): Promise<Coordinates | null> {
  const value = await AsyncStorage.getItem(STORAGE_KEYS.lastLocation(uid));
  if (!value) {
    return null;
  }
  try {
    const parsed = JSON.parse(value) as Coordinates;
    return Number.isFinite(parsed.latitude) && Number.isFinite(parsed.longitude)
      ? parsed
      : null;
  } catch (error) {
    console.warn('Discarding corrupt last-location data', error);
    return null;
  }
}

export const setLastAcceptedLocation = (uid: string, point: Coordinates) =>
  AsyncStorage.setItem(STORAGE_KEYS.lastLocation(uid), JSON.stringify(point));

export async function getDutyState(uid: string): Promise<boolean> {
  return (await AsyncStorage.getItem(STORAGE_KEYS.duty(uid))) === 'true';
}

export const setDutyState = (uid: string, onDuty: boolean) =>
  AsyncStorage.setItem(STORAGE_KEYS.duty(uid), String(onDuty));
