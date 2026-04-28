import type { NextRequest } from 'next/server'

/**
 * 단순 인메모리 IP 기반 rate limiter.
 * Vercel serverless에서는 인스턴스가 분산되어 완벽하지 않지만,
 * 단일 인스턴스 내에서는 봇/스팸 트래픽을 효과적으로 차단함.
 *
 * 더 강력한 보호가 필요하면 Upstash Redis 또는 Vercel KV로 교체.
 */

interface Bucket {
  count: number
  resetAt: number
}

const buckets = new Map<string, Bucket>()

// 주기적 cleanup (메모리 누수 방지)
let lastCleanup = 0
function maybeCleanup(now: number) {
  if (now - lastCleanup < 60_000) return
  lastCleanup = now
  for (const [k, v] of buckets) {
    if (now > v.resetAt) buckets.delete(k)
  }
}

export interface RateLimitOptions {
  /** 분당 허용 요청 수 (기본 10) */
  limit?: number
  /** 윈도우 길이 ms (기본 60초) */
  windowMs?: number
  /** 키 prefix (라우트별 구분) */
  prefix?: string
}

export interface RateLimitResult {
  allowed: boolean
  remaining: number
  resetAt: number
}

export function rateLimit(req: NextRequest, opts: RateLimitOptions = {}): RateLimitResult {
  const { limit = 10, windowMs = 60_000, prefix = 'global' } = opts
  const ip =
    req.headers.get('x-forwarded-for')?.split(',')[0].trim() ||
    req.headers.get('x-real-ip') ||
    'unknown'
  const key = `${prefix}:${ip}`
  const now = Date.now()
  maybeCleanup(now)

  const cur = buckets.get(key)
  if (!cur || now > cur.resetAt) {
    buckets.set(key, { count: 1, resetAt: now + windowMs })
    return { allowed: true, remaining: limit - 1, resetAt: now + windowMs }
  }

  if (cur.count >= limit) {
    return { allowed: false, remaining: 0, resetAt: cur.resetAt }
  }

  cur.count++
  return { allowed: true, remaining: limit - cur.count, resetAt: cur.resetAt }
}
