# 🌟 Radiant Autism & Skill Center — Comprehensive Technical Documentation

Welcome to the **Radiant Autism & Skill Center** web platform and Clinical Administration Portal. This document provides an exhaustive, end-to-end architectural guide for human developers and incoming AI coding assistants to understand, maintain, and expand this codebase without ambiguity.

---

## 📌 1. Project Overview & Clinical Domain

* **Organization:** Radiant Autism & Skill Center (Ontario, Canada)
* **Specialization:** Evidence-based pediatric behavioral therapies including Applied Behavior Analysis (ABA), Registered Behaviour Analyst (RBA) supervision, Speech & Language Pathology (SLP), Occupational Therapy (OT), Intensive Behavioral Intervention (IBI), and Ontario Autism Program (OAP) funding support.
* **Core Objectives:**
  1. **Public Clinical Portal:** High-converting, accessible public website with responsive pages for Home, About Us, Clinical Programs, Sensory Facility Gallery, Articles & Parent Guides, and Assessment Inquiries.
  2. **Admin Management Suite:** Secure, full-featured management portal (`/admin`) designed with a clean, high-performance UI (inspired by modern SaaS dashboards) allowing non-technical clinical directors to control all website content, hero sliders, team members, galleries, articles, and page visibility without touching code.

---

## 💻 2. Tech Stack & Engineering Specifications

| Layer | Technology | Details / Version |
| :--- | :--- | :--- |
| **Framework** | Next.js (App Router) | `v16.3.6` with Turbopack enabled |
| **Runtime / UI** | React | `v19.x` with Server & Client Component separation |
| **Language** | TypeScript | `v5.x` strict mode |
| **Styling** | Tailwind CSS | Radiant Blue (`#2563eb`), Sky, Indigo, Slate themes |
| **Icons** | Lucide React | Lightweight, consistent iconography |
| **ORM & Database** | Prisma ORM | MySQL (local port `3306`), connection via `.env` |
| **Authentication** | JWT + Cookie | Signed `radiant_admin_token` (HTTP-only) |
| **Rich Text** | Custom WYSIWYG | Clean HTML content generator without color artifacts |
| **Media Handling** | Multipart/form-data | File uploads to `public/uploads/` + direct URL support |

---

## 🔒 3. Git Repository & Remote Sync Protocol

> [!IMPORTANT]
> **Active Remote Target:** Strictly push to `origin` (`https://github.com/DhirajKumar29-DK/Radiant_Autism_2.git`) on branch `main`.
> **Legacy Repository:** An older repository named `Radiant_Autism` exists on GitHub — **DO NOT PUSH TO OR MODIFY** that legacy repository under any circumstances.

```bash
# Verify remote before pushing:
git remote -v
# Output must be:
# origin  https://github.com/DhirajKumar29-DK/Radiant_Autism_2.git (fetch)
# origin  https://github.com/DhirajKumar29-DK/Radiant_Autism_2.git (push)
```

---

## 🏗️ 4. Directory Structure & Key Files

```text
Radiant/
├── prisma/
│   ├── schema.prisma              # Complete MySQL Prisma schema
│   ├── seed.ts                    # Initial clinical database seed
│   └── migrations/                # Database migration logs
├── public/
│   ├── uploads/                   # Uploaded images from Admin Portal
│   ├── hero_*.jpg                 # Default clinical photography
│   └── manifest.webmanifest       # PWA metadata
├── src/
│   ├── app/
│   │   ├── (admin)/
│   │   │   └── admin/             # Authenticated Admin Management Portal
│   │   │       ├── layout.tsx     # Admin layout wrapper
│   │   │       ├── page.tsx       # Live KPI Dashboard
│   │   │       ├── blogs/         # Blog & Article management (FabFit layout)
│   │   │       ├── inquiries/     # Patient assessment inquiries
│   │   │       ├── hero/          # Multi-page rotating hero slides
│   │   │       ├── about/         # About clinic content & facility tabs
│   │   │       ├── team/          # Clinical leadership team CRUD
│   │   │       ├── gallery/       # Sensory & facility photo manager
│   │   │       ├── services/      # Clinical therapy programs CRUD
│   │   │       └── navigation/    # Header links & page visibility toggle
│   │   ├── (public)/              # Public client-facing routes
│   │   │   ├── page.tsx           # Homepage (Hero, About, Care, Services)
│   │   │   ├── about/page.tsx     # About Us (Protected by Visibility)
│   │   │   ├── services/page.tsx  # Therapy Catalog (Protected by Visibility)
│   │   │   ├── gallery/page.tsx   # Facility Gallery (Protected by Visibility)
│   │   │   ├── blogs/page.tsx     # Articles & Guides (Protected by Visibility)
│   │   │   └── contact/page.tsx   # Assessment Booking (Protected by Visibility)
│   │   ├── api/                   # REST API route handlers
│   │   │   ├── auth/              # Login, Logout, /me session validation
│   │   │   ├── admin/             # Protected CRUD endpoints for admin
│   │   │   └── contact/           # Public inquiry form submission
│   │   ├── layout.tsx             # Root layout with AppShell & JsonLd
│   │   └── not-found.tsx          # Full-screen immersive 404 hero page
│   ├── components/
│   │   ├── admin/
│   │   │   ├── ImageUploadField.tsx   # File upload + direct URL dual input
│   │   │   └── RichTextEditor.tsx     # Clean WYSIWYG editor without color bugs
│   │   ├── common/
│   │   │   ├── AdminPagination.tsx    # Universal pagination component
│   │   │   └── ConfirmModal.tsx       # Universal deletion confirmation modal
│   │   ├── layout/
│   │   │   ├── AdminLayout.tsx        # Sidebar navigation & session guarding
│   │   │   ├── AppShell.tsx           # Hides public Navbar/Footer in Admin/Login
│   │   │   ├── Navbar.tsx             # Public header with dynamic links
│   │   │   └── Footer.tsx             # Public footer
│   │   └── ...                        # Section components (Hero, About, Services)
│   └── lib/
│       ├── prisma.ts                  # Cached Prisma Client singleton
│       ├── page-visibility.ts         # Server-side visibility check & 404 guard
│       └── auth.ts                    # JWT token sign & verify utilities
```

---

## 🎨 5. Brand Identity & Visual System

* **Brand Colors:**
  * **Primary:** Radiant Blue (`bg-blue-600` / `#2563eb`), Blue Hover (`bg-blue-500` / `#3b82f6`)
  * **Secondary / Accents:** Sky (`#38bdf8`), Cyan (`#06b6d4`), Indigo (`#4f46e5`)
  * **Backgrounds:** Light theme `bg-slate-50` for public pages, Dark slate `bg-[#070b14]` / `bg-slate-950` for immersive full-screen screens (such as 404) and admin sidebar `bg-slate-950`.
* **Note on Gold/Yellow:** Early iterations copied amber/gold accents from an external fitness template (FabFit). **All amber/gold highlights have been replaced with Radiant Blue.** Do not introduce `#f59e0b` or yellow styling for primary buttons or sidebar navigation.

---

## 🚀 6. Admin Portal Features & Architecture (A to Z)

### 6.1 Authentication (`/login`, `/api/auth/*`)
* Route `/login` provides a clinical login screen.
* Passwords are hashed with `bcryptjs`.
* Successful login issues an HTTP-only JWT cookie (`radiant_admin_token`).
* `AdminLayout.tsx` calls `/api/auth/me` on mount. Unauthenticated requests are immediately redirected to `/login`.

### 6.2 Sidebar Navigation (`src/components/layout/AdminLayout.tsx`)
* **Single Direct Links:**
  * `Dashboard` &rarr; `/admin`
  * `Blogs` &rarr; `/admin/blogs`
  * `Appointments & Inquiries` &rarr; `/admin/inquiries`
  * `Hero Section` &rarr; `/admin/hero` (Active item styled with Radiant Blue)
  * `Facility Gallery` &rarr; `/admin/gallery` (Direct link, category pills are on-page)
  * `Clinical Programs` &rarr; `/admin/services` (Direct link, program add button is on-page)
  * `Navbar & Visibility` &rarr; `/admin/navigation`
* **Dropdown Accordion (DDL):**
  * **ONLY `About Section`** has sub-tabs:
    1. `Overview & Mission` (`/admin/about?tab=overview`)
    2. `Facility Tour & Spaces` (`/admin/about?tab=facility`)
    3. `Clinical Leadership & Team` (`/admin/team`)
    4. `Clinical Pillars & Care` (`/admin/about?tab=pillars`)
  * When navigating away from `/admin/about` or `/admin/team`, open submenus collapse automatically.

### 6.3 Hero Section Carousel Manager (`/admin/hero`)
* Supports multi-page hero sliders (`home`, `about`, `services`, `gallery`, `blogs`, `contact`).
* **Homepage Slider:** Supports unlimited slides rotating sequentially.
* **Add Slide Button:** Styled as Radiant Blue pill button: `+ ADD HERO SLIDE` (`bg-blue-600 hover:bg-blue-500 text-white rounded-full font-black text-xs uppercase`).
* **Modal Architecture:** 2-column layout that is bounded with `max-h-[88vh]` and an internal scrollbar, ensuring modal headers and action buttons are never cut off.
* Features bulk checkbox selection and multi-item deletion via `ConfirmModal`.

### 6.4 Blogs & Articles Manager (`/admin/blogs`)
* Styled following modern SaaS layouts with top search input (`Search by title or category...`) and category filter pills (`ALL`, `ABA Therapy`, `OAP Funding`, `Speech & Language`, `Occupational Therapy`, `Parent Guides`).
* Uses `RichTextEditor` for article bodies.
* Supports thumbnail upload via `ImageUploadField` (both drag-and-drop system file upload and direct URL).
* Card grid with responsive pagination (`AdminPagination`).

### 6.5 Facility Gallery Manager (`/admin/gallery`)
* Photo manager for clinic sensory spaces, therapy rooms, and gross-motor areas.
* On-page category filter pills (`ALL`, `Sensory Gym`, `Therapy Rooms`, `Group Play`, `Clinical Spaces`).
* Add/edit dialog with file upload or URL.

### 6.6 Clinical Programs Manager (`/admin/services`)
* Full CRUD for clinical offerings (ABA Therapy, Speech & Language Pathology, Occupational Therapy, Social Play Groups).
* Configurable fields: Program Title, URL Slug, Tagline, Card Badge Text, Badge Color Scheme, Display Order, Target Age Group, Session Format, Clinical Lead Supervisor, Short Summary, Detailed Clinical Overview, and Bullet Points.
* Toggle: `Publish to Live Website Catalog (Active)`.

### 6.7 UI & Navbar Visibility Controller (`/admin/navigation`)
* Controls which navigation items appear in the public header and which sections are displayed on the homepage.
* **Server-Side Enforcement (`src/lib/page-visibility.ts`):**
  * Reads `SiteNavigation.navItemsJson`.
  * If an admin deactivates a page (e.g. `/about`, `/services`, `/gallery`, `/blogs`, `/contact`), the server component calls Next.js `notFound()`.
  * This prevents users from accessing disabled pages even via direct URL entry or legacy links.

---

## 🌌 7. Immersive 404 Full-Page Screen (`src/app/not-found.tsx`)

* **Concept:** Instead of a small floating popup box, the 404 screen is a full-page cinematic experience matching modern high-end web portals.
* **Features:**
  * Fixed full viewport (`fixed inset-0 z-[100] min-h-screen w-screen bg-[#070b14] overflow-y-auto`) completely concealing public Navbar and Footer.
  * Deep dark background with technical coordinate grid overlay (`[background-size:4rem_4rem]`) and radial gradient mask.
  * Central ambient blue spotlight glow (`bg-blue-600/15 blur-[140px]`).
  * Center squircle icon with radar pulse animation and clinical heart icon.
  * Monolithic gradient **404** headline (`text-8xl sm:text-9xl md:text-[11rem] font-mono font-black text-transparent bg-clip-text bg-gradient-to-b from-white via-slate-200 to-slate-500`).
  * Sub-banner: `PAGE DEACTIVATED OR ARCHIVED`.
  * Action Buttons:
    1. `HOME BASE →` (Radiant Blue primary pill button)
    2. `PROGRAMS` (Bordered slate button with brain icon)
    3. `CONTACT US` (Bordered slate button with phone icon)

---

## 🧩 8. Reusable Shared Admin Components

| Component | Path | Description |
| :--- | :--- | :--- |
| `ConfirmModal` | `src/components/common/ConfirmModal.tsx` | Universal modal for edit/delete confirmations with warning badge, customizable title, message, and item count. |
| `AdminPagination` | `src/components/common/AdminPagination.tsx` | Universal pagination controls showing `Showing X to Y of Z results` with per-page dropdown and previous/next page pills. |
| `ImageUploadField` | `src/components/admin/ImageUploadField.tsx` | Dual-mode image selector: Drag-and-drop system file upload to `/api/admin/upload` PLUS manual URL/path input with live thumbnail preview. |
| `RichTextEditor` | `src/components/admin/RichTextEditor.tsx` | Clean WYSIWYG editor without broken HTML color/highlight artifacts, featuring headings, lists, bold, italics, quotes, and links. |

---

## 🗄️ 9. Database Schema (Prisma)

The Prisma schema (`prisma/schema.prisma`) uses MySQL and includes the following primary models:

* **`Admin`:** Administrator accounts (`id`, `email`, `passwordHash`, `name`, `role`).
* **`Appointment`:** Public inquiries & intake tickets (`id`, `ticketId`, `fullName`, `email`, `phone`, `service`, `preferredDate`, `status`, `notes`).
* **`Service`:** Clinical programs (`id`, `slug`, `title`, `tagline`, `badge`, `image`, `shortDescription`, `overviewParagraphs`, `ageGroup`, `sessionFormat`, `clinicalLead`, `features`, `isActive`, `order`).
* **`Hero`:** Rotating hero slides across pages (`id`, `pageKey`, `title`, `subtitle`, `description`, `primaryButtonText`, `primaryButtonLink`, `backgroundImage`, `status`, `displayOrder`).
* **`AboutSection`:** About clinic content (`id`, `badgeText`, `title`, `description1`, `description2`, `centerImage`, `highlightsJson`, `facilityHeading`, `facilityDesc`, `facilityImage`).
* **`TeamMember`:** Clinical team staff (`id`, `name`, `role`, `badge`, `image`, `bio`, `order`, `isActive`).
* **`GalleryItem`:** Facility photos (`id`, `title`, `category`, `image`, `tag`, `isFeatured`, `order`, `isActive`).
* **`BlogPost`:** Clinical articles (`id`, `title`, `slug`, `excerpt`, `content`, `coverImage`, `category`, `authorName`, `status`, `views`).
* **`SiteNavigation`:** Navbar links and homepage section visibility configuration (`id`, `navItemsJson`, `sectionsVisibilityJson`).

---

## 🛠️ 10. Development & Deployment Guide

### Prerequisites
* Node.js `v18.18+` or `v20+`
* MySQL database running locally or hosted (e.g. MySQL port `3306`)

### Environment Variables (`.env`)
```env
DATABASE_URL="mysql://root:password@localhost:3306/radiant_autism"
JWT_SECRET="radiant-clinical-secret-key-change-in-production"
NEXT_PUBLIC_SITE_URL="http://localhost:3000"
```

### Installation & Execution
```bash
# 1. Install dependencies
npm install

# 2. Push Prisma database schema to MySQL
npx prisma db push

# 3. Seed initial clinical data (optional)
npx prisma db seed

# 4. Run local development server
npm run dev

# 5. Build for production (Turbopack)
npm run build

# 6. Start production server
npm start
```

---

## 📋 11. Checklist for Future Developers / AI Assistants

1. **Always verify the Git remote before pushing:** Ensure remote is `https://github.com/DhirajKumar29-DK/Radiant_Autism_2.git`. Never touch the older `Radiant_Autism` repo.
2. **Theme Consistency:** The brand color is strictly **Radiant Blue (`#2563eb`)**. Do NOT use amber/gold (`#f59e0b`) for buttons or active sidebar indicators.
3. **Sidebar Accordion Rule:** Only `About Section` has sub-items/children in the sidebar. All other items (`Dashboard`, `Blogs`, `Appointments`, `Hero Section`, `Facility Gallery`, `Clinical Programs`, `Navbar & Visibility`) must remain single direct links.
4. **404 Handling:** When a route is marked inactive in `/admin/navigation`, it must trigger `notFound()` via `src/lib/page-visibility.ts`. The 404 page is an immersive full-screen hero layout without floating card popups.
5. **Always test production builds:** Run `npm run build` before pushing any code to guarantee 0 TypeScript/Turbopack errors.
