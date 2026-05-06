/* ══════════════════════════════════════════════════════════════
   GAMING PORTFOLIO — MAIN JAVASCRIPT
   - Loading screen
   - Particle canvas (hero background)
   - Typewriter effect
   - Scroll reveal animations
   - Animated counters
   - Progress bars
   - Glitch trigger
   - Content filter
   - Mobile nav toggle
   - Navbar scroll state
   - Back to top button
   - Contact form
   - Sound toggle (Web Audio API)
══════════════════════════════════════════════════════════════ */

(function () {
  'use strict';

  /* ── Utility ───────────────────────────────────────────────── */
  const $ = (sel, ctx = document) => ctx.querySelector(sel);
  const $$ = (sel, ctx = document) => [...ctx.querySelectorAll(sel)];

  /* ══════════════════════════════════════════════════════════════
     LOADING SCREEN
  ══════════════════════════════════════════════════════════════ */
  const loader = $('#loader');
  const loaderBar = $('#loaderBar');
  const loaderStatus = $('#loaderStatus');

  const loadingMessages = [
    'INITIALIZING GAMING OS...',
    'LOADING ASSETS...',
    'CALIBRATING HUD...',
    'CONNECTING TO SERVER...',
    'SPAWNING PLAYER...',
    'SYSTEM READY.',
  ];

  document.body.classList.add('loading');

  let progress = 0;
  let msgIdx = 0;
  const totalDuration = 2400; // ms
  const interval = 50;
  const steps = totalDuration / interval;
  const increment = 100 / steps;

  const loadTick = setInterval(() => {
    progress = Math.min(100, progress + increment + Math.random() * increment * 0.5);
    loaderBar.style.width = progress + '%';

    const newMsgIdx = Math.floor((progress / 100) * (loadingMessages.length - 1));
    if (newMsgIdx !== msgIdx) {
      msgIdx = newMsgIdx;
      loaderStatus.textContent = loadingMessages[msgIdx];
    }

    if (progress >= 100) {
      clearInterval(loadTick);
      loaderStatus.textContent = loadingMessages[loadingMessages.length - 1];
      loaderBar.style.width = '100%';
      setTimeout(() => {
        loader.classList.add('hidden');
        document.body.classList.remove('loading');
        initAll();
      }, 400);
    }
  }, interval);

  /* ══════════════════════════════════════════════════════════════
     MAIN INIT (runs after loader)
  ══════════════════════════════════════════════════════════════ */
  function initAll() {
    initParticles();
    initTypewriter();
    initNavbar();
    initMobileNav();
    initScrollReveal();
    initCounters();
    initProgressBars();
    initContentFilter();
    initBackToTop();
    initContactForm();
    initSoundToggle();
    initSectionHighlight();
  }

  /* ══════════════════════════════════════════════════════════════
     PARTICLE CANVAS
  ══════════════════════════════════════════════════════════════ */
  function initParticles() {
    const canvas = $('#particleCanvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');

    let W = 0, H = 0;
    let particles = [];
    let animFrame;

    const PARTICLE_COUNT = window.innerWidth < 600 ? 40 : 80;
    const ACCENT = [255, 215, 0];

    class Particle {
      constructor() { this.reset(true); }

      reset(initial = false) {
        this.x = Math.random() * W;
        this.y = initial ? Math.random() * H : H + 10;
        this.size = Math.random() * 2 + 0.5;
        this.speedY = -(Math.random() * 0.6 + 0.2);
        this.speedX = (Math.random() - 0.5) * 0.3;
        this.opacity = Math.random() * 0.5 + 0.1;
        this.pulse = Math.random() * Math.PI * 2;
        this.pulseSpeed = Math.random() * 0.02 + 0.005;
        this.type = Math.random() > 0.85 ? 'diamond' : 'dot';
      }

      update() {
        this.y += this.speedY;
        this.x += this.speedX;
        this.pulse += this.pulseSpeed;
        this.opacity = (Math.sin(this.pulse) * 0.25 + 0.3);
        if (this.y < -10 || this.x < -10 || this.x > W + 10) this.reset();
      }

      draw() {
        ctx.save();
        ctx.globalAlpha = this.opacity;
        ctx.fillStyle = `rgb(${ACCENT.join(',')})`;
        ctx.shadowBlur = 6;
        ctx.shadowColor = `rgba(${ACCENT.join(',')}, 0.6)`;

        if (this.type === 'diamond') {
          ctx.translate(this.x, this.y);
          ctx.rotate(Math.PI / 4);
          ctx.fillRect(-this.size, -this.size, this.size * 2, this.size * 2);
        } else {
          ctx.beginPath();
          ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
          ctx.fill();
        }
        ctx.restore();
      }
    }

    function resize() {
      W = canvas.offsetWidth;
      H = canvas.offsetHeight;
      canvas.width = W;
      canvas.height = H;
    }

    function createParticles() {
      particles = Array.from({ length: PARTICLE_COUNT }, () => new Particle());
    }

    function drawGrid() {
      ctx.save();
      ctx.strokeStyle = 'rgba(255, 215, 0, 0.025)';
      ctx.lineWidth = 1;
      const grid = 60;
      for (let x = 0; x < W; x += grid) {
        ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, H); ctx.stroke();
      }
      for (let y = 0; y < H; y += grid) {
        ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(W, y); ctx.stroke();
      }
      ctx.restore();
    }

    function loop() {
      ctx.clearRect(0, 0, W, H);
      drawGrid();
      particles.forEach(p => { p.update(); p.draw(); });
      animFrame = requestAnimationFrame(loop);
    }

    resize();
    createParticles();
    loop();

    const ro = new ResizeObserver(() => {
      resize();
      particles.forEach(p => p.reset(true));
    });
    ro.observe(canvas.parentElement);
  }

  /* ══════════════════════════════════════════════════════════════
     TYPEWRITER
  ══════════════════════════════════════════════════════════════ */
  function initTypewriter() {
    const el = $('#typewriter');
    if (!el) return;

    const phrases = [
      'Leveling Up My Journey in Gaming',
      'Content Creator · Gamer · Storyteller',
      'FPS · Story · Multiplayer — No Game Too Hard',
      'Building a Community One Video at a Time',
    ];

    let phraseIdx = 0;
    let charIdx = 0;
    let deleting = false;
    let delay = 120;

    function tick() {
      const current = phrases[phraseIdx];
      if (deleting) {
        charIdx--;
        el.textContent = current.substring(0, charIdx);
        delay = 50;
        if (charIdx === 0) {
          deleting = false;
          phraseIdx = (phraseIdx + 1) % phrases.length;
          delay = 500;
        }
      } else {
        charIdx++;
        el.textContent = current.substring(0, charIdx);
        delay = 110;
        if (charIdx === current.length) {
          deleting = true;
          delay = 2200;
        }
      }
      setTimeout(tick, delay);
    }

    setTimeout(tick, 800);
  }

  /* ══════════════════════════════════════════════════════════════
     NAVBAR SCROLL STATE
  ══════════════════════════════════════════════════════════════ */
  function initNavbar() {
    const navbar = $('#navbar');
    if (!navbar) return;

    function onScroll() {
      if (window.scrollY > 60) {
        navbar.classList.add('scrolled');
      } else {
        navbar.classList.remove('scrolled');
      }
    }

    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
  }

  /* ══════════════════════════════════════════════════════════════
     ACTIVE NAV LINK (section highlight)
  ══════════════════════════════════════════════════════════════ */
  function initSectionHighlight() {
    const sections = $$('section[id]');
    const navLinks = $$('.nav-link');

    const obs = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          navLinks.forEach(l => l.classList.remove('active'));
          const active = navLinks.find(l => l.getAttribute('href') === '#' + entry.target.id);
          if (active) active.classList.add('active');
        }
      });
    }, { threshold: 0.35 });

    sections.forEach(s => obs.observe(s));
  }

  /* ══════════════════════════════════════════════════════════════
     MOBILE NAV TOGGLE
  ══════════════════════════════════════════════════════════════ */
  function initMobileNav() {
    const toggle = $('#navToggle');
    const links = $('#navLinks');
    if (!toggle || !links) return;

    toggle.addEventListener('click', () => {
      const expanded = toggle.getAttribute('aria-expanded') === 'true';
      toggle.setAttribute('aria-expanded', String(!expanded));
      links.classList.toggle('open', !expanded);
    });

    links.addEventListener('click', (e) => {
      if (e.target.classList.contains('nav-link')) {
        toggle.setAttribute('aria-expanded', 'false');
        links.classList.remove('open');
      }
    });

    // Close on outside click
    document.addEventListener('click', (e) => {
      if (!toggle.contains(e.target) && !links.contains(e.target)) {
        toggle.setAttribute('aria-expanded', 'false');
        links.classList.remove('open');
      }
    });
  }

  /* ══════════════════════════════════════════════════════════════
     SCROLL REVEAL
  ══════════════════════════════════════════════════════════════ */
  function initScrollReveal() {
    const els = $$('.reveal');
    if (!els.length) return;

    const obs = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          obs.unobserve(entry.target);
        }
      });
    }, { threshold: 0.1, rootMargin: '0px 0px -40px 0px' });

    els.forEach(el => obs.observe(el));
  }

  /* ══════════════════════════════════════════════════════════════
     ANIMATED COUNTERS
  ══════════════════════════════════════════════════════════════ */
  function initCounters() {
    const els = $$('[data-target]');
    if (!els.length) return;

    const obs = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          animateCounter(entry.target);
          obs.unobserve(entry.target);
        }
      });
    }, { threshold: 0.5 });

    els.forEach(el => obs.observe(el));
  }

  function animateCounter(el) {
    const target = parseInt(el.dataset.target, 10);
    const duration = 1800;
    const start = performance.now();

    function easeOut(t) { return 1 - Math.pow(1 - t, 3); }

    function update(now) {
      const elapsed = now - start;
      const progress = Math.min(elapsed / duration, 1);
      const value = Math.round(easeOut(progress) * target);
      el.textContent = formatNumber(value);
      if (progress < 1) requestAnimationFrame(update);
      else el.textContent = formatNumber(target);
    }

    requestAnimationFrame(update);
  }

  function formatNumber(n) {
    if (n >= 1000000) return (n / 1000000).toFixed(1) + 'M';
    if (n >= 1000) return (n / 1000).toFixed(1) + 'K';
    return n.toString();
  }

  /* ══════════════════════════════════════════════════════════════
     PROGRESS BARS
  ══════════════════════════════════════════════════════════════ */
  function initProgressBars() {
    const fills = $$('.progress-fill');
    if (!fills.length) return;

    const obs = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const width = entry.target.dataset.width;
          entry.target.style.width = width + '%';
          obs.unobserve(entry.target);
        }
      });
    }, { threshold: 0.3 });

    fills.forEach(el => obs.observe(el));
  }

  /* ══════════════════════════════════════════════════════════════
     CONTENT FILTER
  ══════════════════════════════════════════════════════════════ */
  function initContentFilter() {
    const btns = $$('.filter-btn');
    const cards = $$('.video-card');
    if (!btns.length || !cards.length) return;

    btns.forEach(btn => {
      btn.addEventListener('click', () => {
        btns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');

        const filter = btn.dataset.filter;

        cards.forEach(card => {
          const cat = card.dataset.category;
          const show = filter === 'all' || cat === filter;
          card.classList.toggle('hidden', !show);

          if (show) {
            // Re-trigger reveal animation
            card.classList.remove('visible');
            setTimeout(() => card.classList.add('visible'), 10);
          }
        });
      });
    });

    // Show all on init
    cards.forEach(c => c.classList.add('visible'));
  }

  /* ══════════════════════════════════════════════════════════════
     BACK TO TOP
  ══════════════════════════════════════════════════════════════ */
  function initBackToTop() {
    const btn = $('#backToTop');
    if (!btn) return;

    window.addEventListener('scroll', () => {
      btn.hidden = window.scrollY < 400;
    }, { passive: true });

    btn.addEventListener('click', () => {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }

  /* ══════════════════════════════════════════════════════════════
     CONTACT FORM
  ══════════════════════════════════════════════════════════════ */
  function initContactForm() {
    const form = $('#contactForm');
    const success = $('#formSuccess');
    if (!form) return;

    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const btn = form.querySelector('button[type="submit"]');
      btn.textContent = 'TRANSMITTING...';
      btn.disabled = true;

      // Simulate sending
      setTimeout(() => {
        success.hidden = false;
        form.reset();
        btn.textContent = 'SEND TRANSMISSION';
        btn.disabled = false;
        setTimeout(() => { success.hidden = true; }, 5000);
      }, 1200);
    });
  }

  /* ══════════════════════════════════════════════════════════════
     SOUND TOGGLE (Web Audio API — generates ambient gaming tone)
  ══════════════════════════════════════════════════════════════ */
  function initSoundToggle() {
    const btn = $('#soundToggle');
    if (!btn) return;

    let audioCtx = null;
    let gainNode = null;
    let oscillators = [];
    let playing = false;

    const muteIcon = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
      <polygon points="11,5 6,9 2,9 2,15 6,15 11,19 11,5"/>
      <line x1="23" y1="9" x2="17" y2="15"/>
      <line x1="17" y1="9" x2="23" y2="15"/>
    </svg>`;

    const playIcon = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
      <polygon points="11,5 6,9 2,9 2,15 6,15 11,19 11,5"/>
      <path d="M15.54 8.46a5 5 0 0 1 0 7.07"/>
      <path d="M19.07 4.93a10 10 0 0 1 0 14.14"/>
    </svg>`;

    function startAudio() {
      if (!audioCtx) {
        audioCtx = new (window.AudioContext || window.webkitAudioContext)();
        gainNode = audioCtx.createGain();
        gainNode.gain.setValueAtTime(0, audioCtx.currentTime);
        gainNode.connect(audioCtx.destination);
      }

      // Ambient drone: root + fifth
      const freqs = [55, 82.5, 110, 165]; // A1, E2, A2, E3
      oscillators = freqs.map((freq, i) => {
        const osc = audioCtx.createOscillator();
        const oscGain = audioCtx.createGain();
        osc.type = i % 2 === 0 ? 'sine' : 'triangle';
        osc.frequency.setValueAtTime(freq, audioCtx.currentTime);
        oscGain.gain.setValueAtTime(i < 2 ? 0.06 : 0.03, audioCtx.currentTime);
        osc.connect(oscGain);
        oscGain.connect(gainNode);
        osc.start();
        return osc;
      });

      // Fade in
      gainNode.gain.linearRampToValueAtTime(0.3, audioCtx.currentTime + 1.5);
    }

    function stopAudio() {
      if (!gainNode) return;
      gainNode.gain.linearRampToValueAtTime(0, audioCtx.currentTime + 0.8);
      setTimeout(() => {
        oscillators.forEach(o => { try { o.stop(); } catch (_) {} });
        oscillators = [];
      }, 900);
    }

    btn.addEventListener('click', () => {
      // Resume suspended context (browser autoplay policy)
      if (audioCtx && audioCtx.state === 'suspended') audioCtx.resume();

      playing = !playing;
      btn.setAttribute('aria-label', playing ? 'Mute background music' : 'Unmute background music');
      btn.innerHTML = playing ? muteIcon : playIcon;

      if (playing) startAudio();
      else stopAudio();
    });
  }

  /* ══════════════════════════════════════════════════════════════
     PARALLAX (hero background on scroll)
  ══════════════════════════════════════════════════════════════ */
  const heroSection = $('#hero');
  const animeChars = $$('.anime-char');

  if (heroSection && animeChars.length) {
    window.addEventListener('scroll', () => {
      const scrolled = window.scrollY;
      const heroH = heroSection.offsetHeight;
      if (scrolled > heroH) return;
      const ratio = scrolled / heroH;
      animeChars.forEach((el, i) => {
        const dir = i % 2 === 0 ? 1 : -1;
        el.style.transform = `translateY(${ratio * 80 * dir}px)`;
      });
    }, { passive: true });
  }

})();
