# DESIGN.md - S.S. Pharmacy Design Specification

This document defines the agent-readable design contract for **S.S. Pharmacy** following the [VoltAgent/awesome-design-md](https://github.com/VoltAgent/awesome-design-md) standard. All UI components, pages, and admin interfaces MUST adhere strictly to these visual tokens and design rules.

---

## 1. Visual Theme & Atmosphere

* **Brand Philosophy**: Traditional Ayurvedic Healing • Modern Licensed Wellness.
* **Atmosphere**: Botanical, Trustworthy, Serene, Clinical-Ayurvedic.
* **Vibe Dials**:
  * `DESIGN_VARIANCE`: 7 (Restrained organic elegance, left-aligned structure)
  * `MOTION_INTENSITY`: 5 (Smooth Framer Motion entrance & crossfade transitions)
  * `VISUAL_DENSITY`: 4 (Airy spacing, clear typography hierarchy)

---

## 2. Color Palette & Functional Roles

| Token Name | Hex Code | Functional Role |
|------------|----------|-----------------|
| `--color-primary` | `#1A5C5E` | Deep Herbal Teal (Header navbar, primary buttons, main section headings) |
| `--color-primary-dark` | `#134547` | Hover state for primary buttons & dark admin header cards |
| `--color-accent` | `#C9943E` | Ayurvedic Gold (Subtitle accents, active tab indicators, price highlights) |
| `--color-bg-cream` | `#FDF8F0` | Warm Soft Cream (Global body background, hero background, footer top border) |
| `--color-surface` | `#FDFBF7` | Off-White Surface (Card backgrounds, input surfaces) |
| `--color-border` | `#C9D5D5` | Soft Botanical Border (Card borders, dividers, subtle outlines) |
| `--color-text-primary` | `#1E293B` | Dark Slate (Primary readable text, product titles) |
| `--color-text-muted` | `#64748B` | Slate Muted (Subtitles, descriptions, metadata) |

---

## 3. Typography Rules & Hierarchy

| Role | Font Family | Tailwind Class | Usage / Specs |
|------|-------------|----------------|---------------|
| **Display / Hero** | `Playfair Display` (Serif) | `font-serif` | Main section titles, Hero product titles (`Moon Light Cream`, `Dr. Lion`) |
| **Subtitle / Accent** | `Playfair Display` (Italic Serif) | `font-serif italic` | Secondary taglines (`Natural Care for Radiant Skin`, `Pure Ayurveda, Pure Life`) |
| **Body & UI** | `Outfit` / `Inter` (Sans) | `font-sans` | Body copy, navigation links, buttons, form fields, admin tables |
| **Data / Serial IDs** | `JetBrains Mono` (Mono) | `font-mono` | Order numbers (`#ORD-9842`), batch codes, regulatory license IDs |

### Typography Guidelines:
* **Left Alignment**: Page header breadcrumbs and titles on `/products`, `/why-choose-us`, `/about`, `/contact`, `/manufacturing` MUST remain left-aligned inside container bounds (`text-left`).
* **Line Height**: Body text uses `leading-relaxed` (`1.65`). Display titles use `leading-tight` (`1.15`).

---

## 4. Component Stylings (`shadcn/ui` Standard)

### A. Buttons (`Button.tsx`)
* **Primary**: `bg-[#1A5C5E] hover:bg-[#134547] text-white rounded-full px-6 py-2.5 shadow-md border border-[#1A5C5E] min-h-[44px]`
* **Secondary**: `bg-[#FDFBF7] hover:bg-[#F2F7F7] text-[#1A5C5E] rounded-full px-6 py-2.5 border border-[#C9D5D5] hover:border-[#C9943E] min-h-[44px]`

### B. Cards (`AdminCard`, Product Cards)
* **Surface**: `bg-white rounded-2xl border border-[#C9D5D5]/60 shadow-xs p-6 hover:shadow-md transition-all`

### C. Status Badges (`src/components/ui/badge.tsx`)
* **`success`**: `bg-emerald-100 text-emerald-800 border-emerald-200`
* **`warning`**: `bg-amber-100 text-amber-800 border-amber-200`
* **`destructive`**: `bg-red-500 text-white shadow-xs`
* **`gold`**: `bg-[#C9943E]/10 text-[#C9943E] border-[#C9943E]/40`

### D. Data Tables (`src/components/ui/table.tsx`)
* Header row: `bg-slate-50/80 uppercase text-[11px] font-bold text-slate-700 tracking-wider`
* Cells: `p-4 align-middle text-xs text-slate-700 divide-y divide-slate-100`

---

## 5. Layout & Responsive Principles

* **Max Width Container**: `max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8`
* **Breakpoints**: Standard Tailwind (`sm: 640px`, `md: 768px`, `lg: 1024px`, `xl: 1280px`)
* **Touch Targets**: Minimum `44px` touch height on all mobile buttons, inputs, and tab triggers.
* **Hero Viewport**: Use `min-h-[100dvh]` instead of fixed `h-screen` to prevent mobile address-bar jumping.

---

## 6. Depth & Elevation

* **`shadow-xs`**: `0 1px 2px 0 rgb(0 0 0 / 0.05)` (Default card resting state)
* **`shadow-md`**: `0 4px 6px -1px rgb(0 0 0 / 0.1)` (Hover state, Floating WhatsApp button, active dialogs)
* **Scrim Mask**: Soft 65% gradient mask (`linear-gradient(90deg, rgba(253, 248, 240, 0.65) 0%, rgba(253, 248, 240, 0) 55%)`) allowing botanical leaf imagery to shine through.

---

## 7. Guardrails & Anti-Patterns (Do's & Don'ts)

* ✅ **DO**: Keep image paths strictly lowercase-hyphenated (`/products/moon-light/...`, `/products/raw-herbs-banner.webp`).
* ✅ **DO**: Use `shadcn/ui` components (`Table`, `Badge`, `Tabs`, `Skeleton`, `Spinner`) for UI consistency.
* ❌ **DON'T**: Re-introduce solid 95% scrim masks that hide background leaf imagery.
* ❌ **DON'T**: Auto-commit or push Git changes without explicit user permission.
* ❌ **DON'T**: Mix font families or use random inline color hex codes outside the design tokens.
