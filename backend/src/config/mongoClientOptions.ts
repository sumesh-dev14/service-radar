import type { ConnectOptions } from "mongoose";

/**
 * Options tuned for MongoDB Atlas from Node.js.
 *
 * Intermittent `ERR_SSL_TLSV1_ALERT_INTERNAL_ERROR` / pool-cleared errors often
 * happen when IPv6 routes to Atlas are flaky; preferring IPv4 (`family: 4`)
 * fixes many home / campus networks. Set `MONGO_DISABLE_IPV4=1` to use default DNS.
 */
export function getMongoConnectOptions(): ConnectOptions {
  const opts: ConnectOptions = {
    serverSelectionTimeoutMS: 30_000,
    socketTimeoutMS: 45_000,
    maxPoolSize: 10,
  };

  if (process.env.MONGO_DISABLE_IPV4 !== "1") {
    Object.assign(opts, { family: 4 as const });
  }

  return opts;
}
