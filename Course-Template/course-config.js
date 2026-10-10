/**
 * Course Configuration — single source of truth for the LACE wrapper.
 *
 * Every page (outline + topics) reads this file to build the chrome bar
 * breadcrumb, the outline drawer, prev/next buttons, and progress tracking.
 *
 * ─── DUAL URL FIELDS ───
 * Each topic has TWO link fields:
 *   • `file` — raw HTML filename, used while testing locally.
 *   • `url`  — the Brightspace content-topic URL, used in production so that
 *              Next/Previous trigger an LMS page-visit completion.
 * `deployMode` ("local" | "lms") selects which one course-nav.js uses.
 *
 * ─── TOPIC FIELDS ───
 *   slug         unique id; must match the page's <meta name="course-slug">
 *   title        topic title shown in the outline + breadcrumb
 *   kind         "Concept" | "Practice" | "Drafting" | "Reflection" — shown as a tag
 *   minutes      estimated minutes (microlearning — keep these small)
 *   description  one line shown in the outline
 *   updated      optional: "Law changed" | "Updated" | "New" — surfaces an accent pill
 *
 * WORKFLOW: build locally with deployMode "local" → upload to Brightspace →
 * create a Content topic per page → paste each topic URL into `url` → switch
 * deployMode to "lms" → re-upload this file.
 */

window.COURSE_CONFIG = {
  // "local" = use `file` paths · "lms" = use Brightspace `url` paths
  deployMode: "lms",

  // Chrome treatment: "bar" (slim top bar + drawer, max reading width) or
  // "rail" (the hub's left rail carried into the course). A ?chrome= URL param
  // overrides this — handy for the side-by-side preview.
  chromeMode: "bar",

  // Unique id — namespaces localStorage progress. Change it for every course.
  courseId: "eviction-defense-48h",

  // Course identity
  courseTitle: "Eviction defense: the first 48 hours",
  courseSubtitle: "What to do the moment a notice to quit lands on a client's door.",
  courseBlurb:
    "What to do the moment a notice to quit lands on a client's door. <em>Five short topics, 12 minutes total.</em>",

  // Breadcrumb + chrome labels
  hubLabel: "Hub",
  courseArea: "Court Skills", // the practice area this course sits under

  // Topic family — sets the page accent colour (orientation signal). One of:
  // 'court' | 'client' | 'ethics' | 'research' | 'drafting' | 'trauma' |
  // 'foundations'. Each page sets <html data-topic> from this value.
  topic: "court",
  accent: "rust", // legacy course-level accent — superseded by `topic`

  // The Learning Hub's address. Hub links below are paths on it; leave it
  // empty only when the hub itself serves this package.
  hubBaseUrl: "https://lms-discovery.vercel.app",

  // Exit link — back to the Learning Hub (a path on hubBaseUrl)
  homeLinkText: "Back to Case Prep",
  homeLinkUrl: "/binder/litigation/pre-trial/",

  // ─── BINDER (optional) ───
  // Where this course is filed in the hub. With it, the course shows the
  // binder's divider tabs on the right (wide screens), the hub's breadcrumb,
  // and the binder's colour on its rules and progress bars, so moving between
  // hub and course feels like one binder. Paths are on hubBaseUrl and must
  // match the hub's lib/binder.ts. Remove the block for a course not filed in
  // a binder; it then falls back to `topic` for colour and `courseArea` for
  // the breadcrumb.
  binder: {
    name: "Litigation",
    colour: "#dc6a3c", // the binder's colour in the hub; strokes only
    currentTab: "pre-trial", // the tab shown open
    tabs: [
      { id: "contents", label: "Contents", href: "/binder/litigation/" },
      { id: "pre-trial", label: "Case Prep", href: "/binder/litigation/pre-trial/" },
      { id: "trial-skills", label: "Trial", href: "/binder/litigation/trial-skills/" },
      { id: "post-trial", label: "Post-Trial", href: "/binder/litigation/post-trial/" },
      { id: "appellate", label: "Appeals", href: "/binder/litigation/appellate/" },
    ],
    crumbs: [
      { label: "Litigation", href: "/binder/litigation/" },
      { label: "Case Prep", href: "/binder/litigation/pre-trial/" },
    ],
  },

  // ─── ANALYTICS BEACON (optional — OFF by default) ───
  // course-beacon.js sends anonymous, item-scoped engagement events (page
  // views, video progress, session heartbeats, exits) to the LACE data layer.
  // Never any names or Brightspace user IDs — the event registry lives in
  // learning-hub/docs/planning/supabase-analytics.sql. With `enabled: true`
  // and an empty endpoint, events log to the console (local dev mode).
  beacon: {
    enabled: false,
    endpoint: "", // e.g. "https://lms-discovery.vercel.app/api/events"
  },

  // The outline page within this package
  courseHomeUrl: "https://mlri.brightspace.com/content/enforced/6703-course.outline/Home.html?ou=6703&d2l_body_type=3",

  // The "you earned it" completion screen shown after the last topic.
  // DEMO (local): "complete.html"
  completeUrl: "https://mlri.brightspace.com/content/enforced/6703-course.outline/complete.html?ou=6703&d2l_body_type=3",

  // ─── MODULES & TOPICS ───
  modules: [
    {
      id: "module-1",
      title: "Eviction defense",
      accent: "rust",
      description: "From the notice on the door to walking into Housing Court.",
      topics: [
        {
          slug: "clock-starts",
          title: "When the clock starts",
          file: "clock-starts.html",
          url: "https://mlri.brightspace.com/content/enforced/6703-course.outline/clock-starts.html?ou=6703&d2l_body_type=3",
          kind: "Concept",
          minutes: 2,
          description: "Reading the dates that decide everything.",
        },
        {
          slug: "notice-types",
          title: "The four notice types",
          file: "notice-types.html",
          url: "https://mlri.brightspace.com/content/enforced/6703-course.outline/notice-types.html?ou=6703&d2l_body_type=3",
          kind: "Concept",
          minutes: 3,
          description: "14-day, 30-day, no-fault, and cause — and what each one means.",
        },
        {
          slug: "service-of-process",
          title: "Service of process checklist",
          file: "topic-template.html", // the worked example shipped with the template
          url: "https://mlri.brightspace.com/content/enforced/6703-course.outline/topic-template.html?ou=6703&d2l_body_type=3",
          kind: "Practice",
          minutes: 3,
          description: "How the notice got there matters as much as what it says.",
        },
        {
          slug: "drafting-answer",
          title: "Drafting the answer",
          file: "drafting-answer.html",
          url: "https://mlri.brightspace.com/content/enforced/6703-course.outline/drafting-answer.html?ou=6703&d2l_body_type=3",
          kind: "Drafting",
          minutes: 3,
          updated: "Law changed",
          description: "The new motion language under c. 167 §16.",
        },
        {
          slug: "housing-court",
          title: "Walking into Housing Court",
          file: "housing-court.html",
          url: "https://mlri.brightspace.com/content/enforced/6703-course.outline/housing-court.html?ou=6703&d2l_body_type=3",
          kind: "Reflection",
          minutes: 1,
          description: "What to have ready before your case is called.",
        },
      ],
    },
  ],
};

// Pre-paint dark-mode application. This file loads synchronously in <head>
// before first paint (and before the deferred course-nav.js), so a returning
// learner who chose dark never sees a white flash. course-nav.js owns the
// toggle UI and writes the same per-course key.
try {
  if (localStorage.getItem("lace_theme_" + (window.COURSE_CONFIG.courseId || "")) === "dark") {
    document.documentElement.dataset.theme = "dark";
  }
} catch (e) {}
