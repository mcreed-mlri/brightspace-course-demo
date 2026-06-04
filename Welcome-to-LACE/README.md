# Welcome to the Learning Hub - onboarding course

The required first course every learner takes. It introduces the learner-facing
Learning Hub experience: what the Hub is, how to find assigned learning, how the
Read/Practice toggle works, how Try-it checks work, how progress and completion
are tracked, and where to get help.

Built on the shared Course-Template ("LACE Studio") wrapper. The shared wrapper
files (`course-style.css`, `course-nav.js`, `Home.html`, `complete.html`) remain
config-driven; `course-config.js` and the topic pages are course-specific.

- Accent: `foundations` (gold/amber `#c8791b`).
- Length: 5 topics, 10 minutes total.
- Learner-facing title: `Welcome to the Learning Hub`.
- Folder/deployment path: still `Welcome-to-LACE` / `6706-demo.onboarding_mc`
  so existing Brightspace Manage Files URLs do not break.

## Topics

| # | Slug | File | Title | Kind | Min |
|---|------|------|-------|------|-----|
| 1 | `welcome` | `welcome.html` | Start here: what the Hub is | Concept | 2 |
| 2 | `anatomy-of-a-topic` | `anatomy-of-a-topic.html` | Find your assigned learning | Concept | 3 |
| 3 | `try-it-checks` | `try-it-checks.html` | Use Try-it checks | Practice | 2 |
| 4 | `your-progress` | `your-progress.html` | Track progress and completion | Concept | 2 |
| 5 | `getting-help` | `getting-help.html` | Get help and go next | Reflection | 1 |

`Modules.html` is a quick-map reference page for the same onboarding controls.
It is not part of the five required tracked topics unless a Brightspace content
topic is explicitly created for it.

## Live deployment

Deployed to Brightspace at org unit **6706**, Manage Files path
`6706-demo.onboarding_mc`. `course-config.js` is in `deployMode: "lms"` with all
topic URLs filled in. After editing any file, re-upload it to Manage Files
overwrite in place. Front door:
`https://mlri.brightspace.com/content/enforced/6706-demo.onboarding_mc/Home.html?ou=6706&d2l_body_type=3`

## Preview locally

To preview offline, temporarily set `deployMode: "local"` in `course-config.js`
and open `Home.html` in a browser. Click Begin and step through with Next;
progress is tracked in `localStorage`. Use "Reset course progress" at the bottom
of `Home.html` to start over. Switch back to `"lms"` before re-uploading.

## Deploy to Brightspace

Follow the org cheatsheet (`docs/Course-Creation-Cheatsheet.md`). In short:

1. Upload this whole folder to the course offering -> Manage Files.
2. Create a Content topic for `Home.html` and each tracked topic page; set completion to Automatic: Visited.
3. Copy each topic's Brightspace URL into the matching `url` field in `course-config.js`.
4. Keep `deployMode: "lms"` before re-uploading `course-config.js`.
5. Launch with `?ou={orgUnitId}&d2l_body_type=3` so only the wrapper shows.

Mark this course required for all learners so it is the first thing everyone
sees.

## Customizing before launch

- The support address in `getting-help.html` is a placeholder
  (`support@example.org`) - swap in the real support contact when available.
- `courseId` is `lace-onboarding`; keep it unchanged for this deployed course.
