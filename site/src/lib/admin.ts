// Shared helpers for the /admin content-entry area (edge + node compatible).

export const ADMIN_COOKIE = "fg_admin";

/** Derive the session token from the shared admin password (never store the password itself). */
export async function adminToken(password: string): Promise<string> {
  const data = new TextEncoder().encode("fg-admin::" + password);
  const digest = await crypto.subtle.digest("SHA-256", data);
  return [...new Uint8Array(digest)].map((b) => b.toString(16).padStart(2, "0")).join("");
}
