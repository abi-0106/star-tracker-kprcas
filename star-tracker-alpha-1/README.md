# Star Tracker - KPRCAS Activity & Star Points ERP System

A full-stack enterprise web application developed for **KPR College of Arts, Science and Research (KPRCAS)** to record, verify, and translate co-curricular & extracurricular achievements across a **10-Vertical Framework** into academic **Star Points (SP)** and **Internal Marks**.

---

## 🚀 Key Features

* **10-Vertical Holistic Framework**: Comprehensive tracking across V1–V10 (Academics, MOOCs, Sports, Cultural, Leadership, Startups, NSS/NCC, etc.).
* **Dynamic Point Conversion Engine**: Star Points are directly and deterministically converted into Internal Marks (`2 Star Points = 1 Internal Mark` by default, configurable in System Rules).
* **Role-Based Portals**:
  * **Student Portal**: Certificate upload, live Star Points tracker, mark calculation, level selection, feedback review.
  * **Advisor Portal**: Direct certificate review workflow (Approve / Return / Reject), student gallery, class analytics.
  * **HOD Portal**: Department-wide analytics, advisor distribution, consolidated mark sheet generation.
  * **Admin Portal**: System rules & conversion ratio management, user management, immutable audit logs.
  * **Leaderboard**: Real-time ranking with podium badges and filters.
* **Direct Proof Document Viewer**: In-browser preview for PDF and Image credentials with zoom, rotation, and direct advisor actions.
* **Instant Export**: Download official marks sheets in Excel (`.xlsx`) via pandas or client-side PDF.
* **High Performance**: Built with React 18 + Vite and Python FastAPI + PyMySQL.

---

## 🛠️ Technology Stack

| Layer | Technology |
|---|---|
| **Frontend** | React 18, Vite, Tailwind CSS, Lucide Icons, jsPDF, XLSX |
| **Backend** | Python 3.10+, FastAPI, Uvicorn, PyMySQL, pandas, openpyxl, pyjwt, bcrypt |
| **Database** | MySQL 8.0+ (Relational 3NF, 12 tables) |
| **Storage** | Local disk storage with UUID file hashing |

---

## 📁 Project Structure

```
star-tracker-kpr/
├── backend/
│   ├── main.py                     # FastAPI application & PyMySQL API routes
│   ├── requirements.txt            # Python dependencies
│   ├── .env                        # Backend environment configuration
│   ├── .env.example                # Example environment template
│   └── uploads/
│       └── achievements/           # Student uploaded proof documents
│
├── frontend/
│   ├── public/                     # Static assets and KPRCAS branding
│   ├── src/
│   │   ├── components/             # Reusable UI components & modals
│   │   ├── context/                # Auth context & state management
│   │   ├── pages/                  # Role-based pages & dashboards
│   │   ├── services/               # REST API client
│   │   ├── styles/                 # Tailwind CSS styles & themes
│   │   ├── utils/                  # Export utilities (PDF/Excel)
│   │   ├── App.jsx                 # Route definitions & protection
│   │   └── main.jsx                # React DOM entry point
│   ├── package.json                # Frontend dependencies & scripts
│   ├── vite.config.js              # Vite configuration & API proxy
│   └── .env                        # Frontend environment variables
│
├── database/
│   ├── schema.sql                  # Complete MySQL schema (12 tables)
│   └── seed.sql                    # Seed data (10 Verticals, 28 activities, 82 levels, demo users)
│
├── docs/
│   ├── architecture.md             # High-level architecture documentation
│   ├── api_reference.md            # REST API endpoints & schemas
│   └── database_design.md          # ERD and database table specifications
│
├── .gitignore                      # Git ignore rules
└── README.md                       # Main documentation
```

---

## ⚙️ Quick Start

### 1. Database Setup
1. Ensure MySQL 8.0+ server is running.
2. Create and seed the database:
   ```bash
   mysql -u root -p < database/schema.sql
   mysql -u root -p < database/seed.sql
   ```

### 2. Backend Setup
1. Navigate to `backend/`:
   ```bash
   cd backend
   pip install -r requirements.txt
   ```
2. Configure `.env` with your MySQL credentials and JWT secret:
   ```ini
   DB_HOST=localhost
   DB_PORT=3306
   DB_USER=root
   DB_PASSWORD=your_mysql_password
   DB_NAME=star_tracker
   JWT_SECRET_KEY=kprcas_star_tracker_super_secret_jwt_key_2026
   CORS_ORIGINS=http://localhost:5173,http://127.0.0.1:5173
   ```
3. Start the FastAPI backend server:
   ```bash
   uvicorn main:app --reload --port 8000
   ```
   API Docs will be accessible at `http://localhost:8000/docs`.

### 3. Frontend Setup
1. Navigate to `frontend/`:
   ```bash
   cd frontend
   npm install
   npm run dev
   ```
2. Open `http://localhost:5173` in your browser.

---

## 👥 Demo User Accounts

All demo accounts have password: **`Password@123`**

| Role | Email | Name | Identifier |
|---|---|---|---|
| **Student** | `student1@kprcas.ac.in` | Aarav Sharma | `21BCS001` (III B.Sc CS - A) |
| **Student** | `student2@kprcas.ac.in` | Priya Patel | `21BCS002` (III B.Sc CS - A) |
| **Advisor** | `advisor@kprcas.ac.in` | Dr. R. Sundaram | `EMP101` (Advisor for III CS - A) |
| **HOD** | `hod@kprcas.ac.in` | Dr. K. Meenakshi | `EMP001` (HOD Computer Science) |
| **Admin** | `admin@kprcas.ac.in` | Principal / System Admin | `ADM001` (Administrator) |

---

## 📊 Conversion Logic
$$\text{Internal Marks} = \left\lfloor \frac{\text{Total Approved Star Points}}{\text{SP Ratio (Default: 2)}} \right\rfloor$$

Example: **50 Star Points** $\rightarrow$ **25 Internal Marks**.
