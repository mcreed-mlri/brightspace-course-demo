/**
 * Course Configuration — single source of truth for the LACE wrapper.
 *
 * COURSE: "Welcome to LACE" — the required onboarding course. This is the first
 * thing every learner takes. It teaches the platform itself (the microlearning
 * rhythm, the topic structure, the Try-it self-checks, and how progress flows
 * back to the hub) by *being* a clean example of a LACE course.
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
  // "local" = use `file` paths · "lms" = use Brightspace `url` paths.
  // Build/preview locally; switch to "lms" once this course is uploaded and each
  // topic's Brightspace URL is pasted into the `url` fields below.
  deployMode: "lms",

  // Chrome treatment: "bar" (slim top bar + drawer, max reading width) or
  // "rail" (the hub's left rail carried into the course). A ?chrome= URL param
  // overrides this — handy for the side-by-side preview.
  chromeMode: "bar",

  // Unique id — namespaces localStorage progress. Change it for every course.
  courseId: "lace-onboarding",

  // Course identity
  courseTitle: "Welcome to LACE",
  courseSubtitle: "How the learning hub works — start here.",
  courseBlurb:
    "The one course everyone takes first. Learn how LACE works — the short-topic " +
    "rhythm, the Try-it self-checks, and how your progress is tracked. " +
    "<em>Five short topics, 10 minutes total.</em>",

  // Breadcrumb + chrome labels
  hubLabel: "Hub",
  courseArea: "Getting Started", // the area this course sits under

  // Topic family — sets the page accent colour (orientation signal). One of:
  // 'court' | 'client' | 'ethics' | 'research' | 'drafting' | 'trauma' |
  // 'foundations'. Each page sets <html data-topic> from this value.
  // "foundations" = the gold/amber accent — the groundwork everyone starts with.
  // (Deliberately NOT blue: blue is the hub's reserved brand colour.)
  topic: "foundations",

  // Exit link — back to the LACE Learning Hub
  homeLinkText: "Exit to Hub",
  homeLinkUrl: "https://lms-discovery.vercel.app/",

  // The outline page within this package.
  courseHomeUrl: "https://mlri.brightspace.com/content/enforced/6706-demo.onboarding_mc/Home.html?ou=6706&d2l_body_type=3",

  // The "you earned it" completion screen shown after the last topic.
  completeUrl: "https://mlri.brightspace.com/content/enforced/6706-demo.onboarding_mc/complete.html?ou=6706&d2l_body_type=3",

  // ─── MODULES & TOPICS ───
  modules: [
    {
      id: "module-1",
      title: "Getting started",
      accent: "foundations",
      description: "Everything you need to feel at home in the hub.",
      topics: [
        {
          slug: "welcome",
          title: "Welcome to LACE",
          file: "welcome.html",
          url: "https://mlri.brightspace.com/content/enforced/6706-demo.onboarding_mc/welcome.html?ou=6706&d2l_body_type=3",
          kind: "Concept",
          minutes: 2,
          description: "What the hub is, and why courses come in small pieces.",
        },
        {
          slug: "anatomy-of-a-topic",
          title: "How a topic works",
          file: "anatomy-of-a-topic.html",
          url: "https://mlri.brightspace.com/content/enforced/6706-demo.onboarding_mc/anatomy-of-a-topic.html?ou=6706&d2l_body_type=3",
          kind: "Concept",
          minutes: 3,
          description: "The same shape every time — so you stop hunting for things.",
        },
        {
          slug: "try-it-checks",
          title: "The Try-it self-checks",
          file: "try-it-checks.html",
          url: "https://mlri.brightspace.com/content/enforced/6706-demo.onboarding_mc/try-it-checks.html?ou=6706&d2l_body_type=3",
          kind: "Practice",
          minutes: 2,
          description: "One low-stakes question per topic. No grade, just recall.",
        },
        {
          slug: "your-progress",
          title: "Your progress & completion",
          file: "your-progress.html",
          url: "https://mlri.brightspace.com/content/enforced/6706-demo.onboarding_mc/your-progress.html?ou=6706&d2l_body_type=3",
          kind: "Concept",
          minutes: 2,
          description: "How a topic gets marked done, and how the hub reads it.",
        },
        {
          slug: "getting-help",
          title: "Getting help & what's next",
          file: "getting-help.html",
          url: "https://mlri.brightspace.com/content/enforced/6706-demo.onboarding_mc/getting-help.html?ou=6706&d2l_body_type=3",
          kind: "Reflection",
          minutes: 1,
          description: "Where to get unstuck, and where to go from here.",
        },
      ],
    },
  ],
};
