/* ================================================================
   WEDDING WEBSITE — JAVASCRIPT
   File: js/main.js
================================================================ */


/* ----------------------------------------------------------------
   1. LANGUAGE TOGGLE
   - Persists choice in localStorage
   - Updates all [data-en][data-bg] elements + input placeholders
   - Updates document.documentElement.lang for assistive technology
---------------------------------------------------------------- */
const langToggle = document.getElementById('lang-toggle');
let currentLang = localStorage.getItem('lang') || 'bg';

function updateLang() {
    document.querySelectorAll('[data-en][data-bg]').forEach(el => {
        el.textContent = el.getAttribute('data-' + currentLang);
    });
    document.querySelectorAll('[data-en-placeholder][data-bg-placeholder]').forEach(el => {
        el.setAttribute('placeholder', el.getAttribute('data-' + currentLang + '-placeholder'));
    });
    langToggle.textContent = currentLang === 'bg' ? 'EN' : 'BG';
    document.documentElement.lang = currentLang;
    updateSuccessMessages();
}

/* ----------------------------------------------------------------
   2. RSVP FORM — bilingual success / error messages
   Uses a dedicated #formError element so error text goes through
   the same data-attribute i18n system as everything else.
   NOTE: These must be declared before updateLang() is first called,
   because updateSuccessMessages() references them.
---------------------------------------------------------------- */
const rsvpForm       = document.getElementById('rsvpForm');
const formSuccessYes = document.getElementById('formSuccessYes');
const formSuccessNo  = document.getElementById('formSuccessNo');
const formError      = document.getElementById('formError');

function updateSuccessMessages() {
    [formSuccessYes, formSuccessNo, formError].forEach(el => {
        if (el) el.textContent = el.getAttribute('data-' + currentLang);
    });
}

langToggle.addEventListener('click', () => {
    currentLang = currentLang === 'bg' ? 'en' : 'bg';
    localStorage.setItem('lang', currentLang);
    updateLang();
});

// Run on load
updateLang();

if (rsvpForm) {
    rsvpForm.addEventListener('submit', function (e) {
        e.preventDefault();

        // Hide any previous message
        [formSuccessYes, formSuccessNo, formError].forEach(el => {
            if (el) el.style.display = 'none';
        });

        const formData = new FormData(rsvpForm);
        const attending = formData.get('attendance');

        fetch(rsvpForm.action, {
            method: 'POST',
            body: formData,
            headers: { Accept: 'application/json' }
        })
        .then(() => {
            rsvpForm.style.display = 'none';
            const msg = attending === 'Not Attending' ? formSuccessNo : formSuccessYes;
            if (msg) {
                msg.style.display = 'block';
                msg.focus(); // move focus for screen readers
            }
        })
        .catch(() => {
            rsvpForm.style.display = 'none';
            if (formError) {
                formError.style.display = 'block';
                formError.focus();
            }
        });
    });
}


/* ----------------------------------------------------------------
   3. NAV HEIGHT — set CSS variable from actual rendered height
   so scroll-margin-top and any calc() using --nav-height
   are always pixel-perfect regardless of wrapping.
---------------------------------------------------------------- */
const navbar = document.getElementById('navbar');

/* ----------------------------------------------------------------
   3b. HAMBURGER MENU TOGGLE
---------------------------------------------------------------- */
const navToggle = document.getElementById('nav-toggle');
const navMenu   = document.getElementById('nav-menu');

function setMenuOpen(open) {
    if (!navbar || !navToggle || !navMenu) return;
    if (open) {
        navbar.classList.add('nav-open');
        navMenu.style.display = 'flex';
        navMenu.style.flexDirection = 'column';
    } else {
        navbar.classList.remove('nav-open');
        navMenu.style.display = '';
        navMenu.style.flexDirection = '';
    }
    navToggle.setAttribute('aria-expanded', String(open));
}

if (navToggle && navbar && navMenu) {
    function handleToggle(e) {
        e.preventDefault();
        const willOpen = !navbar.classList.contains('nav-open');
        setMenuOpen(willOpen);
    }
    navToggle.addEventListener('click', handleToggle);

    // Close menu when a nav link is clicked
    document.querySelectorAll('#nav-menu a').forEach(a => {
        a.addEventListener('click', () => setMenuOpen(false));
    });

    // Close menu when clicking outside navbar
    document.addEventListener('click', e => {
        if (navbar.classList.contains('nav-open') && !navbar.contains(e.target)) {
            setMenuOpen(false);
        }
    });
}

function updateNavHeight() {
    if (navbar) {
        document.documentElement.style.setProperty(
            '--nav-height',
            navbar.offsetHeight + 'px'
        );
    }
}

updateNavHeight();
window.addEventListener('resize', updateNavHeight);


/* ----------------------------------------------------------------
   4. NAVBAR — background darkens on scroll
   Uses requestAnimationFrame to throttle — no layout thrashing
   on low-end devices. Clears inline style when at top so the
   CSS variable (--color-green) takes over again.
---------------------------------------------------------------- */
// Add depth shadow once user scrolls past the top — attach to #page-wrap
// since that is the scroll container.
const pageWrap = document.getElementById('page-wrap');
if (pageWrap) {
    pageWrap.addEventListener('scroll', () => {
        if (!navbar) return;
        navbar.style.boxShadow = pageWrap.scrollTop > 60
            ? '0 2px 20px rgba(0,0,0,0.12)'
            : '';
    }, { passive: true });
}

// Intercept nav anchor clicks — scroll #page-wrap instead of the document
document.querySelectorAll('#navbar a[href^="#"]').forEach(a => {
    a.addEventListener('click', e => {
        e.preventDefault();
        const target = document.querySelector(a.getAttribute('href'));
        if (target && pageWrap) pageWrap.scrollTo({ top: target.offsetTop, behavior: 'smooth' });
    });
});


/* ----------------------------------------------------------------
   5. ACTIVE NAV LINK — highlights current section + sets aria-current
---------------------------------------------------------------- */
const sections = document.querySelectorAll('section[id]');
const navLinks  = document.querySelectorAll('#navbar a');

const sectionObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        const link = document.querySelector('#navbar a[href="#' + entry.target.id + '"]');
        if (!link) return;

        if (entry.isIntersecting) {
            navLinks.forEach(l => {
                l.classList.remove('active');
                l.removeAttribute('aria-current');
            });
            link.classList.add('active');
            link.setAttribute('aria-current', 'true');
        }
    });
}, {
    root: pageWrap || null,
    rootMargin: '-40% 0px -40% 0px',
    threshold: 0
});

sections.forEach(section => sectionObserver.observe(section));


/* ----------------------------------------------------------------
   6. FADE-IN ANIMATION
   Only applied to elements NOT already in the viewport on load,
   preventing a flash of invisible content on the first section.
---------------------------------------------------------------- */
const fadeTargets = document.querySelectorAll('.section__content');

const fadeObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add('visible');
            fadeObserver.unobserve(entry.target);
        }
    });
}, { threshold: 0.12 });

fadeTargets.forEach(el => {
    const rect = el.getBoundingClientRect();
    // Only animate elements that start below the viewport fold
    if (rect.top >= window.innerHeight) {
        el.classList.add('fade-in');
    }
    fadeObserver.observe(el);
});



