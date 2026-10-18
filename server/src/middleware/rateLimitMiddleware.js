class MemoryRateLimiter {
  constructor(windowMs, maxAttempts) {
    this.windowMs = windowMs;
    this.maxAttempts = maxAttempts;
    this.buckets = new Map();
  }

  check(key) {
    const now = Date.now();
    const record = this.buckets.get(key);
    if (!record || now > record.resetAt) {
      const fresh = { count: 1, resetAt: now + this.windowMs };
      this.buckets.set(key, fresh);
      return { allowed: true, remaining: this.maxAttempts - 1, resetAt: fresh.resetAt };
    }
    if (record.count >= this.maxAttempts) {
      return { allowed: false, remaining: 0, resetAt: record.resetAt };
    }
    record.count += 1;
    return { allowed: true, remaining: this.maxAttempts - record.count, resetAt: record.resetAt };
  }

  reset() {
    this.buckets.clear();
  }
}

module.exports = { MemoryRateLimiter };
