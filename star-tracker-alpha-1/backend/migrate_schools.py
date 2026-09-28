import os
import pymysql
from dotenv import load_dotenv

dotenv_path = os.path.join(os.path.dirname(__file__), "..", "backend", ".env")
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

with conn.cursor() as cursor:
    # 1. Create schools table
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS schools (
            id INT AUTO_INCREMENT PRIMARY KEY,
            code VARCHAR(50) NOT NULL UNIQUE,
            name VARCHAR(255) NOT NULL,
            dean_id VARCHAR(36) NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    """)
    
    # 2. Add school_id to departments if not present
    cursor.execute("SHOW COLUMNS FROM departments LIKE 'school_id';")
    if not cursor.fetchone():
        cursor.execute("ALTER TABLE departments ADD COLUMN school_id INT NULL AFTER id;")
        cursor.execute("ALTER TABLE departments ADD CONSTRAINT fk_depts_school FOREIGN KEY (school_id) REFERENCES schools(id) ON DELETE SET NULL;")
        print("Added school_id to departments")
        
    # 3. Add school_id to users if not present
    cursor.execute("SHOW COLUMNS FROM users LIKE 'school_id';")
    if not cursor.fetchone():
        cursor.execute("ALTER TABLE users ADD COLUMN school_id INT NULL AFTER role;")
        cursor.execute("ALTER TABLE users ADD CONSTRAINT fk_users_school FOREIGN KEY (school_id) REFERENCES schools(id) ON DELETE SET NULL;")
        print("Added school_id to users")

    # 4. Insert 6 Schools
    schools_data = [
        (1, 'SOM', 'School of Management'),
        (2, 'SOC', 'School of Commerce'),
        (3, 'SoITC', 'School of IT Integrated Commerce'),
        (4, 'SOF', 'School of Fashion'),
        (5, 'SOCS', 'School of Computing Science'),
        (6, 'SOISDS', 'School of Intelligent Systems & Data Science')
    ]
    for s_id, s_code, s_name in schools_data:
        cursor.execute("""
            INSERT INTO schools (id, code, name) VALUES (%s, %s, %s)
            ON DUPLICATE KEY UPDATE code = VALUES(code), name = VALUES(name);
        """, (s_id, s_code, s_name))
    print("Inserted/Updated 6 Schools")

    # 5. Insert / Update 22 Programmes/Departments under their respective schools
    departments_data = [
        # School 1: School of Management
        ('BBA', 'Bachelor of Business Administration', 1),
        ('BBA_CA', 'BBA Computer Applications', 1),
        ('BBA_IB', 'BBA International Business', 1),
        ('BBA_LOG', 'BBA Logistics', 1),

        # School 2: School of Commerce
        ('BCOM', 'Bachelor of Commerce', 2),
        ('BCOM_PA', 'B.Com Professional Accounting', 2),
        ('BCOM_BI', 'B.Com Banking & Insurance', 2),

        # School 3: School of IT Integrated Commerce
        ('BCOM_CA', 'B.Com Computer Applications', 3),
        ('BCOM_ECOM', 'B.Com E-Commerce', 3),
        ('BCOM_BA', 'B.Com Business Analytics', 3),
        ('BCOM_IT', 'B.Com Information Technology', 3),

        # School 4: School of Fashion
        ('BSC_CDF', 'B.Sc Costume Design & Fashion', 4),

        # School 5: School of Computing Science
        ('BSC_IT', 'B.Sc Information Technology', 5),
        ('BSC_CT', 'B.Sc Computer Technology', 5),
        ('BSC_CS', 'B.Sc Computer Science', 5),
        ('BSC_CS_CYBER', 'B.Sc CS Cyber Security', 5),
        ('BCA', 'Bachelor of Computer Applications', 5),
        ('BSC_CS_CLOUD', 'B.Sc CS Cloud Computing', 5),

        # School 6: School of Intelligent Systems & Data Science
        ('BSC_CSDA', 'B.Sc Computer Science with Data Analytics', 6),
        ('BSC_CS_AIDS', 'B.Sc CS (AI & Data Science)', 6),
        ('BSC_AIML', 'B.Sc Artificial Intelligence & Machine Learning', 6),
        ('BSC_DS', 'B.Sc Data Science', 6),
    ]

    for d_code, d_name, s_id in departments_data:
        cursor.execute("""
            INSERT INTO departments (code, name, school_id) VALUES (%s, %s, %s)
            ON DUPLICATE KEY UPDATE name = VALUES(name), school_id = VALUES(school_id);
        """, (d_code, d_name, s_id))
    print("Inserted/Updated 22 Departments with School mappings")

    # 6. Map demo users to appropriate schools and departments
    # Let's map DEAN001 to School of Computing Science (School 5) as default or School 3
    # Let's assign DEAN001 (Dr. S. Balasubramanian) to School 5 (School of Computing Science)
    cursor.execute("""
        UPDATE users 
        SET school_id = 5, department_id = NULL 
        WHERE email = 'dean@kprcas.ac.in';
    """)
    cursor.execute("UPDATE schools SET dean_id = '66666666-6666-6666-6666-666666666666' WHERE id = 5;")

    # Let's get department ID for BSC_IT and BSC_CT and BCOM_IT
    cursor.execute("SELECT id, code FROM departments;")
    dept_map = {row['code']: row['id'] for row in cursor.fetchall()}

    # Update student1 and student2 to BSC_IT (under School 5)
    bsc_it_id = dept_map.get('BSC_IT')
    bsc_ct_id = dept_map.get('BSC_CT')
    bca_id = dept_map.get('BCA')

    if bsc_it_id:
        cursor.execute("UPDATE users SET department_id = %s, school_id = 5 WHERE email IN ('student1@kprcas.ac.in', 'student2024@college.edu');", (bsc_it_id,))
    if bsc_ct_id:
        cursor.execute("UPDATE users SET department_id = %s, school_id = 5 WHERE email = 'student2@college.edu';", (bsc_ct_id,))
    if bca_id:
        cursor.execute("UPDATE users SET department_id = %s, school_id = 5 WHERE email = 'student3@college.edu';", (bca_id,))

    # Ensure all classes have proper department links
    if bsc_it_id:
        cursor.execute("UPDATE classes SET department_id = %s, name = 'I B.Sc (IT)' WHERE id = 1;", (bsc_it_id,))
    if bsc_ct_id:
        cursor.execute("UPDATE classes SET department_id = %s, name = 'I B.Sc (CT)' WHERE id = 2;", (bsc_ct_id,))

conn.close()
print("Migration & Seed Complete!")
