# Brightspace Course Creation Cheatsheet

Use this checklist when creating a new LACE-style Brightspace course with full Brightspace tracking.

---

## 1. Course Identity

Collect these before building pages.

| Item | Example | Notes |
| --- | --- | --- |
| Course title | `Housing Court Basics` | Displayed in LACE headers and Brightspace |
| Course subtitle | `A practical intro for new advocates` | Displayed on `Home.html` |
| Course ID / slug | `housing_court_basics_2026` | Must be unique in `course-config.js` |
| Brightspace org unit ID | `6698` | Needed for URLs and reporting |
| Course offering name | `Housing Court Basics - Spring 2026` | The live learner shell |
| Course template/container | `Housing Court Basics Container` | Parent container, if used |
| Audience | `New legal services attorneys` | Helps guide tone and examples |
| Tracking requirement | `Automatic: Visited` | Default for required HTML pages |

Important: the `courseId` in `course-config.js` is for LACE/local progress namespacing. The Brightspace org unit ID is the LMS course identifier. They are related, but they are not the same thing.

---

## 2. Local Files

Every course should start from a copied course template folder.

| File/folder | Required? | Purpose |
| --- | --- | --- |
| `Home.html` | Yes | Course landing page / LACE start page |
| `Modules.html` | Usually | Detailed course outline |
| `topic-template.html` copies | Yes | One HTML file per lesson/topic |
| `course-config.js` | Yes | Single source of truth for LACE navigation |
| `course-style.css` | Yes | Shared course styling |
| `course-nav.js` | Yes | Shared navigation/progress behavior |
| `images/` | As needed | Screenshots, diagrams, visual assets |
| `assets/` | As needed | PDFs, downloads, handouts |

Each HTML page that uses the shared CSS/JS must include links like:

```html
<link rel="stylesheet" href="course-style.css">
<script src="course-config.js"></script>
<script src="course-nav.js"></script>
```

---

## 3. Page Inventory

Make this table before touching Brightspace Content.

| Slug | Page title | Local file | Required? | Completion method | Brightspace topic URL |
| --- | --- | --- | --- | --- | --- |
| `home` | Course Home | `Home.html` | Optional | Automatic: Visited or none | TBD |
| `intro` | Introduction | `intro.html` | Yes | Automatic: Visited | TBD |
| `topic-1` | Answer Deadlines | `answer-deadlines.html` | Yes | Automatic: Visited | TBD |
| `resources` | Resources | `resources.html` | No | Optional or none | TBD |

You need a Brightspace topic URL for every visible/trackable HTML page once the Content topics are created.

---

## 4. `course-config.js` Fields

Update these for every course.

```javascript
window.COURSE_CONFIG = {
  deployMode: "local",
  courseId: "housing_court_basics_2026",
  courseTitle: "Housing Court Basics",
  courseSubtitle: "A practical intro for new advocates.",
  logoMain: "LACE",
  logoSub: "Housing",
  homeLinkText: "Back to Hub",
  homeLinkUrl: "https://mcreed-mlri.github.io/lms-discovery/",
  courseHomeUrl: "Home.html",
  modules: []
};
```

For each topic, keep both fields:

```javascript
{
  slug: "answer-deadlines",
  title: "Answer Deadlines",
  file: "answer-deadlines.html",
  url: "https://mlri.brightspace.com/d2l/le/content/{orgUnitId}/viewContent/{topicId}/View",
  description: "Learn how answer deadlines work in housing cases.",
  duration: "8 min read"
}
```

During local drafting:

```javascript
deployMode: "local"
```

For Brightspace production/full tracking:

```javascript
deployMode: "lms"
```

---

## 5. Brightspace Manage Files

Upload the full course package into the Course Offering.

Checklist:

- [ ] Upload `Home.html`
- [ ] Upload `Modules.html`
- [ ] Upload all topic HTML files
- [ ] Upload `course-config.js`
- [ ] Upload `course-style.css`
- [ ] Upload `course-nav.js`
- [ ] Upload images/assets folders
- [ ] Confirm pages load from Manage Files
- [ ] Do not edit custom HTML in the Brightspace WYSIWYG editor
- [ ] When updating an existing page, overwrite the file instead of deleting/recreating it

---

## 6. Brightspace Content Setup

Create the official LMS tracking map.

| Brightspace module | Topic title | Source file | Completion | URL copied? |
| --- | --- | --- | --- | --- |
| Start Here | Course Home | `Home.html` | Optional / Automatic: Visited | [ ] |
| Module 1 | Introduction | `intro.html` | Automatic: Visited | [ ] |
| Module 1 | Answer Deadlines | `answer-deadlines.html` | Automatic: Visited | [ ] |
| Module 2 | Practice Scenario | `practice-scenario.html` | Automatic: Visited | [ ] |

Rules:

- Create one Brightspace Content topic for every page that should be tracked.
- Use **Add from Manage Files** for HTML pages.
- Set required HTML pages to **Automatic: Visited** unless a stricter completion rule is needed.
- Copy each Brightspace topic URL into the matching `url` field in `course-config.js`.
- Re-upload `course-config.js` after switching `deployMode` to `"lms"`.
- If a file was deleted from **Manage Files**, remove or replace the matching **Course Builder/Content** node too. Deleted files do not automatically remove outline nodes.

---

## 7. Course Home Launch Link

You only need one main front-door launch link from the Brightspace course home page.

| Item | Value |
| --- | --- |
| Link text | `Start Course` |
| Target | Brightspace topic URL for `Home.html`, or clean-view URL if confirmed |
| Purpose | Gets learners into the LACE course experience |

Recommended pattern:

```text
Start Course -> Home.html Brightspace topic URL
```

Then LACE navigation sends learners through the official Brightspace topic URLs for all required pages.

---

## 8. QA Checklist

Test with a learner/test account.

- [ ] `Home.html` opens correctly
- [ ] Shared CSS loads on every page
- [ ] Shared JS loads on every page
- [ ] Course menu opens
- [ ] Previous/next buttons work
- [ ] LACE links route to Brightspace topic URLs in production
- [ ] Each required topic marks complete after visit
- [ ] Completion survives browser refresh
- [ ] Brightspace reports show expected progress
- [ ] No required page is Draft/Hidden if it must count for completion
- [ ] No duplicate visible topic points to the same required page
- [ ] No topic shows as broken in Course Builder
- [ ] Brightspace content API returns `brokenTopicCount: 0` for synced courses

---

## 9. Rollover Notes

When copying a course to a new offering:

- [ ] Update `courseId` if the new offering should have separate LACE/local progress
- [ ] Confirm all files copied into Manage Files
- [ ] Confirm Content topics copied correctly
- [ ] Copy the new offering's Brightspace topic URLs
- [ ] Replace old topic URLs in `course-config.js`
- [ ] Re-upload `course-config.js`
- [ ] Retest completion tracking as a learner

Brightspace topic URLs are course-offering specific. Do not assume old URLs will keep working after a rollover.
