const express = require('express');
const axios = require('axios');
const cors = require('cors');
const { Log, getToken, refreshToken } = require('../logging_middleware/index');

const app = express();
app.use(cors());
app.use(express.json());

const WEIGHT = { Placement: 3, Result: 2, Event: 1 };

async function getAuthToken() {
  let token = getToken();
  if (!token) {
    await refreshToken();
    token = getToken();
  }
  return token;
}

// Get top N priority notifications
app.get('/priority-inbox', async (req, res) => {
  try {
    const n = parseInt(req.query.n) || 10;
    const token = await getAuthToken();

    await Log("backend", "info", "route", `Priority inbox requested for top ${n}`);

    const response = await axios.get(
      'http://4.224.186.213/evaluation-service/notifications',
      { headers: { Authorization: `Bearer ${token}` } }
    );

    const notifications = response.data.notifications;

    const scored = notifications.map(notif => ({
      ...notif,
      score: WEIGHT[notif.Type] * 1000000 + new Date(notif.Timestamp).getTime() / 1000000
    }));

    scored.sort((a, b) => b.score - a.score);
    const topN = scored.slice(0, n);

    await Log("backend", "info", "route", `Returning top ${n} priority notifications`);
    res.json({ total: notifications.length, showing: n, notifications: topN });
  } catch (err) {
    await Log("backend", "error", "route", `Priority inbox error: ${err.message}`);
    res.status(500).json({ message: err.message });
  }
});

// Get all notifications
app.get('/notifications', async (req, res) => {
  try {
    const token = await getAuthToken();
    await Log("backend", "info", "route", "Fetching all notifications");

    const response = await axios.get(
      'http://4.224.186.213/evaluation-service/notifications',
      { headers: { Authorization: `Bearer ${token}` } }
    );

    res.json(response.data);
  } catch (err) {
    await Log("backend", "error", "route", `Fetch error: ${err.message}`);
    res.status(500).json({ message: err.message });
  }
});

app.listen(5000, () => {
  console.log('Backend running on port 5000');
  Log("backend", "info", "service", "Backend server started on port 5000");
});