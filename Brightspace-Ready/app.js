var folderInput = document.getElementById("folder-input");
var homeUrlInput = document.getElementById("home-url");
var registryInput = document.getElementById("registry-ids");
var runButton = document.getElementById("run-check");
var resultsEl = document.getElementById("results");
var mapEl = document.getElementById("url-map");
var copyButton = document.getElementById("copy-map");
var copyConfigButton = document.getElementById("copy-config-snippet");
var copyChecklistButton = document.getElementById("copy-checklist");
var fixFirstEl = document.getElementById("fix-first");
var configSnippetEl = document.getElementById("config-snippet");

var lastMapText = "";
var lastConfigSnippet = "";
var lastChecklist = "";

runButton.addEventListener("click", runCheck);
copyButton.addEventListener("click", function () {
  copyText(lastMapText, copyButton, "Copy map");
});
copyConfigButton.addEventListener("click", function () {
  copyText(lastConfigSnippet, copyConfigButton, "Copy config URLs");
});
copyChecklistButton.addEventListener("click", function () {
  copyText(lastChecklist, copyChecklistButton, "Copy checklist");
});

function copyText(text, btn, label) {
  if (!text) return;
  navigator.clipboard.writeText(text);
  btn.textContent = "Copied";
  window.setTimeout(function () { btn.textContent = label; }, 1200);
}

async function runCheck() {
  var files = Array.from(folderInput.files || []);
  var extraIds = parseRegistryIds(registryInput.value);

  var result = await LaceChecker.runCheck({
    files: files,
    homeUrl: homeUrlInput.value.trim(),
    extraRegistryIds: extraIds
  });

  if (!files.length) {
    setResults(result.checks, {});
    return;
  }

  var rootName = files[0] && files[0].webkitRelativePath
    ? files[0].webkitRelativePath.split("/")[0]
    : "Selected folder";

  setResults(result.checks, {
    rootName: rootName,
    mapText: result.mapText,
    configUrlSnippet: result.configUrlSnippet,
    checklist: result.checklist,
    summary: result.summary
  });
}

function parseRegistryIds(text) {
  if (!text) return [];
  return text.split(/[\n,]+/).map(function (s) { return s.trim(); }).filter(Boolean);
}

function setResults(checks, options) {
  var summary = options.summary || {
    errors: checks.filter(function (c) { return c.level === "error"; }).length,
    warnings: checks.filter(function (c) { return c.level === "warning"; }).length,
    passed: checks.filter(function (c) { return c.level === "passed"; }).length,
    fixFirst: checks.filter(function (c) { return c.level === "error"; }).slice(0, 8)
  };
  var errors = summary.errors;
  var warnings = summary.warnings;
  var passed = summary.passed;
  var score = summary.score != null ? summary.score : Math.round((passed / (checks.length || 1)) * 100);

  document.getElementById("count-errors").textContent = errors;
  document.getElementById("count-warnings").textContent = warnings;
  document.getElementById("count-passed").textContent = passed;
  var scoreEl = document.getElementById("score");
  var nextStepEl = document.getElementById("next-step");
  var readinessState = errors ? "blocked" : warnings ? "almost" : checks.length ? "ready" : "idle";

  scoreEl.textContent = checks.length ? score + "%" : "-";
  scoreEl.className = "score score-" + readinessState;

  document.getElementById("summary-title").textContent = errors
    ? "Needs fixes"
    : warnings
      ? "Almost ready"
      : checks.length
        ? "Brightspace ready"
        : "Waiting for a folder";

  nextStepEl.textContent = errors
    ? "Fix errors before upload or release. Warnings are review items."
    : warnings
      ? "Review warnings, then upload or publish when they are intentional."
      : checks.length
        ? "No blockers found. This package is ready for a Brightspace smoke test."
        : "Choose a folder and run the check.";

  nextStepEl.className = "next-step" + (checks.length ? " state-" + readinessState : "");

  resultsEl.className = "results";
  resultsEl.innerHTML = checks.map(renderCheck).join("");

  var fixFirst = summary.fixFirst || [];
  if (fixFirstEl) {
    fixFirstEl.className = fixFirst.length ? "fix-first" : "fix-first empty-state";
    fixFirstEl.innerHTML = fixFirst.length
      ? "<p class=\"eyebrow\"><span class=\"eyebrow-dot\"></span>Fix these first</p><ol>" + fixFirst.map(function (c) {
        return "<li><strong>" + escapeHtml(c.title) + "</strong> — " + escapeHtml(c.detail) + "</li>";
      }).join("") + "</ol>"
      : "No priority fixes — run a check to see ordered issues.";
  }

  lastMapText = options.mapText || "";
  lastConfigSnippet = options.configUrlSnippet || "";
  lastChecklist = options.checklist || "";

  mapEl.textContent = lastMapText || "Paste the Home.html URL to generate matching file URLs.";
  if (configSnippetEl) {
    configSnippetEl.textContent = lastConfigSnippet || "Run a check with a Home URL to generate config URL snippets.";
  }

  copyButton.disabled = !lastMapText || lastMapText.indexOf(" -> ") === -1;
  if (copyConfigButton) copyConfigButton.disabled = !lastConfigSnippet;
  if (copyChecklistButton) copyChecklistButton.disabled = !lastChecklist;
}

function renderCheck(check) {
  return '<article class="check ' + check.level + '">' +
    '<span class="badge">' + check.level + "</span>" +
    "<div>" +
      '<p class="check-title">' + escapeHtml(check.title) + "</p>" +
      '<p class="check-detail">' + escapeHtml(check.detail) + "</p>" +
    "</div>" +
  "</article>";
}

function escapeHtml(value) {
  var div = document.createElement("div");
  div.textContent = value == null ? "" : String(value);
  return div.innerHTML;
}
