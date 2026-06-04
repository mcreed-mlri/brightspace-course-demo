/**
 * LACE Course Wrapper — chrome, rail, outline drawer, progress & modes.
 * ----------------------------------------------------------------------------
 * Restyled to the "Studio" hub direction (A2). Two chrome treatments, chosen by
 * COURSE_CONFIG.chromeMode (or a ?chrome= URL param for previewing):
 *
 *   chromeMode = "bar"   → slim sticky top bar + slide-out outline drawer
 *                          (reclaims the vertical space Brightspace's header
 *                          eats; maximum reading width). DEFAULT.
 *   chromeMode = "rail"  → the hub's left rail carried into the course; holds
 *                          the wordmark, the full outline, exit-to-hub and
 *                          prev/next. Collapses to a 72px icon strip.
 *
 * Also injects the Read · Practice mode toggle on topic pages (article vs
 * one-section-per-screen), tracks page-visit completion in localStorage, fills
 * [data-lace] progress hooks, and wires accordions / tabs / try-it self-checks.
 *
 * Pages opt in with <div id="lace-nav-container"></div> and a
 * <meta name="course-slug" content="…">.
 */
document.addEventListener("DOMContentLoaded", function () {
  if (!window.COURSE_CONFIG) {
    console.error("LACE: window.COURSE_CONFIG is not defined. Include course-config.js before course-nav.js.");
    return;
  }

  var config = window.COURSE_CONFIG;
  var metaSlug = document.querySelector('meta[name="course-slug"]');
  var currentSlug = metaSlug ? metaSlug.getAttribute("content") : null;
  var isOutline = !currentSlug || currentSlug === "home" || currentSlug === "modules";
  var storageKey = "lace_progress_" + config.courseId;

  // ── Chrome mode: ?chrome= URL override → config → default "bar" ───────────
  var urlParams = new URLSearchParams(window.location.search);
  var chromeMode = urlParams.get("chrome") || config.chromeMode || "bar";
  if (chromeMode !== "rail") chromeMode = "bar";
  document.documentElement.setAttribute("data-chrome", chromeMode);
  // Rail starts collapsed if the URL says so (used by previews).
  if (chromeMode === "rail" && urlParams.get("rail") === "min") {
    document.documentElement.setAttribute("data-rail", "min");
  }

  // ── Progress (localStorage) ──────────────────────────────────────────────
  function getProgress() {
    try { var s = localStorage.getItem(storageKey); if (s) return JSON.parse(s); }
    catch (e) { console.warn("LACE: could not read localStorage.", e); }
    return { userName: "Learner", completed: [], lastVisited: null };
  }
  function saveProgress(d) {
    try { localStorage.setItem(storageKey, JSON.stringify(d)); }
    catch (e) { console.warn("LACE: could not write localStorage.", e); }
  }
  function markComplete(slug) {
    var d = getProgress();
    if (d.completed.indexOf(slug) === -1) d.completed.push(slug);
    d.lastVisited = slug;
    saveProgress(d);
    progress = d;
  }
  var progress = getProgress();
  if (currentSlug && !isOutline) markComplete(currentSlug);

  // ── URL resolver ──────────────────────────────────────────────────────────
  var isLmsMode = config.deployMode === "lms";
  function resolveTopicUrl(t) {
    if (isLmsMode && t.url && t.url !== "#") return t.url;
    return t.file || t.url || "#";
  }
  // Keep the active chrome/mode params on internal links so a preview session
  // stays in the same treatment as the learner clicks through.
  function withParams(url) {
    if (!url || url === "#" || isLmsMode) return url;
    var keep = [];
    if (urlParams.get("chrome")) keep.push("chrome=" + urlParams.get("chrome"));
    if (urlParams.get("rail")) keep.push("rail=" + urlParams.get("rail"));
    if (!keep.length) return url;
    return url + (url.indexOf("?") > -1 ? "&" : "?") + keep.join("&");
  }

  // ── Flattened topic list ────────────────────────────────────────────────
  function getFlatTopics() {
    var list = [];
    config.modules.forEach(function (mod) {
      mod.topics.forEach(function (t) {
        list.push({
          slug: t.slug, title: t.title, url: resolveTopicUrl(t),
          kind: t.kind || "", minutes: t.minutes || 0, updated: t.updated || "",
          description: t.description || "", moduleId: mod.id, moduleTitle: mod.title,
        });
      });
    });
    return list;
  }
  var flatTopics = getFlatTopics();
  var completedSet = {};
  progress.completed.forEach(function (s) { completedSet[s] = true; });

  function topicStatus(slug) {
    if (completedSet[slug]) return "done";
    var firstOpen = null, secondOpen = null;
    for (var i = 0; i < flatTopics.length; i++) {
      if (!completedSet[flatTopics[i].slug]) {
        if (firstOpen === null) firstOpen = flatTopics[i].slug;
        else if (secondOpen === null) { secondOpen = flatTopics[i].slug; break; }
      }
    }
    if (slug === firstOpen) return "active";
    if (slug === secondOpen) return "next";
    return "later";
  }
  var STATUS_LABEL = { done: "Done", active: "In progress", next: "Next up", later: "Later" };
  function currentIndex() { for (var i = 0; i < flatTopics.length; i++) if (flatTopics[i].slug === currentSlug) return i; return -1; }
  function firstIncomplete() { return flatTopics.find(function (t) { return !completedSet[t.slug]; }) || null; }
  function doneCount() { return flatTopics.filter(function (t) { return completedSet[t.slug]; }).length; }

  // ── Inline icons ───────────────────────────────────────────────────────────
  function icon(name, size) {
    var s = size || 16;
    var paths = {
      menu: '<path d="M4 7h16M4 12h16M4 17h10"/>',
      arrow: '<path d="M5 12h14"/><path d="m13 6 6 6-6 6"/>',
      arrowLeft: '<path d="M19 12H5"/><path d="m11 6-6 6 6 6"/>',
      chevronRight: '<path d="m9 6 6 6-6 6"/>',
      chevronLeft: '<path d="m15 6-6 6 6 6"/>',
      check: '<path d="m5 12 4 4L19 6"/>',
      close: '<path d="m6 6 12 12M18 6 6 18"/>',
      play: '<path d="m8 5 11 7-11 7z"/>',
      book: '<path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M4 4.5A2.5 2.5 0 0 1 6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5z"/>',
      target: '<circle cx="12" cy="12" r="8"/><circle cx="12" cy="12" r="3"/>',
    };
    return '<svg width="' + s + '" height="' + s + '" viewBox="0 0 24 24" fill="none" ' +
      'stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' +
      (paths[name] || "") + "</svg>";
  }
  var MARK = '<span class="mk-badge"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 3v18"/><path d="M7 8h10"/><path d="M7 8 4 15a3 3 0 0 0 6 0z"/><path d="M17 8l-3 7a3 3 0 0 0 6 0z"/></svg></span>';

  function esc(t) { var d = document.createElement("div"); d.textContent = t == null ? "" : String(t); return d.innerHTML; }

  // ── Shared: compute breadcrumb + prev/next for the current page ──────────
  function navModel() {
    var shortTitle = (config.courseTitle || "").split(":")[0].trim();
    var idx = currentIndex();
    var crumbs = [{ label: config.hubLabel || "Hub", href: config.homeLinkUrl }];
    if (config.courseArea) crumbs.push({ label: config.courseArea, href: withParams(config.courseHomeUrl) });
    if (isOutline) {
      crumbs.push({ label: config.courseTitle, current: true });
    } else {
      crumbs.push({ label: shortTitle, href: withParams(config.courseHomeUrl) });
      crumbs.push({ label: flatTopics[idx] ? flatTopics[idx].title : config.courseTitle, current: true });
    }
    var prev = !isOutline && idx > 0 ? flatTopics[idx - 1] : null;
    var next, nextLabel, nextHint, isFinish = false;
    if (isOutline) {
      var resume = firstIncomplete();
      next = resume || flatTopics[0];
      nextLabel = resume && progress.completed.length > 0 ? "Continue" : "Begin";
      nextHint = next ? next.title : "";
    } else if (idx > -1 && idx < flatTopics.length - 1) {
      next = flatTopics[idx + 1]; nextLabel = "Continue";
      nextHint = next.title + (next.minutes ? " · " + next.minutes + " min" : "");
    } else {
      next = { url: config.completeUrl || config.courseHomeUrl };
      nextLabel = "Finish course"; nextHint = "Mark complete"; isFinish = true;
    }
    return { idx: idx, crumbs: crumbs, prev: prev, next: next, nextLabel: nextLabel, nextHint: nextHint, isFinish: isFinish, shortTitle: shortTitle };
  }

  // ── Read · Practice mode toggle (topic pages only) ───────────────────────
  var modeKey = "lace_mode_" + config.courseId;
  function getMode() {
    var m = urlParams.get("mode");
    if (m === "read" || m === "practice") return m;
    try { var s = localStorage.getItem(modeKey); if (s) return s; } catch (e) {}
    return "read";
  }
  function setMode(m) {
    try { localStorage.setItem(modeKey, m); } catch (e) {}
    document.documentElement.setAttribute("data-mode", m);
    if (m === "practice") buildSteps(); else teardownSteps();
    syncModeToggle();
  }
  function modeToggleHtml() {
    return '<div class="mode-toggle" role="tablist" aria-label="Reading mode">' +
      '<button data-mode-btn="read" type="button">' + icon("book", 14) + '<span class="mt-label">Read</span></button>' +
      '<button data-mode-btn="practice" type="button">' + icon("target", 14) + '<span class="mt-label">Practice</span></button>' +
      "</div>";
  }
  function syncModeToggle() {
    var m = document.documentElement.getAttribute("data-mode") || "read";
    document.querySelectorAll("[data-mode-btn]").forEach(function (b) {
      b.classList.toggle("active", b.getAttribute("data-mode-btn") === m);
    });
  }
  function wireModeToggle() {
    document.querySelectorAll("[data-mode-btn]").forEach(function (b) {
      b.addEventListener("click", function () { setMode(b.getAttribute("data-mode-btn")); });
    });
  }

  // ── Chrome bar (chrome="bar") ────────────────────────────────────────────
  function renderChromeBar(m) {
    var container = document.getElementById("lace-nav-container");
    if (!container) return;
    // Bar breadcrumb stays shallow (course › current topic) — the ☰ drawer
    // carries full navigation, so deeper levels here are just noise.
    var crumbHtml = "";
    m.crumbs.slice(-2).forEach(function (c, i) {
      if (i > 0) crumbHtml += '<span class="crumb-sep" aria-hidden="true">›</span>';
      crumbHtml += c.current
        ? '<span class="crumb crumb-current" aria-current="page">' + esc(c.label) + "</span>"
        : '<a class="crumb" href="' + (c.href || "#") + '">' + esc(c.label) + "</a>";
    });
    // Prev is icon-only on the bar (title kept as the accessible name).
    var prevHtml = m.prev
      ? '<a class="chrome-btn chrome-btn-icon" href="' + withParams(m.prev.url) +
        '" aria-label="Previous: ' + esc(m.prev.title).replace(/"/g, "&quot;") + '">' +
        icon("arrowLeft", 16) + "</a>" : "";
    // Next drops the uppercase subtitle — just the action label.
    var nextHtml =
      '<a class="chrome-next' + (m.isFinish ? " finish" : "") + '" href="' + withParams(m.next ? m.next.url : "#") + '">' +
        '<span class="chrome-next-label">' + esc(m.nextLabel) + "</span>" +
        icon("arrow", 14) + "</a>";
    var modeHtml = isOutline ? "" : modeToggleHtml();

    container.innerHTML =
      '<div class="wrap-chrome">' +
        '<div class="chrome-left">' +
          '<button class="chrome-icon-btn" id="lace-drawer-toggle" type="button" aria-label="Open course outline">' + icon("menu", 18) + "</button>" +
          '<a class="chrome-mark" href="' + config.homeLinkUrl + '" aria-label="LACE home">' + MARK + '<span class="mk-name">LACE</span></a>' +
          '<nav class="crumbs" aria-label="Breadcrumb">' + crumbHtml + "</nav>" +
        "</div>" +
        '<div class="chrome-actions">' + modeHtml + prevHtml + nextHtml + "</div>" +
      "</div>";
  }

  // ── Left rail (chrome="rail") ────────────────────────────────────────────
  function renderRail(m) {
    var container = document.getElementById("lace-nav-container");
    if (!container) return;
    var done = doneCount(), total = flatTopics.length, pct = total ? Math.round(done / total * 100) : 0;

    var topicsHtml = "";
    flatTopics.forEach(function (t, i) {
      var status = topicStatus(t.slug);
      var nodeClass = "node" + (status === "done" ? " done" : status === "active" ? " active" : "");
      var nodeInner = status === "done" ? icon("check", 12) : (i + 1);
      var cls = "rail-topic" + (t.slug === currentSlug ? " current" : "") + (status === "done" ? " done" : "");
      topicsHtml +=
        '<a class="' + cls + '" href="' + withParams(t.url) + '" title="' + esc(t.title) + '">' +
          '<span class="' + nodeClass + '">' + nodeInner + "</span>" +
          '<span class="rt-text"><span class="rt-title">' + esc(t.title) + "</span>" +
            '<span class="rt-meta">' + esc(t.kind || "Topic") + (t.minutes ? " · " + t.minutes + " min" : "") + "</span></span>" +
        "</a>";
    });

    var navRow = "";
    if (!isOutline) {
      var prevDisabled = !m.prev;
      navRow =
        '<div class="rail-nav-row">' +
          '<a class="chrome-btn" style="flex:1;justify-content:center;" ' + (prevDisabled ? 'aria-disabled="true"' : 'href="' + withParams(m.prev.url) + '"') + '>' + icon("arrowLeft", 14) + ' Previous</a>' +
          '<a class="chrome-next' + (m.isFinish ? " finish" : "") + '" style="flex:1;justify-content:center;" href="' + withParams(m.next ? m.next.url : "#") + '"><span class="chrome-next-label">' + esc(m.nextLabel) + "</span>" + icon("arrow", 14) + "</a>" +
        "</div>";
    } else {
      navRow = '<a class="chrome-next" style="justify-content:center;" href="' + withParams(m.next ? m.next.url : "#") + '"><span class="chrome-next-label">' + esc(m.nextLabel) + "</span>" + icon("arrow", 14) + "</a>";
    }

    var rail = document.createElement("aside");
    rail.className = "course-rail";
    rail.setAttribute("aria-label", "Course navigation");
    rail.innerHTML =
      '<div class="rail-brand">' + MARK + '<span class="mk-name">LACE</span></div>' +
      '<a class="rail-back" href="' + config.homeLinkUrl + '">' + icon("arrowLeft", 16) + '<span class="rb-label">' + esc(config.homeLinkText || "Back to Hub") + "</span></a>" +
      '<div class="rail-course">' +
        '<div class="rc-eyebrow">' + esc(config.courseArea || "Course") + "</div>" +
        '<div class="rc-title">' + esc(config.courseTitle) + "</div>" +
        '<div class="rc-track"><div style="width:' + pct + '%"></div></div>' +
        '<div class="rc-meta">' + done + " of " + total + " complete</div>" +
      "</div>" +
      '<nav class="rail-topics" aria-label="Topics">' + topicsHtml + "</nav>" +
      '<div class="rail-foot">' + (isOutline ? "" : (modeToggleHtml().replace('class="mode-toggle"', 'class="mode-toggle" style="width:100%"'))) + navRow +
        '<button class="rail-collapse" id="lace-rail-collapse" type="button">' + icon("chevronLeft", 18) + '<span class="rc-label">Collapse</span></button>' +
      "</div>";
    document.body.appendChild(rail);

    var collapse = document.getElementById("lace-rail-collapse");
    if (collapse) collapse.addEventListener("click", function () {
      var min = document.documentElement.getAttribute("data-rail") === "min";
      document.documentElement.setAttribute("data-rail", min ? "" : "min");
    });
  }

  // ── Outline drawer (bar mode) ─────────────────────────────────────────────
  function buildDrawer() {
    var done = doneCount(), total = flatTopics.length, pct = total ? Math.round(done / total * 100) : 0;
    var topicsHtml = "";
    flatTopics.forEach(function (t, i) {
      var status = topicStatus(t.slug);
      var nodeClass = "node" + (status === "done" ? " done" : status === "active" ? " active" : "");
      var nodeInner = status === "done" ? icon("check", 12) : i + 1;
      var rowClass = "drawer-topic" + (t.slug === currentSlug ? " current" : "") + (status === "done" ? " done" : "");
      var updated = "";
      if (t.updated) {
        var u = String(t.updated).toLowerCase();
        var col = u.indexOf("law") > -1 || u.indexOf("changed") > -1 ? "var(--status-changed-ink)"
          : u.indexOf("new") > -1 ? "var(--status-new-ink)" : "var(--status-updated-ink)";
        updated = ' <span style="color:' + col + ';font-weight:700;">● ' + esc(t.updated) + "</span>";
      }
      topicsHtml +=
        '<a class="' + rowClass + '" href="' + withParams(t.url) + '">' +
          '<span class="' + nodeClass + '">' + nodeInner + "</span>" +
          '<span><span class="dt-title">' + esc(t.title) + "</span>" +
            '<span class="dt-meta">' + esc(t.kind || "Topic") + (t.minutes ? " · " + t.minutes + " min" : "") + updated + "</span></span>" +
        "</a>";
    });
    var drawer = document.createElement("div");
    drawer.className = "outline-drawer";
    drawer.id = "lace-drawer";
    drawer.setAttribute("role", "dialog");
    drawer.setAttribute("aria-label", "Course outline");
    drawer.innerHTML =
      '<div class="drawer-head"><span class="eyebrow">Course outline</span>' +
        '<button class="drawer-close" id="lace-drawer-close" type="button" aria-label="Close outline">' + icon("close", 16) + "</button></div>" +
      '<div class="drawer-title">' + esc(config.courseTitle) + "</div>" +
      '<div><div class="drawer-track"><div style="width:' + pct + '%"></div></div>' +
        '<div class="dt-meta" style="margin-top:6px;">' + done + " of " + total + " complete</div></div>" +
      '<div style="margin-top:6px;display:flex;flex-direction:column;gap:2px;">' + topicsHtml + "</div>" +
      '<a class="drawer-exit" href="' + config.homeLinkUrl + '">' + icon("arrowLeft", 14) + " " + esc(config.homeLinkText || "Exit to Hub") + "</a>";
    var scrim = document.createElement("div");
    scrim.className = "drawer-scrim"; scrim.id = "lace-drawer-scrim";
    document.body.appendChild(scrim); document.body.appendChild(drawer);
    return { drawer: drawer, scrim: scrim };
  }
  function wireDrawer(drawer, scrim) {
    function open() { drawer.classList.add("open"); scrim.classList.add("open"); var c = document.getElementById("lace-drawer-close"); if (c) c.focus(); }
    function close() { drawer.classList.remove("open"); scrim.classList.remove("open"); }
    var toggle = document.getElementById("lace-drawer-toggle");
    if (toggle) toggle.addEventListener("click", open);
    scrim.addEventListener("click", close);
    var closeBtn = document.getElementById("lace-drawer-close");
    if (closeBtn) closeBtn.addEventListener("click", close);
    document.addEventListener("keydown", function (e) { if (e.key === "Escape") close(); });
  }

  // ── Progress hooks ────────────────────────────────────────────────────────
  function fillProgressHooks() {
    var done = doneCount(), total = flatTopics.length, pct = total ? Math.round(done / total * 100) : 0;
    document.querySelectorAll('[data-lace="course-progress"]').forEach(function (el) {
      var mode = el.getAttribute("data-lace-format") || "pct";
      el.textContent = mode === "fraction" ? done + " of " + total : pct + "%";
    });
    document.querySelectorAll('[data-lace="course-progress-bar"]').forEach(function (el) { el.style.width = pct + "%"; });
    var idx = currentIndex();
    var nextTopic = idx > -1 && idx < flatTopics.length - 1 ? flatTopics[idx + 1] : null;
    document.querySelectorAll('[data-lace="next-link"]').forEach(function (el) {
      el.setAttribute("href", withParams(nextTopic ? nextTopic.url : (config.completeUrl || config.courseHomeUrl)));
    });
  }

  // ── STEP-PACED MODE — paginate topic sections one at a time ──────────────
  var steps = { sections: [], idx: 0, stage: null };
  function buildSteps() {
    var body = document.querySelector(".topic-body");
    if (!body || steps.stage) return;
    var sections = Array.prototype.slice.call(body.querySelectorAll(":scope > .section"));
    if (sections.length < 2) return;          // not enough to paginate
    steps.sections = sections; steps.idx = 0;

    // Build the stage shell and move sections into a single visible card.
    var stage = document.createElement("div");
    stage.className = "step-stage";
    var segs = sections.map(function () { return '<span class="seg"><i></i></span>'; }).join("");
    stage.innerHTML =
      '<div class="step-segments">' + segs + "</div>" +
      '<div class="step-meta"><span class="step-counter"></span></div>' +
      '<div class="step-card"></div>' +
      '<div class="step-controls">' +
        '<button class="sc-prev" type="button">' + icon("arrowLeft", 15) + " Back</button>" +
        '<button class="sc-next" type="button"><span></span>' + icon("arrow", 15) + "</button>" +
      "</div>";
    var card = stage.querySelector(".step-card");
    sections.forEach(function (s) { card.appendChild(s); });   // relocate (kept for "read" restore)
    // Insert the stage where the first section was (before .next-up).
    var nextUp = body.querySelector(".next-up");
    body.insertBefore(stage, nextUp || null);
    steps.stage = stage;

    stage.querySelector(".sc-prev").addEventListener("click", function () { gotoStep(steps.idx - 1); });
    stage.querySelector(".sc-next").addEventListener("click", function () {
      if (steps.idx >= steps.sections.length - 1) {
        var m = navModel();
        window.location.href = withParams(m.next ? m.next.url : (config.completeUrl || config.courseHomeUrl));
      } else { gotoStep(steps.idx + 1); }
    });
    gotoStep(0);
  }
  function gotoStep(i) {
    if (!steps.stage) return;
    i = Math.max(0, Math.min(steps.sections.length - 1, i));
    steps.idx = i;
    steps.sections.forEach(function (s, k) { s.style.display = k === i ? "block" : "none"; });
    var segs = steps.stage.querySelectorAll(".step-segments .seg");
    segs.forEach(function (seg, k) { seg.classList.toggle("done", k < i); seg.classList.toggle("current", k === i); });
    var label = steps.sections[i].querySelector(".sr-label");
    steps.stage.querySelector(".step-counter").textContent =
      "Step " + (i + 1) + " of " + steps.sections.length + (label ? " · " + label.textContent.trim() : "");
    steps.stage.querySelector(".sc-prev").disabled = i === 0;
    var last = i === steps.sections.length - 1;
    var nb = steps.stage.querySelector(".sc-next");
    nb.querySelector("span").textContent = last ? "Finish topic" : "Continue";
    nb.classList.toggle("finish", last);
    steps.stage.scrollIntoView ? null : null; // (never auto-scroll per house rules)
  }
  function teardownSteps() {
    if (!steps.stage) return;
    var body = document.querySelector(".topic-body");
    var nextUp = body.querySelector(".next-up");
    steps.sections.forEach(function (s) { s.style.display = ""; body.insertBefore(s, steps.stage); });
    steps.stage.remove(); steps.stage = null; steps.sections = [];
  }

  // ── Interactive content: accordions ──────────────────────────────────────
  document.querySelectorAll(".accordion-header").forEach(function (header) {
    header.addEventListener("click", function () {
      var item = header.parentElement, content = item.querySelector(".accordion-content");
      var isOpen = item.classList.contains("active"), container = item.parentElement;
      if (container && container.classList.contains("accordion-single")) {
        container.querySelectorAll(".accordion-item").forEach(function (sib) {
          if (sib !== item && sib.classList.contains("active")) {
            sib.classList.remove("active");
            var sc = sib.querySelector(".accordion-content"); if (sc) sc.style.maxHeight = "0px";
          }
        });
      }
      if (isOpen) { item.classList.remove("active"); content.style.maxHeight = "0px"; }
      else { item.classList.add("active"); content.style.maxHeight = content.scrollHeight + "px"; }
    });
  });

  // ── Interactive content: tabs ────────────────────────────────────────────
  document.querySelectorAll(".tabs-container").forEach(function (group) {
    var buttons = group.querySelectorAll(".tab-btn"), panels = group.querySelectorAll(".tab-panel");
    buttons.forEach(function (btn) {
      btn.addEventListener("click", function () {
        var target = btn.getAttribute("data-tab");
        buttons.forEach(function (b) { b.classList.remove("active"); });
        panels.forEach(function (p) { p.classList.remove("active"); });
        btn.classList.add("active");
        var panel = group.querySelector('.tab-panel[data-tab-content="' + target + '"]');
        if (panel) panel.classList.add("active");
      });
    });
  });

  // ── Try-it self-check ─────────────────────────────────────────────────────
  document.querySelectorAll(".tryit-box").forEach(function (box) {
    var banner = box.querySelector(".answer-banner");
    box.querySelectorAll(".tryit-option").forEach(function (opt) {
      opt.addEventListener("click", function () {
        box.querySelectorAll(".tryit-option").forEach(function (o) {
          o.classList.remove("correct", "wrong");
          var y = o.querySelector(".tryit-you"); if (y) y.remove();
          var r = o.querySelector(".tryit-radio"); if (r) r.innerHTML = "";
        });
        var ok = opt.getAttribute("data-correct") === "true";
        opt.classList.add(ok ? "correct" : "wrong");
        var radio = opt.querySelector(".tryit-radio"); if (radio) radio.innerHTML = icon(ok ? "check" : "close", 12);
        var tag = document.createElement("span"); tag.className = "tryit-you"; tag.textContent = "You"; opt.appendChild(tag);
        if (banner) {
          banner.classList.remove("hidden");
          if (!ok) {
            var right = box.querySelector('.tryit-option[data-correct="true"]');
            if (right) { right.classList.add("correct"); var rr = right.querySelector(".tryit-radio"); if (rr) rr.innerHTML = icon("check", 12); }
          }
        }
      });
    });
  });

  // ── Iframe interceptor — bubble LMS topic links to the parent window ─────
  document.addEventListener("click", function (e) {
    var anchor = e.target.closest ? e.target.closest("a") : null;
    if (!anchor) return;
    var href = anchor.getAttribute("href");
    if (!href) return;
    if (window.self !== window.top &&
        (href.indexOf("/d2l/le/content/") !== -1 || href.indexOf("/viewContent/") !== -1)) {
      e.preventDefault();
      try { window.parent.location.href = href; } catch (err) { window.top.location.href = href; }
    }
  });

  // ── Reset (demo / testing) ───────────────────────────────────────────────
  window.resetLaceProgress = function () { localStorage.removeItem(storageKey); window.location.reload(); };

  // ── Boot ───────────────────────────────────────────────────────────────────
  var model = navModel();
  if (chromeMode === "rail") {
    renderRail(model);
    // Rail mode keeps a minimal top bar element absent; provide a drawer too
    // so nothing breaks if a page only has the bar toggle — but it's optional.
  } else {
    renderChromeBar(model);
    var parts = buildDrawer();
    wireDrawer(parts.drawer, parts.scrim);
  }
  wireModeToggle();
  fillProgressHooks();

  // Apply the saved reading mode on topic pages (also builds the step stage).
  if (!isOutline) {
    var startMode = getMode();
    document.documentElement.setAttribute("data-mode", startMode);
    if (startMode === "practice") buildSteps();
    syncModeToggle();
  }
});
