/**
 * ANOKHIN AIRWAYS — RSVP Form
 * Passenger registration with Telegram Bot integration
 */

(function() {
    'use strict';

    /* ============================================================
       КОНФИГУРАЦИЯ
       Заполните ВСЕ три поля перед деплоем:
    ============================================================ */
    const TELEGRAM_CONFIG = {
        botToken: '8803511552:AAERxYUUC40ddSXp3iHnFehcB_gt4MzCUVo',      // <-- Токен от @BotFather
        chatId: '439194326',       // <-- Ваш chat_id

        /*
           ВЫБЕРИТЕ ОДИН proxyUrl в зависимости от хостинга:

           1. NETLIFY (просто залейте папку):
              proxyUrl: '/.netlify/functions/telegram'

           2. GITHUB PAGES + Google Apps Script:
              proxyUrl: 'https://script.google.com/macros/s/ВАШ_КОД/exec'
              (см. файл google-apps-script.js)

           3. GITHUB PAGES + Cloudflare Worker:
              proxyUrl: 'https://your-worker.your-subdomain.workers.dev'
              (см. файл cloudflare-worker.js)

           4. Обычный хостинг с PHP:
              proxyUrl: 'https://yourdomain.com/api/telegram.php'
              (см. файл api/telegram.php)
        */
        proxyUrl: 'https://rough-mouse-57e1.skynik100usa.workers.dev/'
    };

    const form = document.getElementById('rsvpForm');
    const success = document.getElementById('rsvpSuccess');
    const successPass = document.getElementById('rsvpSuccessPass');
    const submitBtn = document.getElementById('rsvpSubmit');

    if (!form) return;

    // Phone mask
    const phoneInput = document.getElementById('rsvpPhone');
    if (phoneInput) {
        phoneInput.addEventListener('input', function(e) {
            let value = e.target.value.replace(/\D/g, '');
            if (value.startsWith('7')) value = value.substring(1);
            if (value.startsWith('8')) value = value.substring(1);
            let formatted = '+7';
            if (value.length > 0) formatted += ' (' + value.substring(0, 3);
            if (value.length >= 3) formatted += ')';
            if (value.length > 3) formatted += ' ' + value.substring(3, 6);
            if (value.length > 6) formatted += '-' + value.substring(6, 8);
            if (value.length > 8) formatted += '-' + value.substring(8, 10);
            e.target.value = formatted;
        });
    }

    function validateForm() {
        const name = form.querySelector('#rsvpName');
        const phone = form.querySelector('#rsvpPhone');
        const meal = form.querySelector('input[name="meal"]:checked');
        let isValid = true;
        let errors = [];

        if (!name || !name.value.trim()) {
            isValid = false;
            errors.push('Укажите имя пассажира');
            name.style.borderColor = '#C47474';
        } else if (name) {
            name.style.borderColor = '';
        }

        if (!phone || !phone.value.trim() || phone.value.replace(/\D/g, '').length < 11) {
            isValid = false;
            errors.push('Укажите корректный номер телефона');
            phone.style.borderColor = '#C47474';
        } else if (phone) {
            phone.style.borderColor = '';
        }

        if (!meal) {
            isValid = false;
            errors.push('Выберите предпочтения в питании');
        }

        return { isValid, errors };
    }

    function generateBoardingPass(data) {
        const passengerName = data.name.toUpperCase();

        return `
            <div class="boarding-pass" style="margin-top:2rem;transform:scale(0.9);">
                <div class="bp-left" style="padding:1.5rem;">
                    <div class="bp-airline">
                        <svg viewBox="0 0 40 40" fill="none" width="20" height="20">
                            <path d="M20 2L24 14L36 14L26 22L30 34L20 26L10 34L14 22L4 14L16 14L20 2Z" stroke="#D7B26D" stroke-width="1.5" fill="none"/>
                            <circle cx="20" cy="20" r="3" fill="#D7B26D"/>
                        </svg>
                        <span style="font-size:0.5rem;">ANOKHIN AIRWAYS</span>
                    </div>
                    <div class="bp-route" style="padding:1rem 0;">
                        <div class="bp-city">
                            <span class="bp-city-code" style="font-size:1.75rem;">DME</span>
                            <span class="bp-city-name">Moscow</span>
                        </div>
                        <div class="bp-route-line">
                            <svg viewBox="0 0 100 20" fill="none" style="max-width:80px;">
                                <path d="M5 10H95" stroke="#D7B26D" stroke-width="0.5" stroke-dasharray="3 3"/>
                                <path d="M85 5L95 10L85 15" stroke="#D7B26D" stroke-width="1" fill="none"/>
                            </svg>
                            <span class="bp-flight-num">AA-0808</span>
                        </div>
                        <div class="bp-city">
                            <span class="bp-city-code" style="font-size:1.75rem;">4VR</span>
                            <span class="bp-city-name">Forever</span>
                        </div>
                    </div>
                    <div class="bp-details" style="grid-template-columns:repeat(3,1fr);gap:1rem;">
                        <div class="bp-detail">
                            <span class="bp-detail-label">Пассажир</span>
                            <span class="bp-detail-value" style="font-size:0.75rem;">${passengerName}</span>
                        </div>
                        <div class="bp-detail">
                            <span class="bp-detail-label">Класс</span>
                            <span class="bp-detail-value">Business</span>
                        </div>
                        <div class="bp-detail">
                            <span class="bp-detail-label">Питание</span>
                            <span class="bp-detail-value" style="font-size:0.75rem;">${data.mealLabel}</span>
                        </div>
                        <div class="bp-detail">
                            <span class="bp-detail-label">Выход</span>
                            <span class="bp-detail-value">A1</span>
                        </div>
                        <div class="bp-detail">
                            <span class="bp-detail-label">Место</span>
                            <span class="bp-detail-value">01A</span>
                        </div>
                        <div class="bp-detail">
                            <span class="bp-detail-label">Дата</span>
                            <span class="bp-detail-value">08.08.27</span>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }

    async function sendTelegramMessage(data) {
        if (!TELEGRAM_CONFIG.botToken || TELEGRAM_CONFIG.botToken.includes('ВАШ_')) {
            console.warn('Telegram: токен не настроен');
            return false;
        }
        if (!TELEGRAM_CONFIG.chatId || TELEGRAM_CONFIG.chatId.includes('ВАШ_')) {
            console.warn('Telegram: chat_id не настроен');
            return false;
        }
        if (!TELEGRAM_CONFIG.proxyUrl || TELEGRAM_CONFIG.proxyUrl.includes('ВАШ_')) {
            console.warn('Telegram: proxyUrl не настроен');
            return false;
        }

        const mealLabels = {
            meat: 'Мясо', fish: 'Рыба', poultry: 'Птица', vegetarian: 'Вегетарианское'
        };
        const barLabels = {
            wine: 'Вино', champagne: 'Шампанское', cocktails: 'Коктейли', whiskey: 'Виски', noalcohol: 'Без алкоголя'
        };

        const barText = data.bar.length > 0 
            ? data.bar.map(b => barLabels[b] || b).join(', ') 
            : 'Не указано';

        const text = `
<b>✈️ Новая регистрация на рейс AA-0808</b>

<b>Пассажир:</b> ${data.name}
<b>Телефон:</b> ${data.phone}
<b>Питание:</b> ${mealLabels[data.meal] || data.meal}
<b>Бар:</b> ${barText}
<b>Комментарий:</b> ${data.comments || 'Нет'}

<i>Дата регистрации:</i> ${new Date().toLocaleString('ru-RU')}
        `.trim();

        try {
            const response = await fetch(TELEGRAM_CONFIG.proxyUrl, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    botToken: TELEGRAM_CONFIG.botToken,
                    chatId: TELEGRAM_CONFIG.chatId,
                    text: text
                })
            });

            if (!response.ok) {
                throw new Error(`HTTP ${response.status}`);
            }

            const result = await response.json();
            return result.ok;

        } catch (err) {
            console.error('Telegram proxy error:', err);
            return false;
        }
    }

    function showFallbackNotification(data) {
        const mealLabels = {
            meat: 'Мясо', fish: 'Рыба', poultry: 'Птица', vegetarian: 'Вегетарианское'
        };
        const barLabels = {
            wine: 'Вино', champagne: 'Шампанское', cocktails: 'Коктейли', whiskey: 'Виски', noalcohol: 'Без алкоголя'
        };

        const message = `
Новая регистрация на рейс AA-0808:

Пассажир: ${data.name}
Телефон: ${data.phone}
Питание: ${mealLabels[data.meal] || data.meal}
Бар: ${data.bar.length > 0 ? data.bar.map(b => barLabels[b] || b).join(', ') : 'Не указано'}
Комментарий: ${data.comments || 'Нет'}
        `.trim();

        if (navigator.clipboard) {
            navigator.clipboard.writeText(message).catch(() => {});
        }

        const fallbackEl = document.createElement('div');
        fallbackEl.style.cssText = `
            position: fixed;
            bottom: 2rem;
            left: 50%;
            transform: translateX(-50%);
            background: #12233E;
            color: #F8F7F5;
            padding: 1rem 1.5rem;
            border-radius: 4px;
            font-size: 0.8125rem;
            line-height: 1.5;
            max-width: 400px;
            text-align: center;
            z-index: 10000;
            border: 1px solid rgba(215,178,109,0.3);
        `;
        fallbackEl.innerHTML = `
            <div style="color:#D7B26D; font-weight:500; margin-bottom:0.5rem;">Telegram недоступен</div>
            <div style="color:rgba(248,247,245,0.7);">Данные скопированы в буфер обмена. Отправьте их вручную.</div>
        `;
        document.body.appendChild(fallbackEl);
        setTimeout(() => {
            fallbackEl.style.opacity = '0';
            fallbackEl.style.transition = 'opacity 0.5s';
            setTimeout(() => fallbackEl.remove(), 500);
        }, 5000);
    }

    function handleSubmit(e) {
        e.preventDefault();

        const validation = validateForm();
        if (!validation.isValid) {
            const firstError = validation.errors[0];
            const errorEl = document.createElement('div');
            errorEl.textContent = firstError;
            errorEl.style.cssText = 'color:#C47474;font-size:0.75rem;margin-top:0.5rem;text-align:center;';
            form.appendChild(errorEl);
            setTimeout(() => errorEl.remove(), 3000);
            return;
        }

        const formData = new FormData(form);
        const mealLabels = { meat: 'Мясо', fish: 'Рыба', poultry: 'Птица', vegetarian: 'Вегетарианское' };
        const data = {
            name: formData.get('name'),
            phone: formData.get('phone'),
            meal: formData.get('meal'),
            mealLabel: mealLabels[formData.get('meal')] || formData.get('meal'),
            bar: formData.getAll('bar'),
            comments: formData.get('comments')
        };

        const originalText = submitBtn.querySelector('.rsvp-submit-text').textContent;
        submitBtn.querySelector('.rsvp-submit-text').textContent = 'Обработка...';
        submitBtn.disabled = true;

        sendTelegramMessage(data).then((sent) => {
            if (!sent) {
                showFallbackNotification(data);
            }

            form.style.display = 'none';
            success.style.display = 'block';

            if (successPass) {
                successPass.innerHTML = generateBoardingPass(data);
            }

            success.scrollIntoView({ behavior: 'smooth', block: 'center' });
        });
    }

    form.addEventListener('submit', handleSubmit);

    form.querySelectorAll('.rsvp-input').forEach(input => {
        input.addEventListener('input', function() {
            this.style.borderColor = '';
        });
    });
})();
