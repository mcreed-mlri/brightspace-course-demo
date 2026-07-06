/**
 * LACE preflight checker — shared by Brightspace-Ready and LACE Course Studio.
 */
(function (global) {
  var REQUIRED_FILES = ["Home.html", "complete.html", "course-config.js", "course-style.css", "course-nav.js"];
  var IGNORE_LINK_PREFIXES = ["http:", "https:", "mailto:", "tel:", "#", "javascript:"];
  var REGISTRY_KEY = "lace_course_id_registry";

  var CANONICAL_HASHES = {
    "course-nav.js": "b5341c2f",
    "course-style.css": "9e41fe3b"
  };

  function djb2Hash(text) {
    var h = 5381;
    for (var i = 0; i < text.length; i++) {
      h = ((h << 5) + h) ^ text.charCodeAt(i);
    }
    return (h >>> 0).toString(16);
  }

  function pass(title, detail, priority) {
    return { level: "passed", title: title, detail: detail, priority: priority || 99 };
  }
  function warn(title, detail, priority) {
    return { level: "warning", title: title, detail: detail, priority: priority || 50 };
  }
  function fail(title, detail, priority) {
    return { level: "error", title: title, detail: detail, priority: priority || 10 };
  }

  function parseCourseConfig(text) {
    try {
      var win = {};
      Function("window", text + "\nreturn window.COURSE_CONFIG;")(win);
      return win.COURSE_CONFIG || null;
    } catch (e) {
      return null;
    }
  }

  function parseHtml(text) {
    try {
      return new DOMParser().parseFromString(text, "text/html");
    } catch (e) {
      return null;
    }
  }

  function flattenTopics(config) {
    var topics = [];
    (config.modules || []).forEach(function (module) {
      (module.topics || []).forEach(function (topic) {
        topics.push(topic);
      });
    });
    return topics;
  }

  function extractSlugs(htmlTexts) {
    var map = {};
    Object.keys(htmlTexts).forEach(function (fileName) {
      var doc = parseHtml(htmlTexts[fileName]);
      var meta = doc && doc.querySelector('meta[name="course-slug"]');
      if (meta) map[fileName] = meta.getAttribute("content") || "";
    });
    return map;
  }

  function checkFrameworkRefs(fileName, doc) {
    var checks = [];
    var css = doc.querySelector('link[href="course-style.css"]');
    var config = doc.querySelector('script[src="course-config.js"]');
    var nav = doc.querySelector('script[src="course-nav.js"]');
    checks.push(css ? pass("Stylesheet linked", fileName + " links course-style.css.") : fail("Stylesheet missing", fileName + " does not link course-style.css.", 5));
    checks.push(config ? pass("Config script linked", fileName + " links course-config.js.") : fail("Config script missing", fileName + " does not link course-config.js.", 5));
    checks.push(nav ? pass("Nav script linked", fileName + " links course-nav.js.") : fail("Nav script missing", fileName + " does not link course-nav.js.", 5));
    return checks;
  }

  function isLocalRef(ref) {
    if (!ref) return false;
    var lower = ref.toLowerCase();
    return !IGNORE_LINK_PREFIXES.some(function (prefix) { return lower.indexOf(prefix) === 0; });
  }

  function normalizeRef(ref) {
    return ref.split("#")[0].split("?")[0].replace(/^\.?\//, "");
  }

  function checkLocalLinks(fileName, doc, byName) {
    var checks = [];
    var refs = Array.from(doc.querySelectorAll("[href], [src]")).map(function (el) {
      return el.getAttribute("href") || el.getAttribute("src") || "";
    }).filter(isLocalRef).map(normalizeRef);

    refs.forEach(function (ref) {
      checks.push(byName[ref]
        ? pass("Local reference exists", fileName + " references " + ref + ".")
        : fail("Broken local reference", fileName + " references missing file " + ref + ".", 15));
    });
    return checks;
  }

  function buildUrlMap(homeUrl, htmlFiles) {
    if (!homeUrl) return { ok: false, error: "No Home.html URL pasted." };
    try {
      var url = new URL(homeUrl);
      if (!/\/Home\.html$/i.test(url.pathname)) {
        return { ok: false, error: "The pasted URL should end with /Home.html before the query string." };
      }
      var basePath = url.pathname.replace(/Home\.html$/i, "");
      return {
        ok: true,
        urls: htmlFiles.map(function (fileName) {
          var next = new URL(url.toString());
          next.pathname = basePath + fileName;
          return { file: fileName, url: next.toString() };
        })
      };
    } catch (e) {
      return { ok: false, error: "The pasted Home.html URL is not a valid URL." };
    }
  }

  function urlsSimilar(a, b) {
    try {
      var one = new URL(a, "https://example.com");
      var two = new URL(b, "https://example.com");
      return one.pathname === two.pathname && one.search === two.search;
    } catch (e) {
      return a === b;
    }
  }

  function checkTryIt(fileName, doc) {
    var checks = [];
    var box = doc.querySelector(".tryit-box");
    if (!box) {
      checks.push(warn("No try-it block", fileName + " has no .tryit-box section.", 40));
      return checks;
    }
    var options = box.querySelectorAll(".tryit-option[data-correct]");
    var correct = box.querySelectorAll('.tryit-option[data-correct="true"]');
    checks.push(options.length
      ? pass("Try-it options present", fileName + " has " + options.length + " try-it option(s).")
      : fail("Try-it options missing", fileName + " try-it block has no .tryit-option buttons.", 20));
    checks.push(correct.length === 1
      ? pass("Try-it correct answer", fileName + " marks exactly one correct answer.")
      : fail("Try-it correct answer", fileName + " must have exactly one data-correct=\"true\" (found " + correct.length + ").", 12));
    var banner = box.querySelector(".answer-banner span");
    var bannerText = banner ? banner.textContent.replace(/\s+/g, " ").trim() : "";
    checks.push(bannerText.length > 10
      ? pass("Try-it explanation", fileName + " has answer explanation text.")
      : warn("Try-it explanation", fileName + " answer banner text is missing or very short.", 45));
    return checks;
  }

  function checkSection3Stub(fileName, htmlText) {
    if (/not used in this topic/i.test(htmlText)) {
      return [fail("Section 3 placeholder", fileName + " still contains the §3 \"not used\" placeholder — remove or replace it.", 8)];
    }
    return [pass("No §3 placeholder", fileName + " has no §3 stub section.")];
  }

  function parseEyebrow(text) {
    var m = text.match(/Topic\s+(\d+)\s+of\s+(\d+)\s*·\s*([^·]+)\s*·\s*(\d+)\s*min/i);
    if (!m) return null;
    return { index: parseInt(m[1], 10), total: parseInt(m[2], 10), kind: m[3].trim(), minutes: parseInt(m[4], 10) };
  }

  function checkEyebrowDrift(fileName, doc, topicMeta, totalTopics) {
    var checks = [];
    var eyebrow = doc.querySelector(".eyebrow");
    if (!eyebrow || !topicMeta) return checks;
    var parsed = parseEyebrow(eyebrow.textContent);
    if (!parsed) {
      checks.push(warn("Eyebrow format", fileName + " eyebrow does not match \"Topic N of M · Kind · X min\".", 48));
      return checks;
    }
    checks.push(parsed.index === topicMeta.index
      ? pass("Eyebrow topic index", fileName + " eyebrow index matches config position.")
      : warn("Eyebrow topic index drift", fileName + " shows Topic " + parsed.index + " but config position is " + topicMeta.index + ".", 35));
    checks.push(parsed.total === totalTopics
      ? pass("Eyebrow topic count", fileName + " eyebrow total matches config.")
      : warn("Eyebrow total drift", fileName + " shows " + parsed.total + " topics but config has " + totalTopics + ".", 36));
    if (topicMeta.kind && parsed.kind.toLowerCase() !== String(topicMeta.kind).toLowerCase()) {
      checks.push(warn("Eyebrow kind drift", fileName + " eyebrow kind \"" + parsed.kind + "\" differs from config \"" + topicMeta.kind + "\".", 37));
    }
    if (topicMeta.minutes && parsed.minutes !== topicMeta.minutes) {
      checks.push(warn("Eyebrow minutes drift", fileName + " eyebrow shows " + parsed.minutes + " min but config has " + topicMeta.minutes + ".", 38));
    }
    return checks;
  }

  function checkFrameworkFingerprint(byName, fileTexts) {
    var checks = [];
    ["course-nav.js", "course-style.css"].forEach(function (name) {
      if (!fileTexts[name]) return;
      var hash = djb2Hash(fileTexts[name]);
      var expected = CANONICAL_HASHES[name];
      checks.push(hash === expected
        ? pass("Framework fingerprint", name + " matches the canonical Blank-Course version.")
        : warn("Framework fingerprint", name + " differs from canonical template — intentional fork or accidental edit?", 42));
    });
    return checks;
  }

  function loadRegistry() {
    try {
      return JSON.parse(localStorage.getItem(REGISTRY_KEY) || "[]");
    } catch (e) {
      return [];
    }
  }

  function saveRegistry(ids) {
    try {
      localStorage.setItem(REGISTRY_KEY, JSON.stringify(ids));
    } catch (e) {}
  }

  function registerCourseId(courseId) {
    if (!courseId) return;
    var ids = loadRegistry();
    if (ids.indexOf(courseId) === -1) {
      ids.push(courseId);
      saveRegistry(ids);
    }
  }

  function checkCourseIdUnique(courseId, extraIds) {
    if (!courseId) return [warn("No courseId", "course-config.js has no courseId.", 30)];
    var registry = loadRegistry().concat(extraIds || []);
    var dupes = registry.filter(function (id) { return id === courseId; });
    if (dupes.length > 1) {
      return [warn("courseId may duplicate", "courseId \"" + courseId + "\" appears in the registry more than once.", 25)];
    }
    return [pass("courseId present", "courseId is \"" + courseId + "\".")];
  }

  function validateBrightspaceContentUrl(url) {
    if (!url || url === "#") return { ok: false, reason: "empty" };
    if (/\/d2l\/le\/content\/\d+\/viewContent\/\d+\/View/i.test(url)) return { ok: true, type: "viewContent" };
    if (/\/content\/enforced\//i.test(url)) return { ok: true, type: "enforced" };
    return { ok: false, reason: "pattern" };
  }

  function checkBrightspaceApiUrls(config, apiTopicUrls) {
    var checks = [];
    if (!apiTopicUrls || !apiTopicUrls.length) return checks;
    var byFile = {};
    apiTopicUrls.forEach(function (item) { byFile[item.file] = item.url; });
    flattenTopics(config).forEach(function (topic) {
      var apiUrl = byFile[topic.file];
      if (!apiUrl) {
        checks.push(warn("API: topic missing", topic.file + " not found in Brightspace Content API results.", 22));
        return;
      }
      if (topic.url && topic.url !== "#" && !urlsSimilar(topic.url, apiUrl)) {
        checks.push(fail("API: URL mismatch", topic.file + " config URL differs from Brightspace Content.", 14));
      } else {
        checks.push(pass("API: URL match", topic.file + " matches Brightspace Content URL."));
      }
    });
    return checks;
  }

  function sortChecks(checks) {
    return checks.slice().sort(function (a, b) {
      var order = { error: 0, warning: 1, passed: 2 };
      var d = (order[a.level] || 9) - (order[b.level] || 9);
      if (d !== 0) return d;
      return (a.priority || 99) - (b.priority || 99);
    });
  }

  function generateConfigUrlSnippet(config, urlMap) {
    if (!urlMap || !urlMap.ok) return "";
    var byFile = {};
    urlMap.urls.forEach(function (item) { byFile[item.file] = item.url; });
    var lines = [];
    lines.push("// Paste into course-config.js after uploading to Brightspace");
    if (byFile["Home.html"]) lines.push('courseHomeUrl: "' + byFile["Home.html"] + '",');
    if (byFile["complete.html"]) lines.push('completeUrl: "' + byFile["complete.html"] + '",');
    lines.push('deployMode: "lms",');
    lines.push("// Topic urls:");
    flattenTopics(config || { modules: [] }).forEach(function (topic) {
      if (byFile[topic.file]) {
        lines.push("// " + topic.slug);
        lines.push('url: "' + byFile[topic.file] + '", // ' + topic.file);
      }
    });
    return lines.join("\n");
  }

  function buildChecklistMarkdown(meta) {
    var lines = [];
    lines.push("# Brightspace upload checklist");
    lines.push("");
    lines.push("Course: **" + (meta.courseTitle || "Unknown") + "**");
    lines.push("courseId: `" + (meta.courseId || "") + "`");
    lines.push("Checked: " + new Date().toISOString().slice(0, 10));
    lines.push("Errors: " + meta.errors + " · Warnings: " + meta.warnings);
    lines.push("");
    lines.push("## Local / repo");
    lines.push("- [ ] Brightspace Ready preflight passed (no errors)");
    lines.push("- [ ] Unique courseId for this offering");
    lines.push("- [ ] Topic slugs match course-config.js");
    lines.push("- [ ] No §3 placeholder stubs in topic HTML");
    lines.push("- [ ] Try-it: one correct answer, explanation filled");
    lines.push("- [ ] Local images/PDFs exist in the course folder");
    lines.push("");
    lines.push("## Brightspace Manage Files");
    lines.push("- [ ] Upload entire folder (overwrite on updates)");
    lines.push("- [ ] Required: Home.html, topics, complete.html, course-config.js, course-style.css, course-nav.js");
    lines.push("");
    lines.push("## Brightspace Content");
    lines.push("- [ ] One Content topic per HTML page (Add from Manage Files)");
    lines.push("- [ ] Required pages: Automatic: Visited");
    lines.push("- [ ] Paste Brightspace URLs into course-config.js url fields");
    lines.push("- [ ] Set courseHomeUrl, completeUrl, deployMode: \"lms\"");
    lines.push("- [ ] Re-upload course-config.js");
    lines.push("- [ ] Course home launch link points to Home.html");
    lines.push("");
    lines.push("## Smoke test (learner account)");
    lines.push("- [ ] Home.html loads CSS/JS; outline works");
    lines.push("- [ ] Prev/Next use Brightspace URLs (not local filenames)");
    lines.push("- [ ] Each topic marks complete on visit");
    lines.push("- [ ] complete.html reachable after last topic");
    lines.push("- [ ] Mobile layout checked at 720px width");
    if (meta.fixFirst && meta.fixFirst.length) {
      lines.push("");
      lines.push("## Fix first");
      meta.fixFirst.forEach(function (item) {
        lines.push("- [ ] **" + item.title + "**: " + item.detail);
      });
    }
    return lines.join("\n");
  }

  async function indexFromFileList(files) {
    var byName = {};
    files.forEach(function (file) {
      byName[file.name] = file;
    });
    return byName;
  }

  async function readTexts(byName, names) {
    var out = {};
    for (var i = 0; i < names.length; i++) {
      if (byName[names[i]]) out[names[i]] = await byName[names[i]].text();
    }
    return out;
  }

  async function runCheck(options) {
    var files = options.files || [];
    var homeUrl = (options.homeUrl || "").trim();
    var extraRegistryIds = options.extraRegistryIds || [];
    var apiTopicUrls = options.apiTopicUrls || null;
    var checks = [];

    if (!files.length) {
      return {
        checks: [fail("No folder selected", "Choose a course folder before running the readiness check.", 1)],
        mapText: "",
        configUrlSnippet: "",
        checklist: "",
        summary: { errors: 1, warnings: 0, passed: 0, score: 0 }
      };
    }

    var byName = await indexFromFileList(files);
    var htmlFiles = Object.keys(byName).filter(function (n) { return /\.html$/i.test(n); }).sort();
    var topicPages = htmlFiles.filter(function (n) {
      return !/^home\.html$/i.test(n) && !/^complete\.html$/i.test(n);
    });
    var allNames = Object.keys(byName);
    var fileTexts = await readTexts(byName, allNames);
    var htmlTexts = await readTexts(byName, htmlFiles);
    var configText = fileTexts["course-config.js"] || "";
    var config = configText ? parseCourseConfig(configText) : null;

    REQUIRED_FILES.forEach(function (name) {
      checks.push(byName[name]
        ? pass("Required file exists", name + " is present.")
        : fail("Missing required file", name + " was not found in the selected folder.", 3));
    });

    if (config) {
      checks.push(pass("course-config.js parses", "The LACE config object was detected."));
      checks.push(config.deployMode === "lms"
        ? pass("Deploy mode is LMS", "deployMode is set to lms for Brightspace navigation.")
        : warn("Deploy mode is not LMS", "Current deployMode is " + JSON.stringify(config.deployMode) + ". Use local while drafting, then switch to lms before production.", 28));
      checks = checks.concat(checkCourseIdUnique(config.courseId, extraRegistryIds));
      if (config.courseId) registerCourseId(config.courseId);
    } else {
      checks.push(fail("course-config.js did not parse", "Could not read window.COURSE_CONFIG.", 2));
    }

    checks = checks.concat(checkFrameworkFingerprint(byName, fileTexts));

    var slugMap = extractSlugs(htmlTexts);
    topicPages.forEach(function (fileName) {
      checks.push(slugMap[fileName]
        ? pass("Topic slug exists", fileName + " has course-slug " + slugMap[fileName] + ".")
        : fail("Topic slug missing", fileName + " needs meta name=\"course-slug\".", 6));
      checks = checks.concat(checkSection3Stub(fileName, htmlTexts[fileName] || ""));
    });

    var configTopics = config ? flattenTopics(config) : [];
    var totalTopics = configTopics.length;

    if (config && configTopics.length) {
      var filesInConfig = {};
      var slugsInConfig = {};
      configTopics.forEach(function (topic, idx) {
        filesInConfig[topic.file] = topic;
        slugsInConfig[topic.slug] = topic;
        topic._index = idx + 1;
        checks.push(byName[topic.file]
          ? pass("Configured topic file exists", topic.file + " exists for " + topic.title + ".")
          : fail("Configured topic file missing", topic.file + " listed in config but not present.", 7));
        checks.push(slugMap[topic.file] === topic.slug
          ? pass("Slug matches config", topic.file + " slug matches " + topic.slug + ".")
          : fail("Slug mismatch", topic.file + " slug " + JSON.stringify(slugMap[topic.file]) + " vs config " + JSON.stringify(topic.slug) + ".", 9));
        checks.push(topic.url && topic.url !== "#"
          ? (validateBrightspaceContentUrl(topic.url).ok
            ? pass("Topic URL filled", topic.file + " has a Brightspace-style URL.")
            : warn("Topic URL pattern", topic.file + " URL may not match expected Brightspace patterns.", 44))
          : warn("Topic URL placeholder", topic.file + " still has blank or # URL.", 32));
      });

      topicPages.forEach(function (fileName) {
        checks.push(filesInConfig[fileName]
          ? pass("HTML page is configured", fileName + " appears in course-config.js.")
          : warn("HTML page not in config", fileName + " exists but is not listed as a topic.", 46));
        var doc = parseHtml(htmlTexts[fileName]);
        if (doc && filesInConfig[fileName]) {
          checks = checks.concat(checkEyebrowDrift(fileName, doc, {
            index: filesInConfig[fileName]._index,
            kind: filesInConfig[fileName].kind,
            minutes: filesInConfig[fileName].minutes
          }, totalTopics));
          checks = checks.concat(checkTryIt(fileName, doc));
        }
      });

      if (apiTopicUrls) {
        checks = checks.concat(checkBrightspaceApiUrls(config, apiTopicUrls));
      }
    }

    htmlFiles.forEach(function (fileName) {
      var doc = parseHtml(htmlTexts[fileName]);
      if (!doc) return;
      checks = checks.concat(checkFrameworkRefs(fileName, doc));
      checks = checks.concat(checkLocalLinks(fileName, doc, byName));
    });

    var generatedMap = buildUrlMap(homeUrl, htmlFiles);
    if (homeUrl) {
      checks.push(generatedMap.ok
        ? pass("Home URL accepted", "Generated matching URLs for " + htmlFiles.length + " HTML files.")
        : fail("Home URL not usable", generatedMap.error, 11));
    } else {
      checks.push(warn("No Home URL pasted", "Paste the Brightspace Home.html URL to generate and compare file URLs.", 50));
    }

    if (generatedMap.ok && config) {
      var expectedByFile = {};
      generatedMap.urls.forEach(function (item) { expectedByFile[item.file] = item.url; });
      if (config.courseHomeUrl) {
        checks.push(urlsSimilar(config.courseHomeUrl, expectedByFile["Home.html"])
          ? pass("courseHomeUrl matches", "courseHomeUrl points to Home.html.")
          : warn("courseHomeUrl differs", "Expected " + expectedByFile["Home.html"] + " but found " + config.courseHomeUrl + ".", 33));
      }
      configTopics.forEach(function (topic) {
        if (!topic.url || topic.url === "#" || !expectedByFile[topic.file]) return;
        checks.push(urlsSimilar(topic.url, expectedByFile[topic.file])
          ? pass("Topic URL matches pattern", topic.file + " URL matches pasted Home.html pattern.")
          : warn("Topic URL differs", topic.file + " may need " + expectedByFile[topic.file], 34));
      });
    }

    checks = sortChecks(checks);
    var errors = checks.filter(function (c) { return c.level === "error"; }).length;
    var warnings = checks.filter(function (c) { return c.level === "warning"; }).length;
    var passed = checks.filter(function (c) { return c.level === "passed"; }).length;
    var total = checks.length || 1;
    var mapText = generatedMap.ok
      ? generatedMap.urls.map(function (item) { return item.file + " -> " + item.url; }).join("\n")
      : "";

    var fixFirst = checks.filter(function (c) { return c.level === "error" || (c.level === "warning" && c.priority < 40); }).slice(0, 8);

    return {
      checks: checks,
      mapText: mapText,
      generatedMap: generatedMap,
      configUrlSnippet: generateConfigUrlSnippet(config, generatedMap),
      checklist: buildChecklistMarkdown({
        courseTitle: config && config.courseTitle,
        courseId: config && config.courseId,
        errors: errors,
        warnings: warnings,
        fixFirst: fixFirst
      }),
      summary: {
        errors: errors,
        warnings: warnings,
        passed: passed,
        score: Math.round((passed / total) * 100),
        fixFirst: fixFirst
      },
      config: config
    };
  }

  global.LaceChecker = {
    runCheck: runCheck,
    djb2Hash: djb2Hash,
    parseCourseConfig: parseCourseConfig,
    flattenTopics: flattenTopics,
    buildUrlMap: buildUrlMap,
    generateConfigUrlSnippet: generateConfigUrlSnippet,
    buildChecklistMarkdown: buildChecklistMarkdown,
    validateBrightspaceContentUrl: validateBrightspaceContentUrl,
    loadRegistry: loadRegistry,
    saveRegistry: saveRegistry,
    registerCourseId: registerCourseId,
    CANONICAL_HASHES: CANONICAL_HASHES,
    REQUIRED_FILES: REQUIRED_FILES
  };
})(typeof window !== "undefined" ? window : globalThis);
