/* ================================================================
   WEDDING WEBSITE — JAVASCRIPT
   File: js/main.js
================================================================ */


/* ----------------------------------------------------------------
   1. RSVP FORM — handled by inline script in index.html
   (supports bilingual success messages & attendance logic)
---------------------------------------------------------------- */


/* ----------------------------------------------------------------
   2. NAVBAR — soften background on scroll (matches hand-drawn palette)
---------------------------------------------------------------- */
const navbar = document.getElementById('navbar');

window.addEventListener('scroll', () => {
    if (window.scrollY > 60) {
        navbar.style.background = 'rgba(60, 55, 48, 0.85)';
    } else {
        navbar.style.background = 'rgba(60, 55, 48, 0.45)';
    }
});


/* ----------------------------------------------------------------
   3. ACTIVE NAV LINK — highlights the current section in the navbar
---------------------------------------------------------------- */
const sections  = document.querySelectorAll('section[id]');
const navLinks  = document.querySelectorAll('#navbar a');

const observerOptions = {
    root:       null,
    rootMargin: '-40% 0px -40% 0px',
    threshold:  0
};

const sectionObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            /* ---- active nav link ---- */
            navLinks.forEach(link => link.classList.remove('active'));
            const active = document.querySelector(`#navbar a[href="#${entry.target.id}"]`);
            if (active) active.classList.add('active');
        }
    });
}, observerOptions);

sections.forEach(section => sectionObserver.observe(section));


/* ----------------------------------------------------------------
   4. FADE-IN ANIMATION — class-based; CSS handles transitions
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
    el.classList.add('fade-in');
    fadeObserver.observe(el);
});
