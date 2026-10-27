// Варианты цветового оформления для выбора. Переключаются кнопкой с тремя полосками,
// выбор запоминается в браузере. Когда цвета утвердят, оставьте одну тему и перенесите её значения в :root в css/style.css.
(function () {
    'use strict';

    const THEMES = [
        {
            id: 'sky',
            name: 'Небо',
            colors: { sky: '#6c81a3', skyDeep: '#56698a', skySoft: '#8fa5cc', ink: '#3d4b66', inkSoft: '#6b7890', cloud: '#e8ecf2' },
            palette: [
                ['#4b4a4f', 'графит'], ['#5d7194', 'деним'], ['#8fa5cc', 'небо'], ['#cfe0ee', 'облако'], ['#f3efdc', 'ваниль']
            ]
        },
        {
            id: 'sage',
            name: 'Шалфей',
            colors: { sky: '#738c79', skyDeep: '#58705e', skySoft: '#a3baa8', ink: '#3b4a3f', inkSoft: '#69786d', cloud: '#eaeee9' },
            palette: [
                ['#3f4a42', 'хвоя'], ['#6b8571', 'шалфей'], ['#a3baa8', 'олива'], ['#dbe5d8', 'мята'], ['#f4efe2', 'лён']
            ]
        },
        {
            id: 'rose',
            name: 'Пыльная роза',
            colors: { sky: '#a5767b', skyDeep: '#85575d', skySoft: '#cfa6aa', ink: '#553a3e', inkSoft: '#86696c', cloud: '#f3ebea' },
            palette: [
                ['#5a3e42', 'вишня'], ['#a5767b', 'роза'], ['#cfa6aa', 'пудра'], ['#ecd9d6', 'зефир'], ['#f6efe6', 'крем']
            ]
        },
        {
            id: 'sand',
            name: 'Песок и сафари',
            colors: { sky: '#998570', skyDeep: '#7a6754', skySoft: '#c8b49c', ink: '#4c4033', inkSoft: '#7c6f61', cloud: '#f1ece4' },
            palette: [
                ['#4c4033', 'кофе'], ['#8a7560', 'карамель'], ['#c8b49c', 'песок'], ['#e6dccd', 'латте'], ['#f8f3ea', 'молоко']
            ]
        },
        {
            id: 'night',
            name: 'Ночной рейс',
            colors: { sky: '#34445f', skyDeep: '#2a3850', skySoft: '#b9975c', ink: '#26324a', inkSoft: '#5f6a80', cloud: '#e7e9ef' },
            palette: [
                ['#1f2a3f', 'полночь'], ['#34445f', 'индиго'], ['#b9975c', 'золото'], ['#d9c9a6', 'шампань'], ['#f4f1ea', 'жемчуг']
            ]
        }
    ];

    const STORAGE_KEY = 'wedding-theme';
    const root = document.documentElement;

    function readSaved() {
        const fromUrl = new URLSearchParams(location.search).get('theme');
        if (fromUrl) return fromUrl;
        try {
            return localStorage.getItem(STORAGE_KEY);
        } catch {
            return null;
        }
    }

    function save(id) {
        try {
            localStorage.setItem(STORAGE_KEY, id);
        } catch {
            // приватный режим — просто не запоминаем
        }
    }

    function renderPalette(theme) {
        const list = document.getElementById('palette');
        if (!list) return;
        list.replaceChildren(...theme.palette.map(([color, name]) => {
            const item = document.createElement('li');
            const swatch = document.createElement('span');
            swatch.className = 'palette__swatch';
            swatch.style.setProperty('--c', color);
            const label = document.createElement('span');
            label.textContent = name;
            item.append(swatch, label);
            return item;
        }));
    }

    let current = THEMES.find((t) => t.id === readSaved()) || THEMES[0];

    function apply(theme) {
        current = theme;
        const c = theme.colors;
        root.style.setProperty('--sky', c.sky);
        root.style.setProperty('--sky-deep', c.skyDeep);
        root.style.setProperty('--sky-soft', c.skySoft);
        root.style.setProperty('--ink', c.ink);
        root.style.setProperty('--ink-soft', c.inkSoft);
        root.style.setProperty('--cloud', c.cloud);
        const meta = document.querySelector('meta[name="theme-color"]');
        if (meta) meta.setAttribute('content', c.sky);
        renderPalette(theme);
        document.querySelectorAll('.theme-switch__option').forEach((btn) => {
            btn.setAttribute('aria-pressed', String(btn.dataset.theme === theme.id));
        });
    }

    // Применяем сразу, ещё до отрисовки страницы, чтобы не было мигания цветов
    apply(current);

    function initMenu() {
        renderPalette(current);

        const toggle = document.getElementById('themeToggle');
        const panel = document.getElementById('themePanel');
        const options = document.getElementById('themeOptions');
        if (!toggle || !panel || !options) return;

        options.replaceChildren(...THEMES.map((theme) => {
            const btn = document.createElement('button');
            btn.type = 'button';
            btn.className = 'theme-switch__option';
            btn.dataset.theme = theme.id;
            btn.setAttribute('aria-pressed', String(theme.id === current.id));

            const dots = document.createElement('span');
            dots.className = 'theme-switch__dots';
            dots.setAttribute('aria-hidden', 'true');
            theme.palette.forEach(([color]) => {
                const dot = document.createElement('i');
                dot.style.setProperty('--c', color);
                dots.append(dot);
            });

            const name = document.createElement('span');
            name.className = 'theme-switch__name';
            name.textContent = theme.name;

            btn.append(dots, name);
            btn.addEventListener('click', () => {
                apply(theme);
                save(theme.id);
            });
            return btn;
        }));

        const setOpen = (open) => {
            panel.hidden = !open;
            toggle.setAttribute('aria-expanded', String(open));
        };

        toggle.addEventListener('click', () => setOpen(panel.hidden));
        document.addEventListener('click', (e) => {
            if (!panel.hidden && !e.target.closest('.theme-switch')) setOpen(false);
        });
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && !panel.hidden) {
                setOpen(false);
                toggle.focus();
            }
        });
    }

    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', initMenu);
    else initMenu();
})();
