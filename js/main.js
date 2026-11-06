/* ============================================================
   VSL, Veloter Software Lab · main.js
   Vanilla JS · zero dependencies
   ============================================================ */
(function () {
  'use strict';

  var prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---------- Footer year ---------- */
  var yearEl = document.getElementById('year');
  if (yearEl) yearEl.textContent = String(new Date().getFullYear());

  /* ---------- Sticky header state ---------- */
  var header = document.getElementById('siteHeader');
  function onScrollHeader() {
    if (header) header.classList.toggle('scrolled', window.scrollY > 8);
  }
  window.addEventListener('scroll', onScrollHeader, { passive: true });
  onScrollHeader();

  /* ---------- Mobile nav ---------- */
  var navToggle = document.getElementById('navToggle');
  var siteNav = document.getElementById('siteNav');

  function closeNav() {
    if (!siteNav || !navToggle) return;
    siteNav.classList.remove('open');
    navToggle.setAttribute('aria-expanded', 'false');
  }

  if (navToggle && siteNav) {
    navToggle.addEventListener('click', function () {
      var open = siteNav.classList.toggle('open');
      navToggle.setAttribute('aria-expanded', open ? 'true' : 'false');
    });
    siteNav.addEventListener('click', function (e) {
      if (e.target instanceof Element && e.target.closest('a')) closeNav();
    });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape') closeNav();
    });
    document.addEventListener('click', function (e) {
      if (
        siteNav.classList.contains('open') &&
        e.target instanceof Element &&
        !e.target.closest('#siteNav') &&
        !e.target.closest('#navToggle')
      ) closeNav();
    });
  }

  /* ---------- Scroll reveal (staggered) ---------- */
  var revealEls = Array.prototype.slice.call(document.querySelectorAll('.reveal'));
  if ('IntersectionObserver' in window && !prefersReduced) {
    var groups = new Map();
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        var el = entry.target;
        var parent = el.parentElement;
        var idx = 0;
        if (parent) {
          if (!groups.has(parent)) groups.set(parent, 0);
          idx = groups.get(parent);
          groups.set(parent, idx + 1);
        }
        el.style.transitionDelay = Math.min(idx, 5) * 70 + 'ms';
        el.classList.add('in');
        io.unobserve(el);
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });
    revealEls.forEach(function (el) { io.observe(el); });
  } else {
    revealEls.forEach(function (el) { el.classList.add('in'); });
  }

  /* ---------- Animated counters ---------- */
  function animateCount(el) {
    var target = parseInt(el.getAttribute('data-count') || '0', 10);
    var prefix = el.getAttribute('data-prefix') || '';
    var suffix = el.getAttribute('data-suffix') || '';
    if (prefersReduced) { el.textContent = prefix + target + suffix; return; }
    var dur = 1400, start = null;
    function frame(ts) {
      if (start === null) start = ts;
      var p = Math.min((ts - start) / dur, 1);
      var eased = 1 - Math.pow(1 - p, 3);
      el.textContent = prefix + Math.round(target * eased) + suffix;
      if (p < 1) requestAnimationFrame(frame);
    }
    requestAnimationFrame(frame);
  }

  var counters = Array.prototype.slice.call(document.querySelectorAll('[data-count]'));
  if ('IntersectionObserver' in window) {
    var cio = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          animateCount(entry.target);
          cio.unobserve(entry.target);
        }
      });
    }, { threshold: 0.5 });
    counters.forEach(function (el) { cio.observe(el); });
  } else {
    counters.forEach(animateCount);
  }

  /* ---------- Active nav link on scroll ---------- */
  var navLinks = Array.prototype.slice.call(document.querySelectorAll('.site-nav > a[href^="#"]:not(.nav-cta)'));
  var sections = navLinks
    .map(function (a) { return document.querySelector(a.getAttribute('href') || ''); })
    .filter(Boolean);

  function setActive() {
    var pos = window.scrollY + window.innerHeight * 0.32;
    var currentId = '';
    sections.forEach(function (sec) {
      if (sec.offsetTop <= pos) currentId = sec.id;
    });
    navLinks.forEach(function (a) {
      a.classList.toggle('active', a.getAttribute('href') === '#' + currentId);
    });
  }
  if (sections.length) {
    window.addEventListener('scroll', setActive, { passive: true });
    setActive();
  }

  /* ---------- Contact form (serverless-ready) ----------
     The form is wired for Formspree / Web3Forms, see DEPLOY.md.
     Until an endpoint is configured, it opens the visitor's
     email client with the message prefilled (mailto fallback). */
  var form = document.getElementById('contactForm');
  var note = document.getElementById('formNote');
  var submitBtn = document.getElementById('cfSubmit');

  function showNote(msg, cls) {
    if (!note) return;
    note.textContent = msg;
    note.className = 'form-note ' + (cls || '');
  }

  if (form) {
    form.addEventListener('submit', function (e) {
      e.preventDefault();

      var name = (document.getElementById('cf-name') || {}).value || '';
      var email = (document.getElementById('cf-email') || {}).value || '';
      var message = (document.getElementById('cf-message') || {}).value || '';
      var service = (document.getElementById('cf-service') || {}).value || '';
      var budget = (document.getElementById('cf-budget') || {}).value || '';

      // basic validation
      var invalid = [];
      ['cf-name', 'cf-email', 'cf-message'].forEach(function (id) {
        var f = document.getElementById(id);
        if (f && !f.value.trim()) { f.classList.add('invalid'); invalid.push(id); }
        else if (f) f.classList.remove('invalid');
      });
      var emailOk = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
      if (!emailOk) {
        var fe = document.getElementById('cf-email');
        if (fe) fe.classList.add('invalid');
        invalid.push('cf-email');
      }
      if (invalid.length) {
        showNote('Please fill in your name, a valid email and a short brief.', 'err');
        return;
      }

      var WEB3FORMS_KEY = '583297e4-5ec3-4150-9c19-effa43299230';

      function submitToWeb3Direct() {
        return fetch('https://api.web3forms.com/submit', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
          body: JSON.stringify({
            access_key: WEB3FORMS_KEY,
            from_name: 'Veloter Software Lab Inquiries',
            subject: 'New Lead: ' + (service || 'General') + ' from ' + name.trim(),
            name: name.trim(),
            email: email.trim(),
            service: service,
            budget: budget,
            message: message.trim()
          })
        }).then(function (res) { return res.json(); });
      }

      function triggerMailtoFallback(noteMsg) {
        var subject = encodeURIComponent('New project inquiry: ' + service + ' (' + name.trim() + ')');
        var body = encodeURIComponent(
          'Name: ' + name.trim() + '\n' +
          'Email: ' + email.trim() + '\n' +
          'Service: ' + service + '\n' +
          'Budget: ' + budget + '\n\n' +
          'Project brief:\n' + message.trim() + '\n'
        );
        window.location.href = 'mailto:veloterlabs@gmail.com?subject=' + subject + '&body=' + body;
        showNote(noteMsg || 'Opening your email client, or write us directly at veloterlabs@gmail.com', 'ok');
      }

      var origBtnHtml = submitBtn ? submitBtn.innerHTML : 'Send message';
      if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.innerHTML = 'Sending...';
      }
      showNote('Sending your message...', '');

      // First try /api/contact (Cloudflare Worker endpoint)
      fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
        body: JSON.stringify({
          name: name.trim(),
          email: email.trim(),
          service: service,
          budget: budget,
          message: message.trim()
        })
      })
      .then(function (r) {
        if (!r.ok || r.status === 404) {
          return submitToWeb3Direct();
        }
        return r.json().catch(function () { return submitToWeb3Direct(); });
      })
      .then(function (data) {
        if (data && data.success) {
          form.reset();
          showNote('Message sent successfully! We will reply within one business day.', 'ok');
        } else {
          return submitToWeb3Direct().then(function (d2) {
            if (d2 && d2.success) {
              form.reset();
              showNote('Message sent successfully! We will reply within one business day.', 'ok');
            } else {
              triggerMailtoFallback('Opening your email client to complete message...');
            }
          });
        }
      })
      .catch(function () {
        return submitToWeb3Direct()
          .then(function (data) {
            if (data && data.success) {
              form.reset();
              showNote('Message sent successfully! We will reply within one business day.', 'ok');
            } else {
              triggerMailtoFallback('Opening your email client to complete message...');
            }
          })
          .catch(function () {
            triggerMailtoFallback('Opening your email client...');
          });
      })
      .then(function () {
        if (submitBtn) {
          submitBtn.disabled = false;
          submitBtn.innerHTML = origBtnHtml;
        }
      });
    });
  }
})();
