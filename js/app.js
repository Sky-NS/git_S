/**
 * ANOKHIN AIRWAYS — Main Application
 * Loader, particles, navigation, smooth scroll
 */

(function() {
    'use strict';

    // ============================================
    // LOADER
    // ============================================
    const loader = document.getElementById('loader');

    function hideLoader() {
        if (loader) {
            setTimeout(() => {
                loader.classList.add('hidden');
                document.body.style.overflow = '';
            }, 2200);
        }
    }

    if (document.readyState === 'complete') {
        hideLoader();
    } else {
        window.addEventListener('load', hideLoader);
    }

    // Prevent scroll during load
    document.body.style.overflow = 'hidden';

    // ============================================
    // HERO STARS GENERATOR
    // ============================================
    const starsContainer = document.getElementById('heroStars');
    if (starsContainer) {
        const starCount = 80;
        for (let i = 0; i < starCount; i++) {
            const star = document.createElement('div');
            star.className = 'star';
            star.style.left = Math.random() * 100 + '%';
            star.style.top = Math.random() * 100 + '%';
            star.style.width = (Math.random() * 2 + 1) + 'px';
            star.style.height = star.style.width;
            star.style.animationDelay = Math.random() * 3 + 's';
            star.style.animationDuration = (Math.random() * 3 + 2) + 's';
            starsContainer.appendChild(star);
        }
    }

    // ============================================
    // HERO PARTICLES GENERATOR
    // ============================================
    const particlesContainer = document.getElementById('heroParticles');
    if (particlesContainer) {
        const particleCount = 30;
        for (let i = 0; i < particleCount; i++) {
            const particle = document.createElement('div');
            particle.className = 'particle';
            particle.style.left = Math.random() * 100 + '%';
            particle.style.top = Math.random() * 100 + '%';
            particle.style.animationDelay = Math.random() * 8 + 's';
            particle.style.animationDuration = (Math.random() * 6 + 6) + 's';
            particlesContainer.appendChild(particle);
        }
    }

    // ============================================
    // MOBILE NAVIGATION
    // ============================================
    const navToggle = document.getElementById('navToggle');
    const navMenu = document.getElementById('navMenu');
    const navLinks = document.querySelectorAll('.nav-link');

    if (navToggle && navMenu) {
        navToggle.addEventListener('click', () => {
            const isOpen = navMenu.classList.toggle('open');
            navToggle.classList.toggle('active', isOpen);
            navToggle.setAttribute('aria-expanded', isOpen);
            document.body.style.overflow = isOpen ? 'hidden' : '';
        });

        navLinks.forEach(link => {
            link.addEventListener('click', () => {
                navMenu.classList.remove('open');
                navToggle.classList.remove('active');
                navToggle.setAttribute('aria-expanded', 'false');
                document.body.style.overflow = '';
            });
        });
    }

    // ============================================
    // SMOOTH SCROLL FOR ANCHOR LINKS
    // ============================================
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            e.preventDefault();
            const targetId = this.getAttribute('href');
            const target = document.querySelector(targetId);
            if (target) {
                const navHeight = navToggle ? 80 : 60;
                const targetPosition = target.getBoundingClientRect().top + window.pageYOffset - navHeight;
                window.scrollTo({
                    top: targetPosition,
                    behavior: 'smooth'
                });
            }
        });
    });

    // ============================================
    // ACTIVE NAV LINK ON SCROLL
    // ============================================
    const sections = document.querySelectorAll('section[id]');

    function updateActiveNav() {
        const scrollPos = window.pageYOffset + 150;

        sections.forEach(section => {
            const top = section.offsetTop;
            const height = section.offsetHeight;
            const id = section.getAttribute('id');

            if (scrollPos >= top && scrollPos < top + height) {
                navLinks.forEach(link => {
                    link.classList.remove('active');
                    if (link.getAttribute('href') === '#' + id) {
                        link.classList.add('active');
                    }
                });
            }
        });
    }

    let ticking = false;
    window.addEventListener('scroll', () => {
        if (!ticking) {
            requestAnimationFrame(() => {
                updateActiveNav();
                ticking = false;
            });
            ticking = true;
        }
    });

    // ============================================
    // DRESS CODE COLOR INTERACTION
    // ============================================
    const dcColors = document.querySelectorAll('.dc-color');
    dcColors.forEach(color => {
        color.addEventListener('click', function() {
            const colorName = this.getAttribute('data-color');
            // Copy hex to clipboard
            const hexEl = this.querySelector('.dc-hex');
            if (hexEl && navigator.clipboard) {
                navigator.clipboard.writeText(hexEl.textContent).catch(() => {});
            }
        });
    });

    // ============================================
    // BOARDING PASS 3D TILT EFFECT
    // ============================================
    const boardingPass = document.getElementById('boardingPass');
    if (boardingPass && window.matchMedia('(pointer: fine)').matches) {
        boardingPass.addEventListener('mousemove', function(e) {
            const rect = this.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            const centerX = rect.width / 2;
            const centerY = rect.height / 2;
            const rotateX = (y - centerY) / 30;
            const rotateY = (centerX - x) / 30;

            this.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg)`;
            this.style.transition = 'transform 0.1s ease';
        });

        boardingPass.addEventListener('mouseleave', function() {
            this.style.transform = 'perspective(1000px) rotateX(0) rotateY(0)';
            this.style.transition = 'transform 0.5s ease';
        });
    }

    // ============================================
    // SERVICE WORKER REGISTRATION (PWA)
    // ============================================
    if ('serviceWorker' in navigator) {
        window.addEventListener('load', () => {
            navigator.serviceWorker.register('sw.js')
                .then(registration => {
                    console.log('SW registered:', registration.scope);
                })
                .catch(error => {
                    console.log('SW registration failed:', error);
                });
        });
    }

    // ============================================
    // LAZY LOAD MAP IFRAME
    // ============================================
    const mapContainer = document.getElementById('mapContainer');
    if (mapContainer && 'IntersectionObserver' in window) {
        const mapObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const iframe = mapContainer.querySelector('iframe');
                    if (iframe && iframe.dataset.src) {
                        iframe.src = iframe.dataset.src;
                        iframe.removeAttribute('data-src');
                    }
                    mapObserver.unobserve(mapContainer);
                }
            });
        }, { threshold: 0.1 });
        mapObserver.observe(mapContainer);
    }

    // ============================================
    // KEYBOARD NAVIGATION
    // ============================================
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && navMenu && navMenu.classList.contains('open')) {
            navMenu.classList.remove('open');
            navToggle.classList.remove('active');
            navToggle.setAttribute('aria-expanded', 'false');
            document.body.style.overflow = '';
        }
    });

    // ============================================
    // REDUCED MOTION CHECK
    // ============================================
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
    if (prefersReducedMotion.matches) {
        document.documentElement.classList.add('reduce-motion');
    }

    // ============================================
    // CONSOLE BRANDING
    // ============================================
    console.log(
        '%c ANOKHIN AIRWAYS ',
        'background: #07111F; color: #D7B26D; font-size: 14px; font-weight: bold; padding: 8px 16px; border-radius: 4px;'
    );
    console.log(
        '%c Moscow to Forever — 08.08.2027 ',
        'color: #8B8B8B; font-size: 11px; font-style: italic;'
    );
})();
