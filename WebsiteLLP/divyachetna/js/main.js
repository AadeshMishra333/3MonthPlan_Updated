// ==========================================
// DIVYA CHETNA - MAIN JS
// ==========================================

// Page Loader
window.addEventListener('load', () => {
  const loader = document.querySelector('.page-loader');
  if (loader) {
    setTimeout(() => loader.classList.add('hidden'), 800);
    setTimeout(() => loader.remove(), 1400);
  }
});

// Navbar scroll effect
const navbar = document.getElementById('navbar');
if (navbar) {
  window.addEventListener('scroll', () => {
    navbar.classList.toggle('scrolled', window.scrollY > 60);
  });
}

// Hamburger menu
const hamburger = document.getElementById('hamburger');
const navLinks = document.getElementById('navLinks');
if (hamburger && navLinks) {
  hamburger.addEventListener('click', () => {
    navLinks.classList.toggle('open');
    hamburger.classList.toggle('active');
  });
}

// Particle Canvas
const canvas = document.getElementById('particles');
if (canvas) {
  const ctx = canvas.getContext('2d');
  let particles = [];

  function resize() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
  }

  resize();
  window.addEventListener('resize', resize);

  for (let i = 0; i < 50; i++) {
    particles.push({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      r: Math.random() * 2 + 0.5,
      dx: (Math.random() - 0.5) * 0.4,
      dy: (Math.random() - 0.5) * 0.4,
      opacity: Math.random() * 0.5 + 0.1
    });
  }

  function drawParticles() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    particles.forEach(p => {
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(212,175,55,${p.opacity})`;
      ctx.fill();
      p.x += p.dx;
      p.y += p.dy;
      if (p.x < 0 || p.x > canvas.width) p.dx *= -1;
      if (p.y < 0 || p.y > canvas.height) p.dy *= -1;
    });
    requestAnimationFrame(drawParticles);
  }

  drawParticles();
}

// Counter animation
function animateCounters() {
  const counters = document.querySelectorAll('.stat-num');
  counters.forEach(counter => {
    const target = parseInt(counter.dataset.target);
    const duration = 2000;
    const step = target / (duration / 16);
    let current = 0;

    const timer = setInterval(() => {
      current += step;
      if (current >= target) {
        current = target;
        clearInterval(timer);
      }
      counter.textContent = Math.floor(current).toLocaleString('hi-IN');
    }, 16);
  });
}

// Intersection Observer for counters and reveals
const observer = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      if (entry.target.classList.contains('hero-stats')) {
        animateCounters();
      }
      entry.target.classList.add('visible');
      observer.unobserve(entry.target);
    }
  });
}, { threshold: 0.2 });

document.querySelectorAll('.reveal, .hero-stats').forEach(el => observer.observe(el));
document.querySelectorAll('.pillar, .ql-card, .seva-card, .timeline-item').forEach(el => {
  el.classList.add('reveal');
  observer.observe(el);
});

// Countdown Timer
function updateCountdown() {
  const eventDate = new Date('2025-09-01T06:00:00');
  const now = new Date();
  const diff = eventDate - now;

  if (diff > 0) {
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const mins = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    const secs = Math.floor((diff % (1000 * 60)) / 1000);

    const el = (id) => document.getElementById(id);
    if (el('cDays')) el('cDays').textContent = String(days).padStart(2, '0');
    if (el('cHours')) el('cHours').textContent = String(hours).padStart(2, '0');
    if (el('cMins')) el('cMins').textContent = String(mins).padStart(2, '0');
    if (el('cSecs')) el('cSecs').textContent = String(secs).padStart(2, '0');
  }
}

setInterval(updateCountdown, 1000);
updateCountdown();

// Testimonial Carousel
let currentTestimonial = 0;
const track = document.getElementById('testimonialTrack');
const dots = document.querySelectorAll('.t-dot');

function goToTestimonial(n) {
  currentTestimonial = n;
  if (track) track.style.transform = `translateX(-${n * 100}%)`;
  dots.forEach((d, i) => d.classList.toggle('active', i === n));
}

window.goToTestimonial = goToTestimonial;

setInterval(() => {
  if (track) goToTestimonial((currentTestimonial + 1) % (dots.length || 3));
}, 5000);

// Form validation helper
window.validateForm = function(formId, fields) {
  const form = document.getElementById(formId);
  if (!form) return false;
  let valid = true;

  fields.forEach(field => {
    const el = form.querySelector(`[name="${field.name}"]`);
    if (!el) return;
    const val = el.value.trim();
    const wrapper = el.closest('.form-group');
    const existing = wrapper.querySelector('.field-error');
    if (existing) existing.remove();

    let error = '';
    if (field.required && !val) error = 'यह फ़ील्ड आवश्यक है';
    else if (field.type === 'tel' && val && !/^\d{10}$/.test(val)) error = 'सही मोबाइल नंबर डालें (10 अंक)';
    else if (field.type === 'email' && val && !/\S+@\S+\.\S+/.test(val)) error = 'सही ईमेल डालें';

    if (error) {
      const errEl = document.createElement('span');
      errEl.className = 'field-error';
      errEl.textContent = error;
      errEl.style.cssText = 'color:#C84B00;font-size:0.85rem;font-family:var(--font-hindi);display:block;margin-top:0.25rem;';
      wrapper.appendChild(errEl);
      el.style.borderColor = '#C84B00';
      valid = false;
    } else {
      el.style.borderColor = '';
    }
  });

  return valid;
};

// Google Sheets Integration
const SHEET_CONFIG = {
  // Replace with your Google Apps Script Web App URL
  webAppUrl: 'YOUR_GOOGLE_APPS_SCRIPT_URL_HERE',
  
  async submit(sheetName, data) {
    if (this.webAppUrl === 'YOUR_GOOGLE_APPS_SCRIPT_URL_HERE') {
      // Mock mode - store locally
      console.log('Mock submit:', sheetName, data);
      return { success: true, id: 'DCR-' + Date.now() };
    }
    
    try {
      const res = await fetch(this.webAppUrl, {
        method: 'POST',
        mode: 'no-cors',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sheet: sheetName, ...data })
      });
      return { success: true };
    } catch (err) {
      console.error('Sheet error:', err);
      return { success: false, error: err.message };
    }
  }
};

window.SHEET_CONFIG = SHEET_CONFIG;

// Active nav link
const currentPage = window.location.pathname.split('/').pop() || 'index.html';
document.querySelectorAll('.nav-links a').forEach(a => {
  const href = a.getAttribute('href').split('/').pop();
  if (href === currentPage) a.classList.add('active');
});

// Smooth scroll for anchor links
document.querySelectorAll('a[href^="#"]').forEach(a => {
  a.addEventListener('click', e => {
    e.preventDefault();
    const target = document.querySelector(a.getAttribute('href'));
    if (target) target.scrollIntoView({ behavior: 'smooth' });
  });
});
