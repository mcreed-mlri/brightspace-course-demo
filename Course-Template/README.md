# LACE Course Template Guide

A Brightspace course wrapper that feels like the LACE Learning Hub — warm
ivory paper, Lato type, gold/sage/rust accents — so learners get no whiplash
crossing from the hub into a course.

## Template files

| File | Role |
| --- | --- |
| `course-config.js` | **Single source of truth.** Course identity, modules, and the topic list (slug, title, `kind`, `minutes`, links). |
| `course-style.css` | The LACE design system — tokens, chrome bar, outline rows, the 5-section topic layout, callouts/accordions/tabs. Loads Lato + IBM Plex Mono. |
| `course-nav.js` | Injects the **chrome bar** (breadcrumb + Prev/Next) and the **outline drawer**, tracks page-visit completion in `localStorage`, and runs the Try-it self-check, accordions, and tabs. |
| `Home.html` | The **course outline** — lean hero, one progress-aware Continue card, course-coded topic rows (Done · In progress · Next up · Later). |
| `topic-template.html` | The **committed topic structure** — copy this for every topic. |
| `Modules.html` | Legacy redirect → `Home.html` (the old separate outline page is now merged into Home). |

## The committed topic structure

Every topic is the same five sections, in order — this is deliberate. Learners
stop hunting for "where the law is" because it is always § 2.

1. **§ 1 The scenario** — a real client, a real moment.
2. **§ 2 The rule** — the law, stated plainly.
3. **§ 3 What changed** — only when something did (rust accent).
4. **§ 4 Try it** — one question. This is the climax; build to it.
5. **§ 5 Remember** — the two or three things that must stick.

`topic-template.html` ships as a worked example ("Service of process
checklist"). Copy it, don't redesign it.

## Customizing your course

### 1. Configure the structure

Edit `course-config.js`. Set `courseId` (unique — it namespaces progress),
`courseTitle`, `courseArea`, and the `modules` → `topics` list. Each topic:

```javascript
{
  slug: "service-of-process",        // must match the page's <meta name="course-slug">
  file: "service-of-process.html",   // local dev path
  url:  "https://.../viewContent/.../View", // Brightspace topic URL (production)
  title: "Service of process checklist",
  kind: "Practice",                  // Concept | Practice | Drafting | Reflection
  minutes: 3,                        // keep these small — this is microlearning
  updated: "Law changed",            // optional accent pill
  description: "How the notice got there matters as much as what it says."
}
```

### 2. Create each topic page

1. Copy `topic-template.html` → e.g. `service-of-process.html`.
2. Set `<meta name="course-slug" content="...">` to match the config `slug`.
3. Replace the content of the five `<section>` blocks. Keep the structure.

The chrome bar, breadcrumb, Prev/Next, and outline drawer are all injected
automatically — you only write the topic content.

## Deploying to Brightspace

1. **Set deploy mode.** Build locally with `deployMode: "local"`.
2. **Upload** the whole `Course-Template/` folder to Brightspace → *Manage Files*.
3. **Create a Content topic** for `Home.html` and for each topic page.
4. Copy each topic's Brightspace URL into the matching `url` field in
   `course-config.js`, then set `deployMode: "lms"` and re-upload that file.
5. **Completion:** set each page's completion method to *Automatic: Visited*.
6. **Clean-view URLs:** launch with `?ou={orgUnitId}&d2l_body_type=3` so the
   native Brightspace chrome is stripped and only the LACE wrapper shows.
7. **Hide the native content tree** — the chrome bar handles all navigation.

## Local progress engine

`course-nav.js` mocks the LMS completion engine in `localStorage`, keyed by
`courseId`. Visiting a topic marks it complete; the outline rows, Continue
card, and drawer all read that state. Click **↻ Reset course progress** at the
bottom of `Home.html` to start over.
