(function () {
  var activeCourse = null;
  var lastPreflight = null;
  var lastConfigSnippet = "";
  var lastChecklist = "";

  function $(sel) { return document.querySelector(sel); }
  function $all(sel) { return Array.from(document.querySelectorAll(sel)); }

  function init() {
    bindTabs();
    bindCourses();
    bindOutline();
    bindTopicEditor();
    bindPreflight();
    bindExport();
    bindHub();
    var params = new URLSearchParams(location.search);
    var courseId = params.get("course");
    renderCourseList();
    if (courseId) selectCourse(courseId);
  }

  function bindTabs() {
    $all(".tab").forEach(function (btn) {
      btn.addEventListener("click", function () {
        var tab = btn.getAttribute("data-tab");
        $all(".tab").forEach(function (b) { b.classList.toggle("active", b === btn); });
        $all("[data-panel]").forEach(function (p) {
          p.classList.toggle("hidden", p.getAttribute("data-panel") !== tab);
        });
        if (tab === "topics") loadTopicEditor();
        if (tab === "outline") loadOutlineForm();
        if (tab === "export") updateExportPreview();
        if (tab === "hub") updateHubPreview();
      });
    });
  }

  function bindCourses() {
    $("#btn-new-course").addEventListener("click", async function () {
      var meta = LaceConfigBuilder.defaultCourse();
      var course = LaceCourseStore.createFromModel(meta);
      try {
        course.files = await LaceShellFactory.buildPackage(meta, {});
      } catch (e) {
        alert("Could not load templates. Open Studio from the repo folder.\n" + e.message);
        return;
      }
      LaceCourseStore.upsert(course);
      selectCourse(course.id);
    });

    $("#btn-import-folder").addEventListener("click", function () {
      $("#import-folder").click();
    });

    $("#import-folder").addEventListener("change", async function (e) {
      var fileList = e.target.files;
      if (!fileList || !fileList.length) return;
      var texts = await LaceZipExport.readFolderAsTextMap(fileList);
      var config = texts["course-config.js"] ? LaceChecker.parseCourseConfig(texts["course-config.js"]) : null;
      if (!config) {
        alert("No valid course-config.js in folder.");
        return;
      }
      var meta = Object.assign({}, config, {
        moduleTitle: config.modules && config.modules[0] ? config.modules[0].title : "Module 1",
        moduleDescription: config.modules && config.modules[0] ? config.modules[0].description : "",
        topics: LaceChecker.flattenTopics(config)
      });
      var course = LaceCourseStore.createFromModel(meta);
      course.files = texts;
      LaceCourseStore.upsert(course);
      selectCourse(course.id);
      e.target.value = "";
    });
  }

  function renderCourseList() {
    var list = $("#course-list");
    var courses = LaceCourseStore.loadAll();
    if (!courses.length) {
      list.innerHTML = '<p class="lede">No courses yet. Click "New course shell".</p>';
      return;
    }
    list.innerHTML = courses.map(function (c) {
      var m = c.meta || {};
      return '<article class="course-card' + (activeCourse && activeCourse.id === c.id ? " active" : "") + '" data-id="' + c.id + '">' +
        "<h3>" + esc(m.courseTitle || c.id) + "</h3>" +
        "<p>" + esc(m.courseId || "") + " · " + esc(c.releaseStatus || "Draft") + "</p></article>";
    }).join("");
    $all(".course-card").forEach(function (card) {
      card.addEventListener("click", function () {
        selectCourse(card.getAttribute("data-id"));
      });
    });
  }

  function selectCourse(id) {
    activeCourse = LaceCourseStore.get(id);
    LaceCourseStore.setActiveId(id);
    renderCourseList();
    if (!activeCourse) return;
    var m = activeCourse.meta || {};
    $("#active-title").textContent = m.courseTitle || id;
    $("#active-meta").textContent = (m.topics || []).length + " topics · " + (m.courseArea || "");
    loadOutlineForm();
    loadTopicEditor();
    updateHubPreview();
  }

  function bindOutline() {
    $("#btn-add-topic").addEventListener("click", function () {
      if (!activeCourse) return;
      var topics = activeCourse.meta.topics || [];
      var n = topics.length + 1;
      topics.push({
        slug: "topic-" + n,
        title: "Topic " + n,
        file: "topic-" + n + ".html",
        kind: "Concept",
        minutes: 3,
        description: "Outline description."
      });
      activeCourse.meta.topics = topics;
      renderTopicRows();
    });

    $("#outline-form").addEventListener("submit", function (e) {
      e.preventDefault();
      if (!activeCourse) return;
      var fd = new FormData(e.target);
      var meta = activeCourse.meta;
      ["courseId", "courseTitle", "courseSubtitle", "courseBlurb", "courseArea", "topic", "chromeMode", "deployMode", "moduleTitle", "moduleDescription"].forEach(function (k) {
        meta[k] = fd.get(k);
      });
      meta.topics = readTopicRows();
      activeCourse.meta = meta;
      activeCourse.files["course-config.js"] = LaceConfigBuilder.buildConfigJs(meta);
      LaceCourseStore.upsert(activeCourse);
      alert("Outline saved.");
    });

    $("#btn-regenerate-shell").addEventListener("click", async function () {
      if (!activeCourse) return;
      try {
        var topicModels = {};
        Object.keys(activeCourse.files || {}).forEach(function (name) {
          if (/^topic-.+\.html$/i.test(name) && activeCourse.files[name]) {
            topicModels[name] = LaceTopicParser.parseTopicHtml(activeCourse.files[name], name);
          }
        });
        activeCourse.files = await LaceShellFactory.buildPackage(activeCourse.meta, topicModels);
        LaceCourseStore.upsert(activeCourse);
        alert("Shell files regenerated.");
        loadTopicEditor();
      } catch (err) {
        alert("Regenerate failed: " + err.message);
      }
    });
  }

  function renderTopicRows() {
    if (!activeCourse) return;
    var topics = activeCourse.meta.topics || [];
    $("#topic-rows").innerHTML = topics.map(function (t, i) {
      return '<div class="topic-row" data-i="' + i + '">' +
        '<input data-f="title" value="' + escAttr(t.title) + '" placeholder="Title">' +
        '<input data-f="kind" value="' + escAttr(t.kind) + '" placeholder="Kind">' +
        '<input data-f="minutes" type="number" value="' + (t.minutes || 3) + '" min="1">' +
        '</div>';
    }).join("");
  }

  function readTopicRows() {
    var topics = (activeCourse.meta.topics || []).slice();
    $all("#topic-rows .topic-row").forEach(function (row, i) {
      if (!topics[i]) return;
      topics[i].title = row.querySelector('[data-f="title"]').value;
      topics[i].kind = row.querySelector('[data-f="kind"]').value;
      topics[i].minutes = parseInt(row.querySelector('[data-f="minutes"]').value, 10) || 3;
      topics[i].slug = topics[i].slug || ("topic-" + (i + 1));
      topics[i].file = topics[i].file || (topics[i].slug + ".html");
    });
    return topics;
  }

  function loadOutlineForm() {
    if (!activeCourse) return;
    var m = activeCourse.meta;
    var form = $("#outline-form");
    ["courseId", "courseTitle", "courseSubtitle", "courseBlurb", "courseArea", "topic", "chromeMode", "deployMode", "moduleTitle", "moduleDescription"].forEach(function (k) {
      var el = form.elements[k];
      if (el && m[k] != null) el.value = m[k];
    });
    renderTopicRows();
  }

  function bindTopicEditor() {
    $("#topic-select").addEventListener("change", function () {
      loadTopicForm($("#topic-select").value);
    });

    $("#btn-add-scenario").addEventListener("click", function () {
      addRepeaterField("#scenario-fields", "Describe the scenario.");
    });
    $("#btn-add-rule").addEventListener("click", function () {
      addRepeaterField("#rule-fields", "State the rule.");
    });
    $("#btn-add-remember").addEventListener("click", function () {
      addRepeaterField("#remember-fields", "<strong>Takeaway</strong> — why it matters.");
    });
    $("#btn-add-option").addEventListener("click", function () {
      addRepeaterField("#try-options", "Answer option");
    });

    $("#changed-enabled").addEventListener("change", function () {
      $("#changed-fields").classList.toggle("hidden", !this.checked);
    });

    $("#topic-form").addEventListener("submit", function (e) {
      e.preventDefault();
      if (!activeCourse) return;
      var file = $("#topic-select").value;
      if (!file) return;
      var model = readTopicForm(file);
      var topics = activeCourse.meta.topics || [];
      var idx = topics.findIndex(function (t) { return t.file === file; });
      var meta = idx >= 0 ? { index: idx + 1, total: topics.length, kind: topics[idx].kind, minutes: topics[idx].minutes } : {};
      activeCourse.files[file] = LaceTopicSerializer.serializeTopic(model, meta);
      if (idx >= 0) {
        topics[idx].title = model.title;
        activeCourse.meta.topics = topics;
        activeCourse.files["course-config.js"] = LaceConfigBuilder.buildConfigJs(activeCourse.meta);
      }
      LaceCourseStore.upsert(activeCourse);
      updateTopicPreview(model, meta);
      alert("Topic saved.");
    });

    $("#topic-form").addEventListener("input", debounce(function () {
      var file = $("#topic-select").value;
      if (!file || !activeCourse) return;
      var model = readTopicForm(file);
      var topics = activeCourse.meta.topics || [];
      var idx = topics.findIndex(function (t) { return t.file === file; });
      var meta = idx >= 0 ? { index: idx + 1, total: topics.length, kind: topics[idx].kind, minutes: topics[idx].minutes } : {};
      updateTopicPreview(model, meta);
    }, 400));
  }

  function loadTopicEditor() {
    var sel = $("#topic-select");
    if (!activeCourse || !activeCourse.files) {
      sel.innerHTML = "";
      return;
    }
    var files = Object.keys(activeCourse.files).filter(function (n) {
      return /^topic-.+\.html$/i.test(n);
    }).sort();
    sel.innerHTML = files.map(function (f) {
      return '<option value="' + f + '">' + f + "</option>";
    }).join("");
    if (files.length) loadTopicForm(files[0]);
  }

  function loadTopicForm(file) {
    if (!activeCourse || !activeCourse.files[file]) return;
    var model = LaceTopicParser.parseTopicHtml(activeCourse.files[file], file);
    var form = $("#topic-form");
    form.elements.title.value = model.title;
    form.elements.standfirst.value = model.standfirst;
    form.elements.tryPrompt.value = model.tryIt.prompt;
    form.elements.correctIndex.value = model.tryIt.correctIndex;
    form.elements.tryExplanation.value = model.tryIt.explanation;

    renderRepeater("#scenario-fields", model.scenario);
    renderRepeater("#rule-fields", model.rule.paragraphs);
    renderRepeater("#remember-fields", model.remember);
    renderRepeater("#try-options", model.tryIt.options);

    $("#rule-box-enabled").checked = model.rule.ruleBox && model.rule.ruleBox.enabled !== false;
    $("#changed-enabled").checked = !!(model.changed && model.changed.enabled);
    $("#changed-fields").classList.toggle("hidden", !$("#changed-enabled").checked);
    if (model.changed) {
      $("#changed-pill").value = model.changed.pill || "";
      $("#changed-citation").value = model.changed.citation || "";
      $("#changed-heading").value = model.changed.heading || "";
      $("#changed-body").value = model.changed.body || "";
    }

    var topics = activeCourse.meta.topics || [];
    var idx = topics.findIndex(function (t) { return t.file === file; });
    var meta = idx >= 0 ? { index: idx + 1, total: topics.length, kind: topics[idx].kind, minutes: topics[idx].minutes } : {};
    updateTopicPreview(model, meta);
  }

  function readTopicForm(file) {
    var topics = activeCourse.meta.topics || [];
    var t = topics.find(function (x) { return x.file === file; }) || {};
    return {
      fileName: file,
      slug: t.slug || file.replace(".html", ""),
      title: $("#topic-form").elements.title.value,
      standfirst: $("#topic-form").elements.standfirst.value,
      scenario: readRepeater("#scenario-fields"),
      rule: {
        paragraphs: readRepeater("#rule-fields"),
        ruleBox: { enabled: $("#rule-box-enabled").checked, label: "Key points", items: [] }
      },
      changed: $("#changed-enabled").checked ? {
        enabled: true,
        pill: $("#changed-pill").value,
        citation: $("#changed-citation").value,
        heading: $("#changed-heading").value,
        body: $("#changed-body").value
      } : null,
      tryIt: {
        prompt: $("#topic-form").elements.tryPrompt.value,
        options: readRepeater("#try-options"),
        correctIndex: parseInt($("#topic-form").elements.correctIndex.value, 10) || 0,
        explanation: $("#topic-form").elements.tryExplanation.value
      },
      remember: readRepeater("#remember-fields")
    };
  }

  function renderRepeater(sel, items) {
    var el = $(sel);
    el.innerHTML = (items || []).map(function (text, i) {
      return repeaterHtml(text, i);
    }).join("");
    bindRepeaterRemove(el);
  }

  function addRepeaterField(sel, placeholder) {
    var el = $(sel);
    el.insertAdjacentHTML("beforeend", repeaterHtml(placeholder, el.children.length));
    bindRepeaterRemove(el);
  }

  function repeaterHtml(text, i) {
    return '<div class="repeater-item" data-i="' + i + '"><textarea rows="2">' + esc(text) + '</textarea><button type="button" class="secondary btn-rm">Remove</button></div>';
  }

  function bindRepeaterRemove(container) {
    container.querySelectorAll(".btn-rm").forEach(function (btn) {
      btn.onclick = function () { btn.parentElement.remove(); };
    });
  }

  function readRepeater(sel) {
    return $all(sel + " textarea").map(function (ta) { return ta.value; }).filter(Boolean);
  }

  function updateTopicPreview(model, meta) {
    var html = LaceTopicSerializer.serializeTopic(model, meta);
    var iframe = $("#topic-preview");
    var blob = new Blob([html], { type: "text/html" });
    iframe.src = URL.createObjectURL(blob);
  }

  function bindPreflight() {
    $("#btn-run-preflight").addEventListener("click", runPreflight);
  }

  async function runPreflight() {
    if (!activeCourse || !activeCourse.files) {
      alert("Select a course first.");
      return;
    }
    var pseudoFiles = Object.keys(activeCourse.files).map(function (name) {
      var content = activeCourse.files[name];
      return { name: name, text: function () { return Promise.resolve(content); } };
    });
    var apiText = $("#preflight-api-urls").value;
    var apiTopicUrls = apiText ? LaceBrightspaceApi.parseContentInput(apiText) : null;
    var result = await LaceChecker.runCheck({
      files: pseudoFiles,
      homeUrl: $("#preflight-home-url").value.trim(),
      apiTopicUrls: apiTopicUrls
    });
    lastPreflight = result;
    lastConfigSnippet = result.configUrlSnippet;
    lastChecklist = result.checklist;
    activeCourse.preflightScore = result.summary.score;
    LaceCourseStore.upsert(activeCourse);

    $("#preflight-summary").textContent = result.summary.errors
      ? "Needs fixes — " + result.summary.errors + " error(s), " + result.summary.warnings + " warning(s)."
      : result.summary.warnings
        ? "Almost ready — " + result.summary.warnings + " warning(s)."
        : "Brightspace ready — no blockers.";

    var fixEl = $("#preflight-fix-first");
    if (result.summary.fixFirst && result.summary.fixFirst.length) {
      fixEl.classList.remove("hidden");
      fixEl.innerHTML = "<strong>Fix these first</strong><ol>" + result.summary.fixFirst.map(function (c) {
        return "<li>" + esc(c.title) + " — " + esc(c.detail) + "</li>";
      }).join("") + "</ol>";
    } else {
      fixEl.classList.add("hidden");
    }

    $("#preflight-results").innerHTML = result.checks.map(function (c) {
      return '<div class="check-item ' + c.level + '"><strong>' + esc(c.title) + "</strong><br>" + esc(c.detail) + "</div>";
    }).join("");
    updateExportPreview();
  }

  function bindExport() {
    $("#btn-download-zip").addEventListener("click", async function () {
      if (!activeCourse || !activeCourse.files) return;
      var name = (activeCourse.meta.courseId || "lace-course") + ".zip";
      await LaceZipExport.downloadZip(activeCourse.files, name);
    });
    $("#btn-copy-checklist").addEventListener("click", function () {
      copyText(lastChecklist || (lastPreflight && lastPreflight.checklist));
    });
    $("#btn-copy-config-snippet").addEventListener("click", function () {
      copyText(lastConfigSnippet);
    });
  }

  function updateExportPreview() {
    $("#export-config-preview").textContent = lastConfigSnippet || "Run preflight with a Home URL to generate config snippets.";
  }

  function bindHub() {
    $("#btn-sync-release").addEventListener("click", function () {
      if (!activeCourse) return;
      activeCourse.releaseStatus = $("#hub-status").value;
      activeCourse.brightspaceOu = $("#hub-ou").value;
      LaceHubBridge.syncToReleaseDemo(activeCourse);
      LaceCourseStore.upsert(activeCourse);
      updateHubPreview();
      alert("Synced to release demo localStorage.");
    });
    $("#btn-open-release").addEventListener("click", function () {
      LaceHubBridge.openReleaseDemo(activeCourse ? activeCourse.id : "");
    });
    $("#btn-export-manifest").addEventListener("click", function () {
      if (!activeCourse) return;
      copyText(LaceHubBridge.exportManifestJson(activeCourse));
    });
    $("#btn-fetch-api").addEventListener("click", async function () {
      var proxy = $("#hub-proxy").value.trim();
      var ou = $("#hub-ou").value.trim();
      var token = $("#hub-token").value;
      var result = await LaceBrightspaceApi.fetchContentViaProxy(proxy, ou, token);
      if (!result.ok) {
        alert(result.error + "\n\n" + LaceBrightspaceApi.API_PROXY_HINT);
        return;
      }
      $("#preflight-api-urls").value = result.topics.map(function (t) {
        return t.file + " -> " + t.url;
      }).join("\n");
      alert("Fetched " + result.topics.length + " URLs into Preflight paste area. Switch to Preflight tab and run check.");
    });
  }

  function updateHubPreview() {
    if (!activeCourse) {
      $("#hub-manifest-preview").textContent = "";
      return;
    }
    $("#hub-status").value = activeCourse.releaseStatus || "Draft";
    $("#hub-ou").value = activeCourse.brightspaceOu || "";
    $("#hub-manifest-preview").textContent = LaceHubBridge.exportManifestJson(activeCourse);
  }

  function copyText(text) {
    if (!text) return;
    navigator.clipboard.writeText(text);
  }

  function debounce(fn, ms) {
    var t;
    return function () {
      var args = arguments;
      clearTimeout(t);
      t = setTimeout(function () { fn.apply(null, args); }, ms);
    };
  }

  function esc(s) {
    var d = document.createElement("div");
    d.textContent = s == null ? "" : String(s);
    return d.innerHTML;
  }

  function escAttr(s) {
    return esc(s).replace(/"/g, "&quot;");
  }

  init();
})();
