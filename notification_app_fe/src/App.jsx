import { useState, useEffect } from "react";
import axios from "axios";
import {
  AppBar, Toolbar, Typography, Container, Tabs, Tab, Box,
  Card, CardContent, Chip, CircularProgress, TextField, Badge
} from "@mui/material";
import NotificationsIcon from "@mui/icons-material/Notifications";

const API = "http://localhost:5000";

const TYPE_COLOR = {
  Placement: "success",
  Result: "warning",
  Event: "info"
};

function NotificationCard({ notif, isNew }) {
  return (
    <Card sx={{ mb: 1.5, border: isNew ? "2px solid #1976d2" : "1px solid #eee" }}>
      <CardContent sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <Box>
          <Chip label={notif.Type} color={TYPE_COLOR[notif.Type]} size="small" sx={{ mb: 0.5 }} />
          {isNew && <Chip label="NEW" color="primary" size="small" sx={{ ml: 1, mb: 0.5 }} />}
          <Typography variant="body1">{notif.Message}</Typography>
          <Typography variant="caption" color="text.secondary">{notif.Timestamp}</Typography>
        </Box>
      </CardContent>
    </Card>
  );
}

export default function App() {
  const [tab, setTab] = useState(0);
  const [all, setAll] = useState([]);
  const [priority, setPriority] = useState([]);
  const [seen, setSeen] = useState(new Set());
  const [loading, setLoading] = useState(true);
  const [n, setN] = useState(10);
  const [filterType, setFilterType] = useState("All");

  const fetchAll = async () => {
    try {
      const res = await axios.get(`${API}/notifications`);
      const notifs = res.data.notifications;
      setAll(prev => {
        const newIds = notifs.map(n => n.ID);
        setSeen(s => {
          if (s.size === 0) return new Set(newIds);
          return s;
        });
        return notifs;
      });
    } catch (err) {
      console.error(err);
    }
  };

  const fetchPriority = async () => {
    try {
      const res = await axios.get(`${API}/priority-inbox?n=${n}`);
      setPriority(res.data.notifications);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      await fetchAll();
      await fetchPriority();
      setLoading(false);
    };
    load();
    const interval = setInterval(load, 30000);
    return () => clearInterval(interval);
  }, [n]);

  const filtered = filterType === "All" ? all : all.filter(n => n.Type === filterType);
  const newCount = all.filter(n => !seen.has(n.ID)).length;

  return (
    <Box sx={{ flexGrow: 1 }}>
      <AppBar position="static">
        <Toolbar>
          <Badge badgeContent={newCount} color="error">
            <NotificationsIcon sx={{ mr: 2 }} />
          </Badge>
          <Typography variant="h6">Campus Notification Platform</Typography>
        </Toolbar>
      </AppBar>

      <Container maxWidth="md" sx={{ mt: 3 }}>
        <Tabs value={tab} onChange={(e, v) => setTab(v)} sx={{ mb: 2 }}>
          <Tab label="All Notifications" />
          <Tab label="Priority Inbox" />
        </Tabs>

        {loading ? (
          <Box sx={{ display: "flex", justifyContent: "center", mt: 5 }}>
            <CircularProgress />
          </Box>
        ) : (
          <>
            {tab === 0 && (
              <Box>
                <Box sx={{ display: "flex", gap: 1, mb: 2 }}>
                  {["All", "Placement", "Result", "Event"].map(t => (
                    <Chip
                      key={t}
                      label={t}
                      onClick={() => setFilterType(t)}
                      color={filterType === t ? "primary" : "default"}
                      clickable
                    />
                  ))}
                </Box>
                <Typography variant="subtitle2" sx={{ mb: 1 }}>
                  {filtered.length} notifications
                </Typography>
                {filtered.map(n => (
                  <NotificationCard key={n.ID} notif={n} isNew={!seen.has(n.ID)} />
                ))}
              </Box>
            )}

            {tab === 1 && (
              <Box>
                <Box sx={{ display: "flex", alignItems: "center", gap: 2, mb: 2 }}>
                  <Typography>Show top:</Typography>
                  <TextField
                    type="number"
                    size="small"
                    value={n}
                    onChange={e => setN(parseInt(e.target.value) || 10)}
                    inputProps={{ min: 1, max: 20 }}
                    sx={{ width: 80 }}
                  />
                  <Typography>notifications</Typography>
                </Box>
                {priority.map(n => (
                  <NotificationCard key={n.ID} notif={n} isNew={!seen.has(n.ID)} />
                ))}
              </Box>
            )}
          </>
        )}
      </Container>
    </Box>
  );
}