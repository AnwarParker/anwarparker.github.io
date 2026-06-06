// ===== Theme Toggle =====
const toggle = document.getElementById('theme-toggle');
const year = document.getElementById('year');
const savedTheme = localStorage.getItem('theme');

if (savedTheme === 'dark') {
  document.body.classList.add('dark');
}

if (year) {
  year.textContent = new Date().getFullYear();
}

if (toggle) {
  const updateIcon = () => {
    const icon = toggle.querySelector('i');
    if (icon) {
      icon.className = document.body.classList.contains('dark')
        ? 'fa-solid fa-sun'
        : 'fa-solid fa-moon';
    }
  };
  updateIcon();

  toggle.addEventListener('click', () => {
    document.body.classList.toggle('dark');
    const mode = document.body.classList.contains('dark') ? 'dark' : 'light';
    localStorage.setItem('theme', mode);
    updateIcon();
  });
}

// ===== Navbar Scroll Effect =====
const navbar = document.getElementById('navbar');
if (navbar) {
  window.addEventListener('scroll', () => {
    navbar.classList.toggle('scrolled', window.scrollY > 20);
  });
}

// ===== Scroll Reveal =====
const revealElements = document.querySelectorAll('.reveal');

const revealObserver = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (entry.isIntersecting) {
      entry.target.classList.add('visible');
      revealObserver.unobserve(entry.target);
    }
  });
}, {
  threshold: 0.1,
  rootMargin: '0px 0px -50px 0px'
});

revealElements.forEach((el) => revealObserver.observe(el));

// ===== Active Nav Link Highlight =====
const sections = document.querySelectorAll('section[id]');
const navLinks = document.querySelectorAll('.nav-links a');

const highlightNav = () => {
  const scrollY = window.scrollY + 100;
  sections.forEach((section) => {
    const top = section.offsetTop;
    const height = section.offsetHeight;
    const id = section.getAttribute('id');
    if (scrollY >= top && scrollY < top + height) {
      navLinks.forEach((link) => {
        link.style.color = '';
        link.style.background = '';
        if (link.getAttribute('href') === `#${id}`) {
          link.style.color = 'var(--accent)';
          link.style.background = 'var(--accent-light)';
        }
      });
    }
  });
};

window.addEventListener('scroll', highlightNav);

// ===== Geeky IT Quote of the Day =====
const geekyQuotes = [
  "It works on my machine — so we ship the machine.",
  "There are only 10 types of people: those who understand binary and those who don't.",
  "A good programmer is someone who looks both ways before crossing a one-way street.",
  "Why do DevOps engineers make great DJs? They know how to handle continuous delivery.",
  "In order to understand recursion, one must first understand recursion."
];

const quoteEl = document.getElementById('geeky-quote');
if (quoteEl) {
  quoteEl.textContent = geekyQuotes[Math.floor(Math.random() * geekyQuotes.length)];
}

