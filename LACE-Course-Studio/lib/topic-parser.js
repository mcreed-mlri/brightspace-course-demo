/**
 * Parse LACE topic HTML into an editor-safe JSON model.
 */
(function (global) {
  function textContent(el) {
    return el ? el.textContent.replace(/\s+/g, " ").trim() : "";
  }

  function parseProseParagraphs(section) {
    return Array.from(section.querySelectorAll(":scope > p.prose")).map(function (p) {
      return p.innerHTML.trim();
    }).filter(Boolean);
  }

  function parseRuleBox(section) {
    var box = section.querySelector(".rule-box");
    if (!box) return { enabled: false, label: "Key points", items: [] };
    var label = textContent(box.querySelector(".eyebrow")) || "Key points";
    var items = Array.from(box.querySelectorAll("ol li, ul li")).map(function (li) {
      return li.innerHTML.trim();
    });
    return { enabled: items.length > 0, label: label, items: items };
  }

  function parseChanged(section) {
    if (!section) return null;
    var box = section.querySelector(".changed-box");
    if (!box) return null;
    var pill = box.querySelector(".pill");
    var citation = box.querySelector(".eyebrow-muted");
    return {
      enabled: true,
      pill: textContent(pill),
      citation: textContent(citation),
      heading: textContent(box.querySelector("h3")),
      body: textContent(box.querySelector("p"))
    };
  }

  function parseTryIt(section) {
    var box = section.querySelector(".tryit-box");
    if (!box) return { prompt: "", options: [], correctIndex: 0, explanation: "" };
    var prompt = box.querySelector(".tryit-q");
    var options = Array.from(box.querySelectorAll(".tryit-option")).map(function (btn, i) {
      var span = btn.querySelector("span:last-child");
      return {
        text: textContent(span),
        correct: btn.getAttribute("data-correct") === "true",
        index: i
      };
    });
    var correctIndex = options.findIndex(function (o) { return o.correct; });
    var banner = box.querySelector(".answer-banner span");
    return {
      prompt: prompt ? prompt.innerHTML.trim() : "",
      options: options.map(function (o) { return o.text; }),
      correctIndex: correctIndex < 0 ? 0 : correctIndex,
      explanation: banner ? banner.innerHTML.trim() : ""
    };
  }

  function parseRemember(section) {
    var box = section.querySelector(".remember-box");
    if (!box) return [];
    return Array.from(box.querySelectorAll("li")).map(function (li) {
      return li.innerHTML.trim();
    });
  }

  function parseTopicHtml(html, fileName) {
    var doc = new DOMParser().parseFromString(html, "text/html");
    var slugMeta = doc.querySelector('meta[name="course-slug"]');
    var sections = Array.from(doc.querySelectorAll("main .section"));
    var changedSection = null;
    sections.forEach(function (sec) {
      var label = sec.querySelector(".sr-label");
      if (label && /what changed/i.test(label.textContent)) changedSection = sec;
    });

    var scenarioSec = sections[0];
    var ruleSec = sections[1];
    var trySec = sections.find(function (s) {
      return s.querySelector(".tryit-box");
    });
    var rememberSec = sections.find(function (s) {
      return s.querySelector(".remember-box");
    });

    return {
      fileName: fileName || "topic-1.html",
      slug: slugMeta ? slugMeta.getAttribute("content") : "",
      title: textContent(doc.querySelector(".topic-title")),
      standfirst: textContent(doc.querySelector(".topic-standfirst")),
      eyebrow: textContent(doc.querySelector(".eyebrow")),
      scenario: parseProseParagraphs(scenarioSec),
      rule: {
        paragraphs: parseProseParagraphs(ruleSec),
        ruleBox: parseRuleBox(ruleSec)
      },
      changed: parseChanged(changedSection),
      tryIt: parseTryIt(trySec || doc),
      remember: parseRemember(rememberSec || doc)
    };
  }

  global.LaceTopicParser = { parseTopicHtml: parseTopicHtml };
})(typeof window !== "undefined" ? window : globalThis);
