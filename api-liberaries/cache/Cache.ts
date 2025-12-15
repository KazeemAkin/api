// utils/cache.ts
import { createClient, RedisClientType } from "redis";
import { LRUCache } from "lru-cache";

// Redis client instance
let redisClient: RedisClientType | null = null;

// In-memory cache fallback
const lruCache = new LRUCache<string, string>({
  max: 1000,
  ttl: parseInt(process.env.CACHE_TTL || "300") * 1000,
  allowStale: true,
});

// Connection status and retry logic
let isRedisConnected = false;
const maxRetries = 5;
const retryDelayBase = 1000;

// Initialize Redis with retry logic
export const getRedisClient = async (): Promise<RedisClientType | null> => {
  if (redisClient && isRedisConnected) return redisClient;

  redisClient = createClient({
    url: process.env.REDIS_URL || "redis://localhost:6379",
    socket: {
      connectTimeout: 10000,
      reconnectStrategy: (retries: number) => {
        if (retries >= maxRetries) {
          console.error(
            `Redis connection failed after ${maxRetries} retries. Falling back to in-memory cache.`
          );
          isRedisConnected = false;
          return false;
        }
        const delay = Math.min(retryDelayBase * 2 ** retries, 30000);
        console.warn(`Redis retry ${retries + 1}/${maxRetries} in ${delay}ms`);
        return delay;
      },
    },
  });

  redisClient.on("error", (err) => {
    console.error("Redis Client Error:", err);
    isRedisConnected = false;
  });

  redisClient.on("connect", () => {
    console.log("Redis connected successfully");
    isRedisConnected = true;
  });

  try {
    await redisClient.connect();
    isRedisConnected = true;
    return redisClient;
  } catch (err) {
    console.error("Redis initial connection failed:", err);
    isRedisConnected = false;
    return null;
  }
};

// Cache interface for consistent get/set
interface Cache {
  get: (key: string) => Promise<string | null>;
  setEx: (key: string, ttl: number, value: string) => Promise<void>;
  del: (key: string) => Promise<void>;
}

// Redis-based cache implementation
const redisCache: Cache = {
  get: async (key: string) => {
    if (!isRedisConnected || !redisClient) return null;
    try {
      return await redisClient.get(key);
    } catch (err) {
      console.error("Redis get error:", err);
      isRedisConnected = false;
      return null;
    }
  },
  setEx: async (key: string, ttl: number, value: string) => {
    if (!isRedisConnected || !redisClient) return;
    try {
      await redisClient.setEx(key, ttl, value);
    } catch (err) {
      console.error("Redis setEx error:", err);
      isRedisConnected = false;
    }
  },
  del: async (key: string) => {
    if (!isRedisConnected || !redisClient) return;
    try {
      await redisClient.del(key);
    } catch (err) {
      console.error("Redis del error:", err);
      isRedisConnected = false;
    }
  },
};

// In-memory cache implementation
const inMemoryCache: Cache = {
  get: async (key: string) => {
    const value = lruCache.get(key);
    return value ?? null;
  },
  setEx: async (key: string, ttl: number, value: string) => {
    lruCache.set(key, value, { ttl: ttl * 1000 });
  },
  del: async (key: string) => {
    lruCache.delete(key);
  },
};

// Unified cache accessor
export const getCache = async (): Promise<Cache> => {
  const redis = await getRedisClient();
  return isRedisConnected && redis ? redisCache : inMemoryCache;
};

// Graceful shutdown
process.on("SIGINT", async () => {
  if (redisClient && isRedisConnected) {
    await redisClient.quit();
    console.log("Redis connection closed");
  }
  process.exit(0);
});
