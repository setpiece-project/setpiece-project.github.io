// Page chrome: reading progress, contents list, reveal on scroll, looping feature videos that only
// run while visible, and the system-diagram lightbox. The demo and teaser logic is in index.js.
(function () {
  'use strict';

  var reduceMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var hasObserver = 'IntersectionObserver' in window;

  // ---- Reading progress and contents list (scroll-spy) ----
  var bar = document.getElementById('progress');
  var links = Array.prototype.slice.call(document.querySelectorAll('.side-nav a'));
  var sections = links.map(function (a) { return document.querySelector(a.getAttribute('href')); });

  function onScroll() {
    var doc = document.documentElement;
    var max = doc.scrollHeight - doc.clientHeight;
    if (bar) bar.style.width = (max > 0 ? (100 * doc.scrollTop) / max : 0) + '%';

    var current = -1;
    sections.forEach(function (s, i) {
      if (s && s.getBoundingClientRect().top < window.innerHeight * 0.35) current = i;
    });
    links.forEach(function (a, i) { a.classList.toggle('on', i === current); });
  }

  window.addEventListener('scroll', onScroll, { passive: true });
  window.addEventListener('resize', onScroll);
  onScroll();

  // ---- Reveal on scroll ----
  var reveals = Array.prototype.slice.call(document.querySelectorAll('.reveal'));
  if (hasObserver && !reduceMotion) {
    var revealer = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) {
          e.target.classList.add('in');
          revealer.unobserve(e.target);
        }
      });
    }, { rootMargin: '0px 0px -8% 0px' });
    reveals.forEach(function (el) { revealer.observe(el); });
  } else {
    reveals.forEach(function (el) { el.classList.add('in'); });
  }

  // ---- Feature clips: play like a GIF only while on screen ----
  // The markup has controls so the clips still work without JavaScript; with it they autoplay.
  var clips = Array.prototype.slice.call(document.querySelectorAll('.feature-media'));
  if (hasObserver && !reduceMotion) {
    var player = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        var v = e.target;
        if (e.isIntersecting) {
          var p = v.play();
          if (p && p.catch) p.catch(function () {});
        } else {
          v.pause();
        }
      });
    }, { threshold: 0.4 });
    clips.forEach(function (v) {
      v.removeAttribute('controls');
      player.observe(v);
    });
  }

  // ---- System diagram: open full size in a dialog (the link still works without JavaScript) ----
  var link = document.querySelector('.figure-link');
  var box = document.getElementById('lightbox');
  if (link && box && typeof box.showModal === 'function') {
    var big = box.querySelector('img');
    link.addEventListener('click', function (e) {
      if (e.metaKey || e.ctrlKey || e.shiftKey || e.button !== 0) return;
      e.preventDefault();
      var thumb = link.querySelector('img');
      big.src = link.getAttribute('href');
      big.alt = thumb ? thumb.alt : '';
      box.showModal();
    });
    box.addEventListener('click', function () { box.close(); });   // a click anywhere closes it; Esc is built in
  }
})();
