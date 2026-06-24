// ===== PRELOADER =====
const preloader = document.getElementById('preloader');
const preloaderBar = document.getElementById('preloaderBar');
let loadProgress = 0;

const preloaderInterval = setInterval(() => {
    loadProgress += Math.random() * 15 + 5;
    if (loadProgress >= 100) {
        loadProgress = 100;
        preloaderBar.style.width = '100%';
        clearInterval(preloaderInterval);
    } else {
        preloaderBar.style.width = loadProgress + '%';
    }
}, 150);

window.addEventListener('load', () => {
    clearInterval(preloaderInterval);
    preloaderBar.style.width = '100%';

    setTimeout(() => {
        preloader.classList.add('hidden');
        document.body.classList.add('loaded');
        revealHeroItems();
        animateCounters();
    }, 800);
});

// ===== PARTICLES BACKGROUND =====
const canvas = document.getElementById('particles');
const ctx = canvas.getContext('2d');
let particles = [];
let mouse = { x: -1000, y: -1000 };

function resizeCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
}

resizeCanvas();
window.addEventListener('resize', resizeCanvas);

class Particle {
    constructor() {
        this.reset();
    }

    reset() {
        this.x = Math.random() * canvas.width;
        this.y = Math.random() * canvas.height;
        this.size = Math.random() * 2 + 0.5;
        this.baseSpeedX = (Math.random() - 0.5) * 0.4;
        this.baseSpeedY = (Math.random() - 0.5) * 0.4;
        this.speedX = this.baseSpeedX;
        this.speedY = this.baseSpeedY;
        this.opacity = Math.random() * 0.5 + 0.15;
        // Random color from palette
        const colors = [
            [124, 106, 255],  // purple
            [244, 114, 182],  // pink
            [34, 211, 238],   // cyan
        ];
        this.color = colors[Math.floor(Math.random() * colors.length)];
    }

    update() {
        // Mouse repulsion
        const dx = this.x - mouse.x;
        const dy = this.y - mouse.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        const repelRadius = 120;

        if (dist < repelRadius && dist > 0) {
            const force = (repelRadius - dist) / repelRadius;
            const angle = Math.atan2(dy, dx);
            this.speedX += Math.cos(angle) * force * 1.5;
            this.speedY += Math.sin(angle) * force * 1.5;
        }

        // Damping back to base speed
        this.speedX += (this.baseSpeedX - this.speedX) * 0.03;
        this.speedY += (this.baseSpeedY - this.speedY) * 0.03;

        this.x += this.speedX;
        this.y += this.speedY;

        if (this.x < 0 || this.x > canvas.width) this.speedX *= -1;
        if (this.y < 0 || this.y > canvas.height) this.speedY *= -1;

        // Keep in bounds
        this.x = Math.max(0, Math.min(canvas.width, this.x));
        this.y = Math.max(0, Math.min(canvas.height, this.y));
    }

    draw() {
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(${this.color[0]}, ${this.color[1]}, ${this.color[2]}, ${this.opacity})`;
        ctx.fill();
    }
}

function initParticles() {
    particles = [];
    const count = Math.min(90, Math.floor(window.innerWidth / 14));
    for (let i = 0; i < count; i++) {
        particles.push(new Particle());
    }
}

function connectParticles() {
    for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
            const dx = particles[i].x - particles[j].x;
            const dy = particles[i].y - particles[j].y;
            const dist = Math.sqrt(dx * dx + dy * dy);

            if (dist < 130) {
                const opacity = 0.08 * (1 - dist / 130);
                // Mix colors
                const r = Math.round((particles[i].color[0] + particles[j].color[0]) / 2);
                const g = Math.round((particles[i].color[1] + particles[j].color[1]) / 2);
                const b = Math.round((particles[i].color[2] + particles[j].color[2]) / 2);
                ctx.beginPath();
                ctx.strokeStyle = `rgba(${r}, ${g}, ${b}, ${opacity})`;
                ctx.lineWidth = 0.6;
                ctx.moveTo(particles[i].x, particles[i].y);
                ctx.lineTo(particles[j].x, particles[j].y);
                ctx.stroke();
            }
        }
    }
}

function animateParticles() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    particles.forEach(p => {
        p.update();
        p.draw();
    });
    connectParticles();
    requestAnimationFrame(animateParticles);
}

initParticles();
animateParticles();

// ===== CUSTOM CURSOR =====
const cursorDot = document.querySelector('.cursor-dot');
const cursorOutline = document.querySelector('.cursor-outline');

if (window.innerWidth > 768) {
    let cursorX = 0, cursorY = 0;
    let outlineX = 0, outlineY = 0;

    window.addEventListener('mousemove', (e) => {
        cursorX = e.clientX;
        cursorY = e.clientY;
        mouse.x = e.clientX;
        mouse.y = e.clientY;

        cursorDot.style.left = cursorX - 4 + 'px';
        cursorDot.style.top = cursorY - 4 + 'px';
    });

    // Smooth outline following
    function animateCursor() {
        outlineX += (cursorX - outlineX) * 0.12;
        outlineY += (cursorY - outlineY) * 0.12;
        cursorOutline.style.left = outlineX - 20 + 'px';
        cursorOutline.style.top = outlineY - 20 + 'px';
        requestAnimationFrame(animateCursor);
    }
    animateCursor();

    // Cursor hover states
    document.querySelectorAll('a, button, .skill-tag, .magnetic-btn, .tilt-card').forEach(el => {
        el.addEventListener('mouseenter', () => {
            cursorDot.classList.add('hovering');
            cursorOutline.classList.add('hovering');
        });
        el.addEventListener('mouseleave', () => {
            cursorDot.classList.remove('hovering');
            cursorOutline.classList.remove('hovering');
        });
    });
}

// ===== TYPEWRITER EFFECT =====
const typewriterEl = document.getElementById('typewriter');
const roles = [
    'Full-Stack Java Developer',
    'Spring Boot Engineer',
    'React.js Developer',
    'DSA Problem Solver',
    'Software Engineer',
    'Microservices Architect'
];

let roleIndex = 0;
let charIndex = 0;
let isDeleting = false;
let typeSpeed = 80;

function typeWriter() {
    const currentRole = roles[roleIndex];

    if (isDeleting) {
        typewriterEl.textContent = currentRole.substring(0, charIndex - 1);
        charIndex--;
        typeSpeed = 35;
    } else {
        typewriterEl.textContent = currentRole.substring(0, charIndex + 1);
        charIndex++;
        typeSpeed = 70;
    }

    if (!isDeleting && charIndex === currentRole.length) {
        typeSpeed = 2500;
        isDeleting = true;
    } else if (isDeleting && charIndex === 0) {
        isDeleting = false;
        roleIndex = (roleIndex + 1) % roles.length;
        typeSpeed = 500;
    }

    setTimeout(typeWriter, typeSpeed);
}

typeWriter();

// ===== HERO STAGGERED REVEAL =====
function revealHeroItems() {
    const items = document.querySelectorAll('.reveal-item');
    items.forEach((item, index) => {
        const delay = parseInt(item.dataset.delay || index) * 150;
        setTimeout(() => {
            item.classList.add('visible');
        }, delay + 200);
    });
}

// ===== NAVBAR SCROLL =====
const navbar = document.getElementById('navbar');
const backToTop = document.getElementById('backToTop');
const scrollProgress = document.getElementById('scrollProgress');

window.addEventListener('scroll', () => {
    const scrollY = window.scrollY;

    // Navbar
    if (scrollY > 50) {
        navbar.classList.add('scrolled');
    } else {
        navbar.classList.remove('scrolled');
    }

    // Back to top
    if (scrollY > 500) {
        backToTop.classList.add('visible');
    } else {
        backToTop.classList.remove('visible');
    }

    // Scroll progress bar
    const docHeight = document.documentElement.scrollHeight - window.innerHeight;
    const progress = (scrollY / docHeight) * 100;
    scrollProgress.style.width = progress + '%';

    // Active nav
    updateActiveNav();

    // Timeline line animation
    animateTimelineLine();

    // Parallax orbs
    parallaxOrbs(scrollY);
});

backToTop.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
});

// ===== ACTIVE NAV LINK =====
function updateActiveNav() {
    const sections = document.querySelectorAll('.section, .hero');
    const navLinksAll = document.querySelectorAll('.nav-link');

    let current = '';
    sections.forEach(section => {
        const sectionTop = section.offsetTop - 150;
        if (window.scrollY >= sectionTop) {
            current = section.getAttribute('id');
        }
    });

    navLinksAll.forEach(link => {
        link.classList.remove('active');
        if (link.getAttribute('href') === `#${current}`) {
            link.classList.add('active');
        }
    });
}

// ===== MOBILE MENU =====
const hamburger = document.getElementById('hamburger');
const navLinks = document.getElementById('navLinks');

hamburger.addEventListener('click', () => {
    navLinks.classList.toggle('active');
    hamburger.classList.toggle('active');
});

document.querySelectorAll('.nav-link').forEach(link => {
    link.addEventListener('click', () => {
        navLinks.classList.remove('active');
        hamburger.classList.remove('active');
    });
});

// ===== THEME TOGGLE =====
const themeToggle = document.getElementById('themeToggle');
const html = document.documentElement;

themeToggle.addEventListener('click', () => {
    const currentTheme = html.getAttribute('data-theme');
    const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
    html.setAttribute('data-theme', newTheme);

    const icon = themeToggle.querySelector('i');
    icon.className = newTheme === 'dark' ? 'fas fa-moon' : 'fas fa-sun';

    localStorage.setItem('theme', newTheme);
});

// Load saved theme
const savedTheme = localStorage.getItem('theme');
if (savedTheme) {
    html.setAttribute('data-theme', savedTheme);
    const icon = themeToggle.querySelector('i');
    icon.className = savedTheme === 'dark' ? 'fas fa-moon' : 'fas fa-sun';
}

// ===== COUNTER ANIMATION =====
let countersAnimated = false;

function animateCounters() {
    if (countersAnimated) return;
    countersAnimated = true;

    const counters = document.querySelectorAll('[data-target]');

    counters.forEach(counter => {
        const target = parseInt(counter.getAttribute('data-target'));
        const duration = 2000;
        const startTime = performance.now();

        const updateCounter = (currentTime) => {
            const elapsed = currentTime - startTime;
            const progress = Math.min(elapsed / duration, 1);

            // Ease out cubic
            const eased = 1 - Math.pow(1 - progress, 3);
            const current = Math.floor(eased * target);

            counter.textContent = current;

            if (progress < 1) {
                requestAnimationFrame(updateCounter);
            } else {
                counter.textContent = target;
            }
        };

        requestAnimationFrame(updateCounter);
    });
}

// ===== SCROLL ANIMATIONS (Intersection Observer) =====
const observerOptions = {
    threshold: 0.15,
    rootMargin: '0px 0px -60px 0px'
};

const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            // Add stagger delay for grid children
            const parent = entry.target.parentElement;
            if (parent) {
                const siblings = Array.from(parent.children).filter(
                    el => el.classList.contains('reveal-up') ||
                          el.classList.contains('reveal-left') ||
                          el.classList.contains('reveal-right') ||
                          el.classList.contains('reveal-scale')
                );
                const index = siblings.indexOf(entry.target);
                if (index > 0) {
                    entry.target.style.transitionDelay = (index * 0.1) + 's';
                }
            }

            entry.target.classList.add('visible');

            // Trigger counters when achievements visible
            if (entry.target.closest('.achievements')) {
                animateCounters();
            }
        }
    });
}, observerOptions);

// Observe all reveal elements
document.querySelectorAll('.reveal-up, .reveal-left, .reveal-right, .reveal-scale').forEach(el => {
    observer.observe(el);
});

// Observe hero and achievements for counters
const achievementsSection = document.querySelector('.achievements');
if (achievementsSection) observer.observe(achievementsSection);

// ===== 3D TILT EFFECT =====
function initTiltCards() {
    if (window.innerWidth <= 768) return;

    const tiltCards = document.querySelectorAll('.tilt-card');

    tiltCards.forEach(card => {
        card.addEventListener('mousemove', (e) => {
            const rect = card.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            const centerX = rect.width / 2;
            const centerY = rect.height / 2;

            const rotateX = ((y - centerY) / centerY) * -8;
            const rotateY = ((x - centerX) / centerX) * 8;

            card.style.transform = `perspective(800px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale3d(1.02, 1.02, 1.02)`;
        });

        card.addEventListener('mouseleave', () => {
            card.style.transform = 'perspective(800px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)';
        });
    });
}

initTiltCards();

// ===== MAGNETIC BUTTONS =====
function initMagneticButtons() {
    if (window.innerWidth <= 768) return;

    const magneticBtns = document.querySelectorAll('.magnetic-btn');

    magneticBtns.forEach(btn => {
        btn.addEventListener('mousemove', (e) => {
            const rect = btn.getBoundingClientRect();
            const x = e.clientX - rect.left - rect.width / 2;
            const y = e.clientY - rect.top - rect.height / 2;

            btn.style.transform = `translate(${x * 0.2}px, ${y * 0.2}px)`;
        });

        btn.addEventListener('mouseleave', () => {
            btn.style.transform = 'translate(0, 0)';
        });
    });
}

initMagneticButtons();

// ===== BUTTON RIPPLE EFFECT =====
document.querySelectorAll('.btn-primary').forEach(btn => {
    btn.addEventListener('click', function(e) {
        const ripple = this.querySelector('.btn-ripple');
        if (!ripple) return;

        const rect = this.getBoundingClientRect();
        const size = Math.max(rect.width, rect.height);
        const x = e.clientX - rect.left - size / 2;
        const y = e.clientY - rect.top - size / 2;

        ripple.style.width = ripple.style.height = size + 'px';
        ripple.style.left = x + 'px';
        ripple.style.top = y + 'px';
        ripple.classList.remove('active');
        void ripple.offsetWidth; // Force reflow
        ripple.classList.add('active');

        setTimeout(() => ripple.classList.remove('active'), 600);
    });
});

// ===== TIMELINE LINE ANIMATION =====
function animateTimelineLine() {
    const timelineLine = document.getElementById('timelineLine');
    if (!timelineLine) return;

    const timeline = timelineLine.parentElement;
    const rect = timeline.getBoundingClientRect();
    const viewportHeight = window.innerHeight;

    if (rect.top < viewportHeight && rect.bottom > 0) {
        const visiblePortion = Math.min(
            viewportHeight - rect.top,
            rect.height
        );
        const percentage = Math.max(0, Math.min(1, visiblePortion / rect.height));
        timelineLine.style.height = (percentage * 100) + '%';
    }
}

// ===== PARALLAX BACKGROUND ORBS =====
function parallaxOrbs(scrollY) {
    const orbs = document.querySelectorAll('.bg-orbs .orb');
    const speeds = [0.02, -0.015, 0.025, -0.01];

    orbs.forEach((orb, i) => {
        const speed = speeds[i] || 0.02;
        orb.style.transform += ''; // Force recompute
        const translateY = scrollY * speed;
        orb.style.marginTop = translateY + 'px';
    });
}

// ===== CONTACT FORM =====
const contactForm = document.getElementById('contactForm');

contactForm.addEventListener('submit', (e) => {
    e.preventDefault();

    const name = document.getElementById('name').value;
    const email = document.getElementById('email').value;
    const subject = document.getElementById('subject').value;
    const message = document.getElementById('message').value;

    // Create mailto link
    const mailtoLink = `mailto:sourabhramteke1311@gmail.com?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(`From: ${name}\nEmail: ${email}\n\n${message}`)}`;
    window.open(mailtoLink);

    // Show success feedback
    const btn = contactForm.querySelector('button[type="submit"]');
    const originalHTML = btn.innerHTML;
    btn.innerHTML = '<i class="fas fa-check"></i> Message Sent!';
    btn.style.background = 'linear-gradient(135deg, #22c55e, #10b981)';

    setTimeout(() => {
        btn.innerHTML = originalHTML;
        btn.style.background = '';
        contactForm.reset();
    }, 3000);
});

// ===== SMOOTH SECTION REVEAL ON SCROLL =====
// Add parallax to hero image on scroll
window.addEventListener('scroll', () => {
    const heroImage = document.getElementById('heroImage');
    if (heroImage && window.innerWidth > 768) {
        const scrollY = window.scrollY;
        const speed = 0.15;
        heroImage.style.transform = `translateY(${scrollY * speed}px)`;
    }
});

// ===== HANDLE WINDOW RESIZE =====
let resizeTimeout;
window.addEventListener('resize', () => {
    clearTimeout(resizeTimeout);
    resizeTimeout = setTimeout(() => {
        initParticles();
        initTiltCards();
        initMagneticButtons();
    }, 300);
});
