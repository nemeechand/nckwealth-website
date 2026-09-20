/* NCK WEALTH — YouTube auto feed (API-free) */
(function () {
  "use strict";
  var longGrid = document.getElementById("youtube-long-grid");
  var shortGrid = document.getElementById("youtube-shorts-grid");
  if (!longGrid || !shortGrid) return;

  var cfg = window.NCK_CONFIG || {};
  var channelUrl = cfg.YOUTUBE_URL || "https://www.youtube.com/@NCKWEALTH";

  function esc(v) {
    return String(v || "").replace(/[&<>"]/g, function (c) {
      return ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", "\"": "&quot;" })[c];
    });
  }

  function card(v, isShort) {
    var id = esc(v.id);
    var title = esc(v.title || (isShort ? "NCK WEALTH Short" : "NCK WEALTH Video"));
    var thumb = esc(v.thumbnail || ("https://i.ytimg.com/vi/" + id + "/hqdefault.jpg"));
    var url = isShort
      ? (v.shortUrl || "https://www.youtube.com/shorts/" + id)
      : (v.watchUrl || "https://www.youtube.com/watch?v=" + id);
    var watchLabel = isShort ? "Watch Short" : "Watch Video";
    var descHtml = v.description ? "<p>" + esc(v.description) + "</p>" : "";

    return (
      '<a class="youtube-card" href="' + esc(url) + '" target="_blank" rel="noopener">' +
        '<div class="youtube-thumb">' +
          '<img src="' + thumb + '" alt="' + title + '" loading="lazy" decoding="async">' +
          '<span class="youtube-play" aria-hidden="true">&#9654;</span>' +
        '</div>' +
        '<div class="youtube-card-body">' +
          "<h4>" + title + "</h4>" +
          descHtml +
          '<span class="youtube-watch-link">' + watchLabel + " &rarr;</span>" +
        "</div>" +
      "</a>"
    );
  }

  function emptyState(message) {
    return (
      '<div class="youtube-empty-state">' +
        '<span class="yt-empty-icon" aria-hidden="true">' +
          '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M3 12a9 9 0 1018 0 9 9 0 00-18 0z"/><path d="M12 8v4l3 2"/></svg>' +
        "</span>" +
        "<p>" + esc(message) + "</p>" +
        '<a href="' + esc(channelUrl) + '" target="_blank" rel="noopener">Visit our YouTube channel &rarr;</a>' +
      "</div>"
    );
  }

  function load(url, grid, isShort, comingSoonMessage) {
    fetch(url, { cache: "no-store" })
      .then(function (r) {
        if (!r.ok) throw new Error("feed_unavailable");
        return r.json();
      })
      .then(function (d) {
        if (!d || !d.success) throw new Error("feed_unavailable");
        var items = d.videos || [];
        grid.innerHTML = items.length
          ? items.map(function (v) { return card(v, isShort); }).join("")
          : emptyState(comingSoonMessage);
      })
      .catch(function () {
        grid.innerHTML = emptyState(comingSoonMessage);
      });
  }

  load("api/youtube-videos.php", longGrid, false, "More videos coming soon.");
  load("api/youtube-shorts.php", shortGrid, true, "New financial insights are on the way.");
})();
