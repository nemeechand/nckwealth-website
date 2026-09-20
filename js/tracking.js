/* NCK WEALTH tracking — IDs are configured in js/config.js */
(function () {
  "use strict";
  var cfg = window.NCK_CONFIG || {};
  if (cfg.GOOGLE_ANALYTICS_ID) {
    var ga = document.createElement("script");
    ga.async = true;
    ga.src = "https://www.googletagmanager.com/gtag/js?id=" + encodeURIComponent(cfg.GOOGLE_ANALYTICS_ID);
    document.head.appendChild(ga);
    window.dataLayer = window.dataLayer || [];
    function gtag(){ dataLayer.push(arguments); }
    window.gtag = gtag;
    gtag("js", new Date());
    gtag("config", cfg.GOOGLE_ANALYTICS_ID);
  }
  if (cfg.META_PIXEL_ID) {
    !function(f,b,e,v,n,t,s){if(f.fbq)return;n=f.fbq=function(){n.callMethod?
    n.callMethod.apply(n,arguments):n.queue.push(arguments)};if(!f._fbq)f._fbq=n;
    n.push=n;n.loaded=!0;n.version="2.0";n.queue=[];t=b.createElement(e);t.async=!0;
    t.src=v;s=b.getElementsByTagName(e)[0];s.parentNode.insertBefore(t,s)}
    (window, document, "script", "https://connect.facebook.net/en_US/fbevents.js");
    window.fbq("init", cfg.META_PIXEL_ID);
    window.fbq("track", "PageView");
  }
})();
