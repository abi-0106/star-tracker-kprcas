import os
import pymysql
import uuid
from dotenv import load_dotenv

dotenv_path = os.path.join(os.path.dirname(__file__), ".env")
load_dotenv(dotenv_path)

DB_HOST = os.getenv("DB_HOST", "localhost")
DB_PORT = int(os.getenv("DB_PORT", "3306"))
DB_NAME = os.getenv("DB_NAME", "star_tracker")
DB_USER = os.getenv("DB_USER", "root")
DB_PASSWORD = os.getenv("DB_PASSWORD", "Abimanyu$")

conn = pymysql.connect(
    host=DB_HOST,
    port=DB_PORT,
    user=DB_USER,
    password=DB_PASSWORD,
    database=DB_NAME,
    cursorclass=pymysql.cursors.DictCursor,
    autocommit=True
)

# Password hash for password123
PWD_HASH = "$2b$12$OMUzuiVjAdh7cbeU6xaZweEtMlSwLbLsGDNKyfd3nZCQPVmQN6gKG"

with conn.cursor() as cursor:
    print("Seeding 2 active departments under School of Computing Science...")

    # Ensure School of Computing Science (id: 5) exists and has Dean assigned
    cursor.execute("""
        INSERT INTO schools (id, code, name) VALUES (5, 'SOCS', 'School of Computing Science')
        ON DUPLICATE KEY UPDATE code='SOCS', name='School of Computing Science';
    """)

    # Dean User
    dean_id = '66666666-6666-6666-6666-666666666666'
    cursor.execute("""
        INSERT INTO users (id, reg_no_emp_id, name, email, password_hash, role, school_id, status)
        VALUES (%s, 'DEAN001', 'Dr. S. Balasubramanian (Dean)', 'dean@kprcas.ac.in', %s, 'dean', 5, 'active')
        ON DUPLICATE KEY UPDATE school_id=5, role='dean', status='active';
    """, (dean_id, PWD_HASH))
    cursor.execute("UPDATE schools SET dean_id = %s WHERE id = 5;", (dean_id,))

    # -------------------------------------------------------------
    # 1. Department 1: B.Sc Information Technology (B.Sc IT)
    # -------------------------------------------------------------
    hod1_id = '543fff16-943e-4733-ad1a-7f9473e13487'
    cursor.execute("""
        INSERT INTO users (id, reg_no_emp_id, name, email, password_hash, role, school_id, status, phone)
        VALUES (%s, 'HOD_IT_01', 'Dr. R. Sundar (HOD - B.Sc IT)', 'hod.it@college.edu', %s, 'hod', 5, 'active', '9876543211')
        ON DUPLICATE KEY UPDATE name='Dr. R. Sundar (HOD - B.Sc IT)', role='hod', school_id=5, status='active';
    """, (hod1_id, PWD_HASH))

    cursor.execute("""
        INSERT INTO departments (code, name, school_id, hod_id)
        VALUES ('BSC_IT', 'B.Sc Information Technology', 5, %s)
        ON DUPLICATE KEY UPDATE name='B.Sc Information Technology', school_id=5, hod_id=%s;
    """, (hod1_id, hod1_id))
    
    cursor.execute("SELECT id FROM departments WHERE code = 'BSC_IT';")
    dept1_id = cursor.fetchone()["id"]
    cursor.execute("UPDATE users SET department_id = %s WHERE id = %s;", (dept1_id, hod1_id))

    # Advisor 1 (Prof. K. Anitha)
    adv1_id = '34ac1a88-fd5b-4e74-9432-f16793591e1c'
    cursor.execute("""
        INSERT INTO users (id, reg_no_emp_id, name, email, password_hash, role, school_id, department_id, status, phone)
        VALUES (%s, 'ADV_IT_01', 'Prof. K. Anitha', 'advisor.secA@college.edu', %s, 'advisor', 5, %s, 'active', '9876543212')
        ON DUPLICATE KEY UPDATE name='Prof. K. Anitha', role='advisor', school_id=5, department_id=%s, status='active';
    """, (adv1_id, PWD_HASH, dept1_id, dept1_id))

    # Advisor 2 (Dr. R. Sundaram)
    adv2_id = '33333333-3333-3333-3333-333333333333'
    cursor.execute("""
        INSERT INTO users (id, reg_no_emp_id, name, email, password_hash, role, school_id, department_id, status, phone)
        VALUES (%s, 'ADV_IT_02', 'Dr. R. Sundaram', 'advisor@kprcas.ac.in', %s, 'advisor', 5, %s, 'active', '9876543216')
        ON DUPLICATE KEY UPDATE name='Dr. R. Sundaram', role='advisor', school_id=5, department_id=%s, status='active';
    """, (adv2_id, PWD_HASH, dept1_id, dept1_id))

    # Classes in B.Sc IT
    cursor.execute("""
        INSERT INTO classes (id, department_id, name, section, batch_year, advisor_id)
        VALUES (1, %s, 'I B.Sc (IT)', 'A', '2024-2027', %s)
        ON DUPLICATE KEY UPDATE department_id=%s, name='I B.Sc (IT)', section='A', batch_year='2024-2027', advisor_id=%s;
    """, (dept1_id, adv1_id, dept1_id, adv1_id))
    cursor.execute("UPDATE users SET class_id = 1 WHERE id = %s;", (adv1_id,))

    cursor.execute("""
        INSERT INTO classes (id, department_id, name, section, batch_year, advisor_id)
        VALUES (3, %s, 'II B.Sc (IT)', 'A', '2023-2026', %s)
        ON DUPLICATE KEY UPDATE department_id=%s, name='II B.Sc (IT)', section='A', batch_year='2023-2026', advisor_id=%s;
    """, (dept1_id, adv2_id, dept1_id, adv2_id))
    cursor.execute("UPDATE users SET class_id = 3 WHERE id = %s;", (adv2_id,))

    # Students in B.Sc IT
    it_students = [
        ('11111111-1111-1111-1111-111111111111', '21BIT001', 'Aarav Sharma', 'student1@kprcas.ac.in', 1, 1, 2, 48, 10, 24.0, 1),
        ('f4fef1da-b8c2-43e6-94b3-f850a1111aba', '24BIT002', 'Aravind Swamy', 'student2024@college.edu', 1, 1, 2, 36, 5, 18.0, 1),
        ('f6a56ce5-ac53-4174-a97b-5ff470fe31d0', '24BIT003', 'Priya Dharshini', 'student2@college.edu', 1, 1, 2, 28, 0, 14.0, 1),
        ('aaaaaaaa-1111-2222-3333-444444444441', '23BIT015', 'Gokul Krishna', 'gokul.it@college.edu', 3, 2, 4, 62, 15, 31.0, 1),
        ('aaaaaaaa-1111-2222-3333-444444444442', '23BIT022', 'Swetha Ramesh', 'swetha.it@college.edu', 3, 2, 4, 42, 5, 21.0, 1)
    ]

    for st_id, reg, name, email, cls_id, yr, sem, sp, bonus, marks, mand in it_students:
        cursor.execute("""
            INSERT INTO users (id, reg_no_emp_id, name, email, password_hash, role, school_id, department_id, class_id, year, semester, status)
            VALUES (%s, %s, %s, %s, %s, 'student', 5, %s, %s, %s, %s, 'active')
            ON DUPLICATE KEY UPDATE reg_no_emp_id=%s, name=%s, school_id=5, department_id=%s, class_id=%s, year=%s, semester=%s, status='active';
        """, (st_id, reg, name, email, PWD_HASH, dept1_id, cls_id, yr, sem, reg, name, dept1_id, cls_id, yr, sem))
        
        cursor.execute("""
            INSERT INTO student_summaries (student_id, total_sp, bonus_sp, internal_marks_100, mandatory_satisfied)
            VALUES (%s, %s, %s, %s, %s)
            ON DUPLICATE KEY UPDATE total_sp=%s, bonus_sp=%s, internal_marks_100=%s, mandatory_satisfied=%s;
        """, (st_id, sp, bonus, marks, mand, sp, bonus, marks, mand))

    # -------------------------------------------------------------
    # 2. Department 2: B.Sc Computer Technology (B.Sc CT)
    # -------------------------------------------------------------
    hod2_id = '44444444-4444-4444-4444-444444444444'
    cursor.execute("""
        INSERT INTO users (id, reg_no_emp_id, name, email, password_hash, role, school_id, status, phone)
        VALUES (%s, 'HOD_CT_01', 'Dr. K. Meenakshi (HOD - B.Sc CT)', 'hod@kprcas.ac.in', %s, 'hod', 5, 'active', '9876543213')
        ON DUPLICATE KEY UPDATE name='Dr. K. Meenakshi (HOD - B.Sc CT)', role='hod', school_id=5, status='active';
    """, (hod2_id, PWD_HASH))

    cursor.execute("""
        INSERT INTO departments (code, name, school_id, hod_id)
        VALUES ('BSC_CT', 'B.Sc Computer Technology', 5, %s)
        ON DUPLICATE KEY UPDATE name='B.Sc Computer Technology', school_id=5, hod_id=%s;
    """, (hod2_id, hod2_id))

    cursor.execute("SELECT id FROM departments WHERE code = 'BSC_CT';")
    dept2_id = cursor.fetchone()["id"]
    cursor.execute("UPDATE users SET department_id = %s WHERE id = %s;", (dept2_id, hod2_id))

    # Advisor for CT (Prof. V. Suresh)
    adv_ct_id = 'bbbbbbbb-1111-2222-3333-444444444444'
    cursor.execute("""
        INSERT INTO users (id, reg_no_emp_id, name, email, password_hash, role, school_id, department_id, status, phone)
        VALUES (%s, 'ADV_CT_01', 'Prof. V. Suresh', 'advisor.ct@college.edu', %s, 'advisor', 5, %s, 'active', '9876543218')
        ON DUPLICATE KEY UPDATE name='Prof. V. Suresh', role='advisor', school_id=5, department_id=%s, status='active';
    """, (adv_ct_id, PWD_HASH, dept2_id, dept2_id))

    # Classes in B.Sc CT
    cursor.execute("""
        INSERT INTO classes (id, department_id, name, section, batch_year, advisor_id)
        VALUES (2, %s, 'I B.Sc (CT)', 'A', '2024-2027', %s)
        ON DUPLICATE KEY UPDATE department_id=%s, name='I B.Sc (CT)', section='A', batch_year='2024-2027', advisor_id=%s;
    """, (dept2_id, adv_ct_id, dept2_id, adv_ct_id))
    cursor.execute("UPDATE users SET class_id = 2 WHERE id = %s;", (adv_ct_id,))

    # Students in B.Sc CT
    ct_students = [
        ('22222222-2222-2222-2222-222222222222', '21BCT001', 'Priya Patel', 'priya.ct@kprcas.ac.in', 2, 1, 2, 54, 10, 27.0, 1),
        ('7aae593f-98ce-41da-a4e2-1753bfef514b', '24BCT015', 'Rajesh Kumar', 'student3@college.edu', 2, 1, 2, 40, 5, 20.0, 1),
        ('cccccccc-1111-2222-3333-444444444441', '24BCT020', 'Kavya S', 'kavya.ct@college.edu', 2, 1, 2, 32, 0, 16.0, 1),
        ('cccccccc-1111-2222-3333-444444444442', '24BCT035', 'Dinesh Karthik', 'dinesh.ct@college.edu', 2, 1, 2, 22, 0, 11.0, 0)
    ]

    for st_id, reg, name, email, cls_id, yr, sem, sp, bonus, marks, mand in ct_students:
        cursor.execute("""
            INSERT INTO users (id, reg_no_emp_id, name, email, password_hash, role, school_id, department_id, class_id, year, semester, status)
            VALUES (%s, %s, %s, %s, %s, 'student', 5, %s, %s, %s, %s, 'active')
            ON DUPLICATE KEY UPDATE reg_no_emp_id=%s, name=%s, school_id=5, department_id=%s, class_id=%s, year=%s, semester=%s, status='active';
        """, (st_id, reg, name, email, PWD_HASH, dept2_id, cls_id, yr, sem, reg, name, dept2_id, cls_id, yr, sem))
        
        cursor.execute("""
            INSERT INTO student_summaries (student_id, total_sp, bonus_sp, internal_marks_100, mandatory_satisfied)
            VALUES (%s, %s, %s, %s, %s)
            ON DUPLICATE KEY UPDATE total_sp=%s, bonus_sp=%s, internal_marks_100=%s, mandatory_satisfied=%s;
        """, (st_id, sp, bonus, marks, mand, sp, bonus, marks, mand))

    # Add sample achievements & star transactions for both departments
    cursor.execute("""
        INSERT INTO star_transactions (student_id, achievement_id, vertical_id, sp_awarded, is_bonus, awarded_by)
        VALUES
        ('11111111-1111-1111-1111-111111111111', 1, 1, 15, 0, %s),
        ('11111111-1111-1111-1111-111111111111', 1, 7, 20, 1, %s),
        ('22222222-2222-2222-2222-222222222222', 1, 1, 20, 0, %s),
        ('22222222-2222-2222-2222-222222222222', 1, 8, 20, 1, %s)
        ON DUPLICATE KEY UPDATE sp_awarded=VALUES(sp_awarded);
    """, (adv1_id, adv1_id, adv_ct_id, adv_ct_id))

    print(f"SUCCESS: Department 1 (B.Sc IT, id={dept1_id}) and Department 2 (B.Sc CT, id={dept2_id}) seeded with students, classes, and HODs under School of Computing Science!")

conn.close()
