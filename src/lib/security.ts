import bcrypt from "bcryptjs";

// Dummy hash for constant-time comparison when user is not found (prevents timing attacks)
export const DUMMY_HASH = "$2b$10$2uD1B8jQ7k1W8P5Y0z1qO.U8V7X6Z5Y4X3W2V1U0T9S8R7Q6P5O4N";

interface RateLimitRecord {
  count: number;
  resetAt: number;
}

const rateLimitMap = new Map<string, RateLimitRecord>();

const MAX_ATTEMPTS = 5;
const WINDOW_MS = 10 * 60 * 1000; // 10 minutes

/**
 * Validates and sanitizes username to prevent SQL injection, XSS, and buffer overflows.
 */
export function sanitizeAndValidateUsername(raw: unknown): {
  valid: boolean;
  username: string;
} {
  if (typeof raw !== "string") {
    return { valid: false, username: "" };
  }

  const username = raw.trim().toLowerCase();

  // Control characters or null bytes
  if (/[\x00-\x1F\x7F]/.test(username)) {
    return { valid: false, username: "" };
  }

  // Length limits
  if (username.length < 2 || username.length > 60) {
    return { valid: false, username: "" };
  }

  // Whitelist pattern: letters, numbers, dot, underscore, hyphen, @
  const safePattern = /^[a-zA-Z0-9._@-]+$/;
  if (!safePattern.test(username)) {
    return { valid: false, username: "" };
  }

  // Block SQL injection fragments
  const sqlFragments = ["--", "/*", "*/", ";", "'", "\"", "xp_"];
  for (const fragment of sqlFragments) {
    if (username.includes(fragment)) {
      return { valid: false, username: "" };
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
} {
  if (typeof raw !== "string") {
    return { valid: false, password: "" };
  }

  const password = raw;

  if (password.length < 4 || password.length > 128) {
    return { valid: false, password: "" };
  }

  if (password.includes("\0")) {
    return { valid: false, password: "" };
  }

  return { valid: true, password };
}

/**
 * Checks sliding window rate limit for login attempts.
 */
export function checkRateLimit(key: string): {
  allowed: boolean;
  retryAfterMinutes?: number;
} {
  const now = Date.now();
  const record = rateLimitMap.get(key);

  if (!record || now > record.resetAt) {
    return { allowed: true };
  }

  if (record.count >= MAX_ATTEMPTS) {
    const retryAfterMinutes = Math.ceil((record.resetAt - now) / 60000);
    return {
      allowed: false,
      retryAfterMinutes: Math.max(1, retryAfterMinutes),
    };
  }

  return { allowed: true };
}

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

export function resetRateLimit(key: string): void {
  rateLimitMap.delete(key);
}

export async function performTimingDummyCheck(password: string): Promise<void> {
  try {
    await bcrypt.compare(password, DUMMY_HASH);
  } catch {
    // ignore
  }
}
