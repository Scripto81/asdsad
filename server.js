```javascript
const WebSocket = require('ws');
const port = process.env.PORT || 8080; // Use Render's assigned port or fallback to 8080
const host = '0.0.0.0'; // Bind to all interfaces for Render

const wss = new WebSocket.Server({ host: host, port: port });

const clients = new Map(); // Store clients by username
const ADMIN_USERNAME = "Demon8989_19";
const ADMIN_KEY = "supersecretkey123"; // Hardcoded key for Demon8989_19

wss.on('connection', (ws) => {
    let username = null;

    ws.on('message', (message) => {
        try {
            const data = JSON.parse(message.toString()); // Ensure message is string

            // Register client
            if (data.type === 'register') {
                username = data.username;
                clients.set(username, ws);
                console.log(`[${new Date().toISOString()}] ${username} connected`);
                // Broadcast updated player list to Demon8989_19
                if (username !== ADMIN_USERNAME) {
                    broadcastPlayerList();
                }
            }

            // Handle control commands
            if (data.type === 'control' && data.sender === ADMIN_USERNAME && data.key === ADMIN_KEY) {
                const targetClient = clients.get(data.target);
                if (targetClient && targetClient.readyState === WebSocket.OPEN) {
                    targetClient.send(JSON.stringify({
                        type: 'control',
                        action: data.action,
                        params: data.params
                    }));
                    console.log(`[${new Date().toISOString()}] Control command sent to ${data.target}: ${data.action}`);
                } else {
                    console.log(`[${new Date().toISOString()}] Target ${data.target} not found or disconnected`);
                }
            }
        } catch (e) {
            console.error(`[${new Date().toISOString()}] Error processing message:`, e);
        }
    });

    ws.on('close', () => {
        if (username) {
            clients.delete(username);
            console.log(`[${new Date().toISOString()}] ${username} disconnected`);
            broadcastPlayerList();
        }
    });

    ws.on('error', (error) => {
        console.error(`[${new Date().toISOString()}] WebSocket error for ${username || 'unknown'}:`, error);
    });
});

// Broadcast player list to Demon8989_19
function broadcastPlayerList() {
    const adminClient = clients.get(ADMIN_USERNAME);
    if (adminClient && adminClient.readyState === WebSocket.OPEN) {
        const players = Array.from(clients.keys()).filter(u => u !== ADMIN_USERNAME);
        adminClient.send(JSON.stringify({
            type: 'playerList',
            players: players
        }));
        console.log(`[${new Date().toISOString()}] Sent player list to ${ADMIN_USERNAME}:`, players);
    }
}

console.log(`[${new Date().toISOString()}] WebSocket server running on ${host}:${port}`);
```
