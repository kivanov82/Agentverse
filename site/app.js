/* ShipWithAI — site interactions (vanilla, no deps).
 * Scroll-reveal + terminal trigger (IntersectionObserver), mouse parallax for the
 * aurora/mesh field, and 3D tilt + cursor spotlight on cards. Ported from the
 * Claude Design template's initFx. All effects no-op under reduced-motion. */
(function () {
  var root = document.getElementById('root');
  if (!root) return;
  var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // Scroll reveal / terminal trigger
  try {
    var io = new IntersectionObserver(function (ents) {
      ents.forEach(function (en) {
        if (en.isIntersecting) { en.target.classList.add('is-in'); io.unobserve(en.target); }
      });
    }, { threshold: 0.18, rootMargin: '0px 0px -8% 0px' });
    document.querySelectorAll('[data-io]:not(.is-in)').forEach(function (el) { io.observe(el); });
  } catch (e) {
    document.querySelectorAll('[data-io]').forEach(function (el) { el.classList.add('is-in'); });
  }

  if (reduce) return;

  // Mouse parallax (orbs + mesh) + card tilt + spotlight
  root.addEventListener('pointermove', function (e) {
    var r = root.getBoundingClientRect();
    root.style.setProperty('--px', (((e.clientX - r.left) / r.width) * 2 - 1).toFixed(3));
    root.style.setProperty('--py', (((e.clientY - r.top) / r.height) * 2 - 1).toFixed(3));
    var card = e.target.closest && e.target.closest('.sw-card-fx');
    if (card) {
      var cr = card.getBoundingClientRect();
      var x = (e.clientX - cr.left) / cr.width, y = (e.clientY - cr.top) / cr.height;
      card.style.setProperty('--cx', (x * 100).toFixed(1) + '%');
      card.style.setProperty('--cy', (y * 100).toFixed(1) + '%');
      card.style.transform = 'perspective(820px) rotateX(' + ((0.5 - y) * 7).toFixed(2) + 'deg) rotateY(' + ((x - 0.5) * 7).toFixed(2) + 'deg) translateY(-4px)';
    }
  });
  root.addEventListener('pointerout', function (e) {
    var card = e.target.closest && e.target.closest('.sw-card-fx');
    if (card && (!e.relatedTarget || !card.contains(e.relatedTarget))) card.style.transform = '';
  });
})();
