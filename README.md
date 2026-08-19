# Daily Habit Tracker — Full-Stack Web Application

A full-stack, enterprise-grade **Daily Habit Tracker Web Application** designed for high-performance productivity tracking, streak management, behavioral data intelligence, and personal milestone achievements.

Built with **React.js, Tailwind CSS, Recharts, Lucide Icons, Python Flask REST API, PostgreSQL, and SQLAlchemy ORM**.

---

## 🌟 Key Highlights & 15 Modules

| # | Module Name | Description & Capabilities |
|---|---|---|
| **01** | **Registration & Authentication** | JWT-secured user authentication, password hashing (PBKDF2/Werkzeug), email validation, session persistence, protected route guards. |
| **02** | **Executive Dashboard** | Real-time overview of today's habits, completion score, current/longest streaks, weekly adherence chart, active goals, and recent trophies. |
| **03** | **Habit Creation** | Create custom habits with categories (Fitness, Learning, Health, etc.), target frequencies, priorities, reminder times, custom color tags, and Lucide icons. |
| **04** | **Habit Management** | Comprehensive CRUD, status switching (Active, Paused, Archived), search filtering, category filtering, grid/list view toggling, and delete confirmations. |
| **05** | **Daily Habit Tracking** | 1-click check-off toggling, daily check-in logs, timestamp recording, instant celebration confetti, and automatic streak & progress recalculation. |
| **06** | **Streak Engine** | Automated calculation of consecutive daily streaks, longest historical streak, and 7-day/30-day streak metrics. |
| **07** | **Calendar History Module** | Interactive visual monthly calendar matrix with completion heat levels and a day-by-day habit inspection drawer. |
| **08** | **Statistics & Analytics** | Interactive Recharts visualizations: 30-day Area trend, Habit Comparison horizontal bars, and Category Donut charts. |
| **09** | **Progress Visualizer** | Circular SVG progress rings, daily habit efficiency gauges, and goal fulfillment indicators. |
| **10** | **Reminders & Notifications** | Automated daily habit reminder alerts, in-app notification dropdown, mark-all-read, and custom alerts. |
| **11** | **Achievements & Badges** | Gamified reward trophy cabinet with automated unlock triggers (First Habit, 3/7/14/30-Day Streaks, 100 Completions, Perfect Week, Goal Crusher). |
| **12** | **Goals Module** | Track short-term and long-term targets with start/end deadlines, progress steppers (+1, -1), and automatic milestone completion. |
| **13** | **Behavioral Insights Engine** | Rule-based data analysis engine delivering personalized recommendations on weekday vs weekend consistency, peak streaks, and revived habits. |
| **14** | **Profile & Preferences** | User profile customization (name, email, avatar, password) and preferences (OLED Dark / Daylight Light themes, 12h/24h time, date formats). |
| **15** | **Database Persistence Layer** | Relational PostgreSQL schema with SQLAlchemy ORM, foreign keys, cascade deletes, composite unique constraints, and sample demo seeders. |

---

## 🛠️ Technology Stack

### Frontend
- **React.js 18** (Vite build toolchain)
- **Tailwind CSS** (Modern design system, OLED dark & light themes)
- **React Router v6** (Protected and public route switching)
- **Axios** (REST API client with JWT interceptors)
- **Recharts** (Interactive Area, Bar, and Donut charts)
- **Lucide React** (Modern clean icons)
- **Canvas-Confetti** (Gamified celebratory effects)

### Backend
- **Python 3.10+ / 3.14**
- **Flask** (Modular Blueprint-based REST API)
- **Flask-SQLAlchemy** (Relational ORM)
- **Flask-JWT-Extended** (JWT token generation, authorization, and expiry handling)
- **Flask-CORS** (Cross-Origin Resource Sharing)
- **psycopg / psycopg2-binary** (PostgreSQL driver)
- **python-dotenv** (Environment variable management)

### Database
- **PostgreSQL** (Production & Local relational database)
- **SQLite** (Zero-config local fallback for instant offline demos)

---

## 🏛️ System Architecture

```text
┌─────────────────────────────────────────────────────────────┐
│                    REACT FRONTEND (Vite)                    │
│   Tailwind CSS · Recharts · Lucide Icons · React Router     │
└──────────────────────────────┬──────────────────────────────┘
                               │
                        REST APIs (JSON)
                    JWT Bearer Authorization
                               │
                               ▼
┌─────────────────────────────────────────────────────────────┐
│                     FLASK BACKEND API                       │
│  ├── Blueprints: Auth, Habits, Tracking, Dashboard, ...     │
│  ├── Services: StreakService, AnalyticsService, Insights    │
│  └── Utilities: Validators, Helpers, Decorators             │
└──────────────────────────────┬──────────────────────────────┘
                               │
                         SQLAlchemy ORM
                               │
                               ▼
┌─────────────────────────────────────────────────────────────┐
│                 POSTGRESQL / SQLITE DATABASE                │
│  Users · Habits · HabitRecords · Goals · Achievements ...   │
└─────────────────────────────────────────────────────────────┘
```

---

## 🗄️ Database Entity-Relationship (ER) Schema

```text
USERS (id, name, email, password_hash, avatar, created_at, updated_at)
  │
  ├──< HABITS (id, user_id, name, description, category, frequency, target,
  │            start_date, reminder_time, priority, status, color, icon)
  │      │
  │      └──< HABIT_RECORDS (id, habit_id, completed_date, completed, completed_at)
  │            [UNIQUE (habit_id, completed_date)]
  │
  ├──< GOALS (id, user_id, title, description, target, progress, unit, category,
  │           start_date, end_date, status)
  │
  ├──< ACHIEVEMENTS (id, user_id, title, description, badge, icon, category, earned_at)
  │     [UNIQUE (user_id, badge)]
  │
  ├──< NOTIFICATIONS (id, user_id, habit_id, message, scheduled_time, is_read, type)
  │
  └─── USER_SETTINGS (id, user_id, theme, notification_enabled, reminder_enabled,
                      time_format, date_format)
```

---

## 🚀 Quick Start & Installation

### 1. Prerequisites
- **Python 3.10+**
- **Node.js 18+ and npm**
- **PostgreSQL** (Optional — SQLite is preconfigured for 1-click offline demo runs)

---

### 2. Backend Setup

```bash
# Navigate to backend folder
cd backend

# (Optional) Create and activate virtual environment
python -m venv venv
# On Windows:
.\venv\Scripts\activate
# On Linux/macOS:
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Run the database seeder to populate rich demo habits, 28-day history, and badges:
python seed.py

# Start the Flask API server:
python app.py
```
> The API server will start at `http://127.0.0.1:5000`

---

### 3. Frontend Setup

```bash
# Open a new terminal in frontend folder
cd frontend

# Install node dependencies
npm install

# Start Vite development server
npm run dev
```
> The frontend application will start at `http://localhost:5173`

---

## 🔑 Demo Account Credentials

Use the preloaded demo account to immediately inspect all charts, calendar entries, active streaks, and trophies:

- **Email:** `demo@habittracker.io`
- **Password:** `password123`

*(You can also click the **"Fill Demo"** button on the login screen for instant autofill!)*

---

## 📡 REST API Documentation

### 1. Authentication
- `POST /api/auth/register` — Create a new user account & get JWT token.
- `POST /api/auth/login` — Authenticate user & receive JWT token.
- `POST /api/auth/logout` — End user session.
- `GET  /api/auth/me` — Get current logged-in user profile & settings.

### 2. Dashboard
- `GET /api/dashboard` — Consolidated dashboard payload with today's habits, completion score, streaks, weekly progress chart, active goals, and latest trophies.

### 3. Habits & Management
- `GET    /api/habits` — List user's habits (supports `?status=active`, `?category=Fitness`, `?search=workout`).
- `POST   /api/habits` — Create a new habit.
- `GET    /api/habits/:id` — Retrieve habit details with 30-day log history.
- `PUT    /api/habits/:id` — Update habit title, color, category, priority, reminder time.
- `DELETE /api/habits/:id` — Delete habit and cascade delete related records.
- `PATCH  /api/habits/:id/status` — Toggle status (`active`, `paused`, `archived`).

### 4. Daily Tracking
- `POST /api/tracking` — Toggle or record habit check-in for a specific date (`{ habit_id, date, completed }`).
- `GET  /api/tracking/today` — List active habits with today's completion status.
- `GET  /api/tracking/history` — Query historical check-in logs by date range or habit ID.

### 5. Streaks
- `GET /api/streaks` — User-wide streak metrics and active habit streaks.
- `GET /api/streaks/:habit_id` — Streak breakdown for a single habit.

### 6. Calendar
- `GET /api/calendar` — Current month habit completion matrix.
- `GET /api/calendar/:year/:month` — Day-by-day habit completion matrix for the requested month.

### 7. Analytics
- `GET /api/analytics/weekly` — 7-day daily completion trend and week-over-week growth rate.
- `GET /api/analytics/monthly` — 30-day adherence trend data.
- `GET /api/analytics/habits` — Habit comparison stats, most/least consistent habits, and category distribution.

### 8. Progress
- `GET /api/progress` — Daily completion gauge, habit efficiency meters, and goal percentages.
- `GET /api/progress/:habit_id` — Individual habit 7-day and 30-day success rates.

### 9. Goals
- `GET    /api/goals` — List user goals (`?status=in_progress` or `completed`).
- `POST   /api/goals` — Create new short-term or long-term goal.
- `PUT    /api/goals/:id` — Update goal target, deadlines, or description.
- `PATCH  /api/goals/:id/progress` — Increment or update progress (`{ delta: 1 }` or `{ value: 25 }`).
- `DELETE /api/goals/:id` — Delete goal.

### 10. Achievements
- `GET /api/achievements` — List all badges with unlocked state, descriptions, and earned timestamps.
- `GET /api/achievements/user` — List user's earned badges.

### 11. Smart Insights
- `GET /api/insights` — Dynamic rule-based behavioral insights and AI coach recommendations.

### 12. Notifications & Preferences
- `GET    /api/notifications` — List notification reminders & unread counts.
- `PUT    /api/notifications/:id/read` — Mark notification as read.
- `PUT    /api/notifications/read-all` — Mark all notifications as read.
- `DELETE /api/notifications/:id` — Delete notification.
- `GET    /api/profile` / `PUT /api/profile` — Get or update user profile info.
- `GET    /api/settings` / `PUT /api/settings` — Get or update user preferences (Theme, Formats, Reminders).

---

## 🧪 Testing

### Automated Backend Tests
Run the comprehensive test suite verifying authentication, habit CRUD, streak calculation, goals, and analytics:

```bash
cd backend
python -m unittest discover tests
```

---

## 👨‍💻 Student / Interview Demonstration Guide

When presenting this project in a viva, college presentation, or technical interview:
1. **Explain the 3-Tier Clean Architecture**: React Frontend -> REST API JSON -> Flask Controller/Service Layer -> SQLAlchemy ORM -> PostgreSQL.
2. **Demonstrate 1-Click Habit Check-In**: Mark a habit done on the Dashboard — point out how confetti triggers, the circular progress gauge updates, the streak increments, and newly achieved milestones unlock.
3. **Showcase Visual Calendar History**: Navigate through past months in the Calendar tab to demonstrate persistent daily logs and day-by-day habit breakdowns.
4. **Highlight Recharts Analytics**: Walk through the 30-day adherence area chart, the habit comparison horizontal bar chart, and category donut distribution.
5. **Show Behavioral Insights**: Explain how rule-based algorithms detect weekday vs weekend trends and surface actionable tips to the user.
6. **Toggle Dark / Light Themes**: Switch themes in Settings or the Navbar to show responsive Tailwind design system tokens.
