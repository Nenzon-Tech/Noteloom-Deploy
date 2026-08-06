# 🎓 NoteLoom v2.2.5 — Android APK

The NoteLoom mobile companion app for students, faculty, college admins, and IT admins — now fully optimized for tablets and large screens.

---

## 🆕 What's new in v2.2.5

- **Tablet & large-screen optimization** across the entire app — cards, grids, lists, and forms now scale correctly on tablets instead of stretching or overflowing
- **Adaptive quick-access grid** — dashboard shortcut tiles now compute their size from the actual screen/container width, so they stay evenly spaced on phones *and* tablets
- **Overflow-proof cards** — course, notice, list, balance, and stat cards use smart wrapping + truncation (flexWrap / flexShrink / minWidth), so long labels no longer break the layout on wide screens
- **Tighter attendance & approval rows** — avatars and action buttons stay fixed while text truncates cleanly
- **Bottom navigation polish** — tab labels widened and wrap-friendly for bigger displays
- **AI assistant screen fixes** — corrected header subtitle layout, input-bar spacing, and close-button alignment
- **Login / registration improvements** — role selection cells constrained to fit wide screens, extra bottom padding so nothing hides behind the keyboard
- **Screen container polish** — more bottom padding for comfortable thumb reach
- Bumped version to **2.2.5** (versionCode 5)

---

## ✨ App features

### 🔐 Access & Authentication
- College code + email OTP registration, sign-in, and **IT Admin login**
- Secure session storage (biometric / face-ID unlock supported)

### 👨‍🎓 Student
- Personal dashboard, academic calendar, and timetable
- Attendance tracker and **apply for leave**
- Exam (COE) portal: eligibility check, **exam form submission**, and QR **admit card**
- Results & marks, fee details, and **payment history**
- **Digital library**: browse books, request resources, download digital links
- **Notice board** and feedback forms
- **AI study assistant** (Socratic chat) + **AI PDF summarizer** for uploaded documents
- Lecture modules with **video streaming**, content completion tracking, and downloads

### 👩‍🏫 Faculty
- Manage **my classes** and classroom rosters
- Upload / view course modules and lecture content
- **Mark attendance**, schedule, and leave management

### 🏫 College Admin
- Manage departments, users (activate/deactivate), and exam management
- Notices and library approvals

### 🖥️ IT / System Admin
- Dedicated **IT admin portal** with protected routes and menu configuration

---

## 📦 About this build

- **File:** `NoteLoom-v2.2.5.apk`
- **Package:** `com.nenzontech.noteloom`
- **Version:** 2.2.5 (versionCode 5)
- **Targets Android** devices; install by enabling "Install unknown apps"
- Backend: NoteLoom hosted API

> ⚠️ This is an internal/beta build signed with a debug key — safe for sideloading and testing.
