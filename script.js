/* ═══════════════════════════════════════════════════════════════════════════════
   SOURABH RAMTEKE PORTFOLIO — INTERACTIVE ENGINE
   ═══════════════════════════════════════════════════════════════════════════════ */

'use strict';

/* ── UTILITY ─────────────────────────────────────────────────────────────────── */
const $ = (s, p = document) => p.querySelector(s);
const $$ = (s, p = document) => [...p.querySelectorAll(s)];
const lerp = (a, b, t) => a + (b - a) * t;
const clamp = (v, lo, hi) => Math.max(lo, Math.min(hi, v));
const rand = (a, b) => a + Math.random() * (b - a);
const PI2 = Math.PI * 2;

/* ══════════════════════════════════════════════════════════════════════════════
   1. LOADER
   ══════════════════════════════════════════════════════════════════════════════ */
(function initLoader() {
  const loader   = $('#loader');
  const bar      = $('#loader-bar');
  const label    = $('#loader-label');
  const canvas   = $('#loader-canvas');
  const ctx      = canvas.getContext('2d');
  const labels   = ['Initializing', 'Loading assets', 'Building systems', 'Almost there'];

  canvas.width  = window.innerWidth;
  canvas.height = window.innerHeight;

  /* Animated loader particles */
  const pts = Array.from({length: 60}, () => ({
    x: rand(0, canvas.width),
    y: rand(0, canvas.height),
    vx: rand(-0.3, 0.3),
    vy: rand(-0.3, 0.3),
    r: rand(1, 3),
    a: rand(0.1, 0.5),
  }));

  let loaderFrame;
  function drawLoader() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    pts.forEach(p => {
      p.x += p.vx; p.y += p.vy;
      if (p.x < 0 || p.x > canvas.width)  p.vx *= -1;
      if (p.y < 0 || p.y > canvas.height) p.vy *= -1;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r, 0, PI2);
      ctx.fillStyle = `rgba(59,130,246,${p.a})`;
      ctx.fill();
    });
    loaderFrame = requestAnimationFrame(drawLoader);
  }
  drawLoader();

  /* Progress */
  let progress = 0;
  const tick = setInterval(() => {
    progress += rand(4, 14);
    if (progress > 100) progress = 100;
    bar.style.width = progress + '%';
    label.textContent = labels[Math.min(Math.floor(progress / 27), labels.length - 1)];
    if (progress >= 100) clearInterval(tick);
  }, 140);

  window.addEventListener('load', () => {
    clearInterval(tick);
    bar.style.width = '100%';
    setTimeout(() => {
      cancelAnimationFrame(loaderFrame);
      loader.classList.add('out');
      document.body.classList.remove('loading');
      initHeroCanvas();
      runHeroReveal();
    }, 600);
  });

  document.body.classList.add('loading');
})();

/* ══════════════════════════════════════════════════════════════════════════════
   2. HERO CANVAS — PARTICLE SPHERE + MOUSE INTERACTION
   ══════════════════════════════════════════════════════════════════════════════ */
function initHeroCanvas() {
  const canvas = $('#hero-canvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  let W, H, animId;
  const mouse = { x: -9999, y: -9999 };

  function resize() {
    W = canvas.width  = canvas.offsetWidth;
    H = canvas.height = canvas.offsetHeight;
  }
  resize();
  window.addEventListener('resize', resize);

  window.addEventListener('mousemove', e => {
    mouse.x = e.clientX;
    mouse.y = e.clientY;
  });

  /* Particles */
  const PARTICLE_COUNT = window.innerWidth < 768 ? 60 : 130;
  const particles = [];

  class HeroParticle {
    constructor() { this.init(); }
    init() {
      this.x  = rand(0, W);
      this.y  = rand(0, H);
      this.vx = rand(-0.25, 0.25);
      this.vy = rand(-0.25, 0.25);
      this.r  = rand(0.8, 2.2);
      this.a  = rand(0.15, 0.55);
      this.color = [
        [59, 130, 246],
        [139, 92, 246],
        [6, 182, 212],
        [255, 255, 255],
      ][Math.floor(Math.random() * 4)];
    }
    update() {
      const dx = this.x - mouse.x;
      const dy = this.y - mouse.y;
      const d  = Math.sqrt(dx * dx + dy * dy);
      const R  = 140;
      if (d < R && d > 0) {
        const f = (R - d) / R * 1.2;
        this.vx += (dx / d) * f;
        this.vy += (dy / d) * f;
      }
      this.vx *= 0.975;
      this.vy *= 0.975;
      this.x  += this.vx;
      this.y  += this.vy;
      if (this.x < -10) this.x = W + 10;
      if (this.x > W + 10) this.x = -10;
      if (this.y < -10) this.y = H + 10;
      if (this.y > H + 10) this.y = -10;
    }
    draw() {
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.r, 0, PI2);
      ctx.fillStyle = `rgba(${this.color[0]},${this.color[1]},${this.color[2]},${this.a})`;
      ctx.fill();
    }
  }

  for (let i = 0; i < PARTICLE_COUNT; i++) particles.push(new HeroParticle());

  function connectParticles() {
    const D = 110;
    for (let i = 0; i < particles.length; i++) {
      for (let j = i + 1; j < particles.length; j++) {
        const dx = particles[i].x - particles[j].x;
        const dy = particles[i].y - particles[j].y;
        const d  = Math.sqrt(dx * dx + dy * dy);
        if (d < D) {
          const a = 0.07 * (1 - d / D);
          ctx.beginPath();
          ctx.strokeStyle = `rgba(59,130,246,${a})`;
          ctx.lineWidth = 0.5;
          ctx.moveTo(particles[i].x, particles[i].y);
          ctx.lineTo(particles[j].x, particles[j].y);
          ctx.stroke();
        }
      }
    }
  }

  /* Central glow sphere */
  let glowAlpha = 0, glowGrow = true;
  function drawGlow() {
    if (glowGrow) { glowAlpha += 0.004; if (glowAlpha >= 0.25) glowGrow = false; }
    else          { glowAlpha -= 0.002; if (glowAlpha <= 0.12) glowGrow = true; }
    const cx = W * 0.68, cy = H * 0.5;
    const grad = ctx.createRadialGradient(cx, cy, 0, cx, cy, W * 0.28);
    grad.addColorStop(0, `rgba(59,130,246,${glowAlpha})`);
    grad.addColorStop(0.5, `rgba(139,92,246,${glowAlpha * 0.4})`);
    grad.addColorStop(1, 'transparent');
    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.arc(cx, cy, W * 0.28, 0, PI2);
    ctx.fill();
  }

  function loop() {
    ctx.clearRect(0, 0, W, H);
    drawGlow();
    connectParticles();
    particles.forEach(p => { p.update(); p.draw(); });
    animId = requestAnimationFrame(loop);
  }
  loop();
}

/* ══════════════════════════════════════════════════════════════════════════════
   3. HERO REVEAL ANIMATION (GSAP)
   ══════════════════════════════════════════════════════════════════════════════ */
function runHeroReveal() {
  if (!window.gsap) return;

  gsap.to('.hero-eyebrow', { opacity: 1, y: 0, duration: .9, ease: 'power3.out', delay: .1 });
  $$('.name-line').forEach((el, i) => {
    gsap.to(el, { opacity: 1, y: 0, duration: 1, ease: 'power4.out', delay: .25 + i * .15 });
  });
  gsap.to('.hero-role',    { opacity: 1, y: 0, duration: .9, ease: 'power3.out', delay: .6 });
  gsap.to('.hero-tagline', { opacity: 1, y: 0, duration: .9, ease: 'power3.out', delay: .75 });
  gsap.to('.hero-actions', { opacity: 1, y: 0, duration: .9, ease: 'power3.out', delay: .9 });
  gsap.to('.hero-stats',   { opacity: 1, y: 0, duration: .9, ease: 'power3.out', delay: 1.05 });

  /* typewriter starts after reveal */
  setTimeout(initTypewriter, 900);
  /* stat counters */
  setTimeout(() => animateCounters('.hero-stats .stat-num'), 1200);
}

/* ══════════════════════════════════════════════════════════════════════════════
   4. TYPEWRITER
   ══════════════════════════════════════════════════════════════════════════════ */
function initTypewriter() {
  const el = $('#hero-typewriter');
  if (!el) return;
  const words = [
    'scalable systems.',
    'microservices.',
    'AI-powered apps.',
    'backend architecture.',
    'real-time platforms.',
    'things that ship.',
  ];
  let wi = 0, ci = 0, deleting = false;

  function tick() {
    const word = words[wi];
    if (deleting) {
      el.textContent = word.slice(0, --ci);
      if (ci === 0) { deleting = false; wi = (wi + 1) % words.length; }
      setTimeout(tick, 40);
    } else {
      el.textContent = word.slice(0, ++ci);
      if (ci === word.length) { deleting = true; setTimeout(tick, 2400); }
      else setTimeout(tick, 72);
    }
  }
  tick();
}

/* ══════════════════════════════════════════════════════════════════════════════
   5. CUSTOM CURSOR
   ══════════════════════════════════════════════════════════════════════════════ */
(function initCursor() {
  const dot  = $('#cursor-dot');
  const ring = $('#cursor-ring');
  if (!dot || window.innerWidth < 768) return;

  let mx = 0, my = 0, rx = 0, ry = 0;

  window.addEventListener('mousemove', e => { mx = e.clientX; my = e.clientY; });

  function loop() {
    dot.style.left  = mx + 'px';
    dot.style.top   = my + 'px';
    rx = lerp(rx, mx, 0.14);
    ry = lerp(ry, my, 0.14);
    ring.style.left = rx + 'px';
    ring.style.top  = ry + 'px';
    requestAnimationFrame(loop);
  }
  loop();

  /* Magnetic buttons */
  $$('.mag-btn').forEach(btn => {
    btn.addEventListener('mousemove', e => {
      const r = btn.getBoundingClientRect();
      const x = e.clientX - r.left - r.width  / 2;
      const y = e.clientY - r.top  - r.height / 2;
      btn.style.transform = `translate(${x * .18}px, ${y * .18}px)`;
    });
    btn.addEventListener('mouseleave', () => {
      btn.style.transform = '';
    });
  });
})();

/* ══════════════════════════════════════════════════════════════════════════════
   6. SCROLL PROGRESS + NAV SCROLLED
   ══════════════════════════════════════════════════════════════════════════════ */
(function initScrollMeta() {
  const bar = $('#scroll-progress');
  const nav = $('#nav');

  function onScroll() {
    const st = window.scrollY;
    const dh = document.documentElement.scrollHeight - window.innerHeight;
    if (bar) bar.style.width = (st / dh * 100) + '%';
    if (nav) nav.classList.toggle('scrolled', st > 60);
    updateActiveNav(st);
  }

  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();
})();

/* Active nav link */
function updateActiveNav(scrollY) {
  const sections = $$('section[id], footer[id]');
  let current = '';
  sections.forEach(s => {
    if (scrollY >= s.offsetTop - 120) current = s.id;
  });
  $$('.nav-link').forEach(a => {
    a.classList.toggle('active', a.getAttribute('href') === '#' + current);
  });
}

/* ══════════════════════════════════════════════════════════════════════════════
   7. MOBILE NAV
   ══════════════════════════════════════════════════════════════════════════════ */
(function initMobileNav() {
  const btn     = $('#hamburger');
  const mobileNav = $('#mobile-nav');
  if (!btn) return;

  btn.addEventListener('click', () => {
    btn.classList.toggle('open');
    mobileNav.classList.toggle('open');
  });

  $$('#mobile-nav a').forEach(a => {
    a.addEventListener('click', () => {
      btn.classList.remove('open');
      mobileNav.classList.remove('open');
    });
  });
})();

/* ══════════════════════════════════════════════════════════════════════════════
   8. SCROLL REVEAL (Intersection Observer)
   ══════════════════════════════════════════════════════════════════════════════ */
(function initReveal() {
  function doReveal(el, extraDelay) {
    el.style.transitionDelay = extraDelay + 'ms';
    el.classList.add('revealed');
    /* counters */
    const section = el.closest('section') || document;
    $$('.count-num', section).forEach(c => {
      if (!c.dataset.counted) animateSingleCounter(c);
    });
    /* timeline track */
    const track = el.closest('.timeline')?.querySelector('.tl-track');
    if (track) track.classList.add('filled');
  }

  const io = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      io.unobserve(entry.target);
      const el = entry.target;
      /* calculate stagger based on sibling index */
      const siblings = $$('[data-reveal]', el.parentElement || document);
      const idx = siblings.indexOf(el);
      doReveal(el, Math.max(0, idx) * 90);
    });
  }, { threshold: 0.05, rootMargin: '0px 0px 0px 0px' });

  /* Wait for loader to finish, then observe everything */
  function startObserving() {
    $$('[data-reveal]').forEach(el => {
      const rect = el.getBoundingClientRect();
      if (rect.top < window.innerHeight + 50) {
        /* already in view or above — reveal immediately with tiny stagger */
        const siblings = $$('[data-reveal]', el.parentElement || document);
        doReveal(el, siblings.indexOf(el) * 80);
      } else {
        io.observe(el);
      }
    });
  }

  /* If loader is done, start now; otherwise wait */
  if (!document.body.classList.contains('loading')) {
    setTimeout(startObserving, 200);
  } else {
    window.addEventListener('load', () => setTimeout(startObserving, 800));
  }
  /* Also re-trigger on scroll for anything missed */
  window.addEventListener('scroll', () => {
    $$('[data-reveal]:not(.revealed)').forEach(el => {
      const rect = el.getBoundingClientRect();
      if (rect.top < window.innerHeight - 20) {
        io.unobserve(el);
        doReveal(el, 0);
      }
    });
  }, { passive: true });
})();

/* ══════════════════════════════════════════════════════════════════════════════
   9. COUNTER ANIMATIONS
   ══════════════════════════════════════════════════════════════════════════════ */
function animateSingleCounter(el) {
  if (el.dataset.counted) return;
  el.dataset.counted = '1';
  const target = parseInt(el.dataset.count || el.dataset.target || 0);
  const dur = 1800;
  const start = performance.now();
  function step(now) {
    const p = clamp((now - start) / dur, 0, 1);
    const eased = 1 - Math.pow(1 - p, 3);
    el.textContent = Math.floor(eased * target).toLocaleString();
    if (p < 1) requestAnimationFrame(step);
    else el.textContent = target.toLocaleString();
  }
  requestAnimationFrame(step);
}

function animateCounters(sel = '[data-count]') {
  $$(sel).forEach(animateSingleCounter);
}

/* ══════════════════════════════════════════════════════════════════════════════
   10. SKILLS GALAXY
   ══════════════════════════════════════════════════════════════════════════════ */
(function initSkillsGalaxy() {
  const wrap = $('#skills-galaxy');
  if (!wrap) return;

  const skills = [
    /* Languages */
    { name: 'Java',       icon: '☕', cat: 'Languages', color: '#3b82f6', size: 80 },
    { name: 'JavaScript', icon: 'JS', cat: 'Languages', color: '#3b82f6', size: 68 },
    { name: 'Python',     icon: '🐍', cat: 'Languages', color: '#3b82f6', size: 70 },
    { name: 'SQL',        icon: '📊', cat: 'Languages', color: '#3b82f6', size: 58 },
    { name: 'C++',        icon: '⚙', cat: 'Languages', color: '#3b82f6', size: 56 },
    /* Backend */
    { name: 'Spring Boot',icon: '🍃', cat: 'Backend',   color: '#8b5cf6', size: 86 },
    { name: 'Spring Sec', icon: '🔐', cat: 'Backend',   color: '#8b5cf6', size: 64 },
    { name: 'FastAPI',    icon: '⚡', cat: 'Backend',   color: '#8b5cf6', size: 66 },
    { name: 'Node.js',    icon: '🟢', cat: 'Backend',   color: '#8b5cf6', size: 68 },
    { name: 'Kafka',      icon: '📨', cat: 'Backend',   color: '#8b5cf6', size: 72 },
    { name: 'WebSocket',  icon: '🔌', cat: 'Backend',   color: '#8b5cf6', size: 62 },
    /* Frontend */
    { name: 'React.js',   icon: '⚛', cat: 'Frontend',  color: '#06b6d4', size: 80 },
    { name: 'Tailwind',   icon: '🎨', cat: 'Frontend',  color: '#06b6d4', size: 62 },
    { name: 'Zustand',    icon: '🧠', cat: 'Frontend',  color: '#06b6d4', size: 58 },
    /* Database */
    { name: 'MySQL',      icon: '🗄', cat: 'Database',  color: '#10b981', size: 70 },
    { name: 'PostgreSQL', icon: '🐘', cat: 'Database',  color: '#10b981', size: 68 },
    { name: 'MongoDB',    icon: '🍃', cat: 'Database',  color: '#10b981', size: 66 },
    /* DevOps */
    { name: 'Docker',     icon: '🐳', cat: 'DevOps',    color: '#f59e0b', size: 70 },
    { name: 'Git',        icon: '🔀', cat: 'DevOps',    color: '#f59e0b', size: 64 },
    { name: 'CI/CD',      icon: '🔄', cat: 'DevOps',    color: '#f59e0b', size: 60 },
    { name: 'Vercel',     icon: '▲',  cat: 'DevOps',    color: '#f59e0b', size: 60 },
    /* AI */
    { name: 'Gemini API', icon: '🤖', cat: 'AI / ML',   color: '#ec4899', size: 74 },
    { name: 'LangChain',  icon: '🔗', cat: 'AI / ML',   color: '#ec4899', size: 64 },
    { name: 'RAG',        icon: '📚', cat: 'AI / ML',   color: '#ec4899', size: 60 },
  ];

  /* Build SVG connections layer */
  const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  svg.classList.add('galaxy-svg');
  wrap.appendChild(svg);

  const connDefs = [
    ['Java', 'Spring Boot'],
    ['Spring Boot', 'Spring Sec'],
    ['Spring Boot', 'Kafka'],
    ['Spring Boot', 'WebSocket'],
    ['Spring Boot', 'MySQL'],
    ['React.js', 'Zustand'],
    ['React.js', 'Tailwind'],
    ['Node.js', 'MongoDB'],
    ['Python', 'FastAPI'],
    ['FastAPI', 'Gemini API'],
    ['Gemini API', 'RAG'],
    ['RAG', 'LangChain'],
    ['Docker', 'CI/CD'],
    ['MySQL', 'PostgreSQL'],
    ['JavaScript', 'React.js'],
    ['Java', 'C++'],
  ];

  /* Position orbs on concentric rings */
  const orbs = [];
  const cx = 0.5, cy = 0.5; // fractional center
  const rings = [
    { count: 1,  r: 0,    start: 0 },
    { count: 6,  r: 0.18, start: 0 },
    { count: 10, r: 0.31, start: 0.3 },
    { count: 8,  r: 0.42, start: 0.6 },
  ];
  let si = 0;
  rings.forEach(ring => {
    for (let i = 0; i < ring.count && si < skills.length; i++, si++) {
      const angle = ring.count === 1 ? 0 : (PI2 / ring.count) * i + ring.start;
      skills[si]._fx = cx + ring.r * Math.cos(angle);
      skills[si]._fy = cy + ring.r * Math.sin(angle);
    }
  });

  function buildOrbs() {
    const ww = wrap.offsetWidth  || 900;
    const wh = wrap.offsetHeight || 460;

    /* clear old orbs */
    $$('.skill-orb', wrap).forEach(e => e.remove());
    $$('line', svg).forEach(e => e.remove());
    orbs.length = 0;

    skills.forEach(skill => {
      const el = document.createElement('div');
      el.className = 'skill-orb';
      el.style.cssText = `
        width:${skill.size}px;height:${skill.size}px;
        --orb-color:${skill.color};
        --orb-glow:${skill.color}55;
        left:${skill._fx * ww - skill.size / 2}px;
        top:${skill._fy * wh - skill.size / 2}px;
      `;
      el.innerHTML = `
        <span class="skill-orb-icon">${skill.icon}</span>
        <span class="skill-orb-name">${skill.name}</span>
        <span class="skill-orb-cat">${skill.cat}</span>
      `;
      wrap.appendChild(el);
      orbs.push({ el, skill });
    });

    /* Draw connections */
    connDefs.forEach(([a, b]) => {
      const oa = orbs.find(o => o.skill.name === a);
      const ob = orbs.find(o => o.skill.name === b);
      if (!oa || !ob) return;
      const ax = oa.skill._fx * ww, ay = oa.skill._fy * wh;
      const bx = ob.skill._fx * ww, by = ob.skill._fy * wh;
      const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
      line.setAttribute('x1', ax); line.setAttribute('y1', ay);
      line.setAttribute('x2', bx); line.setAttribute('y2', by);
      line.setAttribute('stroke', 'rgba(59,130,246,0.12)');
      line.setAttribute('stroke-width', '1');
      svg.appendChild(line);
    });
  }

  buildOrbs();
  let resizeTimer;
  window.addEventListener('resize', () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(buildOrbs, 200);
  });

  /* Floating idle animation */
  orbs.forEach && requestAnimationFrame(function float() {
    orbs.forEach(({ el, skill }, idx) => {
      const t = Date.now() / 1000;
      const dy = Math.sin(t * 0.6 + idx * 1.1) * 4;
      const dx = Math.cos(t * 0.45 + idx * 0.9) * 2;
      const ww = wrap.offsetWidth  || 900;
      const wh = wrap.offsetHeight || 460;
      el.style.left = (skill._fx * ww - skill.size / 2 + dx) + 'px';
      el.style.top  = (skill._fy * wh - skill.size / 2 + dy) + 'px';
    });
    requestAnimationFrame(float);
  });
})();

/* ══════════════════════════════════════════════════════════════════════════════
   11. CONTACT FORM
   ══════════════════════════════════════════════════════════════════════════════ */
(function initContactForm() {
  const form    = $('#contact-form');
  if (!form) return;
  const submit  = $('#cf-submit');
  const submitTxt = $('#cf-submit-text');
  const success = $('#term-success');

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const name    = $('#cf-name').value.trim();
    const email   = $('#cf-email').value.trim();
    const message = $('#cf-message').value.trim();
    if (!name || !email || !message) return;

    submit.disabled = true;
    submitTxt.textContent = 'Transmitting…';

    /* Fake async delay then open mailto */
    await new Promise(r => setTimeout(r, 1200));

    const subject = `Portfolio Contact from ${name}`;
    const body = `Name: ${name}\nEmail: ${email}\n\n${message}`;
    window.open(`mailto:sourabhramteke1311@gmail.com?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`);

    form.style.display = 'none';
    success.style.display = 'block';
  });
})();

/* ══════════════════════════════════════════════════════════════════════════════
   12. COMMAND PALETTE
   ══════════════════════════════════════════════════════════════════════════════ */
(function initCommandPalette() {
  const overlay = $('#cmd-overlay');
  const input   = $('#cmd-input');
  const results = $('#cmd-results');
  const trigger = $('#cmd-trigger');
  if (!overlay) return;

  const commands = [
    { label: 'Go to About',        icon: '👤', action: () => scroll('#about'),       cat: 'Navigate' },
    { label: 'Go to Skills',       icon: '⚡', action: () => scroll('#skills'),      cat: 'Navigate' },
    { label: 'Go to Projects',     icon: '🚀', action: () => scroll('#projects'),    cat: 'Navigate' },
    { label: 'Go to Experience',   icon: '💼', action: () => scroll('#experience'),  cat: 'Navigate' },
    { label: 'Go to Achievements', icon: '🏆', action: () => scroll('#achievements'),cat: 'Navigate' },
    { label: 'Go to Contact',      icon: '✉',  action: () => scroll('#contact'),     cat: 'Navigate' },
    { label: 'Download Resume',    icon: '📄', action: () => window.open('asset/sourabh_resume.pdf'), cat: 'Action' },
    { label: 'View Internship Letter', icon: '📋', action: () => window.open('asset/Sourabh Ramteke (1).pdf'), cat: 'Action' },
    { label: 'Open GitHub',        icon: '🐙', action: () => window.open('https://github.com/maa101-hub'), cat: 'Links' },
    { label: 'SkyWays Project',    icon: '✈', action: () => window.open('https://github.com/maa101-hub/SkyWaysAirline_Project'), cat: 'Projects' },
    { label: 'Campus Connect',     icon: '🌐', action: () => window.open('https://campus-connect-seven-blush.vercel.app'), cat: 'Projects' },
    { label: 'AI Interview Coach', icon: '🤖', action: () => window.open('https://github.com/maa101-hub/AI-Resume-Interview-Coach'), cat: 'Projects' },
    { label: 'Open LinkedIn',      icon: '💼', action: () => window.open('https://linkedin.com/in/sourabh_ramteke'), cat: 'Links' },
    { label: 'Open LeetCode',      icon: '💡', action: () => window.open('https://leetcode.com/sourabh_101'), cat: 'Links' },
    { label: 'Send Email',         icon: '📧', action: () => window.open('mailto:sourabhramteke1311@gmail.com'), cat: 'Action' },
  ];

  function scroll(sel) {
    $(sel)?.scrollIntoView({ behavior: 'smooth' });
    close();
  }

  function open() {
    overlay.classList.add('open');
    input.value = '';
    input.focus();
    renderResults('');
  }

  function close() {
    overlay.classList.remove('open');
  }

  function renderResults(q) {
    const filtered = q
      ? commands.filter(c => c.label.toLowerCase().includes(q.toLowerCase()))
      : commands;
    results.innerHTML = filtered.map((c, i) => `
      <li data-idx="${i}">
        <span>${c.icon}</span>
        <span>${c.label}</span>
        <span class="cmd-cat">${c.cat}</span>
      </li>
    `).join('');
    $$('#cmd-results li').forEach((li, i) => {
      li.addEventListener('click', () => {
        filtered[i].action();
        close();
      });
    });
  }

  trigger?.addEventListener('click', open);
  overlay.addEventListener('click', e => { if (e.target === overlay) close(); });

  window.addEventListener('keydown', e => {
    if ((e.metaKey || e.ctrlKey) && e.key === 'k') { e.preventDefault(); open(); }
    if (e.key === 'Escape') close();
  });

  input.addEventListener('input', e => renderResults(e.target.value));
})();

/* ══════════════════════════════════════════════════════════════════════════════
   13. BACK TO TOP
   ══════════════════════════════════════════════════════════════════════════════ */
$('#back-top')?.addEventListener('click', () => {
  window.scrollTo({ top: 0, behavior: 'smooth' });
});

/* ══════════════════════════════════════════════════════════════════════════════
   14. GSAP SCROLL TRIGGER ANIMATIONS (if GSAP loaded)
   ══════════════════════════════════════════════════════════════════════════════ */
document.addEventListener('DOMContentLoaded', () => {
  if (!window.gsap || !window.ScrollTrigger) return;
  gsap.registerPlugin(ScrollTrigger);

  /* Parallax on hero canvas */
  gsap.to('#hero-canvas', {
    scrollTrigger: {
      trigger: '#hero',
      start: 'top top',
      end: 'bottom top',
      scrub: true,
    },
    y: 100, opacity: 0.3,
  });
});

/* ══════════════════════════════════════════════════════════════════════════════
   15. FORCE REVEAL PASS — runs on every scroll and on load
       Ensures nothing stays hidden if the observer missed it
   ══════════════════════════════════════════════════════════════════════════════ */
function forceRevealPass() {
  $$('[data-reveal]:not(.revealed)').forEach(el => {
    const rect = el.getBoundingClientRect();
    if (rect.top < window.innerHeight + 100) {
      el.style.transitionDelay = '0ms';
      el.classList.add('revealed');
    }
  });
}

window.addEventListener('scroll', forceRevealPass, { passive: true });
/* Also run after load and after a short delay as belt-and-suspenders */
window.addEventListener('load', () => {
  setTimeout(forceRevealPass, 900);
  setTimeout(forceRevealPass, 1500);
  setTimeout(forceRevealPass, 2500);
});

console.log('%c SR Portfolio v2.0 ', 'background:#3b82f6;color:#fff;font-size:14px;padding:4px 12px;border-radius:4px;font-family:monospace;');
console.log('%c Built with obsession. ', 'color:#8b5cf6;font-family:monospace');
