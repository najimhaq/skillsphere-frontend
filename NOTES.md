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


Student browse course
→ Course details দেখে
→ Enroll করে
→ My Learning-এ course দেখে
→ Lesson open করে
→ Video / article পড়ে
→ Progress track করে


Recommended order
আমি এই sequence-এ কাজ করার পরামর্শ দিচ্ছি:

Admin Dashboard Overview API + UI
Real stats: total users, students, instructors, courses, pending-review courses, published courses, total enrollments।

Pending Course Review Queue
Admin শুধু PENDING_REVIEW course দেখবে; course details, sections, lessons এবং preview content দেখতে পারবে।

Course moderation actions

Publish

Reject

Request changes

Admin feedback/note

এখানে course model-এ reviewNote, reviewedBy, reviewedAt যোগ করব। Rejection-এর কারণ Instructor দেখবে, edit করে পুনরায় submit করতে পারবে।

User management

Search/filter users

Account status: ACTIVE, SUSPENDED

Suspend/reactivate

Role change শুধুই carefully controlled action হিসেবে রাখব

Audit logging
Publish/reject/suspend/role-change সব action আলাদা AuditLog collection-এ রাখব।

