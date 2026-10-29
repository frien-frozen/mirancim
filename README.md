# Miran LMS — Specialized MVP for Private Tutors

A high-performance Learning Management System built for private tutors and administrators with a minimalist, high-end dark aesthetic inspired by [Base44](https://base44.com).

## Tech Stack
- **Framework:** Next.js 16 (App Router) + TypeScript
- **Styling:** Tailwind CSS v4 + Base UI (Shadcn UI architecture)
- **Database ORM:** Prisma ORM 6
- **Database:** PostgreSQL
- **Authentication:** Custom JWT-based cookie session with bcrypt password hashing
- **Icons:** Lucide React

---

## Getting Started

### 1. Database Configuration
Ensure your PostgreSQL instance is running. Update your database connection string in `.env`:

```env
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/miran"
JWT_SECRET="miran-lms-secret-key-change-in-production"
```

### 2. Push Schema & Seed Initial Data
Run the Prisma schema sync and database seeder:

```bash
# Push schema to PostgreSQL
npm run db:push

# Seed default admin & teacher accounts, sample groups and students
npm run db:seed
```

### 3. Default Credentials
| Role | Username | Password | Access Level |
|---|---|---|---|
| **Admin** | `admin` | `admin123` | Full access (Dashboard, Groups, Students, Attendance, Payments) |
| **Teacher** | `teacher` | `teacher123` | Attendance and Group viewing only |

### 4. Development Server
Start the Next.js development server:

```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## Implemented Modules & Features

1. **Authentication & Role-Based Access Control (RBAC):**
   - JWT sessions stored in HTTP-only cookies.
   - Dedicated login page at `/login` with clean validation and error alerts.
   - Dynamic sidebar navigation filtering based on role (`ADMIN` vs `TEACHER`).
   - Server Actions guarded with `requireAuth()` and `requireAdmin()`.

2. **Dashboard Overview (`/dashboard`):**
   - 4 High-level metric cards:
     - **Active Students** with total group count.
     - **Expected Monthly Revenue**.
     - **Collected Revenue** with paid student count.
     - **Unpaid Students** count.
   - Visual progress bar showing collection rate percentage.

3. **Groups Module (`/groups`):**
   - Full CRUD for student groups with confirmation dialogs.
   - Displays real-time student counts per group.
   - Teachers have read-only view; Admins have full management capabilities.

4. **Students Module (`/students`):**
   - Full CRUD for students (Full Name, Phone Number, Parent Phone, Monthly Tuition Fee, Group).
   - Fast filtering by search query (name/phone) and Group dropdown filter.
   - Form modals with validation and clean dark UI.

5. **Attendance (Davomat) Module (`/attendance`):**
   - Group selector and Date picker.
   - Summary badges showing Present, Absent, and Unmarked counters.
   - One-click instant toggle button per student (Present / Absent) with real-time UI feedback.

6. **Finance & Payments Module (`/payments`):**
   - Month picker to navigate any billing cycle.
   - Metrics bar showing Collected vs. Outstanding tuition fees.
   - Quick filters (`All`, `Paid`, `Unpaid`) and search.
   - "Confirm Payment" and "Undo" actions per student with instant state updates.
