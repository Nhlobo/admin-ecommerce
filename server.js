const express = require('express');
const path = require('path');
const helmet = require('helmet');
const cors = require('cors');
const rateLimit = require('express-rate-limit');
require('dotenv').config();

const app = express();

// ============================================
// Environment Variable Validation
// ============================================
const requiredEnvVars = [];
const missingEnvVars = requiredEnvVars.filter(varName => !process.env[varName]);

if (missingEnvVars.length > 0) {
    console.error('❌ Missing required environment variables:', missingEnvVars.join(', '));
    console.error('Please check your .env file against .env.example');
    process.exit(1);
}

const PORT = process.env.PORT || 3000;
const NODE_ENV = process.env.NODE_ENV || 'development';
const TRUST_PROXY = process.env.TRUST_PROXY === 'true';

// ============================================
// Trust Proxy Configuration
// ============================================
if (TRUST_PROXY) {
    app.set('trust proxy', 1);
}

// ============================================
// Security Middleware - Helmet
// ============================================
app.use(helmet({
    contentSecurityPolicy: {
        directives: {
            defaultSrc: ["'self'"],
            styleSrc: ["'self'", "'unsafe-inline'", "https://cdnjs.cloudflare.com"],
            scriptSrc: ["'self'", "'unsafe-inline'"],
            fontSrc: ["'self'", "https://cdnjs.cloudflare.com"],
            imgSrc: ["'self'", "data:", "https:"],
            connectSrc: ["'self'", "http://localhost:3000", "https://*.onrender.com"]
        }
    },
    crossOriginEmbedderPolicy: false
}));

// ============================================
// CORS Configuration
// ============================================
const corsOptions = {
    origin: function (origin, callback) {
        // Allow requests with no origin (like mobile apps, curl, postman)
        if (!origin) return callback(null, true);
        
        const allowedOrigins = process.env.CORS_ORIGINS 
            ? process.env.CORS_ORIGINS.split(',').map(o => o.trim())
            : [`http://localhost:${PORT}`, `http://127.0.0.1:${PORT}`];
        
        if (allowedOrigins.indexOf(origin) !== -1 || NODE_ENV === 'development') {
            callback(null, true);
        } else {
            callback(new Error('Not allowed by CORS'));
        }
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
};

app.use(cors(corsOptions));

// ============================================
// Rate Limiting
// ============================================
const limiter = rateLimit({
    windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000, // 15 minutes
    max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS) || 100, // limit each IP to 100 requests per windowMs
    message: 'Too many requests from this IP, please try again later.',
    standardHeaders: true,
    legacyHeaders: false,
    handler: (req, res) => {
        console.warn(`⚠️  Rate limit exceeded for IP: ${req.ip}`);
        res.status(429).json({
            error: 'Too many requests',
            message: 'Please try again later'
        });
    }
});

app.use(limiter);

// ============================================
// Request Body Parsing
// ============================================
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// ============================================
// Request Logging Middleware
// ============================================
app.use((req, res, next) => {
    const timestamp = new Date().toISOString();
    const method = req.method;
    const url = req.url;
    const ip = req.ip || req.connection.remoteAddress;
    
    console.log(`[${timestamp}] ${method} ${url} - IP: ${ip}`);
    
    // Log response time
    const start = Date.now();
    res.on('finish', () => {
        const duration = Date.now() - start;
        console.log(`[${timestamp}] ${method} ${url} - ${res.statusCode} - ${duration}ms`);
    });
    
    next();
});

// ============================================
// Health Check Endpoint
// ============================================
app.get('/health', (req, res) => {
    res.status(200).json({
        status: 'healthy',
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
        environment: NODE_ENV
    });
});

// ============================================
// Application Routes
// ============================================

// Handle specific routes BEFORE serving static files
// This prevents express.static from serving index.html automatically

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'login.html'));
});

app.get('/login', (req, res) => {
    res.sendFile(path.join(__dirname, 'login.html'));
});

app.get('/dashboard', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

// ============================================
// Static File Serving with Security
// ============================================
// Block access to sensitive files before serving static files
app.use((req, res, next) => {
    const filename = path.basename(req.path);
    const sensitiveFiles = ['.env', '.env.local', '.env.development', '.env.production', 
                           '.env.test', 'package.json', 'package-lock.json', 
                           'server.js', '.git'];
    
    // Check if request is for a sensitive file or filename starts with .env
    if (sensitiveFiles.includes(filename) || filename.startsWith('.env')) {
        console.warn(`⚠️  Blocked access to sensitive file: ${req.path} from IP: ${req.ip}`);
        return res.status(403).json({ error: 'Forbidden' });
    }
    
    next();
});

// Serve static files (CSS, JS, images) from current directory
// Note: In production, consider serving these from a CDN or dedicated static server
app.use(express.static(path.join(__dirname), {
    maxAge: NODE_ENV === 'production' ? '1d' : 0,
    etag: true,
    lastModified: true
}));

// ============================================
// 404 Handler
// ============================================
app.use((req, res, next) => {
    // For any unmatched path, serve login page
    // This handles browser refreshes on any route
    res.sendFile(path.join(__dirname, 'login.html'));
});

// ============================================
// Global Error Handler
// ============================================
app.use((err, req, res, next) => {
    const timestamp = new Date().toISOString();
    const statusCode = err.statusCode || 500;
    
    // Log error with details
    console.error(`[${timestamp}] ERROR:`, {
        message: err.message,
        stack: NODE_ENV === 'development' ? err.stack : undefined,
        url: req.url,
        method: req.method,
        ip: req.ip
    });
    
    // Send error response
    res.status(statusCode).json({
        error: NODE_ENV === 'production' ? 'Internal Server Error' : err.message,
        timestamp,
        ...(NODE_ENV === 'development' && { stack: err.stack })
    });
});

// ============================================
// Server Initialization
// ============================================
let server;

const startServer = () => {
    server = app.listen(PORT, () => {
        console.log('='.repeat(50));
        console.log(`✅ Admin Dashboard running on port ${PORT}`);
        console.log(`🌐 Environment: ${NODE_ENV}`);
        console.log(`🔒 Security: Helmet enabled`);
        console.log(`🚦 Rate limiting: Active`);
        console.log(`📝 Access at: http://localhost:${PORT}`);
        console.log(`🔐 Login page: http://localhost:${PORT}/login`);
        console.log(`📊 Dashboard: http://localhost:${PORT}/dashboard`);
        console.log(`💚 Health check: http://localhost:${PORT}/health`);
        console.log('='.repeat(50));
    });
};

// ============================================
// Graceful Shutdown
// ============================================
const gracefulShutdown = (signal) => {
    console.log(`\n${signal} received. Starting graceful shutdown...`);
    
    if (server) {
        server.close(() => {
            console.log('✅ HTTP server closed');
            console.log('👋 Process terminated gracefully');
            process.exit(0);
        });
        
        // Force shutdown after 10 seconds
        setTimeout(() => {
            console.error('⚠️  Forced shutdown after timeout');
            process.exit(1);
        }, 10000);
    } else {
        process.exit(0);
    }
};

// Handle termination signals
process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));

// Handle uncaught exceptions
process.on('uncaughtException', (err) => {
    console.error('💥 Uncaught Exception:', err);
    gracefulShutdown('UNCAUGHT_EXCEPTION');
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (reason, promise) => {
    console.error('💥 Unhandled Rejection at:', promise, 'reason:', reason);
    gracefulShutdown('UNHANDLED_REJECTION');
});

// Start the server
startServer();

// Export for testing
module.exports = app;
