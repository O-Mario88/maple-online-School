package httpx

import (
	"net"
	"net/http"
	"sync"
	"time"
)

// RateLimit allows at most limit requests per window from one client IP.
// It is in-memory, so each API instance counts separately.
func RateLimit(limit int, window time.Duration) func(http.Handler) http.Handler {
	var (
		mu      sync.Mutex
		buckets = map[string]*bucket{}
	)
	return func(next http.Handler) http.Handler {
		return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
			ip := clientIP(r)
			now := time.Now()

			mu.Lock()
			b, ok := buckets[ip]
			if !ok || now.After(b.resetAt) {
				b = &bucket{resetAt: now.Add(window)}
				buckets[ip] = b
			}
			b.count++
			over := b.count > limit
			if len(buckets) > maxTrackedClients {
				prune(buckets, now)
			}
			mu.Unlock()

			if over {
				w.Header().Set("Retry-After", b.resetAt.Sub(now).Round(time.Second).String())
				WriteError(w, http.StatusTooManyRequests, "throttled", "Too many requests. Try again shortly.")
				return
			}
			next.ServeHTTP(w, r)
		})
	}
}

const maxTrackedClients = 10_000

type bucket struct {
	count   int
	resetAt time.Time
}

func prune(buckets map[string]*bucket, now time.Time) {
	for ip, b := range buckets {
		if now.After(b.resetAt) {
			delete(buckets, ip)
		}
	}
}

// clientIP uses the connection address. chi's RealIP middleware, mounted only
// behind a trusted proxy, rewrites RemoteAddr from X-Forwarded-For first.
func clientIP(r *http.Request) string {
	host, _, err := net.SplitHostPort(r.RemoteAddr)
	if err != nil {
		return r.RemoteAddr
	}
	return host
}
