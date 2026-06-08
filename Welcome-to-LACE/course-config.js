/**
 * Course Configuration - single source of truth for the LACE wrapper.
 *
 * COURSE: "Welcome to the Learning Hub" - the required onboarding course.
 * This learner-facing course explains what the Hub is, how to start assigned
 * learning, how Read and Practice modes work, how completion is tracked, and
 * where to get help.
 */

window.COURSE_CONFIG = {
  // "local" = use `file` paths. "lms" = use Brightspace `url` paths.
  deployMode: "lms",

  // Chrome treatment: "bar" or "rail". A ?chrome= URL param overrides this.
  chromeMode: "bar",

  // Unique id - namespaces localStorage progress. Do not change for this course.
  courseId: "lace-onboarding",

  // Course identity
  courseTitle: "Welcome to the Learning Hub",
  courseSubtitle: "Start here: find your learning, choose a reading mode, and know what counts.",
  courseBlurb:
    "The one course everyone takes first. Learn what the Learning Hub is, " +
    "how to find assigned courses, how Read and Practice modes work, how completion is tracked, " +
    "and where to get help. <em>Five short topics, 10 minutes total.</em>",

  // Breadcrumb + chrome labels
  hubLabel: "Hub",
  courseArea: "Getting Started",

  // Topic family - sets the page accent colour.
  topic: "foundations",

  // Exit link - back to the LACE Learning Hub.
  homeLinkText: "Exit to Hub",
  homeLinkUrl: "https://lms-discovery.vercel.app/",

  // The outline page within this package.
  courseHomeUrl: "https://mlri.brightspace.com/content/enforced/6706-demo.onboarding_mc/Home.html?ou=6706&d2l_body_type=3",

  // The completion screen shown after the last topic.
  completeUrl: "https://mlri.brightspace.com/content/enforced/6706-demo.onboarding_mc/complete.html?ou=6706&d2l_body_type=3",

  modules: [
    {
      id: "module-1",
      title: "Getting started",
      accent: "foundations",
      description: "The basics every learner needs before taking other courses.",
      topics: [
        {
          slug: "welcome",
          title: "Start here: what the Hub is",
          file: "welcome.html",
          url: "https://mlri.brightspace.com/content/enforced/6706-demo.onboarding_mc/welcome.html?ou=6706&d2l_body_type=3",
          kind: "Concept",
          minutes: 2,
          description: "What the Learning Hub is and what to do first.",
        },
        {
          slug: "anatomy-of-a-topic",
          title: "Find your assigned learning",
          file: "anatomy-of-a-topic.html",
          url: "https://mlri.brightspace.com/content/enforced/6706-demo.onboarding_mc/anatomy-of-a-topic.html?ou=6706&d2l_body_type=3",
          kind: "Concept",
          minutes: 3,
          description: "Use the outline, menu, Continue card, and Read/Practice toggle.",
        },
        {
          slug: "try-it-checks",
          title: "Use Try-it checks",
          file: "try-it-checks.html",
          url: "https://mlri.brightspace.com/content/enforced/6706-demo.onboarding_mc/try-it-checks.html?ou=6706&d2l_body_type=3",
          kind: "Practice",
          minutes: 2,
          description: "Quick, low-stakes practice. No score, no penalty.",
        },
        {
          slug: "your-progress",
          title: "Track progress and completion",
          file: "your-progress.html",
          url: "https://mlri.brightspace.com/content/enforced/6706-demo.onboarding_mc/your-progress.html?ou=6706&d2l_body_type=3",
          kind: "Concept",
          minutes: 2,
          description: "What counts, what Brightspace records, and how resume works.",
        },
        {
          slug: "getting-help",
          title: "Get help and go next",
          file: "getting-help.html",
          url: "https://mlri.brightspace.com/content/enforced/6706-demo.onboarding_mc/getting-help.html?ou=6706&d2l_body_type=3",
          kind: "Reflection",
          minutes: 1,
          description: "Report problems, notice updates, and return to the Hub.",
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
