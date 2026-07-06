/**
 * LACE Course Beacon — optional engagement analytics. OFF by default.
 * ----------------------------------------------------------------------------
 * Captures the in-course signals Brightspace page-visit tracking can't see:
 * how long a topic is actually open, whether videos get watched to the end,
 * and where in a course sessions stop. Events land in the LACE data layer
 * (Supabase `events` table) and feed the drop-off / session-length metrics in
 * Brightspace-Manager/docs/planning/metrics-framework.md.
 *
 * PRIVACY RULES (non-negotiable):
 *   • Anonymous by design — no names, emails, or Brightspace user IDs, ever.
 *     Events carry the course key + topic slug only. See the event registry in
 *     learning-hub/docs/planning/supabase-analytics.sql before adding fields.
 *   • Analytics must never break the course: every send is wrapped, failures
 *     are swallowed, and the wrapper works identically with the beacon off.
 *
 * ENABLING: in course-config.js set
 *   beacon: { enabled: true, endpoint: "https://…/api/events" }
 * With `enabled: true` and an empty endpoint, events log to the console
 * instead of posting — the local dev mode.
 *
 * Events sent:
 *   page_view          once per topic load          { topic_key }
 *   session_heartbeat  every 30s while tab visible  { topic_key, interval_seconds }
 *   video_progress     at 25/50/75/90/100 percent   { topic_key, video_key, pct }
 *   page_exit          tab hidden / page unloaded   { topic_key, seconds_on_page }
 */
document.addEventListener("DOMContentLoaded", function () {
  var config = window.COURSE_CONFIG || {};
  var beacon = config.beacon || {};
  if (!beacon.enabled) return;

  var endpoint = beacon.endpoint || "";
  var debugMode = !endpoint; // enabled but no endpoint → console only
  var metaSlug = document.querySelector('meta[name="course-slug"]');
  var topicKey = metaSlug ? metaSlug.getAttribute("content") : "outline";
  var courseKey = config.courseId || "unknown-course";
  var HEARTBEAT_SECONDS = 30;

  function send(eventType, metadata, useSendBeacon) {
    var payload = {
      event_type: eventType,
      course_key: courseKey,
      metadata: metadata || {},
      client_ts: new Date().toISOString(),
    };
    if (debugMode) {
      console.debug("[lace-beacon]", payload);
      return;
    }
    try {
      var body = JSON.stringify(payload);
      if (useSendBeacon && navigator.sendBeacon) {
        // Survives page unload; fire-and-forget by design.
        navigator.sendBeacon(endpoint, new Blob([body], { type: "application/json" }));
      } else {
        fetch(endpoint, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: body,
          keepalive: true,
        }).catch(function () {});
      }
    } catch (e) {
      /* analytics never breaks the course */
    }
  }

  // ── page_view — once per load ─────────────────────────────────────────────
  send("page_view", { topic_key: topicKey });

  // ── session_heartbeat — only while the tab is actually visible ────────────
  // visibleSeconds advances in heartbeat-sized steps, so seconds_on_page is
  // accurate to ±HEARTBEAT_SECONDS. Fine for median session length; do not
  // present it as precise (idle-open tabs already make it ordinal at best).
  var visibleSeconds = 0;
  setInterval(function () {
    if (document.hidden) return;
    visibleSeconds += HEARTBEAT_SECONDS;
    send("session_heartbeat", { topic_key: topicKey, interval_seconds: HEARTBEAT_SECONDS });
  }, HEARTBEAT_SECONDS * 1000);

  // ── video_progress — threshold crossings, each fired once per video ──────
  var THRESHOLDS = [25, 50, 75, 90, 100];
  var videos = document.querySelectorAll("video");
  Array.prototype.forEach.call(videos, function (video, i) {
    var fired = {};
    var videoKey = video.getAttribute("data-video-key") || topicKey + "-video-" + (i + 1);
    function checkThresholds(pct) {
      THRESHOLDS.forEach(function (t) {
        if (pct >= t && !fired[t]) {
          fired[t] = true;
          send("video_progress", { topic_key: topicKey, video_key: videoKey, pct: t });
        }
      });
    }
    video.addEventListener("timeupdate", function () {
      if (video.duration) checkThresholds((video.currentTime / video.duration) * 100);
    });
    video.addEventListener("ended", function () {
      checkThresholds(100);
    });
  });

  // ── page_exit — when the tab hides or the page unloads ───────────────────
  // De-duped per hide: returning to the tab re-arms it, so a lunch break and
  // a real exit both close out cleanly.
  var exitSent = false;
  function sendExit() {
    if (exitSent) return;
    exitSent = true;
    send("page_exit", { topic_key: topicKey, seconds_on_page: visibleSeconds }, true);
  }
  document.addEventListener("visibilitychange", function () {
    if (document.hidden) sendExit();
    else exitSent = false;
  });
  window.addEventListener("pagehide", sendExit);
});
