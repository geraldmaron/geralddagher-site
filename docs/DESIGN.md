# Design System — geralddagher.com

## Overview

This document defines the design language for both the public site and the admin interface. All AI-generated code and human contributions must follow these conventions.

---

## Public Site

**Direction:** Editorial / personal — warm, considered, unhurried.

- Typography-forward: large display type, generous line-height
- Parallax hero with clip-text effect (established — do not change)
- Framer Motion stagger animations for page entrances
- Dual CTA pattern in hero section
- Token-based color: CSS variables throughout, no hardcoded hex

---

## Admin Interface

**Direction:** Tool-native / information-dense — compact, fast, professional.

Inspired by Linear, Vercel dashboard, and Raycast. Every pixel of vertical space is earned. The admin exists to *work*, not to impress.

### Core Principle: Compactness

The admin UI must be compact. Padding and spacing should be reduced compared to consumer UI defaults. When in doubt, go tighter.

### Spacing Scale (Admin)

| Token | Value | Use |
|-------|-------|-----|
| Section gap | `space-y-4` | Between page sections |
| Card padding | `p-3` | All admin cards |
| Panel padding | `p-4` | Chart and panel containers |
| Panel header margin | `mb-3` | Between panel header and content |
| Row padding | `px-4 py-2` | Table/list rows |
| Filter row padding | `p-2` or `p-3` | Filter/toolbar containers |
| Input padding | `py-1.5` | Text inputs and selects |
| Action button | `px-3 py-1.5` | Small action buttons |

### Typography (Admin)

| Element | Class |
|---------|-------|
| Page title | `text-sm font-semibold text-gray-100 tracking-tight` |
| Page subtitle | `text-xs text-gray-500` |
| Section header | `text-xs font-medium text-gray-300` |
| Data value (large) | `text-lg font-semibold tabular-nums` |
| Meta / secondary | `text-[11px] text-gray-500` |
| Group label | `text-[10px] font-semibold uppercase tracking-widest text-gray-600` |

### Color (Admin)

Background layers (dark, from deepest to shallowest):

| Layer | Value |
|-------|-------|
| Page background | `bg-[#0a0b0f]` |
| Sidebar | `bg-[#111318]` |
| Card / panel | `bg-white/[0.04]` |
| Hover state | `bg-white/[0.06]` |
| Active / selected | `bg-white/[0.08]` |

Borders: `border-white/[0.06]` (standard), `border-white/[0.08]` (inputs)

Accent: `blue-400` / `blue-500` — nav active states, primary actions only.

Taxonomy accent colors (predefined per entity type):
- Posts → blue
- Assets → violet
- Users → emerald
- Categories → emerald
- Tags → amber
- Submissions → orange

Do **not** introduce additional accent colors beyond this palette.

### Sidebar

- Expanded width: `220px`
- Collapsed width: `64px`
- Nav link height: `py-2 px-3` (compact)
- Group heading: `text-[10px]` uppercase, `mt-3` between groups
- Active indicator: left 2px bar + `bg-blue-500/[0.12]`

### Stat Cards (Dashboard)

- Padding: `p-3`
- Value size: `text-lg` (not `text-xl`)
- Label: `text-[11px]`
- Icon: `h-4 w-4`
- Top accent border: `border-t-2`
- Background: gradient from color/7% to transparent

### Chart Panels

- Outer padding: `p-4`
- Header row margin: `mb-3`
- Chart height: 200px (area), 200px (bar)
- Grid stroke: `rgba(255,255,255,0.04)`
- Axis font: 11px, `#4b5563`

### Quick Actions (Dashboard)

- Height: `py-2 px-3`
- Font: `text-xs font-medium`
- Icons: `h-3.5 w-3.5`

### Taxonomy Cards

- Card padding: `p-3`
- Icon wrapper: `p-1.5 rounded-lg`
- Icon size: `h-3.5 w-3.5`
- Name: `text-sm font-medium`
- Slug: `text-[11px] font-mono text-gray-600`

### Post List Rows

- Row: `px-4 py-2` (not `py-3`)
- Secondary meta: `text-[11px]`

---

## Component Conventions

### Buttons

Three sizes:
- `sm`: `px-2.5 py-1 text-xs`
- `md` (default): `px-3 py-1.5 text-xs font-medium`
- `lg`: `px-4 py-2 text-sm`

### Inputs

- Height: `py-1.5` (compact admin standard)
- Border: `border-white/[0.08]`
- Background: `bg-white/[0.03]` (fields) or `bg-white/[0.04]` (textareas)
- Focus ring: `focus:ring-1 focus:ring-white/10 focus:border-white/20`

### Empty States

- Minimum height: `py-10` (not `py-12` or `py-16`)
- Icon: `h-8 w-8 text-gray-700`
- Title: `text-sm text-gray-400`
- Body: `text-xs text-gray-600`

### Loading Skeletons

- Use `animate-pulse` on `bg-white/[0.06]` placeholders
- Match approximate shape of real content
- Do not use full-page spinners in list views — use inline skeleton rows

---

## Motion

Framer Motion is used for page entrances only. Admin motion budget is minimal:

- Page sections: `initial={{ opacity: 0, y: 6 }}` → `animate={{ opacity: 1, y: 0 }}`
- Stagger delay: `0.03–0.05s` per item, never exceed `0.4s` total
- Hover states: CSS `transition-all duration-150` (not JS-animated)
- Sidebar collapse: `duration: 0.2` ease `[0.4, 0, 0.2, 1]`

---

## Accessibility

- All icon-only buttons must have `aria-label`
- Mobile drawer: `role="dialog" aria-modal="true" aria-label="Navigation"`
- Focus rings: `focus-visible:ring-2 focus-visible:ring-blue-500/50`
- Color is never the sole indicator of state (use text or icon alongside)

---

## Anti-Patterns (Admin)

- No `py-3` or larger on quick action / toolbar buttons
- No `p-5` card padding
- No `space-y-6` between admin sections (use `space-y-4`)
- No `text-xl` for stat values
- No `py-3` on list rows
- No modals for confirmation that can use inline `ConfirmDialog`
- No hardcoded `#000` or `#fff`
- No cyan-on-dark gradient aesthetics — use the established blue accent only
