import { celsiusToFahrenheit, formatTemperature, weatherCodeToInfo } from '@/utils/weather';

describe('weatherCodeToInfo', () => {
  it('maps a known WMO code', () => {
    const info = weatherCodeToInfo(0);
    expect(info.label).toBe('Clear sky');
    expect(info.code).toBe(0);
  });

  it('falls back gracefully for an unknown code', () => {
    expect(weatherCodeToInfo(1234).label).toBe('Unknown');
  });
});

describe('formatTemperature', () => {
  it('rounds and labels metric by default', () => {
    expect(formatTemperature(21.4)).toBe('21°C');
  });

  it('converts to imperial', () => {
    expect(formatTemperature(0, 'imperial')).toBe('32°F');
  });

  it('handles NaN gracefully', () => {
    expect(formatTemperature(Number.NaN)).toBe('—');
  });
});

describe('celsiusToFahrenheit', () => {
  it('converts boiling point correctly', () => {
    expect(celsiusToFahrenheit(100)).toBe(212);
  });
});
