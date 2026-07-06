# Brightspace Ready

Brightspace Ready is a local preflight utility for LACE course folders.

Visual design follows the [Learning Hub style guide](style-guide.md).

Open `index.html`, select a course folder, paste the Brightspace URL for
`Home.html`, and run the check. The app does not upload or modify files. It
only reads the selected folder in the browser and reports likely blockers.

## What it checks

- Required wrapper files are present.
- `course-config.js` parses and exposes `window.COURSE_CONFIG`.
- Topic files have `<meta name="course-slug">`.
- Configured topic slugs match their HTML files.
- Framework file fingerprints vs canonical Blank-Course template.
- Try-it integrity (one `data-correct="true"`, options present).
- §3 placeholder stub detection.
- Eyebrow drift vs `course-config.js` (topic index, count, kind, minutes).
- `courseId` registry uniqueness (localStorage + optional paste list).
- HTML pages include `course-style.css`, `course-config.js`, and `course-nav.js`.
- Local `href` and `src` references point to files in the selected folder.
- Brightspace URL pattern validation and generated URL map.
- Exportable upload checklist (markdown) and config URL snippet.

## Current scope

Level 1 checker: validates the local package and guessed Manage Files-style URLs.
Level 2 (Brightspace API URL sync) is available in LACE Course Studio when you
paste Content API results manually — browser CORS blocks direct API calls without a proxy.

## Related

- [LACE Course Studio](../LACE-Course-Studio/index.html) — shell factory, topic editor, unified preflight
- [Sustainability Demo](../Sustainability-Demo/admin-release-demo.html) — release workflow mock
