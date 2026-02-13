const express = require('express');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

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

// Serve static files (CSS, JS, images) from current directory
app.use(express.static(path.join(__dirname)));

// Catch-all route for any other requests
app.get('*', (req, res) => {
    // For any unmatched path, serve login page
    // This handles browser refreshes on any route
    res.sendFile(path.join(__dirname, 'login.html'));
});

app.listen(PORT, () => {
    console.log(`✅ Admin Dashboard running on port ${PORT}`);
    console.log(`🌐 Access at: http://localhost:${PORT}`);
    console.log(`📝 Login page: http://localhost:${PORT}/login`);
    console.log(`📊 Dashboard: http://localhost:${PORT}/dashboard`);
});
