/* ============================================================
   Agência Bazcar — main.js
   Lógica geral: navbar, menu mobile, active nav, progress bar
   ============================================================ */

(function () {
  'use strict';

  /* === NAVBAR SCROLL + PROGRESS BAR === */
  const navbar      = document.getElementById('navbar');
  const progressBar = document.getElementById('progress-bar');

  function onScroll() {
    // Navbar shrink ao descer
    if (window.scrollY > 60) {
      navbar.classList.add('scrolled');
    } else {
      navbar.classList.remove('scrolled');
    }

    // Barra de progresso de leitura
    const scrollTop  = window.scrollY;
    const docHeight  = document.documentElement.scrollHeight - window.innerHeight;
    const progress   = docHeight > 0 ? (scrollTop / docHeight) * 100 : 0;
    progressBar.style.width = progress + '%';

    // Active link na nav
    updateActiveNav();
  }

  window.addEventListener('scroll', onScroll, { passive: true });

  /* === ACTIVE NAV LINK === */
  const sections    = document.querySelectorAll('section[id]');
  const navLinksAll = document.querySelectorAll('.nav-links a');

  function updateActiveNav() {
    let current = '';
    sections.forEach(function (section) {
      if (window.scrollY >= section.offsetTop - 120) {
        current = section.getAttribute('id');
      }
    });
    navLinksAll.forEach(function (a) {
      a.style.color = (a.getAttribute('href') === '#' + current)
        ? 'var(--white)'
        : '';
    });
  }

  /* === MOBILE MENU === */
  const hamburger  = document.getElementById('hamburger');
  const mobileMenu = document.getElementById('mobileMenu');

  if (hamburger && mobileMenu) {
    const mobileLinks = mobileMenu.querySelectorAll('a');

    function closeMobileMenu() {
      hamburger.classList.remove('active');
      hamburger.setAttribute('aria-expanded', 'false');
      mobileMenu.classList.remove('open');
      document.body.style.overflow = '';
    }

    hamburger.addEventListener('click', function () {
      const isOpen = mobileMenu.classList.contains('open');
      if (isOpen) {
        closeMobileMenu();
      } else {
        hamburger.classList.add('active');
        hamburger.setAttribute('aria-expanded', 'true');
        mobileMenu.classList.add('open');
        document.body.style.overflow = 'hidden';
      }
    });

    mobileLinks.forEach(function (link) {
      link.addEventListener('click', closeMobileMenu);
    });

    // Fecha com Escape
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && mobileMenu.classList.contains('open')) {
        closeMobileMenu();
      }
    });
  }


  /* === 3D TILT — service cards === */
  var tiltCards = document.querySelectorAll('.service-card');
  var noTilt    = window.matchMedia('(hover: none)').matches; // não aplica em touch

  if (!noTilt) {
    tiltCards.forEach(function (card) {
      card.addEventListener('mouseenter', function () {
        card.style.transition = 'border-color 0.35s, box-shadow 0.35s, transform 0.12s ease';
      });

      card.addEventListener('mousemove', function (e) {
        var rect = card.getBoundingClientRect();
        var rx   = -((e.clientY - rect.top)  / rect.height - 0.5) * 14;
        var ry   =  ((e.clientX - rect.left) / rect.width  - 0.5) * 14;
        card.style.transform = 'perspective(900px) rotateX(' + rx + 'deg) rotateY(' + ry + 'deg) translateZ(8px)';
      });

      card.addEventListener('mouseleave', function () {
        card.style.transition = 'border-color 0.35s, box-shadow 0.35s, transform 0.5s ease';
        card.style.transform  = '';
      });
    });
  }

})();
