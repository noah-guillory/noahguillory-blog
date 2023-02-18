import type { CacheEntry, Cache as CachifiedCache } from "cachified";
import LRUCache from "lru-cache";
import type BetterSqlite3 from "better-sqlite3";
import Database from "better-sqlite3";
import { verboseReporter, lruCacheAdapter } from "cachified";
import * as C from "cachified";
import * as fs from "fs";
import { envMust } from "~/utils/utils";

const CACHE_DATABASE_PATH = envMust("CACHE_DATABASE_PATH");

declare global {
  // This preserves the LRU cache during development
  // eslint-disable-next-line
  var __lruCache: LRUCache<string, CacheEntry<unknown>> | undefined,
    __cacheDb: ReturnType<typeof Database> | undefined;
}

const cacheDb = (global.__cacheDb = global.__cacheDb
  ? global.__cacheDb
  : createDatabase());

function createDatabase(tryAgain = true): BetterSqlite3.Database {
  console.log(CACHE_DATABASE_PATH);
  const db = new Database(CACHE_DATABASE_PATH);

  try {
    // create cache table with metadata JSON column and value JSON column if it does not exist already
    db.exec(`
      CREATE TABLE IF NOT EXISTS cache (
        key TEXT PRIMARY KEY,
        metadata TEXT,
        value TEXT
      )
    `);
  } catch (error: unknown) {
    fs.unlinkSync(CACHE_DATABASE_PATH);
    if (tryAgain) {
      console.error(
        `Error creating cache database, deleting the file at "${CACHE_DATABASE_PATH}" and trying again...`
      );
      return createDatabase(false);
    }
    throw error;
  }
  return db;
}

const lru = (global.__lruCache = global.__lruCache
  ? global.__lruCache
  : new LRUCache<string, CacheEntry<unknown>>({ max: 5000 }));

export const lruCache = C.lruCacheAdapter(lru);

export const cache: CachifiedCache = {
  name: "SQLite cache",
  get(key) {
    const result = cacheDb
      .prepare("SELECT value, metadata FROM cache WHERE key = ?")
      .get(key);
    if (!result) return null;
    return {
      metadata: JSON.parse(result.metadata),
      value: JSON.parse(result.value),
    };
  },
  async set(key, entry) {
    cacheDb
      .prepare(
        "INSERT OR REPLACE INTO cache (key, value, metadata) VALUES (@key, @value, @metadata)"
      )
      .run({
        key,
        value: JSON.stringify(entry.value),
        metadata: JSON.stringify(entry.metadata),
      });
  },
  async delete(key) {
    cacheDb.prepare("DELETE FROM cache WHERE key = ?").run(key);
  },
};

export async function shouldForceFresh({
  forceFresh,
  request,
  key,
}: {
  forceFresh?: boolean | string;
  request?: Request;
  key: string;
}) {
  if (typeof forceFresh === "boolean") return forceFresh;
  if (typeof forceFresh === "string")
    return forceFresh.split(",").includes(key);

  if (!request) return false;
  const fresh = new URL(request.url).searchParams.get("fresh");
  if (typeof fresh !== "string") return false;
  if (fresh === "") return true;

  return fresh.split(",").includes(key);
}

export async function cachified<Value>({
  request,
  ...options
}: Omit<C.CachifiedOptions<Value>, "forceFresh"> & {
  request?: Request;
  forceFresh?: boolean | string;
}): Promise<Value> {
  const cachifiedPromise = C.cachified({
    reporter: verboseReporter(),
    ...options,
    forceFresh: await shouldForceFresh({
      forceFresh: options.forceFresh,
      request,
      key: options.key,
    }),
    getFreshValue: async (context) => {
      return options.getFreshValue(context);
    },
  });
  const result = await cachifiedPromise;
  return result;
}
