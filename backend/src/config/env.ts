/**
 * Production environment checks — run after dotenv.config().
 */

const isProd = process.env.NODE_ENV === "production";

export function assertProductionEnv(): void {
  if (!isProd) return;

  const required = ["MONGO_URI", "JWT_SECRET", "ALLOWED_ORIGINS"] as const;
  const missing = required.filter((k) => !process.env[k]?.trim());
  if (missing.length > 0) {
    console.error(
      `[FATAL] Production requires: ${missing.join(", ")}. Set them in the host environment (not committed to git).`
    );
    process.exit(1);
  }
}

export { isProd };
