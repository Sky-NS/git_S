/**
 * Cloudflare Worker: принимает анкету гостя с сайта и отправляет её в Telegram-чат организаторов.
 *
 * Секреты (wrangler secret put ... или Settings → Variables and Secrets в панели Cloudflare):
 *   BOT_TOKEN — токен бота от @BotFather
 *   CHAT_ID   — id чата организаторов; несколько чатов можно перечислить через запятую
 * Переменная:
 *   ALLOWED_ORIGINS — адреса сайта через запятую (например, https://example.com).
 *                     Если пусто, принимаются запросы с любого сайта.
 */

const LIMITS = { name: 120, companions: 300, phone: 32, comment: 1000 };

const ATTENDANCE = {
    yes: '✅ Будет',
    no: '❌ Не сможет'
};

const DRINKS = {
    champagne: 'Шампанское',
    white: 'Белое вино',
    red: 'Красное вино',
    strong: 'Крепкое',
    soft: 'Без алкоголя'
};

export default {
    async fetch(request, env) {
        const cors = corsHeaders(request, env);

        if (request.method === 'OPTIONS') {
            return new Response(null, { status: cors ? 204 : 403, headers: cors || {} });
        }
        if (request.method !== 'POST') {
            return json({ ok: false, error: 'method_not_allowed' }, 405, cors);
        }
        if (!cors) {
            return json({ ok: false, error: 'forbidden_origin' }, 403);
        }
        if (!env.BOT_TOKEN || !env.CHAT_ID) {
            console.error('BOT_TOKEN or CHAT_ID secret is not set');
            return json({ ok: false, error: 'not_configured' }, 500, cors);
        }

        let body;
        try {
            body = await request.json();
        } catch {
            return json({ ok: false, error: 'bad_json' }, 400, cors);
        }

        // Скрытое поле заполняют только боты — отвечаем «ок», но ничего не отправляем
        if (body && body.website) {
            return json({ ok: true }, 200, cors);
        }

        const rsvp = parseRsvp(body);
        if (!rsvp) {
            return json({ ok: false, error: 'invalid_data' }, 400, cors);
        }

        const text = formatMessage(rsvp);
        const chatIds = splitList(env.CHAT_ID);
        const results = await Promise.all(chatIds.map((chatId) => sendMessage(env.BOT_TOKEN, chatId, text)));

        // Если хотя бы в один чат ушло — считаем успехом, иначе гость отправит анкету повторно и будут дубли
        if (!results.some(Boolean)) {
            return json({ ok: false, error: 'telegram_error' }, 502, cors);
        }
        return json({ ok: true }, 200, cors);
    }
};

function corsHeaders(request, env) {
    const allowed = splitList(env.ALLOWED_ORIGINS);
    const origin = request.headers.get('Origin') || '';
    let allowOrigin = null;
    if (allowed.length === 0) allowOrigin = '*';
    else if (allowed.includes(origin)) allowOrigin = origin;
    if (!allowOrigin) return null;

    return {
        'Access-Control-Allow-Origin': allowOrigin,
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type',
        'Access-Control-Max-Age': '86400',
        'Vary': 'Origin'
    };
}

function parseRsvp(body) {
    if (!body || typeof body !== 'object') return null;

    const text = (value, max) => (typeof value === 'string' ? value.trim().slice(0, max) : '');
    const name = text(body.name, LIMITS.name);
    const attendance = body.attendance;
    if (!name || !Object.hasOwn(ATTENDANCE, attendance)) return null;

    const coming = attendance === 'yes';
    const drinks = coming && Array.isArray(body.drinks)
        ? [...new Set(body.drinks.filter((d) => Object.hasOwn(DRINKS, d)))]
        : [];

    return {
        name,
        attendance,
        companions: coming ? text(body.companions, LIMITS.companions) : '',
        drinks,
        phone: text(body.phone, LIMITS.phone),
        comment: text(body.comment, LIMITS.comment)
    };
}

function formatMessage(rsvp) {
    const lines = [
        '✈️ <b>Новая анкета гостя</b>',
        '',
        `<b>Гость:</b> ${escapeHtml(rsvp.name)}`,
        `<b>Присутствие:</b> ${ATTENDANCE[rsvp.attendance]}`
    ];
    if (rsvp.attendance === 'yes') {
        lines.push(`<b>Спутники:</b> ${rsvp.companions ? escapeHtml(rsvp.companions) : 'нет'}`);
        lines.push(`<b>Напитки:</b> ${rsvp.drinks.length ? rsvp.drinks.map((d) => DRINKS[d]).join(', ') : 'не указано'}`);
    }
    if (rsvp.phone) lines.push(`<b>Телефон:</b> ${escapeHtml(rsvp.phone)}`);
    if (rsvp.comment) lines.push(`<b>Пожелания:</b> ${escapeHtml(rsvp.comment)}`);
    lines.push('', `<i>${new Date().toLocaleString('ru-RU', { timeZone: 'Europe/Moscow' })} МСК</i>`);
    return lines.join('\n');
}

async function sendMessage(token, chatId, text) {
    try {
        const response = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ chat_id: chatId, text, parse_mode: 'HTML' })
        });
        const result = await response.json();
        if (!result.ok) console.error(`Telegram error for chat ${chatId}:`, result.description);
        return Boolean(result.ok);
    } catch (err) {
        console.error(`Telegram request failed for chat ${chatId}:`, err);
        return false;
    }
}

function escapeHtml(value) {
    return value.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

function splitList(value) {
    return (value || '').split(',').map((s) => s.trim()).filter(Boolean);
}

function json(data, status, headers) {
    return new Response(JSON.stringify(data), {
        status,
        headers: { 'Content-Type': 'application/json; charset=utf-8', ...(headers || {}) }
    });
}
