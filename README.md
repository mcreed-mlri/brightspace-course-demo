# MLRI Brightspace Courses Repository

This repository contains the dynamic templates, interactive component sandboxes, administrative workflows, and planning documents for the **Massachusetts Law Reform Institute (MLRI)** Brightspace custom HTML framework (LACE design style).

> **Workspace map:** See [`../README.md`](../README.md) for how this folder relates to the rest of `c:\dev`.

---

## 📂 Repository Layout

The project has been organized into a clean folder structure:

1.  **[Course-Template](file:///c:/dev/brightspace-courses/Course-Template/)**: The core modular course package. Use this folder to build new courses. It contains:
    *   `Home.html` & `Modules.html` (Dynamic landing pages).
    *   `topic-template.html` (The content boilerplate for new lessons).
    *   `course-config.js` (The single source of truth for syllabus setup).
    *   `course-style.css` (The global LACE stylesheet).
    *   `course-nav.js` (The zero-dependency dynamic nav and progress engine).
    *   `README.md` & `LACE-UX-Recommendations.md` (Course-level customization guides).
2.  **[Interactive-Elements-Demo](file:///c:/dev/brightspace-courses/Interactive-Elements-Demo/)**: A sandbox containing individual HTML components and wrappers from the original demo. Use these to copy/paste specific interactive layouts (Accordions, Tabs, Callout alerts, Flip Cards, Sorting Galleries, Sequencing, and Login Page overrides).
3.  **[docs](file:///c:/dev/brightspace-courses/docs/)**: Course creation checklists and sample course metadata. Roadmaps live in [`notes/LMS Roadmaps/`](../notes/LMS%20Roadmaps/) (Obsidian); `docs/` holds stubs that link there.
4.  **[Brightspace-Admin-Guide.md](file:///c:/dev/brightspace-courses/Brightspace-Admin-Guide.md)**: A Standard Operating Procedure (SOP) written for you to manage course creation, updates via file overwriting, and the attorney content-ingestion pipeline.

---

## 🛠️ Solo Developer Workflow Best Practices

To maintain code integrity and keep courses highly organized:

*   **Version Control**: Always edit HTML, CSS, and JS files locally in your editor (e.g. VS Code) and commit changes to Git. Do not make code edits directly inside Brightspace.
*   **Deployment**: Upload your files to Brightspace using the **Manage Files** utility, overwriting existing files. This prevents Brightspace's built-in WYSIWYG editor from stripping your custom JavaScript or header metadata.
*   **Self-Containment**: Keep LACE framework assets inside each **Course Offering** directory to prevent cross-course dependencies and ensure clean course components copies for future semesters.
