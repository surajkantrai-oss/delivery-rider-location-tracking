export type Coordinates = {
  latitude: number;
  longitude: number;
  accuracy?: number;
};

export type LocationLog = Coordinates & {
  id: string;
  riderId: string;
  timestamp: number;
  distanceMoved: number;
};

export type LocationReading = Coordinates & {timestamp: number};
