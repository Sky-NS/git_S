
base = "/mnt/agents/output/anokhin-airways"

countdown_js = '''/**
 * ANOKHIN AIRWAYS — Countdown Timer
 * Luxury flip countdown to wedding date
 */

(function() {
    'use strict';

    const WEDDING_DATE = new Date('2027-08-08T13:00:00').getTime();

    const els = {
        days: document.getElementById('countDays'),
        hours: document.getElementById('countHours'),
        minutes: document.getElementById('countMinutes'),
        seconds: document.getElementById('countSeconds')
    };

    let prevValues = { days: '00', hours: '00', minutes: '00', seconds: '00' };

    function pad(n) {
        return n < 10 ? '0' + n : String(n);
    }

    function updateFlip(element, newValue) {
        if (!element) return;
        const top = element.querySelector('.cf-top span');
        const bottom = element.querySelector('.cf-bottom span');
        if (top) top.textContent = newValue;
        if (bottom) bottom.textContent = newValue;
    }

    function tick() {
        const now = Date.now();
        const diff = WEDDING_DATE - now;

        if (diff <= 0) {
            updateFlip(els.days, '00');
            updateFlip(els.hours, '00');
            updateFlip(els.minutes, '00');
            updateFlip(els.seconds, '00');
            return;
        }

        const days = Math.floor(diff / (1000 * 60 * 60 * 24));
        const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((diff % (1000 * 60)) / 1000);

        const values = {
            days: pad(days),
            hours: pad(hours),
            minutes: pad(minutes),
            seconds: pad(seconds)
        };

        if (values.days !== prevValues.days) updateFlip(els.days, values.days);
        if (values.hours !== prevValues.hours) updateFlip(els.hours, values.hours);
        if (values.minutes !== prevValues.minutes) updateFlip(els.minutes, values.minutes);
        if (values.seconds !== prevValues.seconds) updateFlip(els.seconds, values.seconds);

        prevValues = values;
    }

    // Initialize
    tick();
    setInterval(tick, 1000);

    // Intersection Observer for performance
    const countdownSection = document.getElementById('countdown');
    if (countdownSection && 'IntersectionObserver' in window) {
        let intervalId = setInterval(tick, 1000);
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    if (!intervalId) intervalId = setInterval(tick, 1000);
                } else {
                    clearInterval(intervalId);
                    intervalId = null;
                }
            });
        }, { threshold: 0.1 });
        observer.observe(countdownSection);
    }
})();
'''

with open(f"{base}/js/countdown.js", "w", encoding="utf-8") as f:
    f.write(countdown_js)

print("js/countdown.js created:", len(countdown_js), "chars")