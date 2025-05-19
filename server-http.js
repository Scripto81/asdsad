javascript
const express = require('express');
const app = express();
const port = process.env.PORT || 8080;
const host = '0.0.0.0'; // Bind to all interfaces for Render

app.use(express.json());

const clients = new Map(); // Store clients by username
const ADMIN_USERNAME = "Demon8989_19";
const ADMIN_KEY = "supersecretkey123"; // Hardcoded key for Demon8989_19

// Register a player
app.post('/register', (req, res) => {
    const { username } = req.body;
    if (!username) {
        return res.status(400).json({ success: false, error: 'Username required' });
    }
    clients.set(username, { lastPing: Date.now(), command: null });
    console.log(`[${new Date().toISOString()}] ${username} registered`);
    res.json({ success: true });
});

// Handle control commands from Demon8989_19
app.post('/control', (req, res) => {
    const { sender, key, target, action, params } = req.body;
    if (sender !== ADMIN_USERNAME || key !== ADMIN_KEY) {
        return res.status(403).json({ success: false, error: 'Unauthorized' });
    }
    if (!clients.has(target)) {
        return res.status(404).json({ success: false, error: 'Target not found' });
    }
    clients.get(target).command = { action, params };
    console.log(`[${new Date().toISOString()}] Control command for ${target}: ${action}`);
    res.json({ success: true });
});

// Get list of connected players (for Demon8989_19)
app.get('/getPlayers', (req, res) => {
    const players = Array.from(clients.keys()).filter(u => u !== ADMIN_USERNAME);
    console.log(`[${new Date().toISOString()}] Sent player list:`, players);
    res.json({ players });
});

// Check for pending commands (for non-privileged players)
app.get('/checkCommand/:username', (req, res) => {
    const { username } = req.params;
    const client = clients.get(username);
    if (!client) {
        return res.status(404).json({ success: false, error: 'Client not found' });
    }
    client.lastPing = Date.now(); // Update last ping
    if (client.command) {
        const command = client.command;
        client.command = null; // Clear command after sending
        console.log(`[${new Date().toISOString()}] Sent command to ${username}: ${command.action}`);
        return res.json({ success: true, command });
    }
    res.json({ success: false });
});

// Clean up inactive clients (every 30 seconds)
setInterval(() => {
    const now = Date.now();
    for (const [username, client] of clients) {
        if (now - client.lastPing > 60000) { // 60 seconds inactivity
            clients.delete(username);
            console.log(`[${new Date().toISOString()}] Removed inactive client: ${username}`);
        }
    }
}, 30000);

app.listen(port, host, () => {
    console.log(`[${new Date().toISOString()}] HTTP server running on ${host}:${port}`);
});
