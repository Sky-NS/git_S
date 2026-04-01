// ==============================
// Общие функции для всего сайта
// ==============================

// ── Service Worker: регистрация ──
if ('serviceWorker' in navigator) {
    window.addEventListener('load', async () => {
        try {
            const reg = await navigator.serviceWorker.register('./sw.js');
            console.log('[App] Service Worker зарегистрирован');

            // Слушаем обновления от SW
            navigator.serviceWorker.addEventListener('message', event => {
                if (event.data?.type === 'CACHE_REFRESHED') {
                    console.log('[App] Кэш успешно обновлён');
                    showToast('✅ Страницы обновлены для офлайн-режима');
                }
            });
        } catch (err) {
            console.error('[App] Service Worker: ошибка регистрации', err);
        }
    });
}

// ── PWA: баннер «Добавить на рабочий стол» ──
let deferredInstallPrompt = null;

window.addEventListener('beforeinstallprompt', e => {
    e.preventDefault();
    deferredInstallPrompt = e;

    // Показываем баннер, если пользователь не отказался ранее
    if (!localStorage.getItem('pwa-dismissed')) {
        setTimeout(showInstallBanner, 2000); // Небольшая задержка для UX
    }
});

function showInstallBanner() {
    if (document.getElementById('pwa-banner')) return; // уже показан

    const banner = document.createElement('div');
    banner.id = 'pwa-banner';
    banner.innerHTML = `
        <div style="display:flex; align-items:center; gap:12px; flex-wrap:wrap;">
            <span style="font-size:1.5rem;">📱</span>
            <div style="flex:1; min-width:160px;">
                <div style="font-weight:600; font-size:0.95rem;">Добавить на рабочий стол</div>
                <div style="font-size:0.82rem; opacity:0.85;">Работает без интернета</div>
            </div>
            <button id="pwa-install-btn" style="
                background:#b03e3e; color:white; border:none; padding:8px 18px;
                border-radius:8px; font-weight:600; cursor:pointer; font-size:0.9rem;
                transition:background 0.2s;
            ">Установить</button>
            <button id="pwa-dismiss-btn" style="
                background:transparent; color:white; border:1px solid rgba(255,255,255,0.4);
                padding:8px 12px; border-radius:8px; cursor:pointer; font-size:0.9rem;
            ">✕</button>
        </div>
    `;
    banner.style.cssText = `
        position: fixed;
        bottom: 20px;
        left: 50%;
        transform: translateX(-50%);
        background: linear-gradient(135deg, #1a1a1a, #2d2d2d);
        color: white;
        padding: 16px 20px;
        border-radius: 16px;
        box-shadow: 0 8px 32px rgba(0,0,0,0.3);
        z-index: 9999;
        width: calc(100% - 40px);
        max-width: 480px;
        animation: slideUp 0.4s ease;
    `;

    document.body.appendChild(banner);

    document.getElementById('pwa-install-btn').addEventListener('click', async () => {
        if (!deferredInstallPrompt) return;
        deferredInstallPrompt.prompt();
        const choice = await deferredInstallPrompt.userChoice;
        if (choice.outcome === 'accepted') {
            showToast('🎉 Приложение установлено!');
        }
        deferredInstallPrompt = null;
        banner.remove();
    });

    document.getElementById('pwa-dismiss-btn').addEventListener('click', () => {
        localStorage.setItem('pwa-dismissed', 'true');
        banner.remove();
    });
}

// Когда пользователь устанавливает приложение
window.addEventListener('appinstalled', () => {
    showToast('🎉 Добавлено на рабочий стол!');
    deferredInstallPrompt = null;
    const banner = document.getElementById('pwa-banner');
    if (banner) banner.remove();
});

// ── Toast-уведомления ──
function showToast(message, duration = 3000) {
    const existing = document.getElementById('app-toast');
    if (existing) existing.remove();

    const toast = document.createElement('div');
    toast.id = 'app-toast';
    toast.textContent = message;
    toast.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: #1a1a1a;
        color: white;
        padding: 12px 20px;
        border-radius: 10px;
        font-size: 0.9rem;
        font-weight: 500;
        z-index: 10000;
        box-shadow: 0 4px 16px rgba(0,0,0,0.25);
        animation: fadeIn 0.3s ease;
        max-width: 280px;
    `;
    document.body.appendChild(toast);
    setTimeout(() => toast.style.opacity = '0', duration - 400);
    setTimeout(() => toast?.remove(), duration);
}

// ── Кнопка «Наверх» ──
function initBackToTop() {
    const btn = document.createElement('button');
    btn.innerHTML = '⬆';
    btn.id = 'back-to-top';
    btn.setAttribute('aria-label', 'Наверх');
    btn.style.cssText = `
        position: fixed;
        bottom: 80px;
        right: 20px;
        width: 46px;
        height: 46px;
        border-radius: 50%;
        background: #b03e3e;
        color: white;
        border: none;
        font-size: 1.2rem;
        cursor: pointer;
        display: none;
        z-index: 1000;
        box-shadow: 0 4px 12px rgba(176,62,62,0.35);
        transition: opacity 0.3s, transform 0.2s;
    `;

    btn.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));
    btn.addEventListener('mouseenter', () => btn.style.transform = 'scale(1.1)');
    btn.addEventListener('mouseleave', () => btn.style.transform = 'scale(1)');
    document.body.appendChild(btn);

    window.addEventListener('scroll', () => {
        btn.style.display = window.scrollY > 300 ? 'block' : 'none';
    });
}

// ── Сохранение курсов вручную в localStorage ──
function saveRatesToLocalStorage() {
    const jpyRate = document.getElementById('jpyRate');
    const cnyRate = document.getElementById('cnyRate');
    if (!jpyRate && !cnyRate) return;

    if (jpyRate) {
        jpyRate.addEventListener('change', () => localStorage.setItem('userJpyRate', jpyRate.value));
        const saved = localStorage.getItem('userJpyRate');
        if (saved) jpyRate.value = saved;
    }
    if (cnyRate) {
        cnyRate.addEventListener('change', () => localStorage.setItem('userCnyRate', cnyRate.value));
        const saved = localStorage.getItem('userCnyRate');
        if (saved) cnyRate.value = saved;
    }
}

// ── Сворачиваемые блоки ──
function initCollapsibleBlocks() {
    document.querySelectorAll('.collapsible-header').forEach(header => {
        header.addEventListener('click', () => {
            const content = header.nextElementSibling;
            const isExpanded = header.getAttribute('aria-expanded') === 'true';
            header.setAttribute('aria-expanded', !isExpanded);
            content.style.display = isExpanded ? 'none' : 'block';
        });
    });
}

// ── CSS-анимации (добавляем в <head>) ──
const animStyles = document.createElement('style');
animStyles.textContent = `
    @keyframes spin    { to { transform: rotate(360deg); } }
    @keyframes slideUp { from { transform: translateX(-50%) translateY(20px); opacity: 0; }
                         to   { transform: translateX(-50%) translateY(0);    opacity: 1; } }
    @keyframes fadeIn  { from { opacity: 0; transform: translateY(-6px); }
                         to   { opacity: 1; transform: translateY(0);    } }
`;
document.head.appendChild(animStyles);

// ── Инициализация при загрузке ──
document.addEventListener('DOMContentLoaded', () => {
    initBackToTop();
    saveRatesToLocalStorage();
    initCollapsibleBlocks();
});
