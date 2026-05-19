# LACE + Brightspace Architecture Plan

Planning document for the MLRI learning experience: **LACE Learning Hub** (custom frontend) + **Brightspace** (LMS backend) + **in-course HTML wrappers** (calm navigation inside BS).

Related repos:

- [lms-discovery](https://github.com/mcreed-mlri/lms-discovery) — LACE Learning Hub (Next.js)
- `Brightspace-Courses/` — HTML wrapper and topic pages (this repo)

---

## Vision

Learners get a modern, low-clutter experience. Brightspace stays the **system of record** for courses, users, enrollments, permissions, progress, and completions. LACE solves the UX gap: discovery, search, pathways, and navigation.

**Core insight:** Opening Brightspace content in a new tab with `?d2l_body_type=3` removes the sidebar and nav chrome. We build our own wrapper navigation on top of that.

---

## Three-Layer Architecture

```text
┌─────────────────────────────────────────────────────────────┐
│  Layer 1: LACE Learning Hub (Next.js)                       │
│  Discovery, search, paths, login, progress display          │
│  Repo: lms-discovery                                        │
└──────────────────────────┬──────────────────────────────────┘
                           │ deep links + OAuth/API
                           ▼
┌─────────────────────────────────────────────────────────────┐
│  Layer 2: In-Course HTML Wrappers (Brightspace-Courses)     │
│  Course Wrapper.html, Accordion.html, Tabs.html, etc.       │
│  Clean nav, dropdown menu, prev/next                        │
└──────────────────────────┬──────────────────────────────────┘
                           │ hosted as BS content topics
                           ▼
┌─────────────────────────────────────────────────────────────┐
│  Layer 3: Brightspace LMS                                   │
│  Hosting, enrollments, roles, completion tracking, reports  │
└─────────────────────────────────────────────────────────────┘
```

### Responsibility Matrix

| Need | Owner | Notes |
| --- | --- | --- |
| Course hosting | Brightspace | Official LMS |
| Users, roles, permissions | Brightspace | LACE reads; does not duplicate |
| Enrollments | Brightspace | LACE filters catalog by enrollment |
| Progress & completions | Brightspace | LACE displays via API |
| Discovery & search | LACE | Courses, modules, topics, paths |
| Curated pathways | LACE | MLRI-specific metadata |
| Tags & practice areas | LACE | Outside BS metadata |
| In-course navigation | HTML wrappers | Replaces BS module tree for learners |
| Content authoring | Brightspace | Instructors upload/edit HTML in BS |

---

## What Students See in Brightspace

Brightspace becomes the **engine room**, not the **living room**.

| In Brightspace | Student sees | Purpose |
| --- | --- | --- |
| One web link / entry topic | **"Open course"** or similar | Launch pad into wrapper |
| HTML wrapper + topic pages | Nothing in BS tree (hidden or collapsed) | Reached via wrapper links |
| Native module sidebar | Hidden / ignored | Replaced by LACE + wrapper nav |
| Enrollments, completion | Invisible | Tracked automatically |

### Brightspace Content Setup (per course)

1. Upload HTML files to course files (`Course Wrapper.html`, topic pages).
2. Create Content topics for each page (for completion tracking).
3. Set completion criteria on each topic (visit, manual, etc.).
4. **Hide** most topics from the table of contents (or keep collapsed).
5. Expose **one student-facing web link** → `Course Wrapper.html?ou={orgUnitId}&d2l_body_type=3`.

Instructors/admins still use Brightspace to manage content, enrollments, and reports.

---

## Clean View URL Pattern

Append these query params to strip Brightspace chrome:

```text
?ou={orgUnitId}&d2l_body_type=3
```

**HTML file topics:**

```text
https://mlri.brightspace.com/content/enforced/{coursePath}/Accordion.html?ou=6698&d2l_body_type=3
```

**Native BS topic URLs:**

```text
https://mlri.brightspace.com/d2l/le/lessons/6698/topics/2851?d2l_body_type=3
```

Test whether `d2l_body_type=3` works consistently for both file URLs and topic URLs.

---

## Demo Course: URL Map

**Course:** Using Interactive Elements in Brightspace  
**Org unit ID:** `6698`  
**Base path:** `6698-demo.instructor_mc`

### Entry point

- **Course Wrapper:** `Course Wrapper.html?ou=6698&d2l_body_type=3`

### Start here

- **Lesson overview:** `Using Interactive Elements.html?ou=6698&d2l_body_type=3`

### Module 1 — Static Layouts

| Topic | URL |
| --- | --- |
| Accordion | `Accordion.html?ou=6698&d2l_body_type=3` |
| Tabs | `Tabs.html?ou=6698&d2l_body_type=3` |
| Callouts | `Callouts.html?ou=6698&d2l_body_type=3` |
| Stylized Quotes | `Stylized%20Quotes.html?ou=6698&d2l_body_type=3` |

### Module 2 — Interactive Self Checks

| Topic | URL |
| --- | --- |
| Sorting Gallery | `Sorting%20Gallery.html?ou=6698&d2l_body_type=3` |
| Sequencing | `Sequencing.html?ou=6698&d2l_body_type=3` |
| Flip Cards | `Flip%20Cards.html?ou=6698&d2l_body_type=3` |
| Fill in the Blanks | `/d2l/le/lessons/6698/topics/2851?d2l_body_type=3` |

### Module 3 — Insert Media (TBD)

- Image Hotspots — not built yet
- Integrated Video — not built yet

Full base URL prefix:

```text
https://mlri.brightspace.com/content/enforced/6698-demo.instructor_mc/
```

---

## HTML Wrapper Pages (This Repo)

### Built so far

| File | Status | Notes |
| --- | --- | --- |
| `Course Wrapper.html` | Done | LACE-themed course home, collapsible modules |
| `Accordion.html` | Done | LACE theme + dropdown Course Menu + prev/next |
| `Tabs.html` | Raw BS template | Needs LACE theme + nav |
| `Callouts.html` | Raw BS template | Needs LACE theme + nav |
| Other topic pages | Raw BS template | Needs LACE theme + nav |

### Wrapper design tokens (from lms-discovery)

| Token | Value |
| --- | --- |
| Background | `#f5efe4` |
| Paper / surface | `#fffcf4` |
| Ink | `#1f1d19` |
| Muted | `#706a5f` |
| Gold accent | `#b88a2d` |
| Sage accent | `#6f927b` |
| Rust accent | `#b76545` |
| Font | Lato |

### Navigation pattern (topic pages)

Each topic page should include:

- **Course Menu** — dropdown with all modules/topics (no need to return to wrapper)
- **Previous / Next** — linear navigation
- **LACE styling** — cream background, editorial cards, gold accents

Do **not** include `styles.min.css` on wrapper-only pages (causes layout conflicts). Topic pages with BS interactive elements (accordion, tabs) still need `scripts.min.js` + `styles.min.css` for those components to work.

### Copy-paste workflow

1. Build/edit HTML locally in this repo.
2. Copy full HTML into Brightspace (or upload file to course files).
3. Test with clean-view URL.

### Future: generate pages from one source

Avoid duplicating the dropdown menu across every file. Options:

- Build script that injects nav + theme into each topic from a shared template
- Store course structure in JSON; generate all HTML files

---

## Student Journeys

### Journey A — LACE as front door (target)

1. Student visits **LACE Learning Hub**
2. Logs in once (SSO or Brightspace OAuth)
3. Browses catalog, sees progress, clicks **Resume**
4. Deep-links to BS clean view → **Course Wrapper** or topic page
5. Uses wrapper dropdown to move between topics
6. BS tracks completion; LACE reflects it on next visit

### Journey B — Brightspace as front door (MVP fallback)

1. Student opens course in Brightspace
2. Sees **one web link**: "Start course"
3. Link opens **Course Wrapper** in clean view
4. Wrapper handles all in-course navigation

---

## Authentication & Permissions

**Login through LACE. Permissions from Brightspace.**

| Concern | Where it lives | LACE's role |
| --- | --- | --- |
| Identity | SSO or BS OAuth | Login UI, session |
| Course access | BS enrollments | Fetch via API; filter catalog |
| Topic access | BS (on launch) | Deep-link; BS enforces |
| Roles | BS | Read role; hide admin features |
| Progress | BS | Read via API; display |

LACE **cannot grant access Brightspace denies**. If a user isn't enrolled, the BS link still blocks them.

### Auth implementation paths

| Path | Best for | Notes |
| --- | --- | --- |
| **SSO (SAML/OIDC)** | Production | LACE + BS trust same IdP; one login |
| **Brightspace OAuth** | MVP | "Sign in with Brightspace" on LACE |
| **Demo auth** | Now | Fake user in lms-discovery; no real permissions |

### What to avoid

- Separate LACE username/password with no BS tie-in → double login, wrong permissions
- Maintaining a duplicate user database long-term

---

## Progress Tracking

### Source of truth

**Brightspace always owns completion data.** LACE reads it; wrappers optionally display it.

### Can static HTML wrappers read BS completion directly?

**No — not reliably.**

The sidebar checkmarks in native BS UI are internal. Static HTML pages do not get completion data injected. The Valence API requires OAuth tokens; arbitrary uploaded HTML cannot call it cleanly from the browser.

**Completion still works:** when a learner visits a topic page, BS marks it complete (if criteria are set). The wrapper just can't *see* it without a backend bridge.

### Progress display tiers

| Tier | Where | Effort | When |
| --- | --- | --- | --- |
| **1** | BS tracks silently; wrapper has no checkmarks | None | Now |
| **2** | LACE Hub shows progress (continue learning, stats) | Medium | Phase 2–3 |
| **3** | Wrapper dropdown shows ✓ via LACE API | Low add-on | After tier 2 |

### BS → LACE → BS loop (for wrapper checkmarks)

```text
Brightspace (tracks completion)
    ↓ API sync
LACE backend (maps topic IDs, caches progress)
    ↓ JSON API
Wrapper HTML (renders checkmarks in dropdown)
    ↓ learner clicks topic
Brightspace (serves content, records visit)
```

This is **not crazy** — it's a standard companion-app pattern. LACE is the translation layer.

### Brightspace APIs for progress

| Endpoint | Purpose |
| --- | --- |
| `GET .../content/userprogress/` | User progress through course content |
| `GET .../content/topics/{topicId}/completions/users/{userId}` | Single topic completion |
| `GET .../content/completions/mycount/` | Aggregate completion count |
| `GET .../content/myItems/completions/` | User's completed items |

Docs: [Brightspace Content API](https://docs.valence.desire2learn.com/res/content.html)

Also useful:

- [Courses API](https://docs.valence.desire2learn.com/res/course.html) — course metadata
- [Enrollments API](https://docs.valence.desire2learn.com/res/enroll.html) — who is enrolled

### Topic ID mapping (required for API)

Completion is keyed to **topic IDs**, not filenames.

```json
{
  "courseId": 6698,
  "topics": [
    { "slug": "accordion", "topicId": null, "url": ".../Accordion.html?ou=6698&d2l_body_type=3" },
    { "slug": "fill-in-blanks", "topicId": 2851, "url": ".../topics/2851?d2l_body_type=3" }
  ]
}
```

Sync topic IDs from Content API in Phase 2. Fill in `topicId: null` entries once mapped.

### LACE progress API (future)

Example response for wrapper or Hub:

```json
GET /api/courses/6698/progress

{
  "courseId": 6698,
  "completedCount": 4,
  "totalCount": 9,
  "modules": [
    {
      "id": "module-1",
      "title": "Static Layouts",
      "completed": 2,
      "total": 4,
      "topics": [
        { "slug": "accordion", "title": "Accordion", "completed": true },
        { "slug": "tabs", "title": "Tabs", "completed": true }
      ]
    }
  ]
}
```

### Wrapper progress auth (when ready)

**Option A — Launch token from Hub (simplest)**

Hub appends short-lived JWT to launch URLs:

```text
Accordion.html?ou=6698&d2l_body_type=3&lace_token=eyJ...
```

Wrapper JS reads token, calls LACE API.

**Option B — Shared SSO session**

```javascript
fetch('https://lace.mlri.org/api/progress/6698', { credentials: 'include' })
```

**Option C — OAuth on first visit**

Fallback for users who bookmark BS pages directly.

---

## Phased Implementation Plan

### Phase 1 — Prove the UX (current)

- [x] Course Wrapper with LACE theme
- [x] Accordion page with LACE theme + dropdown nav
- [ ] Theme remaining topic pages (Tabs, Callouts, etc.)
- [ ] Configure demo course: one visible web link for students
- [ ] Set completion criteria on all topics
- [ ] Validate clean-view URLs work for all pages
- [ ] User testing: "Does this feel less overwhelming?"

**No API dependency.** Manual URL map in `sample-course-info.md`.

### Phase 2 — Wire up Brightspace

- [ ] Register OAuth application in Brightspace
- [ ] Implement "Sign in with Brightspace" on LACE
- [ ] Sync course/module/topic structure via Content API
- [ ] Map topic IDs to HTML filenames
- [ ] Replace hardcoded URLs in Hub and wrappers with synced data
- [ ] Filter Hub catalog by user enrollments

### Phase 3 — Real progress

- [ ] Pull completion data per user from BS API
- [ ] Power Hub: continue learning, `1/3 courses`, `4/9 modules`
- [ ] Mark items complete/in-progress on Hub cards
- [ ] Optional: wrapper dropdown checkmarks via LACE API + launch token

### Phase 4 — Production integration

- [ ] Deploy LACE Hub (GitHub Pages or proper hosting)
- [ ] SSO with org IdP (if available)
- [ ] Brightspace navbar link → LACE as front door
- [ ] Build script to generate wrapper HTML from content index
- [ ] Pathway-level reporting across courses
- [ ] Confirm support boundaries with D2L

---

## Content Index Schema (future)

Single source of truth for Hub + wrapper generation:

```typescript
{
  id: "interactive-elements",
  title: "Using Interactive Elements in Brightspace",
  type: "COURSE",
  brightspaceOrgUnitId: 6698,
  launchUrl: ".../Course Wrapper.html?ou=6698&d2l_body_type=3",
  modules: [
    {
      id: "module-1",
      title: "Static Layouts",
      accent: "gold",
      topics: [
        {
          slug: "accordion",
          title: "Accordion",
          topicId: null,  // from BS Content API
          url: ".../Accordion.html?ou=6698&d2l_body_type=3",
          prev: "lesson-overview",
          next: "tabs"
        }
      ]
    }
  ]
}
```

---

## Open Questions for D2L / Brightspace Admin

Prioritize these before Phase 2:

### API access

- [ ] Can our instance expose course metadata through the Courses API?
- [ ] Can we retrieve module/topic structures through the Content API?
- [ ] Can we retrieve user enrollments and progress/completion data?
- [ ] What OAuth scopes and role permissions are required?
- [ ] Rate limits or paging constraints?

### Deep linking

- [ ] Stable learner links to specific topics with completion tracking enforced?
- [ ] Does `d2l_body_type=3` work for all topic types?
- [ ] Can Content API return the learner-facing URL for each topic?

### Authentication

- [ ] Recommended auth pattern for a companion app?
- [ ] Can users move Hub → BS without signing in again?
- [ ] SSO available (Azure AD, Okta, etc.)?

### Integration pattern

- [ ] Separate portal vs navbar link vs LTI vs homepage widget?
- [ ] Support boundaries for custom discovery layer?

Full question list: [lms-discovery/planning/questions-for-d2l.md](https://github.com/mcreed-mlri/lms-discovery/blob/main/planning/questions-for-d2l.md)

---

## Risks & Mitigations

| Risk | Mitigation |
| --- | --- |
| Custom layer gets too complex | Keep Phase 1 thin: discovery + links only |
| BS API permissions limited | Validate access early with admin |
| Metadata goes stale | Content index + sync job; one owner |
| Users confused between systems | LACE = find stuff; BS = delivers it (mostly invisible) |
| HTML menu duplicated across pages | Build script / shared template (Phase 4) |
| Double login | SSO or BS OAuth from day one of Phase 2 |
| Progress not visible in wrapper | Expected in Phase 1; Hub is primary progress UI |

---

## Key Decisions

| Decision | Recommendation | Status |
| --- | --- | --- |
| Front door | LACE Hub | Target |
| BS role for learners | One web link + invisible tracking | Planned |
| Wrapper role | In-course navigation only | Built |
| Progress UI primary location | LACE Hub | Planned |
| Progress in wrapper | Optional Phase 3 via LACE API | Deferred |
| Auth | SSO or BS OAuth | Not started |
| HTML maintenance | Manual copy-paste for now; generate later | Current |

---

## Next Steps (Immediate)

1. **Finish theming** remaining topic pages using `Accordion.html` as template.
2. **Configure demo course** in BS: hide module tree, one student-facing launch link.
3. **Set completion criteria** on all HTML topics; verify tracking works.
4. **Schedule BS admin conversation** — OAuth app + API scopes (use questions list above).
5. **Register OAuth app** and add real auth to lms-discovery.
6. **Build content index** — topic IDs + URLs for course 6698.

---

## Reference Links

- [lms-discovery repo](https://github.com/mcreed-mlri/lms-discovery)
- [Brightspace Content API](https://docs.valence.desire2learn.com/res/content.html)
- [Brightspace Courses API](https://docs.valence.desire2learn.com/res/course.html)
- [Brightspace Enrollments API](https://docs.valence.desire2learn.com/res/enroll.html)
- [Integrating with the Brightspace UI](https://docs.valence.desire2learn.com/basic/ui-ext.html)
- [D2L: About Discover](https://community.d2l.com/brightspace/kb/articles/4309-about-discover)

---

*Last updated: May 2026 — living document; update as phases complete.*
