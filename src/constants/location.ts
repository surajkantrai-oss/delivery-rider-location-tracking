export const LOCATION_INTERVAL_MS = 10_000;
export const MIN_DISTANCE_METERS = 30;
export const MAX_ACCEPTABLE_ACCURACY_METERS = 100;

export const STORAGE_KEYS = {
  queue: '@delivery_rider/offline_location_queue',
  duty: (uid: string) => `@delivery_rider/duty_state_${uid}`,
  lastLocation: (uid: string) =>
    `@delivery_rider/last_accepted_location_${uid}`,
} as const;
