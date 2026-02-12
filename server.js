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

// Catch-all route for any other requests
app.get('*', (req, res) => {
    // If requesting a static file, let express.static handle it
    if (req.path.match(/\.(html|css|js|png|jpg|jpeg|gif|ico|svg)$/)) {
        res.status(404).send('File not found');
    } else {
        // Otherwise, serve login page
        res.sendFile(path.join(__dirname, 'login.html'));
    }
});

app.listen(PORT, () => {
    console.log(`✅ Admin Dashboard running on port ${PORT}`);
    console.log(`🌐 Access at: http://localhost:${PORT}`);
});
