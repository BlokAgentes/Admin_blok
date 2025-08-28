import rateLimit, { RateLimitRequestHandler } from 'express-rate-limit'
import { Request } from 'express'

/**
 * Security configuration for the application
 */

// Environment variables with defaults
export const securityConfig = {
  // Rate limiting
  rateLimitEnabled: process.env.RATE_LIMIT_ENABLED !== 'false', // Default: true
  rateLimitWindowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '900000'), // 15 minutes
  rateLimitMaxRequests: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || '100'), // Per window
  
  // Auth rate limiting
  authRateLimitWindowMs: parseInt(process.env.AUTH_RATE_LIMIT_WINDOW_MS || '900000'), // 15 minutes
  authRateLimitMaxRequests: parseInt(process.env.AUTH_RATE_LIMIT_MAX_REQUESTS || '5'), // Auth attempts
  
  // Password reset rate limiting
  passwordResetWindowMs: parseInt(process.env.PASSWORD_RESET_WINDOW_MS || '3600000'), // 1 hour
  passwordResetMaxRequests: parseInt(process.env.PASSWORD_RESET_MAX_REQUESTS || '3'), // Reset attempts
  
  // File upload limits
  maxFileSize: parseInt(process.env.MAX_FILE_SIZE || '5242880'), // 5MB in bytes
  allowedImageTypes: (process.env.ALLOWED_IMAGE_TYPES || 'image/jpeg,image/jpg,image/png,image/gif,image/webp').split(','),
  
  // Session security
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || '7d',
  sessionTimeout: parseInt(process.env.SESSION_TIMEOUT || '86400000'), // 24 hours in ms
  
  // CORS
  corsOrigins: process.env.CORS_ORIGINS ? 
    process.env.CORS_ORIGINS.split(',').map(origin => origin.trim()) : 
    ['http://localhost:3000', 'http://localhost:3001'],
  
  // Security headers
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'", "https:"],
      scriptSrc: ["'self'", "https:"],
      imgSrc: ["'self'", "data:", "https:"],
      connectSrc: ["'self'", "https:"],
      fontSrc: ["'self'", "https:", "data:"],
      objectSrc: ["'none'"],
      mediaSrc: ["'self'"],
      frameSrc: ["'none'"],
    }
  }
}

/**
 * Create custom rate limiter with proper IPv6 handling
 */
export const createRateLimit = (options: {
  windowMs: number
  max: number
  message: string
  keyGenerator?: (req: Request) => string
  skipSuccessfulRequests?: boolean
}): RateLimitRequestHandler => {
  return rateLimit({
    windowMs: options.windowMs,
    max: options.max,
    message: {
      error: 'Rate limit exceeded',
      message: options.message,
      retryAfter: `${Math.ceil(options.windowMs / 60000)} minutes`
    },
    standardHeaders: true, // Return rate limit info in `RateLimit-*` headers
    legacyHeaders: false, // Disable `X-RateLimit-*` headers
    keyGenerator: options.keyGenerator, // Let express-rate-limit handle default if not provided
    skipSuccessfulRequests: options.skipSuccessfulRequests || false,
    skip: (req, res) => {
      // Skip rate limiting if disabled
      if (!securityConfig.rateLimitEnabled) return true
      
      // Skip for successful requests if configured
      if (options.skipSuccessfulRequests && res.statusCode < 400) return true
      
      return false
    }
  })
}

/**
 * Auth-specific rate limiting with email-based limiting
 */
export const authRateLimit = createRateLimit({
  windowMs: securityConfig.authRateLimitWindowMs,
  max: securityConfig.authRateLimitMaxRequests,
  message: 'Too many authentication attempts. Please try again later.',
  keyGenerator: (req: Request) => {
    const email = req.body?.email || 'anonymous'
    return `auth:${email}`
  },
  skipSuccessfulRequests: true // Only count failed auth attempts
})

/**
 * Password reset rate limiting
 */
export const passwordResetRateLimit = createRateLimit({
  windowMs: securityConfig.passwordResetWindowMs,
  max: securityConfig.passwordResetMaxRequests,
  message: 'Too many password reset attempts. Please wait before requesting another reset.',
  keyGenerator: (req: Request) => {
    const email = req.body?.email || 'anonymous'
    return `password-reset:${email}`
  }
})

/**
 * General API rate limiting
 */
export const apiRateLimit = createRateLimit({
  windowMs: securityConfig.rateLimitWindowMs,
  max: securityConfig.rateLimitMaxRequests,
  message: 'Too many requests. Please try again later.'
})

/**
 * Strict rate limiting for sensitive operations
 */
export const strictRateLimit = createRateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 3, // 3 requests per minute
  message: 'Too many requests for this sensitive operation. Please wait.'
})

/**
 * Upload rate limiting
 */
export const uploadRateLimit = createRateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 5, // 5 uploads per minute
  message: 'Upload limit exceeded. Please wait before uploading again.'
})

/**
 * Validate security configuration
 */
export const validateSecurityConfig = () => {
  const errors: string[] = []
  
  if (securityConfig.rateLimitWindowMs < 60000) {
    errors.push('Rate limit window should be at least 1 minute')
  }
  
  if (securityConfig.rateLimitMaxRequests < 1) {
    errors.push('Rate limit max requests should be at least 1')
  }
  
  if (securityConfig.maxFileSize > 10 * 1024 * 1024) {
    errors.push('Max file size should not exceed 10MB')
  }
  
  if (securityConfig.corsOrigins.length === 0) {
    errors.push('At least one CORS origin must be configured')
  }
  
  if (errors.length > 0) {
    console.warn('Security configuration warnings:', errors)
  }
  
  return {
    valid: errors.length === 0,
    errors
  }
}

/**
 * Security middleware configuration
 */
export const helmetConfig = {
  contentSecurityPolicy: {
    directives: securityConfig.contentSecurityPolicy.directives,
    reportOnly: process.env.NODE_ENV !== 'production'
  },
  crossOriginEmbedderPolicy: { policy: 'credentialless' as const },
  crossOriginOpenerPolicy: { policy: 'same-origin-allow-popups' as const },
  crossOriginResourcePolicy: { policy: 'cross-origin' as const },
  dnsPrefetchControl: { allow: false },
  frameguard: { action: 'deny' as const },
  hidePoweredBy: true,
  hsts: {
    maxAge: 31536000, // 1 year
    includeSubDomains: true,
    preload: true
  },
  ieNoOpen: true,
  noSniff: true,
  originAgentCluster: true,
  permittedCrossDomainPolicies: false,
  referrerPolicy: { policy: 'no-referrer' as const },
  xssFilter: true
}

/**
 * CORS configuration
 */
export const corsConfig = {
  origin: (origin: string | undefined, callback: (err: Error | null, allow?: boolean) => void) => {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true)
    
    if (securityConfig.corsOrigins.includes(origin)) {
      callback(null, true)
    } else {
      callback(new Error('Not allowed by CORS'))
    }
  },
  credentials: true,
  optionsSuccessStatus: 200, // Some legacy browsers choke on 204
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: [
    'Origin',
    'X-Requested-With', 
    'Content-Type', 
    'Accept', 
    'Authorization',
    'X-Session-Token',
    'X-CSRF-Token'
  ],
  exposedHeaders: [
    'X-Session-Refreshed',
    'X-New-Access-Token',
    'X-RateLimit-Limit',
    'X-RateLimit-Remaining',
    'X-RateLimit-Reset'
  ]
}

/**
 * Input sanitization helpers
 */
export const sanitizeInput = {
  email: (email: string): string => {
    return email.toLowerCase().trim().replace(/[^\w@.-]/g, '')
  },
  
  filename: (filename: string): string => {
    return filename.replace(/[^a-zA-Z0-9.-]/g, '_').toLowerCase()
  },
  
  userInput: (input: string): string => {
    return input.trim().replace(/[<>]/g, '') // Basic XSS prevention
  }
}

// Validate configuration on import
validateSecurityConfig()