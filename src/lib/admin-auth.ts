import { cookies } from "next/headers";
import { createHash } from "crypto";

export const ADMIN_COOKIE = "onegoods_admin_session";
const FALLBACK_ADMIN_EMAIL = "KYLIN1986@gmail.com";
const FALLBACK_ADMIN_PASSWORD_HASH = "aa25f4bc306d1555c12e63afdfddc86ae92f01e50e88ade8b0ac4d7197721b86";
const FALLBACK_ADMIN_SESSION_SECRET = "onegoods-cms-fallback-session-e8d55f1";

function sha256(value: string) {
  return createHash("sha256").update(value).digest("hex");
}

export function getAdminConfig() {
  return {
    email: process.env.ADMIN_EMAIL ?? FALLBACK_ADMIN_EMAIL,
    password: process.env.ADMIN_PASSWORD ?? "",
    passwordHash: process.env.ADMIN_PASSWORD_HASH ?? FALLBACK_ADMIN_PASSWORD_HASH,
    sessionSecret: process.env.ADMIN_SESSION_SECRET ?? FALLBACK_ADMIN_SESSION_SECRET,
  };
}

export function isAdminConfigured() {
  const config = getAdminConfig();
  return Boolean(config.email && (config.password || config.passwordHash) && config.sessionSecret);
}

export function verifyAdminCredentials(email: string, password: string) {
  const config = getAdminConfig();
  const passwordMatches = config.password ? password === config.password : sha256(password) === config.passwordHash;

  return (
    isAdminConfigured() &&
    email.trim().toLowerCase() === config.email.trim().toLowerCase() &&
    passwordMatches
  );
}

export async function hasAdminSession() {
  const config = getAdminConfig();
  if (!isAdminConfigured()) return false;
  const cookieStore = await cookies();
  return cookieStore.get(ADMIN_COOKIE)?.value === config.sessionSecret;
}
