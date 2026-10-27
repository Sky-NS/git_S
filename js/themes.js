// Варианты цветового оформления для выбора. Переключаются кнопкой с тремя полосками,
// выбор запоминается в браузере. Когда цвета утвердят, оставьте одну тему и перенесите её значения в :root в css/style.css.
(function () {
    'use strict';

    // bg — фон страницы, paper — бумага страниц паспорта, accent — обложка и тёмные блоки,
    // field2 и field3 — цветные разделы, palette — палитра дресс-кода
    const THEMES = [
        {
            id: 'sage',
            name: 'Шалфей и пудра',
            colors: { bg: '#a6b3bc', paper: '#ecebe7', ink: '#1c1c1c', muted: '#38424a', accent: '#2c3620', accentInk: '#e3e2da', field2: '#b7c8be', field3: '#d6c4b8' },
            palette: [['#38424a', 'графит'], ['#a6b3bc', 'сланец'], ['#b7c8be', 'шалфей'], ['#d6c4b8', 'пудра'], ['#2c3620', 'олива']]
        },
        {
            id: 'sky',
            name: 'Небо',
            colors: { bg: '#b3c0d2', paper: '#f2f3f5', ink: '#1b2130', muted: '#3c4558', accent: '#2f3d57', accentInk: '#e6e9ef', field2: '#cbd7e6', field3: '#dfe2e7' },
            palette: [['#4b4a4f', 'графит'], ['#5d7194', 'деним'], ['#8fa5cc', 'небо'], ['#cfe0ee', 'облако'], ['#f3efdc', 'ваниль']]
        },
        {
            id: 'rose',
            name: 'Пыльная роза',
            colors: { bg: '#c9b3b1', paper: '#f6efec', ink: '#2a1c1e', muted: '#55393d', accent: '#5a2f36', accentInk: '#f1e3e1', field2: '#e1cdc9', field3: '#d9c6b9' },
            palette: [['#5a3e42', 'вишня'], ['#a5767b', 'роза'], ['#cfa6aa', 'пудра'], ['#ecd9d6', 'зефир'], ['#f6efe6', 'крем']]
        },
        {
            id: 'sand',
            name: 'Песок и сафари',
            colors: { bg: '#c4b7a4', paper: '#f6f1e8', ink: '#251d15', muted: '#4c4033', accent: '#4a3b2c', accentInk: '#efe6d8', field2: '#ddd2c1', field3: '#cdc3ae' },
            palette: [['#4c4033', 'кофе'], ['#8a7560', 'карамель'], ['#c8b49c', 'песок'], ['#e6dccd', 'латте'], ['#f8f3ea', 'молоко']]
        },
        {
            id: 'night',
            name: 'Ночной рейс',
            colors: { bg: '#9aa3b4', paper: '#f4f1ea', ink: '#141a26', muted: '#333c4f', accent: '#1f2a3f', accentInk: '#e2cfa3', field2: '#c3c9d5', field3: '#d9c9a6' },
            palette: [['#1f2a3f', 'полночь'], ['#34445f', 'индиго'], ['#b9975c', 'золото'], ['#d9c9a6', 'шампань'], ['#f4f1ea', 'жемчуг']]
        },
        {
            id: 'lavender',
            name: 'Лаванда',
            colors: { bg: '#b7b0c8', paper: '#f4f2f6', ink: '#211d2b', muted: '#433d57', accent: '#3f3757', accentInk: '#ebe7f2', field2: '#d3cee1', field3: '#ddd2d8' },
            palette: [['#4a4360', 'слива'], ['#837a9e', 'лаванда'], ['#b3abcb', 'сирень'], ['#e2dcec', 'туман'], ['#f6f2ea', 'сливки']]
        },
        {
            id: 'terracotta',
            name: 'Терракота',
            colors: { bg: '#cbae9e', paper: '#f7f1e8', ink: '#2a1b14', muted: '#55382c', accent: '#6b3a27', accentInk: '#f4e4d8', field2: '#e3cdbf', field3: '#d8c6b2' },
            palette: [['#5e3a2c', 'корица'], ['#a86f56', 'терракота'], ['#d4a387', 'персик'], ['#eed8c6', 'абрикос'], ['#f7f1e8', 'хлопок']]
        },
        {
            id: 'ocean',
            name: 'Морская волна',
            colors: { bg: '#a2bec0', paper: '#f2f5f3', ink: '#142527', muted: '#2c4a4f', accent: '#1f4a50', accentInk: '#e1efee', field2: '#c5dbda', field3: '#dad5c6' },
            palette: [['#24434a', 'глубина'], ['#4f8088', 'бирюза'], ['#93bcc0', 'лагуна'], ['#d2e6e4', 'бриз'], ['#f5f0e4', 'песок']]
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
        root.style.setProperty('--bg', c.bg);
        root.style.setProperty('--paper', c.paper);
        root.style.setProperty('--ink', c.ink);
        root.style.setProperty('--muted', c.muted);
        root.style.setProperty('--accent', c.accent);
        root.style.setProperty('--accent-ink', c.accentInk);
        root.style.setProperty('--field-2', c.field2);
        root.style.setProperty('--field-3', c.field3);
        const meta = document.querySelector('meta[name="theme-color"]');
        if (meta) meta.setAttribute('content', c.accent);
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
