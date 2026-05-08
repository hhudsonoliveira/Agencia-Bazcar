/* ============================================================
   Agência Bazcar — animations.js
   IntersectionObserver: reveal on scroll + counter-up
   ============================================================ */

(function () {
  'use strict';

  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* === REVEAL ON SCROLL === */
  // Seleciona todos os três tipos de reveal
  const revealEls = document.querySelectorAll('.reveal, .reveal-left, .reveal-scale');

  if (reducedMotion) {
    // Acessibilidade: exibe tudo imediatamente sem animação
    revealEls.forEach(function (el) {
      el.classList.add('revealed');
    });
  } else {
    var isMobile = window.innerWidth < 768;
    var revealObserver = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          var delay = entry.target.dataset.delay;
          if (delay) {
            entry.target.style.transitionDelay = delay + 'ms';
          }
          entry.target.classList.add('revealed');
          revealObserver.unobserve(entry.target);
        }
      });
    }, {
      threshold: isMobile ? 0.05 : 0.15,
      rootMargin: isMobile ? '0px 0px 0px 0px' : '0px 0px -40px 0px'
    });

    revealEls.forEach(function (el) {
      revealObserver.observe(el);
    });
  }

  /* === COUNTER-UP === */
  // Elementos marcados com data-count="NUM"
  // Sufixo (+, %) deve ficar fora do span no HTML
  // Separador de milhar: ponto (pt-BR) para valores >= 1000

  function easeOutExpo(t) {
    return t === 1 ? 1 : 1 - Math.pow(2, -10 * t);
  }

  function animateCount(el, target) {
    if (reducedMotion) {
      el.textContent = target >= 1000
        ? target.toLocaleString('pt-BR')
        : String(target);
      return;
    }

    var duration = 2000;
    var start    = performance.now();
    var isLarge  = target >= 1000;

    function update(now) {
      var elapsed  = now - start;
      var progress = Math.min(elapsed / duration, 1);
      var eased    = easeOutExpo(progress);
      var current  = Math.round(eased * target);

      el.textContent = isLarge
        ? current.toLocaleString('pt-BR')
        : String(current);

      if (progress < 1) {
        requestAnimationFrame(update);
      }
    }

    requestAnimationFrame(update);
  }

  var counterEls = document.querySelectorAll('[data-count]');

  var counterObserver = new IntersectionObserver(function (entries) {
    entries.forEach(function (entry) {
      if (entry.isIntersecting) {
        var target = parseInt(entry.target.dataset.count, 10);
        if (!isNaN(target)) {
          animateCount(entry.target, target);
        }
        counterObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.5 });

  counterEls.forEach(function (el) {
    counterObserver.observe(el);
  });

  /* === TYPEWRITER (frase completa) === */
  // Reconstrói o <h1> dinamicamente: texto plano + <br> nas quebras + <em> no último segmento
  function initTypewriter() {
    var el = document.querySelector('.typewriter[data-text]');
    if (!el) return;

    var isMobileTw  = window.innerWidth < 768;
    var baseSpeed   = isMobileTw ? 35 : 42;
    var startDelay  = isMobileTw ? 400 : 900;

    // Segmentos separados por "|" no data-text
    var segments = el.getAttribute('data-text').split('|');
    var lastIdx  = segments.length - 1;

    // Cursor piscante — permanece sempre como último filho do h1
    var cursor = document.createElement('span');
    cursor.className = 'tw-cursor';
    cursor.setAttribute('aria-hidden', 'true');
    cursor.textContent = '|';

    el.innerHTML = '';
    el.appendChild(cursor);

    var textNodes = [];

    function getNode(idx) {
      if (textNodes[idx]) return textNodes[idx];

      var node = document.createTextNode('');

      if (idx === lastIdx) {
        var em = document.createElement('em');
        em.className = 'highlight';
        em.appendChild(node);
        el.insertBefore(em, cursor);
      } else {
        el.insertBefore(node, cursor);
      }

      textNodes[idx] = node;
      return node;
    }

    var tokens = [];
    segments.forEach(function (seg, idx) {
      for (var c = 0; c < seg.length; c++) {
        tokens.push({ type: 'char', ch: seg.charAt(c), seg: idx });
      }
      if (idx < lastIdx) {
        tokens.push({ type: 'br', seg: idx });
      }
    });

    var i = 0;

    function type() {
      if (i >= tokens.length) {
        setTimeout(function () { cursor.classList.add('done'); }, 1200);
        return;
      }

      var token = tokens[i++];

      if (token.type === 'br') {
        el.insertBefore(document.createElement('br'), cursor);
        setTimeout(type, 140);
      } else {
        getNode(token.seg).textContent += token.ch;
        var jitter = Math.random() * 20 - 10;
        setTimeout(type, baseSpeed + jitter);
      }
    }

    setTimeout(type, startDelay);
  }

  initTypewriter();

  /* === CAROUSEL MARQUEE + LIGHTBOX === */
  function initCarousel() {
    var track = document.getElementById('carouselTrack');
    if (!track) return;

    var origSlides = Array.from(track.querySelectorAll('.carousel-slide'));

    // Duplicate slides for seamless infinite loop (-50% translation)
    origSlides.forEach(function (slide) {
      var clone = slide.cloneNode(true);
      clone.setAttribute('aria-hidden', 'true');
      var v = clone.querySelector('video');
      if (v) v.load();
      track.appendChild(clone);
    });

    // Lightbox
    var lightbox = document.getElementById('lightbox');
    var lbImg    = document.getElementById('lightboxImg');
    var lbVideo  = document.getElementById('lightboxVideo');
    var lbClose  = document.getElementById('lightboxClose');
    var lbPrev   = document.getElementById('lightboxPrev');
    var lbNext   = document.getElementById('lightboxNext');

    var imgData = origSlides
      .filter(function (s) { return s.dataset.type === 'image'; })
      .map(function (s) { var i = s.querySelector('img'); return { src: i.src, alt: i.alt }; });
    var lbIdx = 0;

    function openLightbox(src, alt) {
      var found = imgData.findIndex(function (d) { return d.src === src; });
      lbIdx = found !== -1 ? found : 0;
      lbImg.src = src;
      lbImg.alt = alt;
      lbImg.style.display = '';
      lbVideo.style.display = 'none';
      lbVideo.pause();
      lbVideo.src = '';
      lbPrev.style.display = '';
      lbNext.style.display = '';
      lightbox.removeAttribute('hidden');
      lbClose.focus();
      track.style.animationPlayState = 'paused';
    }

    function openVideoLightbox(src) {
      lbImg.style.display = 'none';
      lbVideo.style.display = 'block';
      lbVideo.src = src;
      lbVideo.load();
      lbPrev.style.display = 'none';
      lbNext.style.display = 'none';
      lightbox.removeAttribute('hidden');
      lbClose.focus();
      track.style.animationPlayState = 'paused';
      lbVideo.play().catch(function () {});
    }

    function closeLightbox() {
      lightbox.setAttribute('hidden', '');
      lbVideo.pause();
      lbVideo.src = '';
      lbVideo.style.display = 'none';
      lbImg.style.display = '';
      lbPrev.style.display = '';
      lbNext.style.display = '';
      track.style.animationPlayState = '';
    }

    function lbGoTo(idx) {
      lbIdx = (idx + imgData.length) % imgData.length;
      lbImg.src = imgData[lbIdx].src;
      lbImg.alt = imgData[lbIdx].alt;
    }

    // Delegate click on track (handles both originals and clones)
    track.addEventListener('click', function (e) {
      var slide = e.target.closest('.carousel-slide');
      if (!slide) return;
      if (slide.dataset.type === 'image') {
        var img = slide.querySelector('img');
        if (img) openLightbox(img.src, img.alt);
      } else if (slide.dataset.type === 'video') {
        var vid = slide.querySelector('video');
        if (vid) openVideoLightbox(vid.src);
      }
    });

    lbClose.addEventListener('click', closeLightbox);
    lbPrev.addEventListener('click', function () { lbGoTo(lbIdx - 1); });
    lbNext.addEventListener('click', function () { lbGoTo(lbIdx + 1); });
    lightbox.addEventListener('click', function (e) { if (e.target === lightbox) closeLightbox(); });

    document.addEventListener('keydown', function (e) {
      if (lightbox.hasAttribute('hidden')) return;
      if (e.key === 'Escape') closeLightbox();
      if (e.key === 'ArrowLeft') lbGoTo(lbIdx - 1);
      if (e.key === 'ArrowRight') lbGoTo(lbIdx + 1);
    });

    // Touch: pause briefly on tap/swipe, open lightbox on clean tap
    var touchStartX = 0;
    var touchStartY = 0;
    track.addEventListener('touchstart', function (e) {
      touchStartX = e.changedTouches[0].clientX;
      touchStartY = e.changedTouches[0].clientY;
      track.style.animationPlayState = 'paused';
    }, { passive: true });
    track.addEventListener('touchend', function (e) {
      var dx = Math.abs(e.changedTouches[0].clientX - touchStartX);
      var dy = Math.abs(e.changedTouches[0].clientY - touchStartY);
      var delay = dx < 8 && dy < 8 ? 900 : 1200;
      setTimeout(function () {
        if (lightbox.hasAttribute('hidden')) {
          track.style.animationPlayState = '';
        }
      }, delay);
    }, { passive: true });
  }

  initCarousel();

  /* === TOUCH DEVICE — hover fallback para cards === */
  // Em dispositivos touch, adiciona classe .touched no tap para simular hover
  var isTouchDevice = window.matchMedia('(hover: none)').matches;

  if (isTouchDevice) {
    var cards = document.querySelectorAll('.service-card, .stat-card');
    cards.forEach(function (card) {
      card.addEventListener('touchstart', function () {
        this.classList.add('touched');
      }, { passive: true });
      card.addEventListener('touchend', function () {
        var self = this;
        setTimeout(function () { self.classList.remove('touched'); }, 400);
      }, { passive: true });
    });
  }

})();
