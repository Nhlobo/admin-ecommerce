const express = require('express');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;
const BACKEND_URL = process.env.BACKEND_URL || 'https://backend-ecommerce-1-xp4b.onrender.com';

app.use(express.json({ limit: '2mb' }));
app.use(express.urlencoded({ extended: true }));

// Proxy API calls through this server so admin UI uses same-origin requests.
app.use('/api', async (req, res) => {
    const upstreamUrl = `${BACKEND_URL}${req.originalUrl}`;

    try {
        const headers = {
            'Content-Type': req.headers['content-type'] || 'application/json'
        };

        if (req.headers.authorization) {
            headers.Authorization = req.headers.authorization;
        }

        const method = req.method.toUpperCase();
        const requestOptions = { method, headers };

        if (!['GET', 'HEAD'].includes(method)) {
            requestOptions.body = Object.keys(req.body || {}).length > 0
                ? JSON.stringify(req.body)
                : undefined;
        }

        const upstreamResponse = await fetch(upstreamUrl, requestOptions);
        const contentType = upstreamResponse.headers.get('content-type') || 'application/json';
        const responseBody = await upstreamResponse.text();

        res.status(upstreamResponse.status);
        res.set('Content-Type', contentType);
        return res.send(responseBody);
    } catch (error) {
        console.error('API proxy error:', error.message);
        return res.status(502).json({
            success: false,
            message: 'Unable to reach backend API. It may still be waking up.'
        });
    }
});

// Handle specific routes BEFORE serving static files
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'login.html'));
});

app.get('/login', (req, res) => {
    res.sendFile(path.join(__dirname, 'login.html'));
});

app.get('/dashboard', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

// Serve static files (CSS, JS, images) from current directory
app.use(express.static(path.join(__dirname)));

// Catch-all route for any other requests
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'login.html'));
});

app.listen(PORT, () => {
    console.log(`✅ Admin Dashboard running on port ${PORT}`);
    console.log(`🌐 Access at: http://localhost:${PORT}`);
    console.log(`🔗 Backend proxy target: ${BACKEND_URL}`);
});
