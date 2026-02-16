'use strict';

/* ══════════════════════════════
   CUSTOM CURSOR
══════════════════════════════ */
const cursor   = document.getElementById('cursor');
const follower = document.getElementById('cursorFollower');

if (window.matchMedia('(hover: hover)').matches) {
  let mx = 0, my = 0, fx = 0, fy = 0;

  document.addEventListener('mousemove', e => {
    mx = e.clientX; my = e.clientY;
    cursor.style.transform = `translate(${mx - 5}px, ${my - 5}px)`;
  });

  function lerp(a, b, t) { return a + (b - a) * t; }
  function animateFollower() {
    fx = lerp(fx, mx, 0.12);
    fy = lerp(fy, my, 0.12);
    follower.style.transform = `translate(${fx - 18}px, ${fy - 18}px)`;
    requestAnimationFrame(animateFollower);
  }
  animateFollower();

  document.querySelectorAll('a, button, .tag, .project-card, input, textarea').forEach(el => {
    el.addEventListener('mouseenter', () => {
      cursor.style.transform   += ' scale(1.6)';
      follower.style.opacity    = '0.7';
      follower.style.transform += ' scale(1.4)';
    });
    el.addEventListener('mouseleave', () => {
      follower.style.opacity = '0.45';
    });
  });
}

/* ══════════════════════════════
   NAVBAR — scroll + active link
══════════════════════════════ */
const navbar   = document.getElementById('navbar');
const navLinks = document.querySelectorAll('.nav-link');
const sections = document.querySelectorAll('section[id]');

function updateNavbar() {
  navbar.classList.toggle('scrolled', window.scrollY > 40);

  let current = '';
  sections.forEach(sec => {
    const top = sec.getBoundingClientRect().top;
    if (top <= 100) current = sec.id;
  });
  navLinks.forEach(link => {
    link.classList.toggle('active', link.getAttribute('href') === `#${current}`);
  });
}
window.addEventListener('scroll', updateNavbar, { passive: true });
updateNavbar();

/* ══════════════════════════════
   HAMBURGER MENU (Mobile)
══════════════════════════════ */
const hamburger   = document.getElementById('hamburger');
const navLinksEl  = document.getElementById('navLinks');

// Create overlay element
const overlay = document.createElement('div');
overlay.className = 'nav-overlay';
document.body.appendChild(overlay);

function openMenu() {
  hamburger.classList.add('open');
  navLinksEl.classList.add('open');
  overlay.classList.add('active');
  document.body.style.overflow = 'hidden';
}

function closeMenu() {
  hamburger.classList.remove('open');
  navLinksEl.classList.remove('open');
  overlay.classList.remove('active');
  document.body.style.overflow = '';
}

hamburger.addEventListener('click', () => {
  if (navLinksEl.classList.contains('open')) {
    closeMenu();
  } else {
    openMenu();
  }
});

// Close on overlay click
overlay.addEventListener('click', closeMenu);

// Close menu on link click
navLinksEl.querySelectorAll('a').forEach(link => {
  link.addEventListener('click', closeMenu);
});

// Close menu on resize to desktop
window.addEventListener('resize', () => {
  if (window.innerWidth > 768) {
    closeMenu();
  }
}, { passive: true });

// Close on Escape key
document.addEventListener('keydown', e => {
  if (e.key === 'Escape' && navLinksEl.classList.contains('open')) {
    closeMenu();
  }
});

/* ══════════════════════════════
   INTERSECTION OBSERVER — reveal + skills
══════════════════════════════ */
const revealEls = document.querySelectorAll('.reveal-up');
const revealObserver = new IntersectionObserver(entries => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('visible');
    }
  });
}, { threshold: 0.1 }); // Lowered for mobile where elements are taller

revealEls.forEach(el => revealObserver.observe(el));

// Skill bars
const skillItems = document.querySelectorAll('.skill-item');
const skillObserver = new IntersectionObserver(entries => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      const pct  = entry.target.dataset.percent;
      const fill = entry.target.querySelector('.skill-fill');
      setTimeout(() => {
        fill.style.width = pct + '%';
      }, 200);
      skillObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.2 });

skillItems.forEach(item => skillObserver.observe(item));

/* ══════════════════════════════
   COUNTER ANIMATION
══════════════════════════════ */
function animateCounter(el, target, duration = 1800) {
  let start = null;
  const step = timestamp => {
    if (!start) start = timestamp;
    const progress = Math.min((timestamp - start) / duration, 1);
    const eased = 1 - Math.pow(1 - progress, 3);
    el.textContent = Math.floor(eased * target);
    if (progress < 1) requestAnimationFrame(step);
    else el.textContent = target;
  };
  requestAnimationFrame(step);
}

const statNums = document.querySelectorAll('.stat-num');
const statObserver = new IntersectionObserver(entries => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      const target = parseInt(entry.target.dataset.target, 10);
      animateCounter(entry.target, target);
      statObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.5 });

statNums.forEach(el => statObserver.observe(el));

/* ══════════════════════════════
   CONTACT FORM
══════════════════════════════ */
const form        = document.querySelector('.contact-form');
const formSuccess = document.getElementById('formSuccess');

if (form && form.id === 'contactForm') {
  form.addEventListener('submit', e => {
    e.preventDefault();

    const btn      = form.querySelector('button[type="submit"]');
    const btnText  = btn.querySelector('.btn-text');
    const nameVal  = form.name.value.trim();
    const emailVal = form.email.value.trim();
    const msgVal   = form.message.value.trim();

    if (!nameVal || !emailVal || !msgVal) {
      shakeForm(form);
      return;
    }
    if (!isValidEmail(emailVal)) {
      shakeForm(form.email);
      return;
    }

    btnText.textContent = 'Sending…';
    btn.disabled = true;

    setTimeout(() => {
      form.reset();
      btnText.textContent = 'Send Message';
      btn.disabled = false;
      if (formSuccess) {
        formSuccess.classList.add('visible');
        setTimeout(() => formSuccess.classList.remove('visible'), 4000);
      }
    }, 1400);
  });
}

function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function shakeForm(el) {
  el.style.animation = 'none';
  el.offsetHeight;
  el.style.animation = 'shake .4s ease';
  setTimeout(() => el.style.animation = '', 450);
}

const shakeStyle = document.createElement('style');
shakeStyle.textContent = `
  @keyframes shake {
    0%,100% { transform: translateX(0); }
    20%      { transform: translateX(-8px); }
    40%      { transform: translateX(8px); }
    60%      { transform: translateX(-6px); }
    80%      { transform: translateX(6px); }
  }
`;
document.head.appendChild(shakeStyle);

/* ══════════════════════════════
   SMOOTH SCROLL for anchors
══════════════════════════════ */
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
  anchor.addEventListener('click', function (e) {
    const target = document.querySelector(this.getAttribute('href'));
    if (target) {
      e.preventDefault();
      const offset = 70;
      const top = target.getBoundingClientRect().top + window.scrollY - offset;
      window.scrollTo({ top, behavior: 'smooth' });
    }
  });
});

/* ══════════════════════════════
   PARALLAX on hero glow (desktop only)
══════════════════════════════ */
if (window.matchMedia('(hover: hover)').matches) {
  const heroGlow = document.querySelector('.hero-glow');
  if (heroGlow) {
    window.addEventListener('mousemove', e => {
      const x = (e.clientX / window.innerWidth  - 0.5) * 40;
      const y = (e.clientY / window.innerHeight - 0.5) * 40;
      heroGlow.style.transform = `translate(${x}px, ${y}px)`;
    }, { passive: true });
  }
}

/* ══════════════════════════════
   PROJECT CARD TILT (desktop only)
══════════════════════════════ */
if (window.matchMedia('(hover: hover)').matches) {
  document.querySelectorAll('.project-card').forEach(card => {
    card.addEventListener('mousemove', e => {
      const rect = card.getBoundingClientRect();
      const cx   = rect.left + rect.width  / 2;
      const cy   = rect.top  + rect.height / 2;
      const dx   = (e.clientX - cx) / (rect.width  / 2);
      const dy   = (e.clientY - cy) / (rect.height / 2);
      card.style.transform = `perspective(800px) rotateY(${dx * 5}deg) rotateX(${-dy * 5}deg) translateY(-6px)`;
    });
    card.addEventListener('mouseleave', () => {
      card.style.transform = '';
    });
  });
}

/* ══════════════════════════════
   TAG CLOUD FLOATING ANIMATION
══════════════════════════════ */
document.querySelectorAll('.tag').forEach((tag, i) => {
  tag.style.animationDelay = `${i * 0.07}s`;
});

/* ══════════════════════════════
   PAGE LOAD — fade in body
══════════════════════════════ */
window.addEventListener('load', () => {
  document.body.style.opacity = '0';
  document.body.style.transition = 'opacity .5s ease';
  requestAnimationFrame(() => {
    document.body.style.opacity = '1';
  });
});

/* ══════════════════════════════
   PREVENT ZOOM ON DOUBLE TAP (iOS fix)
══════════════════════════════ */
let lastTouchEnd = 0;
document.addEventListener('touchend', e => {
  const now = Date.now();
  if (now - lastTouchEnd <= 300) {
    // Only prevent on buttons/links that are not inputs
    if (!['INPUT', 'TEXTAREA', 'SELECT'].includes(e.target.tagName)) {
      e.preventDefault();
    }
  }
  lastTouchEnd = now;
}, { passive: false });
