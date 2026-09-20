import { createClient } from "microcms-js-sdk";

const serviceDomain = process.env.MICROCMS_SERVICE_DOMAIN;
const apiKey = process.env.MICROCMS_API_KEY;

/** true once .env.local is filled in with real microCMS credentials. */
export const isCmsConfigured = Boolean(serviceDomain && apiKey);

/**
 * microCMS client. Null until credentials are set, so the app can still
 * build/run with placeholder data during migration.
 */
export const client = isCmsConfigured
  ? createClient({ serviceDomain: serviceDomain as string, apiKey: apiKey as string })
  : null;
