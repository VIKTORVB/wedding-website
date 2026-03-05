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

langToggle.addEventListener('click', () => {
    currentLang = currentLang === 'bg' ? 'en' : 'bg';
    localStorage.setItem('lang', currentLang);
    updateLang();
});

// Run on load
updateLang();


/* ----------------------------------------------------------------
   2. RSVP FORM — bilingual success / error messages
   Uses a dedicated #formError element so error text goes through
   the same data-attribute i18n system as everything else.
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
// Add depth shadow once user scrolls past the top — attach to body
// since that is the scroll container (overflow-y: scroll on body).
document.body.addEventListener('scroll', () => {
    if (!navbar) return;
    const scrollTop = document.body.scrollTop;
    navbar.style.boxShadow = scrollTop > 60
        ? '0 2px 20px rgba(0,0,0,0.12)'
        : '';
}, { passive: true });


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
    root: null,
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
