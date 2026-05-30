/* ── main.js ── Arun Natarajan Portfolio ── */
(function () {
  'use strict';

  /* ─── CURSOR ─── */
  const cursor = document.getElementById('cursor');
  const follower = document.getElementById('cursorFollower');
  if (cursor && follower && window.matchMedia('(pointer: fine)').matches) {
    let mx = 0, my = 0, fx = 0, fy = 0;
    document.addEventListener('mousemove', e => {
      mx = e.clientX; my = e.clientY;
      cursor.style.left = mx + 'px';
      cursor.style.top = my + 'px';
    });
    (function animateFollower() {
      fx += (mx - fx) * 0.12;
      fy += (my - fy) * 0.12;
      follower.style.left = fx + 'px';
      follower.style.top = fy + 'px';
      requestAnimationFrame(animateFollower);
    })();
    document.querySelectorAll('a, button, .about-card, .proj-card, .contact-card').forEach(el => {
      el.addEventListener('mouseenter', () => { cursor.classList.add('hovered'); follower.classList.add('hovered'); });
      el.addEventListener('mouseleave', () => { cursor.classList.remove('hovered'); follower.classList.remove('hovered'); });
    });
  }

  /* ─── NAVBAR SCROLL ─── */
  const navbar = document.getElementById('navbar');
  window.addEventListener('scroll', () => {
    navbar.classList.toggle('scrolled', window.scrollY > 40);
  }, { passive: true });

  /* ─── HAMBURGER ─── */
  const hamburger = document.getElementById('hamburger');
  const navLinks = document.getElementById('navLinks');
  if (hamburger && navLinks) {
    hamburger.addEventListener('click', () => {
      hamburger.classList.toggle('active');
      navLinks.classList.toggle('open');
    });
    navLinks.querySelectorAll('a').forEach(a => {
      a.addEventListener('click', () => {
        hamburger.classList.remove('active');
        navLinks.classList.remove('open');
      });
    });
    document.addEventListener('click', e => {
      if (!navbar.contains(e.target)) {
        hamburger.classList.remove('active');
        navLinks.classList.remove('open');
      }
    });
  }

  /* ─── ACTIVE NAV LINK ON SCROLL ─── */
  const sections = document.querySelectorAll('section[id]');
  const navAs = document.querySelectorAll('.nav-links a');
  function setActive() {
    const scrollY = window.scrollY + 100;
    sections.forEach(sec => {
      if (scrollY >= sec.offsetTop && scrollY < sec.offsetTop + sec.offsetHeight) {
        navAs.forEach(a => {
          a.classList.remove('active');
          if (a.getAttribute('href') === '#' + sec.id) a.classList.add('active');
        });
      }
    });
  }
  window.addEventListener('scroll', setActive, { passive: true });

  /* ─── COUNTER ANIMATION ─── */
  function animateCounter(el, target, duration = 1800) {
    let start = 0;
    const step = timestamp => {
      if (!start) start = timestamp;
      const progress = Math.min((timestamp - start) / duration, 1);
      el.textContent = Math.floor(progress * target);
      if (progress < 1) requestAnimationFrame(step);
      else el.textContent = target;
    };
    requestAnimationFrame(step);
  }

  /* ─── INTERSECTION OBSERVER ─── */
  const observerOpts = { threshold: 0.15, rootMargin: '0px 0px -40px 0px' };
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      const el = entry.target;

      // Reveal
      if (el.classList.contains('reveal')) el.classList.add('visible');

      // Progress bars
      if (el.classList.contains('prof-fill')) {
        el.style.width = el.dataset.w + '%';
      }

      // Counters
      if (el.classList.contains('stat-num')) {
        animateCounter(el, parseInt(el.dataset.target));
      }

      observer.unobserve(el);
    });
  }, observerOpts);

  // Observe reveal elements
  document.querySelectorAll(
    '.about-card, .skill-group, .tl-item, .proj-card, .contact-card, .contact-form, .detail-item'
  ).forEach((el, i) => {
    el.classList.add('reveal');
    el.style.transitionDelay = (i % 4) * 0.08 + 's';
    observer.observe(el);
  });

  // Observe bars
  document.querySelectorAll('.prof-fill').forEach(el => observer.observe(el));

  // Observe counters
  document.querySelectorAll('.stat-num').forEach(el => observer.observe(el));

  /* ─── CONTACT FORM ─── */
  const form = document.getElementById('contactForm');
  const note = document.getElementById('formNote');
  if (form) {
    form.addEventListener('submit', async function (e) {
      e.preventDefault();

      const btn = form.querySelector('.btn-submit');

      // ── collect values ──
      const name = form.name.value.trim();
      const email = form.email.value.trim();
      const subject = form.subject.value.trim();
      const message = form.message.value.trim();

      // ── basic client-side guard ──
      if (!name || !email || !subject || !message) {
        showNote('Please fill in all fields.', 'error');
        return;
      }

      // ── loading state ──
      btn.disabled = true;
      btn.innerHTML = '<span>Sending…</span> <i class="fa-solid fa-spinner fa-spin"></i>';
      showNote('', '');

      try {
        const res = await fetch('https://api.web3forms.com/submit', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
          body: JSON.stringify({
            access_key: 'a6c92c77-0b2d-48d1-aaf0-b17140b6698c',   // ← paste your key here
            name,
            email,
            subject,
            message
          })
        });

        const data = await res.json();

        if (data.success) {
          btn.innerHTML = '<span>Message Sent!</span> <i class="fa-solid fa-check"></i>';
          btn.style.background = 'linear-gradient(135deg,#00b894,#0ea5e9)';
          showNote('Thank you! I\'ll get back to you within 24 hours.', 'success');
          form.reset();

          // reset button after 5 s
          setTimeout(() => {
            btn.innerHTML = '<span>Send Message</span> <i class="fa-solid fa-paper-plane"></i>';
            btn.style.background = '';
            btn.disabled = false;
            showNote('', '');
          }, 5000);

        } else {
          throw new Error(data.message || 'Submission failed');
        }
      } catch (err) {
        btn.innerHTML = '<span>Send Message</span> <i class="fa-solid fa-paper-plane"></i>';
        btn.disabled = false;
        showNote('Something went wrong: ' + err.message, 'error');
      }
    });

    function showNote(msg, type) {
      note.textContent = msg;
      note.style.color = type === 'success' ? 'var(--accent)'
        : type === 'error' ? '#ff6b6b'
          : '';
    }
  }

  /* ─── SMOOTH SCROLL OFFSET FOR FIXED NAV ─── */
  document.querySelectorAll('a[href^="#"]').forEach(a => {
    a.addEventListener('click', e => {
      const target = document.querySelector(a.getAttribute('href'));
      if (target) {
        e.preventDefault();
        const top = target.getBoundingClientRect().top + window.scrollY - 72;
        window.scrollTo({ top, behavior: 'smooth' });
      }
    });
  });

})();
