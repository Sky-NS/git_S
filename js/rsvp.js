(function () {
    'use strict';

    const config = window.WEDDING_CONFIG || {};
    const form = document.getElementById('rsvpForm');
    if (!form) return;

    const nameInput = document.getElementById('rsvpName');
    const phoneInput = document.getElementById('rsvpPhone');
    const attendingBlock = document.getElementById('rsvpAttending');
    const attendanceChoices = form.querySelector('input[name="attendance"]').closest('.choices');
    const errorBox = document.getElementById('rsvpError');
    const submitBtn = document.getElementById('rsvpSubmit');
    const done = document.getElementById('rsvpDone');

    // Если гость не придёт, вопросы про спутников и напитки не нужны
    form.addEventListener('change', (e) => {
        if (e.target.name !== 'attendance') return;
        attendingBlock.hidden = e.target.value === 'no';
        attendanceChoices.removeAttribute('aria-invalid');
    });

    nameInput.addEventListener('input', () => nameInput.removeAttribute('aria-invalid'));

    // Маска телефона +7 (XXX) XXX-XX-XX
    phoneInput.addEventListener('input', () => {
        let digits = phoneInput.value.replace(/\D/g, '');
        if (!digits) {
            phoneInput.value = '';
            return;
        }
        if (digits[0] === '7' || digits[0] === '8') digits = digits.slice(1);
        digits = digits.slice(0, 10);
        let out = '+7';
        if (digits.length > 0) out += ' (' + digits.slice(0, 3);
        if (digits.length >= 3) out += ')';
        if (digits.length > 3) out += ' ' + digits.slice(3, 6);
        if (digits.length > 6) out += '-' + digits.slice(6, 8);
        if (digits.length > 8) out += '-' + digits.slice(8, 10);
        phoneInput.value = out;
    });

    function showError(message) {
        errorBox.textContent = message;
        errorBox.hidden = false;
    }

    function collect() {
        const data = new FormData(form);
        const attendance = data.get('attendance');
        return {
            name: (data.get('name') || '').trim(),
            attendance,
            companions: attendance === 'yes' ? (data.get('companions') || '').trim() : '',
            drinks: attendance === 'yes' ? data.getAll('drinks') : [],
            phone: (data.get('phone') || '').trim(),
            comment: (data.get('comment') || '').trim(),
            website: data.get('website') || ''
        };
    }

    function validate(data) {
        let firstInvalid = null;
        if (!data.name) {
            nameInput.setAttribute('aria-invalid', 'true');
            firstInvalid = nameInput;
        }
        if (!data.attendance) {
            attendanceChoices.setAttribute('aria-invalid', 'true');
            firstInvalid = firstInvalid || attendanceChoices.querySelector('input');
        }
        if (firstInvalid) {
            showError('Пожалуйста, укажите имя и ответьте, будете ли вы с нами.');
            firstInvalid.focus();
            return false;
        }
        return true;
    }

    async function send(data) {
        if (!config.rsvpEndpoint) throw new Error('rsvpEndpoint is not configured');
        const response = await fetch(config.rsvpEndpoint, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        });
        const result = await response.json().catch(() => ({}));
        if (!response.ok || !result.ok) {
            throw new Error(result.error || 'HTTP ' + response.status);
        }
    }

    function showDone(data) {
        const coming = data.attendance === 'yes';
        document.getElementById('rsvpDoneTitle').textContent = coming
            ? 'Посадка подтверждена!'
            : 'Спасибо, что сообщили';
        document.getElementById('rsvpDoneText').textContent = coming
            ? 'Ждём вас на борту 13 июня. Ваш посадочный талон:'
            : 'Нам будет вас не хватать. Мы обязательно поднимем бокал за вас!';
        document.getElementById('rsvpPass').hidden = !coming;
        document.getElementById('rsvpPassName').textContent = data.name;

        form.hidden = true;
        done.hidden = false;
        done.focus({ preventScroll: true });
        done.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }

    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        errorBox.hidden = true;

        const data = collect();
        if (!validate(data)) return;

        submitBtn.disabled = true;
        submitBtn.textContent = 'Отправляем…';
        try {
            await send(data);
            showDone(data);
        } catch (err) {
            console.error('RSVP send failed:', err);
            showError(`Не получилось отправить анкету. Проверьте интернет и попробуйте ещё раз — или напишите нам напрямую. (Код: ${err.message})`);
        } finally {
            submitBtn.disabled = false;
            submitBtn.textContent = 'Подтвердить';
        }
    });

    document.getElementById('rsvpAgain').addEventListener('click', () => {
        done.hidden = true;
        form.hidden = false;
        nameInput.focus();
    });
})();
