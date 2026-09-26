// Powered by OnSpace.AI
import { useState, useEffect, useCallback } from 'react';
import {
  PrayerTimings,
  PrayerDay,
  fetchPrayerTimesByCoords,
  fetchPrayerTimesByCity,
  getNextPrayer,
  MOCK_TIMINGS,
} from '../services/prayerService';
import { useApp } from './useApp';

interface PrayerState {
  timings: PrayerTimings | null;
  hijriDate: string;
  gregorianDate: string;
  nextPrayer: { name: string; time: string; minutesLeft: number } | null;
  loading: boolean;
  error: string | null;
}

export function usePrayerTimes() {
  const { userPrefs, updatePrefs } = useApp();
  const [state, setState] = useState<PrayerState>({
    timings: null,
    hijriDate: '',
    gregorianDate: '',
    nextPrayer: null,
    loading: true,
    error: null,
  });

  const loadPrayerTimes = useCallback(async () => {
    setState(prev => ({ ...prev, loading: true, error: null }));
    try {
      let data: PrayerDay | null = null;

      if (userPrefs.latitude && userPrefs.longitude) {
        data = await fetchPrayerTimesByCoords(userPrefs.latitude, userPrefs.longitude);
      } else if (userPrefs.city) {
        data = await fetchPrayerTimesByCity(userPrefs.city, userPrefs.country);
      }

      if (data) {
        const nextP = getNextPrayer(data.timings);
        setState({
          timings: data.timings,
          hijriDate: `${data.date.hijri.day} ${data.date.hijri.month.ar} ${data.date.hijri.year}`,
          gregorianDate: data.date.readable,
          nextPrayer: nextP,
          loading: false,
          error: null,
        });
      } else {
        // Use mock if no location set
        const nextP = getNextPrayer(MOCK_TIMINGS);
        setState({
          timings: MOCK_TIMINGS,
          hijriDate: '١٥ ربيع الأول ١٤٤٧',
          gregorianDate: new Date().toDateString(),
          nextPrayer: nextP,
          loading: false,
          error: null,
        });
      }
    } catch {
      setState(prev => ({
        ...prev,
        timings: MOCK_TIMINGS,
        loading: false,
        error: null,
      }));
    }
  }, [userPrefs.latitude, userPrefs.longitude, userPrefs.city]);

  useEffect(() => {
    loadPrayerTimes();
  }, [loadPrayerTimes]);

  // Update next prayer countdown every minute
  useEffect(() => {
    if (!state.timings) return;
    const interval = setInterval(() => {
      const nextP = getNextPrayer(state.timings!);
      setState(prev => ({ ...prev, nextPrayer: nextP }));
    }, 60000);
    return () => clearInterval(interval);
  }, [state.timings]);

  const setLocation = useCallback(async (lat: number, lng: number) => {
    await updatePrefs({ latitude: lat, longitude: lng });
  }, [updatePrefs]);

  const setCity = useCallback(async (city: string, country: string = '') => {
    await updatePrefs({ city, country });
  }, [updatePrefs]);

  return {
    ...state,
    reload: loadPrayerTimes,
    setLocation,
    setCity,
    hasLocation: !!(userPrefs.latitude || userPrefs.city),
    city: userPrefs.city,
  };
}
