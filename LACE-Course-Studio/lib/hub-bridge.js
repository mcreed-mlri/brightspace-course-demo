/**
 * Discovery Hub bridge — manifest export and release-demo deep links.
 */
(function (global) {
  var RELEASE_DEMO_PATH = "../Sustainability-Demo/admin-release-demo.html";
  var HUB_DEFAULT_URL = "https://lms-discovery.vercel.app/";

  function buildManifest(course) {
    var meta = course.meta || {};
    var topics = (meta.topics || []).length;
    var minutes = (meta.topics || []).reduce(function (sum, t) {
      return sum + (t.minutes || 0);
    }, 0);
    return {
      version: 1,
      id: course.id,
      courseId: meta.courseId,
      title: meta.courseTitle,
      area: meta.courseArea,
      description: meta.courseSubtitle,
      status: course.releaseStatus || "Draft",
      topics: topics,
      minutes: minutes,
      preflightScore: course.preflightScore,
      brightspaceOu: course.brightspaceOu || "",
      studioDeepLink: "index.html?course=" + encodeURIComponent(course.id),
      releaseDemoLink: RELEASE_DEMO_PATH + "?import=" + encodeURIComponent(course.id),
      updatedAt: course.updatedAt || new Date().toISOString()
    };
  }

  function exportManifestJson(course) {
    return JSON.stringify(buildManifest(course), null, 2);
  }

  function syncToReleaseDemo(course) {
    var key = "lace_release_demo_courses";
    var manifest = buildManifest(course);
    var courses;
    try {
      courses = JSON.parse(localStorage.getItem(key) || "[]");
    } catch (e) {
      courses = [];
    }
    if (!courses.length) {
      courses = [
        { id: "blank-course-a", title: "Blank Course A", area: "Draft Courses", description: "", launchUrl: "Blank-Course-A/Home.html", status: "Draft", minutes: 10, topics: 3, lastReviewed: new Date().toISOString().slice(0, 10) }
      ];
    }
    var entry = {
      id: course.id,
      title: manifest.title,
      area: manifest.area,
      description: manifest.description,
      launchUrl: "../LACE-Course-Studio/preview.html?course=" + encodeURIComponent(course.id),
      status: manifest.status,
      minutes: manifest.minutes,
      topics: manifest.topics,
      lastReviewed: new Date().toISOString().slice(0, 10),
      studioCourseId: course.id,
      preflightScore: manifest.preflightScore
    };
    entry.topics = manifest.topics;
    var idx = courses.findIndex(function (c) { return c.id === course.id; });
    if (idx === -1) courses.unshift(entry);
    else courses[idx] = Object.assign(courses[idx], entry);
    localStorage.setItem(key, JSON.stringify(courses));
    return manifest;
  }

  function openReleaseDemo(courseId) {
    window.open(RELEASE_DEMO_PATH + (courseId ? "?highlight=" + encodeURIComponent(courseId) : ""), "_blank");
  }

  global.LaceHubBridge = {
    HUB_DEFAULT_URL: HUB_DEFAULT_URL,
    RELEASE_DEMO_PATH: RELEASE_DEMO_PATH,
    buildManifest: buildManifest,
    exportManifestJson: exportManifestJson,
    syncToReleaseDemo: syncToReleaseDemo,
    openReleaseDemo: openReleaseDemo
  };
})(typeof window !== "undefined" ? window : globalThis);
