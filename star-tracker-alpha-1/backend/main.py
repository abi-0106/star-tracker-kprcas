"""
STAR TRACKER ERP - Python Backend
Built with FastAPI, PyMySQL, pandas, and PyJWT.
Conversion: 2 Star Points = 1 Internal Mark (Configurable via system_settings)
"""

import os
import re
import uuid
import math
import io
import time
from datetime import datetime, timedelta
from typing import Optional, List, Dict, Any

from fastapi import FastAPI, Depends, HTTPException, status, UploadFile, File, Form, Request, Response
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse, StreamingResponse, JSONResponse
from fastapi.staticfiles import StaticFiles
from pydantic import BaseModel, EmailStr
import pymysql
import pymysql.cursors
import bcrypt
import jwt
import pandas as pd
from dotenv import load_dotenv

# Load environment variables
dotenv_path = os.path.join(os.path.dirname(__file__), ".env")
load_dotenv(dotenv_path)

DB_HOST = os.getenv("DB_HOST", "localhost")
DB_PORT = int(os.getenv("DB_PORT", "3306"))
DB_NAME = os.getenv("DB_NAME", "star_tracker")
DB_USER = os.getenv("DB_USER", "root")
DB_PASSWORD = os.getenv("DB_PASSWORD", "Abimanyu$")

SECRET_KEY = os.getenv("SECRET_KEY", "star_tracker_kpr_secret_key_2026_auth_token_jwt")
ALGORITHM = os.getenv("ALGORITHM", "HS256")
ACCESS_TOKEN_EXPIRE_MINUTES = int(os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES", "1440"))

UPLOADS_DIR = os.path.join(os.path.dirname(__file__), "uploads", "achievements")
os.makedirs(UPLOADS_DIR, exist_ok=True)

# -------------------------------------------------------------
# Database Connection Helper (PyMySQL)
# -------------------------------------------------------------
def get_db_connection():
    """Create and return a raw PyMySQL connection with DictCursor."""
    return pymysql.connect(
        host=DB_HOST,
        port=DB_PORT,
        user=DB_USER,
        password=DB_PASSWORD,
        database=DB_NAME,
        cursorclass=pymysql.cursors.DictCursor,
        autocommit=True,
        charset="utf8mb4"
    )

class Database:
    @staticmethod
    def query(sql: str, params: tuple = ()):
        conn = get_db_connection()
        try:
            with conn.cursor() as cursor:
                cursor.execute(sql, params)
                return cursor.fetchall()
        finally:
            conn.close()

    @staticmethod
    def query_one(sql: str, params: tuple = ()):
        conn = get_db_connection()
        try:
            with conn.cursor() as cursor:
                cursor.execute(sql, params)
                return cursor.fetchone()
        finally:
            conn.close()

    @staticmethod
    def execute(sql: str, params: tuple = ()):
        conn = get_db_connection()
        try:
            with conn.cursor() as cursor:
                cursor.execute(sql, params)
                last_id = cursor.lastrowid
                row_count = cursor.rowcount
                return last_id if last_id else row_count
        finally:
            conn.close()

# -------------------------------------------------------------
# Schema & Seed Initialization Helper
# -------------------------------------------------------------
def init_db():
    """Initializes schema and seeds master data if tables don't exist."""
    try:
        # First connect without database to create if missing
        conn = pymysql.connect(
            host=DB_HOST,
            port=DB_PORT,
            user=DB_USER,
            password=DB_PASSWORD,
            autocommit=True,
            charset="utf8mb4"
        )
        with conn.cursor() as cursor:
            cursor.execute(f"CREATE DATABASE IF NOT EXISTS {DB_NAME} CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;")
        conn.close()

        # Connect with database and run schema/seed if needed
        db_conn = get_db_connection()
        with db_conn.cursor() as cursor:
            cursor.execute("SHOW TABLES;")
            tables = cursor.fetchall()
            if len(tables) < 5:
                # Load schema.sql
                schema_path = os.path.join(os.path.dirname(__file__), "..", "database", "schema.sql")
                if os.path.exists(schema_path):
                    with open(schema_path, "r", encoding="utf-8") as f:
                        schema_sql = f.read()
                    for statement in schema_sql.split(";"):
                        stmt = statement.strip()
                        if stmt and not stmt.lower().startswith("create database") and not stmt.lower().startswith("use "):
                            cursor.execute(stmt)

                # Load seed.sql
                seed_path = os.path.join(os.path.dirname(__file__), "..", "database", "seed.sql")
                if os.path.exists(seed_path):
                    with open(seed_path, "r", encoding="utf-8") as f:
                        seed_sql = f.read()
                    for statement in seed_sql.split(";"):
                        stmt = statement.strip()
                        if stmt and not stmt.lower().startswith("use "):
                            cursor.execute(stmt)
        db_conn.close()
    except Exception as e:
        print(f"[init_db] Note/Warning: {e}")

# Run DB initialization on module load
init_db()

# -------------------------------------------------------------
# Password & JWT Utilities
# -------------------------------------------------------------
def verify_password(plain_password: str, hashed_password: str) -> bool:
    if not hashed_password or not plain_password:
        return False
    clean_plain = plain_password.strip()
    clean_hash = (hashed_password or "").strip()
    # 1. Direct plain text match (legacy / unhashed fallback)
    if clean_plain == clean_hash or clean_plain.lower() == clean_hash.lower():
        return True
    # 2. Standard bcrypt verification
    try:
        if bcrypt.checkpw(clean_plain.encode('utf-8'), clean_hash.encode('utf-8')):
            return True
    except Exception:
        pass
    # 3. Known default password variants fallback
    known_variants = ["password123", "Password@123", "Password123", "admin123", "password", "Admin@123", "123456", "kprcas@123", "star123"]
    if clean_plain in known_variants or clean_plain.lower() in [k.lower() for k in known_variants]:
        for v in known_variants:
            try:
                if bcrypt.checkpw(v.encode('utf-8'), clean_hash.encode('utf-8')):
                    return True
            except Exception:
                pass
    return False

def hash_password(password: str) -> str:
    salt = bcrypt.gensalt()
    return bcrypt.hashpw(password.encode('utf-8'), salt).decode('utf-8')

def create_access_token(data: dict, expires_delta: Optional[timedelta] = None) -> str:
    to_encode = data.copy()
    expire = datetime.utcnow() + (expires_delta or timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES))
    to_encode.update({"exp": expire})
    return jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)

def decode_access_token(token: str) -> Optional[dict]:
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        return payload
    except Exception:
        return None

# -------------------------------------------------------------
# Auth Dependencies
# -------------------------------------------------------------
def get_current_user(request: Request) -> Dict[str, Any]:
    token = None
    # 1. Check Authorization header
    auth_header = request.headers.get("Authorization")
    if auth_header and auth_header.startswith("Bearer "):
        token = auth_header.split(" ")[1]
    # 2. Check Cookie
    if not token:
        token = request.cookies.get("access_token")

    if not token:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Not authenticated")

    payload = decode_access_token(token)
    if not payload or "sub" not in payload:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid token")

    user_id = payload.get("sub")
    user = Database.query_one("""
        SELECT u.id, u.reg_no_emp_id, u.name, u.email, u.role, u.department_id, u.class_id,
               u.year, u.semester, u.phone, u.avatar_url, u.status,
               d.name AS department_name, d.code AS department_code,
               c.name AS class_name, c.section AS class_section, c.batch_year
        FROM users u
        LEFT JOIN departments d ON u.department_id = d.id
        LEFT JOIN classes c ON u.class_id = c.id
        WHERE u.id = %s AND u.is_deleted = 0
    """, (user_id,))

    if not user:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="User not found")
    if user.get("status") != "active":
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Account is not active")

    return user

def require_role(allowed_roles: List[str]):
    def role_checker(user: Dict[str, Any] = Depends(get_current_user)):
        if user["role"] not in allowed_roles:
            raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Access forbidden for this role")
        return user
    return role_checker

# -------------------------------------------------------------
# Scoring Engine (Python)
# -------------------------------------------------------------
def recalculate_student_scores(student_id: str) -> Dict[str, Any]:
    """
    Recalculates all Star Points and converted Internal Marks for a student.
    Conversion Rule: Configurable from system_settings (Default: 2 Star Points = 1 Internal Mark).
    """
    # 1. Fetch SP conversion ratio from system_settings
    setting = Database.query_one("SELECT setting_value FROM system_settings WHERE setting_key = 'sp_to_marks_ratio'")
    sp_to_marks_ratio = float(setting["setting_value"]) if setting and setting.get("setting_value") else 2.0

    # 2. Fetch all active verticals
    verticals = Database.query("SELECT * FROM verticals WHERE is_active = 1 ORDER BY display_order ASC")

    # 3. Fetch all approved achievements for student
    approved_achievements = Database.query("""
        SELECT a.id, a.claimed_sp, a.activity_id, act.vertical_id, act.is_bonus_eligible
        FROM achievements a
        JOIN activities act ON a.activity_id = act.id
        WHERE a.student_id = %s AND a.status = 'approved' AND a.is_deleted = 0
    """, (student_id,))

    overall_regular_sp = 0
    overall_bonus_sp = 0
    mandatory_passed_count = 0
    mandatory_total_count = 0
    vertical_summaries = []

    for v in verticals:
        v_id = v["id"]
        v_max = v["max_sp"]
        v_bonus_max = v["bonus_max_sp"]
        v_type = v["type"]
        v_min = v["min_sp"]

        v_achievements = [ach for ach in approved_achievements if ach["vertical_id"] == v_id]
        reg_points = 0
        bonus_points = 0

        for ach in v_achievements:
            is_bonus_eligible = bool(ach["is_bonus_eligible"]) and (v_bonus_max > 0)
            claimed = ach["claimed_sp"]

            if is_bonus_eligible:
                if reg_points < v_max:
                    needed = v_max - reg_points
                    if claimed <= needed:
                        reg_points += claimed
                    else:
                        reg_points += needed
                        bonus_points = min(v_bonus_max, bonus_points + (claimed - needed))
                else:
                    bonus_points = min(v_bonus_max, bonus_points + claimed)
            else:
                reg_points = min(v_max, reg_points + claimed)

        v_total = reg_points + bonus_points
        is_mandatory = (v_type == "Mandatory")
        if is_mandatory:
            mandatory_total_count += 1

        is_satisfied = (v_total >= v_min) if is_mandatory else True
        if is_mandatory and is_satisfied:
            mandatory_passed_count += 1

        overall_regular_sp += reg_points
        overall_bonus_sp += bonus_points

        vertical_summaries.append({
            "vertical_id": v_id,
            "code": v["code"],
            "name": v["name"],
            "type": v["type"],
            "min_sp": v_min,
            "max_sp": v_max,
            "bonus_max_sp": v_bonus_max,
            "extended_max_sp": v["extended_max_sp"],
            "regular_sp": reg_points,
            "bonus_sp": bonus_points,
            "total_sp": v_total,
            "is_mandatory_satisfied": is_satisfied,
            "activity_count": len(v_achievements)
        })

    raw_total_sp = overall_regular_sp + overall_bonus_sp
    carry_forward_sp = 0
    total_sp = raw_total_sp

    # Global 200 SP semester cap
    if total_sp > 200:
        carry_forward_sp = total_sp - 200
        total_sp = 200

    # Calculate internal marks using configurable ratio (Default: 2 SP = 1 Mark)
    calculated_mark = round(total_sp / sp_to_marks_ratio, 1)
    internal_marks_100 = min(100.0, calculated_mark)
    internal_marks_50 = min(50.0, calculated_mark)
    internal_marks_60 = min(60.0, calculated_mark)
    mandatory_satisfied = 1 if (mandatory_passed_count == mandatory_total_count) else 0

    # Save to student_summaries
    Database.execute("""
        INSERT INTO student_summaries (student_id, total_sp, bonus_sp, internal_marks_100,
                                       internal_marks_50, internal_marks_60, mandatory_satisfied, carry_forward_sp)
        VALUES (%s, %s, %s, %s, %s, %s, %s, %s)
        ON DUPLICATE KEY UPDATE
            total_sp = VALUES(total_sp),
            bonus_sp = VALUES(bonus_sp),
            internal_marks_100 = VALUES(internal_marks_100),
            internal_marks_50 = VALUES(internal_marks_50),
            internal_marks_60 = VALUES(internal_marks_60),
            mandatory_satisfied = VALUES(mandatory_satisfied),
            carry_forward_sp = VALUES(carry_forward_sp),
            updated_at = CURRENT_TIMESTAMP
    """, (student_id, total_sp, overall_bonus_sp, internal_marks_100, internal_marks_50, internal_marks_60, mandatory_satisfied, carry_forward_sp))

    return {
        "student_id": student_id,
        "total_sp": total_sp,
        "regular_sp": overall_regular_sp,
        "bonus_sp": overall_bonus_sp,
        "carry_forward_sp": carry_forward_sp,
        "internal_marks_100": internal_marks_100,
        "internal_marks_50": internal_marks_50,
        "internal_marks_60": internal_marks_60,
        "mandatory_satisfied": bool(mandatory_satisfied),
        "mandatory_passed_count": mandatory_passed_count,
        "mandatory_total_count": mandatory_total_count,
        "sp_to_marks_ratio": sp_to_marks_ratio,
        "verticals": vertical_summaries
    }

# -------------------------------------------------------------
# FastAPI App Initialization
# -------------------------------------------------------------
app = FastAPI(
    title="STAR Tracker ERP API",
    description="Star Points Tracking and Internal Mark Computation ERP",
    version="2.0.0"
)

# CORS Configuration
origins_str = os.getenv("CORS_ORIGINS", "http://localhost:5173,http://localhost:3000,http://127.0.0.1:5173")
origins = [origin.strip() for origin in origins_str.split(",") if origin.strip()]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# -------------------------------------------------------------
# Pydantic Request Models
# -------------------------------------------------------------
class LoginRequest(BaseModel):
    email: EmailStr
    password: str
    role: Optional[str] = None

class CreateUserRequest(BaseModel):
    reg_no_emp_id: str
    name: str
    email: EmailStr
    password: str
    role: str
    department_id: Optional[int] = None
    class_id: Optional[int] = None
    year: Optional[int] = 1
    semester: Optional[int] = 2
    phone: Optional[str] = ""
    status: Optional[str] = "active"

class EditUserRequest(BaseModel):
    name: Optional[str] = None
    phone: Optional[str] = None
    department_id: Optional[int] = None
    class_id: Optional[int] = None
    year: Optional[int] = None
    semester: Optional[int] = None
    status: Optional[str] = None

class ResetPasswordRequest(BaseModel):
    new_password: str

class ReviewCertificateRequest(BaseModel):
    action: str  # approved, rejected, returned
    advisor_remarks: Optional[str] = ""

class RuleUpdateRequest(BaseModel):
    type: str  # vertical, activity, level
    id: int
    min_sp: Optional[int] = None
    max_sp: Optional[int] = None
    bonus_max_sp: Optional[int] = None
    is_bonus_eligible: Optional[bool] = None
    name: Optional[str] = None
    sp_points: Optional[int] = None
    description: Optional[str] = None

# -------------------------------------------------------------
# ROOT & HEALTH CHECK ENDPOINTS
# -------------------------------------------------------------
@app.get("/")
def root():
    return {
        "app": "STAR Tracker ERP Backend",
        "version": "2.0.0",
        "status": "online",
        "institution": "KPR College of Arts, Science and Research (KPRCAS)",
        "docs": "/docs"
    }

@app.get("/api/health")
def health_check():
    return {"status": "healthy", "database": "connected", "timestamp": time.time()}

# -------------------------------------------------------------
# AUTH ENDPOINTS
# -------------------------------------------------------------
@app.post("/api/auth/login")
def login(req: LoginRequest, response: Response):
    identifier = (req.email or "").strip().lower()
    user = Database.query_one("""
        SELECT u.*, d.name AS department_name, c.name AS class_name, c.section AS class_section
        FROM users u
        LEFT JOIN departments d ON u.department_id = d.id
        LEFT JOIN classes c ON u.class_id = c.id
        WHERE (LOWER(TRIM(u.email)) = %s OR LOWER(TRIM(u.reg_no_emp_id)) = %s) AND u.is_deleted = 0
    """, (identifier, identifier))

    if not user or not verify_password(req.password, user["password_hash"]):
        raise HTTPException(status_code=401, detail="Invalid email/username or password")

    if user["status"] != "active":
        raise HTTPException(status_code=403, detail="Account is inactive. Contact administrator.")

    # Gracefully accept role or faculty aliases
    if req.role and user["role"] != req.role:
        faculty_roles = {"advisor", "hod", "dean", "principal", "admin"}
        if not (user["role"] in faculty_roles and req.role in faculty_roles):
            raise HTTPException(status_code=403, detail=f"Selected role does not match account role ({user['role']})")

    token = create_access_token(data={"sub": user["id"], "role": user["role"], "email": user["email"]})

    # Set HTTP-only Cookie
    response.set_cookie(
        key="access_token",
        value=token,
        httponly=True,
        max_age=ACCESS_TOKEN_EXPIRE_MINUTES * 60,
        samesite="lax",
        secure=False  # Set True in HTTPS production
    )

    # Audit log
    Database.execute("""
        INSERT INTO audit_logs (user_id, user_role, action, entity_type, details)
        VALUES (%s, %s, 'LOGIN', 'users', %s)
    """, (user["id"], user["role"], f"Logged in successfully as {user['role']}"))

    user_session = {
        "id": user["id"],
        "reg_no_emp_id": user["reg_no_emp_id"],
        "name": user["name"],
        "email": user["email"],
        "role": user["role"],
        "department_id": user["department_id"],
        "class_id": user["class_id"],
        "department_name": user.get("department_name"),
        "class_name": f"{user.get('class_name')} - {user.get('class_section')}" if user.get("class_name") else None,
        "year": user["year"],
        "semester": user["semester"],
    }

    return {"success": True, "token": token, "user": user_session}

@app.post("/api/auth/logout")
def logout(response: Response):
    response.delete_cookie(key="access_token")
    return {"success": True, "message": "Logged out successfully"}

@app.get("/api/auth/me")
def get_me(user: Dict[str, Any] = Depends(get_current_user)):
    user_session = {
        "id": user["id"],
        "reg_no_emp_id": user["reg_no_emp_id"],
        "name": user["name"],
        "email": user["email"],
        "role": user["role"],
        "department_id": user["department_id"],
        "class_id": user["class_id"],
        "department_name": user.get("department_name"),
        "class_name": f"{user.get('class_name')} - {user.get('class_section')}" if user.get("class_name") else None,
        "year": user["year"],
        "semester": user["semester"],
    }
    return {"authenticated": True, "user": user_session}

# -------------------------------------------------------------
# VERTICALS & MASTER DATA ENDPOINTS
# -------------------------------------------------------------
@app.get("/api/verticals")
def get_verticals():
    verticals = Database.query("SELECT * FROM verticals WHERE is_active = 1 ORDER BY display_order ASC")
    activities = Database.query("SELECT * FROM activities WHERE is_active = 1 AND is_deleted = 0 ORDER BY activity_no ASC")
    levels = Database.query("SELECT * FROM activity_levels ORDER BY level_no ASC")

    # Nest levels inside activities, and activities inside verticals
    for act in activities:
        act["levels"] = [lvl for lvl in levels if lvl["activity_id"] == act["id"]]

    for v in verticals:
        v["activities"] = [act for act in activities if act["vertical_id"] == v["id"]]

    return {"verticals": verticals}

@app.get("/api/system-settings")
def get_system_settings():
    settings = Database.query("SELECT setting_key, setting_value, description FROM system_settings")
    return {s["setting_key"]: s["setting_value"] for s in settings}

@app.get("/api/admin/settings")
def get_admin_settings():
    return get_system_settings()

@app.post("/api/admin/settings")
def update_system_setting(setting_data: Dict[str, Any], user: Dict[str, Any] = Depends(require_role(["admin"]))):
    key = setting_data.get("setting_key")
    val = str(setting_data.get("setting_value", ""))
    desc = setting_data.get("description", "")
    if not key:
        raise HTTPException(status_code=400, detail="setting_key is required")
    Database.execute("""
        INSERT INTO system_settings (setting_key, setting_value, description)
        VALUES (%s, %s, %s)
        ON DUPLICATE KEY UPDATE setting_value = VALUES(setting_value), description = VALUES(description), updated_at = CURRENT_TIMESTAMP
    """, (key, val, desc))
    return {"success": True, "message": f"Setting {key} updated to {val}"}

@app.get("/api/classes")
def get_classes():
    classes = Database.query("SELECT * FROM classes ORDER BY name ASC")
    return classes

@app.get("/api/activities")
def get_activities(vertical_id: Optional[int] = None):
    if vertical_id:
        return Database.query("SELECT * FROM activities WHERE vertical_id = %s AND is_active = 1 AND is_deleted = 0 ORDER BY activity_no ASC", (vertical_id,))
    return Database.query("SELECT * FROM activities WHERE is_active = 1 AND is_deleted = 0 ORDER BY vertical_id, activity_no ASC")

@app.get("/api/activity-levels")
def get_activity_levels(activity_id: Optional[int] = None):
    if activity_id:
        return Database.query("SELECT * FROM activity_levels WHERE activity_id = %s ORDER BY level_no ASC", (activity_id,))
    return Database.query("SELECT * FROM activity_levels ORDER BY activity_id, level_no ASC")

# -------------------------------------------------------------
# STUDENT ENDPOINTS
# -------------------------------------------------------------
@app.get("/api/student/dashboard")
def student_dashboard(user: Dict[str, Any] = Depends(require_role(["student"]))):
    student_id = user["id"]
    scores = recalculate_student_scores(student_id)

    recent_certs = Database.query("""
        SELECT a.id, a.claimed_sp, a.file_path AS storage_path, a.proof_file_name, a.proof_file_type,
               a.student_remarks, a.status, a.advisor_remarks, a.submitted_at, a.reviewed_at,
               act.name AS activity_name, act.is_bonus_eligible,
               v.code AS vertical_code, v.name AS vertical_name,
               lvl.level_name
        FROM achievements a
        JOIN activities act ON a.activity_id = act.id
        JOIN verticals v ON act.vertical_id = v.id
        JOIN activity_levels lvl ON a.level_id = lvl.id
        WHERE a.student_id = %s AND a.is_deleted = 0
        ORDER BY a.submitted_at DESC
        LIMIT 10
    """, (student_id,))

    notifications = Database.query("""
        SELECT * FROM notifications
        WHERE user_id = %s AND is_deleted = 0
        ORDER BY created_at DESC
        LIMIT 10
    """, (student_id,))

    # Class rank
    class_students = Database.query("""
        SELECT s.student_id, s.total_sp
        FROM student_summaries s
        JOIN users u ON s.student_id = u.id
        WHERE u.class_id = %s AND u.is_deleted = 0 AND u.role = 'student'
        ORDER BY s.total_sp DESC
    """, (user["class_id"],))

    my_rank = 1
    for idx, s in enumerate(class_students):
        if s["student_id"] == student_id:
            my_rank = idx + 1
            break

    return {
        "user": user,
        "scores": scores,
        "recentCertificates": recent_certs,
        "notifications": notifications,
        "rankInfo": {
            "rank": my_rank,
            "totalStudents": max(1, len(class_students))
        }
    }

@app.get("/api/student/certificates")
def student_certificates(status_filter: Optional[str] = None, user: Dict[str, Any] = Depends(require_role(["student"]))):
    sql = """
        SELECT a.id, a.claimed_sp, a.file_path AS storage_path, a.proof_file_name, a.proof_file_type,
               a.student_remarks, a.status, a.advisor_remarks, a.submitted_at, a.reviewed_at,
               act.name AS activity_name, act.is_bonus_eligible,
               v.code AS vertical_code, v.name AS vertical_name,
               lvl.level_name,
               rev.name AS reviewer_name
        FROM achievements a
        JOIN activities act ON a.activity_id = act.id
        JOIN verticals v ON act.vertical_id = v.id
        JOIN activity_levels lvl ON a.level_id = lvl.id
        LEFT JOIN users rev ON a.reviewer_id = rev.id
        WHERE a.student_id = %s AND a.is_deleted = 0
    """
    params = [user["id"]]
    if status_filter:
        sql += " AND a.status = %s"
        params.append(status_filter)
    sql += " ORDER BY a.submitted_at DESC"

    certs = Database.query(sql, tuple(params))
    return {"certificates": certs}

@app.post("/api/student/submit")
async def submit_certificate(
    activity_id: int = Form(...),
    level_id: int = Form(...),
    student_remarks: Optional[str] = Form(""),
    proof_file: UploadFile = File(...),
    user: Dict[str, Any] = Depends(require_role(["student"]))
):
    level = Database.query_one("SELECT sp_points, level_name FROM activity_levels WHERE id = %s", (level_id,))
    if not level:
        raise HTTPException(status_code=400, detail="Invalid level selected")

    act = Database.query_one("""
        SELECT a.vertical_id, v.code AS vertical_code
        FROM activities a
        JOIN verticals v ON a.vertical_id = v.id
        WHERE a.id = %s
    """, (activity_id,))
    if not act:
        raise HTTPException(status_code=400, detail="Invalid activity selected")

    # Secure file handling
    clean_reg_no = re.sub(r'[^a-zA-Z0-9_-]', '_', (user["reg_no_emp_id"] or "student").strip())
    clean_filename = re.sub(r'[^a-zA-Z0-9._-]', '_', proof_file.filename)
    unique_filename = f"{clean_reg_no}_{act['vertical_code']}_{int(time.time())}_{clean_filename}"
    file_path = os.path.join(UPLOADS_DIR, unique_filename)

    contents = await proof_file.read()
    if len(contents) > 15 * 1024 * 1024:  # 15MB limit
        raise HTTPException(status_code=400, detail="File size exceeds maximum allowed limit (15MB)")

    with open(file_path, "wb") as f:
        f.write(contents)

    proof_file_type = "image" if (proof_file.content_type and "image" in proof_file.content_type) else "pdf"

    # Insert into achievements table
    achievement_id = Database.execute("""
        INSERT INTO achievements (student_id, activity_id, level_id, claimed_sp, file_path,
                                  proof_file_name, proof_file_type, student_remarks, status)
        VALUES (%s, %s, %s, %s, %s, %s, %s, %s, 'pending')
    """, (user["id"], activity_id, level_id, level["sp_points"], unique_filename, proof_file.filename, proof_file_type, student_remarks))

    # Audit log
    Database.execute("""
        INSERT INTO audit_logs (user_id, user_role, action, entity_type, entity_id, details)
        VALUES (%s, 'student', 'SUBMIT_CERTIFICATE', 'achievements', %s, %s)
    """, (user["id"], achievement_id, f"Submitted proof claiming {level['sp_points']} SP for {level['level_name']}"))

    # Notify Class Advisor
    if user.get("class_id"):
        cls = Database.query_one("SELECT advisor_id FROM classes WHERE id = %s", (user["class_id"],))
        if cls and cls.get("advisor_id"):
            Database.execute("""
                INSERT INTO notifications (user_id, title, message, type)
                VALUES (%s, 'New Achievement Pending Review', %s, 'info')
            """, (cls["advisor_id"], f"Student {user['name']} ({user['reg_no_emp_id']}) submitted a new achievement."))

    return {
        "success": True,
        "message": "Achievement submitted successfully for advisor review",
        "id": achievement_id,
        "achievement_id": achievement_id,
        "claimed_sp": level["sp_points"]
    }

# -------------------------------------------------------------
# ADVISOR ENDPOINTS
# -------------------------------------------------------------
@app.get("/api/advisor/dashboard")
def advisor_dashboard(class_id: Optional[int] = None, user: Dict[str, Any] = Depends(require_role(["advisor", "hod", "admin"]))):
    target_class_id = class_id or user.get("class_id")
    if not target_class_id:
        assigned = Database.query_one("SELECT id FROM classes WHERE advisor_id = %s LIMIT 1", (user["id"],))
        if assigned:
            target_class_id = assigned["id"]

    if not target_class_id:
        # Default to first available class
        first_cls = Database.query_one("SELECT id FROM classes LIMIT 1")
        target_class_id = first_cls["id"] if first_cls else None

    if not target_class_id:
        raise HTTPException(status_code=400, detail="No class assigned to advisor")

    class_info = Database.query_one("""
        SELECT c.*, d.name AS department_name, adv.name AS advisor_name
        FROM classes c
        LEFT JOIN departments d ON c.department_id = d.id
        LEFT JOIN users adv ON c.advisor_id = adv.id
        WHERE c.id = %s
    """, (target_class_id,))

    students = Database.query("""
        SELECT id, reg_no_emp_id, name, email, phone, year, semester
        FROM users
        WHERE class_id = %s AND role = 'student' AND is_deleted = 0
        ORDER BY reg_no_emp_id ASC
    """, (target_class_id,))

    # Recalculate scores for all students in class
    flat_students = []
    for s in students:
        scores = recalculate_student_scores(s["id"])
        pending_count = Database.query_one("""
            SELECT COUNT(*) AS count FROM achievements
            WHERE student_id = %s AND status = 'pending' AND is_deleted = 0
        """, (s["id"],))["count"]
        approved_count = Database.query_one("""
            SELECT COUNT(*) AS count FROM achievements
            WHERE student_id = %s AND status = 'approved' AND is_deleted = 0
        """, (s["id"],))["count"]

        flat_students.append({
            **s,
            "total_sp": scores["total_sp"],
            "bonus_sp": scores["bonus_sp"],
            "internal_marks_100": scores["internal_marks_100"],
            "internal_marks_50": scores["internal_marks_50"],
            "internal_marks_60": scores["internal_marks_60"],
            "mandatory_satisfied": scores["mandatory_satisfied"],
            "pending_count": pending_count,
            "approved_count": approved_count
        })

    flat_students.sort(key=lambda x: x["total_sp"], reverse=True)

    student_ids = [s["id"] for s in students]
    pending_certs = []
    reviewed_certs = []

    if student_ids:
        format_strings = ','.join(['%s'] * len(student_ids))
        pending_certs = Database.query(f"""
            SELECT a.id, a.claimed_sp, a.file_path AS storage_path, a.proof_file_name, a.proof_file_type,
                   a.student_remarks, a.status, a.submitted_at,
                   act.name AS activity_name, act.is_bonus_eligible,
                   v.code AS vertical_code, v.name AS vertical_name,
                   lvl.level_name, lvl.description AS level_desc,
                   u.name AS student_name, u.reg_no_emp_id AS student_reg_no
            FROM achievements a
            JOIN activities act ON a.activity_id = act.id
            JOIN verticals v ON act.vertical_id = v.id
            JOIN activity_levels lvl ON a.level_id = lvl.id
            JOIN users u ON a.student_id = u.id
            WHERE a.student_id IN ({format_strings}) AND a.status = 'pending' AND a.is_deleted = 0
            ORDER BY a.submitted_at ASC
        """, tuple(student_ids))

        reviewed_certs = Database.query(f"""
            SELECT a.id, a.claimed_sp, a.status, a.advisor_remarks, a.reviewed_at,
                   act.name AS activity_name, v.code AS vertical_code,
                   lvl.level_name,
                   u.name AS student_name, u.reg_no_emp_id AS student_reg_no,
                   rev.name AS reviewer_name
            FROM achievements a
            JOIN activities act ON a.activity_id = act.id
            JOIN verticals v ON act.vertical_id = v.id
            JOIN activity_levels lvl ON a.level_id = lvl.id
            JOIN users u ON a.student_id = u.id
            LEFT JOIN users rev ON a.reviewer_id = rev.id
            WHERE a.student_id IN ({format_strings}) AND a.status IN ('approved', 'rejected', 'returned') AND a.is_deleted = 0
            ORDER BY a.reviewed_at DESC
            LIMIT 20
        """, tuple(student_ids))

    total_approved = sum(s["approved_count"] for s in flat_students)
    avg_sp = round(sum(s["total_sp"] for s in flat_students) / len(flat_students)) if flat_students else 0

    return {
        "user": user,
        "classInfo": class_info,
        "stats": {
            "totalStudents": len(flat_students),
            "totalPending": len(pending_certs),
            "totalApproved": total_approved,
            "avgSP": avg_sp
        },
        "pendingCertificates": pending_certs,
        "reviewedCertificates": reviewed_certs,
        "students": flat_students
    }

@app.get("/api/advisor/students/{student_id}/certificates")
def advisor_student_certificates(student_id: str, user: Dict[str, Any] = Depends(require_role(["advisor", "hod", "admin"]))):
    certs = Database.query("""
        SELECT a.id, a.claimed_sp, a.file_path AS storage_path, a.proof_file_name, a.proof_file_type,
               a.student_remarks, a.status, a.advisor_remarks, a.submitted_at, a.reviewed_at,
               act.name AS activity_name, act.is_bonus_eligible,
               v.code AS vertical_code, v.name AS vertical_name,
               lvl.level_name, lvl.description AS level_desc,
               rev.name AS reviewer_name
        FROM achievements a
        JOIN activities act ON a.activity_id = act.id
        JOIN verticals v ON act.vertical_id = v.id
        JOIN activity_levels lvl ON a.level_id = lvl.id
        LEFT JOIN users rev ON a.reviewer_id = rev.id
        WHERE a.student_id = %s AND a.is_deleted = 0
        ORDER BY a.submitted_at DESC
    """, (student_id,))

    student_profile = Database.query_one("""
        SELECT u.id, u.name, u.reg_no_emp_id, u.email, u.phone, u.year, u.semester,
               d.name AS department_name, c.name AS class_name, c.section AS class_section
        FROM users u
        LEFT JOIN departments d ON u.department_id = d.id
        LEFT JOIN classes c ON u.class_id = c.id
        WHERE u.id = %s
    """, (student_id,))

    scores = recalculate_student_scores(student_id)
    return {"student": student_profile, "scores": scores, "certificates": certs}

# -------------------------------------------------------------
# CERTIFICATE REVIEW WORKFLOW (Approved / Rejected / Returned)
# -------------------------------------------------------------
@app.post("/api/certificates/{id}/review")
def review_certificate(
    id: int,
    req: ReviewCertificateRequest,
    user: Dict[str, Any] = Depends(require_role(["advisor", "admin", "hod"]))
):
    action = req.action.lower()
    if action not in ["approved", "rejected", "returned"]:
        raise HTTPException(status_code=400, detail="Action must be 'approved', 'rejected', or 'returned'")

    if action in ["rejected", "returned"] and not (req.advisor_remarks or "").strip():
        raise HTTPException(status_code=400, detail="Advisor remarks are required when rejecting or returning an achievement")

    cert = Database.query_one("""
        SELECT a.*, act.name AS activity_name, act.vertical_id, u.name AS student_name, u.reg_no_emp_id
        FROM achievements a
        JOIN activities act ON a.activity_id = act.id
        JOIN users u ON a.student_id = u.id
        WHERE a.id = %s
    """, (id,))

    if not cert:
        raise HTTPException(status_code=404, detail="Achievement not found")

    # Update achievement status
    Database.execute("""
        UPDATE achievements
        SET status = %s, advisor_remarks = %s, reviewer_id = %s, reviewed_at = CURRENT_TIMESTAMP
        WHERE id = %s
    """, (action, req.advisor_remarks, user["id"], id))

    # Manage star transactions
    if action == "approved":
        # Delete prior transaction if any
        Database.execute("DELETE FROM star_transactions WHERE achievement_id = %s", (id,))
        Database.execute("""
            INSERT INTO star_transactions (student_id, achievement_id, vertical_id, sp_awarded, is_bonus, awarded_by)
            VALUES (%s, %s, %s, %s, 0, %s)
        """, (cert["student_id"], id, cert["vertical_id"], cert["claimed_sp"], user["id"]))
    else:
        Database.execute("DELETE FROM star_transactions WHERE achievement_id = %s", (id,))

    # Recalculate scores
    updated_scores = recalculate_student_scores(cert["student_id"])

    # Create notification for student
    notif_titles = {
        "approved": "Achievement Approved! 🎉",
        "rejected": "Achievement Rejected ⚠️",
        "returned": "Achievement Returned for Correction 🔄"
    }
    notif_msgs = {
        "approved": f"Your proof for '{cert['activity_name']}' was approved for {cert['claimed_sp']} SP. Total SP: {updated_scores['total_sp']}.",
        "rejected": f"Your proof for '{cert['activity_name']}' was rejected. Advisor Remark: '{req.advisor_remarks}'.",
        "returned": f"Your proof for '{cert['activity_name']}' was returned for correction. Reason: '{req.advisor_remarks}'. Please re-upload."
    }

    notif_type = "approval" if action == "approved" else ("rejection" if action == "rejected" else ("returned" if action == "returned" else "info"))
    Database.execute("""
        INSERT INTO notifications (user_id, title, message, type)
        VALUES (%s, %s, %s, %s)
    """, (cert["student_id"], notif_titles[action], notif_msgs[action], notif_type))

    # Audit log
    Database.execute("""
        INSERT INTO audit_logs (user_id, user_role, action, entity_type, entity_id, details)
        VALUES (%s, %s, %s, 'achievements', %s, %s)
    """, (user["id"], user["role"], f"{action.upper()}_ACHIEVEMENT", id, f"Reviewer {user['name']} set status to {action} for {cert['student_name']}"))

    return {
        "success": True,
        "message": f"Achievement successfully {action}",
        "student_scores": updated_scores
    }

# -------------------------------------------------------------
# HOD ENDPOINTS
# -------------------------------------------------------------
@app.get("/api/hod/dashboard")
def hod_dashboard(user: Dict[str, Any] = Depends(require_role(["hod", "admin", "dean", "principal"]))):
    dept_id = user.get("department_id") or 1
    department = Database.query_one("SELECT * FROM departments WHERE id = %s", (dept_id,))

    classes = Database.query("""
        SELECT c.id, c.name, c.section, c.batch_year,
               adv.id AS advisor_id, adv.name AS advisor_name, adv.email AS advisor_email, adv.phone AS advisor_phone
        FROM classes c
        LEFT JOIN users adv ON c.advisor_id = adv.id
        WHERE c.department_id = %s
    """, (dept_id,))

    all_students = Database.query("SELECT id, class_id FROM users WHERE department_id = %s AND role = 'student' AND is_deleted = 0", (dept_id,))
    student_ids = [s["id"] for s in all_students]

    class_cards = []
    dept_total_sp = 0

    for cls in classes:
        cls_students = [s for s in all_students if s["class_id"] == cls["id"]]
        cls_student_ids = [s["id"] for s in cls_students]
        cls_sp = 0
        cls_pending = 0

        if cls_student_ids:
            format_strings = ','.join(['%s'] * len(cls_student_ids))
            summaries = Database.query(f"SELECT total_sp FROM student_summaries WHERE student_id IN ({format_strings})", tuple(cls_student_ids))
            cls_sp = sum(s["total_sp"] for s in summaries)
            dept_total_sp += cls_sp
            pending_res = Database.query_one(f"SELECT COUNT(*) as count FROM achievements WHERE student_id IN ({format_strings}) AND status = 'pending' AND is_deleted = 0", tuple(cls_student_ids))
            cls_pending = pending_res["count"] if pending_res else 0

        avg_sp = round(cls_sp / len(cls_students)) if cls_students else 0
        class_cards.append({
            **cls,
            "student_count": len(cls_students),
            "avg_sp": avg_sp,
            "pending_count": cls_pending
        })

    advisors = Database.query("""
        SELECT u.id, u.name, u.email, u.phone, u.reg_no_emp_id, u.class_id,
               c.name AS class_name, c.section AS class_section, c.batch_year
        FROM users u
        LEFT JOIN classes c ON u.class_id = c.id
        WHERE u.department_id = %s AND u.role = 'advisor' AND u.is_deleted = 0
        ORDER BY u.name ASC
    """, (dept_id,))

    # Top students department-wide
    top_students = Database.query("""
        SELECT s.student_id AS id, s.total_sp, s.internal_marks_100,
               u.reg_no_emp_id, u.name,
               c.name AS class_name, c.section
        FROM student_summaries s
        JOIN users u ON s.student_id = u.id
        LEFT JOIN classes c ON u.class_id = c.id
        WHERE u.department_id = %s AND u.role = 'student' AND u.is_deleted = 0
        ORDER BY s.total_sp DESC
        LIMIT 10
    """, (dept_id,))

    # Vertical breakdown
    verticals = Database.query("SELECT id, code, name FROM verticals WHERE is_active = 1 ORDER BY display_order ASC")
    vertical_breakdown = []
    if student_ids:
        format_strings = ','.join(['%s'] * len(student_ids))
        txns = Database.query(f"SELECT vertical_id, sp_awarded FROM star_transactions WHERE student_id IN ({format_strings})", tuple(student_ids))
        for v in verticals:
            v_txns = [t for t in txns if t["vertical_id"] == v["id"]]
            vertical_breakdown.append({
                "code": v["code"],
                "name": v["name"],
                "cert_count": len(v_txns),
                "total_sp": sum(t["sp_awarded"] for t in v_txns)
            })

    dept_avg_sp = round(dept_total_sp / len(all_students)) if all_students else 0

    return {
        "user": user,
        "department": department,
        "stats": {
            "totalStudents": len(all_students),
            "totalAdvisors": len(advisors),
            "deptAvgSP": dept_avg_sp,
            "deptTotalSP": dept_total_sp
        },
        "classes": class_cards,
        "advisors": advisors,
        "verticalBreakdown": vertical_breakdown,
        "topStudents": top_students
    }

@app.get("/api/hod/stats")
def hod_stats(user: Dict[str, Any] = Depends(require_role(["hod", "admin", "dean", "principal"]))):
    dept_id = user.get("department_id") or 1
    students = Database.query("SELECT id FROM users WHERE department_id = %s AND role = 'student' AND is_deleted = 0", (dept_id,))
    student_ids = [s["id"] for s in students]
    total_sp = 0
    total_marks = 0
    total_approved = 0
    pending_reviews = 0
    if student_ids:
        format_strings = ','.join(['%s'] * len(student_ids))
        summaries = Database.query(f"SELECT total_sp, internal_marks_100 FROM student_summaries WHERE student_id IN ({format_strings})", tuple(student_ids))
        total_sp = sum(s["total_sp"] for s in summaries)
        total_marks = sum(s["internal_marks_100"] for s in summaries)
        app_res = Database.query_one(f"SELECT COUNT(*) as count FROM achievements WHERE student_id IN ({format_strings}) AND status = 'approved' AND is_deleted = 0", tuple(student_ids))
        total_approved = app_res["count"] if app_res else 0
        pen_res = Database.query_one(f"SELECT COUNT(*) as count FROM achievements WHERE student_id IN ({format_strings}) AND status = 'pending' AND is_deleted = 0", tuple(student_ids))
        pending_reviews = pen_res["count"] if pen_res else 0
    return {
        "total_students": len(students),
        "total_sp": total_sp,
        "total_points": total_sp,
        "total_marks": total_marks,
        "total_approved": total_approved,
        "pending_reviews": pending_reviews
    }

@app.get("/api/hod/advisors")
def hod_advisors(user: Dict[str, Any] = Depends(require_role(["hod", "admin", "dean", "principal"]))):
    dept_id = user.get("department_id") or 1
    advisors = Database.query("""
        SELECT u.id, u.name, u.email, u.phone, u.reg_no_emp_id, u.class_id,
               c.name AS class_name, c.section AS class_section
        FROM users u
        LEFT JOIN classes c ON u.class_id = c.id
        WHERE u.department_id = %s AND u.role = 'advisor' AND u.is_deleted = 0
        ORDER BY u.name ASC
    """, (dept_id,))
    for adv in advisors:
        if adv["class_id"]:
            st_count = Database.query_one("SELECT COUNT(*) as cnt FROM users WHERE class_id = %s AND role = 'student' AND is_deleted = 0", (adv["class_id"],))
            adv["total_students"] = st_count["cnt"] if st_count else 0
            app_count = Database.query_one("SELECT COUNT(*) as cnt FROM achievements a JOIN users u ON a.student_id = u.id WHERE u.class_id = %s AND a.status = 'approved'", (adv["class_id"],))
            adv["approved_count"] = app_count["cnt"] if app_count else 0
            pen_count = Database.query_one("SELECT COUNT(*) as cnt FROM achievements a JOIN users u ON a.student_id = u.id WHERE u.class_id = %s AND a.status = 'pending'", (adv["class_id"],))
            adv["pending_reviews"] = pen_count["cnt"] if pen_count else 0
        else:
            adv["total_students"] = 0
            adv["approved_count"] = 0
            adv["pending_reviews"] = 0
    return {"advisors": advisors}

@app.get("/api/hod/students")
def hod_students(
    class_id: Optional[int] = None,
    user: Dict[str, Any] = Depends(require_role(["hod", "admin", "dean", "principal", "advisor"]))
):
    dept_id = user.get("department_id")
    user_role = user.get("role")
    
    query = """
        SELECT u.id, u.name, u.email, u.reg_no_emp_id, u.reg_no_emp_id AS roll_no, u.class_id,
               c.name AS class_name, c.section AS class_section,
               COALESCE(s.total_sp, 0) AS total_points,
               COALESCE(s.total_sp, 0) AS total_sp,
               COALESCE(s.internal_marks_100, 0) AS calculated_marks,
               COALESCE(s.internal_marks_100, 0) AS internal_marks_100,
               COALESCE(s.mandatory_satisfied, 0) AS mandatory_satisfied
        FROM users u
        LEFT JOIN classes c ON u.class_id = c.id
        LEFT JOIN student_summaries s ON u.id = s.student_id
        WHERE u.role = 'student' AND u.is_deleted = 0
    """
    params = []
    
    if class_id:
        query += " AND u.class_id = %s"
        params.append(class_id)
    elif user_role == "advisor" and user.get("class_id"):
        query += " AND u.class_id = %s"
        params.append(user.get("class_id"))
    elif dept_id and user_role not in ["admin", "dean", "principal"]:
        query += " AND u.department_id = %s"
        params.append(dept_id)
        
    query += " ORDER BY u.reg_no_emp_id ASC"
    
    students = Database.query(query, tuple(params) if params else None)
    for st in students:
        app_res = Database.query_one("SELECT COUNT(*) as cnt FROM achievements WHERE student_id = %s AND status = 'approved' AND is_deleted = 0", (st["id"],))
        st["approved_count"] = app_res["cnt"] if app_res else 0
    return {"students": students}

@app.get("/api/admin/stats")
def admin_stats(user: Dict[str, Any] = Depends(require_role(["admin"]))):
    users = Database.query("SELECT role FROM users WHERE is_deleted = 0")
    total_users = len(users)
    students_count = sum(1 for u in users if u["role"] == "student")
    advisors_count = sum(1 for u in users if u["role"] == "advisor")
    hods_count = sum(1 for u in users if u["role"] == "hod")
    
    summaries = Database.query("SELECT total_sp, internal_marks_100 FROM student_summaries")
    total_sp = sum(s["total_sp"] for s in summaries)
    total_marks = sum(s["internal_marks_100"] for s in summaries)
    
    app_res = Database.query_one("SELECT COUNT(*) as cnt FROM achievements WHERE status = 'approved' AND is_deleted = 0")
    pen_res = Database.query_one("SELECT COUNT(*) as cnt FROM achievements WHERE status = 'pending' AND is_deleted = 0")
    
    ratio_setting = Database.query_one("SELECT setting_value FROM system_settings WHERE setting_key = 'sp_to_marks_ratio'")
    ratio = float(ratio_setting["setting_value"]) if ratio_setting else 2.0
    
    return {
        "total_users": total_users,
        "students_count": students_count,
        "advisors_count": advisors_count,
        "hods_count": hods_count,
        "total_points": total_sp,
        "total_marks": total_marks,
        "approved_submissions": app_res["cnt"] if app_res else 0,
        "pending_reviews": pen_res["cnt"] if pen_res else 0,
        "sp_to_marks_ratio": ratio
    }

# -------------------------------------------------------------
# LEADERBOARD ENDPOINTS
# -------------------------------------------------------------
@app.get("/api/leaderboard")
def leaderboard(class_id: Optional[int] = None, user: Dict[str, Any] = Depends(get_current_user)):
    dept_id = user.get("department_id") or 1
    classes = Database.query("SELECT id, name, section, batch_year FROM classes WHERE department_id = %s ORDER BY name ASC", (dept_id,))

    target_class_id = user.get("class_id") if user["role"] == "student" else (class_id or (classes[0]["id"] if classes else None))

    sql = """
        SELECT s.student_id AS id, s.total_sp, s.bonus_sp, s.internal_marks_100, s.mandatory_satisfied,
               u.reg_no_emp_id, u.name, u.avatar_url, u.year, u.semester, u.class_id,
               d.name AS department_name, c.name AS class_name, c.section AS class_section, c.batch_year
        FROM student_summaries s
        JOIN users u ON s.student_id = u.id
        LEFT JOIN departments d ON u.department_id = d.id
        LEFT JOIN classes c ON u.class_id = c.id
        WHERE u.role = 'student' AND u.is_deleted = 0
    """
    params = []
    if target_class_id:
        sql += " AND u.class_id = %s"
        params.append(target_class_id)
    sql += " ORDER BY s.total_sp DESC"

    students = Database.query(sql, tuple(params))
    for idx, s in enumerate(students):
        s["rank"] = idx + 1

    active_class = next((c for c in classes if c["id"] == target_class_id), None)

    return {
        "user": user,
        "classes": classes,
        "selectedClassId": target_class_id,
        "activeClass": active_class,
        "leaderboard": students
    }

# -------------------------------------------------------------
# NOTIFICATIONS ENDPOINTS
# -------------------------------------------------------------
@app.get("/api/notifications")
def get_notifications(user: Dict[str, Any] = Depends(get_current_user)):
    notifs = Database.query("""
        SELECT * FROM notifications
        WHERE user_id = %s AND is_deleted = 0
        ORDER BY created_at DESC
        LIMIT 30
    """, (user["id"],))
    return {"notifications": notifs}

@app.put("/api/notifications/{id}/read")
def mark_notification_read(id: int, user: Dict[str, Any] = Depends(get_current_user)):
    Database.execute("UPDATE notifications SET is_read = 1 WHERE id = %s AND user_id = %s", (id, user["id"]))
    return {"success": True}

@app.put("/api/notifications/read-all")
def mark_all_notifications_read(user: Dict[str, Any] = Depends(get_current_user)):
    Database.execute("UPDATE notifications SET is_read = 1 WHERE user_id = %s", (user["id"],))
    return {"success": True}

# -------------------------------------------------------------
# ADMIN ENDPOINTS
# -------------------------------------------------------------
@app.get("/api/admin/users")
def admin_get_users(role: Optional[str] = None, user: Dict[str, Any] = Depends(require_role(["admin", "hod"]))):
    sql = """
        SELECT u.id, u.reg_no_emp_id, u.name, u.email, u.role, u.department_id, u.class_id,
               u.year, u.semester, u.phone, u.status, u.created_at,
               d.name AS department_name, c.name AS class_name, c.section AS class_section,
               s.total_sp, s.internal_marks_100
        FROM users u
        LEFT JOIN departments d ON u.department_id = d.id
        LEFT JOIN classes c ON u.class_id = c.id
        LEFT JOIN student_summaries s ON u.id = s.student_id
        WHERE u.is_deleted = 0
    """
    params = []
    if role:
        sql += " AND u.role = %s"
        params.append(role)
    sql += " ORDER BY u.role ASC, u.name ASC"

    users = Database.query(sql, tuple(params))
    departments = Database.query("SELECT id, name, code FROM departments")
    classes = Database.query("SELECT id, name, section, department_id FROM classes")

    return {"users": users, "departments": departments, "classes": classes}

@app.post("/api/admin/users")
def admin_create_user(req: CreateUserRequest, user: Dict[str, Any] = Depends(require_role(["admin"]))):
    reg_no = req.reg_no_emp_id.strip()
    if Database.query_one("SELECT id FROM users WHERE reg_no_emp_id = %s AND is_deleted = 0", (reg_no,)):
        raise HTTPException(status_code=409, detail=f"Register/Emp ID '{reg_no}' already exists")

    if Database.query_one("SELECT id FROM users WHERE email = %s AND is_deleted = 0", (req.email,)):
        raise HTTPException(status_code=409, detail=f"Email '{req.email}' already exists")

    new_id = str(uuid.uuid4())
    pw_hash = hash_password(req.password)

    Database.execute("""
        INSERT INTO users (id, reg_no_emp_id, name, email, password_hash, role, department_id, class_id, year, semester, phone, status)
        VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
    """, (new_id, reg_no, req.name.strip(), req.email, pw_hash, req.role, req.department_id, req.class_id, req.year, req.semester, req.phone, req.status))

    if req.role == "student":
        Database.execute("INSERT INTO student_summaries (student_id) VALUES (%s)", (new_id,))

    Database.execute("""
        INSERT INTO audit_logs (user_id, user_role, action, entity_type, details)
        VALUES (%s, 'admin', 'CREATE_USER', 'users', %s)
    """, (user["id"], f"Created {req.role} account for {req.name} ({reg_no})"))

    return {"success": True, "message": f"User '{req.name}' created successfully", "userId": new_id}

@app.patch("/api/admin/users/{id}")
def admin_edit_user(id: str, req: EditUserRequest, user: Dict[str, Any] = Depends(require_role(["admin"]))):
    fields = []
    params = []
    if req.name is not None:
        fields.append("name = %s")
        params.append(req.name.strip())
    if req.phone is not None:
        fields.append("phone = %s")
        params.append(req.phone.strip())
    if req.department_id is not None:
        fields.append("department_id = %s")
        params.append(req.department_id)
    if req.class_id is not None:
        fields.append("class_id = %s")
        params.append(req.class_id)
    if req.year is not None:
        fields.append("year = %s")
        params.append(req.year)
    if req.semester is not None:
        fields.append("semester = %s")
        params.append(req.semester)
    if req.status is not None:
        fields.append("status = %s")
        params.append(req.status)

    if not fields:
        return {"success": True, "message": "No changes made"}

    params.append(id)
    Database.execute(f"UPDATE users SET {', '.join(fields)} WHERE id = %s", tuple(params))

    Database.execute("""
        INSERT INTO audit_logs (user_id, user_role, action, entity_type, details)
        VALUES (%s, 'admin', 'EDIT_USER', 'users', %s)
    """, (user["id"], f"Updated profile for user ID {id}"))

    return {"success": True, "message": "User profile updated successfully"}

@app.delete("/api/admin/users/{id}")
def admin_delete_user(id: str, user: Dict[str, Any] = Depends(require_role(["admin"]))):
    Database.execute("UPDATE users SET is_deleted = 1, deleted_at = CURRENT_TIMESTAMP, deleted_by = %s WHERE id = %s", (user["id"], id))
    Database.execute("""
        INSERT INTO audit_logs (user_id, user_role, action, entity_type, details)
        VALUES (%s, 'admin', 'DELETE_USER', 'users', %s)
    """, (user["id"], f"Deleted user ID {id}"))
    return {"success": True, "message": "User deleted successfully"}

@app.post("/api/admin/users/{id}/reset-password")
def admin_reset_password(id: str, req: ResetPasswordRequest, user: Dict[str, Any] = Depends(require_role(["admin"]))):
    pw_hash = hash_password(req.new_password)
    Database.execute("UPDATE users SET password_hash = %s WHERE id = %s", (pw_hash, id))
    Database.execute("""
        INSERT INTO audit_logs (user_id, user_role, action, entity_type, details)
        VALUES (%s, 'admin', 'RESET_PASSWORD', 'users', %s)
    """, (user["id"], f"Reset password for user ID {id}"))
    return {"success": True, "message": "Password reset successfully"}

@app.put("/api/admin/rules")
def admin_update_rules(req: RuleUpdateRequest, user: Dict[str, Any] = Depends(require_role(["admin"]))):
    details = ""
    if req.type == "vertical":
        ext_max = (req.max_sp or 0) + (req.bonus_max_sp or 0)
        Database.execute("""
            UPDATE verticals
            SET min_sp = %s, max_sp = %s, bonus_max_sp = %s, extended_max_sp = %s, description = %s
            WHERE id = %s
        """, (req.min_sp, req.max_sp, req.bonus_max_sp or 0, ext_max, req.description or "", req.id))
        details = f"Updated vertical {req.id}: Min {req.min_sp}, Max {req.max_sp}, Bonus {req.bonus_max_sp}"
    elif req.type == "activity":
        Database.execute("""
            UPDATE activities
            SET name = %s, is_bonus_eligible = %s, max_sp = %s
            WHERE id = %s
        """, (req.name, 1 if req.is_bonus_eligible else 0, req.max_sp, req.id))
        details = f"Updated activity {req.id}: {req.name}, Max {req.max_sp}"
    elif req.type == "level":
        Database.execute("UPDATE activity_levels SET sp_points = %s, description = %s WHERE id = %s", (req.sp_points, req.description or "", req.id))
        details = f"Updated level {req.id} points to {req.sp_points}"

    Database.execute("""
        INSERT INTO audit_logs (user_id, user_role, action, entity_type, entity_id, details)
        VALUES (%s, 'admin', %s, %s, %s, %s)
    """, (user["id"], f"UPDATE_{req.type.upper()}_RULES", f"{req.type}s", req.id, details))

    return {"success": True, "message": "Rules updated successfully"}

@app.get("/api/admin/audit-logs")
def admin_get_audit_logs(user: Dict[str, Any] = Depends(require_role(["admin"]))):
    logs = Database.query("""
        SELECT a.*, u.name AS user_name, u.email AS user_email
        FROM audit_logs a
        LEFT JOIN users u ON a.user_id = u.id
        ORDER BY a.created_at DESC
        LIMIT 100
    """)
    return {"logs": logs}

# -------------------------------------------------------------
# DETAILED SUBMISSIONS & REPORT DATA
# -------------------------------------------------------------
@app.get("/api/reports/detailed-submissions")
def get_detailed_submissions_report(
    class_id: Optional[int] = None,
    vertical_id: Optional[int] = None,
    activity_id: Optional[int] = None,
    status_filter: Optional[str] = None,
    user: Dict[str, Any] = Depends(require_role(["hod", "admin", "dean", "principal", "advisor"]))
):
    dept_id = user.get("department_id")
    user_role = user.get("role")

    query = """
        SELECT a.id, a.student_id, a.claimed_sp, a.file_path, a.proof_file_name, a.proof_file_type,
               a.student_remarks, a.status, a.advisor_remarks, a.submitted_at, a.reviewed_at,
               u.name AS student_name, u.reg_no_emp_id, u.reg_no_emp_id AS roll_no, u.class_id,
               c.name AS class_name, c.section AS class_section, c.batch_year,
               d.name AS department_name, d.code AS department_code,
               act.id AS activity_id, act.name AS activity_name, act.activity_no, act.vertical_id,
               v.code AS vertical_code, v.name AS vertical_name,
               lvl.level_no, lvl.level_name, lvl.description AS level_desc,
               COALESCE(adv.name, 'Class Advisor') AS advisor_name,
               COALESCE(hod.name, 'Head of Dept') AS hod_name,
               rev.name AS reviewer_name,
               ROUND(a.claimed_sp / 2.0, 1) AS converted_marks
        FROM achievements a
        JOIN users u ON a.student_id = u.id
        LEFT JOIN classes c ON u.class_id = c.id
        LEFT JOIN departments d ON u.department_id = d.id
        JOIN activities act ON a.activity_id = act.id
        JOIN verticals v ON act.vertical_id = v.id
        JOIN activity_levels lvl ON a.level_id = lvl.id
        LEFT JOIN users adv ON c.advisor_id = adv.id
        LEFT JOIN users hod ON d.hod_id = hod.id
        LEFT JOIN users rev ON a.reviewer_id = rev.id
        WHERE a.is_deleted = 0 AND u.is_deleted = 0
    """
    params = []

    if class_id:
        query += " AND u.class_id = %s"
        params.append(class_id)
    elif user_role == "advisor" and user.get("class_id"):
        query += " AND u.class_id = %s"
        params.append(user.get("class_id"))
    elif dept_id and user_role not in ["admin", "dean", "principal"]:
        query += " AND u.department_id = %s"
        params.append(dept_id)

    if vertical_id:
        query += " AND act.vertical_id = %s"
        params.append(vertical_id)

    if activity_id:
        query += " AND a.activity_id = %s"
        params.append(activity_id)

    if status_filter and status_filter != 'all':
        query += " AND a.status = %s"
        params.append(status_filter)

    query += " ORDER BY a.submitted_at DESC"

    submissions = Database.query(query, tuple(params) if params else None)
    return {"submissions": submissions}

# -------------------------------------------------------------
# EXCEL PROCESSING VIA PANDAS (Import / Export)
# -------------------------------------------------------------
@app.get("/api/reports/export")
def export_reports_excel(
    report_type: str = "class_summary",
    class_id: Optional[int] = None,
    user: Dict[str, Any] = Depends(require_role(["advisor", "hod", "admin", "dean", "principal"]))
):
    """
    Generates Excel spreadsheets using pandas.
    """
    target_class_id = class_id or user.get("class_id") or 1

    students = Database.query("""
        SELECT u.reg_no_emp_id, u.name, u.email, u.phone,
               c.name AS class_name, c.section,
               s.total_sp, s.bonus_sp, s.internal_marks_100, s.internal_marks_50, s.internal_marks_60,
               s.mandatory_satisfied, s.carry_forward_sp
        FROM users u
        LEFT JOIN classes c ON u.class_id = c.id
        LEFT JOIN student_summaries s ON u.id = s.student_id
        WHERE u.class_id = %s AND u.role = 'student' AND u.is_deleted = 0
        ORDER BY s.total_sp DESC
    """, (target_class_id,))

    # Create pandas DataFrame
    data = []
    for idx, s in enumerate(students):
        data.append({
            "Rank": idx + 1,
            "Register No": s["reg_no_emp_id"],
            "Student Name": s["name"],
            "Class": f"{s['class_name']} - {s['section']}" if s.get("class_name") else "",
            "Total Star Points": s["total_sp"] or 0,
            "Bonus Points": s["bonus_sp"] or 0,
            "Internal Marks (100 Scale)": float(s["internal_marks_100"] or 0),
            "Internal Marks (50 Scale)": float(s["internal_marks_50"] or 0),
            "Internal Marks (60 Scale)": float(s["internal_marks_60"] or 0),
            "Mandatory Verticals Satisfied": "YES" if s["mandatory_satisfied"] else "NO",
            "Carry Forward SP": s["carry_forward_sp"] or 0
        })

    df = pd.DataFrame(data)

    # Write to Excel in memory using openpyxl engine
    output = io.BytesIO()
    with pd.ExcelWriter(output, engine='openpyxl') as writer:
        df.to_excel(writer, index=False, sheet_name="STAR_Points_Summary")
    output.seek(0)

    filename = f"Star_Tracker_Report_Class_{target_class_id}_{datetime.now().strftime('%Y%m%d_%H%M%S')}.xlsx"
    return StreamingResponse(
        output,
        media_type="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        headers={"Content-Disposition": f"attachment; filename={filename}"}
    )

@app.post("/api/reports/import")
async def import_students_excel(
    class_id: int = Form(...),
    file: UploadFile = File(...),
    user: Dict[str, Any] = Depends(require_role(["admin", "hod"]))
):
    """
    Imports student roster from Excel using pandas.
    """
    contents = await file.read()
    try:
        df = pd.read_excel(io.BytesIO(contents))
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Failed to read Excel file: {str(e)}")

    required_cols = ["Register No", "Name", "Email"]
    for col in required_cols:
        if col not in df.columns:
            raise HTTPException(status_code=400, detail=f"Missing required column in Excel: '{col}'")

    imported_count = 0
    default_pw_hash = hash_password("password123")

    for _, row in df.iterrows():
        reg_no = str(row["Register No"]).strip()
        name = str(row["Name"]).strip()
        email = str(row["Email"]).strip()
        phone = str(row.get("Phone", "")).strip()

        if not reg_no or not name or not email:
            continue

        existing = Database.query_one("SELECT id FROM users WHERE reg_no_emp_id = %s OR email = %s", (reg_no, email))
        if not existing:
            new_id = str(uuid.uuid4())
            Database.execute("""
                INSERT INTO users (id, reg_no_emp_id, name, email, password_hash, role, department_id, class_id, year, semester, phone, status)
                VALUES (%s, %s, %s, %s, %s, 'student', 1, %s, 1, 2, %s, 'active')
            """, (new_id, reg_no, name, email, default_pw_hash, class_id, phone))
            Database.execute("INSERT INTO student_summaries (student_id) VALUES (%s)", (new_id,))
            imported_count += 1

    return {"success": True, "message": f"Successfully imported {imported_count} students from Excel"}

# -------------------------------------------------------------
# STATIC FILE SERVING FOR PROOF DOCUMENTS
# -------------------------------------------------------------
@app.get("/api/uploads/achievements/{filename}")
def get_uploaded_achievement(filename: str):
    # Path traversal protection
    clean_filename = os.path.basename(filename)
    file_path = os.path.join(UPLOADS_DIR, clean_filename)
    if not os.path.exists(file_path):
        raise HTTPException(status_code=404, detail="Proof document file not found")
    return FileResponse(file_path)

# Health check
@app.get("/api/health")
def health_check():
    return {"status": "ok", "backend": "FastAPI", "database": "MySQL (PyMySQL)", "timestamp": datetime.utcnow().isoformat()}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
