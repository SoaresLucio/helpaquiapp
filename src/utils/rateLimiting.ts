
interface RateLimitConfig {
  maxRequests: number;
  windowMs: number;
}

interface RateLimitEntry {
  count: number;
  resetTime: number;
}

class RateLimiter {
  private limits: Map<string, RateLimitEntry> = new Map();
  private config: RateLimitConfig;

  constructor(config: RateLimitConfig) {
    this.config = config;
    
    // Limpa entradas expiradas a cada minuto
    setInterval(() => {
      this.cleanup();
    }, 60000);
  }

  isAllowed(identifier: string): boolean {
    const now = Date.now();
    const entry = this.limits.get(identifier);

    if (!entry || now >= entry.resetTime) {
      // Primeira requisição ou janela expirou
      this.limits.set(identifier, {
        count: 1,
        resetTime: now + this.config.windowMs
      });
      return true;
    }

    if (entry.count >= this.config.maxRequests) {
      return false;
    }

    entry.count++;
    return true;
  }

  getRemainingRequests(identifier: string): number {
    const entry = this.limits.get(identifier);
    if (!entry || Date.now() >= entry.resetTime) {
      return this.config.maxRequests;
    }
    return Math.max(0, this.config.maxRequests - entry.count);
  }

  getResetTime(identifier: string): number {
    const entry = this.limits.get(identifier);
    if (!entry || Date.now() >= entry.resetTime) {
      return 0;
    }
    return entry.resetTime;
  }

  private cleanup(): void {
    const now = Date.now();
    for (const [key, entry] of this.limits) {
      if (now >= entry.resetTime) {
        this.limits.delete(key);
      }
    }
  }
}

// Rate limiters para diferentes operações
export const authRateLimiter = new RateLimiter({
  maxRequests: 5, // 5 tentativas
  windowMs: 15 * 60 * 1000 // 15 minutos
});

export const apiRateLimiter = new RateLimiter({
  maxRequests: 100, // 100 requests
  windowMs: 60 * 1000 // 1 minuto
});

export const paymentRateLimiter = new RateLimiter({
  maxRequests: 10, // 10 tentativas
  windowMs: 60 * 1000 // 1 minuto
});

export const fileUploadRateLimiter = new RateLimiter({
  maxRequests: 20, // 20 uploads
  windowMs: 60 * 1000 // 1 minuto
});

export const checkRateLimit = (limiter: RateLimiter, identifier: string): {
  allowed: boolean;
  remaining: number;
  resetTime: number;
} => {
  const allowed = limiter.isAllowed(identifier);
  const remaining = limiter.getRemainingRequests(identifier);
  const resetTime = limiter.getResetTime(identifier);

  return { allowed, remaining, resetTime };
};
