import { NextRequest } from 'next/server';

// In-memory store for rate limiting
interface RateLimitEntry {
  count: number;
  reset: number;
}

const inMemoryStore: Record<string, RateLimitEntry> = {};

// Clean up expired entries from in-memory store periodically
if (typeof setInterval !== 'undefined') {
  setInterval(() => {
    const now = Date.now();
    Object.keys(inMemoryStore).forEach(key => {
      if (inMemoryStore[key].reset <= now) {
        delete inMemoryStore[key];
      }
    });
  }, 60000); // Run every minute
}

/**
 * Get IP address from request
 */
function getIP(request: NextRequest): string {
  // Try to get IP from headers first
  const forwardedFor = request.headers.get('x-forwarded-for');
  if (forwardedFor) {
    // x-forwarded-for may contain multiple IPs, take the first one
    return forwardedFor.split(',')[0].trim();
  }
  
  // Fallback to connection remote address or a placeholder
  return 'unknown-ip';
}

/**
 * Rate limit requests based on IP address
 * @param request - The Next.js request object
 * @param limit - Number of requests allowed per minute
 * @returns Object with success flag
 */
export async function limitRequests(request: NextRequest, limit: number = 10) {
  // Get IP from request
  const ip = getIP(request);
  
  // If we are in development, don't rate limit
  if (process.env.NODE_ENV === 'development') {
    return { success: true };
  }
  
  // Use path in the key to separate limits for different endpoints
  const path = new URL(request.url).pathname;
  const key = `ratelimit:${ip}:${path}`;
  
  // Current timestamp in seconds
  const now = Math.floor(Date.now() / 1000);
  
  // 60-second window
  const window = 60;
  const expiry = now + window;
  
  try {
    // Use in-memory store
    if (inMemoryStore[key]) {
      // If window has expired, reset
      if (inMemoryStore[key].reset <= now) {
        inMemoryStore[key] = { count: 1, reset: expiry };
      } else {
        // Increment count
        inMemoryStore[key].count += 1;
        
        // If over limit, return error
        if (inMemoryStore[key].count > limit) {
          return { success: false };
        }
      }
    } else {
      // Create new rate limit entry
      inMemoryStore[key] = { count: 1, reset: expiry };
    }
    
    return { success: true };
  } catch (error) {
    console.error('Rate limiting error:', error);
    // On error, allow the request to proceed
    return { success: true };
  }
}