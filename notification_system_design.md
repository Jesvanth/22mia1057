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

# Stage 2

## Database Design for Notification Platform

### Database Choice: PostgreSQL (SQL)

**Why PostgreSQL?**
- Structured notification data fits relational model perfectly
- Complex queries (filter by type, date, isRead) are efficient with SQL
- ACID compliance ensures data integrity
- Scales well with indexes for millions of records

### DB Schema

```sql
CREATE TABLE students (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(100) NOT NULL,
  email VARCHAR(100) UNIQUE NOT NULL,
  roll_no VARCHAR(20) UNIQUE NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  type VARCHAR(20) CHECK (type IN ('Event', 'Result', 'Placement')) NOT NULL,
  message TEXT NOT NULL,
  is_read BOOLEAN DEFAULT FALSE,
  student_id UUID REFERENCES students(id) ON DELETE CASCADE,
  created_at TIMESTAMP DEFAULT NOW()
);
```

### Problems at Scale (50,000 students, 5M notifications)
- Full table scans become slow without indexes
- High read load on notifications table
- Solution: Add indexes on frequently queried columns

```sql
CREATE INDEX idx_notifications_student ON notifications(student_id);
CREATE INDEX idx_notifications_type ON notifications(type);
CREATE INDEX idx_notifications_read ON notifications(is_read);
CREATE INDEX idx_notifications_created ON notifications(created_at DESC);
```

### Sample Queries

**Get all unread notifications for a student:**
```sql
SELECT * FROM notifications
WHERE student_id = '<uuid>' AND is_read = FALSE
ORDER BY created_at DESC;
```

**Get notifications by type:**
```sql
SELECT * FROM notifications
WHERE student_id = '<uuid>' AND type = 'Placement'
ORDER BY created_at DESC;
```