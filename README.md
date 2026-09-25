<div align="center">

# 🎨 Doodle Room

### Small Books Big Dreams — Cozy E‑Commerce & Digital Coloring Platform

A warm, playful online store and **freemium digital coloring studio** built with
**React + TypeScript + Tailwind CSS + Supabase**, fully bilingual **Arabic / English (RTL / LTR)**.

[![React](https://img.shields.io/badge/React-19-61DAFB?style=flat-square&logo=react&logoColor=black)](https://react.dev)
[![TypeScript](https://img.shields.io/badge/TypeScript-6.0-3178C6?style=flat-square&logo=typescript&logoColor=white)](https://www.typescriptlang.org)
[![Vite](https://img.shields.io/badge/Vite-8.3-646CFF?style=flat-square&logo=vite&logoColor=white)](https://vite.dev)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-4.x-38B2AC?style=flat-square&logo=tailwindcss&logoColor=white)](https://tailwindcss.com)
[![Supabase](https://img.shields.io/badge/Supabase-Postgres%20%2B%20RLS-3FCF8E?style=flat-square&logo=supabase&logoColor=white)](https://supabase.com)

[**Live Site**](https://doodle-room.vercel.app) · [**User & Admin Guide**](docs/USER_AND_ADMIN_GUIDE.md) · [**Getting Started**](#-getting-started)

</div>

---

## 📖 Project Overview

**Doodle Room** is a cozy e‑commerce storefront combined with a digital coloring platform.
Customers browse and buy physical products (books, stickers, stationery), manage their cart and
orders, and color free or premium digital pages in an interactive browser canvas — while the
`superadmin` runs the whole shop from a mobile‑friendly admin dashboard.

- **Storefront** — hero slider, categories, bestsellers, new arrivals, reviews, newsletter, search, cart, wishlist, checkout, order tracking, support tickets.
- **Digital Coloring Studio** — a freemium canvas with brushes, fills, text, undo/redo, local draft backup and cloud sync to *My Drawings* (`رسوماتي`).
- **Admin Dashboard** — products, categories, orders, inventory, customers, users, coupons, reviews, support, shipping, payments, notifications, banners, about‑page builder and store settings.

> The product is intentionally **not an LMS** — it is a retail + creativity platform owned and operated by Doodle Room.

---

## ✨ Core Features

### 🖌️ Interactive Freemium Digital Canvas
- Drawing tools: **pencil, marker, watercolor, spray, eraser, bucket fill, text**.
- Adjustable **brush size (1–60px)** and **opacity**, plus a full color palette.
- **Undo / Redo** history and one‑click **PNG download**.
- **Local draft backup** — every stroke is auto‑saved to `localStorage`, and (when signed in) synced to Supabase so artwork survives refreshes and device changes.
- **Free page tier** — a set of coloring pages is marked *free*; premium pages show a lock and price.
- **WhatsApp premium unlock** — a prefilled WhatsApp message requests activation of a premium drawing for the customer's account; the admin grants the unlock from the dashboard.

### 🧸 High‑Fidelity Cozy & Playful UI
- Warm pastel palette (cream, terracotta, sage, blush, lavender, peach) with hard sticker shadows and rounded cards.
- Fully **responsive** — desktop, tablet and mobile, with large 48px touch targets in admin forms.
- **Full AR/EN bilingual** with a live language switcher that flips the whole app between **RTL and LTR**, persisted in `localStorage`.

### 🎛️ Dynamic Content & Admin Controls
- **Hero Banner Manager** — create *Interactive* (text + CTA) or **Image‑Only** banners with **strict 1200×500px aspect‑ratio validation** (2.40:1 ±2% — invalid uploads are rejected).
- **Moving Announcement Bar** — enable/disable, custom Arabic & English text, background/text color pickers, live preview.
- **Canva‑like Visual Builder for `/about`** — add, drag‑and‑drop and reorder text, images, badges and CTA blocks; half/full width, frames, live preview before publishing.
- Everything persists to `site_settings` and renders instantly on the storefront.

### 🔐 Role‑Based Access Control
- **Supabase Row Level Security (RLS)** on every table — no client‑side trust, public reads and admin writes enforced in the database.
- Roles: `superadmin`, `admin`, `moderator`, `customer` — dashboard access is gated by `AdminRoute`.
- **Mobile‑optimized user management** — role changes, timed/permanent bans, unban and account deletion from user cards.

---

## 🛠️ Tech Stack

| Layer | Technology |
| --- | --- |
| UI | **React 19** + **TypeScript** |
| Build | **Vite 8** (`tsc -b && vite build`) |
| Styling | **Tailwind CSS v4** (`@tailwindcss/vite`, `@theme` design tokens) |
| Backend | **Supabase** — Auth, Postgres, **Row Level Security**, Storage |
| Routing | **React Router v7** (`createBrowserRouter`) |
| Icons | **Lucide React** |
| Validation | **Zod** + **react-hook-form** |
| Deployment | **Vercel** (`doodle-room.vercel.app`) |

> The app is a **Vite‑powered React SPA** (client‑rendered). It ships as a single `index.html` bundle, so there is no server runtime — all data access goes through Supabase.

---

## 🚀 Getting Started

### Prerequisites
- **Node.js 18+** and npm
- A **Supabase** project (URL + anon key)

### 1. Install

```bash
npm install
```

### 2. Configure environment

Create a `.env` file in the project root:

```bash
VITE_SUPABASE_URL=your-supabase-url
VITE_SUPABASE_ANON_KEY=your-supabase-anon-key
```

> Never commit real credentials. Only `VITE_*` keys are exposed to the browser; keep service‑role keys server‑side only.

### 3. Run

```bash
npm run dev       # start dev server (with --host for LAN access)
```

### 4. Scripts

| Command | Description |
| --- | --- |
| `npm install` | Install all dependencies |
| `npm run dev` | Start the development server with HMR |
| `npm run build` | Type‑check (`tsc -b`) and build for production |
| `npm run preview` | Preview the production build locally |
| `npm run lint` | Run Oxlint |
| `npm run docs:pdf` | Export the bilingual manual to `docs/Doodle_Room_User_And_Admin_Guide.pdf` |

### 5. Database

Migrations live in `supabase/migrations/`. Run them in order in the **Supabase SQL Editor**:

```text
20240101_01_initial_schema.sql
…
20240109_freemium_coloring.sql
20240112_fix_rls_recursion.sql
20240115_production_rls_audit.sql
```

---

## 📚 Documentation

| Document | Description |
| --- | --- |
| [**docs/USER_AND_ADMIN_GUIDE.md**](docs/USER_AND_ADMIN_GUIDE.md) | Complete bilingual (🇸🇦 Arabic + 🇬🇧 English) user & admin operations manual |
| [**docs/Doodle_Room_User_And_Admin_Guide.pdf**](docs/Doodle_Room_User_And_Admin_Guide.pdf) | Printable PDF catalog of the same guide |
| [`supabase/schema.sql`](supabase/schema.sql) | Canonical database schema |

---

## 🗂️ Project Structure

```text
doodle-room/
├── index.html                  # SEO meta, OG/Twitter images, fonts
├── src/
│   ├── components/
│   │   ├── home/               # Hero, AnnouncementBar, Categories, Reviews…
│   │   ├── layout/             # Navbar, Footer, LanguageSwitcher
│   │   ├── admin/              # DataTable, Modal, Toast, ConfirmDialog
│   │   └── coloring/           # ColoringCanvasPage helpers
│   ├── pages/
│   │   ├── store/              # Homepage, Shop, Product details
│   │   ├── coloring/           # Coloring library + interactive canvas
│   │   ├── account/            # Account, orders, wishlist, support
│   │   ├── checkout/           # Cart & checkout flow
│   │   ├── admin/              # Dashboard, Products, Users, Banners…
│   │   └── about/              # Public About page (visual builder output)
│   ├── contexts/               # AuthContext, CartContext
│   ├── layouts/                # StoreLayout, AdminLayout
│   ├── routes/                 # AppRouter, AdminRoute, ProtectedRoute
│   └── lib/supabase/           # Supabase client
├── supabase/migrations/        # SQL migrations (RLS included)
├── docs/                       # User & Admin guide (MD + PDF)
└── scripts/                    # docs PDF generator
```

---

## 🔒 Security Notes

- **RLS everywhere** — the database, not the UI, decides who can read/write.
- `is_superadmin()` is a `SECURITY DEFINER` helper used by policies to avoid recursion.
- Secrets are never shipped to the client; only `VITE_*` variables reach the browser bundle.
- Admin pages are wrapped in `AdminRoute`; customer pages in `ProtectedRoute`.

---

## 📄 License

Private / All rights reserved — © Doodle Room.
