/**
 * ╔══════════════════════════════════════════════════════════════════════════╗
 * ║  LACE COURSE CONFIG  —  fill in the blanks to build your course         ║
 * ║  Follow the STEP comments in order. Save the file and refresh           ║
 * ║  Home.html in your browser to preview changes.                          ║
 * ╚══════════════════════════════════════════════════════════════════════════╝
 *
 * HOW THIS FILE WORKS
 * ─────────────────────────────────────────────────────────────────────────
 * This is the single source of truth for your course. Every page (the
 * outline, each topic, and the completion screen) reads from this file to
 * build the navigation, breadcrumbs, and progress tracking automatically.
 *
 * You do NOT need to touch Home.html, course-style.css, or course-nav.js.
 * Just edit this file and your topic HTML pages.
 *
 * DEPLOYING TO BRIGHTSPACE (do this after local preview looks good)
 * ─────────────────────────────────────────────────────────────────────────
 * 1. Upload this entire folder to Brightspace → Manage Files.
 * 2. Create a Content topic for Home.html and each topic-N.html page.
 * 3. Copy each topic's Brightspace URL and paste it into the `url` field below.
 * 4. Change deployMode from "local" to "lms" and re-upload this file.
 */

window.COURSE_CONFIG = {

  // ── STEP 1: Deploy mode ────────────────────────────────────────────────
  // Leave as "local" while building. Switch to "lms" after uploading to
  // Brightspace and filling in the `url` fields in each topic below.
  deployMode: "local",

  // ── STEP 2: Course identity ────────────────────────────────────────────
  // courseId     — short unique ID, no spaces (hyphens are fine).
  //                Each course needs a different ID or progress tracking breaks.
  // courseTitle  — the full course name shown to learners.
  // courseSubtitle / courseBlurb — short description (blurb supports basic HTML).
  courseId: "blank-course-a-draft",
  courseTitle: "Blank Course A",
  courseSubtitle: "A prepared draft shell staff can edit directly in Brightspace.",
  courseBlurb: "A prepared draft shell staff can edit directly in Brightspace. <em>Three topics, 10 minutes total.</em>",

  // ── STEP 3: Practice area ──────────────────────────────────────────────
  // Shown in the breadcrumb as "Hub › Practice Area › Course Title".
  courseArea: "Draft Courses",

  // ── STEP 4: Accent colour ──────────────────────────────────────────────
  // Sets the accent colour used across every page. Pick one:
  //   "court"       — warm rust/amber   (hearings, litigation)
  //   "client"      — teal              (intake, counselling)
  //   "ethics"      — deep blue         (professional responsibility)
  //   "research"    — violet            (legal research, writing)
  //   "drafting"    — olive/green       (documents, motions)
  //   "trauma"      — dusty rose        (trauma-informed topics)
  //   "foundations" — neutral grey-blue (general / onboarding)
  topic: "foundations",

  // ── Navigation labels (usually no need to change these) ───────────────
  chromeMode: "bar",
  hubLabel: "Hub",
  homeLinkText: "Exit to Hub",
  homeLinkUrl: "https://lms-discovery.vercel.app/",

  // ── STEP 5: Brightspace outline URL ───────────────────────────────────
  // After uploading, paste the Brightspace URL for Home.html here.
  // Leave as "#" while working locally.
  courseHomeUrl: "Home.html",

  // ── STEP 6: Completion screen URL ────────────────────────────────────
  // After uploading, paste the Brightspace URL for complete.html here.
  // Leave as "complete.html" while working locally.
  completeUrl: "complete.html",

  // ══════════════════════════════════════════════════════════════════════
  // STEP 7: MODULES & TOPICS
  // ══════════════════════════════════════════════════════════════════════
  //
  // A course has one or more modules. Each module has one or more topics.
  // Most short courses have just one module — that's fine.
  //
  // For each topic:
  //   slug        — short ID, no spaces (must match <meta name="course-slug">
  //                 in the topic's HTML file)
  //   title       — topic title shown in the outline and breadcrumb
  //   file        — the HTML filename (used while testing locally)
  //   url         — Brightspace URL (paste after uploading; leave "#" for now)
  //   kind        — "Concept" | "Practice" | "Drafting" | "Reflection"
  //   minutes     — estimated reading time (keep it small — this is microlearning)
  //   description — one sentence shown in the course outline
  //   updated     — optional badge: "Law changed" | "Updated" | "New"
  //                 (delete this line if nothing changed)
  //
  // TO ADD A TOPIC: copy one of the topic blocks below and paste it after
  // the last topic in the list (before the closing "]" of the topics array).
  // Then copy topic-1.html, rename it to match the new `file` value, and
  // update the <meta name="course-slug"> inside that file.
  //
  // TO REMOVE A TOPIC: delete the entire { ... } block for that topic.
  // ──────────────────────────────────────────────────────────────────────
  modules: [
    {
      id: "module-1",
      title: "Prepared Draft Module",
      description: "A three-topic shell that demonstrates safe content editing.",
      topics: [
        {
          slug: "topic-1",
          title: "Checking a Notice Deadline",
          file: "topic-1.html",
          url: "#",
          kind: "Concept",
          minutes: 3,
          description: "Replace the scenario, rule, learning check, and takeaway text.",
          // updated: "New",  // ← uncomment and change if you want a badge
        },
        {
          slug: "topic-2",
          title: "Edit This Practice Topic",
          file: "topic-2.html",
          url: "#",
          kind: "Practice",
          minutes: 4,
          description: "Use this page for an applied example or short practice activity.",
        },
        {
          slug: "topic-3",
          title: "Edit This Reflection Topic",
          file: "topic-3.html",
          url: "#",
          kind: "Reflection",
          minutes: 3,
          description: "Use this page for a final takeaway, reflection, or resource link.",
        },
      ],
    },
  ],
};

// ── Dark mode flash prevention ─────────────────────────────────────────────
// This runs synchronously before first paint so returning learners who chose
// dark mode never see a white flash. Do not move or delete this block.
try {
  if (localStorage.getItem("lace_theme_" + (window.COURSE_CONFIG.courseId || "")) === "dark") {
    document.documentElement.dataset.theme = "dark";
  }
} catch (e) {}
