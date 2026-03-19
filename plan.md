# geralddagher-site Migration Plan

Last updated: 2026-03-09

## Objective
Complete the Tailwind v4 + design-token normalization + accessibility hardening + icon migration plan with build-safe incremental phases.

## Status

### ✅ Completed
- **Phase 0**: Tailwind v3 → v4 migration
  - `tailwind.config.mjs` removed
  - Tailwind config moved to `app/globals.css`
  - `@tailwindcss/postcss` configured in `postcss.config.mjs`
- **Phase 1**: Foundation cleanup
  - Removed Oswald usage
  - Removed Radix Themes layer usage
  - Removed dead dependencies from package manifest
  - Normalized global tokens and keyframes in `app/globals.css`
- **Phase 2**: Accessibility foundation
  - Restored global visible focus ring behavior
  - Added skip-link and `main-content` landmark flow
  - Normalized background token usage (`bg-background`)
- **Phase 3**: FontAwesome → Lucide + brand SVG migration
  - Added brand icon set in `components/core/icons/BrandIcons.tsx`
  - Removed FontAwesome packages from `package.json`
- **Phase 4A–4D**
  - Navbar token/a11y updates
  - Footer token normalization
  - `Modal.tsx` moved to Radix Dialog pattern
  - `SubscriptionModal.tsx` updated to Radix + tokenized styles
- **Phase 4E**
  - `components/about/About.tsx` split into:
    - `aboutTypes.ts`
    - `StatCards.tsx`
    - `JourneyCards.tsx`
    - `SkillCloud.tsx`
    - `ProfessionalDrawer.tsx`
    - `PersonalDrawer.tsx`
- **Phase 4F**
  - `components/Timeline.tsx` token and a11y normalization
- **Phase 4G**
  - `components/posts/PostCard.tsx` and `components/posts/BlogWrapper.tsx` token normalization
- **Phase 4H–4J**
  - `app/blog/page.tsx`
  - `app/blog/[slug]/page.tsx`
  - `app/login/page.tsx`
  - token and a11y fixes applied

### ⏳ Remaining
- **Phase 4K**: TMP component token/a11y finish pass (if any residuals remain after QA)
- **Phase 5**: Shared primitives + spacing pass
  - SectionHeader / GlassCard introduction where needed
  - final consistency sweep for spacing and token usage

## Validation Command
```bash
pnpm build
```

## Notes for Multi-Agent Coordination
- Use **pnpm** only.
- Preserve semantic tokens (`bg-background`, `text-foreground`, `bg-card`, `bg-muted`) over hardcoded light/dark pairs.
- Prefer `focus-visible:*` ring classes and keep keyboard a11y intact.
- Keep hero visuals untouched unless explicitly scoped.
