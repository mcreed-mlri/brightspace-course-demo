# Handoff: LACE Course Wrapper — "Studio" build

## Overview
This package restyles the **Brightspace-hosted course experience** so it reads as one
continuous product with the **LACE Discovery Hub** (the "A2 / Studio + rail" direction
that is already implemented). When a learner clicks a course in the hub today, Brightspace
takes over — its heavy header and fixed left menu starve the content and look nothing like
the hub. This wrapper replaces Brightspace's chrome with the hub's own visual language
(Geist type, cool-gray surfaces, one brand blue, hairline structure) and a lighter, content-first
navigation. The goal is **zero whiplash** crossing from hub → course.

## About the Design Files — READ FIRST
**Unlike a typical design handoff, these are NOT throwaway HTML mockups to rebuild in React.**
The Brightspace course package is plain **HTML + vanilla CSS + vanilla JS** (no build step, no
framework — D2L serves static files). The files in this bundle are therefore **production-grade
drop-ins**, already written in the same vanilla stack the course uses.

The task is **integration, not re-implementation**:
1. Replace the existing `course-style.css` and `course-nav.js` in the course package with the
   versions here.
2. Add `complete.html`.
3. Make the two small `course-config.js` additions (`chromeMode`, `completeUrl`).
4. Flip `deployMode` back to `"lms"` and verify against the real Brightspace content URLs.

Do **not** port this to React/Vue/etc. — it lives inside Brightspace's static content viewer.
The one place a framework IS in play is the **Discovery Hub** (Next.js/React): this wrapper must
stay in **token parity** with the hub's Studio direction. The exact token values are listed under
**Design Tokens** below; if the hub's tokens change, mirror them here.

## Fidelity
**High-fidelity, production-ready.** Final colors, type, spacing, interactions, and responsive
behavior are all implemented. Match exactly; the only intended variation is the `chromeMode`
choice (see **Chrome modes**).

---

## Architecture (how the wrapper works)
Every course page (`Home.html`, `Modules.html`, each topic page) is a thin HTML shell that:
- links **`course-style.css`** (the entire design system),
- loads **`course-config.js`** (the single source of truth: course title, modules, topics, URLs),
- sets `<html data-topic="…">` from config before paint (prevents an accent-color flash),
- loads **`course-nav.js`** (injects chrome, drawer/rail, progress, interactions),
- contains a `<div id="lace-nav-container"></div>` where the chrome mounts, and a
  `<meta name="course-slug" content="…">` that identifies the page.

Because the pages inflate from config and share a fixed class vocabulary, **restyling
`course-style.css` re-skins the whole course** — no per-page HTML edits. Keep that contract:
new topics are new HTML files using the same classes + a config entry.

### Progress engine
`course-nav.js` mirrors Brightspace "Automatic: Visited" completion in `localStorage` under
`lace_progress_<courseId>` → `{ userName, completed:[slug], lastVisited }`. The hub reads the
same key to show resume/percentage (shared-origin localStorage). Visiting a topic marks its
slug complete; `complete.html` marks every slug complete.

### deployMode
`course-config.js` carries two URL fields per topic — `file` (local filename) and `url`
(the Brightspace content URL). `deployMode: "local"` uses `file` (for click-through testing);
`deployMode: "lms"` uses `url`. **Ship with `"lms"`.** `courseHomeUrl` and `completeUrl` follow
the same idea (local demo values; production swaps to Brightspace URLs — noted inline in config).

---

## Chrome modes (the one design decision to make)
Set `COURSE_CONFIG.chromeMode`. A `?chrome=` URL param overrides it (used only by the preview).

- **`"bar"` — slim top bar + slide-out drawer (DEFAULT, recommended).**
  A 58px sticky bar: drawer toggle (☰) + LACE wordmark + breadcrumb on the left; Read·Practice
  toggle + Previous + primary Next on the right. The full outline lives in a left-edge drawer
  summoned by ☰. **Maximizes reading width** — the answer to "no room for content."
- **`"rail"` — the hub's left rail, carried into the course.**
  A 264px fixed left rail: wordmark, back-to-hub, course title + progress, the full topic list,
  Read·Practice + prev/next at the foot, and a Collapse button that shrinks it to a **72px icon
  strip** (`data-rail="min"`). Strongest continuity. The top bar is hidden in this mode.
  On screens ≤860px the rail auto-falls back to the bar.

---

## Screens / Views

### 1. Course outline — `Home.html`  (slug `home`, not a tracked topic)
- **Purpose:** course landing; resume or jump to any topic.
- **Layout:** single column, `.page-body` max-width **760px**, padding `46px 28px 72px`, centered
  on `--bg` canvas. Order: eyebrow → `.display` title → lead → Continue card → "Course outline"
  section (rows) → footer microcopy.
- **Continue card** (`.continue-card`, light surface): `background:#fff`, `1px solid --hair`,
  radius 16px, `--shadow-card`, padding `22px 24px`, flex row gap 18px, hover lifts `-1px`.
  Left: 56px **progress ring** (`#continue-ring-arc` stroke `--brand-fill`; turns `--status-progress`
  green when complete). Middle (stacked, all `display:block`): kicker (mono 10.5px, `--brand`,
  "BEGIN · TOPIC 1 OF 5"), title (Geist 700, 20px, `-0.02em`), sub (13px `--muted`). Right:
  `.continue-go` pill button — `--brand-fill` fill, white, radius 12px, 44px tall.
- **Outline rows** (`.outline-row`): grid `28px 1fr auto auto`, padding `15px 18px`, radius 12px,
  `#fff` + `--hair` border + **3px left status rail**, `--shadow-card`. Left rail color by status:
  done `--status-done`, active `--brand-fill` (+ light brand-tint fill), next `--status-next`,
  later `--hair-strong`. Status node (24px circle): done = green check, active = blue number,
  else outlined number. Title Geist 650 16.5px; meta = kind-tag chip + minutes + optional change
  pill; right status label (mono) + chevron. Hover lifts `-1px`.

### 2. Module map — `Modules.html`  (slug `modules`)
- Alternate visual entry: `.module-hero` (title + stats panel), `.module-grid` (2-col cards with
  3px `--accent` left border), a `.next-up-card`. Same tokens as above.

### 3. Topic page — `topic-template.html` + `clock-starts.html`, `notice-types.html`,
   `drafting-answer.html`, `housing-court.html`
- **Purpose:** the committed editorial template — **5 sections, always in order:** Scenario →
  Rule → What changed → Try it → Remember. (Not every topic uses all five.)
- **Layout:** `.topic-body` max-width **720px**. Header: eyebrow, `.topic-title` (Geist 720, 44px),
  italic-weight standfirst, a thin course-progress bar.
- **Section** (`.section`, margin-top 46px): `.section-rule` = mono number (`--brand`; `--status-changed`
  if `.rust`) + hairline + mono label.
- **Content blocks:** `.prose` (18px/1.65), `.rule-box` (white card), `.changed-box` (rust-soft bg,
  4px `--status-changed` left border — the ONLY rust block), `.tryit-box` (the climax), `.checklist`,
  `.compact-grid`, `.timeline-list`, `.callout` (brand-tint; `.callout-sage` green / `.callout-rust`),
  `.remember-box` (3px `--brand-fill` left border, Geist 500 list), `.next-up-card`.
- **Try-it interaction:** click an option → it turns green (`.correct`) or red (`.wrong`), the correct
  one is also revealed, a "You" tag is appended, and `.answer-banner` un-hides.

### 4. Completion — `complete.html`  (slug `complete`)
- **Purpose:** the "you earned it" terminal moment after the last topic.
- **Layout:** centered, max-width 640px. Own minimal top bar (wordmark + breadcrumb; no prev/next).
  92px rounded **green check badge** (`badgePop` spring animation) → mono eyebrow → Geist 720 40px
  title ("You finished <course>.") → sub → 3 stat tiles (topics / minutes / streak) → actions
  (primary "Back to Hub" `--brand-fill`, ghost "Review the course"). Writes all slugs complete to
  localStorage so the hub reads 100%.

### 5. Showcase — `wrapper-preview.html` (NOT shipped to Brightspace)
- A standalone demo page: the **handoff** animation (hub card → loading bridge on the same bg →
  course iframe appears), live thumbnails of the three chrome modes, and the deploy steps. Reference
  only — useful for stakeholder review; do not upload to the course package.

---

## Interactions & Behavior
- **Chrome (bar):** `position:sticky; top:0`, 58px, `backdrop-filter: blur(12px)`, hairline bottom.
- **Outline drawer:** slides from left (`translateX(-104%)`→0, 260ms `cubic-bezier(.16,1,.3,1)`),
  scrim fade 220ms; closes on scrim click, ✕, or Esc.
- **Rail collapse:** width `264px↔72px`, 220ms `cubic-bezier(.4,0,.2,1)`; `.page` padding-left tracks it.
- **Read · Practice toggle** (topic pages): persists to `localStorage` `lace_mode_<courseId>`
  (default `"read"`). **Practice** mode relocates the topic's `.section`s into a single `.step-card`
  and paginates them one at a time with a segmented progress bar and Back/Continue; the last step's
  button becomes a green "Finish topic" that navigates to the next topic (or `completeUrl`).
- **Handoff (preview only):** hub card fades (350ms) → loading bridge (`.bridge`, spinning brand-blue
  ring, course title) → iframe boots → reveals after load with a ~500ms floor + 2.2s safety.
- **Reduced motion:** `@media (prefers-reduced-motion: reduce)` disables all transitions/animations.
- **Never use `scrollIntoView`** (it breaks the embedded D2L viewport) — already respected.

## State Management
- `localStorage` `lace_progress_<courseId>` = `{ userName, completed:[slug], lastVisited }` — shared
  with the hub.
- `localStorage` `lace_mode_<courseId>` = `"read" | "practice"`.
- Runtime: chrome mode (`<html data-chrome>`), rail collapsed (`<html data-rail="min">`),
  reading mode (`<html data-mode>`), topic accent (`<html data-topic>`).

## Design Tokens  (exact — keep in parity with the A2/Studio hub)
**Neutrals:** bg `#f5f6f8` · paper/surface `#ffffff` · sunken/warm `#eef0f4` · hover ivory `#f4f6f9` ·
chrome bg `rgba(255,255,255,.82)`.
**Text:** ink `#14161b` · ink-soft `#24272e` · muted `#565c69` · muted-soft `#8b909d`.
**Hairlines:** hair `#e4e7ed` · hair-strong `#d4d8e0`.
**Brand (primary actions + "you are here"):** brand `#1c3fb0` · brand-fill `#2a5bff` · brand-tint `#eaf0ff`.
**Status:** progress/done-green `#179a72` (soft `#e2f4ed`) · next `#2a5bff` (soft `#eaf0ff`) ·
done-slate `#64748b` (soft `#eef0f4`) · new `#c8791b` (soft `#fbf0dc`) · updated `#3a8ec9`
(soft `#e7f3fb`) · changed/rust `#c8493b` (soft `#fbe9e6`) · later `#8b909d`.
**Topic accents (8-hue, set via `data-topic`):** court `#bb573b` · client `#179a72` · ethics `#5563d6` ·
research `#3a8ec9` · drafting `#7a4fe0` · trauma `#d24d83` · foundations `#c8791b` (each has
`-soft`/`-ink` variants — see `:root` in `course-style.css`). This course uses `court`.
**Type:** UI/display = **Geist** (display weight **720**, tracking `-0.035em`); mono = **IBM Plex Mono**
(eyebrows/labels, letter-spacing ~`0.08em`, uppercase). Loaded via Google Fonts `@import`.
**Radii:** card 14px · control 10px · pills 6–7px · big buttons 11–12px.
**Shadow (one tier):** card `0 1px 2px rgba(20,22,27,.04), 0 4px 12px rgba(20,22,27,.05)`;
soft (hover) `0 1px 2px rgba(20,22,27,.04), 0 6px 18px rgba(20,22,27,.06)`.
**Layout widths:** outline body 760px · topic body 720px · rail 264/72px · chrome bar 58px.
**Breakpoints:** ≤860px rail→bar; ≤720px mobile (single column, crumbs collapse to current page,
prev label + next hint + mode labels hide).

## Assets
None external. Icons are inline SVG (1.7px stroke, `currentColor`); the LACE wordmark mark is an inline
SVG scales/quill glyph on an ink square. Fonts via Google Fonts. No images.

## Files (in this bundle)
**Ship to Brightspace:**
- `course-style.css` — the full Studio design system (replace existing).
- `course-nav.js` — chrome/rail, drawer, Read·Practice, step pager, progress engine (replace existing).
- `course-config.js` — content + `chromeMode`/`completeUrl` (merge the two additions; set `deployMode:"lms"`).
- `complete.html` — completion screen (new).
- `Home.html`, `Modules.html`, `clock-starts.html`, `notice-types.html`, `topic-template.html`
  (= service-of-process), `drafting-answer.html`, `housing-court.html` — page shells, **unchanged**;
  included so the developer can run the package locally.

**Reference only (do NOT upload):**
- `wrapper-preview.html` — the stakeholder showcase / handoff demo.

## Acceptance checklist
- [ ] Hub → course shows no font/color/background change (token parity holds).
- [ ] `chromeMode` chosen; `"bar"` reclaims content width vs. the old Brightspace chrome.
- [ ] Drawer (bar) / rail collapse (rail) work; Esc closes the drawer.
- [ ] Read·Practice toggle persists and paginates topic sections.
- [ ] Try-it self-check reveals the answer; progress writes to the shared localStorage key.
- [ ] `complete.html` reached from the last topic; hub then reads 100%.
- [ ] `deployMode:"lms"`, all Brightspace URLs verified, mobile (≤720px) checked.
