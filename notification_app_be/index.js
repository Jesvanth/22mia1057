const express = require('express');
const axios = require('axios');
const { Log } = require('../logging_middleware/index');

const app = express();
app.use(express.json());

const AUTH_TOKEN = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJNYXBDbGFpbXMiOnsiYXVkIjoiaHR0cDovLzIwLjI0NC41Ni4xNDQvZXZhbHVhdGlvbi1zZXJ2aWNlIiwiZW1haWwiOiJqZXN2YW50aC5zMjAyMkB2aXRzdHVkZW50LmFjLmluIiwiZXhwIjoxNzc4OTI5NTk0LCJpYXQiOjE3Nzg5Mjg2OTQsImlzcyI6IkFmZm9yZCBNZWRpY2FsIFRlY2hub2xvZ2llcyBQcml2YXRlIExpbWl0ZWQiLCJqdGkiOiI1OGFiNTM5MC1hMjJmLTRjODMtYTRkNi0xNzA0MzgxMDdlODAiLCJsb2NhbGUiOiJlbi1JTiIsIm5hbWUiOiJqZXN2YW50aCBzIiwic3ViIjoiZmU3ODVkZDUtYmRlNS00NzQyLWE3MWEtZTAwN2VjNWUxNjI3In0sImVtYWlsIjoiamVzdmFudGguczIwMjJAdml0c3R1ZGVudC5hYy5pbiIsIm5hbWUiOiJqZXN2YW50aCBzIiwicm9sbE5vIjoiMjJtaWExMDU3IiwiYWNjZXNzQ29kZSI6IlNmRnVXZyIsImNsaWVudElEIjoiZmU3ODVkZDUtYmRlNS00NzQyLWE3MWEtZTAwN2VjNWUxNjI3IiwiY2xpZW50U2VjcmV0IjoiYmtGc2FtY0NLRHdHSllOUCJ9.Bq4edGXtQbybjKGUqJx6VGa-rd_cVWtNavWQxWroLCg";

const WEIGHT = { Placement: 3, Result: 2, Event: 1 };

// Get top N priority notifications
app.get('/priority-inbox', async (req, res) => {
  try {
    const n = parseInt(req.query.n) || 10;

    await Log("backend", "info", "route", `Priority inbox requested for top ${n}`);

    const response = await axios.get(
      'http://4.224.186.213/evaluation-service/notifications',
      { headers: { Authorization: `Bearer ${AUTH_TOKEN}` } }
    );

    const notifications = response.data.notifications;

    // Score = weight * 1000000 + timestamp (newer = higher score)
    const scored = notifications.map(n => ({
      ...n,
      score: WEIGHT[n.Type] * 1000000 + new Date(n.Timestamp).getTime() / 1000000
    }));

    // Sort by score descending
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
    await Log("backend", "info", "route", "Fetching all notifications");

    const response = await axios.get(
      'http://4.224.186.213/evaluation-service/notifications',
      { headers: { Authorization: `Bearer ${AUTH_TOKEN}` } }
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