/**
 * Build course-config.js from a course model.
 */
(function (global) {
  function quote(s) {
    return JSON.stringify(s == null ? "" : String(s));
  }

  function buildConfigJs(course) {
    var topics = course.topics || [];
    var module = {
      id: course.moduleId || "module-1",
      title: course.moduleTitle || "Module 1",
      description: course.moduleDescription || "Course module.",
      topics: topics.map(function (t, i) {
        var slug = t.slug || ("topic-" + (i + 1));
        var file = t.file || (slug + ".html");
        return {
          slug: slug,
          title: t.title || ("Topic " + (i + 1)),
          file: file,
          url: t.url || "#",
          kind: t.kind || "Concept",
          minutes: t.minutes || 3,
          description: t.description || "One sentence for the outline."
        };
      })
    };

    var topicBlocks = module.topics.map(function (t) {
      return "        {\n" +
        "          slug: " + quote(t.slug) + ",\n" +
        "          title: " + quote(t.title) + ",\n" +
        "          file: " + quote(t.file) + ",\n" +
        "          url: " + quote(t.url) + ",\n" +
        "          kind: " + quote(t.kind) + ",\n" +
        "          minutes: " + t.minutes + ",\n" +
        "          description: " + quote(t.description) + ",\n" +
        "        }";
    }).join(",\n");

    return "window.COURSE_CONFIG = {\n" +
      '  deployMode: ' + quote(course.deployMode || "local") + ",\n" +
      "  courseId: " + quote(course.courseId) + ",\n" +
      "  courseTitle: " + quote(course.courseTitle) + ",\n" +
      "  courseSubtitle: " + quote(course.courseSubtitle) + ",\n" +
      "  courseBlurb: " + quote(course.courseBlurb) + ",\n" +
      "  courseArea: " + quote(course.courseArea) + ",\n" +
      "  topic: " + quote(course.topic || "foundations") + ",\n" +
      '  chromeMode: ' + quote(course.chromeMode || "bar") + ",\n" +
      '  hubLabel: "Hub",\n' +
      "  homeLinkText: " + quote(course.homeLinkText || "Exit to Hub") + ",\n" +
      "  homeLinkUrl: " + quote(course.homeLinkUrl || "https://lms-discovery.vercel.app/") + ",\n" +
      "  courseHomeUrl: " + quote(course.courseHomeUrl || "Home.html") + ",\n" +
      "  completeUrl: " + quote(course.completeUrl || "complete.html") + ",\n" +
      "  modules: [\n    {\n" +
      "      id: " + quote(module.id) + ",\n" +
      "      title: " + quote(module.title) + ",\n" +
      "      description: " + quote(module.description) + ",\n" +
      "      topics: [\n" + topicBlocks + "\n      ],\n    },\n  ],\n};\n\n" +
      "try {\n" +
      '  if (localStorage.getItem("lace_theme_" + (window.COURSE_CONFIG.courseId || "")) === "dark") {\n' +
      '    document.documentElement.dataset.theme = "dark";\n' +
      "  }\n" +
      "} catch (e) {}\n";
  }

  function defaultCourse(overrides) {
    var base = {
      courseId: "new-course-" + Date.now(),
      courseTitle: "New Course Title",
      courseSubtitle: "One sentence describing what this course covers.",
      courseBlurb: "One sentence describing what this course covers.",
      courseArea: "Your Practice Area",
      topic: "foundations",
      chromeMode: "bar",
      deployMode: "local",
      moduleTitle: "Module 1",
      moduleDescription: "Course module.",
      topics: [
        { slug: "topic-1", title: "First Topic", file: "topic-1.html", kind: "Concept", minutes: 3, description: "First topic outline line." },
        { slug: "topic-2", title: "Second Topic", file: "topic-2.html", kind: "Practice", minutes: 4, description: "Second topic outline line." },
        { slug: "topic-3", title: "Third Topic", file: "topic-3.html", kind: "Reflection", minutes: 3, description: "Third topic outline line." }
      ]
    };
    if (overrides) Object.keys(overrides).forEach(function (k) { base[k] = overrides[k]; });
    return base;
  }

  global.LaceConfigBuilder = {
    buildConfigJs: buildConfigJs,
    defaultCourse: defaultCourse
  };
})(typeof window !== "undefined" ? window : globalThis);
