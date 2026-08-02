/**
 * ANOKHIN AIRWAYS — Animations Engine
 * GSAP + ScrollTrigger + Intersection Observer
 */

(function() {
    'use strict';

    // Wait for GSAP to load
    function initAnimations() {
        if (typeof gsap === 'undefined' || typeof ScrollTrigger === 'undefined') {
            setTimeout(initAnimations, 100);
            return;
        }

        gsap.registerPlugin(ScrollTrigger);

        // ============================================
        // HERO ENTRANCE
        // ============================================
        const hero = document.getElementById('hero');
        if (hero) {
            hero.classList.add('hero-entrance');
        }

        // ============================================
        // NAV SCROLL EFFECT
        // ============================================
        const nav = document.getElementById('mainNav');
        if (nav) {
            ScrollTrigger.create({
                start: 'top -100',
                onUpdate: (self) => {
                    if (self.direction === 1 && self.scroll() > 100) {
                        nav.classList.add('scrolled');
                    } else if (self.scroll() < 100) {
                        nav.classList.remove('scrolled');
                    }
                }
            });
        }

        // ============================================
        // SECTION REVEALS — Intersection Observer
        // ============================================
        const revealElements = document.querySelectorAll(
            '.section-label, .section-title, .story-paragraph, .timeline-item, ' +
            '.bp-detail, .dc-color, .baggage-item, .coord, .venue-address, ' +
            '.dresscode-note, .rsvp-field, .boarding-pass'
        );

        const revealObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('visible');
                    revealObserver.unobserve(entry.target);
                }
            });
        }, {
            threshold: 0.15,
            rootMargin: '0px 0px -50px 0px'
        });

        revealElements.forEach((el, index) => {
            el.classList.add('reveal');
            el.style.transitionDelay = `${(index % 5) * 0.1}s`;
            revealObserver.observe(el);
        });

        // ============================================
        // BOARDING PASS PARALLAX
        // ============================================
        const boardingPass = document.getElementById('boardingPass');
        if (boardingPass) {
            gsap.fromTo(boardingPass, 
                { y: 60, opacity: 0, rotateX: 5 },
                {
                    y: 0, opacity: 1, rotateX: 0,
                    duration: 1.2,
                    ease: 'power3.out',
                    scrollTrigger: {
                        trigger: boardingPass,
                        start: 'top 85%',
                        toggleActions: 'play none none none'
                    }
                }
            );
        }

        // ============================================
        // STORY SECTION ANIMATIONS
        // ============================================
        const storyVisual = document.querySelector('.story-visual');
        if (storyVisual) {
            gsap.fromTo(storyVisual,
                { x: -80, opacity: 0 },
                {
                    x: 0, opacity: 1,
                    duration: 1,
                    ease: 'power2.out',
                    scrollTrigger: {
                        trigger: storyVisual,
                        start: 'top 80%',
                        toggleActions: 'play none none none'
                    }
                }
            );
        }

        const storyText = document.querySelector('.story-text');
        if (storyText) {
            gsap.fromTo(storyText,
                { x: 80, opacity: 0 },
                {
                    x: 0, opacity: 1,
                    duration: 1,
                    delay: 0.2,
                    ease: 'power2.out',
                    scrollTrigger: {
                        trigger: storyText,
                        start: 'top 80%',
                        toggleActions: 'play none none none'
                    }
                }
            );
        }

        // ============================================
        // FLIGHT ROUTE — Plane along path
        // ============================================
        const flightPath = document.getElementById('flightPath');
        const routePlane = document.getElementById('routePlane');

        if (flightPath && routePlane) {
            const pathLength = flightPath.getTotalLength();

            // Set initial state
            gsap.set(routePlane, {
                motionPath: {
                    path: flightPath,
                    align: flightPath,
                    alignOrigin: [0.5, 0.5],
                    autoRotate: true
                }
            });

            // Animate plane along path on scroll
            gsap.to(routePlane, {
                motionPath: {
                    path: flightPath,
                    align: flightPath,
                    alignOrigin: [0.5, 0.5],
                    autoRotate: true
                },
                ease: 'none',
                scrollTrigger: {
                    trigger: '.route-visual',
                    start: 'top 80%',
                    end: 'bottom 20%',
                    scrub: 1
                }
            });

            // Animate path draw
            gsap.fromTo(flightPath,
                { strokeDasharray: pathLength, strokeDashoffset: pathLength },
                {
                    strokeDashoffset: 0,
                    ease: 'none',
                    scrollTrigger: {
                        trigger: '.route-visual',
                        start: 'top 80%',
                        end: 'bottom 20%',
                        scrub: 1
                    }
                }
            );

            // Waypoint reveals
            const waypoints = document.querySelectorAll('.route-waypoint');
            waypoints.forEach((wp, i) => {
                gsap.fromTo(wp,
                    { opacity: 0, scale: 0.5 },
                    {
                        opacity: 1, scale: 1,
                        duration: 0.6,
                        delay: i * 0.2,
                        ease: 'back.out(1.7)',
                        scrollTrigger: {
                            trigger: '.route-visual',
                            start: 'top 70%',
                            toggleActions: 'play none none none'
                        }
                    }
                );
            });
        }

        // ============================================
        // TIMELINE STAGGER
        // ============================================
        const timelineItems = document.querySelectorAll('.timeline-item');
        if (timelineItems.length) {
            gsap.fromTo(timelineItems,
                { x: -40, opacity: 0 },
                {
                    x: 0, opacity: 1,
                    duration: 0.8,
                    stagger: 0.15,
                    ease: 'power2.out',
                    scrollTrigger: {
                        trigger: '.timeline-list',
                        start: 'top 80%',
                        toggleActions: 'play none none none'
                    }
                }
            );
        }

        // ============================================
        // VENUE MAP REVEAL
        // ============================================
        const venueMap = document.querySelector('.venue-map');
        if (venueMap) {
            gsap.fromTo(venueMap,
                { scale: 0.95, opacity: 0 },
                {
                    scale: 1, opacity: 1,
                    duration: 1,
                    ease: 'power2.out',
                    scrollTrigger: {
                        trigger: venueMap,
                        start: 'top 80%',
                        toggleActions: 'play none none none'
                    }
                }
            );
        }

        // ============================================
        // DRESS CODE PALETTE
        // ============================================
        const dcColors = document.querySelectorAll('.dc-color');
        if (dcColors.length) {
            gsap.fromTo(dcColors,
                { y: 40, opacity: 0 },
                {
                    y: 0, opacity: 1,
                    duration: 0.6,
                    stagger: 0.1,
                    ease: 'power2.out',
                    scrollTrigger: {
                        trigger: '.dresscode-palette',
                        start: 'top 85%',
                        toggleActions: 'play none none none'
                    }
                }
            );
        }

        // ============================================
        // BAGGAGE ITEMS
        // ============================================
        const baggageItems = document.querySelectorAll('.baggage-item');
        if (baggageItems.length) {
            gsap.fromTo(baggageItems,
                { x: -20, opacity: 0 },
                {
                    x: 0, opacity: 1,
                    duration: 0.5,
                    stagger: 0.08,
                    ease: 'power2.out',
                    scrollTrigger: {
                        trigger: '.baggage-grid',
                        start: 'top 80%',
                        toggleActions: 'play none none none'
                    }
                }
            );
        }

        // ============================================
        // COUNTDOWN ENTRANCE
        // ============================================
        const countdownUnits = document.querySelectorAll('.countdown-unit');
        if (countdownUnits.length) {
            gsap.fromTo(countdownUnits,
                { y: 60, opacity: 0 },
                {
                    y: 0, opacity: 1,
                    duration: 0.8,
                    stagger: 0.1,
                    ease: 'power2.out',
                    scrollTrigger: {
                        trigger: '#countdown',
                        start: 'top 80%',
                        toggleActions: 'play none none none'
                    }
                }
            );
        }

        // ============================================
        // RSVP FORM
        // ============================================
        const rsvpFields = document.querySelectorAll('.rsvp-field');
        if (rsvpFields.length) {
            gsap.fromTo(rsvpFields,
                { y: 30, opacity: 0 },
                {
                    y: 0, opacity: 1,
                    duration: 0.6,
                    stagger: 0.1,
                    ease: 'power2.out',
                    scrollTrigger: {
                        trigger: '#rsvpForm',
                        start: 'top 80%',
                        toggleActions: 'play none none none'
                    }
                }
            );
        }

        // ============================================
        // PARALLAX EFFECTS
        // ============================================
        const parallaxElements = document.querySelectorAll('.hero-plane-container, .story-deco, .venue-compass');
        parallaxElements.forEach(el => {
            gsap.to(el, {
                y: -50,
                ease: 'none',
                scrollTrigger: {
                    trigger: el.closest('section'),
                    start: 'top bottom',
                    end: 'bottom top',
                    scrub: 1
                }
            });
        });

        // ============================================
        // FOOTER REVEAL
        // ============================================
        const footer = document.querySelector('.main-footer');
        if (footer) {
            gsap.fromTo(footer.querySelectorAll('.footer-brand, .footer-info, .footer-couple, .footer-legal'),
                { y: 30, opacity: 0 },
                {
                    y: 0, opacity: 1,
                    duration: 0.8,
                    stagger: 0.1,
                    ease: 'power2.out',
                    scrollTrigger: {
                        trigger: footer,
                        start: 'top 90%',
                        toggleActions: 'play none none none'
                    }
                }
            );
        }
    }

    // Initialize when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initAnimations);
    } else {
        initAnimations();
    }
})();
