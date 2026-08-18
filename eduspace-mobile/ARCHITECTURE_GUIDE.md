# Eduspace Mobile App – Full Architecture Guide

This document explains the mobile app in a very detailed, step-by-step way so you can redesign the UI with a clear understanding of how the Eduspace system works.

---

1. What this app is

Eduspace Mobile is a React Native + Expo application for a college ecosystem. It acts as a mobile portal for students, faculty, college admins, and IT admins.

The app is not just a UI shell. It is a workflow-driven system that:
- authenticates users,
- loads a user profile and role,
- connects to backend APIs,
- displays academic, attendance, notice, and admin-related features,
- supports role-based navigation,
- stores session/auth state locally on the device,
- and optionally uses biometrics and push notifications.

The design is built around the idea that every feature is a combination of:
- a screen route,
- a data fetch from the backend,
- local state in the screen,
- navigation to related screens,
- and a visual component layer.

---

2. High-level architecture

The app is structured in layers:

2.1 App shell layer
This is the top-level structure controlled by Expo Router.

Main files:
- app/_layout.tsx
- app/(app)/_layout.tsx

Responsibilities:
- define the route tree,
- wrap the app with providers,
- show the root stack navigation,
- decide which app section is visible.

2.2 Providers and shared context
The app uses context providers to share app-wide concern.

Main files:
- contexts/ThemeContext.tsx
- contexts/ErrorPopupContext.tsx

Responsibilities:
- theme state and dark/light mode,
- popup/error handling,
- shared styling tokens.

2.3 Core services and utilities
Main files:
- lib/api.ts
- lib/storage.ts
- lib/constants.ts
- lib/theme.ts
- lib/notifications.ts

Responsibilities:
- call backend APIs,
- attach authentication headers,
- store session token securely,
- manage biometric settings,
- define the app theme palette,
- handle push notification setup.

2.4 Hooks
Main file:
- hooks/useSession.ts

Responsibilities:
- handle session validation,
- fetch the user profile,
- fetch menu items,
- login/logout logic,
- biometrics support.

2.5 Screen layer
The app screens live under app/.

Each screen usually:
- fetches data from an API,
- stores it in local state,
- renders UI using reusable UI components,
- and helps the user perform an action.

2.6 UI component layer
The components folder is a design-system-like layer.

Main purpose:
- keep screens smaller,
- centralize repeated visual pieces,
- make UI easier to change.

Examples:
- cards,
- headers,
- rows,
- buttons,
- modals,
- form elements,
- navigation bars.

---

3. Routing architecture

This app uses Expo Router file-based routing.

3.1 Root routes
- app/index.tsx
  - This is the role gateway.
  - It checks session validity and redirects the user to the correct home role page.

- app/college-selection.tsx
  - This is the first screen where the user selects their college.
  - This choice is used during login/signup.

- app/(auth)/login.tsx
  - Handles sign in and sign up.
  - Also handles role selection and email verification.

- app/(app)
  - This is the main authenticated app area.

3.2 Auth route group
The auth pages are in app/(auth)/.

They include:
- login.tsx
- it-login.tsx

3.3 Main app route group
The authenticated experience is inside app/(app)/.

Screens include:
- dashboard.tsx
- notice-board.tsx
- profile.tsx
- attendance.tsx
- my-classes.tsx
- timetable.tsx
- library.tsx
- ai-chat.tsx
- results.tsx
- academic-calendar.tsx
- fees.tsx
- leave.tsx
- feedback.tsx
- payment-details.tsx
- coe/*
- faculty/*
- admin/*
- it-admin/*
- classroom/[id].tsx
- manage-users/*
- manage-departments/*
- exam-management/*
- content/[classId]/[contentId].tsx

This folder structure means the app supports multiple role-specific experiences under the same core shell.

---

4. Startup and app flow

4.1 What happens when the app opens
Step 1:
- The app loads the root layout.
- The providers are mounted.
- The theme and error popup environment become available.

Step 2:
- The app enters app/index.tsx.
- This file checks if the user already has a valid session.

Step 3:
- If no valid session exists, the app redirects to the college selection flow.
- If a session exists, the app determines the role and redirects to the correct dashboard.

4.2 Role-based redirect logic
The router uses the profile role to decide the landing screen:
- faculty -> /(app)/faculty
- college_admin -> /(app)/admin
- any other user -> /(app)/dashboard

This means the app has a role gateway before the actual homepage.

---

5. Authentication and session architecture

5.1 Login flow
A user starts from the college-selection screen.

Then:
1. They choose a college.
2. They are sent to the login page using the college code in the URL.
3. On login, the app sends credentials to the backend.
4. The backend returns a session token.
5. The mobile app saves the token securely in device storage.
6. The session is validated using /session/info.
7. The menu items are fetched from /session/menu.
8. The app redirects to the correct dashboard depending on role.

5.2 Why the token is stored securely
The app uses SecureStore through the storage helpers.

That means sensitive data like the session token is not stored in normal async storage or plaintext.

5.3 Session validation logic
The hook useSession validates the current session by calling the backend endpoint /session/info.

If validation fails, the session is treated as invalid.

Then:
- the token is removed,
- the user is logged out locally,
- the app sends the user back to college selection.

5.4 Biometrics
The app also supports biometric login.

How it works:
- The user can enable biometrics in the profile or login flow.
- The app stores a flag in secure storage.
- When the user taps biometric sign-in, the app uses expo-local-authentication.
- If successful, it validates the saved session and enters the app.

This is an enhancement for convenience and speed.

---

6. College selection flow

This is the first real user interaction in the app.

6.1 What the user does
- Opens the app.
- Sees a list of colleges.
- Searches for a specific college.
- Selects a college.

6.2 What happens in code
- The screen fetches colleges from /api/auth/public/colleges.
- It displays them in a searchable list.
- When the user taps a college, the app stores the college code locally.
- It navigates to the login page with the college code in the route parameters.

6.3 Why this matters in UI redesign
This screen is one of the most important onboarding boundaries. If you redesign the UI, you need to preserve:
- search,
- college selection,
- route parameter passing,
- and backend college data loading.

---

7. Login and signup flow

The login page is a highly important screen because it handles both authentication and first-time registration.

7.1 Login mode
In login mode the user:
- enters email and password,
- chooses a role,
- submits to the backend,
- receives a session token,
- and enters the app.

7.2 Signup mode
In signup mode the user goes through a multi-step registration process:
- Step 1: basic account info (name, email, password, role)
- Step 2: role-specific profile form
  - student: phone, gender, course, roll number
  - faculty: department, designation, employee ID
  - admin: admin level, responsibilities, employee ID
- Step 3: email verification code
- Step 4: success screen

7.3 Backend endpoints involved
- /api/auth/send-verification
- /api/auth/verify-email
- /api/auth/role-signup
- /api/auth/signin

7.4 Important UX behavior
- The app shows validation errors inline.
- It uses a verification timer for email OTP.
- It can show a biometric setup modal after login.
- It can redirect the user directly to the dashboard after login.

7.5 UI redesign implications
If you are changing the UI, this screen needs careful planning because it contains:
- multi-step flow,
- role-based variants,
- validation messages,
- OTP input,
- and transition states.

---

8. Student experience architecture

8.1 Student home dashboard
The student dashboard is the main landing page for regular students.

Its responsibilities:
- show greeting and profile context,
- display attendance summary,
- show quick modules,
- show a learning card,
- display latest notices,
- allow theme switching,
- allow sign out,
- optionally offer biometric setup.

Data sources:
- notices from /api/notices/staff
- classroom/course list from /api/classrooms

The screen uses a local state to hold notices and classes.

8.2 Quick modules on dashboard
The dashboard is highly action-oriented. Each module navigates to another feature with router.push.

Examples:
- My Courses -> my-classes
- Library -> library
- Attendance -> attendance
- Notices -> notice-board
- Calendar -> academic-calendar
- Timetable -> timetable
- Admit Card -> coe/admit-card
- University -> results

8.3 My Courses screen
This screen shows the classroom list for the current student.

Flow:
- fetch classes from /api/classrooms
- show cards for each course
- let the user open a course/classroom

The screen performs no complex business logic; it mostly acts as a list and navigation hub.

8.4 Attendance screen
This screen shows attendance records and a summary.

Flow:
- fetch from /api/attendance/my-records
- show overall percentage and counts
- allow the user to filter by month
- list each attendance record

This is a read-only screen from the student’s perspective.

8.5 Timetable screen
The timetable is more complex because it needs to resolve the student’s batch first.

Flow:
1. fetch all batches from /api/batches
2. find the batch that includes the current student ID
3. fetch routine data for that batch from /api/routine/batch/:batchId
4. flatten the periods for the selected day
5. render the timetable entries

This means the screen depends on both batch membership and routine data.

8.6 Library screen
This screen shows digital resources such as notes, e-books, papers, and videos.

Flow:
- fetch resources from /api/library/digital
- categorize by type
- show cards with icon and download action
- tapping download opens the document URL

8.7 Notice board screen
This screen shows campus notices.

Flow:
- fetch notices from /api/notices/staff
- support filtering by category
- render notice cards

8.8 AI chat screen
This screen is a conversational assistant.

Flow:
- user types a message,
- message is appended locally,
- the app sends the message to /api/ai/chat,
- the backend returns a response,
- the response is shown in chat bubbles.

The screen supports chat modes:
- standard,
- tutor,
- mindmap

8.9 Results screen
This screen shows exam results.

Flow:
- fetch /api/coe/my-results
- compute summary metrics like average score, passed, failed
- show each exam record

8.10 Profile screen
Profile acts as the settings and account hub.

Flow:
- reads session profile data,
- loads course count,
- allows toggling biometrics,
- allows dark mode toggle,
- supports sign out,
- links to notice board and library.

---

9. Faculty experience architecture

9.1 Faculty home dashboard
The faculty home screen focuses on teaching operations.

Responsibilities:
- show the faculty name and date,
- load assigned batches,
- load schedule for today,
- show quick actions for classes, attendance, notices, and AI.

Data sources:
- /api/batches/my-batches
- /api/routine/batch/:id

9.2 Faculty classes screen
This lets faculty see their assigned batches and related classes.

It acts as a management view for the teaching schedule.

9.3 Faculty attendance screen
This is one of the most critical faculty screens.

Flow:
1. load batches assigned to the faculty,
2. select a batch,
3. fetch students in that batch from /api/attendance/faculty/init,
4. present students in a row-based UI,
5. faculty marks present/absent,
6. submit records to /api/attendance/mark.

This screen is highly operational. It is not just display; it changes data.

That means if you redesign the UI, you must preserve:
- the batch selection logic,
- the student list,
- the mark/unmark state,
- and the submission flow.

---

10. Admin experience architecture

10.1 Admin home dashboard
The admin dashboard is built around administration and oversight.

Responsibilities:
- show pending requests,
- count student and faculty users,
- provide quick navigation to approvals, users, notices, and AI.

Data sources:
- /api/college-admin/requests
- /api/college-admin/users/student
- /api/college-admin/users/faculty

10.2 Admin approvals flow
The admin is expected to review pending requests and approve or reject them.

The mobile app has the UI scaffolding for this, but the approval/rejection actions appear to be partially wired or placeholder-based in current implementation.

This is important because it tells you that some administrative workflows are present structurally but may not be fully complete.

---

11. IT admin experience architecture

The IT admin experience is meant for platform-level operations.

Responsibilities:
- view tenant/college counts,
- view number of IT users,
- review onboarding requests,
- navigate to server/tenant management screens,
- access audit and access management flows.

Data sources:
- /it-admin/tenants-list
- /it-admin/users
- /it-admin/college-requests

This role is more like operations and system administration than student learning.

---

12. Classroom and content architecture

The app has a classroom area and content detail pages.

12.1 Classroom screen
The classroom route is dynamic, e.g. /classroom/[id].tsx.

This means each course/classroom is loaded based on a classroom ID.

Likely responsibilities:
- show content for a class,
- allow navigation into class materials.

12.2 Content detail screen
The content detail route is dynamic as well, e.g. /content/[classId]/[contentId].tsx.

This suggests the app supports individual resources or learning content within a classroom.

For UI redesign, this part matters because it is a deeper learning experience, not just a dashboard.

---

13. Shared UI architecture

The UI layer in components/ui is built like a reusable design system.

Examples:
- Screen: wrapper for page layout
- GHeader: page header
- SubHeader: compact header
- BottomNav: bottom navigation bar
- QuickGrid: quick actions grid
- CourseCard: course display card
- NoticeCard: notice card
- StatGrid: summary statistics grid
- RecRow: row-style item list
- FilterChips: tab-like filter control
- EmptyState: empty/no-data state
- GradButton: branded button

This is important because if you want to redesign the whole UI, you may not need to rewrite all screens from scratch. You can update the shared components and the app will look more consistent.

---

14. Theme architecture

The app uses a central theme object rather than hardcoded colors everywhere.

The theme supports:
- light mode,
- dark mode,
- background and surface colors,
- muted and foreground colors,
- brand gradients,
- borders,
- shadows,
- and semantic colors like blue, violet, red, amber, green.

This is a very good architecture for redesigning the UI because most screens reference theme tokens.

If you change the design system, the easiest path is to update the theme tokens first.

---

15. Data flow pattern

Most screens follow the same pattern:

1. The screen mounts.
2. It calls a backend endpoint.
3. It stores the response in local state.
4. It renders the UI from that state.
5. User actions trigger another request or navigation.

This pattern is visible across:
- dashboard,
- attendance,
- results,
- notices,
- library,
- timetable,
- student courses.

---

16. State management pattern

The app uses local component state heavily.

It does not rely on a big global state library like Redux.

Instead, it uses:
- React useState,
- useEffect,
- useCallback,
- and custom hooks.

This means:
- state is easy to follow,
- each screen owns its own data lifecycle,
- and UI redesign stays manageable.

---

17. Where notifications happen

17.1 Local notifications
The app has a notifications helper that uses Expo Notifications.

It can:
- ask for permissions,
- create notification channels on Android,
- schedule alerts.

17.2 User-facing notification-like content
The app also uses notice boards and dashboard cards as a form of “announcement” experience.

So there are two types of notification flow:
- actual OS push/local notifications,
- in-app notice system.

17.3 Where warnings or notices go
A notice created in the system is expected to travel to:
- the notice board screen,
- the dashboard notice section,
- and possibly the user’s notification experience depending on backend integration.

If a change is made to the UI, you should keep these destinations in mind because the information flow is a core part of the product.

---

18. Where information goes when something happens

Here is the practical path of important events.

18.1 When a user logs in
Flow:
- credentials are sent to backend,
- session token is stored locally,
- session is validated,
- profile is loaded,
- role-based navigation occurs,
- dashboard appears.

Effect:
- user gets access to role-specific screens.

18.2 When a student views attendance
Flow:
- screen requests backend attendance records,
- screen displays them.

Effect:
- the student sees daily attendance status.

18.3 When a faculty marks attendance
Flow:
- faculty selects a batch,
- marks student statuses,
- submits data to backend,
- backend receives the attendance record.

Effect:
- the attendance record becomes part of the system and is visible later in student views.

18.4 When a notice is posted
Flow:
- notice data is fetched by the notice board screen,
- it appears in the notice list,
- it may also be visible on the dashboard.

Effect:
- users get institutional communication.

18.5 When a student opens a course/classroom
Flow:
- the classroom ID is used in the route,
- the screen loads content for that class.

Effect:
- the student enters the learning experience for that course.

18.6 When the user signs out
Flow:
- session token is cleared,
- secure storage values are removed,
- the app redirects to college selection.

Effect:
- the user loses access to authenticated routes until they sign in again.

---

19. How the UI is likely to be redesigned safely

If you want to change the whole UI, the best approach is:

Step 1:
- understand the real screens and their purpose.

Step 2:
- redesign the shared components first.

Step 3:
- update the theme tokens.

Step 4:
- apply the new visual style to the screens without changing business logic.

Step 5:
- keep routes and data flows intact while changing the look.

This is the safest method because the app architecture is already fairly modular.

---

20. Recommended design-change strategy

20.1 Highest impact shared components to change first
- Screen
- GHeader
- SubHeader
- BottomNav
- QuickGrid
- CourseCard
- NoticeCard
- RecRow
- StatGrid
- GradButton
- HeroCard
- ListCard

20.2 High-value screens to rework visually
- dashboard.tsx
- login.tsx
- profile.tsx
- notice-board.tsx
- attendance.tsx
- my-classes.tsx
- faculty/index.tsx
- admin/index.tsx

20.3 Keep these logic flows unchanged
- auth route flow
- role-based redirect flow
- session loading flow
- API call patterns
- navigation patterns

---

21. Important implementation notes for your redesign

- The app already has a theme system, so use it rather than hardcoding colors in new screens.
- The shared components are the easiest place to create a consistent redesign.
- The backend integration is mostly straightforward; the app is mostly UI + data display + navigation.
- Role-specific screens are the most important to preserve structurally because they are the app’s core value.
- The app is currently more “product UI” than “enterprise admin dashboard”; if you redesign it, make sure the core user tasks remain obvious.

---

22. Summary

The NoteLoom mobile app can be understood as a role-based educational mobile portal with:
- onboarding,
- authentication,
- secure session handling,
- dashboard navigation,
- academic features (attendance, timetable, results, library, notices),
- faculty workflows,
- admin workflows,
- and IT admin operations.

Every feature works through the same pattern:
- fetch data,
- render state,
- let the user act,
- navigate to another screen,
- and optionally save changes to the backend.

That is the core architecture you need to keep in mind while redesigning the UI.
