# Welcome to LACE — onboarding course

The **required first course** every learner takes. It teaches the platform
itself — the short-topic rhythm, the topic structure, the Try-it self-checks, and
how progress/completion is tracked — by *being* a clean example of a LACE course.

Built on the shared **Course-Template** ("LACE Studio") wrapper. The five shared
files (`course-style.css`, `course-nav.js`, `Home.html`, `Modules.html`,
`complete.html`) are copied verbatim and are entirely config-driven; only
`course-config.js` and the five topic pages are course-specific.

- **Accent:** `foundations` (gold/amber `#c8791b`) — set once via `topic` in
  `course-config.js`. Deliberately *not* blue (blue is the hub's reserved brand
  colour) and distinct from the housing/eviction `court` rust.
- **Length:** 5 topics, ~10 minutes total.

## Topics

| # | Slug | File | Title | Kind | Min |
|---|------|------|-------|------|-----|
| 1 | `welcome` | `welcome.html` | Welcome to LACE | Concept | 2 |
| 2 | `anatomy-of-a-topic` | `anatomy-of-a-topic.html` | How a topic works | Concept | 3 |
| 3 | `try-it-checks` | `try-it-checks.html` | The Try-it self-checks | Practice | 2 |
| 4 | `your-progress` | `your-progress.html` | Your progress & completion | Concept | 2 |
| 5 | `getting-help` | `getting-help.html` | Getting help & what's next | Reflection | 1 |

## Live deployment

Deployed to Brightspace at org unit **6706**, Manage Files path
`6706-demo.onboarding_mc`. `course-config.js` is in `deployMode: "lms"` with all
topic URLs filled in. **After editing any file, re-upload it to Manage Files
(overwrite in place).** Front door:
`https://mlri.brightspace.com/content/enforced/6706-demo.onboarding_mc/Home.html?ou=6706&d2l_body_type=3`

## Preview locally

To preview offline, temporarily set `deployMode: "local"` (uses the `file` paths)
and open `Home.html` in a browser. Click **Begin** and step through with **Next**;
progress is tracked in `localStorage`. Use **↻ Reset course progress** at the
bottom of `Home.html` to start over. Switch back to `"lms"` before re-uploading.

## Deploy to Brightspace

Follow the org cheatsheet (`docs/Course-Creation-Cheatsheet.md`). In short:

1. Upload this whole folder to the course offering → **Manage Files**.
2. Create a Content topic for `Home.html` and each topic page; set completion to
   **Automatic: Visited**.
3. Copy each topic's Brightspace URL into the matching `url` field in
   `course-config.js` (replace the `REPLACE-orgUnit` / `?ou=REPLACE` placeholders),
   set `courseHomeUrl` and `completeUrl` to their Brightspace URLs, switch
   `deployMode` to `"lms"`, and re-upload `course-config.js`.
4. Launch with `?ou={orgUnitId}&d2l_body_type=3` so only the LACE wrapper shows,
   and hide the native content tree.

Mark this course **required for all learners** in Brightspace so it's the first
thing everyone sees.

## Customizing before launch

- The support address in `getting-help.html` is a placeholder
  (`support@example.org`) — swap in the real LACE support contact.
- `courseId` is `lace-onboarding`; keep it unique if you clone this course.
