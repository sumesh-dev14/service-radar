import type { ConnectOptions } from "mongoose";

export function getMongoConnectOptions(): ConnectOptions {
  const opts = {
    serverSelectionTimeoutMS: 30_000,
    socketTimeoutMS: 45_000,
    maxPoolSize: 10,
  } as ConnectOptions;

  if (process.env.MONGO_DISABLE_IPV4 !== "1") {
    Object.assign(opts, { family: 4 });
  }

  return opts;
}