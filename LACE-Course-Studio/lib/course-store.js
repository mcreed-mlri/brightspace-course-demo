/**
 * localStorage course draft store for LACE Course Studio.
 */
(function (global) {
  var STORAGE_KEY = "lace_studio_courses";
  var ACTIVE_KEY = "lace_studio_active_id";

  function loadAll() {
    try {
      return JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");
    } catch (e) {
      return [];
    }
  }

  function saveAll(courses) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(courses));
  }

  function getActiveId() {
    return localStorage.getItem(ACTIVE_KEY) || "";
  }

  function setActiveId(id) {
    localStorage.setItem(ACTIVE_KEY, id);
  }

  function get(id) {
    return loadAll().find(function (c) { return c.id === id; }) || null;
  }

  function upsert(course) {
    var courses = loadAll();
    var idx = courses.findIndex(function (c) { return c.id === course.id; });
    course.updatedAt = new Date().toISOString();
    if (idx === -1) courses.unshift(course);
    else courses[idx] = course;
    saveAll(courses);
    return course;
  }

  function remove(id) {
    saveAll(loadAll().filter(function (c) { return c.id !== id; }));
    if (getActiveId() === id) setActiveId("");
  }

  function createFromModel(model) {
    var course = {
      id: model.courseId || ("course-" + Date.now()),
      meta: model,
      files: {},
      releaseStatus: "Draft",
      preflightScore: null,
      brightspaceOu: "",
      hubManifest: null
    };
    return upsert(course);
  }

  global.LaceCourseStore = {
    loadAll: loadAll,
    get: get,
    upsert: upsert,
    remove: remove,
    getActiveId: getActiveId,
    setActiveId: setActiveId
  };
})(typeof window !== "undefined" ? window : globalThis);
