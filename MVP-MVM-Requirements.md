# MVP / MVM Requirements

Grounding document: what **must** happen for the Brightspace wrapper and LACE vision to work — and what does not.

Related docs:

- [LACE-Brightspace-Plan.md](./LACE-Brightspace-Plan.md) — full architecture and phased plan
- [sample-course-info.md](./sample-course-info.md) — demo course URLs

---

## Two different goals (do not conflate)

| | **Wrapper prototype** | **Full LACE vision** |
| --- | --- | --- |
| Goal | Calm in-course pages inside Brightspace | LACE as front door; BS as engine room |
| Works without API? | **Yes** | **No** |
| Progress checkmarks | Mock (`MOCK_PROGRESS`) | Real (BS API + LACE backend) |
| Who can see it | Anyone with URL / enrolled in course | Correct users, correct courses only |

**Looking amazing in demo ≠ production-ready.**

---

## Tier 1 — Wrapper works at all (no API)

**Status:** In progress (Course Wrapper, Accordion, Tabs built)

These are the bare minimum. No LACE backend, no OAuth, no magic.

| # | Requirement | Notes |
| --- | --- | --- |
| 1 | HTML files live in Brightspace | Upload to course files or paste into Content topics |
| 2 | Clean-view URL params | `?ou={orgUnitId}&d2l_body_type=3` |
| 3 | Each page is a Content topic | Enables completion tracking when configured |
| 4 | You maintain HTML & URLs | BS will not auto-sync wrapper when topics change |
| 5 | One entry link for learners | Web link → `Course Wrapper.html` is enough |

### If you stop here

You still win: less clutter, custom nav, LACE-styled pages. No real progress, no LACE login — just better HTML inside Brightspace.

### Tier 1 checklist

- [ ] Upload wrapper + topic pages to demo course (6698)
- [ ] Verify all clean-view URLs open without BS chrome
- [ ] Create Content topic per HTML page
- [ ] Set completion criteria on each topic (visit or manual)
- [ ] Hide native Content TOC; expose one "Start course" web link
- [ ] Finish theming remaining topic pages (Callouts, etc.)

---

## Tier 2 — Real progress (not mock Sarah)

Mock data is paint. Real progress requires all of the following.

| # | Requirement | Why |
| --- | --- | --- |
| 1 | **Brightspace OAuth app** | Registered by admin with content/enrollment/completion scopes |
| 2 | **API access confirmed** | Admin or D2L confirms: enrollments, topic tree, user completions |
| 3 | **Topic ID mapping** | Completion keyed to BS topic IDs, not filenames (`Accordion.html` → `2847`) |
| 4 | **LACE backend** | Calls BS APIs; returns JSON. Static HTML cannot read BS completion reliably |
| 5 | **Shared user identity** | Viewer of wrapper = user BS knows, or progress is wrong/empty |

### Without all five

Keep `MOCK_PROGRESS`, or show progress only in LACE Hub after the API exists — not in the wrapper.

### Tier 2 checklist

- [ ] Register OAuth application in Brightspace
- [ ] Confirm scopes: enrollments, content structure, user progress/completions
- [ ] Build topic map for course 6698 (slug → topicId → URL)
- [ ] LACE endpoint: `GET /api/courses/6698/progress`
- [ ] Replace `MOCK_PROGRESS` with `fetch()` in wrapper + topic pages
- [ ] Test with 2–3 real users enrolled in demo course

---

## Tier 3 — LACE as front door + login

Full architecture from [LACE-Brightspace-Plan.md](./LACE-Brightspace-Plan.md).

| # | Requirement | Why |
| --- | --- | --- |
| 1 | **Authentication** | SSO (best) or Brightspace OAuth. Separate LACE-only passwords fail long term |
| 2 | **Enrollment sync** | LACE filters catalog; BS still enforces on launch |
| 3 | **Stable deep links** | Hub → BS clean view → wrapper; plan for course copies / topic moves |
| 4 | **Hosting for LACE** | App server or serverless + DB/cache — not static GitHub Pages alone |
| 5 | **Operational ownership** | Who updates content index, fixes links, owns OAuth app? |

### Without Tier 3

LACE stays a demo catalog. Learners enter via Brightspace and bookmark wrapper URLs.

### Tier 3 checklist

- [ ] Sign in with Brightspace (or org SSO) on lms-discovery
- [ ] Fetch enrollments per user; filter Hub catalog
- [ ] Launch URLs from Hub include clean-view params (optional: short-lived token)
- [ ] Deploy LACE with backend (not Pages-only)
- [ ] Document content update workflow (who, how often)

---

## Tier 4 — "Students only see one web link"

Process and course design — not just code.

| # | Requirement | Why |
| --- | --- | --- |
| 1 | Course design discipline | Hide/collapse native Content TOC |
| 2 | Instructor agreement | Don't rely on BS module tree for learners |
| 3 | Completion rules per topic | Visit/manual/etc., or progress lies |
| 4 | Reporting still in BS | Admins/compliance may need native BS reports |

---

## Minimum Viable Magic (MVM)

**Smallest path that feels real** — not full LACE, but progress stops being fake.

```text
Step 1  Wrapper + topic pages in Brightspace          ← you are here
Step 2  One launch link per course in Content
Step 3  OAuth app + read completions for ONE course
Step 4  LACE backend: GET /api/progress/6698
Step 5  Replace MOCK_PROGRESS with fetch() in HTML
```

### MVM deliverables

| Deliverable | Owner | Done when |
| --- | --- | --- |
| Demo course with wrapper live | You | Learner opens one link, navigates all topics |
| OAuth app + test credentials | BS admin | App can read completions for org unit 6698 |
| Topic ID map (6698) | You + API | Every wrapper slug maps to a BS topicId |
| Progress API (single course) | LACE dev | Returns `{ completed, total, topics[] }` for logged-in user |
| Wrapper JS integration | You | Course Wrapper + 1 topic page use live data |

### MVM explicitly out of scope

- Full Hub catalog / search / paths
- SSO org-wide rollout
- Auto-generated HTML from content index
- Progress on every topic page (wrapper + Hub is enough)
- LTI embedding
- Cross-course pathway reporting

---

## The one conversation that unlocks or kills the roadmap

**Ask your Brightspace admin** (see also [questions-for-d2l.md](https://github.com/mcreed-mlri/lms-discovery/blob/main/planning/questions-for-d2l.md)):

1. Can we register an OAuth app and read **user completion** for content topics?
2. Can we read **enrollments** for the logged-in user?
3. Do we have **SSO** (Azure AD, etc.) LACE can use?

| Answer | What it means |
| --- | --- |
| **Yes to all three** | Full vision is feasible — keep building toward Tier 3 |
| **Wrapper yes, API no** | Tier 1 only; progress stays mock |
| **No OAuth / locked down** | Wrapper UX works; LACE progress/login needs escalation |

---

## What does NOT have to happen

Avoid these traps early:

- Replace Brightspace entirely
- LTI on day one
- Progress inside every topic page (Hub or wrapper is enough)
- Auto-generate HTML for the first demo course
- D2L blessing before prototyping (need answers before production at scale)
- Duplicate user database in LACE
- Wrapper calling Brightspace API directly from browser (use LACE backend)

---

## Decision summary

| Question | Recommendation | Until when |
| --- | --- | --- |
| Can we demo wrapper UX? | **Yes — now** | No blockers |
| Can we ship real progress? | **After OAuth + backend** | Tier 2 |
| Can LACE be the front door? | **After auth + hosting** | Tier 3 |
| Is mock progress OK? | **Yes for demos** | Until MVM step 5 |

---

## Suggested order of operations

1. **This week:** Finish Tier 1 checklist on demo course 6698
2. **Schedule:** 15–30 min with BS admin — three questions above
3. **If API yes:** Build MVM (OAuth → one progress endpoint → swap mock JS)
4. **If API no:** Ship wrapper UX only; revisit Hub progress later
5. **Parallel:** Keep lms-discovery Hub UI on demo data; don't block wrapper work on backend

---

## Quick reference: mock vs real

| Feature | Today (mock) | MVM (real) |
| --- | --- | --- |
| Course Wrapper progress bar | `MOCK_PROGRESS` in HTML | `fetch(LACE /api/progress/6698)` |
| Topic page progress strip | Same mock object | Same API |
| Dropdown checkmarks | JS from mock | JS from API response |
| Continue / Next up | Hardcoded `continueSlug` | API: first incomplete topic |
| User name "Sarah" | Hardcoded | From auth session |

---

*Last updated: May 2026 — update checkboxes as tiers complete.*
