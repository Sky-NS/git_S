
base = "/mnt/agents/output/anokhin-airways"

rsvp_js = '''/**
 * ANOKHIN AIRWAYS — RSVP Form
 * Passenger registration and boarding pass generation
 * 
 * Telegram Bot Integration (commented, ready for activation):
 * =============================================================
 * To enable Telegram notifications:
 * 1. Create a bot via @BotFather
 * 2. Set BOT_TOKEN and CHAT_ID below
 * 3. Uncomment the sendTelegramMessage function call in handleSubmit
 */

(function() {
    'use strict';

    // Telegram Bot Configuration — uncomment and fill to activate
    // const TELEGRAM_CONFIG = {
    //     botToken: 'YOUR_BOT_TOKEN_HERE',
    //     chatId: 'YOUR_CHAT_ID_HERE',
    //     apiUrl: 'https://api.telegram.org/bot'
    // };

    const form = document.getElementById('rsvpForm');
    const success = document.getElementById('rsvpSuccess');
    const successPass = document.getElementById('rsvpSuccessPass');
    const submitBtn = document.getElementById('rsvpSubmit');

    if (!form) return;

    // Phone mask
    const phoneInput = document.getElementById('rsvpPhone');
    if (phoneInput) {
        phoneInput.addEventListener('input', function(e) {
            let value = e.target.value.replace(/\\D/g, '');
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

        if (!phone || !phone.value.trim() || phone.value.replace(/\\D/g, '').length < 11) {
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
        const now = new Date();
        const dateStr = now.toLocaleDateString('ru-RU', { day: '2-digit', month: '2-digit', year: '2-digit' });
        
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
                            <span class="bp-detail-value" style="font-size:0.75rem;">${data.meal}</span>
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

    /*
    async function sendTelegramMessage(data) {
        if (!TELEGRAM_CONFIG) return;
        
        const text = `
            <b>Новая регистрация на рейс AA-0808</b>
            
            <b>Пассажир:</b> ${data.name}
            <b>Телефон:</b> ${data.phone}
            <b>Питание:</b> ${data.meal}
            <b>Бар:</b> ${data.bar.join(', ') || 'Не указано'}
            <b>Комментарий:</b> ${data.comments || 'Нет'}
        `;
        
        try {
            await fetch(`${TELEGRAM_CONFIG.apiUrl}${TELEGRAM_CONFIG.botToken}/sendMessage`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    chat_id: TELEGRAM_CONFIG.chatId,
                    text: text,
                    parse_mode: 'HTML'
                })
            });
        } catch (err) {
            console.error('Telegram notification failed:', err);
        }
    }
    */

    function handleSubmit(e) {
        e.preventDefault();
        
        const validation = validateForm();
        if (!validation.isValid) {
            // Show first error
            const firstError = validation.errors[0];
            // Create temporary error message
            const errorEl = document.createElement('div');
            errorEl.textContent = firstError;
            errorEl.style.cssText = 'color:#C47474;font-size:0.75rem;margin-top:0.5rem;text-align:center;';
            form.appendChild(errorEl);
            setTimeout(() => errorEl.remove(), 3000);
            return;
        }

        // Collect data
        const formData = new FormData(form);
        const data = {
            name: formData.get('name'),
            phone: formData.get('phone'),
            meal: formData.get('meal'),
            bar: formData.getAll('bar'),
            comments: formData.get('comments')
        };

        // Show loading state
        const originalText = submitBtn.querySelector('.rsvp-submit-text').textContent;
        submitBtn.querySelector('.rsvp-submit-text').textContent = 'Обработка...';
        submitBtn.disabled = true;

        // Simulate processing
        setTimeout(() => {
            // Hide form, show success
            form.style.display = 'none';
            success.style.display = 'block';
            
            // Generate personalized boarding pass
            if (successPass) {
                successPass.innerHTML = generateBoardingPass(data);
            }

            // Uncomment to enable Telegram notifications:
            // sendTelegramMessage(data);

            // Scroll to success
            success.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }, 1200);
    }

    form.addEventListener('submit', handleSubmit);

    // Reset error states on input
    form.querySelectorAll('.rsvp-input').forEach(input => {
        input.addEventListener('input', function() {
            this.style.borderColor = '';
        });
    });
})();
'''

with open(f"{base}/js/rsvp.js", "w", encoding="utf-8") as f:
    f.write(rsvp_js)

print("js/rsvp.js created:", len(rsvp_js), "chars")