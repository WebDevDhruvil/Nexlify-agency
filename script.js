/* =========================================================
   Nexlify — script.js
   Handles: loading screen, theme toggle, custom cursor,
   header scroll state, mobile nav, scroll-reveal animations,
   animated stat counters, typed console effect, work filter,
   testimonial carousel, FAQ accordion, contact form validation.
   ========================================================= */

document.addEventListener('DOMContentLoaded', () => {
  initLoader();
  initThemeToggle();
  initHeaderScroll();
  initMobileNav();
  initCustomCursor();
  initScrollReveal();
  initStatCounters();
  initTypedConsole();
  initWorkFilter();
  initTestimonialCarousel();
  initFaqAccordion();
  initContactForm();
  initBackToTop();
  initYear();
});

/* ---------- Loading screen ---------- */
function initLoader() {
  const loader = document.getElementById('loader');
  if (!loader) return;

  document.body.classList.add('is-loading');

  const hide = () => {
    loader.classList.add('loader-hidden');
    document.body.classList.remove('is-loading');
  };

  // Hide once everything is loaded, with a small minimum display time
  // so the animation isn't a jarring flash on fast connections.
  const minTime = new Promise((resolve) => setTimeout(resolve, 900));
  const pageLoaded = new Promise((resolve) => {
    if (document.readyState === 'complete') resolve();
    else window.addEventListener('load', resolve, { once: true });
  });

  Promise.all([minTime, pageLoaded]).then(hide);

  // Safety net: never block the page for more than 4s
  setTimeout(hide, 4000);
}

/* ---------- Theme toggle (dark / light, persisted) ---------- */
function initThemeToggle() {
  const toggle = document.getElementById('themeToggle');
  const root = document.documentElement;
  if (!toggle) return;

  const applyLabel = (theme) => {
    const isLight = theme === 'light';
    toggle.setAttribute('aria-pressed', String(isLight));
    toggle.setAttribute('aria-label', isLight ? 'Switch to dark mode' : 'Switch to light mode');
  };

  applyLabel(root.getAttribute('data-theme') || 'dark');

  toggle.addEventListener('click', () => {
    const current = root.getAttribute('data-theme') === 'light' ? 'light' : 'dark';
    const next = current === 'light' ? 'dark' : 'light';
    root.setAttribute('data-theme', next);
    applyLabel(next);
    try {
      localStorage.setItem('nexlify-theme', next);
    } catch (e) {
      /* localStorage unavailable — theme still applies for this session */
    }
  });
}

/* ---------- Header background on scroll ---------- */
function initHeaderScroll() {
  const header = document.getElementById('header');
  if (!header) return;

  const onScroll = () => {
    header.classList.toggle('scrolled', window.scrollY > 20);
  };
  onScroll();
  window.addEventListener('scroll', onScroll, { passive: true });
}

/* ---------- Mobile nav toggle ---------- */
function initMobileNav() {
  const toggle = document.getElementById('navToggle');
  const mobileNav = document.getElementById('mobile-nav');
  if (!toggle || !mobileNav) return;

  const closeNav = () => {
    toggle.setAttribute('aria-expanded', 'false');
    mobileNav.classList.remove('open');
    document.body.style.overflow = '';
  };
  const openNav = () => {
    toggle.setAttribute('aria-expanded', 'true');
    mobileNav.classList.add('open');
    document.body.style.overflow = 'hidden';
  };

  toggle.addEventListener('click', () => {
    mobileNav.classList.contains('open') ? closeNav() : openNav();
  });
  mobileNav.querySelectorAll('a').forEach((link) => link.addEventListener('click', closeNav));
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape') closeNav(); });
}

/* ---------- Custom cursor + ambient glow (desktop only) ---------- */
function initCustomCursor() {
  if (window.matchMedia('(hover: none)').matches) return;

  const dot = document.getElementById('cursorDot');
  const ring = document.getElementById('cursorRing');
  const glow = document.querySelector('.cursor-glow');
  if (!dot || !ring) return;

  let targetX = window.innerWidth / 2;
  let targetY = window.innerHeight / 2;
  let ringX = targetX;
  let ringY = targetY;
  let glowX = targetX;
  let glowY = targetY;

  window.addEventListener('mousemove', (e) => {
    targetX = e.clientX;
    targetY = e.clientY;
    document.body.classList.add('cursor-ready');
    dot.style.transform = `translate(${targetX}px, ${targetY}px) translate(-50%, -50%)`;
  });

  const interactiveSelector = 'a, button, input, select, textarea, .work-card, .service-card, .pricing-card';
  document.addEventListener('mouseover', (e) => {
    if (e.target.closest(interactiveSelector)) ring.classList.add('is-hovering');
  });
  document.addEventListener('mouseout', (e) => {
    if (e.target.closest(interactiveSelector)) ring.classList.remove('is-hovering');
  });

  const animate = () => {
    ringX += (targetX - ringX) * 0.18;
    ringY += (targetY - ringY) * 0.18;
    ring.style.transform = `translate(${ringX}px, ${ringY}px) translate(-50%, -50%)`;

    if (glow) {
      glowX += (targetX - glowX) * 0.09;
      glowY += (targetY - glowY) * 0.09;
      glow.style.transform = `translate(${glowX}px, ${glowY}px) translate(-50%, -50%)`;
    }
    requestAnimationFrame(animate);
  };
  requestAnimationFrame(animate);
}

/* ---------- Scroll-triggered reveal animations ---------- */
function initScrollReveal() {
  const items = document.querySelectorAll('.reveal');
  if (!items.length) return;

  if (!('IntersectionObserver' in window)) {
    items.forEach((el) => el.classList.add('in-view'));
    return;
  }

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const delay = entry.target.dataset.revealDelay || 0;
          setTimeout(() => entry.target.classList.add('in-view'), delay);
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.15, rootMargin: '0px 0px -40px 0px' }
  );

  const grids = document.querySelectorAll('.work-grid, .services-grid, .process-track, .about-stats, .pricing-grid');
  grids.forEach((grid) => {
    grid.querySelectorAll('.reveal').forEach((child, i) => {
      child.dataset.revealDelay = Math.min(i * 80, 320);
    });
  });

  items.forEach((el) => observer.observe(el));
}

/* ---------- Animated stat counters ---------- */
function initStatCounters() {
  const stats = document.querySelectorAll('.stat-number');
  if (!stats.length) return;

  const animateCount = (el) => {
    const target = parseInt(el.dataset.target, 10) || 0;
    const duration = 1400;
    const start = performance.now();

    const step = (now) => {
      const progress = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      el.textContent = Math.round(eased * target);
      if (progress < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  };

  if (!('IntersectionObserver' in window)) {
    stats.forEach(animateCount);
    return;
  }

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          animateCount(entry.target);
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.5 }
  );
  stats.forEach((el) => observer.observe(el));
}

/* ---------- Typed console effect in hero ---------- */
function initTypedConsole() {
  const el = document.getElementById('typedCode');
  if (!el) return;

  const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  const lines = [
    { text: '$ npm run build', cls: 'tok-cm' },
    { text: '✓ compiling components', cls: '' },
    { text: '✓ optimizing assets', cls: '' },
    { text: '✓ running lighthouse audit', cls: '' },
    { text: '', cls: '' },
    { text: 'const', cls: 'tok-kw', inline: true },
    { text: ' launch = ', cls: '', inline: true },
    { text: 'deploy', cls: 'tok-fn', inline: true },
    { text: '(', cls: '', inline: true },
    { text: "'production'", cls: 'tok-str', inline: true },
    { text: ');', cls: '', inline: true },
  ];

  if (prefersReduced) {
    el.innerHTML = lines.map((l) => `<span class="${l.cls}">${escapeHtml(l.text)}</span>`).join('\n');
    return;
  }

  let html = '';
  let lineIndex = 0;
  let charIndex = 0;

  function typeNext() {
    if (lineIndex >= lines.length) {
      setTimeout(() => {
        html = '';
        lineIndex = 0;
        charIndex = 0;
        el.innerHTML = '';
        typeNext();
      }, 2200);
      return;
    }

    const current = lines[lineIndex];
    const isInline = current.inline;
    const target = current.text;

    charIndex++;
    const partial = target.slice(0, charIndex);
    el.innerHTML = html + `<span class="${current.cls}">${escapeHtml(partial)}</span>`;

    if (charIndex < target.length) {
      setTimeout(typeNext, current.cls === 'tok-cm' ? 22 : 16);
    } else {
      lineIndex++;
      charIndex = 0;
      html += `<span class="${current.cls}">${escapeHtml(target)}</span>${isInline ? '' : '\n'}`;
      setTimeout(typeNext, isInline ? 40 : 180);
    }
  }

  function escapeHtml(str) {
    return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  }

  typeNext();
}

/* ---------- Work / portfolio filter ---------- */
function initWorkFilter() {
  const buttons = document.querySelectorAll('.filter-btn');
  const cards = document.querySelectorAll('.work-card');
  if (!buttons.length || !cards.length) return;

  buttons.forEach((btn) => {
    btn.addEventListener('click', () => {
      const filter = btn.dataset.filter;

      buttons.forEach((b) => {
        b.classList.remove('is-active');
        b.setAttribute('aria-selected', 'false');
      });
      btn.classList.add('is-active');
      btn.setAttribute('aria-selected', 'true');

      cards.forEach((card) => {
        const category = card.dataset.category;
        const show = filter === 'all' || category === filter || category === 'all';
        card.classList.toggle('is-hidden', !show);
      });
    });
  });
}

/* ---------- Testimonial carousel ---------- */
function initTestimonialCarousel() {
  const track = document.getElementById('testimonialTrack');
  const dotsWrap = document.getElementById('testimonialDots');
  if (!track || !dotsWrap) return;

  const slides = Array.from(track.children);
  if (!slides.length) return;

  let index = 0;
  let timer = null;

  slides.forEach((_, i) => {
    const dot = document.createElement('button');
    dot.setAttribute('role', 'tab');
    dot.setAttribute('aria-label', `Show testimonial ${i + 1}`);
    dot.setAttribute('aria-selected', i === 0 ? 'true' : 'false');
    if (i === 0) dot.classList.add('is-active');
    dot.addEventListener('click', () => goTo(i, true));
    dotsWrap.appendChild(dot);
  });
  const dots = Array.from(dotsWrap.children);

  function goTo(i, userInitiated) {
    index = (i + slides.length) % slides.length;
    track.style.transform = `translateX(-${index * 100}%)`;
    dots.forEach((d, di) => {
      d.classList.toggle('is-active', di === index);
      d.setAttribute('aria-selected', String(di === index));
    });
    if (userInitiated) restartAutoplay();
  }

  function restartAutoplay() {
    if (timer) clearInterval(timer);
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    timer = setInterval(() => goTo(index + 1, false), 6000);
  }

  restartAutoplay();

  // Pause on hover/focus for readability
  const viewport = track.parentElement;
  viewport.addEventListener('mouseenter', () => timer && clearInterval(timer));
  viewport.addEventListener('mouseleave', restartAutoplay);
}

/* ---------- FAQ accordion ---------- */
function initFaqAccordion() {
  const triggers = document.querySelectorAll('.faq-trigger');
  if (!triggers.length) return;

  triggers.forEach((trigger) => {
    trigger.addEventListener('click', () => {
      const panel = document.getElementById(trigger.getAttribute('aria-controls'));
      const isOpen = trigger.getAttribute('aria-expanded') === 'true';

      // Close any other open panel for a single-open accordion feel
      triggers.forEach((other) => {
        if (other !== trigger) {
          other.setAttribute('aria-expanded', 'false');
          const otherPanel = document.getElementById(other.getAttribute('aria-controls'));
          if (otherPanel) otherPanel.style.maxHeight = '';
        }
      });

      trigger.setAttribute('aria-expanded', String(!isOpen));
      if (!isOpen && panel) {
        panel.style.maxHeight = panel.scrollHeight + 'px';
      } else if (panel) {
        panel.style.maxHeight = '';
      }
    });
  });
}

/* ---------- Contact form validation (client-side, no backend) ---------- */
function initContactForm() {
  const form = document.getElementById('contactForm');
  if (!form) return;

  const success = document.getElementById('formSuccess');
  const submitLabel = document.getElementById('submitLabel');

  const validators = {
    name: (v) => v.trim().length > 1,
    email: (v) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.trim()),
    project: (v) => v.trim().length > 0,
    message: (v) => v.trim().length > 4,
  };

  function validateField(field) {
    const name = field.name;
    if (!validators[name]) return true;
    const valid = validators[name](field.value);
    const wrapper = field.closest('.form-field');
    if (wrapper) wrapper.classList.toggle('invalid', !valid);
    return valid;
  }

  form.querySelectorAll('input, select, textarea').forEach((field) => {
    field.addEventListener('blur', () => validateField(field));
    field.addEventListener('input', () => {
      const wrapper = field.closest('.form-field');
      if (wrapper && wrapper.classList.contains('invalid')) validateField(field);
    });
    field.addEventListener('change', () => validateField(field));
  });

  form.addEventListener('submit', (e) => {
    e.preventDefault();

    const fields = Array.from(form.querySelectorAll('input, select, textarea'));
    const allValid = fields.reduce((acc, field) => validateField(field) && acc, true);

    if (!allValid) {
      const firstInvalid = form.querySelector('.form-field.invalid input, .form-field.invalid select, .form-field.invalid textarea');
      if (firstInvalid) firstInvalid.focus();
      return;
    }

    const submitBtn = form.querySelector('button[type="submit"]');
    submitBtn.disabled = true;
    submitLabel.textContent = 'Sending…';

    // Simulate submission — replace with a real endpoint integration as needed.
    setTimeout(() => {
      success.classList.add('visible');
      form.reset();
      submitLabel.textContent = 'Send message';
      submitBtn.disabled = false;
      setTimeout(() => success.classList.remove('visible'), 6000);
    }, 900);
  });
}

/* ---------- Back to top button ---------- */
function initBackToTop() {
  const btn = document.getElementById('backToTop');
  if (!btn) return;

  window.addEventListener('scroll', () => {
    btn.classList.toggle('visible', window.scrollY > 600);
  }, { passive: true });

  btn.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });
}

/* ---------- Footer year ---------- */
function initYear() {
  const el = document.getElementById('year');
  if (el) el.textContent = new Date().getFullYear();
}
