-- ============================================================
-- STAR TRACKER ERP – MySQL Schema Definition
-- Database Driver: PyMySQL
-- Star Point Conversion: 2 Star Points = 1 Internal Mark (Configurable)
-- ============================================================

CREATE DATABASE IF NOT EXISTS star_tracker CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE star_tracker;

-- 1. SYSTEM SETTINGS
CREATE TABLE IF NOT EXISTS system_settings (
    setting_key VARCHAR(100) PRIMARY KEY,
    setting_value VARCHAR(255) NOT NULL,
    description VARCHAR(255),
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 2. DEPARTMENTS / PROGRAMMES
CREATE TABLE IF NOT EXISTS departments (
    id INT AUTO_INCREMENT PRIMARY KEY,
    code VARCHAR(50) NOT NULL UNIQUE,
    name VARCHAR(255) NOT NULL,
    hod_id VARCHAR(36) NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 3. CLASSES / SECTIONS
CREATE TABLE IF NOT EXISTS classes (
    id INT AUTO_INCREMENT PRIMARY KEY,
    department_id INT NOT NULL,
    name VARCHAR(100) NOT NULL,
    section VARCHAR(10) NOT NULL,
    batch_year VARCHAR(50) NOT NULL,
    advisor_id VARCHAR(36) NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_classes_dept FOREIGN KEY (department_id) REFERENCES departments(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 4. USERS / PROFILES
CREATE TABLE IF NOT EXISTS users (
    id VARCHAR(36) PRIMARY KEY,
    reg_no_emp_id VARCHAR(100) NOT NULL UNIQUE,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    role ENUM('student', 'advisor', 'hod', 'dean', 'principal', 'admin') NOT NULL,
    department_id INT NULL,
    class_id INT NULL,
    year INT DEFAULT 1,
    semester INT DEFAULT 2,
    phone VARCHAR(50) NULL,
    avatar_url VARCHAR(500) NULL,
    status ENUM('active', 'inactive', 'suspended') DEFAULT 'active',
    is_deleted TINYINT(1) DEFAULT 0,
    deleted_at TIMESTAMP NULL,
    deleted_by VARCHAR(36) NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT fk_users_dept FOREIGN KEY (department_id) REFERENCES departments(id) ON DELETE SET NULL,
    CONSTRAINT fk_users_class FOREIGN KEY (class_id) REFERENCES classes(id) ON DELETE SET NULL,
    INDEX idx_users_role (role),
    INDEX idx_users_dept (department_id),
    INDEX idx_users_class (class_id),
    INDEX idx_users_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 5. VERTICALS (V1 to V10)
CREATE TABLE IF NOT EXISTS verticals (
    id INT AUTO_INCREMENT PRIMARY KEY,
    code VARCHAR(20) NOT NULL UNIQUE,
    name VARCHAR(255) NOT NULL,
    type ENUM('Mandatory', 'Optional') NOT NULL,
    min_sp INT DEFAULT 0,
    max_sp INT NOT NULL,
    bonus_max_sp INT DEFAULT 0,
    extended_max_sp INT NOT NULL,
    description TEXT,
    display_order INT NOT NULL,
    is_active TINYINT(1) DEFAULT 1,
    INDEX idx_verticals_active (is_active)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 6. ACTIVITIES
CREATE TABLE IF NOT EXISTS activities (
    id INT AUTO_INCREMENT PRIMARY KEY,
    vertical_id INT NOT NULL,
    activity_no INT NOT NULL,
    name VARCHAR(255) NOT NULL,
    is_bonus_eligible TINYINT(1) DEFAULT 0,
    max_sp INT NOT NULL,
    required_proof_type VARCHAR(100) DEFAULT 'PDF, Image',
    description TEXT,
    is_active TINYINT(1) DEFAULT 1,
    is_deleted TINYINT(1) DEFAULT 0,
    deleted_at TIMESTAMP NULL,
    deleted_by VARCHAR(36) NULL,
    CONSTRAINT fk_activities_vert FOREIGN KEY (vertical_id) REFERENCES verticals(id) ON DELETE CASCADE,
    INDEX idx_activities_vert (vertical_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 7. ACTIVITY LEVELS (L1 to L4)
CREATE TABLE IF NOT EXISTS activity_levels (
    id INT AUTO_INCREMENT PRIMARY KEY,
    activity_id INT NOT NULL,
    level_no INT NOT NULL,
    level_name VARCHAR(100) NOT NULL,
    description TEXT NOT NULL,
    sp_points INT NOT NULL,
    CONSTRAINT fk_levels_act FOREIGN KEY (activity_id) REFERENCES activities(id) ON DELETE CASCADE,
    INDEX idx_levels_act (activity_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 8. ACHIEVEMENTS / CERTIFICATE UPLOADS
CREATE TABLE IF NOT EXISTS achievements (
    id INT AUTO_INCREMENT PRIMARY KEY,
    student_id VARCHAR(36) NOT NULL,
    activity_id INT NOT NULL,
    level_id INT NOT NULL,
    claimed_sp INT NOT NULL,
    file_path VARCHAR(500) NOT NULL,
    proof_file_name VARCHAR(255) NOT NULL,
    proof_file_type VARCHAR(50) NOT NULL,
    student_remarks TEXT,
    status ENUM('pending', 'approved', 'rejected', 'returned') DEFAULT 'pending',
    advisor_remarks TEXT,
    reviewer_id VARCHAR(36) NULL,
    submitted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    reviewed_at TIMESTAMP NULL,
    is_deleted TINYINT(1) DEFAULT 0,
    deleted_at TIMESTAMP NULL,
    deleted_by VARCHAR(36) NULL,
    CONSTRAINT fk_achieve_student FOREIGN KEY (student_id) REFERENCES users(id) ON DELETE CASCADE,
    CONSTRAINT fk_achieve_act FOREIGN KEY (activity_id) REFERENCES activities(id) ON DELETE CASCADE,
    CONSTRAINT fk_achieve_lvl FOREIGN KEY (level_id) REFERENCES activity_levels(id) ON DELETE CASCADE,
    CONSTRAINT fk_achieve_rev FOREIGN KEY (reviewer_id) REFERENCES users(id) ON DELETE SET NULL,
    INDEX idx_achieve_student_status (student_id, status),
    INDEX idx_achieve_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 9. STAR TRANSACTIONS (Audit trail of awarded points)
CREATE TABLE IF NOT EXISTS star_transactions (
    id INT AUTO_INCREMENT PRIMARY KEY,
    student_id VARCHAR(36) NOT NULL,
    achievement_id INT NOT NULL,
    vertical_id INT NOT NULL,
    sp_awarded INT NOT NULL,
    is_bonus TINYINT(1) DEFAULT 0,
    awarded_by VARCHAR(36) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_txn_student FOREIGN KEY (student_id) REFERENCES users(id) ON DELETE CASCADE,
    CONSTRAINT fk_txn_achieve FOREIGN KEY (achievement_id) REFERENCES achievements(id) ON DELETE CASCADE,
    CONSTRAINT fk_txn_vert FOREIGN KEY (vertical_id) REFERENCES verticals(id) ON DELETE CASCADE,
    CONSTRAINT fk_txn_awarder FOREIGN KEY (awarded_by) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_txn_student (student_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 10. STUDENT SUMMARIES (Precomputed/cached scores)
CREATE TABLE IF NOT EXISTS student_summaries (
    id INT AUTO_INCREMENT PRIMARY KEY,
    student_id VARCHAR(36) NOT NULL UNIQUE,
    total_sp INT DEFAULT 0,
    bonus_sp INT DEFAULT 0,
    internal_marks_100 DECIMAL(5,1) DEFAULT 0.0,
    internal_marks_50 DECIMAL(5,1) DEFAULT 0.0,
    internal_marks_60 DECIMAL(5,1) DEFAULT 0.0,
    mandatory_satisfied TINYINT(1) DEFAULT 0,
    carry_forward_sp INT DEFAULT 0,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT fk_sum_student FOREIGN KEY (student_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 11. NOTIFICATIONS
CREATE TABLE IF NOT EXISTS notifications (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id VARCHAR(36) NOT NULL,
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    type ENUM('info', 'approval', 'rejection', 'returned', 'system') DEFAULT 'info',
    is_read TINYINT(1) DEFAULT 0,
    is_deleted TINYINT(1) DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_notif_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_notif_user_read (user_id, is_read)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 12. AUDIT LOGS
CREATE TABLE IF NOT EXISTS audit_logs (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id VARCHAR(36) NULL,
    user_role VARCHAR(50) NULL,
    action VARCHAR(100) NOT NULL,
    entity_type VARCHAR(100) NOT NULL,
    entity_id INT NULL,
    details TEXT,
    ip_address VARCHAR(100) NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_audit_user (user_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
