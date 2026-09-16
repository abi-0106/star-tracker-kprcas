# Star Tracker Database Design

## Database Engine
- **RDBMS**: MySQL 8.0+
- **Driver**: PyMySQL with `DictCursor`
- **Charset**: `utf8mb4` / `utf8mb4_unicode_ci`

---

## Entity Relationship Summary

```
departments (1) ──< classes (N) ──< users (N)
                                      │
                 ┌────────────────────┴────────────────────┐
                 │ (as student)                            │ (as advisor)
                 ▼                                         ▼
           achievements (N) >─── reviewed_by ───────── users (1)
                 │
                 ├──< star_transactions (1:1 per approved achievement)
                 │
                 └──< student_summaries (materialized rollups)

verticals (1) ──< activities (N) ──< activity_levels (N) ──< achievements
```

---

## Table Schemas

### 1. `system_settings`
Global application configuration.
* `id` INT AUTO_INCREMENT PRIMARY KEY
* `setting_key` VARCHAR(100) UNIQUE NOT NULL
* `setting_value` TEXT NOT NULL (e.g. `'2'` for `sp_to_marks_ratio`)
* `description` VARCHAR(255)
* `updated_at` TIMESTAMP

### 2. `departments`
Academic departments.
* `id` INT AUTO_INCREMENT PRIMARY KEY
* `code` VARCHAR(20) UNIQUE NOT NULL (e.g. `CS`, `IT`, `COMMERCE`)
* `name` VARCHAR(150) NOT NULL
* `created_at` TIMESTAMP

### 3. `classes`
Class sections within departments.
* `id` INT AUTO_INCREMENT PRIMARY KEY
* `dept_id` INT NOT NULL (FK -> `departments.id`)
* `name` VARCHAR(100) NOT NULL (e.g. `III B.Sc CS - A`)
* `batch_year` INT NOT NULL
* `semester` INT NOT NULL
* `advisor_id` INT NULL (FK -> `users.id`)

### 4. `users`
System user accounts.
* `id` INT AUTO_INCREMENT PRIMARY KEY
* `email` VARCHAR(150) UNIQUE NOT NULL
* `password_hash` VARCHAR(255) NOT NULL (bcrypt)
* `name` VARCHAR(150) NOT NULL
* `role` ENUM('student', 'advisor', 'hod', 'admin') NOT NULL
* `roll_no` VARCHAR(50) UNIQUE NULL (for students)
* `staff_id` VARCHAR(50) UNIQUE NULL (for faculty/admin)
* `dept_id` INT NULL (FK -> `departments.id`)
* `class_id` INT NULL (FK -> `classes.id`)
* `phone` VARCHAR(20) NULL
* `avatar_url` VARCHAR(255) NULL
* `is_active` BOOLEAN DEFAULT TRUE

### 5. `verticals`
The 10 curriculum verticals.
* `id` INT AUTO_INCREMENT PRIMARY KEY
* `code` VARCHAR(20) UNIQUE NOT NULL (e.g. `V1` ... `V10`)
* `name` VARCHAR(150) NOT NULL
* `description` TEXT NULL
* `weightage` DECIMAL(5,2) DEFAULT 10.00
* `display_order` INT NOT NULL

### 6. `activities`
Activity categories under verticals.
* `id` INT AUTO_INCREMENT PRIMARY KEY
* `vertical_id` INT NOT NULL (FK -> `verticals.id`)
* `name` VARCHAR(200) NOT NULL
* `description` TEXT NULL
* `max_points_per_year` INT NULL

### 7. `activity_levels`
Specific levels of achievement and their point awards.
* `id` INT AUTO_INCREMENT PRIMARY KEY
* `activity_id` INT NOT NULL (FK -> `activities.id`)
* `name` VARCHAR(200) NOT NULL (e.g. `National Level - 1st Prize`)
* `points` INT NOT NULL (Star Points awarded)
* `criteria` TEXT NULL

### 8. `achievements`
Student certificate submissions and advisor reviews.
* `id` INT AUTO_INCREMENT PRIMARY KEY
* `student_id` INT NOT NULL (FK -> `users.id`)
* `vertical_id` INT NOT NULL (FK -> `verticals.id`)
* `activity_id` INT NOT NULL (FK -> `activities.id`)
* `level_id` INT NOT NULL (FK -> `activity_levels.id`)
* `title` VARCHAR(255) NOT NULL
* `description` TEXT NULL
* `event_date` DATE NOT NULL
* `proof_url` VARCHAR(500) NOT NULL (local upload path)
* `proof_filename` VARCHAR(255) NOT NULL
* `proof_filetype` VARCHAR(50) NOT NULL
* `status` ENUM('pending', 'approved', 'rejected', 'returned') DEFAULT 'pending'
* `points_awarded` INT DEFAULT 0
* `reviewed_by` INT NULL (FK -> `users.id`)
* `reviewed_at` TIMESTAMP NULL
* `remarks` TEXT NULL
* `created_at` TIMESTAMP
* `updated_at` TIMESTAMP

### 9. `star_transactions`
Ledger of awarded Star Points.
* `id` INT AUTO_INCREMENT PRIMARY KEY
* `student_id` INT NOT NULL (FK -> `users.id`)
* `achievement_id` INT NOT NULL (FK -> `achievements.id`)
* `points` INT NOT NULL
* `transaction_type` ENUM('CREDIT', 'DEBIT', 'ADJUSTMENT') DEFAULT 'CREDIT'
* `created_at` TIMESTAMP

### 10. `student_summaries`
Rollup scores per student.
* `id` INT AUTO_INCREMENT PRIMARY KEY
* `student_id` INT UNIQUE NOT NULL (FK -> `users.id`)
* `total_points` INT DEFAULT 0
* `total_marks` DECIMAL(5,2) DEFAULT 0.00
* `approved_count` INT DEFAULT 0
* `pending_count` INT DEFAULT 0
* `rejected_count` INT DEFAULT 0
* `last_calculated_at` TIMESTAMP

### 11. `notifications`
In-app alerts for students and advisors.
* `id` INT AUTO_INCREMENT PRIMARY KEY
* `user_id` INT NOT NULL (FK -> `users.id`)
* `title` VARCHAR(200) NOT NULL
* `message` TEXT NOT NULL
* `type` ENUM('INFO', 'SUCCESS', 'WARNING', 'ERROR') DEFAULT 'INFO'
* `is_read` BOOLEAN DEFAULT FALSE
* `link` VARCHAR(255) NULL
* `created_at` TIMESTAMP

### 12. `audit_logs`
Traceable security and transaction logs.
* `id` INT AUTO_INCREMENT PRIMARY KEY
* `user_id` INT NULL (FK -> `users.id`)
* `action` VARCHAR(100) NOT NULL
* `entity_type` VARCHAR(100) NOT NULL
* `entity_id` INT NULL
* `details` TEXT NULL
* `ip_address` VARCHAR(50) NULL
* `created_at` TIMESTAMP
