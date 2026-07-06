/**
 * Brightspace API bridge — parse pasted API/Content URLs and diff against config.
 * Direct browser API calls are blocked by CORS; this module supports manual paste
 * and URL pattern validation for Level 2 preflight.
 */
(function (global) {
  var API_PROXY_HINT = "Use Brightspace Data Hub or a server proxy for live API calls. Paste Content URLs below.";

  function parsePastedUrlList(text) {
    var items = [];
    text.split(/\n+/).forEach(function (line) {
      line = line.trim();
      if (!line) return;
      var m = line.match(/^([^:\s]+)\s*[:=>\-]+\s*(https?:\/\/.+)$/i);
      if (m) {
        items.push({ file: m[1].trim(), url: m[2].trim() });
        return;
      }
      var urlOnly = line.match(/^(https?:\/\/.+)$/i);
      if (urlOnly) {
        var fileName = decodeURIComponent(urlOnly[1].split("/").pop().split("?")[0]);
        items.push({ file: fileName, url: urlOnly[1] });
      }
    });
    return items;
  }

  function parseApiJson(text) {
    try {
      var data = JSON.parse(text);
      if (Array.isArray(data)) {
        return data.map(function (item) {
          return {
            file: item.file || item.FileName || item.title || "",
            url: item.url || item.Url || item.LaunchURL || ""
          };
        }).filter(function (i) { return i.url; });
      }
      if (data.Objects) {
        return data.Objects.map(function (obj) {
          var title = obj.Title || obj.ShortTitle || "";
          var url = obj.Url || obj.LaunchUrl || "";
          return { file: title.endsWith(".html") ? title : title + ".html", url: url };
        }).filter(function (i) { return i.url; });
      }
    } catch (e) {}
    return [];
  }

  function parseContentInput(text) {
    var fromJson = parseApiJson(text);
    if (fromJson.length) return fromJson;
    return parsePastedUrlList(text);
  }

  async function fetchContentViaProxy(proxyUrl, orgUnitId, token) {
    if (!proxyUrl || !orgUnitId) {
      return { ok: false, error: "Proxy URL and org unit ID required for live API fetch." };
    }
    try {
      var res = await fetch(proxyUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: "Bearer " + token },
        body: JSON.stringify({ orgUnitId: orgUnitId, action: "listContentTopics" })
      });
      if (!res.ok) return { ok: false, error: "Proxy returned " + res.status };
      var data = await res.json();
      return { ok: true, topics: parseApiJson(JSON.stringify(data)) };
    } catch (e) {
      return { ok: false, error: e.message || "Network error (CORS or proxy unavailable)." };
    }
  }

  global.LaceBrightspaceApi = {
    API_PROXY_HINT: API_PROXY_HINT,
    parseContentInput: parseContentInput,
    parsePastedUrlList: parsePastedUrlList,
    fetchContentViaProxy: fetchContentViaProxy
  };
})(typeof window !== "undefined" ? window : globalThis);
