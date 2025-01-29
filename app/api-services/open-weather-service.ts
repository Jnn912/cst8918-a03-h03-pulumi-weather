import { redis } from '../data-access/redis-connection';

const API_KEY = process.env.WEATHER_API_KEY || '27c5d1fb319591b98e55d93ba9540513'; // 使用环境变量，或者使用默认的API密钥
console.log("🔍 Using OpenWeather API Key:", API_KEY);

const TEN_MINUTES = 1000 * 60 * 10; // 10-minute cache expiration time
const BASE_URL = 'https://api.openweathermap.org/data/2.5/weather';

interface FetchWeatherDataParams {
  lat: number;
  lon: number;
  units: string;
}

/**
 * Fetches weather data, prioritizing Redis cache retrieval.
 * If the cache is empty or expired, fetches data from OpenWeather API and stores it in Redis.
 */
export async function fetchWeatherData({ lat, lon, units }: FetchWeatherDataParams) {
  const queryString = `lat=${lat}&lon=${lon}&units=${units}`;

  try {
    console.log(`🔍 Checking Redis cache for key: "${queryString}"`);
    
    const cacheEntry = await redis.get(queryString);
    if (cacheEntry) {
      console.log('✅ Returning cached weather data from Redis');
      return JSON.parse(cacheEntry);
    }

    console.log('🌍 Fetching new weather data from API:', queryString);
    const response = await fetch(`${BASE_URL}?${queryString}&appid=${API_KEY}`);

    if (!response.ok) {
      throw new Error(`⚠️ Failed to fetch weather data: ${response.statusText}`);
    }

    const data = await response.json();
    
    console.log("🔵 Storing data in Redis:", JSON.stringify(data));

    await redis.set(queryString, JSON.stringify(data), { PX: TEN_MINUTES });

    console.log("✅ Successfully stored weather data in Redis");

    return data;
  } catch (error) {
    console.error('❌ Error fetching weather data:', error);
    throw error;
  }
}
