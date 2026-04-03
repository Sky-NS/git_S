
(function () {
  const DEFAULT_RATES = { JPY: 1, RUB: 0.62, USD: 0.0067, EUR: 0.0062 };

  function getRates() {
    try {
      const saved = JSON.parse(localStorage.getItem('jtc-rates') || '{}');
      return { ...DEFAULT_RATES, ...saved };
    } catch {
      return { ...DEFAULT_RATES };
    }
  }

  function saveRates(rates) {
    localStorage.setItem('jtc-rates', JSON.stringify(rates));
  }

  function formatMoney(amount, currency = 'JPY') {
    try {
      return new Intl.NumberFormat('ru-RU', { style: 'currency', currency, maximumFractionDigits: 0 }).format(amount);
    } catch {
      return `${amount} ${currency}`;
    }
  }

  function convertFromJPY(jpy, targetCurrency) {
    const rates = getRates();
    const rate = rates[targetCurrency] || 1;
    return Math.round(jpy * rate);
  }

  window.JTCurrency = { getRates, saveRates, formatMoney, convertFromJPY };
})();
