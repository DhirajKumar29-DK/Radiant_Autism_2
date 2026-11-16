# 🌟 Radiant Autism & Skill Center — Technical Architecture Documentation

Welcome to the **Radiant Autism & Skill Center** web platform and Clinical Administration Portal. This document provides an exhaustive, production-grade architectural and technical reference for engineering teams to maintain, configure, and scale the application.

---

## 📌 1. Project Overview & Clinical Domain

* **Organization:** Radiant Autism & Skill Center (Ontario, Canada)
* **Specialization:** Evidence-based pediatric behavioral therapies including Applied Behavior Analysis (ABA), Registered Behaviour Analyst (RBA) supervision, Speech & Language Pathology (SLP), Occupational Therapy (OT), Intensive Behavioral Intervention (IBI), and Ontario Autism Program (OAP) funding support.
* **Core Objectives:**
  1. **Public Clinical Portal:** Accessible, high-converting public web application with dedicated pages for Clinic Overview, Therapy Offerings, Sensory Facility Showcase, Articles & Parent Guides, and Intake Assessment Bookings.
  2. **Admin Management Suite:** Secure management portal (`/admin`) designed with a high-performance administrative interface allowing clinical directors to manage website content, hero sliders, staff directories, facility galleries, clinical articles, and live page routing without code changes.

---

## 💻 2. Technology Stack & Runtime Specifications

| Layer | Technology | Details / Version |
| :--- | :--- | :--- |
| **Framework** | Next.js (App Router) | `v16.3.6` with Turbopack compilation |
| **Runtime / UI** | React | `v19.x` with Server & Client Component architecture |
| **Language** | TypeScript | `v5.x` strict type-checking |
| **Styling** | Tailwind CSS | Radiant Blue (`#2563eb`), Sky, Indigo, Slate themes |
| **Icons** | Lucide React | Modern, accessible SVG icon library |
| **ORM & Database** | Prisma ORM | MySQL (local/production port `3306`), connection via `.env` |
| **Authentication** | JWT + Cookie | Signed `radiant_admin_token` (HTTP-only) |
| **Rich Text** | Custom WYSIWYG | Clean HTML content generator without inline color artifacts |
| **Media Handling** | Multipart/form-data | File uploads to `public/uploads/` + direct external URL support |

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
│   │   │       ├── blogs/         # Blog & Article management (search, category filters, pagination)
│   │   │       ├── inquiries/     # Patient assessment inquiries
│   │   │       ├── hero/          # Multi-page rotating hero slides
│   │   │       ├── about/         # About clinic content & facility tabs
│   │   │       ├── team/          # Clinical leadership team CRUD
│   │   │       ├── gallery/       # Sensory & facility photo manager
│   │   │       ├── services/      # Clinical therapy programs CRUD
│   │   │       └── navigation/    # Header links & page visibility toggle
│   │   ├── (public)/              # Public client-facing routes
│   │   │   ├── page.tsx           # Homepage (Hero, About, Care, Services)
│   │   │   ├── about/page.tsx     # About Us (Protected by Visibility Guard)
│   │   │   ├── services/page.tsx  # Therapy Catalog (Protected by Visibility Guard)
│   │   │   ├── gallery/page.tsx   # Facility Gallery (Protected by Visibility Guard)
│   │   │   ├── blogs/page.tsx     # Articles & Guides (Protected by Visibility Guard)
│   │   │   └── contact/page.tsx   # Assessment Booking (Protected by Visibility Guard)
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

## 🎨 5. Brand Identity & Visual Design System

* **Primary Palette:**
  * **Brand Primary:** Radiant Blue (`bg-blue-600` / `#2563eb`), Blue Hover (`bg-blue-500` / `#3b82f6`)
  * **Accents & Gradients:** Sky (`#38bdf8`), Cyan (`#06b6d4`), Indigo (`#4f46e5`)
  * **Background Surfaces:** Light theme `bg-slate-50` for public portals, Dark slate `bg-[#070b14]` / `bg-slate-950` for immersive full-screen states (such as 404) and admin navigation `bg-slate-950`.
* **Design Standards:**
  * Action buttons, active navigation states, and highlights strictly follow the Radiant Blue color palette.
  * Amber or yellow tints (`#f59e0b`) are strictly reserved for warning badges and must not be used for primary UI controls.

---

## 🚀 6. Admin Portal Features & Architecture (A to Z)

### 6.1 Authentication (`/login`, `/api/auth/*`)
* Route `/login` provides a dedicated clinical administrator login interface.
* Passwords are encrypted using `bcryptjs` with 10 salt rounds.
* Successful authentication signs an HTTP-only JWT cookie (`radiant_admin_token`).
* `AdminLayout.tsx` enforces session validation via `/api/auth/me` on mount. Unauthenticated requests redirect to `/login`.

### 6.2 Sidebar Navigation (`src/components/layout/AdminLayout.tsx`)
* **Single Direct Links:**
  * `Dashboard` &rarr; `/admin`
  * `Blogs` &rarr; `/admin/blogs`
  * `Appointments & Inquiries` &rarr; `/admin/inquiries`
  * `Hero Section` &rarr; `/admin/hero` (Active state rendered in Radiant Blue)
  * `Facility Gallery` &rarr; `/admin/gallery` (Direct link, category filters are managed on-page)
  * `Clinical Programs` &rarr; `/admin/services` (Direct link, program creation button is on-page)
  * `Navbar & Visibility` &rarr; `/admin/navigation`
* **Dropdown Accordion:**
  * **ONLY `About Section`** features an expandable submenu:
    1. `Overview & Mission` (`/admin/about?tab=overview`)
    2. `Facility Tour & Spaces` (`/admin/about?tab=facility`)
    3. `Clinical Leadership & Team` (`/admin/team`)
    4. `Clinical Pillars & Care` (`/admin/about?tab=pillars`)
  * Navigating away from About or Team routes automatically closes the accordion.

### 6.3 Hero Section Carousel Manager (`/admin/hero`)
* Multi-page hero configuration supporting `home`, `about`, `services`, `gallery`, `blogs`, and `contact`.
* **Homepage Rotating Slider:** Supports unlimited sequential slides with custom ordering.
* **Add Slide Trigger:** Rendered as a prominent Radiant Blue pill button: `+ ADD HERO SLIDE` (`bg-blue-600 hover:bg-blue-500 text-white rounded-full font-black text-xs uppercase`).
* **Modal Architecture:** 2-column layout bounded by `max-h-[88vh]` with internal scrollbars, guaranteeing header and action buttons are never cut off.
* Supports bulk selection and multi-item deletion through `ConfirmModal`.

### 6.4 Blogs & Articles Manager (`/admin/blogs`)
* Modern card-grid layout featuring real-time title search (`Search by title or category...`) and category filter pills (`ALL`, `ABA Therapy`, `OAP Funding`, `Speech & Language`, `Occupational Therapy`, `Parent Guides`).
* Integrated with `RichTextEditor` for formatting article bodies.
* Dual-input media management via `ImageUploadField` (drag-and-drop system upload plus manual URL input).
* Card grid paired with responsive pagination (`AdminPagination`).

### 6.5 Facility Gallery Manager (`/admin/gallery`)
* Catalog manager for sensory gyms, therapy rooms, and motor development suites.
* On-page category filter pills (`ALL`, `Sensory Gym`, `Therapy Rooms`, `Group Play`, `Clinical Spaces`).
* Add/edit dialog supporting both file uploads and image URLs.

### 6.6 Clinical Programs Manager (`/admin/services`)
* Comprehensive catalog manager for therapy disciplines (ABA, SLP, OT, Life Skills).
* Configurable attributes: Program Title, URL Slug, Tagline, Card Badge Text, Badge Color Scheme, Display Order, Target Age Group, Session Format, Clinical Lead Supervisor, Short Summary, Detailed Clinical Overview, and Feature Bullet Points.
* Toggle: `Publish to Live Website Catalog (Active)`.

### 6.7 UI & Navbar Visibility Controller (`/admin/navigation`)
* Controls visibility of public header links and homepage section stacks.
* **Server-Side Enforcement (`src/lib/page-visibility.ts`):**
  * Reads `SiteNavigation.navItemsJson`.
  * If a route is marked inactive by an administrator, the server component executes `notFound()`.
  * This guarantees that deactivated pages are unreachable via direct URL entry or bookmarks.

---

## 🌌 7. Immersive 404 Full-Page Experience (`src/app/not-found.tsx`)

* **Architecture:** Replaces default browser errors and small modal dialogs with a full-viewport, immersive hero layout.
* **Key Design Characteristics:**
  * Fixed full viewport (`fixed inset-0 z-[100] min-h-screen w-screen bg-[#070b14] overflow-y-auto`) completely masking public headers and footers.
  * Technical coordinate grid background (`[background-size:4rem_4rem]`) paired with radial gradient masking.
  * Central radiant blue spotlight glow (`bg-blue-600/15 blur-[140px]`).
  * Center squircle container with pulse radar animation and clinical heart iconography.
  * Monolithic gradient **404** display typography (`text-8xl md:text-[11rem] font-mono font-black text-transparent bg-clip-text bg-gradient-to-b from-white via-slate-200 to-slate-500`).
  * Sub-badge: `PAGE DEACTIVATED OR ARCHIVED`.
  * High-visibility interactive action buttons:
    1. `HOME BASE →` (Radiant Blue primary pill button)
    2. `PROGRAMS` (Bordered dark slate button with clinical brain icon)
    3. `CONTACT US` (Bordered dark slate button with telephone icon)

---

## 🧩 8. Shared Reusable Components

| Component | Path | Description |
| :--- | :--- | :--- |
| `ConfirmModal` | `src/components/common/ConfirmModal.tsx` | Universal modal for edit/delete confirmations with warning badge, customizable title, message, and item count. |
| `AdminPagination` | `src/components/common/AdminPagination.tsx` | Universal pagination controls showing `Showing X to Y of Z results` with per-page dropdown and page controls. |
| `ImageUploadField` | `src/components/admin/ImageUploadField.tsx` | Dual-mode image selector: Drag-and-drop system file upload to `/api/admin/upload` PLUS manual URL/path input with live thumbnail preview. |
| `RichTextEditor` | `src/components/admin/RichTextEditor.tsx` | Clean WYSIWYG editor without broken HTML color/highlight artifacts, featuring headings, lists, bold, italics, quotes, and links. |

---

## 🗄️ 9. Database Schema (Prisma ORM)

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
DATABASE_URL="mysql://root:password@localhost:3306/radiant_autism_db"
JWT_SECRET="radiant_autism_super_secret_jwt_key_2026"
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

## 📋 11. Engineering Guidelines & Production Checklist

1. **Git Remote Sync:** Always ensure the remote origin is `https://github.com/DhirajKumar29-DK/Radiant_Autism_2.git` before pushing.
2. **Design System Adherence:** The primary brand color is **Radiant Blue (`#2563eb`)**. Amber or yellow highlights must not be applied to action buttons or active navigation states.
3. **Sidebar Architecture:** Only `About Section` contains child links. All other navigation nodes (`Dashboard`, `Blogs`, `Inquiries`, `Hero Section`, `Facility Gallery`, `Clinical Programs`, `Navbar & Visibility`) must remain single direct links.
4. **Deactivation Behavior:** Route deactivation in `/admin/navigation` is enforced server-side via `src/lib/page-visibility.ts`, routing visitors directly to the full-page 404 experience.
5. **Production Verification:** Execute `npm run build` prior to committing to ensure strict TypeScript validation across all static and dynamic routes.
