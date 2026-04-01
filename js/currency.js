// ==============================
// Единый скрипт для курсов валют
// Поддерживает JPY/RUB и CNY/RUB
// ==============================

// Статические fallback-курсы (если API не отвечают)
const FALLBACK_JPY_RUB = 0.5;    // 100 JPY ≈ 50 RUB
const FALLBACK_CNY_RUB = 14.0;   // 1 CNY ≈ 14 RUB

// Кэш в localStorage — максимальный срок: 30 дней
// Перекрывает всё путешествие; освежается при наличии интернета
const CACHE_KEY_JPY = 'jpy_rub_cache';
const CACHE_KEY_CNY = 'cny_rub_cache';
const CACHE_TTL = 30 * 24 * 60 * 60 * 1000; // 30 дней в мс

function saveToCache(key, rate) {
    try {
        localStorage.setItem(key, JSON.stringify({ rate, timestamp: Date.now() }));
    } catch (e) {}
}

function getFromCache(key) {
    try {
        const cached = localStorage.getItem(key);
        if (!cached) return null;
        const data = JSON.parse(cached);
        if (Date.now() - data.timestamp > CACHE_TTL) return null;
        return data.rate;
    } catch (e) {
        return null;
    }
}

// Получение курса JPY/RUB
async function fetchJPYRate() {
    const cached = getFromCache(CACHE_KEY_JPY);
    if (cached !== null) return cached;

    const sources = [
        {
            url: 'https://cdn.jsdelivr.net/npm/@fawazahmed0/currency-api@latest/v1/currencies/jpy.json',
            extract: data => data?.jpy?.rub
        },
        {
            url: 'https://api.exchangerate.host/latest?base=JPY&symbols=RUB',
            extract: data => data?.rates?.RUB
        },
        {
            url: 'https://api.exchangerate-api.com/v4/latest/JPY',
            extract: data => data?.rates?.RUB
        }
    ];

    for (const source of sources) {
        try {
            const res = await fetch(source.url);
            if (!res.ok) continue;
            const data = await res.json();
            const rate = source.extract(data);
            if (rate && rate > 0) {
                saveToCache(CACHE_KEY_JPY, rate);
                return rate;
            }
        } catch (e) {
            console.warn('[Currency] Ошибка источника:', source.url, e.message);
        }
    }

    console.warn('[Currency] Все API недоступны, используем fallback JPY:', FALLBACK_JPY_RUB);
    return FALLBACK_JPY_RUB;
}

// Получение курса CNY/RUB
async function fetchCNYRate() {
    const cached = getFromCache(CACHE_KEY_CNY);
    if (cached !== null) return cached;

    const sources = [
        {
            url: 'https://cdn.jsdelivr.net/npm/@fawazahmed0/currency-api@latest/v1/currencies/cny.json',
            extract: data => data?.cny?.rub
        },
        {
            url: 'https://api.exchangerate.host/latest?base=CNY&symbols=RUB',
            extract: data => data?.rates?.RUB
        },
        {
            url: 'https://api.exchangerate-api.com/v4/latest/CNY',
            extract: data => data?.rates?.RUB
        }
    ];

    for (const source of sources) {
        try {
            const res = await fetch(source.url);
            if (!res.ok) continue;
            const data = await res.json();
            const rate = source.extract(data);
            if (rate && rate > 0) {
                saveToCache(CACHE_KEY_CNY, rate);
                return rate;
            }
        } catch (e) {
            console.warn('[Currency] Ошибка источника:', source.url, e.message);
        }
    }

    console.warn('[Currency] Все API недоступны, используем fallback CNY:', FALLBACK_CNY_RUB);
    return FALLBACK_CNY_RUB;
}

// Обновление всех цен на странице
function updateAllPrices(jpyRate, cnyRate) {
    document.querySelectorAll('.rub-value[data-jpy]').forEach(el => {
        const jpy = parseFloat(el.getAttribute('data-jpy'));
        if (!isNaN(jpy)) el.textContent = `≈ ${Math.round(jpy * jpyRate)} ₽`;
    });

    document.querySelectorAll('.rub-range[data-min][data-max]').forEach(el => {
        const min = parseFloat(el.getAttribute('data-min'));
        const max = parseFloat(el.getAttribute('data-max'));
        if (!isNaN(min) && !isNaN(max))
            el.textContent = `≈ ${Math.round(min * jpyRate)}–${Math.round(max * jpyRate)} ₽`;
    });

    document.querySelectorAll('.rub-value-cny[data-cny]').forEach(el => {
        const cny = parseFloat(el.getAttribute('data-cny'));
        if (!isNaN(cny)) el.textContent = `≈ ${Math.round(cny * cnyRate)} ₽`;
    });

    document.querySelectorAll('.rub-range-cny[data-min][data-max]').forEach(el => {
        const min = parseFloat(el.getAttribute('data-min'));
        const max = parseFloat(el.getAttribute('data-max'));
        if (!isNaN(min) && !isNaN(max))
            el.textContent = `≈ ${Math.round(min * cnyRate)}–${Math.round(max * cnyRate)} ₽`;
    });

    const rateDisplay = document.getElementById('exchangeRatePlaceholder');
    if (rateDisplay) {
        const hasJpy = document.querySelector('[data-jpy]');
        const hasCny = document.querySelector('[data-cny]');
        if (hasJpy && hasCny) {
            rateDisplay.textContent = `1 CNY ≈ ${Math.round(cnyRate)} ₽ | 100 JPY ≈ ${Math.round(100 * jpyRate)} ₽`;
        } else if (hasJpy) {
            rateDisplay.textContent = `100 JPY ≈ ${Math.round(100 * jpyRate)} ₽`;
        } else if (hasCny) {
            rateDisplay.textContent = `1 CNY ≈ ${Math.round(cnyRate)} ₽`;
        }
    }
}

async function initCurrency() {
    // Сразу показываем fallback, чтобы страница не была пустой
    updateAllPrices(FALLBACK_JPY_RUB, FALLBACK_CNY_RUB);

    // Загружаем актуальные курсы параллельно
    const [jpyRate, cnyRate] = await Promise.all([fetchJPYRate(), fetchCNYRate()]);
    updateAllPrices(jpyRate, cnyRate);
}

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initCurrency);
} else {
    initCurrency();
}
