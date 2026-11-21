# TimetableGen - University Timetable Management System

An automated academic scheduling platform built with Next.js, TypeScript, TailwindCSS, Prisma, and Firebase Authentication.

---

## 📄 IEEE Conference Publication

An IEEE Conference paper was published on this project:
- **Publication:** [IEEE Xplore Publication - Document 11744894](https://ieeexplore.ieee.org/abstract/document/11744894)
- **Paper Link:** https://ieeexplore.ieee.org/abstract/document/11744894

---

## 🚀 Live Demo & Sample Credentials

When evaluating or previewing the deployed app, you can either **register a new account** on `/register` or use the pre-configured sample credentials below directly on the **Sign In** page (`/login`):

| Role | Email ID | Password | Access Level |
| :--- | :--- | :--- | :--- |
| **Principal / Admin** | `admin@college.edu` | `admin123` | Full Access: Generate timetables, manage all faculty, rooms & sections |
| **Head of Dept (CSE)** | `hod@college.edu` | `admin123` | Department Admin: Manage CSE faculty, sections & view timetables |
| **Faculty Member** | `faculty@college.edu` | `admin123` | Schedule View: View departmental schedules and teaching workloads |

> 💡 **Tip:** The login page features a **1-Click Auto-Fill** card and password visibility toggle (`Show`/`Hide`) for instant testing!

---

## 🛠️ Features

- **Backtracking CSP Scheduler:** Constraint-Satisfaction Problem engine for conflict-free timetable generation.
- **Role-Based Access Control:** Separate workflows for Principal, HODs, and Faculty.
- **Interactive UI:** Glassmorphism styling with real-time feedback and responsive tables.
- **Account Registration:** Register new accounts with specific roles and departments on `/register`.
- **Excel Ingestion & Export:** Upload faculty/course matrices and export completed schedules.

---

## 🌐 Deploy to Vercel

1. Push this repository to GitHub.
2. Go to [Vercel](https://vercel.com) and click **"Add New Project"** -> **"Import"** this GitHub repository (`Mini-Project`).
3. In **Settings -> Environment Variables**, add the variables from `.env.example`:
   - `NEXT_PUBLIC_FIREBASE_API_KEY`
   - `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN`
   - `NEXT_PUBLIC_FIREBASE_PROJECT_ID`
   - `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET`
   - `NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID`
   - `NEXT_PUBLIC_FIREBASE_APP_ID`
   - `NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID`
4. Click **Deploy**. Vercel will build and deploy the Next.js application automatically!

---

## 💻 Local Development

```bash
# 1. Install dependencies
npm install

# 2. Run Prisma client generation
npx prisma generate

# 3. Start the development server
npm run dev
```

Open [http://localhost:3005](http://localhost:3005) (or [http://localhost:3000](http://localhost:3000)) to explore the app.
