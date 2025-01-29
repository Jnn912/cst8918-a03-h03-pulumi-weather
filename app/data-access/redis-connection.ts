import { createClient } from 'redis';

const redisUrl = process.env.REDIS_URL || 'redis://localhost:6379';
console.log("🚀 Connecting to Redis at:", redisUrl);

export const redis = createClient({ url: redisUrl })
  .on('error', (err) => console.error('❌ Redis client connection error:', err));

async function connectRedis() {
  await redis.connect();
  console.log("✅ Redis connection successful!");
}


connectRedis();
