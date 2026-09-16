# Star Tracker ERP - System Architecture

## Overview
Star Tracker is an Enterprise Resource Planning (ERP) platform developed for KPR College of Arts, Science and Research (KPRCAS) to evaluate, track, and credit student holistic co-curricular and extracurricular achievements across a **10-Vertical Framework**.

The system translates verified student activity credentials into academic **Star Points (SP)** and automatically computes **Internal Marks** according to institutional conversion rules (Default: `2 Star Points = 1 Internal Mark`).

---

## High-Level Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    Client Browser Tier                      │
│   React 18 + Vite SPA  (Role-based Dashboards & Responsive)  │
│   Tailwind CSS (Institutional Theme & Custom Palettes)      │
└──────────────────────────────┬──────────────────────────────┘
                               │  REST API (JSON) + Form Data
                               ▼
┌─────────────────────────────────────────────────────────────┐
│                    FastAPI Backend Tier                     │
│  - Python 3.10+ / FastAPI Application                       │
│  - PyMySQL Direct Driver with Thread-safe Connection Pool   │
│  - JWT Bearer Authentication (Role-based Authorization)     │
│  - Deterministic Scoring & Mark Calculation Engine          │
│  - Direct File Storage for Proof Documents                  │
│  - pandas for Excel Marksheet Generation & Ingestion        │
└──────────────────────────────┬──────────────────────────────┘
                               │  SQL Queries & Transactions
                               ▼
┌─────────────────────────────────────────────────────────────┐
│                    MySQL Database Tier                      │
│  - Relational Schema (12 Tables) with Foreign Key Cascades  │
│  - Atomic Transaction Logging & System Audit Trail          │
│  - Dynamic Rule Settings (sp_to_marks_ratio)                │
└─────────────────────────────────────────────────────────────┘
```

---

## Core System Components

### 1. Frontend Tier (`frontend/`)
* **Framework**: React 18 with Vite for ultra-fast HMR and optimized production bundles.
* **Routing**: React Router v6 with strict role-based route protection (`student`, `advisor`, `hod`, `admin`).
* **UI/UX**:
  * Clean institutional styling aligning with KPRCAS branding.
  * Modal-based PDF and image document previewer with zoom/rotation capabilities.
  * Direct advisor workflow (Approve / Return / Reject) with zero AI dependencies.
  * Client-side & Server-side Excel/PDF report generation with `jspdf`, `jspdf-autotable`, `xlsx`, and `pandas`.

### 2. Backend Tier (`backend/`)
* **Framework**: FastAPI (Python).
* **Database Driver**: PyMySQL (Direct SQL with `DictCursor` for deterministic queries and zero ORM overhead).
* **Authentication**: Stateless HMAC-SHA256 JWT tokens with secure cookie / Bearer token storage.
* **Proof Document Storage**: Direct local file storage (`backend/uploads/achievements/`) with unique UUID hashing and static route serving.
* **Scoring Engine**:
  * Activity levels mapping to exact pre-configured Star Points.
  * Multiplier and cap evaluation per vertical.
  * Real-time calculation: $\text{Internal Marks} = \lfloor \frac{\text{Total Star Points}}{\text{SP Ratio}} \rfloor$.

### 3. Database Tier (`database/`)
* **Engine**: MySQL 8.0+.
* **Schema Design**: Normalized 3NF relational schema with 12 core tables:
  * `system_settings`: Key-value configuration for point ratios, mark caps, and submission deadlines.
  * `departments` & `classes`: Institutional hierarchy.
  * `users`: Multi-role user directory with bcrypt-hashed passwords.
  * `verticals`, `activities`, `activity_levels`: 10 Verticals, 28 activities, and 82 levels.
  * `achievements`: Student certificate submissions and review lifecycle.
  * `star_transactions`: Immutable ledger of awarded Star Points.
  * `student_summaries`: Materialized score cache for performance.
  * `notifications`: Real-time student alerts.
  * `audit_logs`: Traceable system actions and admin modifications.

---

## 10-Vertical Framework

| Code | Vertical Name | Focus Area |
|------|---------------|------------|
| **V1** | Academic Excellence & MOOCs | NPTEL, Coursera, Swayam, Research Papers |
| **V2** | Skill Development & Certifications | Value-added courses, Technical certifications |
| **V3** | Innovation, IPR & Hackathons | Patents, Prototypes, Hackathon winnings |
| **V4** | Sports & Physical Fitness | Inter-college, State, National sports tournaments |
| **V5** | Cultural & Creative Arts | Music, Dance, Fine Arts, Literary competitions |
| **V6** | Community Service, NSS & NCC | Social outreach, Blood donation, Extension activities |
| **V7** | Leadership, Clubs & Professional Bodies | Club office bearers, IEEE/CSI/Rotaract events |
| **V8** | Entrepreneurship & Startups | Incubation, Business plans, Startup initiatives |
| **V9** | Internships & Industry Exposure | Industrial visits, Corporate internships, In-plant training |
| **V10**| Environmental Sustainability & Green Initiatives | Tree plantation, Eco-club, Cleanliness drives |

---

## Security & Verification Workflow
1. **Student Submission**: The student selects the Vertical, Activity, and Achievement Level, uploads PDF/Image proof, and submits.
2. **Advisor Verification**: The assigned Class Advisor reviews the proof document in full fidelity via the built-in Proof Viewer modal.
3. **Approval Lifecycle**:
   - **Approve**: Points credited to student ledger, internal marks updated, notification dispatched.
   - **Return**: Feedback provided; student can resubmit with corrected documentation.
   - **Reject**: Certificate rejected with mandatory reason recorded in audit log.
