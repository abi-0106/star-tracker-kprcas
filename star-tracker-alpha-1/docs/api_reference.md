# Star Tracker REST API Reference

Base URL: `http://localhost:8000` (Proxied in development via `http://localhost:5173/api`)

All protected endpoints require an `Authorization: Bearer <JWT_TOKEN>` header or a valid `access_token` session cookie.

---

## 1. Authentication Endpoints

### `POST /api/auth/login`
Authenticates a user and returns a signed JWT token with user profile info.
* **Request Body**:
  ```json
  {
    "email": "student1@kprcas.ac.in",
    "password": "Password@123"
  }
  ```
* **Response `(200 OK)`**:
  ```json
  {
    "token": "eyJhbGciOi...",
    "user": {
      "id": 4,
      "email": "student1@kprcas.ac.in",
      "name": "Aarav Sharma",
      "role": "student",
      "roll_no": "21BCS001",
      "dept_id": 1,
      "class_id": 1,
      "dept_name": "Computer Science",
      "class_name": "III B.Sc CS - A"
    }
  }
  ```

### `GET /api/auth/me`
Fetches currently authenticated user context and profile.
* **Response `(200 OK)`**: Same as user object above.

### `POST /api/auth/logout`
Clears session token cookie.

---

## 2. Metadata & Vertical Endpoints

### `GET /api/verticals`
List all 10 Verticals (V1–V10) with descriptions and weightages.

### `GET /api/activities?vertical_id={id}`
List activities filtered by vertical or return all.

### `GET /api/activity-levels?activity_id={id}`
List levels for an activity with assigned Star Points.

### `GET /api/classes`
List available department classes.

---

## 3. Student Endpoints

### `GET /api/student/dashboard`
Returns student points total, calculated internal marks, recent submissions, and vertical point breakdowns.

### `GET /api/student/achievements`
Returns complete list of achievements submitted by the student with status filter (`all`, `approved`, `pending`, `rejected`, `returned`).

### `POST /api/student/achievements`
Submits a new achievement with proof document.
* **Form-Data**:
  - `title`: Certificate / Event title
  - `vertical_id`: ID of vertical
  - `activity_id`: ID of activity
  - `level_id`: ID of activity level
  - `event_date`: YYYY-MM-DD
  - `description`: Notes
  - `file`: PDF or Image file (Max 15MB)

### `GET /api/student/notifications`
Returns unread and read alerts for the student.

---

## 4. Class Advisor Endpoints

### `GET /api/advisor/dashboard`
Returns class statistics (total students, pending submissions, approved count, class points).

### `GET /api/advisor/pending-achievements`
Returns all unreviewed student submissions in the advisor's assigned class.

### `POST /api/advisor/review`
Processes a student achievement review.
* **Request Body**:
  ```json
  {
    "achievement_id": 12,
    "status": "approved", // "approved" | "rejected" | "returned"
    "remarks": "Verified against state sports tournament certificate."
  }
  ```

### `GET /api/advisor/students`
Returns complete roster of students in the advisor's class with point summaries and mark calculations.

### `GET /api/advisor/student/{id}/gallery`
Returns all verified certificates for a specific student.

---

## 5. Head of Department (HOD) Endpoints

### `GET /api/hod/stats`
Department-wide metrics (total students, star points, internal marks awarded, approved certificates).

### `GET /api/hod/advisors`
Directory of class advisors under the department with workload metrics.

### `GET /api/hod/students`
Consolidated student roster with Star Points and computed Internal Marks.

---

## 6. Admin Endpoints

### `GET /api/admin/stats`
Institution-wide operational analytics.

### `GET /api/admin/users`
User directory with filtering by role and search.

### `GET /api/admin/settings`
System settings key-value pairs (e.g. `sp_to_marks_ratio`).

### `POST /api/admin/settings`
Update system settings.

### `GET /api/admin/audit-logs`
Audit log of all actions in the system.

---

## 7. Leaderboard & Export Endpoints

### `GET /api/leaderboard`
Institution-wide top ranking students based on approved Star Points.

### `GET /api/export/marksheet?class_id={id}`
Generates and downloads an Excel marksheet (`.xlsx`) via pandas for official academic submission.
