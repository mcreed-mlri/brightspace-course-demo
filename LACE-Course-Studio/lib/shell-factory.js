/**
 * Generate a full LACE course folder from a course model.
 */
(function (global) {
  var TEMPLATE_BASE = "templates/blank-shell/";

  async function fetchTemplate(name) {
    var res = await fetch(TEMPLATE_BASE + name);
    if (!res.ok) throw new Error("Missing template: " + name);
    return res.text();
  }

  async function buildPackage(course, topicModels) {
    var files = {};
    files["course-config.js"] = LaceConfigBuilder.buildConfigJs(course);
    files["course-nav.js"] = await fetchTemplate("course-nav.js");
    files["course-style.css"] = await fetchTemplate("course-style.css");
    files["Home.html"] = await fetchTemplate("Home.html");
    files["complete.html"] = await fetchTemplate("complete.html");

    var topics = course.topics || [];
    var total = topics.length;
    for (var i = 0; i < topics.length; i++) {
      var t = topics[i];
      var model = topicModels && topicModels[t.file]
        ? topicModels[t.file]
        : LaceTopicParser.parseTopicHtml(
          LaceTopicSerializer.serializeTopic({
            slug: t.slug,
            title: t.title,
            standfirst: t.description || "",
            scenario: ["Describe the client situation for " + t.title + "."],
            rule: { paragraphs: ["State the rule in plain language."], ruleBox: { enabled: true, label: "Key points", items: [] } },
            tryIt: { prompt: "Brief scenario. <strong>What should the attorney do?</strong>", options: ["Wrong A", "Correct B", "Wrong C"], correctIndex: 1, explanation: "<strong>The answer:</strong> Explain why B is correct." },
            remember: ["<strong>Key takeaway</strong> — why it matters."]
          }, { index: i + 1, total: total, kind: t.kind, minutes: t.minutes }),
          t.file
        );
      model.slug = t.slug;
      model.title = t.title;
      model.fileName = t.file;
      files[t.file] = LaceTopicSerializer.serializeTopic(model, {
        index: i + 1,
        total: total,
        kind: t.kind,
        minutes: t.minutes
      });
    }

    return files;
  }

  global.LaceShellFactory = {
    buildPackage: buildPackage,
    TEMPLATE_BASE: TEMPLATE_BASE
  };
})(typeof window !== "undefined" ? window : globalThis);
