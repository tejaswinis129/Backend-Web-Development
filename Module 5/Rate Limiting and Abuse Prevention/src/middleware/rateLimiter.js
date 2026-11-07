
'use strict';

// middleware/rateLimiter.js

const rateLimit = require('express-rate-limit');

const authLimiter = rateLimit({
    // 15-minute time window
    windowMs: 15 * 60 * 1000,

    // Maximum 5 attempts per IP
    max: 5,

    // Count only failed requests
    skipSuccessfulRequests: true,

    // Enable standard rate-limit headers
    standardHeaders: true,

    // Disable legacy headers
    legacyHeaders: false,
});

// Redis-backed store explanation:
//
// The default MemoryStore keeps counters in the memory
// of each Node.js server instance.
//
// When multiple instances run behind a load balancer,
// each instance maintains a separate counter. Therefore,
// users may exceed the intended rate limit.
//
// In production, rate-limit-redis can replace MemoryStore
// with a shared Redis connection. All server instances
// then use the same counter, enforcing one common limit.
//
// Example:
// store: new RedisStore({
//     sendCommand: (...args) => redis.call(...args)
// }),

module.exports = authLimiter;
