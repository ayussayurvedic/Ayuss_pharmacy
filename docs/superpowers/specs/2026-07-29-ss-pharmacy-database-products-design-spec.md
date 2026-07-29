# Design Specification: S.S. Pharmacy Resilient Product & Content Management

## 1. Goal Description
Transition the public storefront products catalog and homepage banners from static code assets into a Supabase database configuration. To ensure maximum system resilience, if Supabase is offline or fails, the frontend will gracefully fall back to loading data and WebP assets directly from the local repository (Vercel/GitHub).

---

## 2. Component 1: Database Schemas & Seeding

### 2.1 Table Extension (`products`)
Add missing catalog content fields to the existing `products` table:
```sql
ALTER TABLE public.products 
ADD COLUMN IF NOT EXISTS composition TEXT NOT NULL DEFAULT '',
ADD COLUMN IF NOT EXISTS benefits TEXT[] NOT NULL DEFAULT '{}',
ADD COLUMN IF NOT EXISTS usage TEXT NOT NULL DEFAULT '',
ADD COLUMN IF NOT EXISTS shelf_life TEXT NOT NULL DEFAULT '3 Years',
ADD COLUMN IF NOT EXISTS safety_note TEXT NOT NULL DEFAULT '',
ADD COLUMN IF NOT EXISTS image TEXT,
ADD COLUMN IF NOT EXISTS transparent_image TEXT,
ADD COLUMN IF NOT EXISTS gallery_images TEXT[] NOT NULL DEFAULT '{}';
```

### 2.2 Table Creation (`page_assets`)
Define a schema for content-managing homepage hero carousels and showcase banners:
```sql
CREATE TABLE public.page_assets (
    id TEXT PRIMARY KEY,
    section_name TEXT NOT NULL,
    desktop_image_url TEXT NOT NULL,
    mobile_image_url TEXT NOT NULL,
    title TEXT,
    subtitle TEXT,
    description TEXT,
    link_url TEXT,
    display_order INTEGER DEFAULT 1,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

### 2.3 Seed Script
Seed S.S. Pharmacy's 3 products and 4 hero carousel slides into the tables.

---

## 3. Component 2: Frontend Resilience & Fallback
Wrap Supabase queries in `try/catch` handlers on the public routes:
- `/products`
- `/products/[id]`
- `/` (homepage)
On database failure or empty results, load fallback data statically from `src/data/products.ts` and resolve images to the local public folder `/products/...` (compiled in the repository).

---

## 4. Component 3: Admin Dashboard Management & Numbered Image Fields
- **Admin Formulation Forms** (`/admin/products/new` and `/admin/products/[id]`):
  - Add textareas for `composition`, `usage`, `safety_note`, and `shelf_life`.
  - Add numbered WebP input fields:
    - *Image 1 (Main/Hero)* -> maps to `image` and `gallery_images[0]`.
    - *Image 2 (Secondary/Transparent)* -> maps to `transparent_image` and `gallery_images[1]`.
    - *Image 3 (Gallery 1)* -> maps to `gallery_images[2]`.
    - *Image 4 (Gallery 2)* -> maps to `gallery_images[3]`.
    - *Image 5 (Gallery 3)* -> maps to `gallery_images[4]`.
  - Enforce WebP format validation on submit.
- **Admin Homepage Assets Manager** (`/admin/settings`):
  - Create a sub-tab to edit desktop/mobile image URLs and titles for hero carousel entries.
