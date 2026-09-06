import {
  calculateDistanceMeters,
  shouldSaveLocation,
} from '../src/utils/distance';

describe('calculateDistanceMeters', () => {
  it('returns zero for identical coordinates', () => {
    const distance = calculateDistanceMeters(23.2599, 77.4126, 23.2599, 77.4126);
    expect(distance).toBeCloseTo(0, 6);
    expect(shouldSaveLocation(distance)).toBe(false);
  });

  it('does not accept an approximately 29 metre move', () => {
    const distance = calculateDistanceMeters(0, 0, 0.0002608, 0);
    expect(distance).toBeGreaterThan(28.8);
    expect(distance).toBeLessThan(29.2);
    expect(shouldSaveLocation(distance)).toBe(false);
  });

  it('applies the inclusive 30 metre threshold exactly', () => {
    expect(shouldSaveLocation(29.999)).toBe(false);
    expect(shouldSaveLocation(30)).toBe(true);
    expect(shouldSaveLocation(30.001)).toBe(true);
  });

  it('accepts an approximately 31 metre move', () => {
    const distance = calculateDistanceMeters(0, 0, 0.0002788, 0);
    expect(distance).toBeGreaterThan(30.8);
    expect(distance).toBeLessThan(31.2);
    expect(shouldSaveLocation(distance)).toBe(true);
  });

  it('returns a reasonable distance from London to Paris', () => {
    const distance = calculateDistanceMeters(51.5074, -0.1278, 48.8566, 2.3522);
    expect(distance).toBeGreaterThan(343_000);
    expect(distance).toBeLessThan(345_000);
  });
});
