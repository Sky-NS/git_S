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

    // Обложка паспорта: при прокрутке первого экрана уменьшается и уходит в левый нижний угол
    const hero = document.querySelector('.hero');
    const passport = document.getElementById('passport');
    if (hero && passport && !reducedMotion) {
        let frame = 0;
        const update = () => {
            frame = 0;
            const rect = hero.getBoundingClientRect();
            const span = rect.height - window.innerHeight;
            const p = span > 0 ? Math.min(1, Math.max(0, -rect.top / span)) : 0;
            // На телефоне обложка остаётся крупнее, иначе экран пустеет
            const scale = 1 - p * (window.innerWidth < 760 ? 0.5 : 0.72);
            const stageHeight = passport.parentElement.clientHeight;
            // Сдвигаем к левому нижнему краю сцены с отступом 24px; точка трансформации — левый нижний угол
            const dx = -(passport.offsetLeft - 24) * p;
            const dy = (stageHeight - passport.offsetTop - passport.offsetHeight - 24) * p;
            passport.style.transform = p ? `translate(${dx}px, ${dy}px) scale(${scale})` : '';
        };
        window.addEventListener('scroll', () => {
            if (!frame) frame = requestAnimationFrame(update);
        }, { passive: true });
        window.addEventListener('resize', update);
        update();
    }

    // Старый service worker кэшировал сайт и показывал устаревшие версии — отключаем его у тех, у кого он остался
    if ('serviceWorker' in navigator) {
        navigator.serviceWorker.getRegistrations()
            .then((regs) => regs.forEach((reg) => reg.unregister()))
            .catch(() => {});
    }
})();
