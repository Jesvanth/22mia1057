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
# Stage 3

## Query Analysis and Optimization

### Original Query
```sql
SELECT * FROM notifications
WHERE studentID = 1042 AND isRead = false
ORDER BY createdAt ASC;
```

### Is this query accurate?
Yes, the query is logically correct — it fetches all unread notifications for a specific student ordered by time.

### Why is it slow?
With 50,000 students and 5,000,000 notifications:
- No indexes on `studentID`, `isRead`, or `createdAt`
- Full table scan on 5M rows every time
- `ORDER BY createdAt` without index causes expensive sort

### Fix — Add Indexes
```sql
CREATE INDEX idx_student_id ON notifications(studentID);
CREATE INDEX idx_is_read ON notifications(isRead);
CREATE INDEX idx_created_at ON notifications(createdAt ASC);

-- Best: Composite index for this exact query
CREATE INDEX idx_student_unread ON notifications(studentID, isRead, createdAt ASC);
```

### Should we add indexes on EVERY column?
**No!** Adding indexes on every column is bad advice because:
- Indexes slow down INSERT, UPDATE, DELETE operations
- Each index takes extra disk space
- Only index columns used in WHERE, ORDER BY, or JOIN clauses

### Find students with Placement notification in last 7 days
```sql
SELECT DISTINCT studentID FROM notifications
WHERE notificationType = 'Placement'
AND createdAt >= NOW() - INTERVAL '7 days';
```