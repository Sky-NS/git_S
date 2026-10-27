// Паспорт, который листается: страница следует за пальцем, переворачивается на пружине
// и подхватывает скорость жеста. Положение книги — одно число pos:
//  • на телефоне (одна страница) pos — номер видимой страницы 0…11: переход от правой страницы
//    к левой переворачивает лист, от левой к правой — сдвигает книгу;
//  • на широком экране (разворот) pos — число перевёрнутых листов 0…6.
(function () {
    'use strict';

    const book = document.getElementById('book');
    const stage = document.getElementById('stage');
    if (!book || !stage) return;

    const leaves = [...book.querySelectorAll('.leaf')];
    const faces = [...book.querySelectorAll('.face')].sort((a, b) => a.dataset.face - b.dataset.face);
    const N = leaves.length;
    const prevBtn = document.getElementById('prevPage');
    const nextBtn = document.getElementById('nextPage');
    const status = document.getElementById('pageStatus');
    const hint = document.getElementById('hint');
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const RATIO = 88 / 125; // пропорции загранпаспорта

    let single = true;
    let pw = 340;
    let pos = 0;
    let anim = 0;

    const clamp = (v, a, b) => Math.min(b, Math.max(a, v));
    const maxPos = () => (single ? 2 * N - 1 : N);

    // Страница ↔ положение книги
    const faceToPos = (f) => (single ? f : (f % 2 === 0 ? f / 2 : (f + 1) / 2));
    function visibleFaces(p) {
        const r = Math.round(p);
        if (single) return [r];
        const list = [];
        if (r >= 1) list.push(2 * r - 1);
        if (r < N) list.push(2 * r);
        return list;
    }

    // ===== Размеры =====
    function layout() {
        const W = document.documentElement.clientWidth;
        const H = window.innerHeight;
        const chrome = 150; // кнопки и подсказка под книгой
        const spreadW = Math.min((W - 64) / 2, (H - chrome) * RATIO, 520);
        const wasSingle = single;
        single = W < 860 || spreadW < 300;
        pw = single
            ? Math.max(260, Math.min(W - 32, (H - chrome) * RATIO, 460))
            : spreadW;
        stage.style.setProperty('--pw', `${pw}px`);
        stage.style.setProperty('--ph', `${pw / RATIO}px`);
        // На телефоне видна ровно одна страница: соседние не выглядывают по краям
        stage.style.width = single ? `${pw}px` : '';
        stage.style.clipPath = single ? 'inset(-60px 0)' : '';
        if (wasSingle !== single) {
            // Перевести положение между режимами, сохранив видимую страницу
            const face = wasSingle ? Math.round(pos) : visibleFaces(pos).slice(-1)[0];
            pos = clamp(faceToPos(face), 0, maxPos());
        }
        render(pos);
        settle();
    }

    // ===== Отрисовка положения =====
    function render(p) {
        const max = maxPos();
        let shift;
        for (let k = 0; k < N; k++) {
            const t = single ? clamp(p - 2 * k, 0, 1) : clamp(p - k, 0, 1);
            const angle = -180 * t;
            const leaf = leaves[k];
            leaf.style.transform = `rotateY(${angle}deg)`;
            leaf.style.zIndex = t > 0 && t < 1 ? N + 2 : (t >= 1 ? k + 1 : N - k);
            // Затенение: лицевая сторона темнеет, уходя от света, оборотная — пока не легла
            const front = leaf.children[0].querySelector(':scope > .shade');
            const back = leaf.children[1].querySelector(':scope > .shade');
            front.style.opacity = t > 0 && t < 1 ? (t * 0.45).toFixed(3) : 0;
            back.style.opacity = t > 0 && t < 1 ? ((1 - t) * 0.45).toFixed(3) : 0;
        }

        if (single) {
            // cos(π·p): +1 на правой странице, −1 на левой — камера плавно едет между ними
            shift = -Math.cos(Math.PI * p) * pw / 2;
        } else if (p < 1) {
            shift = -(1 - Math.max(p, 0)) * pw / 2; // закрытая книга — обложка по центру
        } else if (p > N - 1) {
            shift = (Math.min(p, N) - (N - 1)) * pw / 2;
        } else {
            shift = 0;
        }
        // Резиновое сопротивление за краями
        if (p < 0) shift += -p * pw * 0.25;
        if (p > max) shift -= (p - max) * pw * 0.25;
        book.style.transform = `translateX(${shift.toFixed(2)}px)`;

        // Тень под книгой — только под видимой частью
        const closedFront = single ? p < 0.5 : p < 0.5;
        const closedBack = p > max - 0.5;
        book.style.setProperty('--shadow-left', closedFront ? '50%' : '0');
        book.style.setProperty('--shadow-right', closedBack ? '50%' : '0');
    }

    // ===== Пружина (как в iOS: коэффициент затухания и время отклика) =====
    function springTo(target, velocity = 0, { damping = 1, response = 0.5 } = {}) {
        cancelAnimationFrame(anim);
        target = clamp(target, 0, maxPos());
        if (reducedMotion) {
            pos = target;
            render(pos);
            settle();
            return;
        }
        const k = Math.pow((2 * Math.PI) / response, 2);
        const c = (4 * Math.PI * damping) / response;
        let x = pos;
        let v = velocity;
        let last = performance.now();
        const step = (now) => {
            // Реальное время, разбитое на мелкие шаги: пружина не замедляется при редких кадрах
            let elapsed = Math.min(0.1, (now - last) / 1000);
            last = now;
            while (elapsed > 0) {
                const dt = Math.min(0.008, elapsed);
                elapsed -= dt;
                const a = -k * (x - target) - c * v;
                v += a * dt;
                x += v * dt;
            }
            if (Math.abs(x - target) < 0.002 && Math.abs(v) < 0.05) {
                pos = target;
                render(pos);
                settle();
                return;
            }
            pos = x;
            render(pos);
            anim = requestAnimationFrame(step);
        };
        anim = requestAnimationFrame(step);
    }

    // ===== После остановки: доступность, счётчик, штампы =====
    const names = {
        0: 'Обложка', 1: 'Владельцу паспорта', 2: 'Страница данных', 3: 'Приглашение',
        4: 'Программа дня', 5: 'Вечерний рейс', 6: 'Виза: Грин Хаус', 7: 'Форма экипажа',
        8: 'Визовая анкета', 9: 'До вылета', 10: 'До встречи', 11: 'Задняя обложка'
    };

    function settle() {
        const visible = visibleFaces(pos);
        faces.forEach((face, i) => {
            const on = visible.includes(i);
            face.inert = !on;
            face.setAttribute('aria-hidden', String(!on));
            if (on) face.classList.add('is-seen');
        });
        const max = maxPos();
        prevBtn.disabled = Math.round(pos) <= 0;
        nextBtn.disabled = Math.round(pos) >= max;
        const label = visible.map((f) => names[f]).join(' · ');
        status.textContent = label;
        if (pos > 0 && hint) hint.classList.add('is-gone');
    }

    function go(delta) {
        springTo(Math.round(pos) + delta);
    }

    function goToFace(face) {
        const target = faceToPos(face);
        // Через несколько листов — быстрее и без лишней пружинистости
        springTo(target, 0, { damping: 1, response: Math.min(0.9, 0.45 + Math.abs(target - pos) * 0.06) });
    }

    // ===== Жест =====
    let drag = null;
    const INTERACTIVE = 'input, textarea, select, button, a, label, .choice';

    stage.addEventListener('pointerdown', (e) => {
        if (drag || e.button !== 0) return; // один палец за раз
        if (e.target.closest(INTERACTIVE)) return;
        drag = {
            id: e.pointerId, x: e.clientX, y: e.clientY,
            start: pos, active: false, history: [], interrupted: anim !== 0
        };
        // Перехват: если страница ещё летит, останавливаем её там, где она сейчас
        cancelAnimationFrame(anim);
        anim = 0;
        drag.start = pos;
    });

    stage.addEventListener('pointermove', (e) => {
        if (!drag || e.pointerId !== drag.id) return;
        const dx = e.clientX - drag.x;
        const dy = e.clientY - drag.y;
        if (!drag.active) {
            if (Math.abs(dy) > 10 && Math.abs(dy) > Math.abs(dx)) { drag = null; return; } // вертикальная прокрутка страницы
            if (Math.abs(dx) < 10) return;
            drag.active = true;
            drag.x = e.clientX; // без рывка после порога
            stage.setPointerCapture(e.pointerId);
        }
        const unit = single ? pw : pw * 1.15;
        let p = drag.start - (e.clientX - drag.x) / unit;
        const max = maxPos();
        // Сопротивление на краях вместо жёсткой остановки
        if (p < 0) p = -rubber(-p);
        if (p > max) p = max + rubber(p - max);
        pos = p;
        render(pos);
        const now = performance.now();
        drag.history.push([now, p]);
        while (drag.history.length > 2 && now - drag.history[0][0] > 100) drag.history.shift();
    });

    function rubber(over) {
        const d = 1;
        return (over * d * 0.55) / (d + 0.55 * over) * 0.5;
    }

    function endDrag(e) {
        if (!drag || e.pointerId !== drag.id) return;
        const d = drag;
        drag = null;
        if (!d.active) {
            // Касание без движения: правая половина — вперёд, левая — назад
            if (d.interrupted) { springTo(Math.round(pos)); return; }
            if (e.type === 'pointercancel' || e.target.closest(INTERACTIVE)) return;
            const rect = stage.getBoundingClientRect();
            const forward = e.clientX > rect.left + rect.width / 2;
            go(forward ? 1 : -1);
            return;
        }
        // Скорость за последние ~100 мс, в страницах в секунду
        const h = d.history;
        let v = 0;
        if (h.length >= 2) {
            const [t0, p0] = h[0];
            const [t1, p1] = h[h.length - 1];
            if (t1 > t0) v = ((p1 - p0) / (t1 - t0)) * 1000;
        }
        // Проекция инерции (как у прокрутки в iOS), но не дальше соседней страницы от начала жеста
        const projected = pos + v * 0.18;
        let target = Math.round(projected);
        const base = Math.round(d.start);
        target = clamp(target, base - 1, base + 1);
        springTo(target, v, { damping: 1, response: 0.5 });
    }

    stage.addEventListener('pointerup', endDrag);
    stage.addEventListener('pointercancel', endDrag);

    // ===== Кнопки, клавиатура, ссылки =====
    prevBtn.addEventListener('click', () => go(-1));
    nextBtn.addEventListener('click', () => go(1));

    document.addEventListener('keydown', (e) => {
        if (e.target.closest('input, textarea')) return;
        if (e.key === 'ArrowRight') { e.preventDefault(); go(1); }
        if (e.key === 'ArrowLeft') { e.preventDefault(); go(-1); }
    });

    document.addEventListener('click', (e) => {
        const link = e.target.closest('[data-goto]');
        if (!link) return;
        e.preventDefault();
        goToFace(Number(link.dataset.goto));
    });

    // Фокус клавиатуры на скрытой странице — открыть её
    book.addEventListener('focusin', (e) => {
        const face = e.target.closest('.face');
        if (face && !visibleFaces(pos).includes(Number(face.dataset.face))) {
            goToFace(Number(face.dataset.face));
        }
    });

    window.addEventListener('resize', layout);

    // Ссылка вида …#rsvp открывает паспорт сразу на анкете
    if (location.hash === '#rsvp') {
        layout();
        pos = faceToPos(8);
        render(pos);
        settle();
    } else {
        layout();
    }
})();
