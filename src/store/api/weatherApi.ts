import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

import { WEATHER_API_BASE } from '@/constants/config';

export interface CurrentWeather {
  temperatureC: number;
  weatherCode: number;
  isDay: boolean;
}

interface OpenMeteoResponse {
  current?: {
    temperature_2m?: number;
    weather_code?: number;
    is_day?: number;
  };
}

export const weatherApi = createApi({
  reducerPath: 'weatherApi',
  baseQuery: fetchBaseQuery({ baseUrl: WEATHER_API_BASE }),
  endpoints: (builder) => ({
    getCurrentWeather: builder.query<CurrentWeather, { latitude: number; longitude: number }>({
      query: ({ latitude, longitude }) =>
        `/forecast?latitude=${latitude}&longitude=${longitude}&current=temperature_2m,weather_code,is_day`,
      transformResponse: (response: OpenMeteoResponse): CurrentWeather => ({
        temperatureC: response.current?.temperature_2m ?? Number.NaN,
        weatherCode: response.current?.weather_code ?? 0,
        isDay: response.current?.is_day === 1,
      }),
    }),
  }),
});

export const { useGetCurrentWeatherQuery, useLazyGetCurrentWeatherQuery } = weatherApi;
