(function () {
    'use strict';

    const config = window.WEDDING_CONFIG || {};
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    // Появление блоков при прокрутке: внутри секции элементы выходят друг за другом
    const revealEls = document.querySelectorAll('.reveal');
    document.querySelectorAll('section').forEach((section) => {
        section.querySelectorAll('.reveal').forEach((el, i) => {
            el.style.setProperty('--delay', `${Math.min(i, 4) * 80}ms`);
        });
    });
    if (reducedMotion || !('IntersectionObserver' in window)) {
        revealEls.forEach((el) => el.classList.add('is-visible'));
    } else {
        const observer = new IntersectionObserver((entries) => {
            entries.forEach((entry) => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('is-visible');
                    observer.unobserve(entry.target);
                }
            });
        }, { threshold: 0.15, rootMargin: '0px 0px -40px 0px' });
        revealEls.forEach((el) => observer.observe(el));
    }

    // Самолёт вокруг глобуса — SMIL-анимация, CSS её не останавливает
    if (reducedMotion) {
        document.querySelectorAll('.globe').forEach((svg) => svg.pauseAnimations());
    }

    // Фото, которых ещё нет в assets/, просто не показываем — остаётся заглушка
    document.querySelectorAll('img[data-optional]').forEach((img) => {
        const drop = () => {
            const wrap = img.closest('[data-optional-wrap]');
            if (wrap) {
                // вместе с фото убираем подпись и строку автора
                document.querySelectorAll(`[data-credit="${wrap.dataset.optionalWrap}"]`).forEach((el) => el.remove());
                wrap.remove();
            } else {
                img.remove();
            }
        };
        if (img.complete && img.naturalWidth === 0) drop();
        else img.addEventListener('error', drop);
    });

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

    // План полёта: пунктирный маршрут-змейка между пунктами и самолёт, летящий по нему при прокрутке
    const plan = document.querySelector('.plan');
    if (plan) {
        const svg = plan.querySelector('.plan__route');
        const path = plan.querySelector('.plan__path');
        const marks = plan.querySelector('.plan__marks');
        const plane = plan.querySelector('.plan__plane');
        const pinStart = plan.querySelector('.plan__pin--start');
        const pinEnd = plan.querySelector('.plan__pin--end');
        const items = plan.querySelectorAll('.plan__item');
        const NS = 'http://www.w3.org/2000/svg';
        let length = 0;

        const layout = () => {
            const w = plan.clientWidth;
            const h = plan.clientHeight;
            if (!w || !h) return;
            svg.setAttribute('viewBox', `0 0 ${w} ${h}`);

            // Текст пункта с одной стороны — маршрут проходит с другой
            const points = [[w / 2, 14]];
            items.forEach((item, i) => {
                const y = item.offsetTop + item.offsetHeight / 2;
                points.push([i % 2 === 0 ? w * 0.62 : w * 0.38, y]);
            });
            points.push([w / 2, h - 14]);

            let d = `M${points[0][0]} ${points[0][1]}`;
            for (let i = 1; i < points.length; i++) {
                const [x0, y0] = points[i - 1];
                const [x1, y1] = points[i];
                const dy = (y1 - y0) / 2;
                d += ` C${x0} ${y0 + dy} ${x1} ${y1 - dy} ${x1} ${y1}`;
            }
            path.setAttribute('d', d);
            length = path.getTotalLength();

            marks.replaceChildren(...points.slice(1, -1).map(([x, y]) => {
                const dot = document.createElementNS(NS, 'circle');
                dot.setAttribute('cx', x);
                dot.setAttribute('cy', y);
                dot.setAttribute('r', 3);
                return dot;
            }));

            const pinSize = 22;
            pinStart.setAttribute('x', points[0][0] - pinSize / 2);
            pinStart.setAttribute('y', points[0][1] - pinSize);
            pinEnd.setAttribute('x', points[points.length - 1][0] - pinSize / 2);
            pinEnd.setAttribute('y', points[points.length - 1][1] - pinSize);

            movePlane();
        };

        const movePlane = () => {
            if (!length) return;
            const rect = plan.getBoundingClientRect();
            const start = window.innerHeight * 0.75;
            const progress = Math.min(1, Math.max(0, (start - rect.top) / rect.height));
            const at = Math.max(1, Math.min(length - 1, length * progress));
            const p = path.getPointAtLength(at);
            const ahead = path.getPointAtLength(Math.min(length, at + 1));
            const behind = path.getPointAtLength(Math.max(0, at - 1));
            const angle = Math.atan2(ahead.y - behind.y, ahead.x - behind.x) * 180 / Math.PI;
            // Иконка самолёта смотрит вверх, поэтому +90°
            plane.setAttribute('transform', `translate(${p.x} ${p.y}) rotate(${angle + 90})`);
        };

        let frame = 0;
        window.addEventListener('scroll', () => {
            if (frame) return;
            frame = requestAnimationFrame(() => {
                frame = 0;
                movePlane();
            });
        }, { passive: true });

        if ('ResizeObserver' in window) new ResizeObserver(layout).observe(plan);
        else window.addEventListener('resize', layout);
        layout();
    }

    // Старый service worker кэшировал сайт и показывал устаревшие версии — отключаем его у тех, у кого он остался
    if ('serviceWorker' in navigator) {
        navigator.serviceWorker.getRegistrations()
            .then((regs) => regs.forEach((reg) => reg.unregister()))
            .catch(() => {});
    }
})();
