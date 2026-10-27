(function () {
    'use strict';

    const config = window.WEDDING_CONFIG || {};

    // Тусклые штампы: города, где мы уже побывали вдвоём (без дат — их не выдумываем)
    const TRIPS = [
        ['TOKYO', 'JAPAN'], ['OSAKA', 'JAPAN'], ['KAMAKURA', 'JAPAN'], ['NARA', 'JAPAN'], ['KYOTO', 'JAPAN'],
        ['FUJIKAWAGUCHIKO', 'JAPAN'], ['HAKONE', 'JAPAN'], ['MISHIMA', 'JAPAN'],
        ['SHANGHAI', 'CHINA'], ['BEIJING', 'CHINA'], ["XI'AN", 'CHINA'],
        ['UBUD', 'BALI'], ['KUTA', 'BALI'], ['AMED', 'BALI'], ['DENPASAR', 'BALI'], ['SEMINYAK', 'BALI'],
        ['CANGGU', 'BALI'], ['NUSA DUA', 'BALI'], ['JIMBARAN', 'BALI'], ['SANUR', 'BALI'], ['TABANAN', 'BALI'],
        ['МОСКВА', 'РОССИЯ'], ['САНКТ-ПЕТЕРБУРГ', 'РОССИЯ'], ['НИЖНИЙ НОВГОРОД', 'РОССИЯ'], ['РОСТОВ ВЕЛИКИЙ', 'РОССИЯ'], ['ТАРУСА', 'РОССИЯ']
    ];
    // Места на странице (в процентах), где штампы не спорят с текстом
    const SLOTS = [[54, 4], [4, 58], [50, 66], [14, 80], [58, 36]];
    const SHAPES = ['round', 'rect', 'oval'];
    const INKS = ['violet', 'blue', 'green', 'red', 'black'];
    const groups = document.querySelectorAll('.faint[data-stamps]');
    if (groups.length) {
        const per = Math.ceil(TRIPS.length / groups.length);
        groups.forEach((group, g) => {
            TRIPS.slice(g * per, g * per + per).forEach(([city, country], i) => {
                const n = g * per + i;
                const [x, y] = SLOTS[i % SLOTS.length];
                const el = document.createElement('div');
                el.className = `stamp stamp--${SHAPES[n % 3]} ink-${INKS[n % INKS.length]}`;
                el.style.left = `${x}%`;
                el.style.top = `${y}%`;
                el.style.setProperty('--r', `${((n * 37) % 30) - 15}deg`);
                const b = document.createElement('b');
                b.textContent = city;
                const small = document.createElement('small');
                small.textContent = country;
                el.append(b, small);
                group.append(el);
            });
        });
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
