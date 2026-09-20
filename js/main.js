/* =========================================================
   NCK WEALTH — Main JavaScript (modular, no build step)
   ========================================================= */
(function () {
  "use strict";

  var CFG = window.NCK_CONFIG || {};

  /* ---------------- Mobile navigation ---------------- */
  function initNav() {
    var toggle = document.querySelector("[data-nav-toggle]");
    var mobileNav = document.querySelector("[data-mobile-nav]");
    if (!toggle || !mobileNav) return;

    toggle.addEventListener("click", function () {
      var isOpen = mobileNav.classList.toggle("open");
      toggle.setAttribute("aria-expanded", isOpen ? "true" : "false");
    });

    // Close mobile nav when a link is clicked
    mobileNav.querySelectorAll("a").forEach(function (link) {
      link.addEventListener("click", function () {
        mobileNav.classList.remove("open");
        toggle.setAttribute("aria-expanded", "false");
      });
    });
  }

  /* ---------------- WhatsApp links ---------------- */
  function buildWhatsAppUrl(customMessage) {
    var number = (CFG.WHATSAPP_NUMBER || "").replace(/[^0-9]/g, "");
    var message = customMessage || CFG.WHATSAPP_DEFAULT_MESSAGE || "Hello NCK WEALTH";
    var base = number ? "https://wa.me/" + number : "https://wa.me/";
    return base + "?text=" + encodeURIComponent(message);
  }

  function initWhatsApp() {
    document.querySelectorAll("[data-wa-link]").forEach(function (el) {
      var customMsg = el.getAttribute("data-wa-message");
      el.setAttribute("href", buildWhatsAppUrl(customMsg));
      el.setAttribute("target", "_blank");
      el.setAttribute("rel", "noopener");
    });
  }

  /* ---------------- Social links from config ---------------- */
  function initSocialLinks() {
    var map = {
      "data-facebook": CFG.FACEBOOK_URL,
      "data-linkedin": CFG.LINKEDIN_URL,
      "data-instagram": CFG.INSTAGRAM_URL,
      "data-youtube": CFG.YOUTUBE_URL
    };
    Object.keys(map).forEach(function (attr) {
      var url = map[attr];
      document.querySelectorAll("[" + attr + "]").forEach(function (el) {
        if (url) {
          el.setAttribute("href", url);
          el.removeAttribute("hidden");
        } else {
          // No URL configured yet - keep link present but pointing nowhere harmful
          el.setAttribute("href", "#");
          el.setAttribute("aria-disabled", "true");
          el.classList.add("is-placeholder");
        }
      });
    });
  }

  /* ---------------- Contact fields from config (email/phone) ---------------- */
  function initContactFields() {
    document.querySelectorAll("[data-contact-email]").forEach(function (el) {
      el.textContent = CFG.CONTACT_EMAIL || "[ADD EMAIL]";
      if (CFG.CONTACT_EMAIL) el.setAttribute("href", "mailto:" + CFG.CONTACT_EMAIL);
    });
    document.querySelectorAll("[data-contact-phone]").forEach(function (el) {
      el.textContent = CFG.CONTACT_PHONE || "[ADD PHONE]";
      if (CFG.CONTACT_PHONE) el.setAttribute("href", "tel:" + CFG.CONTACT_PHONE.replace(/[^0-9+]/g, ""));
    });
    document.querySelectorAll("[data-contact-address]").forEach(function (el) {
      el.textContent = CFG.CONTACT_ADDRESS || CFG.CONTACT_CITY_STATE || "";
    });
    document.querySelectorAll("[data-map-link]").forEach(function (el) {
      if (CFG.GOOGLE_MAPS_URL) el.setAttribute("href", CFG.GOOGLE_MAPS_URL);
    });

    document.querySelectorAll("[data-contact-whatsapp]").forEach(function (el) {
      var num = CFG.WHATSAPP_NUMBER || "";
      if (!num || num.indexOf("REPLACE") !== -1) {
        el.textContent = "[ADD WHATSAPP]";
        return;
      }
      // Format a 12-digit "91XXXXXXXXXX" number as "+91 XXXXX XXXXX" for display
      if (/^91\d{10}$/.test(num)) {
        var local = num.slice(2);
        el.textContent = "+91 " + local.slice(0, 5) + " " + local.slice(5);
      } else {
        el.textContent = num;
      }
    });
  }

  /* ---------------- Active nav link highlight ---------------- */
  function initActiveNav() {
    var current = (document.body.getAttribute("data-page") || "").toLowerCase();
    if (!current) return;
    document.querySelectorAll("a[data-nav-key]").forEach(function (a) {
      if (a.getAttribute("data-nav-key").toLowerCase() === current) {
        a.setAttribute("aria-current", "page");
      }
    });
  }

  /* ---------------- Contact form validation + submission ---------------- */
  function initContactForm() {
    var form = document.querySelector("#enquiry-form");
    if (!form) return;

    form.addEventListener("submit", function (e) {
      e.preventDefault();
      var valid = true;

      form.querySelectorAll("[data-required]").forEach(function (input) {
        var field = input.closest(".field");
        var value = input.value.trim();
        var ok = value.length > 0;

        if (input.type === "email" && value) {
          ok = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
        }
        if (input.getAttribute("data-type") === "mobile" && value) {
          ok = /^[0-9]{10}$/.test(value.replace(/[^0-9]/g, ""));
        }

        if (field) field.classList.toggle("has-error", !ok);
        if (!ok) valid = false;
      });

      if (!valid) return;

      var successBox = document.querySelector("#form-success");
      var endpoint = CFG.FORM_ENDPOINT;

      if (endpoint) {
        // Real backend configured: POST the form data as JSON
        var data = {};
        new FormData(form).forEach(function (val, key) { data[key] = val; });

        fetch(endpoint, {
          method: "POST",
          headers: { "Content-Type": "application/json", Accept: "application/json" },
          body: JSON.stringify(data)
        })
          .then(function () {
            form.reset();
            if (successBox) successBox.classList.add("visible");
          })
          .catch(function () {
            alert("Something went wrong sending your enquiry. Please try again or contact us on WhatsApp.");
          });
      } else {
        // No backend configured yet: show success state only.
        // See js/config.js -> FORM_ENDPOINT to connect a real backend.
        form.reset();
        if (successBox) successBox.classList.add("visible");
      }
    });
  }

  /* ---------------- Financial Calculators ---------------- */

  function formatINR(num) {
    if (isNaN(num)) num = 0;
    num = Math.round(num);
    return "\u20B9" + num.toLocaleString("en-IN");
  }

  // SIP Future Value: FV = P * [ ( (1+r)^n - 1 ) / r ] * (1+r)
  function calcSIP() {
    var amountEl = document.querySelector("#sip-amount");
    var rateEl = document.querySelector("#sip-rate");
    var yearsEl = document.querySelector("#sip-years");
    if (!amountEl || !rateEl || !yearsEl) return;

    var amount = parseFloat(amountEl.value) || 0;
    var annualRate = parseFloat(rateEl.value) || 0;
    var years = parseFloat(yearsEl.value) || 0;

    var r = annualRate / 100 / 12;
    var n = years * 12;
    var fv = r > 0 ? amount * ((Math.pow(1 + r, n) - 1) / r) * (1 + r) : amount * n;
    var invested = amount * n;
    var gain = fv - invested;

    document.querySelector("#sip-amount-out").textContent = formatINR(amount);
    document.querySelector("#sip-rate-out").textContent = annualRate + "%";
    document.querySelector("#sip-years-out").textContent = years + " yrs";
    document.querySelector("#sip-invested").textContent = formatINR(invested);
    document.querySelector("#sip-gain").textContent = formatINR(gain);
    document.querySelector("#sip-total").textContent = formatINR(fv);
  }

  // Compound interest: A = P (1 + r/n)^(n*t)
  function calcCompound() {
    var pEl = document.querySelector("#ci-principal");
    var rEl = document.querySelector("#ci-rate");
    var tEl = document.querySelector("#ci-years");
    var nEl = document.querySelector("#ci-freq");
    if (!pEl || !rEl || !tEl || !nEl) return;

    var P = parseFloat(pEl.value) || 0;
    var rate = (parseFloat(rEl.value) || 0) / 100;
    var t = parseFloat(tEl.value) || 0;
    var n = parseFloat(nEl.value) || 1;

    var A = P * Math.pow(1 + rate / n, n * t);
    var interest = A - P;

    document.querySelector("#ci-principal-out").textContent = formatINR(P);
    document.querySelector("#ci-rate-out").textContent = (rate * 100) + "%";
    document.querySelector("#ci-years-out").textContent = t + " yrs";
    document.querySelector("#ci-interest").textContent = formatINR(interest);
    document.querySelector("#ci-total").textContent = formatINR(A);
  }

  // Goal planning: required monthly SIP to reach a target corpus
  // P = FV * r / [ ((1+r)^n - 1) * (1+r) ]
  function calcGoal() {
    var goalEl = document.querySelector("#goal-amount");
    var rateEl = document.querySelector("#goal-rate");
    var yearsEl = document.querySelector("#goal-years");
    if (!goalEl || !rateEl || !yearsEl) return;

    var FV = parseFloat(goalEl.value) || 0;
    var annualRate = parseFloat(rateEl.value) || 0;
    var years = parseFloat(yearsEl.value) || 0;

    var r = annualRate / 100 / 12;
    var n = years * 12;
    var monthlySIP = 0;
    if (n > 0) {
      monthlySIP = r > 0 ? (FV * r) / ((Math.pow(1 + r, n) - 1) * (1 + r)) : FV / n;
    }

    document.querySelector("#goal-amount-out").textContent = formatINR(FV);
    document.querySelector("#goal-rate-out").textContent = annualRate + "%";
    document.querySelector("#goal-years-out").textContent = years + " yrs";
    document.querySelector("#goal-monthly").textContent = formatINR(monthlySIP);
    document.querySelector("#goal-total-invested").textContent = formatINR(monthlySIP * n);
  }

  // Emergency fund: monthly expenses * months of cover
  function calcEmergency() {
    var expEl = document.querySelector("#ef-expenses");
    var monthsEl = document.querySelector("#ef-months");
    if (!expEl || !monthsEl) return;

    var expenses = parseFloat(expEl.value) || 0;
    var months = parseFloat(monthsEl.value) || 0;
    var target = expenses * months;

    document.querySelector("#ef-expenses-out").textContent = formatINR(expenses);
    document.querySelector("#ef-months-out").textContent = months + " months";
    document.querySelector("#ef-target").textContent = formatINR(target);
  }

  function bindCalcInputs(ids, fn) {
    ids.forEach(function (id) {
      var el = document.querySelector(id);
      if (el) el.addEventListener("input", fn);
    });
    fn();
  }

  function initCalculators() {
    if (document.querySelector("#sip-amount")) {
      bindCalcInputs(["#sip-amount", "#sip-rate", "#sip-years"], calcSIP);
    }
    if (document.querySelector("#ci-principal")) {
      bindCalcInputs(["#ci-principal", "#ci-rate", "#ci-years", "#ci-freq"], calcCompound);
    }
    if (document.querySelector("#goal-amount")) {
      bindCalcInputs(["#goal-amount", "#goal-rate", "#goal-years"], calcGoal);
    }
    if (document.querySelector("#ef-expenses")) {
      bindCalcInputs(["#ef-expenses", "#ef-months"], calcEmergency);
    }

    // Calculator tabs
    var tabs = document.querySelectorAll("[data-calc-tab]");
    tabs.forEach(function (tab) {
      tab.addEventListener("click", function () {
        var target = tab.getAttribute("data-calc-tab");
        tabs.forEach(function (t) { t.setAttribute("aria-selected", "false"); });
        tab.setAttribute("aria-selected", "true");
        document.querySelectorAll("[data-calc-panel]").forEach(function (panel) {
          panel.classList.toggle("active", panel.getAttribute("data-calc-panel") === target);
        });
      });
    });
  }

  /* ---------------- Footer year ---------------- */
  function initYear() {
    document.querySelectorAll("[data-year]").forEach(function (el) {
      el.textContent = new Date().getFullYear();
    });
  }

  /* ---------------- Init ---------------- */
  document.addEventListener("DOMContentLoaded", function () {
    initNav();
    initWhatsApp();
    initSocialLinks();
    initContactFields();
    initActiveNav();
    initContactForm();
    initCalculators();
    initYear();
  });
})();
