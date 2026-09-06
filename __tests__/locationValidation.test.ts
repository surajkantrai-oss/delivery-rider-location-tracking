import {isValidLocation} from '../src/utils/locationValidation';

const reading = {
  latitude: 23.2599,
  longitude: 77.4126,
  accuracy: 20,
  timestamp: 1,
};

describe('isValidLocation', () => {
  it('accepts a valid GPS reading', () => {
    expect(isValidLocation(reading)).toBe(true);
  });

  it.each([
    {latitude: 91},
    {latitude: -91},
    {longitude: 181},
    {longitude: -181},
    {accuracy: 0},
    {accuracy: 101},
  ])('rejects an invalid reading override: %o', override => {
    expect(isValidLocation({...reading, ...override})).toBe(false);
  });

  it('rejects non-finite coordinates', () => {
    expect(isValidLocation({...reading, latitude: Number.NaN})).toBe(false);
    expect(isValidLocation({...reading, longitude: Number.POSITIVE_INFINITY})).toBe(
      false,
    );
  });
});
