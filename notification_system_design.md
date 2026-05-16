# Stage 1

## REST API Design for Campus Notification Platform

### Base URL
http://localhost:5000/api

### Authentication
All endpoints require Bearer token in header:
Authorization: Bearer <token>

### Endpoints

#### 1. Get All Notifications
GET /notifications
**Headers:**
```json
{ "Authorization": "Bearer <token>" }
```
**Response (200):**
```json
{
  "notifications": [
    {
      "ID": "uuid",
      "Type": "Event | Result | Placement",
      "Message": "string",
      "Timestamp": "2026-04-22 17:51:30",
      "isRead": false
    }
  ]
}
```

#### 2. Get Single Notification
GET /notifications/:id
**Response (200):**
```json
{
  "ID": "uuid",
  "Type": "Placement",
  "Message": "CSX Corporation hiring",
  "Timestamp": "2026-04-22 17:51:18",
  "isRead": false
}
```

#### 3. Mark Notification as Read
PATCH /notifications/:id/read
**Response (200):**
```json
{ "message": "Notification marked as read" }
```

#### 4. Mark All as Read
PATCH /notifications/read-all
**Response (200):**
```json
{ "message": "All notifications marked as read" }
```

#### 5. Get Notifications by Type
GET /notifications?type=Placement
**Query Params:** `type` = Event | Result | Placement

### Real-Time Notifications
Use **WebSockets (Socket.io)** for real-time delivery:
- Server emits `new_notification` event when notification arrives
- Client listens and updates UI instantly without page reload