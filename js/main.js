/* BackSolve AI — site behaviour.
   No dependencies. Everything here is progressive enhancement:
   the page is fully readable with JavaScript switched off. */

(() => {
  'use strict';

  // ---------------------------------------------------------------------
  // CONFIG — fill these in before launch.
  // ---------------------------------------------------------------------
  const CONFIG = {
    // Your business email. The contact form opens the visitor's mail app
    // with a pre-filled message to this address.
    email: '',
    // Optional: a Cal.com / Calendly link. If set, every "Book a call"
    // button opens it in a new tab instead of scrolling to the form.
    bookingUrl: '',
  };

  const root = document.documentElement;
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const finePointer = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
  const hasObserver = 'IntersectionObserver' in window;

  // --- Scroll progress bar and header state --------------------------------
  const bar = document.getElementById('progress-bar');
  const header = document.getElementById('site-header');
  let ticking = false;

  const onScroll = () => {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(() => {
      ticking = false;
      const max = root.scrollHeight - window.innerHeight;
      const progress = max > 0 ? Math.min(1, window.scrollY / max) : 0;
      if (bar) bar.style.transform = `scaleX(${progress.toFixed(4)})`;
      if (header) header.classList.toggle('is-scrolled', window.scrollY > 24);
    });
  };
  window.addEventListener('scroll', onScroll, { passive: true });
  window.addEventListener('resize', onScroll, { passive: true });
  onScroll();

  // --- Scroll reveals --------------------------------------------------------
  // [data-reveal]  fades and slides up as a block.
  // [data-stagger] reveals its children one after another.
  // [data-track]   draws the line across the three steps and lights each node.
  document.querySelectorAll('[data-stagger]').forEach((group) => {
    Array.from(group.children).forEach((child, i) => child.style.setProperty('--i', i));
  });

  const revealTargets = document.querySelectorAll('[data-reveal], [data-stagger], [data-track]');
  if (reduceMotion || !hasObserver) {
    revealTargets.forEach((el) => el.classList.add('is-visible'));
  } else {
    const io = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add('is-visible');
        io.unobserve(entry.target);
      });
    }, { threshold: 0.15, rootMargin: '0px 0px -6% 0px' });
    revealTargets.forEach((el) => io.observe(el));
  }

  // --- Hero: a soft light follows the pointer; the ring rests off screen -----
  const hero = document.querySelector('.hero');
  if (hero) {
    const spot = hero.querySelector('.hero__spot');
    if (spot && finePointer && !reduceMotion) {
      hero.addEventListener('pointermove', (event) => {
        const rect = hero.getBoundingClientRect();
        const x = (event.clientX - rect.left) / rect.width - 0.5;
        const y = (event.clientY - rect.top) / rect.height - 0.5;
        spot.style.setProperty('--px', `${(x * 260).toFixed(1)}px`);
        spot.style.setProperty('--py', `${(y * 180).toFixed(1)}px`);
      });
      hero.addEventListener('pointerleave', () => {
        spot.style.setProperty('--px', '0px');
        spot.style.setProperty('--py', '0px');
      });
    }
    if (hasObserver) {
      new IntersectionObserver((entries) => {
        entries.forEach((entry) => hero.classList.toggle('is-paused', !entry.isIntersecting));
      }).observe(hero);
    }
  }

  // --- Cards: a highlight follows the pointer across each card ---------------
  if (finePointer) {
    document.querySelectorAll('.card').forEach((card) => {
      card.addEventListener('pointermove', (event) => {
        const rect = card.getBoundingClientRect();
        card.style.setProperty('--mx', `${(event.clientX - rect.left).toFixed(0)}px`);
        card.style.setProperty('--my', `${(event.clientY - rect.top).toFixed(0)}px`);
      });
    });
  }

  // --- Header links: mark the section currently on screen --------------------
  const navLinks = Array.from(document.querySelectorAll('.nav__links a[href^="#"]'));
  const sections = navLinks
    .map((link) => document.getElementById(link.getAttribute('href').slice(1)))
    .filter(Boolean);
  if (hasObserver && sections.length) {
    const spy = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        const link = navLinks.find((a) => a.getAttribute('href') === `#${entry.target.id}`);
        if (!link) return;
        if (entry.isIntersecting) link.setAttribute('aria-current', 'true');
        else link.removeAttribute('aria-current');
      });
    }, { rootMargin: '-45% 0px -45% 0px' });
    sections.forEach((section) => spy.observe(section));
  }

  // --- "Book a call" buttons ---------------------------------------------------
  if (CONFIG.bookingUrl) {
    document.querySelectorAll('[data-book]').forEach((link) => {
      link.setAttribute('href', CONFIG.bookingUrl);
      link.setAttribute('target', '_blank');
      link.setAttribute('rel', 'noopener');
    });
  }

  // --- Contact form ------------------------------------------------------------
  // There is no server. The form opens the visitor's mail app with the
  // details filled in. Swap this for a form service if you prefer.
  const form = document.getElementById('book-form');
  const status = document.getElementById('form-status');
  if (form) {
    form.addEventListener('submit', (event) => {
      event.preventDefault();
      if (!form.reportValidity()) return;

      if (!CONFIG.email) {
        if (status) status.textContent = 'This form is not connected yet. Add your email or booking link in js/main.js.';
        return;
      }

      const data = new FormData(form);
      const name = String(data.get('name') || '').trim();
      const firm = String(data.get('firm') || '').trim();
      const subject = `Call request from ${name}${firm ? ` (${firm})` : ''}`;
      const body = [
        `Name: ${name}`,
        `Firm: ${firm}`,
        `Email: ${String(data.get('email') || '').trim()}`,
        '',
        'Most repetitive task on our team:',
        String(data.get('task') || '').trim(),
      ].join('\n');

      window.location.href = `mailto:${CONFIG.email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
      if (status) status.textContent = 'Your mail app should open with the message ready to send.';
    });
  }

  // --- Footer year ---------------------------------------------------------------
  const year = document.getElementById('year');
  if (year) year.textContent = String(new Date().getFullYear());
})();
