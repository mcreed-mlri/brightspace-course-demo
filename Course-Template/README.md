# LACE Course Template Guide

A Brightspace course wrapper that looks like the LACE Learning Hub's binder:
a white page, near-black ink, Public Sans, solid ink buttons, and the binder's
colour on rules and progress bars. A course filed in a binder also shows that
binder's divider tabs on the right, so moving between the hub and a course
feels like turning a page.

## Template files

| File | Role |
| --- | --- |
| `course-config.js` | **Single source of truth.** Course identity, modules, the topic list (slug, title, `kind`, `minutes`, links), plus `chromeMode` and `completeUrl`. |
| `course-style.css` | The binder design system — tokens copied from the hub, chrome bar/rail, binder tabs, outline rows, the 5-section topic layout, callouts/accordions/tabs. Loads Public Sans from `fonts/`. |
| `fonts/` | Public Sans (SIL Open Font License), shipped with the course rather than loaded from Google Fonts so it works where outside fonts are blocked. **Upload it with the course**, or pages fall back to the system font. |
| `course-nav.js` | Injects the chrome (slim **bar + drawer** or fixed **rail**, per `chromeMode`), Prev/Next, the **Read · Practice** toggle + step pager, tracks page-visit completion in `localStorage`, and runs the Try-it self-check. |
| `course-beacon.js` | **Optional analytics, OFF by default** (`beacon.enabled` in config). Sends anonymous page-view / video-progress / session-heartbeat events to the LACE data layer — the in-course signals Brightspace can't see. No user identity, ever; failures never break the course. Enabled with an empty `endpoint`, it logs to the console (dev mode). |
| `Home.html` | The **course outline** — lean hero, one progress-aware Continue card, course-coded topic rows (Done · In progress · Next up · Later). |
| `Modules.html` | The **module map** — an alternate visual entry (hero + stats panel, 2-col topic cards, next-up card). |
| `topic-template.html` | The **committed topic structure** — copy this for every topic. |
| `complete.html` | The **completion screen** shown after the last topic — green check badge, stat tiles, "Back to Hub". Writes every slug complete so the hub reads 100%. |

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

### 3. File it in a binder (optional)

Add a `binder` block to `course-config.js` to say where the course lives in
the hub (the template ships one, filed under Litigation › Case Prep). With it:

- the binder's divider tabs show on the right on wide screens, with this
  course's tab open; each tab goes back to that page in the hub, breaking out
  of Brightspace's frame;
- the breadcrumb is the hub's (Litigation › Case Prep › this course);
- the binder's `colour` edges the course: rules, progress bars, the open tab.
  It is never behind text, so any binder colour is safe.

Set `hubBaseUrl` to the hub's address; every hub link in the config is a path
on it. Tab ids and paths must match the hub's `lib/binder.ts`. Without a
`binder` block the course takes its colour from `topic` and its breadcrumb
from `courseArea`, as before.

### 4. The hub layout and practice cards

A course filed in a binder is laid out as a page of the hub (`chromeMode:
"hub"`, the default when there is a `binder` block): the hub's header, its
breadcrumb (binder › tab › … › course › Part N of M), the title over the
binder's colour rule, then the reading beside a **Practice it in the hub**
card and the list of the course's parts, with Back and Next at the end. You
write topic pages exactly as before; `course-nav.js` rearranges them.

The course is for reading. Practice lives in the hub, so a topic can name it:

```javascript
practice: {
  title: "Hearsay, level 1: a written objection",
  href: "/binder/litigation/trial-skills/objections/hearsay/level-1/watch/",
  linkText: "Start level 1",
  steps: [{ label: "Watch", text: "an expert answer it" }, ...],
  note: "About 15 minutes.",
}
```

When the hub's practice is not built yet, set `status: "coming"` with a `text`
and link to a hub page that exists. Set `courseShortTitle` (the course in the
breadcrumb) and, while content awaits review, `contentNote`.

## Deploying to Brightspace

1. **Set deploy mode.** Build locally with `deployMode: "local"`.
   Pick `chromeMode` while you're here: `"bar"` (slim top bar + drawer, max
   reading width — recommended) or `"rail"` (the hub's left rail carried in).
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
