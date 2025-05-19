```javascript
const express = require('express');
const app = express();
const port = process.env.PORT || 8080;

app.use(express.json());

const clients = new Map();
const ADMIN_USERNAME = "Demon8989_19";
const ADMIN_KEY = "supersecretkey123";

app.post('/register', (req, res) => {
    const { username } = req.body;
    clients.set(username, { lastPing: Date.now(), command: null });
    console.log(`[${new Date().toISOString()}] ${username} registered`);
    res.json({ success: true });
});

app.post('/control', (req, res) => {
    const { sender, key, target, action, params } = req.body;
    if (sender === ADMIN_USERNAME && key === ADMIN_KEY && clients.has(target)) {
        clients.get(target).command = { action, params };
        console.log(`[${new Date().toISOString()}] Control command for ${target}: ${action}`);
        res.json({ success: true });
    } else {
        res.json({ success: false, error: 'Invalid request' });
    }
});

app.get('/getPlayers', (req, res) => {
    const players = Array.from(clients.keys()).filter(u => u !== ADMIN_USERNAME);
    res.json({ players });
});

app.get('/checkCommand/:username', (req, res) => {
    const { username } = req.params;
    const client = clients.get(username);
    if (client && client.command) {
        res.json({ success: true, command: client.command });
        client.command = null; // Clear command after sending
    } else {
        res.json({ success: false });
    }
});

app.listen(port, '0.0.0.0', () => {
    console.log(`[${new Date().toISOString()}] HTTP server running on port ${port}`);
});
```
