import {MAX_ACCEPTABLE_ACCURACY_METERS} from '../constants/location';
import type {LocationReading} from '../types/location';

export function isValidLocation(reading: LocationReading): boolean {
  const {latitude, longitude, accuracy} = reading;
  return (
    Number.isFinite(latitude) &&
    Number.isFinite(longitude) &&
    latitude >= -90 &&
    latitude <= 90 &&
    longitude >= -180 &&
    longitude <= 180 &&
    (accuracy === undefined ||
      (Number.isFinite(accuracy) &&
        accuracy > 0 &&
        accuracy <= MAX_ACCEPTABLE_ACCURACY_METERS))
  );
}
