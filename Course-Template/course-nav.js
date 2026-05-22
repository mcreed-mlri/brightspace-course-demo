/**
 * LACE Course Wrapper — chrome, outline drawer & progress engine.
 *
 * Injects:
 *   • the chrome bar  (#lace-nav-container) — drawer toggle + breadcrumb + prev/next
 *   • the outline drawer (built and appended to <body>)
 * Tracks page-visit completion in localStorage to mock the LMS completion
 * engine, and fills any [data-lace="course-progress"] element.
 *
 * Pages opt in by including <div id="lace-nav-container"></div> and a
 * <meta name="course-slug" content="..."> tag.
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

  // ── Progress (localStorage) ──────────────────────────────────────────────
  function getProgress() {
    try {
      var stored = localStorage.getItem(storageKey);
      if (stored) return JSON.parse(stored);
    } catch (e) {
      console.warn("LACE: could not read localStorage.", e);
    }
    return { userName: "Learner", completed: [], lastVisited: null };
  }

  function saveProgress(data) {
    try {
      localStorage.setItem(storageKey, JSON.stringify(data));
    } catch (e) {
      console.warn("LACE: could not write localStorage.", e);
    }
  }

  function markComplete(slug) {
    var data = getProgress();
    if (data.completed.indexOf(slug) === -1) data.completed.push(slug);
    data.lastVisited = slug;
    saveProgress(data);
    progress = data;
  }

  var progress = getProgress();

  // Visiting a topic marks it complete — mirrors Brightspace "Automatic: Visited".
  if (currentSlug && !isOutline) markComplete(currentSlug);

  // ── Deploy-mode URL resolver ─────────────────────────────────────────────
  var isLmsMode = config.deployMode === "lms";
  function resolveTopicUrl(topic) {
    if (isLmsMode && topic.url && topic.url !== "#") return topic.url;
    return topic.file || topic.url || "#";
  }

  // ── Flattened topic list ─────────────────────────────────────────────────
  function getFlatTopics() {
    var list = [];
    config.modules.forEach(function (mod) {
      mod.topics.forEach(function (topic) {
        list.push({
          slug: topic.slug,
          title: topic.title,
          url: resolveTopicUrl(topic),
          kind: topic.kind || "",
          minutes: topic.minutes || 0,
          updated: topic.updated || "",
          description: topic.description || "",
          moduleId: mod.id,
          moduleTitle: mod.title,
        });
      });
    });
    return list;
  }

  var flatTopics = getFlatTopics();
  var completedSet = {};
  progress.completed.forEach(function (s) { completedSet[s] = true; });

  // Status taxonomy: done · active (the one in progress) · next · later.
  function topicStatus(slug) {
    if (completedSet[slug]) return "done";
    var firstOpen = null;
    var secondOpen = null;
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

  function currentIndex() {
    for (var i = 0; i < flatTopics.length; i++) {
      if (flatTopics[i].slug === currentSlug) return i;
    }
    return -1;
  }

  function firstIncomplete() {
    return flatTopics.find(function (t) { return !completedSet[t.slug]; }) || null;
  }

  // ── Inline icons ─────────────────────────────────────────────────────────
  function icon(name, size) {
    var s = size || 16;
    var paths = {
      menu: '<path d="M4 7h16M4 12h16M4 17h10"/>',
      arrow: '<path d="M5 12h14"/><path d="m13 6 6 6-6 6"/>',
      arrowLeft: '<path d="M19 12H5"/><path d="m11 6-6 6 6 6"/>',
      chevronRight: '<path d="m9 6 6 6-6 6"/>',
      check: '<path d="m5 12 4 4L19 6"/>',
      close: '<path d="m6 6 12 12M18 6 6 18"/>',
      play: '<path d="m8 5 11 7-11 7z"/>',
    };
    return '<svg width="' + s + '" height="' + s + '" viewBox="0 0 24 24" fill="none" ' +
      'stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" ' +
      'aria-hidden="true">' + (paths[name] || "") + '</svg>';
  }

  function esc(text) {
    var d = document.createElement("div");
    d.textContent = text == null ? "" : String(text);
    return d.innerHTML;
  }

  // ── Chrome bar ───────────────────────────────────────────────────────────
  function renderChrome() {
    var container = document.getElementById("lace-nav-container");
    if (!container) return;

    var shortTitle = (config.courseTitle || "").split(":")[0].trim();
    var idx = currentIndex();

    // Breadcrumb
    var crumbs = [{ label: config.hubLabel || "Hub", href: config.homeLinkUrl }];
    if (config.courseArea) crumbs.push({ label: config.courseArea, href: config.courseHomeUrl });
    if (isOutline) {
      crumbs.push({ label: config.courseTitle, current: true });
    } else {
      crumbs.push({ label: shortTitle, href: config.courseHomeUrl });
      crumbs.push({ label: flatTopics[idx] ? flatTopics[idx].title : config.courseTitle, current: true });
    }

    var crumbHtml = "";
    crumbs.forEach(function (c, i) {
      if (i > 0) crumbHtml += '<span class="crumb-sep" aria-hidden="true">›</span>';
      if (c.current) {
        crumbHtml += '<span class="crumb crumb-current" aria-current="page">' + esc(c.label) + "</span>";
      } else {
        crumbHtml += '<a class="crumb" href="' + (c.href || "#") + '">' + esc(c.label) + "</a>";
      }
    });

    // Prev / next
    var prev = !isOutline && idx > 0 ? flatTopics[idx - 1] : null;
    var next, nextLabel, nextHint, isFinish = false;
    if (isOutline) {
      var resume = firstIncomplete();
      next = resume || flatTopics[0];
      nextLabel = resume && progress.completed.length > 0 ? "Continue" : "Begin";
      nextHint = next ? next.title : "";
    } else if (idx > -1 && idx < flatTopics.length - 1) {
      next = flatTopics[idx + 1];
      nextLabel = "Continue";
      nextHint = next.title + (next.minutes ? " · " + next.minutes + " min" : "");
    } else {
      next = { url: config.courseHomeUrl };
      nextLabel = "Finish course";
      nextHint = "Return to outline";
      isFinish = true;
    }

    var prevHtml = prev
      ? '<a class="chrome-btn" href="' + prev.url + '">' + icon("arrowLeft", 14) +
        '<span class="chrome-prev-label">' + esc(prev.title) + "</span></a>"
      : "";

    var nextHtml =
      '<a class="chrome-next' + (isFinish ? " finish" : "") + '" href="' + (next ? next.url : "#") + '">' +
        '<span class="chrome-next-label">' + esc(nextLabel) +
          (nextHint ? '<span class="chrome-next-hint">' + esc(nextHint) + "</span>" : "") +
        "</span>" +
        icon("arrow", 14) +
      "</a>";

    container.innerHTML =
      '<div class="wrap-chrome">' +
        '<div class="chrome-left">' +
          '<button class="chrome-icon-btn" id="lace-drawer-toggle" type="button" aria-label="Open course outline">' +
            icon("menu", 18) +
          "</button>" +
          '<nav class="crumbs" aria-label="Breadcrumb">' + crumbHtml + "</nav>" +
        "</div>" +
        '<div class="chrome-actions">' + prevHtml + nextHtml + "</div>" +
      "</div>";
  }

  // ── Outline drawer ───────────────────────────────────────────────────────
  function buildDrawer() {
    var done = flatTopics.filter(function (t) { return completedSet[t.slug]; }).length;
    var total = flatTopics.length;
    var pct = total ? Math.round((done / total) * 100) : 0;

    var topicsHtml = "";
    flatTopics.forEach(function (t, i) {
      var status = topicStatus(t.slug);
      var nodeClass = "node" + (status === "done" ? " done" : status === "active" ? " active" : "");
      var nodeInner = status === "done" ? icon("check", 12) : i + 1;
      var rowClass = "drawer-topic" + (t.slug === currentSlug ? " current" : "") + (status === "done" ? " done" : "");
      var updated = "";
      if (t.updated) {
        // Match the outline page: status colour by change type, not topic.
        var u = String(t.updated).toLowerCase();
        var updColor =
          u.indexOf("law") > -1 || u.indexOf("changed") > -1
            ? "var(--status-changed-ink)"
            : u.indexOf("new") > -1
            ? "var(--status-new-ink)"
            : "var(--status-updated-ink)";
        updated = ' <span style="color:' + updColor + ';font-weight:700;">● ' + esc(t.updated) + "</span>";
      }
      topicsHtml +=
        '<a class="' + rowClass + '" href="' + t.url + '">' +
          '<span class="' + nodeClass + '">' + nodeInner + "</span>" +
          "<span>" +
            '<span class="dt-title">' + esc(t.title) + "</span>" +
            '<span class="dt-meta">' + esc(t.kind || "Topic") +
              (t.minutes ? " · " + t.minutes + " min" : "") + updated + "</span>" +
          "</span>" +
        "</a>";
    });

    var drawer = document.createElement("div");
    drawer.className = "outline-drawer";
    drawer.id = "lace-drawer";
    drawer.setAttribute("role", "dialog");
    drawer.setAttribute("aria-label", "Course outline");
    drawer.innerHTML =
      '<div class="drawer-head">' +
        '<span class="eyebrow">Course outline</span>' +
        '<button class="drawer-close" id="lace-drawer-close" type="button" aria-label="Close outline">' +
          icon("close", 16) +
        "</button>" +
      "</div>" +
      '<div class="drawer-title">' + esc(config.courseTitle) + "</div>" +
      '<div><div class="drawer-track"><div style="width:' + pct + '%"></div></div>' +
        '<div class="dt-meta" style="margin-top:6px;">' + done + " of " + total + " complete</div></div>" +
      '<div style="margin-top:6px;display:flex;flex-direction:column;gap:2px;">' + topicsHtml + "</div>" +
      '<a class="drawer-exit" href="' + config.homeLinkUrl + '">' + icon("arrowLeft", 14) +
        " " + esc(config.homeLinkText || "Exit to Hub") + "</a>";

    var scrim = document.createElement("div");
    scrim.className = "drawer-scrim";
    scrim.id = "lace-drawer-scrim";

    document.body.appendChild(scrim);
    document.body.appendChild(drawer);
    return { drawer: drawer, scrim: scrim };
  }

  function wireDrawer(drawer, scrim) {
    function open() {
      drawer.classList.add("open");
      scrim.classList.add("open");
      var close = document.getElementById("lace-drawer-close");
      if (close) close.focus();
    }
    function close() {
      drawer.classList.remove("open");
      scrim.classList.remove("open");
    }
    var toggle = document.getElementById("lace-drawer-toggle");
    if (toggle) toggle.addEventListener("click", open);
    scrim.addEventListener("click", close);
    var closeBtn = document.getElementById("lace-drawer-close");
    if (closeBtn) closeBtn.addEventListener("click", close);
    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape") close();
    });
  }

  // ── Course-progress hooks ────────────────────────────────────────────────
  function fillProgressHooks() {
    var done = flatTopics.filter(function (t) { return completedSet[t.slug]; }).length;
    var total = flatTopics.length;
    var pct = total ? Math.round((done / total) * 100) : 0;
    document.querySelectorAll('[data-lace="course-progress"]').forEach(function (el) {
      var mode = el.getAttribute("data-lace-format") || "pct";
      el.textContent = mode === "fraction" ? done + " of " + total : pct + "%";
    });
    document.querySelectorAll('[data-lace="course-progress-bar"]').forEach(function (el) {
      el.style.width = pct + "%";
    });

    // Point any "next up" editorial card at the real next topic.
    var idx = currentIndex();
    var nextTopic = idx > -1 && idx < flatTopics.length - 1 ? flatTopics[idx + 1] : null;
    document.querySelectorAll('[data-lace="next-link"]').forEach(function (el) {
      el.setAttribute("href", nextTopic ? nextTopic.url : config.courseHomeUrl);
    });
  }

  // ── Interactive content: accordions ──────────────────────────────────────
  document.querySelectorAll(".accordion-header").forEach(function (header) {
    header.addEventListener("click", function () {
      var item = header.parentElement;
      var content = item.querySelector(".accordion-content");
      var isOpen = item.classList.contains("active");
      var container = item.parentElement;
      if (container && container.classList.contains("accordion-single")) {
        container.querySelectorAll(".accordion-item").forEach(function (sib) {
          if (sib !== item && sib.classList.contains("active")) {
            sib.classList.remove("active");
            var sc = sib.querySelector(".accordion-content");
            if (sc) sc.style.maxHeight = "0px";
          }
        });
      }
      if (isOpen) {
        item.classList.remove("active");
        content.style.maxHeight = "0px";
      } else {
        item.classList.add("active");
        content.style.maxHeight = content.scrollHeight + "px";
      }
    });
  });

  // ── Interactive content: tabs ────────────────────────────────────────────
  document.querySelectorAll(".tabs-container").forEach(function (group) {
    var buttons = group.querySelectorAll(".tab-btn");
    var panels = group.querySelectorAll(".tab-panel");
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

  // ── Try-it self-check (topic pages) ──────────────────────────────────────
  document.querySelectorAll(".tryit-box").forEach(function (box) {
    var banner = box.querySelector(".answer-banner");
    box.querySelectorAll(".tryit-option").forEach(function (opt) {
      opt.addEventListener("click", function () {
        box.querySelectorAll(".tryit-option").forEach(function (o) {
          o.classList.remove("correct", "wrong");
          var y = o.querySelector(".tryit-you");
          if (y) y.remove();
          var r = o.querySelector(".tryit-radio");
          if (r) r.innerHTML = "";
        });
        var isCorrect = opt.getAttribute("data-correct") === "true";
        opt.classList.add(isCorrect ? "correct" : "wrong");
        var radio = opt.querySelector(".tryit-radio");
        if (radio) radio.innerHTML = icon(isCorrect ? "check" : "close", 12);
        var tag = document.createElement("span");
        tag.className = "tryit-you";
        tag.textContent = "You";
        opt.appendChild(tag);
        if (banner) {
          banner.classList.remove("hidden");
          // Reveal the correct answer's explanation regardless of the pick.
          if (!isCorrect) {
            var right = box.querySelector('.tryit-option[data-correct="true"]');
            if (right) {
              right.classList.add("correct");
              var rr = right.querySelector(".tryit-radio");
              if (rr) rr.innerHTML = icon("check", 12);
            }
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
      try {
        window.parent.location.href = href;
      } catch (err) {
        window.top.location.href = href;
      }
    }
  });

  // ── Reset (demo / testing) ───────────────────────────────────────────────
  window.resetLaceProgress = function () {
    localStorage.removeItem(storageKey);
    window.location.reload();
  };

  // ── Boot ─────────────────────────────────────────────────────────────────
  renderChrome();
  var parts = buildDrawer();
  wireDrawer(parts.drawer, parts.scrim);
  fillProgressHooks();
});
