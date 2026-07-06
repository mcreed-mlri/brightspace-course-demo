/**
 * Serialize editor model back into LACE topic HTML.
 */
(function (global) {
  function esc(s) {
    return String(s || "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }

  function proseBlock(html) {
    return '      <p class="prose">\n        ' + html + "\n      </p>\n";
  }

  function buildEyebrow(model, index, total, kind, minutes) {
    if (model.eyebrow) return model.eyebrow;
    return "Topic " + index + " of " + total + " · " + kind + " · " + minutes + " min";
  }

  function serializeTopic(model, meta) {
    meta = meta || {};
    var index = meta.index || 1;
    var total = meta.total || 1;
    var kind = meta.kind || "Concept";
    var minutes = meta.minutes || 3;
    var slug = model.slug || "topic-1";
    var fileName = model.fileName || "topic-1.html";
    var title = model.title || "Your Topic Title";

    var scenarioHtml = (model.scenario && model.scenario.length ? model.scenario : [
      "Describe the client situation here."
    ]).map(proseBlock).join("\n");

    var ruleParas = (model.rule && model.rule.paragraphs && model.rule.paragraphs.length
      ? model.rule.paragraphs
      : ["State the rule here in plain language."]).map(proseBlock).join("\n");

    var ruleBoxHtml = "";
    if (model.rule && model.rule.ruleBox && model.rule.ruleBox.enabled !== false) {
      var rb = model.rule.ruleBox;
      var items = (rb.items && rb.items.length ? rb.items : [
        "<strong>First key point</strong> — explain it briefly."
      ]).map(function (item) {
        return "          <li>" + item + "</li>";
      }).join("\n");
      ruleBoxHtml =
        '      <div class="rule-box">\n' +
        '        <div class="eyebrow">' + esc(rb.label || "Key points") + '</div>\n' +
        "        <ol>\n" + items + "\n        </ol>\n      </div>\n";
    }

    var changedHtml = "";
    if (model.changed && model.changed.enabled) {
      var ch = model.changed;
      changedHtml =
        '    <section class="section">\n' +
        '      <div class="section-rule rust">\n' +
        '        <span class="sr-num">§ 3</span>\n' +
        '        <span class="sr-line"></span>\n' +
        '        <span class="sr-label">What changed</span>\n' +
        "      </div>\n" +
        '      <div class="changed-box">\n' +
        '        <div class="cb-meta">\n' +
        '          <span class="pill pill-rust">' + esc(ch.pill || "Law changed") + '</span>\n' +
        '          <span class="eyebrow eyebrow-muted">' + esc(ch.citation || "") + '</span>\n' +
        "        </div>\n" +
        "        <h3>" + esc(ch.heading || "What changed") + "</h3>\n" +
        "        <p>\n          " + esc(ch.body || "") + "\n        </p>\n" +
        "      </div>\n" +
        "    </section>\n\n";
    }

    var tryIt = model.tryIt || {};
    var options = tryIt.options && tryIt.options.length ? tryIt.options : [
      "Wrong answer A.", "Correct answer B.", "Wrong answer C."
    ];
    var correctIndex = tryIt.correctIndex != null ? tryIt.correctIndex : 1;
    var optionsHtml = options.map(function (text, i) {
      return '          <button class="tryit-option" type="button" data-correct="' +
        (i === correctIndex ? "true" : "false") + '">\n' +
        '            <span class="tryit-radio"></span>\n' +
        "            <span>" + text + "</span>\n          </button>";
    }).join("\n");

    var rememberItems = (model.remember && model.remember.length ? model.remember : [
      "<strong>Key takeaway</strong> — why it matters."
    ]).map(function (item) {
      return "          <li>" + item + "</li>";
    }).join("\n");

    return '<!DOCTYPE html>\n<html lang="en">\n<head>\n' +
      '  <meta charset="utf-8">\n' +
      '  <meta name="viewport" content="width=device-width, initial-scale=1">\n' +
      '  <meta name="course-slug" content="' + esc(slug) + '">\n' +
      "  <title>" + esc(title) + "</title>\n" +
      '  <link rel="stylesheet" href="course-style.css">\n' +
      '  <script src="course-config.js"><\/script>\n' +
      '  <script>document.documentElement.dataset.topic = (window.COURSE_CONFIG || {}).topic || "foundations";<\/script>\n' +
      '  <script src="course-nav.js" defer><\/script>\n' +
      "</head>\n<body>\n\n" +
      '<div class="page">\n' +
      '  <div id="lace-nav-container"></div>\n\n' +
      '  <main class="page-body topic-body">\n\n' +
      '    <p class="eyebrow">' + esc(buildEyebrow(model, index, total, kind, minutes)) + '</p>\n' +
      '    <h1 class="display topic-title">' + esc(title) + '</h1>\n' +
      '    <p class="topic-standfirst">\n      ' + esc(model.standfirst || "") + "\n    </p>\n" +
      '    <div class="topic-progress">\n' +
      '      <div class="topic-progress-track"><div data-lace="course-progress-bar"></div></div>\n' +
      '      <span class="topic-progress-label"><span data-lace="course-progress">0%</span> through this course</span>\n' +
      "    </div>\n\n" +
      '    <section class="section">\n' +
      '      <div class="section-rule">\n' +
      '        <span class="sr-num">§ 1</span>\n' +
      '        <span class="sr-line"></span>\n' +
      '        <span class="sr-label">The scenario</span>\n' +
      "      </div>\n\n" + scenarioHtml +
      "    </section>\n\n" +
      '    <section class="section">\n' +
      '      <div class="section-rule">\n' +
      '        <span class="sr-num">§ 2</span>\n' +
      '        <span class="sr-line"></span>\n' +
      '        <span class="sr-label">The rule</span>\n' +
      "      </div>\n\n" + ruleParas + ruleBoxHtml +
      "    </section>\n\n" + changedHtml +
      '    <section class="section">\n' +
      '      <div class="section-rule">\n' +
      '        <span class="sr-num">§ 4</span>\n' +
      '        <span class="sr-line"></span>\n' +
      '        <span class="sr-label">Try it</span>\n' +
      "      </div>\n" +
      '      <p class="prose" style="font-style:italic;color:var(--muted);">\n' +
      "        One question. You'll see the answer once you choose.\n      </p>\n" +
      '      <div class="tryit-box">\n' +
      '        <div class="eyebrow">Scenario</div>\n' +
      '        <p class="tryit-q">\n          ' + (tryIt.prompt || "Describe a brief scenario. <strong>What should the attorney do?</strong>") + "\n        </p>\n" +
      '        <div class="tryit-options">\n' + optionsHtml + "\n        </div>\n" +
      '        <div class="answer-banner hidden">\n' +
      '          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="m5 12 4 4L19 6"/></svg>\n' +
      "          <span>\n            " + (tryIt.explanation || "<strong>The answer:</strong> Explain why the correct option is right.") + "\n          </span>\n        </div>\n      </div>\n    </section>\n\n" +
      '    <section class="section">\n' +
      '      <div class="section-rule">\n' +
      '        <span class="sr-num">§ 5</span>\n' +
      '        <span class="sr-line"></span>\n' +
      '        <span class="sr-label">If you remember nothing else</span>\n' +
      "      </div>\n" +
      '      <div class="remember-box">\n        <ul>\n' + rememberItems + "\n        </ul>\n      </div>\n    </section>\n\n" +
      '    <section class="next-up">\n' +
      '      <p class="eyebrow eyebrow-muted">Up next</p>\n' +
      '      <a class="next-up-card" href="#" data-lace="next-link">\n' +
      '        <span class="nu-body"><span class="nu-title">Next topic</span></span>\n' +
      '        <span class="next-up-go">Continue <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M5 12h14"/><path d="m13 6 6 6-6 6"/></svg></span>\n' +
      "      </a>\n    </section>\n\n  </main>\n</div>\n\n</body>\n</html>\n";
  }

  global.LaceTopicSerializer = { serializeTopic: serializeTopic };
})(typeof window !== "undefined" ? window : globalThis);
