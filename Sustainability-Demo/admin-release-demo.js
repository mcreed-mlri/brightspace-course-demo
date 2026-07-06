var DEFAULT_COURSES = [
  {
    id: "blank-course-a",
    title: "Blank Course A",
    area: "Draft Courses",
    description: "Prepared shell with one sample topic edited for the live demo.",
    launchUrl: "Blank-Course-A/Home.html",
    status: "Ready for Review",
    minutes: 10,
    topics: 3,
    lastReviewed: "2026-06-11"
  },
  {
    id: "blank-course-b",
    title: "Blank Course B",
    area: "Draft Courses",
    description: "Prepared shell waiting for a future training topic.",
    launchUrl: "Blank-Course-B/Home.html",
    status: "Draft",
    minutes: 10,
    topics: 3,
    lastReviewed: "2026-06-11"
  },
  {
    id: "blank-course-c",
    title: "Blank Course C",
    area: "Draft Courses",
    description: "Prepared shell kept hidden until staff are ready to review it.",
    launchUrl: "Blank-Course-C/Home.html",
    status: "Archived",
    minutes: 10,
    topics: 3,
    lastReviewed: "2026-06-11"
  }
];

var STATUSES = ["Draft", "Ready for Review", "Published", "Archived"];
var STORAGE_KEY = "lace_release_demo_courses";
var STUDIO_PATH = "../LACE-Course-Studio/index.html";
var HIGHLIGHT_ID = new URLSearchParams(location.search).get("highlight");

function loadCourses() {
  try {
    var stored = localStorage.getItem(STORAGE_KEY);
    if (stored) return JSON.parse(stored);
  } catch (e) {}
  return DEFAULT_COURSES.slice();
}

function saveCourses(courses) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(courses));
  } catch (e) {}
}

function escapeHtml(value) {
  var div = document.createElement("div");
  div.textContent = value == null ? "" : String(value);
  return div.innerHTML;
}

function pillClass(status) {
  if (status === "Published") return "published";
  if (status === "Ready for Review") return "review";
  return "";
}

function studioLink(course) {
  var id = course.studioCourseId || course.id;
  return STUDIO_PATH + "?course=" + encodeURIComponent(id);
}

function preflightPill(course) {
  if (course.preflightScore == null) return "";
  return '<span class="pill">Preflight ' + course.preflightScore + "%</span>";
}

function render() {
  var courses = loadCourses();
  var adminList = document.getElementById("admin-list");
  var hubList = document.getElementById("hub-list");
  var published = courses.filter(function (course) { return course.status === "Published"; });

  adminList.innerHTML = courses.map(function (course) {
    var options = STATUSES.map(function (status) {
      return '<option value="' + escapeHtml(status) + '"' + (status === course.status ? " selected" : "") + ">" +
        escapeHtml(status) +
        "</option>";
    }).join("");
    var highlight = HIGHLIGHT_ID && course.id === HIGHLIGHT_ID ? " course-row-highlight" : "";

    return '<article class="course-row' + highlight + '">' +
      '<div>' +
        '<h3 class="course-title">' + escapeHtml(course.title) + "</h3>" +
        '<p class="helper">' + escapeHtml(course.description) + "</p>" +
        '<div class="course-meta">' +
          '<span class="pill ' + pillClass(course.status) + '">' + escapeHtml(course.status) + "</span>" +
          '<span class="pill">' + escapeHtml(course.area) + "</span>" +
          '<span class="pill">' + course.topics + " topics</span>" +
          '<span class="pill">' + course.minutes + " min</span>" +
          preflightPill(course) +
        "</div>" +
      "</div>" +
      '<div class="status-control">' +
        '<label for="status-' + escapeHtml(course.id) + '">Release status</label>' +
        '<select id="status-' + escapeHtml(course.id) + '" data-course-id="' + escapeHtml(course.id) + '">' +
          options +
        "</select>" +
        '<a class="ghost-link" href="' + escapeHtml(course.launchUrl) + '">Preview shell</a>' +
        '<a class="ghost-link" href="' + escapeHtml(studioLink(course)) + '">Open in Studio</a>' +
      "</div>" +
    "</article>";
  }).join("");

  hubList.innerHTML = published.length
    ? published.map(function (course) {
        return '<a class="course-card" href="' + escapeHtml(course.launchUrl) + '">' +
          '<p class="eyebrow">' + escapeHtml(course.area) + "</p>" +
          '<h3 class="course-title">' + escapeHtml(course.title) + "</h3>" +
          '<p class="helper">' + escapeHtml(course.description) + "</p>" +
          '<div class="course-meta">' +
            '<span class="pill published">Published</span>' +
            '<span class="pill">' + course.topics + " topics</span>" +
            '<span class="pill">' + course.minutes + " min</span>" +
            preflightPill(course) +
          "</div>" +
        "</a>";
      }).join("")
    : '<div class="empty-state">No courses are published yet. Change Course A to Published to show the release moment.</div>';

  document.getElementById("published-count").textContent =
    published.length + (published.length === 1 ? " published" : " published");

  document.querySelectorAll("[data-course-id]").forEach(function (select) {
    select.addEventListener("change", function () {
      var next = loadCourses();
      var id = select.getAttribute("data-course-id");
      next.forEach(function (course) {
        if (course.id === id) course.status = select.value;
      });
      saveCourses(next);
      render();
    });
  });
}

document.getElementById("reset-demo").addEventListener("click", function () {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch (e) {}
  render();
});

render();
