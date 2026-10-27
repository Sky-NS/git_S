(function () {
    'use strict';

    const config = window.WEDDING_CONFIG || {};

    // Фото пары: пока нет своего снимка в assets/photos, показываем общее фото
    document.querySelectorAll('img[data-fallback]').forEach((img) => {
        const swap = () => {
            if (img.src.endsWith(img.dataset.fallback)) return;
            img.src = img.dataset.fallback;
        };
        img.addEventListener('error', swap, { once: true });
        if (img.complete && img.naturalWidth === 0) swap();
    });

    // Штрихкод на посадочном талоне: полосы разной ширины, одинаковые при каждом открытии
    const barcode = document.getElementById('barcode');
    if (barcode) {
        const ns = 'http://www.w3.org/2000/svg';
        let x = 0;
        let seed = 13062027;
        while (x < 160) {
            seed = (seed * 1103515245 + 12345) % 2147483648;
            const w = 1 + (seed % 4);
            const bar = document.createElementNS(ns, 'rect');
            bar.setAttribute('x', x);
            bar.setAttribute('y', 0);
            bar.setAttribute('width', Math.min(w, 160 - x));
            bar.setAttribute('height', 50);
            barcode.append(bar);
            x += w + 1 + ((seed >> 4) % 3);
        }
    }

    // Блоки проявляются, когда до них доходит прокрутка
    const revealables = document.querySelectorAll('.reveal, .stamp, .trail');
    if ('IntersectionObserver' in window) {
        const io = new IntersectionObserver((entries) => {
            entries.forEach((entry) => {
                if (!entry.isIntersecting) return;
                entry.target.classList.add('is-visible');
                io.unobserve(entry.target);
            });
        }, { threshold: 0.15, rootMargin: '0px 0px -8% 0px' });
        revealables.forEach((el) => io.observe(el));
    } else {
        revealables.forEach((el) => el.classList.add('is-visible'));
    }

    // Обратный отсчёт
    const countdown = document.getElementById('countdown');
    const target = Date.parse(config.date);
    if (countdown && !Number.isNaN(target)) {
        const forms = {
            days: ['день', 'дня', 'дней'],
            hours: ['час', 'часа', 'часов'],
            minutes: ['минута', 'минуты', 'минут'],
            seconds: ['секунда', 'секунды', 'секунд']
        };
        const plural = (n, [one, few, many]) => {
            const mod10 = n % 10;
            const mod100 = n % 100;
            if (mod10 === 1 && mod100 !== 11) return one;
            if (mod10 >= 2 && mod10 <= 4 && (mod100 < 12 || mod100 > 14)) return few;
            return many;
        };
        const nums = {};
        const labels = {};
        Object.keys(forms).forEach((unit) => {
            nums[unit] = countdown.querySelector(`[data-unit="${unit}"]`);
            labels[unit] = countdown.querySelector(`[data-label="${unit}"]`);
        });

        let timer = null;
        const tick = () => {
            const diff = target - Date.now();
            if (diff <= 0) {
                clearInterval(timer);
                countdown.hidden = true;
                document.getElementById('countdownDone').hidden = false;
                return;
            }
            const values = {
                days: Math.floor(diff / 864e5),
                hours: Math.floor(diff / 36e5) % 24,
                minutes: Math.floor(diff / 6e4) % 60,
                seconds: Math.floor(diff / 1e3) % 60
            };
            Object.keys(values).forEach((unit) => {
                nums[unit].textContent = String(values[unit]);
                labels[unit].textContent = plural(values[unit], forms[unit]);
            });
        };
        tick();
        timer = setInterval(tick, 1000);
    }

    // Старый service worker кэшировал сайт и показывал устаревшие версии — отключаем его у тех, у кого он остался
    if ('serviceWorker' in navigator) {
        navigator.serviceWorker.getRegistrations()
            .then((regs) => regs.forEach((reg) => reg.unregister()))
            .catch(() => {});
    }
})();
