import os
import pymysql
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

PWD_HASH = "$2b$12$OMUzuiVjAdh7cbeU6xaZweEtMlSwLbLsGDNKyfd3nZCQPVmQN6gKG"

with conn.cursor() as cursor:
    # 1. School of IT Integrated Commerce (School 3) Dean
    cursor.execute("""
        INSERT INTO users (id, reg_no_emp_id, name, email, password_hash, role, school_id, status)
        VALUES ('33333333-dean-3333-3333-333333333333', 'DEAN003', 'Dr. N. Karthikeyan (Dean - SoITC)', 'dean.soitc@kprcas.ac.in', %s, 'dean', 3, 'active')
        ON DUPLICATE KEY UPDATE name='Dr. N. Karthikeyan (Dean - SoITC)', role='dean', school_id=3, status='active';
    """, (PWD_HASH,))
    cursor.execute("UPDATE schools SET dean_id = '33333333-dean-3333-3333-333333333333' WHERE id = 3;")

    # 2. School of Management (School 1) Dean
    cursor.execute("""
        INSERT INTO users (id, reg_no_emp_id, name, email, password_hash, role, school_id, status)
        VALUES ('11111111-dean-1111-1111-111111111111', 'DEAN001_SOM', 'Dr. M. Prakash (Dean - SOM)', 'dean.som@kprcas.ac.in', %s, 'dean', 1, 'active')
        ON DUPLICATE KEY UPDATE name='Dr. M. Prakash (Dean - SOM)', role='dean', school_id=1, status='active';
    """, (PWD_HASH,))
    cursor.execute("UPDATE schools SET dean_id = '11111111-dean-1111-1111-111111111111' WHERE id = 1;")

    # 3. School of Commerce (School 2) Dean
    cursor.execute("""
        INSERT INTO users (id, reg_no_emp_id, name, email, password_hash, role, school_id, status)
        VALUES ('22222222-dean-2222-2222-222222222222', 'DEAN002_SOC', 'Dr. V. Rajesh (Dean - SOC)', 'dean.soc@kprcas.ac.in', %s, 'dean', 2, 'active')
        ON DUPLICATE KEY UPDATE name='Dr. V. Rajesh (Dean - SOC)', role='dean', school_id=2, status='active';
    """, (PWD_HASH,))
    cursor.execute("UPDATE schools SET dean_id = '22222222-dean-2222-2222-222222222222' WHERE id = 2;")

    print("Created dedicated Dean accounts for School 1 (SOM), School 2 (SOC), School 3 (SoITC), and School 5 (SOCS).")

conn.close()
