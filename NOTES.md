ইতিমধ্যে সম্পন্ন -
✅ MongoDB + Mongoose setup
✅ Better Auth email/password login
✅ Cookie-based sessions
✅ Role system: STUDENT, INSTRUCTOR, ADMIN
✅ requireAuth / requireRole middleware
✅ Course create, update, delete
✅ Course publish/reject status flow
✅ Public course list, filter, search, pagination
✅ Course details by slug
✅ Enrollment create
✅ Duplicate enrollment protection
✅ My courses
✅ My enrollments (যোগ করার পর)


src/
├── app/
│   ├── (public)/
│   │   ├── page.tsx
│   │   ├── courses/
│   │   │   ├── page.tsx
│   │   │   └── [courseId]/
│   │   │       └── page.tsx
│   │   ├── layout.tsx
│   │   └── ...
│   │
│   ├── (auth)/
│   │   ├── sign-in/
│   │   │   └── page.tsx
│   │   └── sign-up/
│   │       └── page.tsx
│   │
│   ├── (dashboard)/
│   │   ├── layout.tsx
│   │   │
│   │   └── dashboard/
│   │       ├── page.tsx
│   │       ├── student/
│   │       │   ├── page.tsx
│   │       │   ├── my-learning/
│   │       │   │   └── page.tsx
│   │       │   └── profile/
│   │       │       └── page.tsx
│   │       │
│   │       ├── instructor/
│   │       │   ├── page.tsx
│   │       │   ├── courses/
│   │       │   │   └── page.tsx
│   │       │   ├── courses/
│   │       │   │   └── create/
│   │       │   │       └── page.tsx
│   │       │   └── students/
│   │       │       └── page.tsx
│   │       │
│   │       └── admin/
│   │           ├── page.tsx
│   │           ├── users/
│   │           │   └── page.tsx
│   │           ├── courses/
│   │           │   └── page.tsx
│   │           └── analytics/
│   │               └── page.tsx
│   │
│   └── layout.tsx
│
├── components/
│   └── dashboard/
│       ├── DashboardShell.tsx
│       ├── DashboardSidebar.tsx
│       ├── DashboardHeader.tsx
│       └── RoleGuard.tsx
│
└── config/
    └── dashboard-menu.ts
