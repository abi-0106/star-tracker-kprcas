-- ============================================================
-- STAR TRACKER ERP – Seed Data (MySQL)
-- Master data: Verticals V1-V10, Activities, Levels, Demo Users
-- Password for all demo accounts: password123
-- ============================================================

USE star_tracker;

-- 1. SYSTEM SETTINGS
INSERT INTO system_settings (setting_key, setting_value, description) VALUES
  ('academic_year', '2024-2025', 'Current Academic Year'),
  ('current_semester', 'Semester 2', 'Current Active Semester'),
  ('max_star_points_limit', '200', 'Maximum star points achievable per student per semester'),
  ('sp_to_marks_ratio', '2', 'Every 2 Star Points equal 1 Internal Mark (Configurable)'),
  ('institution_name', 'KPR College of Arts Science and Research', 'Institution Name')
ON DUPLICATE KEY UPDATE setting_value=VALUES(setting_value), description=VALUES(description);

-- 2. DEPARTMENTS
INSERT INTO departments (id, code, name) VALUES 
  (1, 'SoITC', 'School of IT Integrated Commerce')
ON DUPLICATE KEY UPDATE name=VALUES(name);

-- 3. CLASSES
INSERT INTO classes (id, department_id, name, section, batch_year) VALUES
  (1, 1, 'I B.Com (IT)', 'A', '2024-2027'),
  (2, 1, 'I B.Com (BA)', 'B', '2024-2027')
ON DUPLICATE KEY UPDATE name=VALUES(name), section=VALUES(section), batch_year=VALUES(batch_year);

-- 4. DEMO USERS (Password: password123)
-- Password hash: $2b$12$OMUzuiVjAdh7cbeU6xaZweEtMlSwLbLsGDNKyfd3nZCQPVmQN6gKG
INSERT INTO users (id, reg_no_emp_id, name, email, password_hash, role, department_id, class_id, year, semester, phone, status) VALUES
  ('23ef4da9-9e1d-4a6b-a590-9e9d01344555', 'EMP001', 'System Administrator', 'admin@college.edu', '$2b$12$OMUzuiVjAdh7cbeU6xaZweEtMlSwLbLsGDNKyfd3nZCQPVmQN6gKG', 'admin', 1, NULL, 0, 0, '9876543210', 'active'),
  ('543fff16-943e-4733-ad1a-7f9473e13487', 'EMP101', 'Dr. R. Sundar (HOD)', 'hod.it@college.edu', '$2b$12$OMUzuiVjAdh7cbeU6xaZweEtMlSwLbLsGDNKyfd3nZCQPVmQN6gKG', 'hod', 1, NULL, 0, 0, '9876543211', 'active'),
  ('34ac1a88-fd5b-4e74-9432-f16793591e1c', 'EMP201', 'Prof. K. Anitha (Class Advisor)', 'advisor.secA@college.edu', '$2b$12$OMUzuiVjAdh7cbeU6xaZweEtMlSwLbLsGDNKyfd3nZCQPVmQN6gKG', 'advisor', 1, 1, 0, 0, '9876543212', 'active'),
  ('f4fef1da-b8c2-43e6-94b3-f850a1111aba', '24BIC001', 'Aravind Swamy', 'student2024@college.edu', '$2b$12$OMUzuiVjAdh7cbeU6xaZweEtMlSwLbLsGDNKyfd3nZCQPVmQN6gKG', 'student', 1, 1, 1, 2, '9876543213', 'active'),
  ('f6a56ce5-ac53-4174-a97b-5ff470fe31d0', '24BIC002', 'Priya Dharshini', 'student2@college.edu', '$2b$12$OMUzuiVjAdh7cbeU6xaZweEtMlSwLbLsGDNKyfd3nZCQPVmQN6gKG', 'student', 1, 1, 1, 2, '9876543214', 'active'),
  ('7aae593f-98ce-41da-a4e2-1753bfef514b', '24BBA015', 'Rajesh Kumar', 'student3@college.edu', '$2b$12$OMUzuiVjAdh7cbeU6xaZweEtMlSwLbLsGDNKyfd3nZCQPVmQN6gKG', 'student', 1, 2, 1, 2, '9876543215', 'active')
ON DUPLICATE KEY UPDATE name=VALUES(name), password_hash=VALUES(password_hash), role=VALUES(role), department_id=VALUES(department_id), class_id=VALUES(class_id);

-- Link HOD & Advisor
UPDATE departments SET hod_id = '543fff16-943e-4733-ad1a-7f9473e13487' WHERE id = 1;
UPDATE classes SET advisor_id = '34ac1a88-fd5b-4e74-9432-f16793591e1c' WHERE id = 1;

-- Initialize student summaries
INSERT INTO student_summaries (student_id, total_sp, bonus_sp, internal_marks_100, internal_marks_50, internal_marks_60, mandatory_satisfied, carry_forward_sp) VALUES
  ('f4fef1da-b8c2-43e6-94b3-f850a1111aba', 0, 0, 0.0, 0.0, 0.0, 0, 0),
  ('f6a56ce5-ac53-4174-a97b-5ff470fe31d0', 0, 0, 0.0, 0.0, 0.0, 0, 0),
  ('7aae593f-98ce-41da-a4e2-1753bfef514b', 0, 0, 0.0, 0.0, 0.0, 0, 0)
ON DUPLICATE KEY UPDATE student_id=VALUES(student_id);

-- 5. VERTICALS (V1–V10)
INSERT INTO verticals (id, code, name, type, min_sp, max_sp, bonus_max_sp, extended_max_sp, description, display_order, is_active) VALUES
  (1,  'V1',  'ACADEMIC PERFORMANCE',                          'Optional',  0,  25,  0,  25, 'Academic exams, attendance, internships, visits, library usage, and scholarships.',                         1, 1),
  (2,  'V2',  'LANGUAGE PROFICIENCY',                          'Optional',  0,  10,  0,  10, 'English and Tamil proficiency tests, spoken English, and translation activities.',                           2, 1),
  (3,  'V3',  'CLUBS & SOCIETIES',                             'Mandatory', 5,  20,  5,  25, 'Participation in college clubs and societies at local, inter-college, or national level.',                  3, 1),
  (4,  'V4',  'SPORTS & PHYSICAL EDUCATION',                   'Mandatory', 5,  20,  5,  25, 'Sports events, yoga, physical fitness, and sports achievements at various levels.',                         4, 1),
  (5,  'V5',  'ARTS & CULTURAL ACTIVITIES',                    'Mandatory', 5,  20,  5,  25, 'Cultural events, fine arts, music, drama, and literary activities.',                                        5, 1),
  (6,  'V6',  'COMMUNITY SERVICE',                             'Mandatory', 5,  20,  5,  25, 'NSS, NCC, social service, blood donation, and community outreach.',                                         6, 1),
  (7,  'V7',  'PROFESSIONAL CERTIFICATIONS & ONLINE COURSES',  'Optional',  0,  20,  5,  25, 'Industry certifications (NPTEL, Coursera, Udemy) and value-added courses.',                               7, 1),
  (8,  'V8',  'ENTREPRENEURSHIP & INNOVATION',                 'Optional',  0,  20,  5,  25, 'Startup activities, business plans, patents, publications, and innovation projects.',                       8, 1),
  (9,  'V9',  'LEADERSHIP & RESPONSIBILITY',                   'Mandatory', 5,  20,  5,  25, 'Student council, class representative, event organization, and institutional responsibilities.',            9, 1),
  (10, 'V10', 'DISCIPLINE & CONDUCT',                          'Mandatory', 5,  20,  0,  20, 'Academic integrity, punctuality, behavior, mentor feedback, and disciplinary record.',                    10, 1)
ON DUPLICATE KEY UPDATE name=VALUES(name), type=VALUES(type), min_sp=VALUES(min_sp), max_sp=VALUES(max_sp), bonus_max_sp=VALUES(bonus_max_sp), extended_max_sp=VALUES(extended_max_sp);

-- 6. ACTIVITIES & LEVELS FOR ALL VERTICALS

-- V1: Academic Performance
INSERT INTO activities (id, vertical_id, activity_no, name, is_bonus_eligible, max_sp, required_proof_type) VALUES
  (1, 1, 1, 'Semester Exam Percentage', 0, 5, 'PDF, Image'),
  (2, 1, 2, 'Attendance Percentage', 0, 5, 'PDF, Image'),
  (3, 1, 3, 'Internship / Mini Project', 0, 6, 'PDF'),
  (4, 1, 4, 'Industry / Field Visit', 0, 3, 'PDF, Image'),
  (5, 1, 5, 'Library Usage', 0, 2, 'PDF, Image'),
  (6, 1, 6, 'Scholarship', 0, 4, 'PDF')
ON DUPLICATE KEY UPDATE name=VALUES(name);

INSERT INTO activity_levels (activity_id, level_no, level_name, description, sp_points) VALUES
  (1, 1, 'Level 1 (Entry)', '< 60%', 2),
  (1, 2, 'Level 2 (Developing)', '60–69%', 3),
  (1, 3, 'Level 3 (Proficient)', '70–79%', 4),
  (1, 4, 'Level 4 (Expert)', '80% and above', 5),
  (2, 1, 'Level 1 (Entry)', '75–79%', 2),
  (2, 2, 'Level 2 (Developing)', '80–89%', 3),
  (2, 3, 'Level 3 (Proficient)', '90–94%', 4),
  (2, 4, 'Level 4 (Expert)', '95% and above', 5),
  (3, 1, 'Level 1 (Entry)', 'Industry Internship (1 week)', 3),
  (3, 2, 'Level 2 (Developing)', 'Industry Internship (2 weeks)', 4),
  (3, 3, 'Level 3 (Proficient)', 'Industry Internship (4 weeks)', 6),
  (4, 1, 'Level 1 (Entry)', 'Participated', 1),
  (4, 2, 'Level 2 (Developing)', 'Organizer', 2),
  (4, 3, 'Level 3 (Proficient)', 'Report Submitted', 3),
  (5, 1, 'Level 1 (Entry)', '5–9 books per sem', 1),
  (5, 2, 'Level 2 (Developing)', '10+ books per sem', 2),
  (6, 1, 'Level 1 (Entry)', 'Government Scholarship', 2),
  (6, 2, 'Level 2 (Developing)', 'Merit Scholarship', 4);

-- V2: Language Proficiency
INSERT INTO activities (id, vertical_id, activity_no, name, is_bonus_eligible, max_sp, required_proof_type) VALUES
  (7, 2, 1, 'English Proficiency (BEC / IELTS / TOEFL)', 0, 5, 'PDF'),
  (8, 2, 2, 'Tamil Literary / Creative Writing / Elocution', 0, 5, 'PDF, Image')
ON DUPLICATE KEY UPDATE name=VALUES(name);

INSERT INTO activity_levels (activity_id, level_no, level_name, description, sp_points) VALUES
  (7, 1, 'Level 1 (Entry)', 'Attempted / Preliminary', 2),
  (7, 2, 'Level 2 (Developing)', 'Vantage / Band 6.0', 3),
  (7, 3, 'Level 3 (Proficient)', 'Higher / Band 7.0+', 5),
  (8, 1, 'Level 1 (Entry)', 'College Level Participation', 2),
  (8, 2, 'Level 2 (Developing)', 'Inter-College Winner / Prize', 3),
  (8, 3, 'Level 3 (Proficient)', 'State / National Level Recognition', 5);

-- V3: Clubs & Societies (Bonus eligible)
INSERT INTO activities (id, vertical_id, activity_no, name, is_bonus_eligible, max_sp, required_proof_type) VALUES
  (9, 3, 1, 'Club Membership & Active Participation', 1, 10, 'PDF, Image'),
  (10, 3, 2, 'Club Office Bearer / Event Lead', 1, 15, 'PDF, Image')
ON DUPLICATE KEY UPDATE name=VALUES(name);

INSERT INTO activity_levels (activity_id, level_no, level_name, description, sp_points) VALUES
  (9, 1, 'Level 1 (Entry)', 'Attended 3+ club sessions', 3),
  (9, 2, 'Level 2 (Developing)', 'Active contributor / volunteer', 5),
  (9, 3, 'Level 3 (Proficient)', 'Core organizing team', 10),
  (10, 1, 'Level 1 (Entry)', 'Event Coordinator', 5),
  (10, 2, 'Level 2 (Developing)', 'Joint Secretary / Treasurer', 10),
  (10, 3, 'Level 3 (Proficient)', 'President / Secretary', 15);

-- V4: Sports & Physical Education (Bonus eligible)
INSERT INTO activities (id, vertical_id, activity_no, name, is_bonus_eligible, max_sp, required_proof_type) VALUES
  (11, 4, 1, 'Intramural / Inter-Department Sports', 1, 10, 'PDF, Image'),
  (12, 4, 2, 'Inter-Collegiate / Zonal Sports', 1, 15, 'PDF, Image'),
  (13, 4, 3, 'Yoga & Fitness Certification', 0, 5, 'PDF')
ON DUPLICATE KEY UPDATE name=VALUES(name);

INSERT INTO activity_levels (activity_id, level_no, level_name, description, sp_points) VALUES
  (11, 1, 'Level 1 (Entry)', 'Participation in Sports Day events', 3),
  (11, 2, 'Level 2 (Developing)', 'Runner up / Medallist', 5),
  (11, 3, 'Level 3 (Proficient)', 'Winner / Trophy', 10),
  (12, 1, 'Level 1 (Entry)', 'Represented College in Zonal/District', 6),
  (12, 2, 'Level 2 (Developing)', 'State level participation/prize', 10),
  (12, 3, 'Level 3 (Proficient)', 'National level participation/prize', 15),
  (13, 1, 'Level 1 (Entry)', 'Completed 15-day Yoga course', 2),
  (13, 2, 'Level 2 (Developing)', 'Certified Yoga / Fitness instructor level', 5);

-- V5: Arts & Cultural Activities (Bonus eligible)
INSERT INTO activities (id, vertical_id, activity_no, name, is_bonus_eligible, max_sp, required_proof_type) VALUES
  (14, 5, 1, 'Fine Arts / Music / Dance / Drama', 1, 12, 'PDF, Image'),
  (15, 5, 2, 'Cultural Fest Organization / Hosting', 1, 13, 'PDF, Image')
ON DUPLICATE KEY UPDATE name=VALUES(name);

INSERT INTO activity_levels (activity_id, level_no, level_name, description, sp_points) VALUES
  (14, 1, 'Level 1 (Entry)', 'Intra-college participation', 3),
  (14, 2, 'Level 2 (Developing)', 'Inter-college 1st/2nd prize', 6),
  (14, 3, 'Level 3 (Proficient)', 'State / National level winner', 12),
  (15, 1, 'Level 1 (Entry)', 'Stage / Logistics coordinator', 4),
  (15, 2, 'Level 2 (Developing)', 'Emcee / Lead host', 7),
  (15, 3, 'Level 3 (Proficient)', 'Overall fest coordinator', 13);

-- V6: Community Service (Bonus eligible)
INSERT INTO activities (id, vertical_id, activity_no, name, is_bonus_eligible, max_sp, required_proof_type) VALUES
  (16, 6, 1, 'NSS / YRC / RRC Special Camp Participation', 1, 10, 'PDF, Image'),
  (17, 6, 2, 'Blood Donation / Health Outreach', 0, 5, 'PDF, Image'),
  (18, 6, 3, 'Social Impact & Environmental Campaign', 1, 10, 'PDF, Image')
ON DUPLICATE KEY UPDATE name=VALUES(name);

INSERT INTO activity_levels (activity_id, level_no, level_name, description, sp_points) VALUES
  (16, 1, 'Level 1 (Entry)', 'Attended 3-day special camp', 4),
  (16, 2, 'Level 2 (Developing)', 'Attended 7-day special camp', 7),
  (16, 3, 'Level 3 (Proficient)', 'Camp student leader', 10),
  (17, 1, 'Level 1 (Entry)', 'Single blood donation (once/sem)', 3),
  (17, 2, 'Level 2 (Developing)', 'Donation + Outreach organizer', 5),
  (18, 1, 'Level 1 (Entry)', 'Tree plantation / Clean-up drive', 3),
  (18, 2, 'Level 2 (Developing)', 'Community campaign lead', 6),
  (18, 3, 'Level 3 (Proficient)', 'Recognized NGO impact project', 10);

-- V7: Professional Certifications & Online Courses (Bonus eligible)
INSERT INTO activities (id, vertical_id, activity_no, name, is_bonus_eligible, max_sp, required_proof_type) VALUES
  (19, 7, 1, 'NPTEL / SWAYAM Online Course', 1, 15, 'PDF'),
  (20, 7, 2, 'Coursera / edX / Industry Specialization', 1, 12, 'PDF'),
  (21, 7, 3, 'LinkedIn Profile & Professional Footprint', 0, 6, 'PDF, Image')
ON DUPLICATE KEY UPDATE name=VALUES(name);

INSERT INTO activity_levels (activity_id, level_no, level_name, description, sp_points) VALUES
  (19, 1, 'Level 1 (Entry)', '4-week course completed (Pass)', 5),
  (19, 2, 'Level 2 (Developing)', '8-week course completed (Elite)', 10),
  (19, 3, 'Level 3 (Proficient)', '12-week course completed (Elite + Gold/Silver)', 15),
  (20, 1, 'Level 1 (Entry)', 'Single course completed', 4),
  (20, 2, 'Level 2 (Developing)', '2-3 courses completed', 8),
  (20, 3, 'Level 3 (Proficient)', 'Full specialization / Professional cert', 12),
  (21, 1, 'Level 1 (Entry)', 'Complete profile with 50+ connections', 2),
  (21, 2, 'Level 2 (Developing)', 'Active content posting + 150+ connections', 4),
  (21, 3, 'Level 3 (Proficient)', 'Top voice / recommended portfolio', 6);

-- V8: Entrepreneurship & Innovation (Bonus eligible)
INSERT INTO activities (id, vertical_id, activity_no, name, is_bonus_eligible, max_sp, required_proof_type) VALUES
  (22, 8, 1, 'Hackathon / Ideathon Participation & Win', 1, 15, 'PDF, Image'),
  (23, 8, 2, 'Startup / Business Plan Pitch', 1, 12, 'PDF'),
  (24, 8, 3, 'Research Paper / Patent / Publication', 1, 15, 'PDF')
ON DUPLICATE KEY UPDATE name=VALUES(name);

INSERT INTO activity_levels (activity_id, level_no, level_name, description, sp_points) VALUES
  (22, 1, 'Level 1 (Entry)', 'Internal Hackathon participation', 4),
  (22, 2, 'Level 2 (Developing)', 'Inter-college / State level finalist', 8),
  (22, 3, 'Level 3 (Proficient)', 'National Hackathon winner / top 3', 15),
  (23, 1, 'Level 1 (Entry)', 'Idea submitted to Incubation Cell', 4),
  (23, 2, 'Level 2 (Developing)', 'Prototype developed & pitched', 8),
  (23, 3, 'Level 3 (Proficient)', 'Registered MSME / Funded startup', 12),
  (24, 1, 'Level 1 (Entry)', 'Presented paper in conference', 5),
  (24, 2, 'Level 2 (Developing)', 'Published in Scopus / UGC-CARE journal', 10),
  (24, 3, 'Level 3 (Proficient)', 'Published / Granted patent', 15);

-- V9: Leadership & Responsibility (Bonus eligible)
INSERT INTO activities (id, vertical_id, activity_no, name, is_bonus_eligible, max_sp, required_proof_type) VALUES
  (25, 9, 1, 'Class Representative / Student Council', 1, 12, 'PDF'),
  (26, 9, 2, 'Institutional Event Organizer / Lead', 1, 13, 'PDF, Image')
ON DUPLICATE KEY UPDATE name=VALUES(name);

INSERT INTO activity_levels (activity_id, level_no, level_name, description, sp_points) VALUES
  (25, 1, 'Level 1 (Entry)', 'Assistant Class Representative', 4),
  (25, 2, 'Level 2 (Developing)', 'Class Representative (CR)', 8),
  (25, 3, 'Level 3 (Proficient)', 'Student Council Member / Office Bearer', 12),
  (26, 1, 'Level 1 (Entry)', 'Sub-committee coordinator', 4),
  (26, 2, 'Level 2 (Developing)', 'Department symposium lead organizer', 8),
  (26, 3, 'Level 3 (Proficient)', 'College-level flagship event lead', 13);

-- V10: Discipline & Conduct
INSERT INTO activities (id, vertical_id, activity_no, name, is_bonus_eligible, max_sp, required_proof_type) VALUES
  (27, 10, 1, 'Zero Disciplinary Infractions & Punctuality', 0, 10, 'PDF'),
  (28, 10, 2, 'Class Mentor & Advisor Recommendation', 0, 10, 'PDF')
ON DUPLICATE KEY UPDATE name=VALUES(name);

INSERT INTO activity_levels (activity_id, level_no, level_name, description, sp_points) VALUES
  (27, 1, 'Level 1 (Entry)', 'Satisfactory attendance & conduct', 4),
  (27, 2, 'Level 2 (Developing)', 'No disciplinary warnings throughout semester', 7),
  (27, 3, 'Level 3 (Proficient)', 'Exemplary conduct and punctuality record', 10),
  (28, 1, 'Level 1 (Entry)', 'Positive mentor feedback', 4),
  (28, 2, 'Level 2 (Developing)', 'Advisor commendation certificate', 7),
  (28, 3, 'Level 3 (Proficient)', 'HOD & Principal star citizenship endorsement', 10);

-- Welcome notifications
INSERT INTO notifications (user_id, title, message, type) VALUES
  ('f4fef1da-b8c2-43e6-94b3-f850a1111aba', 'Welcome to STAR Tracker ERP', 'Your profile is configured. Track V1–V10 verticals and submit achievement proofs.', 'info'),
  ('f6a56ce5-ac53-4174-a97b-5ff470fe31d0', 'Welcome to STAR Tracker ERP', 'Submit your activity certificates for advisor approval to earn Star Points.', 'info'),
  ('34ac1a88-fd5b-4e74-9432-f16793591e1c', 'Advisor Dashboard Ready', 'You are assigned as Class Advisor for I B.Com (IT) – Section A.', 'info'),
  ('543fff16-943e-4733-ad1a-7f9473e13487', 'HOD Access Granted', 'Department overview for School of IT Integrated Commerce is ready.', 'info');
