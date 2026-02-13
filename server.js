const express = require('express');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// Serve static files from current directory
app.use(express.static(path.join(__dirname)));

// Handle SPA routing - serve appropriate HTML files
app.get('/login', (req, res) => {
    res.sendFile(path.join(__dirname, 'login.html'));
});

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'login.html'));
});

app.get('/dashboard', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

// Serve specific HTML files
app.get('/login.html', (req, res) => {
    res.sendFile(path.join(__dirname, 'login.html'));
});

app.get('/index.html', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

// Catch-all route for any other requests
app.get('*', (req, res) => {
    // If requesting a static file (css, js, images, etc)
    if (req.path.match(/\.(css|js|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$/)) {
        // Let express.static handle it, or return 404 if not found
        res.status(404).send('File not found');
    } else {
        // For any other path, redirect to login page
        // This handles browser refreshes on any route
        res.sendFile(path.join(__dirname, 'login.html'));
    }
});

app.listen(PORT, () => {
    console.log(`✅ Admin Dashboard running on port ${PORT}`);
    console.log(`🌐 Access at: http://localhost:${PORT}`);
    console.log(`📝 Login page: http://localhost:${PORT}/login`);
    console.log(`📊 Dashboard: http://localhost:${PORT}/dashboard`);
});
