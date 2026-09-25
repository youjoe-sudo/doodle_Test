# Doodle Room — User & Admin Operating Guide

> **Doodle Room · دُودل روم**
> Complete bilingual operations manual: **🇸🇦 Arabic (دليل الاستخدام والتشغيل)** + **🇬🇧 English (User & Admin Operating Guide)**
>
> Version 1.0 · Site: <https://doodle-room.vercel.app>

---

# 🇬🇧 Part I — English: User & Admin Operating Guide

## Table of Contents (English)

1. [Storefront User Guide](#1-storefront-user-guide)
   - 1.1 [Navigation & Language Switcher](#11-navigation--language-switcher)
   - 1.2 [Browsing Catalog, Categories & Searching](#12-browsing-catalog-categories--searching)
   - 1.3 [The Digital Coloring Canvas](#13-the-digital-coloring-canvas)
   - 1.4 [Free Page Limits & WhatsApp Unlocks](#14-free-page-limits--whatsapp-unlocks)
   - 1.5 [Account, Cart, Wishlist & Checkout](#15-account-cart-wishlist--checkout)
2. [Admin Operations Manual](#2-admin-operations-manual)
   - 2.1 [Accessing /admin & Security Roles](#21-accessing-admin--security-roles)
   - 2.2 [User Management](#22-user-management)
   - 2.3 [Hero Banner Manager](#23-hero-banner-manager)
   - 2.4 [Moving Announcement Bar Manager](#24-moving-announcement-bar-manager)
   - 2.5 [Canva-like About Page Visual Builder](#25-canva-like-about-page-visual-builder)
   - 2.6 [Catalog & Product Management](#26-catalog--product-management)

---

# 1. Storefront User Guide

## 1.1 Navigation & Language Switcher

The header is available on every page.

| Control | Action |
| --- | --- |
| 🍔 **Menu** (left) | Opens the navigation drawer with all page links |
| 🖼️ **Logo** (center) | Returns to the home page |
| **AR / EN** switcher | Toggles the entire interface between Arabic (RTL) and English (LTR) |
| 🔍 **Search** | Opens the search field — type a product name and press Enter |
| 🔔 **Bell** | Notifications (order status, support replies) |
| ♡ **Heart** | Your wishlist |
| 🛒 **Cart** | Your shopping cart with item count badge |
| 👤 **Avatar / Login** | Account menu when signed in, or **Login** + **Sign Up** buttons for guests |

**Switching language:** click `AR` or `EN` in the header (or in the mobile drawer).
The choice is remembered in `localStorage` (`doodle_language`) and applied instantly —
text, alignment and reading direction (RTL ↔ LTR) all flip together.

> 💡 Guest users see prominent **“تسجيل الدخول” (Login)** and **“إنشاء حساب” (Sign Up)** buttons.
> Signed-in users see the avatar dropdown with **My Account**, **My Orders**, **Dashboard** (admins) and **Logout**.

## 1.2 Browsing Catalog, Categories & Searching

1. **Home page** — hero slider (dynamic admin banners), category cards, bestsellers, new arrivals, customer reviews and newsletter.
2. **Shop** — `/shop` shows the full product grid. Every product card shows image, name (AR/EN), price and sale price.
3. **Categories** — `/categories` lists all categories; clicking one opens its filtered product grid (`/categories/:slug`).
4. **Search** — click 🔍, type a keyword, press Enter → results at `/search?q=…`.
5. **Product details** — click any product to open `/products/:slug`, view description, price, images and the **Add to Cart** button.

## 1.3 The Digital Coloring Canvas

Open **التلوين / Coloring** → `/coloring-online` to see the coloring library, then press **تلوين (Color)** on any page you can access → `/coloring/:id`.

> The canvas requires sign‑in (protected route). If you are logged out you will be redirected to `/login`.

### Tools (left toolbar)

| Tool | Icon | What it does |
| --- | --- | --- |
| Pencil | ✏️ | Thin precise strokes |
| Marker | 🖌️ | Thick bold strokes (1.5× brush size) |
| Watercolor | 💧 | Soft translucent layered strokes (2× brush size) |
| Spray | 🎨 | Airbrush / spray‑paint texture |
| Eraser | 🧽 | Erases back to the white background |
| Bucket Fill | 🪣 | Flood‑fills a closed region with the selected color |
| Text | 🔤 | Click on the canvas and type a caption (color, size and options available) |

### Adjustments (right panel)

- **Brush size** — slider `1–60px` with live preview circle.
- **Opacity** — slider controlling stroke transparency.
- **Palette** — click any swatch to change the active color.

### History & actions

- **Undo ↶ / Redo ↷** — step backward/forward through your edit history.
- **Clear** — resets the canvas to the blank page.
- **Save** — stores your artwork in **My Drawings (`رسوماتي`)** — available from *Account → رسوماتي*.
- **Download ⬇** — exports the canvas as a PNG file.

### Auto‑save & draft backup

- While you draw, the canvas **auto‑saves a draft to `localStorage`** (key `coloring_draft_<pageId>`).
- When you reopen the page, the **local draft is restored instantly** (offline recovery).
- If you are signed in, the draft is **also synced to Supabase** (`user_artworks` + `user_artworks` storage bucket) and takes precedence on your next device.
- **Result:** closing the tab, refreshing, or a browser crash never loses your work.

## 1.4 Free Page Limits & WhatsApp Unlocks

The coloring library is **freemium**:

- Pages marked **مجاني / Free** (`is_free_tier = true`) are open to everyone — a green **“مجاني”** badge appears on the card.
- Premium pages are **blurred and locked**, showing the unlock price (e.g. `20 EGP`).
- Press **“طلب فتح عبر واتساب” (Request unlock via WhatsApp)** — this opens WhatsApp with a **prefilled message** containing the page title and your account e‑mail/phone, sent to the store's configured WhatsApp number.
- A **superadmin** grants the unlock from the dashboard → the page then shows an **“مفتوح / Unlocked”** badge and the **Color** button.

> 🔐 Only admins can grant or revoke unlocks (`user_unlocked_pages` is admin‑write only under RLS).

## 1.5 Account, Cart, Wishlist & Checkout

| Section | Route | What you can do |
| --- | --- | --- |
| Cart | `/cart` | Change quantities, remove items, see totals. Persisted locally. |
| Checkout | `/checkout` | Enter name, phone, email, governorate & address; shipping fee is calculated automatically per governorate; choose payment method (Vodafone Cash / InstaPay) and attach the receipt image. |
| Order success | `/orders/success` | Confirmation of your order. |
| Account | `/account` | Edit profile, change password, saved addresses, and **My Drawings (رسوماتي)**. |
| My Orders | `/account/orders` | List of orders with status badges. |
| Track Order | `/account/orders/:id` | Live status timeline (Processing → Shipped → Delivered). |
| Wishlist | `/wishlist` | Saved products. |
| Support | `/support` | Open a ticket and chat with support. |
| Login / Register | `/login`, `/register` | Email + password authentication. |

---

# 2. Admin Operations Manual

## 2.1 Accessing /admin & Security Roles

- Go to **`/admin`** (the header shows a **Dashboard** button for staff).
- Unauthenticated visitors are redirected to `/login`.
- Access is enforced by `AdminRoute` **and** by database RLS — the UI is never the only gate.

### Roles

| Role | Access |
| --- | --- |
| `superadmin` | Full access to every dashboard module and every RLS‑guarded table |
| `admin` | Dashboard modules (products, orders, users, content…) |
| `moderator` | Limited moderation access |
| `customer` / `user` | No dashboard access — storefront only |

> **Setup:** promote a user to `superadmin` from **Users** page (change role), or directly in SQL:
> `UPDATE profiles SET role = 'superadmin' WHERE id = '<user-uuid>';`

### Admin sidebar modules

Dashboard · Banner Management · About Page · Products · Categories · Orders · Inventory · Customers · Users · Coupons · Reviews · Support · Shipping · Payments · Notifications · Coloring · Settings.

The sidebar collapses into a **full‑screen drawer** on mobile, plus a floating ⬚ menu button.

## 2.2 User Management (`/admin/users`)

- **Desktop:** searchable table. **Mobile:** sticky search + role filter and stacked **user cards** with full‑width action buttons (≥48px).
- Search by name, e‑mail or phone; filter by role (all / superadmin / admin / moderator / customer).

**Actions per user**

| Action | Effect |
| --- | --- |
| **Change Role** | Pick a new role → saved to `profiles.role` |
| **Ban User** | Choose duration (hours/days/permanent) + optional reason → `is_banned`, `banned_until`, `ban_reason` |
| **Unban** | Clears ban fields immediately |
| **View Details** | Modal with e‑mail, phone, role, status and join date |
| **Delete Account** | Removes the auth user and the profile (irreversible, confirmed) |

> Banned users are sent to `/banned` on their next request; timed bans **auto‑expire**.

## 2.3 Hero Banner Manager (`/admin/banner-management`)

Create and manage the homepage slider.

### Banner types

| Type | Description |
| --- | --- |
| **Interactive Banner** | Image **+** title, subtitle, description (AR & EN) and a **CTA Link Builder** (label AR/EN, preset route or custom URL) |
| **Image-Only Banner** | Pure image — **all text and CTA fields are hidden**, and the storefront renders the raw image with no overlay |

### Strict image rules

- Required size: **1200 × 500 px** (ratio **2.40:1 ± 2%**).
- Non‑conforming uploads are **rejected** with an error such as:
  `Image must meet the exact dimensions: 1200x500px (got 1600x900, ratio 1.78:1 — required 2.40:1)`
- Images upload to the public **`site_assets`** storage bucket.

### Managing banners

- **+ New Banner** adds a card; **upload** the image; choose the type; fill content if interactive.
- **↑ / ↓** reorder slides · **Active** checkbox shows/hides the banner · 🗑 deletes it.
- **Save** persists everything to `site_settings → hero_banners`.
- CTA presets: Shop, New Product, Category, Coloring Pages, About, Contact, or a **Custom URL**.

## 2.4 Moving Announcement Bar Manager (`/admin/settings`)

Section **“شريط الإعلانات المتحرك (الأعلى)”**:

| Control | Purpose |
| --- | --- |
| **Toggle** | Enable / disable the moving marquee bar at the very top of the store |
| **Arabic text** | Custom AR message (e.g. `شحن مجاني للطلبات فوق 500 جنيه 🎨`) |
| **English text** | Custom EN message (e.g. `Free shipping on orders over 500 EGP 🎨`) |
| **Background color** | Color picker + hex field (default warm terracotta `#C25350`) |
| **Text color** | Color picker + hex field (default white) |
| **Live preview** | Renders the bar with the chosen colors before saving |

Press **حفظ (Save)** — the storefront `AnnouncementBar` fetches `site_settings → store → announcement` on load and renders the marquee with the saved texts and colors. Disable the toggle to hide the bar completely.

## 2.5 Canva-like About Page Visual Builder (`/admin/about-builder`)

Builds the public `/about` page visually.

- **Add blocks:** heading, text, image, sticker (star/heart/flower/sparkle), button (CTA).
- **Edit each block:** text content (AR & EN), font size / family / color, pastel background, alignment, frame style (none / rounded / pastel / tilt + slider), padding and gap sliders, width **full** or **half** (half blocks sit side by side).
- **Reorder:** drag blocks by the ⠿ grip handle, or use the **↑ / ↓** buttons; a green highlight marks the drop target.
- **Preview:** the **Preview / Edit** toggle shows the public layout live before publishing.
- **Publish:** **Save (Publish)** stores the layout to `site_settings → about_blocks` as `{ version: 2, blocks: [...] }`.
- The public page renders instantly, fully bilingual (AR/EN).

## 2.6 Catalog & Product Management

### Products (`/admin/products`)
- **Add product:** name (EN + AR), slug (auto), description (EN + AR), original price, sale price, stock, category, cover image, and **digital file URL** for downloadable coloring files.
- Edit or delete existing products; the storefront only lists `is_published = true` items.

### Categories (`/admin/categories`)
- Add / edit categories with name (EN + AR), slug, description, cover image and sort order.

### Inventory (`/admin/inventory`)
- Quick inline stock editing with save buttons.

### Coloring pages (`/admin/coloring`)
- Upload coloring files (PNG/JPG/PDF up to 10 MB) to the `coloring_files` bucket.
- Set the **price**, **sort order**, and toggle **Free Tier (مجاني)**.
- Manage **unlocks**: grant or revoke a user's access to a premium page (drives the WhatsApp unlock flow).

### Other modules
Orders (status updates) · Customers · Coupons (%, amount, min order, expiry) · Reviews (approve/reject) · Support tickets · Shipping fees per governorate · Payments · Notifications · **Settings** (store info, contact, social links, payment numbers, shipping fees, announcement bar).

---

---
---

# 🇸🇦 الجزء الثاني — دليل الاستخدام والتشغيل بالعربية

## فهرس المحتويات (العربية)

1. [دليل الزائر والعميل](#١-دليل-الزائر-والعميل)
   - [التنقل ومبدّل اللغة](#التنقل-ومبدّل-اللغة)
   - [تصفح الكتالوج والتصنيفات والبحث](#تصفح-الكتالوج-والتصنيفات-والبحث)
   - [لوحة التلوين الرقمية](#لوحة-التلوين-الرقمية)
   - [حدود الصفحات المجانية وطلب الفتح عبر واتساب](#حدود-الصفحات-المجانية-وطلب-الفتح-عبر-واتساب)
   - [الحساب والسلة والمفضلة وإتمام الطلب](#الحساب-والسلة-والمفضلة-وإتمام-الطلب)
2. [دليل لوحة التحكم والأدمن](#٢-دليل-لوحة-التحكم-والأدمن)
   - [الدخول إلى /admin وإعداد الأدوار](#الدخول-إلى-admin-وإعداد-الأدوار)
   - [إدارة المستخدمين](#إدارة-المستخدمين)
   - [إدارة البانرات الرئيسية](#إدارة-البانرات-الرئيسية)
   - [إدارة شريط الإعلانات المتحرك](#إدارة-شريط-الإعلانات-المتحرك)
   - [منشئ صفحة «من نحن» البصري](#منشئ-صفحة-من-نحن-البصري)
   - [إدارة الكتالوج والمنتجات](#إدارة-الكتالوج-والمنتجات)

---

# ١. دليل الزائر والعميل

## التنقل ومبدّل اللغة

يظهر الهيدر في كل صفحة:

| الزر | الوظيفة |
| --- | --- |
| 🍔 **القائمة** (يسار) | يفتح درج التنقل بكل الروابط |
| 🖼️ **الشعار** (وسط) | يعود إلى الصفحة الرئيسية |
| مبدّل **AR / EN** | يبدّل الواجهة كلها بين العربية (RTL) والإنجليزية (LTR) |
| 🔍 **البحث** | يفتح حقل البحث — اكتب اسم منتج واضغط Enter |
| 🔔 **الجرس** | الإشعارات (حالة الطلبات، ردود الدعم) |
| ♡ **المفضلة** | منتجاتك المحفوظة |
| 🛒 **السلة** | سلة التسوق مع عداد المنتجات |
| 👤 **الحساب** | قائمة الحساب عند تسجيل الدخول، أو زرا **تسجيل الدخول** و**إنشاء حساب** للزوار |

**تبديل اللغة:** اضغط `AR` أو `EN` في الهيدر (أو داخل درج الموبايل). تُحفظ اللغة في `localStorage` وتُطبَّق فوراً — النص والمحاذاة واتجاه القراءة (من اليمين لليسار ↔ من اليسار لليمين) تتغير معاً.

> 💡 يرى الزائر زرين بارزين: **تسجيل الدخول** و**إنشاء حساب**.
> بعد الدخول تظهر قائمة الأفاتار: **حسابي** · **طلباتي** · **لوحة التحكم** (للآدمين) · **تسجيل الخروج**.

## تصفح الكتالوج والتصنيفات والبحث

1. **الرئيسية** — سلايدر البانرات (ديناميكي من الأدمن)، بطاقات التصنيفات، الأكثر مبيعاً، وصل حديثاً، آراء العملاء، النشرة البريدية.
2. **المتجر** `/shop` — كل المنتجات في شبكة مع الصورة والاسم (عربي/إنجليزي) والسعر وسعر التخفيض.
3. **التصنيفات** `/categories` — كل التصنيفات، والضغط على أي تصنيف يفتح منتجاته فقط.
4. **البحث** 🔍 → نتائج في `/search?q=…`.
5. **تفاصيل المنتج** `/products/:slug` — الوصف والسعر والصور وزر **أضف إلى السلة**.

## لوحة التلوين الرقمية

افتح **التلوين** → `/coloring-online` ثم اضغط **تلوين** على أي صفحة متاحة → `/coloring/:id`.

> الصفحة محمية وتحتاج تسجيل الدخول؛ عند الخروج يتم تحويلك إلى `/login`.

### الأدوات (الشريط الجانبي)

| الأداة | الوظيفة |
| --- | --- |
| ✏️ **قلم رصاص** | خطوط رفيعة دقيقة |
| 🖌️ **قلم تحديد** | خطوط سميكة (١٫٥× حجم الفرشاة) |
| 💧 **ألوان مائية** | طبقات شفافة ناعمة (٢× حجم الفرشاة) |
| 🎨 **بخاخ** | تأثير برش ألوان ( spreay ) |
| 🧽 **ممحاة** | يمسح حتى الخلفية البيضاء |
| 🪣 **تعبئة** | يملأ المنطقة المغلقة باللون المختار |
| 🔤 **نص** | اضغط على اللوحة واكتب نصاً (اللون والحجم متاحة) |

### الضبط (اللوحة اليمنى)

- **حجم الفرشاة** — منزلق `1–60px` مع معاينة مباشرة.
- **الشفافية** — منزلق شفافية الخط.
- **لوحة الألوان** — اضغط أي لون لاختياره.

### السجل والأزرار

- **تراجع ↶ / إعادة ↷** — التنقل في سجل التعديلات.
- **مسح** — إعادة اللوحة إلى فارغة.
- **حفظ** — يحفظ رسمتك في **رسوماتي** (من *الحساب → رسوماتي*).
- **تحميل ⬇** — تصدير اللوحة كملف PNG.

### الحفظ التلقائي ونسخة احتياطية

- أثناء الرسم، تُحفظ نسخة تلقائياً في `localStorage` (المفتاح `coloring_draft_<pageId>`).
- عند إعادة فتح الصفحة **تُستعاد النسخة فوراً** (تعمل حتى بدون إنترنت).
- وعند تسجيل الدخول تتم **المزامنة إلى Supabase** (`user_artworks`) وتُفضَّل على جهازك الآخر.
- **النتيجة:** إغلاق التبويب أو إعادة التحميل أو تعطل المتصفح لا يُفقد رسمك أبداً.

## حدود الصفحات المجانية وطلب الفتح عبر واتساب

مكتبة التلوين نظام **freemium**:

- الصفحات المعلّمة **مجاني** (`is_free_tier = true`) متاحة للجميع ويظهر عليها شارة خضراء.
- الصفحات المميزة تظهر **مموّهة ومقفلة** مع سعر الفتح (مثال: `٢٠ ج.م`).
- اضغط **«طلب فتح عبر واتساب»** — يُفتح واتساب برسالة **جاهزة** فيها اسم الصفحة وبريدك/هاتفك، تُرسل لرقم واتساب المتجر.
- يقوم **superadmin** بالموافقة من لوحة التحكم → تظهر الشارة **«مفتوح»** وزر **«تلوين»**.

> 🔐 منح وإلغاء الفتح مسؤولية الأدمن فقط (جدول `user_unlocked_pages` محمي بـ RLS).

## الحساب والسلة والمفضلة وإتمام الطلب

| القسم | الرابط | ماذا تفعل |
| --- | --- | --- |
| السلة | `/cart` | تعديل الكميات والحذف ورؤية الإجمالي (تُحفظ محلياً) |
| الدفع | `/checkout` | الاسم والهاتف والبريد والمحافظة والعنوان، يُحتسب رسوم الشحن تلقائياً، اختيار طريقة الدفع (فودافون كاش / InstaPay) وإرفاق صورة الإيصال |
| نجاح الطلب | `/orders/success` | تأكيد الطلب |
| حسابي | `/account` | تعديل البيانات، تغيير كلمة المرور، العناوين المحفوظة، و**رسوماتي** |
| طلباتي | `/account/orders` | قائمة الطلبات بحالاتها |
| تتبع الطلب | `/account/orders/:id` | خط زمني مباشر (قيد المعالجة ← تم الشحن ← تم التوصيل) |
| المفضلة | `/wishlist` | المنتجات المحفوظة |
| الدعم | `/support` | فتح تذكرة تواصل مع الدعم |
| الدخول / التسجيل | `/login`, `/register` | تسجيل الدخول بالبريد وكلمة المرور |

---

# ٢. دليل لوحة التحكم والأدمن

## الدخول إلى `/admin` وإعداد الأدوار

- افتح **`/admin`** (يظهر زر **لوحة التحكم** في الهيدر لفريق العمل).
- الزائر غير المسجّل يُحوَّل إلى `/login`.
- الحماية عبر `AdminRoute` **و** عبر RLS في قاعدة البيانات — الواجهة ليست البوابة الوحيدة.

### الأدوار

| الدور | الصلاحية |
| --- | --- |
| `superadmin` | وصول كامل لكل وحدات لوحة التحكم وكل الجداول المحمية |
| `admin` | وحدات اللوحة (منتجات، طلبات، مستخدمون، محتوى…) |
| `moderator` | صلاحية إشراف محدودة |
| `customer` / `user` | بدون لوحة تحكم — المتجر فقط |

> **الإعداد:** ارفع مستخدماً إلى `superadmin` من صفحة **المستخدمين** (تعديل الدور)، أو مباشرة في SQL:
> `UPDATE profiles SET role = 'superadmin' WHERE id = 'معرّف-المستخدم';`

### وحدات القائمة الجانبية

لوحة التحكم · إدارة البانرات · صفحة من نحن · المنتجات · التصنيفات · الطلبات · المخزون · العملاء · المستخدمون · الكوبونات · التقييمات · الدعم · الشحن · المدفوعات · الإشعارات · التلوين · الإعدادات.

القائمة تتحول إلى **درج بملء الشاشة** في الموبايل مع زر قائمة عائم.

## إدارة المستخدمين (`/admin/users`)

- **ديسكتوب:** جدول قابل للبحث. **موبايل:** بحث وفلتر أدوار ملتصقان + **بطاقات مستخدمين** بزر كبيرة كاملة العرض (≥48px).
- بحث بالاسم أو البريد أو الهاتف، وفلترة حسب الدور.

**إجراءات لكل مستخدم**

| الإجراء | النتيجة |
| --- | --- |
| **تعديل الدور** | اختيار دور جديد → يُحفظ في `profiles.role` |
| **حظر مستخدم** | مدة (ساعات/أيام/دائم) + سبب اختياري → `is_banned`, `banned_until` |
| **إلغاء الحظر** | يمسح بيانات الحظر فوراً |
| **عرض التفاصيل** | نافذة بالبريد والهاتف والحالة وتاريخ التسجيل |
| **حذف الحساب** | يحذف المستخدم والملف الشخصي (غير قابل للتراجع) |

> المستخدم المحظور يُحوَّل إلى `/banned` في طلبه التالي، والحظور المحدد المدة **ينتهي تلقائياً**.

## إدارة البانرات الرئيسية (`/admin/banner-management`)

إدارة سلايدر الصفحة الرئيسية.

### أنواع البانر

| النوع | الوصف |
| --- | --- |
| **بانر تفاعلي** | صورة **+** عنوان ووصف (عربي/إنجليزي) و**مولّد رابط CTA** (نص الزر AR/EN، مسار جاهز أو رابط مخصص) |
| **صورة فقط** | صورة نظيفة — **تُخفى كل حقول النص والزر**، ويعرض المتجر الصورة بدون أي تراكب |

### قواعد الصورة الصارمة

- المقاس المطلوب: **1200 × 500 بكسل** (نسبة **2.40:1 ± 2%**).
- أي مقاس آخر **يُرفض** برسالة خطأ مثل:
  `Image must meet the exact dimensions: 1200x500px (got 1600x900, ratio 1.78:1 — required 2.40:1)`
- تُرفع الصور إلى باcket **`site_assets`** العام.

### إدارة البانرات

- **بانر جديد** لإضافة بطاقة، ثم **رفع الصورة**، اختيار النوع، وملء المحتوى إن كان تفاعلياً.
- **↑ / ↓** لترتيب الشرائح · مربع **نشط** لإظهار/إخفاء البانر · 🗑 للحذف.
- **حفظ** يكتب كل شيء في `site_settings → hero_banners`.
- المسارات الجاهزة: المتجر، منتج جديد، تصنيف، صفحات التلوين، من نحن، اتصل بنا، أو **رابط مخصص**.

## إدارة شريط الإعلانات المتحرك (`/admin/settings`)

قسم **«شريط الإعلانات المتحرك (الأعلى)»**:

| العنصر | الوظيفة |
| --- | --- |
| **مفتاح التبديل** | تفعيل/تعطيل الشريط المتحرك أعلى المتجر |
| **النص بالعربية** | رسالة عربية مخصصة (مثال: `شحن مجاني للطلبات فوق 500 جنيه 🎨`) |
| **النص بالإنجليزية** | رسالة إنجليزية مخصصة |
| **لون الخلفية** | منتقي لون + حقل hex (الافتراضي تراكوتا `#C25350`) |
| **لون النص** | منتقي لون + حقل hex (الافتراضي أبيض) |
| **معاينة مباشرة** | تعرض الشريط بالألوان قبل الحفظ |

اضغط **حفظ** — ويجلب مكوّن `AnnouncementBar` الإعدادات من `site_settings → store → announcement` عند تحميل الصفحة. أطفئ المفتاح لإخفاء الشريط تماماً.

## منشئ صفحة «من نحن» البصري (`/admin/about-builder`)

يبني الصفحة العامة `/about` بصرياً:

- **إضافة كتل:** عنوان، نص، صورة، ملصق (نجمة/قلب/وردة/بريق)، زر (CTA).
- **تحرير كل كتلة:** المحتوى (عربي/إنجليزي)، حجم وخط ولون الخط، خلفية باستيل، محاذاة، إطار (عادي/مستدير/بستيل/مائل + منزلق)، منزلقا الحشو والمسافة، وعرض **كامل** أو **نصف** (النصف يظهر جنباً إلى جنب).
- **الترتيب:** بالسحب من مقبض ⠿ أو بأزرار **↑ / ↓**، مع تظليل أخضر لهدف الإفلات.
- **معاينة:** زر **Preview / Edit** يعرض الشكل النهائي مباشرة قبل النشر.
- **النشر:** **حفظ** يكتب التخطيط في `site_settings → about_blocks` بصيغة `{ version: 2, blocks: [...] }`.
- تظهر الصفحة فوراً وبكامل ثنائية اللغة (عربي/إنجليزي).

## إدارة الكتالوج والمنتجات

### المنتجات (`/admin/products`)
- **إضافة منتج:** اسم (إنجليزي + عربي)، slug (تلقائي)، وصف (EN + AR)، سعر أصلي، سعر تخفيض، مخزون، تصنيف، صورة غلاف، و**رابط الملف الرقمي** لملفات التلوين القابلة للتحميل.
- تعديل أو حذف المنتجات؛ لا يعرض المتجر إلا ما كان `is_published = true`.

### التصنيفات (`/admin/categories`)
- إضافة/تعديل تصنيفات بالاسم (EN + AR) والوصف وصورة الغلاف وترتيب العرض.

### المخزون (`/admin/inventory`)
- تعديل المخزون مباشرة من الجدول مع زر حفظ.

### صفحات التلوين (`/admin/coloring`)
- رفع ملفات التلوين (PNG/JPG/PDF حتى 10MB) إلى باcket `coloring_files`.
- تحديد **السعر** و**الترتيب** وتفعيل **«مجاني (Free Tier)»**.
- إدارة **الفتح**: منح مستخدم صلاحية صفحة مميزة أو إلغاؤها (منطق طلب واتساب).

### وحدات أخرى
الطلبات (تحديث الحالات) · العملاء · الكوبونات (٪، مبلغ، حد أدنى، انتهاء) · التقييمات (اعتماد/رفض) · تذاكر الدعم · رسوم الشحن لكل محافظة · المدفوعات · الإشعارات · **الإعدادات** (بيانات المتجر، التواصل، السوشال، أرقام الدفع، الشحن، شريط الإعلانات).

---

<div align="center">

**Doodle Room — Small Books Big Dreams** 🎨

[Website](https://doodle-room.vercel.app) · [README](../README.md) · [PDF Guide](./Doodle_Room_User_And_Admin_Guide.pdf)

</div>
