import { cookies } from "next/headers";

export const ADMIN_COOKIE = "onegoods_admin_session";

export function getAdminConfig() {
  return {
    email: process.env.ADMIN_EMAIL ?? "",
    password: process.env.ADMIN_PASSWORD ?? "",
    sessionSecret: process.env.ADMIN_SESSION_SECRET ?? "",
  };
}

export function isAdminConfigured() {
  const config = getAdminConfig();
  return Boolean(config.email && config.password && config.sessionSecret);
}

export function verifyAdminCredentials(email: string, password: string) {
  const config = getAdminConfig();
  return (
    isAdminConfigured() &&
    email.trim().toLowerCase() === config.email.trim().toLowerCase() &&
    password === config.password
  );
}

export async function hasAdminSession() {
  const config = getAdminConfig();
  if (!isAdminConfigured()) return false;
  const cookieStore = await cookies();
  return cookieStore.get(ADMIN_COOKIE)?.value === config.sessionSecret;
}
