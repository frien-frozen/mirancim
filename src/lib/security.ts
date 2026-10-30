import bcrypt from "bcryptjs";

// Dummy hash for constant-time comparison when user is not found (prevents timing attacks)
export const DUMMY_HASH = "$2b$10$2uD1B8jQ7k1W8P5Y0z1qO.U8V7X6Z5Y4X3W2V1U0T9S8R7Q6P5O4N";

interface RateLimitRecord {
  count: number;
  resetAt: number;
}

// In-memory rate limiting cache (sliding window)
const rateLimitMap = new Map<string, RateLimitRecord>();

const MAX_ATTEMPTS = 5;
const WINDOW_MS = 10 * 60 * 1000; // 10 minutes lockout

/**
 * Validates and sanitizes username to prevent SQL injection, XSS, and buffer overflows.
 */
export function sanitizeAndValidateUsername(raw: unknown): {
  valid: boolean;
  username: string;
  error?: string;
} {
  if (typeof raw !== "string") {
    return { valid: false, username: "", error: "Noto'g'ri ma'lumot formati" };
  }

  const username = raw.trim().toLowerCase();

  // Null byte or control character detection
  if (/[\x00-\x1F\x7F]/.test(username)) {
    return { valid: false, username: "", error: "Ruxsat berilmagan belgilar aniqlandi" };
  }

  // Length limits
  if (username.length < 3) {
    return { valid: false, username: "", error: "Foydalanuvchi nomi kamida 3 ta belgidan iborat bo'lishi kerak" };
  }
  if (username.length > 50) {
    return { valid: false, username: "", error: "Foydalanuvchi nomi 50 ta belgidan oshmasligi kerak" };
  }

  // Whitelist pattern: alphanumeric, dot, underscore, hyphen, @
  const safeUsernamePattern = /^[a-zA-Z0-9._@-]+$/;
  if (!safeUsernamePattern.test(username)) {
    return {
      valid: false,
      username: "",
      error: "Foydalanuvchi nomida faqat harflar, raqamlar, nuqta va @ ruxsat etiladi",
    };
  }

  // Explicit SQL Injection keyword / signature check
  const sqlInjectionSignatures = [
    "--",
    "/*",
    "*/",
    ";",
    "'",
    "\"",
    "union",
    "select",
    "insert",
    "drop",
    "delete",
    "update",
    "exec",
    "xp_",
    "or 1=1",
    "or '1'='1'",
  ];

  for (const sig of sqlInjectionSignatures) {
    if (username.includes(sig)) {
      return { valid: false, username: "", error: "Xavfsizlik qoidasi buzildi" };
    }
  }

  return { valid: true, username };
}

/**
 * Validates password length and structure.
 */
export function validatePassword(raw: unknown): {
  valid: boolean;
  password: string;
  error?: string;
} {
  if (typeof raw !== "string") {
    return { valid: false, password: "", error: "Noto'g'ri parol formati" };
  }

  const password = raw;

  if (password.length < 4) {
    return { valid: false, password: "", error: "Parol kamida 4 ta belgidan iborat bo'lishi kerak" };
  }

  // Prevent memory exhaustion / denial of service with huge payloads
  if (password.length > 128) {
    return { valid: false, password: "", error: "Parol uzunligi me'yordan oshib ketdi" };
  }

  // Null byte check
  if (password.includes("\0")) {
    return { valid: false, password: "", error: "Ruxsat berilmagan belgilar aniqlandi" };
  }

  return { valid: true, password };
}

/**
 * Checks rate limit for a specific IP or identifier.
 */
export function checkRateLimit(key: string): {
  allowed: boolean;
  remainingAttempts: number;
  retryAfterMinutes?: number;
} {
  const now = Date.now();
  const record = rateLimitMap.get(key);

  if (!record || now > record.resetAt) {
    return { allowed: true, remainingAttempts: MAX_ATTEMPTS };
  }

  if (record.count >= MAX_ATTEMPTS) {
    const retryAfterMinutes = Math.ceil((record.resetAt - now) / 60000);
    return {
      allowed: false,
      remainingAttempts: 0,
      retryAfterMinutes: Math.max(1, retryAfterMinutes),
    };
  }

  return {
    allowed: true,
    remainingAttempts: MAX_ATTEMPTS - record.count,
  };
}

/**
 * Records a failed attempt for a given key.
 */
export function recordFailedAttempt(key: string): void {
  const now = Date.now();
  const record = rateLimitMap.get(key);

  if (!record || now > record.resetAt) {
    rateLimitMap.set(key, {
      count: 1,
      resetAt: now + WINDOW_MS,
    });
  } else {
    record.count += 1;
  }
}

/**
 * Resets rate limit upon successful authentication.
 */
export function resetRateLimit(key: string): void {
  rateLimitMap.delete(key);
}

/**
 * Performs a constant-time comparison against a dummy hash to protect against timing attacks.
 */
export async function performTimingDummyCheck(password: string): Promise<void> {
  try {
    await bcrypt.compare(password, DUMMY_HASH);
  } catch {
    // ignore
  }
}
