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
  deployMode: "local",

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

  // Exit link — back to the LACE Learning Hub
  homeLinkText: "Exit to Hub",
  homeLinkUrl: "https://mcreed-mlri.github.io/lms-discovery/",

  // The outline page within this package
  courseHomeUrl: "Home.html",

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
          file: "#", // create clock-starts.html from topic-template.html
          url: "#",
          kind: "Concept",
          minutes: 2,
          description: "Reading the dates that decide everything.",
        },
        {
          slug: "notice-types",
          title: "The four notice types",
          file: "#",
          url: "#",
          kind: "Concept",
          minutes: 3,
          description: "14-day, 30-day, no-fault, and cause — and what each one means.",
        },
        {
          slug: "service-of-process",
          title: "Service of process checklist",
          file: "topic-template.html", // the worked example shipped with the template
          url: "topic-template.html",
          kind: "Practice",
          minutes: 3,
          description: "How the notice got there matters as much as what it says.",
        },
        {
          slug: "drafting-answer",
          title: "Drafting the answer",
          file: "#",
          url: "#",
          kind: "Drafting",
          minutes: 3,
          updated: "Law changed",
          description: "The new motion language under c. 167 §16.",
        },
        {
          slug: "housing-court",
          title: "Walking into Housing Court",
          file: "#",
          url: "#",
          kind: "Reflection",
          minutes: 1,
          description: "What to have ready before your case is called.",
        },
      ],
    },
  ],
};
