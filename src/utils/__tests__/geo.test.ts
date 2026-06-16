import { formatCoords, formatDistance, haversineKm } from '@/utils/geo';

describe('haversineKm', () => {
  it('computes a known distance (Paris → London ≈ 343 km)', () => {
    const distance = haversineKm(
      { latitude: 48.8566, longitude: 2.3522 },
      { latitude: 51.5074, longitude: -0.1278 },
    );
    expect(distance).toBeGreaterThan(330);
    expect(distance).toBeLessThan(355);
  });

  it('is zero for identical points', () => {
    expect(haversineKm({ latitude: 10, longitude: 10 }, { latitude: 10, longitude: 10 })).toBeCloseTo(0);
  });
});

describe('formatCoords', () => {
  it('formats the northern/eastern hemisphere', () => {
    expect(formatCoords(52.52, 13.405)).toBe('52.520°N, 13.405°E');
  });

  it('handles a missing location', () => {
    expect(formatCoords(null, null)).toBe('No location');
  });
});

describe('formatDistance', () => {
  it('uses metres under 1 km', () => {
    expect(formatDistance(0.4)).toBe('400 m');
  });

  it('supports imperial units', () => {
    expect(formatDistance(1.60934, 'imperial')).toBe('1.0 mi');
  });
});
