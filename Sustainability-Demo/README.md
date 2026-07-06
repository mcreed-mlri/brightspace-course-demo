# LACE Blank Course Sustainability Demo

This folder is a proof-of-possibility package for showing that prepared LACE
course shells can be edited and released without daily developer help.

## What is included

- `Blank-Course-A/`, `Blank-Course-B/`, and `Blank-Course-C/`: upload-ready
  three-topic shell folders copied from the current blank wrapper.
- `admin-release-demo.html`: a local admin/hub mock that proves the release
  workflow. Changing a course to `Published` makes it appear in the learner hub
  preview.
- `Blank-Course-A/topic-1.html`: a sample edited topic for the live demo.

## Demo flow

1. Open `admin-release-demo.html`.
2. Show that Course A is not visible in the hub preview until it is published.
3. Open `Blank-Course-A/Home.html` and show the prepared LACE course wrapper.
4. Explain that staff edit visible page content in Brightspace, not the
   framework files.
5. Return to the release demo and change Course A to `Published`.
6. Show that Course A appears in the hub preview, then open it from the hub.

## Safe editing boundary

Staff may edit visible course content:

- Topic titles
- Body text
- Scenario text
- Rule explanations
- Try-it question and answer text
- Handout/resource links
- Images, if Brightspace editing supports the image workflow cleanly

Staff should not edit:

- `course-style.css`
- `course-nav.js`
- Script tags
- Navigation markup
- `course-config.js`, unless handled by a trained admin
- Brightspace completion settings, unless following a checklist

## Stakeholder message

The sustainable part is not that everyone becomes a developer. The sustainable
part is that the course wrapper behaves like infrastructure. Prepared shells are
created ahead of time, staff edit course content in Brightspace, and the admin
layer controls whether a course is visible in the Learning Hub.

## Honest caveat

This does not mean anyone can redesign the wrapper, change the navigation
engine, or create a new course architecture without technical help. It means the
common publishing workflow can continue without custom coding.

---

## Team guide (stakeholder demo)

### 15-minute demo script

1. Open `admin-release-demo.html` in a browser.
2. Point out Course A is **Ready for Review** but **not** in the hub preview.
3. Click **Open Course A** (or open `Blank-Course-A/Home.html`) — show the LACE outline, navigation, and progress.
4. Open `Blank-Course-A/topic-1.html` — walk the five author sections (scenario, rule, try-it, remember).
5. Return to the release demo; change Course A to **Published**.
6. Show Course A appear in the Learning Hub preview; launch it from the hub card.
7. Close with **Brightspace Ready**: open `../Brightspace-Ready/index.html`, select the course folder, run the check — “mistakes are caught before upload.”

### Safe editing zones

| Staff may edit | Staff should not edit |
| --- | --- |
| Topic titles and body text in the five sections | `course-style.css`, `course-nav.js` |
| Scenario, rule, try-it, remember content | Script tags and navigation markup |
| Handout links and images (when workflow is stable) | `course-config.js` (unless trained admin) |
| | Brightspace completion settings without checklist |

### When to call the developer

- Adding or removing topics (new HTML files + Brightspace Content topics)
- Changing navigation, layout, or course chrome
- Wrapper or hub design changes
- Broken navigation after an edit
- New course architecture or interactive components

### Related tools

| Tool | Path | Purpose |
| --- | --- | --- |
| Release demo | `admin-release-demo.html` | Hub publish workflow mock |
| Brightspace Ready | `../Brightspace-Ready/index.html` | Pre-upload file checker |
| LACE Course Studio | `../LACE-Course-Studio/index.html` | Shell factory, topic editor, preflight |
