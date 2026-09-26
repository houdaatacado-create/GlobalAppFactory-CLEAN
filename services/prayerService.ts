// Powered by OnSpace.AI
// Prayer Times Service - Uses Aladhan API (free, no key required)

export interface PrayerTimings {
  Fajr: string;
  Sunrise: string;
  Dhuhr: string;
  Asr: string;
  Sunset: string;
  Maghrib: string;
  Isha: string;
  Imsak: string;
  Midnight: string;
}

export interface PrayerDay {
  timings: PrayerTimings;
  date: {
    readable: string;
    gregorian: { date: string; day: string; month: { en: string; number: string }; year: string };
    hijri: { date: string; day: string; month: { en: string; ar: string; number: string }; year: string };
  };
}

export const PRAYER_KEYS: (keyof PrayerTimings)[] = [
  'Fajr', 'Sunrise', 'Dhuhr', 'Asr', 'Maghrib', 'Isha'
];

export const PRAYER_ICON_MAP: Record<string, string> = {
  Fajr: 'wb-twilight',
  Sunrise: 'wb-sunny',
  Dhuhr: 'light-mode',
  Asr: 'cloud',
  Maghrib: 'wb-twilight',
  Isha: 'nights-stay',
};

export async function fetchPrayerTimesByCoords(
  lat: number,
  lng: number,
  method: number = 2
): Promise<PrayerDay | null> {
  try {
    const today = new Date();
    const dateStr = `${today.getDate()}-${today.getMonth() + 1}-${today.getFullYear()}`;
    const url = `https://api.aladhan.com/v1/timings/${dateStr}?latitude=${lat}&longitude=${lng}&method=${method}`;
    const res = await fetch(url);
    const json = await res.json();
    if (json.code === 200) return json.data as PrayerDay;
    return null;
  } catch {
    return null;
  }
}

export async function fetchPrayerTimesByCity(
  city: string,
  country: string = '',
  method: number = 2
): Promise<PrayerDay | null> {
  try {
    const today = new Date();
    const dateStr = `${today.getDate()}-${today.getMonth() + 1}-${today.getFullYear()}`;
    const query = country ? `city=${encodeURIComponent(city)}&country=${encodeURIComponent(country)}` : `city=${encodeURIComponent(city)}&country=`;
    const url = `https://api.aladhan.com/v1/timingsByCity/${dateStr}?${query}&method=${method}`;
    const res = await fetch(url);
    const json = await res.json();
    if (json.code === 200) return json.data as PrayerDay;
    return null;
  } catch {
    return null;
  }
}

export function stripTimezone(time: string): string {
  return time.split(' ')[0];
}

export function getNextPrayer(timings: PrayerTimings): { name: string; time: string; minutesLeft: number } {
  const prayers = [
    { name: 'Fajr', time: timings.Fajr },
    { name: 'Dhuhr', time: timings.Dhuhr },
    { name: 'Asr', time: timings.Asr },
    { name: 'Maghrib', time: timings.Maghrib },
    { name: 'Isha', time: timings.Isha },
  ];

  const now = new Date();
  const nowMins = now.getHours() * 60 + now.getMinutes();

  for (const p of prayers) {
    const [h, m] = stripTimezone(p.time).split(':').map(Number);
    const pMins = h * 60 + m;
    if (pMins > nowMins) {
      return { name: p.name, time: stripTimezone(p.time), minutesLeft: pMins - nowMins };
    }
  }
  // Next day Fajr
  const [h, m] = stripTimezone(timings.Fajr).split(':').map(Number);
  const fajrMins = h * 60 + m + 1440;
  return { name: 'Fajr', time: stripTimezone(timings.Fajr), minutesLeft: fajrMins - nowMins };
}

export function formatMinutes(mins: number): string {
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  if (h > 0) return `${h}h ${m}m`;
  return `${m}m`;
}

// Mock fallback timings for when API is unavailable
export const MOCK_TIMINGS: PrayerTimings = {
  Fajr: '05:12',
  Sunrise: '06:45',
  Dhuhr: '12:30',
  Asr: '15:45',
  Sunset: '18:55',
  Maghrib: '18:55',
  Isha: '20:15',
  Imsak: '05:02',
  Midnight: '00:30',
};
