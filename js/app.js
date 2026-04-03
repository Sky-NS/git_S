
(function () {
  'use strict';

  const STORAGE_KEY = 'jtc-state-v1';
  const PAGE = document.body.dataset.page || 'index';
  const app = document.getElementById('app');
  const themeToggle = document.getElementById('themeToggle');
  const exportBtn = document.getElementById('exportBtn');
  const importInput = document.getElementById('importInput');
  const createBtn = document.getElementById('createTripBtn');
  const backTop = document.getElementById('backToTop');

  const deepClone = typeof structuredClone === 'function' ? structuredClone : (obj) => JSON.parse(JSON.stringify(obj));

  const baseState = {
    theme: window.APP_SEED.theme || 'light',
    selectedTripId: window.APP_SEED.trips[0]?.id || null,
    ui: { expandedTripId: window.APP_SEED.trips[0]?.id || null, expandedDayId: window.APP_SEED.trips[0]?.days?.[0]?.id || null, budgetSearch: '', glossarySearch: '' },
    trips: clone(window.APP_SEED.trips),
    budget: clone(window.APP_SEED.budget),
    contacts: clone(window.APP_SEED.contacts),
    glossary: clone(window.APP_SEED.glossary),
    toilets: clone(window.APP_SEED.toilets),
    visaChecklist: clone(window.APP_SEED.visaChecklist)
  };

  let state = loadState();

  function uid(prefix = 'id') {
    return `${prefix}-${Math.random().toString(36).slice(2, 10)}`;
  }

  function clone(obj) {
    return deepClone(obj);
  }

  function escapeHtml(value) {
    return String(value ?? '')
      .replaceAll('&', '&amp;')
      .replaceAll('<', '&lt;')
      .replaceAll('>', '&gt;')
      .replaceAll('"', '&quot;')
      .replaceAll("'", '&#39;');
  }

  function loadState() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return clone(baseState);
      const parsed = JSON.parse(raw);
      return {
        ...clone(baseState),
        ...parsed,
        ui: { ...clone(baseState.ui), ...(parsed.ui || {}) }
      };
    } catch {
      return clone(baseState);
    }
  }

  function saveState() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    document.documentElement.dataset.theme = state.theme;
  }

  function setState(mutator) {
    const next = clone(state);
    mutator(next);
    state = next;
    saveState();
    render();
  }

  function getTrip(id = state.selectedTripId) {
    return state.trips.find(t => t.id === id) || state.trips[0];
  }

  function getSelectedTrip() {
    return getTrip();
  }

  function money(jpy) {
    return window.JTCurrency.formatMoney(jpy, 'JPY');
  }

  function setTheme(theme) {
    setState(s => { s.theme = theme; });
  }

  function toggleTheme() {
    setTheme(state.theme === 'dark' ? 'light' : 'dark');
  }

  function initChrome() {
    document.documentElement.dataset.theme = state.theme;
    themeToggle?.addEventListener('click', toggleTheme);
    createBtn?.addEventListener('click', () => createTripFromTemplate());
    exportBtn?.addEventListener('click', exportState);
    importInput?.addEventListener('change', handleImportFile);
    backTop?.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));
    document.querySelectorAll('.navlink').forEach(link => {
      if (link.getAttribute('href') === `${PAGE === 'index' ? 'index.html' : PAGE === 'planner' ? 'planner.html' : PAGE.startsWith('city-') ? PAGE.replace('city-', '') + '.html' : PAGE + '.html'}`) {
        link.classList.add('active');
      }
    });
    window.addEventListener('scroll', () => {
      if (backTop) backTop.style.display = window.scrollY > 350 ? 'inline-flex' : 'none';
    });
    document.addEventListener('click', handleClick);
    document.addEventListener('input', handleInput);
    document.addEventListener('change', handleChange);
  }

  function handleClick(event) {
    const actionEl = event.target.closest('[data-action]');
    if (!actionEl) return;
    const action = actionEl.dataset.action;
    const tripId = actionEl.dataset.tripId;
    const dayId = actionEl.dataset.dayId;
    const itemId = actionEl.dataset.itemId;
    const field = actionEl.dataset.field;

    if (action === 'select-trip') {
      setState(s => { s.selectedTripId = tripId; s.ui.expandedTripId = tripId; });
      return;
    }

    if (action === 'expand-trip') {
      setState(s => { s.ui.expandedTripId = s.ui.expandedTripId === tripId ? null : tripId; });
      return;
    }

    if (action === 'expand-day') {
      setState(s => { s.ui.expandedDayId = s.ui.expandedDayId === dayId ? null : dayId; });
      return;
    }

    if (action === 'add-trip') {
      createTripFromTemplate();
      return;
    }

    if (action === 'clone-trip') {
      cloneTrip(tripId);
      return;
    }

    if (action === 'delete-trip') {
      deleteTrip(tripId);
      return;
    }

    if (action === 'add-day') {
      addDay(tripId);
      return;
    }

    if (action === 'delete-day') {
      deleteDay(tripId, dayId);
      return;
    }

    if (action === 'move-day') {
      moveDay(tripId, dayId, actionEl.dataset.dir);
      return;
    }

    if (action === 'duplicate-day') {
      duplicateDay(tripId, dayId);
      return;
    }

    if (action === 'add-item') {
      addItem(tripId, dayId);
      return;
    }

    if (action === 'delete-item') {
      deleteItem(tripId, dayId, itemId);
      return;
    }

    if (action === 'move-item') {
      moveItem(tripId, dayId, itemId, actionEl.dataset.dir);
      return;
    }

    if (action === 'add-budget') {
      addBudgetRow();
      return;
    }

    if (action === 'delete-budget') {
      deleteBudgetRow(actionEl.dataset.rowId);
      return;
    }

    if (action === 'add-contact') {
      addContact();
      return;
    }

    if (action === 'delete-contact') {
      deleteContact(actionEl.dataset.rowId);
      return;
    }

    if (action === 'add-glossary') {
      addGlossaryRow();
      return;
    }

    if (action === 'delete-glossary') {
      deleteGlossaryRow(actionEl.dataset.rowId);
      return;
    }

    if (action === 'add-toilet') {
      addToiletRow();
      return;
    }

    if (action === 'delete-toilet') {
      deleteToiletRow(actionEl.dataset.rowId);
      return;
    }

    if (action === 'toggle-visa') {
      toggleVisa(actionEl.dataset.rowId);
      return;
    }

    if (action === 'save-rates') {
      saveRatesFromInputs();
      return;
    }

    if (action === 'copy-json') {
      copyStateJson();
      return;
    }
  }

  function handleInput(event) {
    const el = event.target;
    if (el.id === 'budgetSearch') {
      state.ui.budgetSearch = el.value;
      render();
      return;
    }
    if (el.id === 'glossarySearch') {
      state.ui.glossarySearch = el.value;
      render();
      return;
    }
  }

  function handleChange(event) {
    const el = event.target;
    if (el.matches('[data-bind]')) {
      updateBoundField(el);
      return;
    }
    if (el.matches('[data-visa-id]')) {
      toggleVisa(el.dataset.visaId, el.checked);
      return;
    }
    if (el.matches('[data-type="theme-select"]')) {
      setTheme(el.value);
      return;
    }
  }

  function updateBoundField(el) {
    const entity = el.dataset.bind;
    const tripId = el.dataset.tripId;
    const dayId = el.dataset.dayId;
    const itemId = el.dataset.itemId;
    const rowId = el.dataset.rowId;
    const field = el.dataset.field;
    const value = el.type === 'checkbox' ? el.checked : el.value;

    setState(s => {
      if (entity === 'trip') {
        const trip = s.trips.find(t => t.id === tripId);
        if (trip) trip[field] = value;
      }
      if (entity === 'day') {
        const day = findDay(s, tripId, dayId);
        if (day) day[field] = value;
      }
      if (entity === 'item') {
        const item = findItem(s, tripId, dayId, itemId);
        if (item) item[field] = value;
      }
      if (entity === 'budget') {
        const row = s.budget.find(r => r.id === rowId);
        if (row) row[field] = field === 'amount' ? Number(value || 0) : value;
      }
      if (entity === 'contact') {
        const row = s.contacts.find(r => r.id === rowId);
        if (row) row[field] = value;
      }
      if (entity === 'glossary') {
        const row = s.glossary.find(r => r.id === rowId);
        if (row) row[field] = value;
      }
      if (entity === 'toilet') {
        const row = s.toilets.find(r => r.id === rowId);
        if (row) row[field] = value;
      }
      if (entity === 'visa') {
        const row = s.visaChecklist.find(r => r.id === rowId);
        if (row && field === 'done') row.done = !!value;
        if (row && field === 'text') row.text = value;
      }
      if (entity === 'rates') {
        const rates = window.JTCurrency.getRates();
        rates[field] = Number(value || 0);
        window.JTCurrency.saveRates(rates);
      }
    });
  }

  function findDay(s, tripId, dayId) {
    const trip = s.trips.find(t => t.id === tripId);
    return trip?.days.find(d => d.id === dayId);
  }

  function findItem(s, tripId, dayId, itemId) {
    const day = findDay(s, tripId, dayId);
    return day?.items.find(i => i.id === itemId);
  }

  function createTripFromTemplate() {
    const id = uid('trip');
    const base = getSelectedTrip() || window.APP_SEED.trips[0];
    const newTrip = clone(base);
    newTrip.id = id;
    newTrip.title = `${base.title} copy`;
    newTrip.subtitle = 'Новый пользовательский маршрут';
    newTrip.description = 'Собирается пользователем с нуля';
    newTrip.days = [];
    newTrip.flights = [];
    newTrip.stays = [];
    newTrip.cities = [];
    newTrip.notes = [];
    setState(s => {
      s.trips.unshift(newTrip);
      s.selectedTripId = id;
      s.ui.expandedTripId = id;
      s.ui.expandedDayId = null;
    });
  }

  function cloneTrip(tripId) {
    const src = state.trips.find(t => t.id === tripId);
    if (!src) return;
    const trip = clone(src);
    trip.id = uid('trip');
    trip.title = `${src.title} copy`;
    trip.subtitle = src.subtitle;
    setState(s => {
      s.trips.unshift(trip);
      s.selectedTripId = trip.id;
      s.ui.expandedTripId = trip.id;
      s.ui.expandedDayId = trip.days[0]?.id || null;
    });
  }

  function deleteTrip(tripId) {
    if (!confirm('Удалить поездку?')) return;
    setState(s => {
      s.trips = s.trips.filter(t => t.id !== tripId);
      if (!s.trips.length) {
        s.trips = clone(baseState.trips);
      }
      s.selectedTripId = s.trips[0].id;
      s.ui.expandedTripId = s.selectedTripId;
      s.ui.expandedDayId = s.trips[0].days[0]?.id || null;
    });
  }

  function addDay(tripId) {
    setState(s => {
      const trip = s.trips.find(t => t.id === tripId);
      if (!trip) return;
      const d = { id: uid('day'), date: '', city: '', title: 'Новый день', summary: '', items: [] };
      trip.days.push(d);
      s.ui.expandedDayId = d.id;
    });
  }

  function duplicateDay(tripId, dayId) {
    setState(s => {
      const trip = s.trips.find(t => t.id === tripId);
      const day = trip?.days.find(d => d.id === dayId);
      if (!trip || !day) return;
      const copy = clone(day);
      copy.id = uid('day');
      copy.title = `${day.title} copy`;
      copy.items = copy.items.map(item => ({ ...item, id: uid('item') }));
      const idx = trip.days.findIndex(d => d.id === dayId);
      trip.days.splice(idx + 1, 0, copy);
      s.ui.expandedDayId = copy.id;
    });
  }

  function deleteDay(tripId, dayId) {
    if (!confirm('Удалить день?')) return;
    setState(s => {
      const trip = s.trips.find(t => t.id === tripId);
      if (!trip) return;
      trip.days = trip.days.filter(d => d.id !== dayId);
      s.ui.expandedDayId = trip.days[0]?.id || null;
    });
  }

  function moveDay(tripId, dayId, dir) {
    setState(s => {
      const trip = s.trips.find(t => t.id === tripId);
      if (!trip) return;
      const idx = trip.days.findIndex(d => d.id === dayId);
      const next = dir === 'up' ? idx - 1 : idx + 1;
      if (idx < 0 || next < 0 || next >= trip.days.length) return;
      [trip.days[idx], trip.days[next]] = [trip.days[next], trip.days[idx]];
    });
  }

  function addItem(tripId, dayId) {
    setState(s => {
      const day = findDay(s, tripId, dayId);
      if (!day) return;
      day.items.push({ id: uid('item'), time: '', type: 'poi', title: 'Новая точка', details: '', mapLink: '', bookingLink: '', price: '' });
    });
  }

  function deleteItem(tripId, dayId, itemId) {
    setState(s => {
      const day = findDay(s, tripId, dayId);
      if (!day) return;
      day.items = day.items.filter(i => i.id !== itemId);
    });
  }

  function moveItem(tripId, dayId, itemId, dir) {
    setState(s => {
      const day = findDay(s, tripId, dayId);
      if (!day) return;
      const idx = day.items.findIndex(i => i.id === itemId);
      const next = dir === 'up' ? idx - 1 : idx + 1;
      if (idx < 0 || next < 0 || next >= day.items.length) return;
      [day.items[idx], day.items[next]] = [day.items[next], day.items[idx]];
    });
  }

  function addBudgetRow() {
    setState(s => s.budget.unshift({ id: uid('budget'), category: 'Новая статья', item: 'Описание', amount: 0, currency: 'JPY', paid: false }));
  }

  function deleteBudgetRow(rowId) {
    setState(s => { s.budget = s.budget.filter(r => r.id !== rowId); });
  }

  function addContact() {
    setState(s => s.contacts.unshift({ id: uid('contact'), name: 'Новый контакт', role: '', phone: '', note: '' }));
  }

  function deleteContact(rowId) {
    setState(s => { s.contacts = s.contacts.filter(r => r.id !== rowId); });
  }

  function addGlossaryRow() {
    setState(s => s.glossary.unshift({ id: uid('glossary'), jp: '', ru: '', note: '' }));
  }

  function deleteGlossaryRow(rowId) {
    setState(s => { s.glossary = s.glossary.filter(r => r.id !== rowId); });
  }

  function addToiletRow() {
    setState(s => s.toilets.unshift({ id: uid('toilet'), name: 'Новая точка', area: '', address: '', mapLink: '', note: '' }));
  }

  function deleteToiletRow(rowId) {
    setState(s => { s.toilets = s.toilets.filter(r => r.id !== rowId); });
  }

  function toggleVisa(rowId, value) {
    setState(s => {
      const row = s.visaChecklist.find(r => r.id === rowId);
      if (row) row.done = typeof value === 'boolean' ? value : !row.done;
    });
  }

  function saveRatesFromInputs() {
    const jpy = document.getElementById('rateRUB');
    const usd = document.getElementById('rateUSD');
    const eur = document.getElementById('rateEUR');
    const rates = window.JTCurrency.getRates();
    if (jpy) rates.RUB = Number(jpy.value || rates.RUB);
    if (usd) rates.USD = Number(usd.value || rates.USD);
    if (eur) rates.EUR = Number(eur.value || rates.EUR);
    window.JTCurrency.saveRates(rates);
    render();
  }

  async function copyStateJson() {
    try {
      await navigator.clipboard.writeText(JSON.stringify(state, null, 2));
      toast('JSON скопирован');
    } catch {
      toast('Не удалось скопировать JSON');
    }
  }

  function exportState() {
    const blob = new Blob([JSON.stringify(state, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'japan-trip-constructor-export.json';
    a.click();
    URL.revokeObjectURL(url);
  }

  function handleImportFile(event) {
    const file = event.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const parsed = JSON.parse(String(reader.result || '{}'));
        state = {
          ...clone(baseState),
          ...parsed,
          ui: { ...clone(baseState.ui), ...(parsed.ui || {}) }
        };
        saveState();
        render();
        toast('Данные импортированы');
      } catch {
        toast('Ошибка импорта JSON');
      }
    };
    reader.readAsText(file);
    event.target.value = '';
  }

  function toast(message) {
    let el = document.getElementById('toast');
    if (!el) {
      el = document.createElement('div');
      el.id = 'toast';
      el.className = 'toast';
      document.body.appendChild(el);
    }
    el.textContent = message;
    el.classList.add('show');
    clearTimeout(el._timer);
    el._timer = setTimeout(() => el.classList.remove('show'), 1800);
  }

  function render() {
    if (!app) return;
    const trip = getSelectedTrip();
    if (PAGE === 'planner') app.innerHTML = renderPlanner(trip);
    else if (PAGE === 'index') app.innerHTML = renderIndex();
    else if (PAGE.startsWith('city-')) app.innerHTML = renderCity(PAGE.replace('city-', ''));
    else if (PAGE === 'budget') app.innerHTML = renderBudget();
    else if (PAGE === 'visa') app.innerHTML = renderVisa();
    else if (PAGE === 'glossary') app.innerHTML = renderGlossary();
    else if (PAGE === 'contacts') app.innerHTML = renderContacts();
    else if (PAGE === 'toilet-map') app.innerHTML = renderToilets();
    else app.innerHTML = renderIndex();
  }

  function renderIndex() {
    const trips = state.trips;
    const selected = getSelectedTrip();
    const nights = selected ? tripNights(selected) : 0;
    return `
      <section class="hero card">
        <div class="hero-copy">
          <span class="eyebrow">Офлайн PWA · Japan-themed travel builder</span>
          <h1>${escapeHtml(window.APP_SEED.appName)}</h1>
          <p class="lead">${escapeHtml(window.APP_SEED.tagline)}</p>
          <div class="hero-actions">
            <a class="button button-primary" href="planner.html">Открыть конструктор</a>
            <button class="button button-secondary" data-action="copy-json">Скопировать JSON</button>
            <button class="button button-ghost" data-action="add-trip">Создать поездку</button>
          </div>
        </div>
        <div class="hero-stats">
          <div class="stat"><strong>${trips.length}</strong><span>поездок</span></div>
          <div class="stat"><strong>${selected?.days.length || 0}</strong><span>дней в шаблоне</span></div>
          <div class="stat"><strong>${nights}</strong><span>ночей</span></div>
        </div>
      </section>

      <section class="grid two-up">
        <article class="card">
          <div class="section-head">
            <h2>Быстрый старт</h2>
            <button class="button button-primary" data-action="add-trip">Создать поездку</button>
          </div>
          <p class="muted">Дублируй шаблон, меняй города, добавляй точки интереса, ссылки на карты и брони.</p>
          <div class="feature-list">
            <div class="feature-item"><strong>Trip cards</strong><span>проекты, даты, города, проживания</span></div>
            <div class="feature-item"><strong>Day planner</strong><span>дни, точки, тайминг, ссылки</span></div>
            <div class="feature-item"><strong>Utilities</strong><span>бюджет, визы, словарь, контакты</span></div>
          </div>
        </article>
        <article class="card">
          <div class="section-head"><h2>Шаблон по умолчанию</h2><a class="link-pill" href="planner.html">Открыть</a></div>
          <div class="summary-line"><span>Маршрут</span><strong>${escapeHtml(selected?.route || '—')}</strong></div>
          <div class="summary-line"><span>Даты</span><strong>${escapeHtml(selected?.startDate || '—')} → ${escapeHtml(selected?.endDate || '—')}</strong></div>
          <div class="summary-line"><span>Города</span><strong>${selected?.cities.length || 0}</strong></div>
          <div class="summary-line"><span>Проживание</span><strong>${selected?.stays.length || 0}</strong></div>
        </article>
      </section>

      <section class="card">
        <div class="section-head">
          <h2>Путешествия</h2>
          <p class="muted">Кликни любую карточку — откроется и редактирование, и примерная структура.</p>
        </div>
        <div class="trip-grid">
          ${trips.map(renderTripCard).join('')}
        </div>
      </section>

      <section class="grid three-up">
        <article class="card small-card">
          <h3>Офлайн</h3>
          <p>Service Worker сохраняет всё важное в кеше, чтобы приложение открывалось в дороге.</p>
        </article>
        <article class="card small-card">
          <h3>Экспорт</h3>
          <p>План можно сохранить как JSON и перенести на другой телефон или в другой браузер.</p>
        </article>
        <article class="card small-card">
          <h3>Конструктор</h3>
          <p>Добавляй города, дни, точки, описания, ссылки на карты и брони без правки HTML.</p>
        </article>
      </section>
    `;
  }

  function renderTripCard(trip) {
    const active = trip.id === state.selectedTripId ? 'active' : '';
    return `
      <article class="trip-tile ${active}">
        <button class="trip-tile-main" data-action="select-trip" data-trip-id="${trip.id}">
          <div class="trip-tile-top">
            <span class="trip-emoji">🗾</span>
            <span class="trip-pill">${escapeHtml(trip.startDate)} → ${escapeHtml(trip.endDate)}</span>
          </div>
          <h3>${escapeHtml(trip.title)}</h3>
          <p>${escapeHtml(trip.subtitle)}</p>
          <div class="mini-stats">
            <span>${trip.days.length} дней</span>
            <span>${trip.stays.length} отелей</span>
            <span>${trip.flights.length} перелётов</span>
          </div>
        </button>
        <div class="trip-tile-actions">
          <button class="button button-secondary" data-action="expand-trip" data-trip-id="${trip.id}">${state.ui.expandedTripId === trip.id ? 'Свернуть' : 'Детали'}</button>
          <button class="button button-ghost" data-action="clone-trip" data-trip-id="${trip.id}">Дублировать</button>
          <button class="button button-danger" data-action="delete-trip" data-trip-id="${trip.id}">Удалить</button>
        </div>
        ${state.ui.expandedTripId === trip.id ? `
          <div class="trip-details">
            <div class="summary-line"><span>Маршрут</span><strong>${escapeHtml(trip.route)}</strong></div>
            <div class="summary-line"><span>Описание</span><strong>${escapeHtml(trip.description)}</strong></div>
            <div class="summary-line"><span>Дней</span><strong>${trip.days.length}</strong></div>
          </div>
        ` : ''}
      </article>
    `;
  }

  function tripNights(trip) {
    return trip.stays.reduce((sum, s) => sum + (Number(s.nights) || 0), 0);
  }

  function renderPlanner(trip) {
    return `
      <div class="planner-layout">
        <aside class="sidebar card">
          <div class="section-head">
            <h2>Поездки</h2>
            <button class="button button-primary" data-action="add-trip">+</button>
          </div>
          <div class="trip-stack">
            ${state.trips.map(tripSidebarItem).join('')}
          </div>
          <div class="sidebar-block">
            <h3>Импорт / экспорт</h3>
            <p class="muted">Используй кнопки в верхней панели для экспорта и импорта JSON.</p>
          </div>
        </aside>

        <section class="main-column">
          <article class="card hero-card" style="border-left-color: ${escapeHtml(trip.accent || '#b03e3e')}">
            <div class="section-head">
              <div>
                <span class="eyebrow">Редактор маршрута</span>
                <h1>${escapeHtml(trip.title)}</h1>
              </div>
              <button class="button button-secondary" data-action="copy-json">Copy JSON</button>
            </div>
            <p class="lead">Собирай поездку как конструктор: города, дни, точки, ссылки на карты и брони, заметки и бюджет.</p>
            <div class="meta-grid">
              <div><span>Старт</span><input class="field" data-bind="trip" data-trip-id="${trip.id}" data-field="startDate" type="date" value="${escapeHtml(trip.startDate)}"></div>
              <div><span>Финиш</span><input class="field" data-bind="trip" data-trip-id="${trip.id}" data-field="endDate" type="date" value="${escapeHtml(trip.endDate)}"></div>
              <div><span>Подзаголовок</span><input class="field" data-bind="trip" data-trip-id="${trip.id}" data-field="subtitle" value="${escapeHtml(trip.subtitle)}"></div>
              <div><span>Маршрут</span><input class="field" data-bind="trip" data-trip-id="${trip.id}" data-field="route" value="${escapeHtml(trip.route)}"></div>
              <div class="span-2"><span>Описание</span><textarea class="field" data-bind="trip" data-trip-id="${trip.id}" data-field="description">${escapeHtml(trip.description)}</textarea></div>
            </div>
          </article>

          <article class="card">
            <div class="section-head">
              <h2>Города</h2>
              <button class="button button-primary" data-action="add-day" data-trip-id="${trip.id}">Добавить день</button>
            </div>
            <div class="chips">
              ${trip.cities.map(city => `<span class="chip">${escapeHtml(city.emoji)} ${escapeHtml(city.name)} · ${escapeHtml(city.dates)}</span>`).join('')}
            </div>
            <div class="stack">
              ${trip.days.length ? trip.days.map(day => renderDay(trip, day)).join('') : '<div class="empty-state">Дней пока нет. Нажми “Добавить день”.</div>'}
            </div>
          </article>

          <article class="card">
            <div class="section-head"><h2>Перелёты и проживание</h2></div>
            <div class="grid two-up">
              <div>
                <h3>Flights</h3>
                ${trip.flights.length ? trip.flights.map(f => `<div class="flight-item"><strong>${escapeHtml(f.from)} → ${escapeHtml(f.to)}</strong><span>${escapeHtml(f.date)} · ${escapeHtml(f.time)} · ${escapeHtml(f.code)}</span></div>`).join('') : '<div class="empty-state">Добавь перелёты для поездки.</div>'}
              </div>
              <div>
                <h3>Stays</h3>
                ${trip.stays.length ? trip.stays.map(s => `<div class="stay-item"><strong>${escapeHtml(s.place)}</strong><span>${escapeHtml(s.city)} · ${escapeHtml(s.dates)} · ${s.nights} ночей</span></div>`).join('') : '<div class="empty-state">Добавь проживания.</div>'}
              </div>
            </div>
          </article>
        </section>

        <aside class="sidebar card">
          <div class="section-head"><h2>Быстрые блоки</h2></div>
          <div class="sidebar-block">
            <h3>Заметки</h3>
            ${trip.notes.length ? trip.notes.map(n => `<div class="note-item"><strong>${escapeHtml(n.title)}</strong><p>${escapeHtml(n.body)}</p></div>`).join('') : '<div class="empty-state">Заметок нет.</div>'}
          </div>
          <div class="sidebar-block">
            <h3>Сводка</h3>
            <div class="summary-line"><span>Дней</span><strong>${trip.days.length}</strong></div>
            <div class="summary-line"><span>Ночей</span><strong>${tripNights(trip)}</strong></div>
            <div class="summary-line"><span>Отелей</span><strong>${trip.stays.length}</strong></div>
          </div>
          <div class="sidebar-block">
            <a class="button button-primary full-width" href="index.html">На главную</a>
          </div>
        </aside>
      </div>
    `;
  }

  function tripSidebarItem(trip) {
    const active = trip.id === state.selectedTripId ? 'active' : '';
    return `
      <button class="trip-side ${active}" data-action="select-trip" data-trip-id="${trip.id}">
        <strong>${escapeHtml(trip.title)}</strong>
        <span>${escapeHtml(trip.subtitle)}</span>
      </button>
    `;
  }

  function renderDay(trip, day) {
    const open = state.ui.expandedDayId === day.id;
    return `
      <article class="day-card ${open ? 'open' : ''}">
        <button class="day-head" data-action="expand-day" data-day-id="${day.id}" type="button">
          <div>
            <span class="day-meta">${escapeHtml(day.date || 'Дата не задана')} · ${escapeHtml(day.city || 'Город не задан')}</span>
            <h3>${escapeHtml(day.title)}</h3>
            <p>${escapeHtml(day.summary)}</p>
          </div>
          <span class="caret">${open ? '▾' : '▸'}</span>
        </button>
        ${open ? `
          <div class="day-body">
            <div class="grid two-up form-grid">
              <label><span>Дата</span><input class="field" data-bind="day" data-trip-id="${trip.id}" data-day-id="${day.id}" data-field="date" type="date" value="${escapeHtml(day.date)}"></label>
              <label><span>Город</span><input class="field" data-bind="day" data-trip-id="${trip.id}" data-day-id="${day.id}" data-field="city" value="${escapeHtml(day.city)}"></label>
              <label class="span-2"><span>Название дня</span><input class="field" data-bind="day" data-trip-id="${trip.id}" data-day-id="${day.id}" data-field="title" value="${escapeHtml(day.title)}"></label>
              <label class="span-2"><span>Короткое описание</span><textarea class="field" data-bind="day" data-trip-id="${trip.id}" data-day-id="${day.id}" data-field="summary">${escapeHtml(day.summary)}</textarea></label>
            </div>
            <div class="row-actions">
              <button class="button button-secondary" data-action="move-day" data-trip-id="${trip.id}" data-day-id="${day.id}" data-dir="up">↑</button>
              <button class="button button-secondary" data-action="move-day" data-trip-id="${trip.id}" data-day-id="${day.id}" data-dir="down">↓</button>
              <button class="button button-ghost" data-action="duplicate-day" data-trip-id="${trip.id}" data-day-id="${day.id}">Дублировать</button>
              <button class="button button-danger" data-action="delete-day" data-trip-id="${trip.id}" data-day-id="${day.id}">Удалить</button>
              <button class="button button-primary" data-action="add-item" data-trip-id="${trip.id}" data-day-id="${day.id}">+ Точка</button>
            </div>
            <div class="item-list">
              ${day.items.length ? day.items.map(item => renderItem(trip, day, item)).join('') : '<div class="empty-state">Пока нет точек. Добавь первую точку интереса.</div>'}
            </div>
          </div>
        ` : ''}
      </article>
    `;
  }

  function renderItem(trip, day, item) {
    return `
      <div class="item-card">
        <div class="item-top">
          <div>
            <span class="pill">${escapeHtml(item.type)}</span>
            <strong>${escapeHtml(item.title)}</strong>
            <p>${escapeHtml(item.details)}</p>
          </div>
          <div class="item-actions">
            <button class="icon-btn" data-action="move-item" data-trip-id="${trip.id}" data-day-id="${day.id}" data-item-id="${item.id}" data-dir="up">↑</button>
            <button class="icon-btn" data-action="move-item" data-trip-id="${trip.id}" data-day-id="${day.id}" data-item-id="${item.id}" data-dir="down">↓</button>
            <button class="icon-btn danger" data-action="delete-item" data-trip-id="${trip.id}" data-day-id="${day.id}" data-item-id="${item.id}">✕</button>
          </div>
        </div>
        <div class="grid two-up form-grid compact">
          <label><span>Время</span><input class="field" data-bind="item" data-trip-id="${trip.id}" data-day-id="${day.id}" data-item-id="${item.id}" data-field="time" value="${escapeHtml(item.time)}"></label>
          <label><span>Тип</span>
            <select class="field" data-bind="item" data-trip-id="${trip.id}" data-day-id="${day.id}" data-item-id="${item.id}" data-field="type">
              ${['flight','stay','poi','food','shop','note','transport'].map(t => `<option value="${t}" ${item.type === t ? 'selected' : ''}>${t}</option>`).join('')}
            </select>
          </label>
          <label class="span-2"><span>Название</span><input class="field" data-bind="item" data-trip-id="${trip.id}" data-day-id="${day.id}" data-item-id="${item.id}" data-field="title" value="${escapeHtml(item.title)}"></label>
          <label class="span-2"><span>Описание</span><textarea class="field" data-bind="item" data-trip-id="${trip.id}" data-day-id="${day.id}" data-item-id="${item.id}" data-field="details">${escapeHtml(item.details)}</textarea></label>
          <label class="span-2"><span>Ссылка на карту</span><input class="field" data-bind="item" data-trip-id="${trip.id}" data-day-id="${day.id}" data-item-id="${item.id}" data-field="mapLink" value="${escapeHtml(item.mapLink || '')}"></label>
          <label class="span-2"><span>Ссылка на бронь</span><input class="field" data-bind="item" data-trip-id="${trip.id}" data-day-id="${day.id}" data-item-id="${item.id}" data-field="bookingLink" value="${escapeHtml(item.bookingLink || '')}"></label>
        </div>
      </div>
    `;
  }

  function renderCity(cityId) {
    const content = window.APP_SEED.cityPages?.[cityId] || { emoji: '🗺', title: cityId, dates: '', nights: 0, note: '', highlights: [], days: [] };
    return `
      <section class="card hero-card">
        <div class="section-head">
          <div>
            <span class="eyebrow">Городской шаблон</span>
            <h1>${escapeHtml(content.emoji)} ${escapeHtml(content.title)}</h1>
          </div>
          <a class="button button-primary" href="planner.html">Собрать свой маршрут</a>
        </div>
        <p class="lead">${escapeHtml(content.note || 'Страница-образец из исходного путешествия.')}</p>
        <div class="chips"><span class="chip">${escapeHtml(content.dates)}</span><span class="chip">${content.nights} ночей</span></div>
      </section>
      <section class="grid two-up">
        <article class="card">
          <h2>Что посмотреть</h2>
          <div class="stack">${(content.highlights || []).map(h => `<div class="day-preview"><strong>${escapeHtml(h.title)}</strong><p>${escapeHtml(h.text)}</p></div>`).join('')}</div>
        </article>
        <article class="card">
          <h2>Как использовать</h2>
          <p>Эта страница показывает стиль проекта и даёт готовый образец, который можно перенести в свой маршрут.</p>
          <p class="muted">Дальше всё собирается в конструкторе без правки HTML.</p>
        </article>
      </section>
      <section class="card">
        <h2>Примерные дни</h2>
        <div class="stack">
          ${(content.days || []).length ? (content.days || []).map(d => `<div class="day-preview"><strong>${escapeHtml(d.title)}</strong><p>${escapeHtml(d.text)}</p></div>`).join('') : '<div class="empty-state">Для этого города в демо-данных ещё нет отдельного дня.</div>'}
        </div>
      </section>
    `;
  }

  function renderBudget() {
    const q = (state.ui.budgetSearch || '').trim().toLowerCase();
    const rows = state.budget.filter(r => !q || [r.category, r.item].some(v => String(v).toLowerCase().includes(q)));
    const total = rows.reduce((sum, r) => sum + Number(r.amount || 0), 0);
    return `
      <section class="card hero-card">
        <div class="section-head">
          <div>
            <span class="eyebrow">Утилита</span>
            <h1>Бюджет</h1>
          </div>
          <button class="button button-primary" data-action="add-budget">+ Статья</button>
        </div>
        <div class="summary-line"><span>Итого по видимым строкам</span><strong>${money(total)}</strong></div>
        <div class="rate-box">
          <label><span>RUB за 1 JPY</span><input id="rateRUB" class="field" type="number" step="0.01" value="${window.JTCurrency.getRates().RUB}"></label>
          <label><span>USD за 1 JPY</span><input id="rateUSD" class="field" type="number" step="0.0001" value="${window.JTCurrency.getRates().USD}"></label>
          <label><span>EUR за 1 JPY</span><input id="rateEUR" class="field" type="number" step="0.0001" value="${window.JTCurrency.getRates().EUR}"></label>
          <button class="button button-secondary" data-action="save-rates">Сохранить курсы</button>
        </div>
        <input id="budgetSearch" class="field search" placeholder="Поиск по бюджету" value="${escapeHtml(state.ui.budgetSearch || '')}">
      </section>
      <section class="card">
        <div class="table-wrap">
          <table>
            <thead><tr><th>Категория</th><th>Позиция</th><th>Сумма JPY</th><th>Статус</th><th></th></tr></thead>
            <tbody>
              ${rows.map(row => `
                <tr>
                  <td><input class="field" data-bind="budget" data-row-id="${row.id}" data-field="category" value="${escapeHtml(row.category)}"></td>
                  <td><input class="field" data-bind="budget" data-row-id="${row.id}" data-field="item" value="${escapeHtml(row.item)}"></td>
                  <td><input class="field" data-bind="budget" data-row-id="${row.id}" data-field="amount" type="number" value="${escapeHtml(row.amount)}"></td>
                  <td><label class="check-inline"><input type="checkbox" data-bind="budget" data-row-id="${row.id}" data-field="paid" ${row.paid ? 'checked' : ''}> оплачен</label></td>
                  <td><button class="button button-danger" data-action="delete-budget" data-row-id="${row.id}">Удалить</button></td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>
      </section>
    `;
  }

  function renderVisa() {
    return `
      <section class="card hero-card">
        <div class="section-head">
          <div><span class="eyebrow">Памятка</span><h1>Виза и документы</h1></div>
          <p class="muted">Чеклист можно дополнять под любые направления.</p>
        </div>
        <div class="stack">
          ${state.visaChecklist.map(row => `
            <label class="check-row">
              <input type="checkbox" data-visa-id="${row.id}" ${row.done ? 'checked' : ''}>
              <input class="field inline-field" data-bind="visa" data-row-id="${row.id}" data-field="text" value="${escapeHtml(row.text)}">
            </label>
          `).join('')}
        </div>
      </section>
    `;
  }

  function renderGlossary() {
    const q = (state.ui.glossarySearch || '').trim().toLowerCase();
    const rows = state.glossary.filter(r => !q || [r.jp, r.ru, r.note].some(v => String(v).toLowerCase().includes(q)));
    return `
      <section class="card hero-card">
        <div class="section-head">
          <div><span class="eyebrow">Памятка</span><h1>Глоссарий</h1></div>
          <button class="button button-primary" data-action="add-glossary">+ Слово</button>
        </div>
        <input id="glossarySearch" class="field search" placeholder="Поиск слов" value="${escapeHtml(state.ui.glossarySearch || '')}">
      </section>
      <section class="card">
        <div class="stack glossary-stack">
          ${rows.map(row => `
            <div class="glossary-row">
              <input class="field" data-bind="glossary" data-row-id="${row.id}" data-field="jp" value="${escapeHtml(row.jp)}" placeholder="日本語">
              <input class="field" data-bind="glossary" data-row-id="${row.id}" data-field="ru" value="${escapeHtml(row.ru)}" placeholder="перевод">
              <input class="field flex-2" data-bind="glossary" data-row-id="${row.id}" data-field="note" value="${escapeHtml(row.note)}" placeholder="заметка">
              <button class="button button-danger" data-action="delete-glossary" data-row-id="${row.id}">Удалить</button>
            </div>
          `).join('')}
        </div>
      </section>
    `;
  }

  function renderContacts() {
    return `
      <section class="card hero-card">
        <div class="section-head">
          <div><span class="eyebrow">Контакты</span><h1>Экстренные и полезные контакты</h1></div>
          <button class="button button-primary" data-action="add-contact">+ Контакт</button>
        </div>
        <div class="stack">
          ${state.contacts.map(row => `
            <div class="contact-row">
              <input class="field" data-bind="contact" data-row-id="${row.id}" data-field="name" value="${escapeHtml(row.name)}" placeholder="Название">
              <input class="field" data-bind="contact" data-row-id="${row.id}" data-field="role" value="${escapeHtml(row.role)}" placeholder="Описание">
              <input class="field" data-bind="contact" data-row-id="${row.id}" data-field="phone" value="${escapeHtml(row.phone)}" placeholder="Телефон">
              <input class="field flex-2" data-bind="contact" data-row-id="${row.id}" data-field="note" value="${escapeHtml(row.note)}" placeholder="Заметка">
              <button class="button button-danger" data-action="delete-contact" data-row-id="${row.id}">Удалить</button>
            </div>
          `).join('')}
        </div>
      </section>
    `;
  }

  function renderToilets() {
    return `
      <section class="card hero-card">
        <div class="section-head">
          <div><span class="eyebrow">Утилита</span><h1>Карта туалетов</h1></div>
          <button class="button button-primary" data-action="add-toilet">+ Точка</button>
        </div>
        <div class="stack">
          ${state.toilets.map(row => `
            <div class="toilet-row">
              <input class="field" data-bind="toilet" data-row-id="${row.id}" data-field="name" value="${escapeHtml(row.name)}" placeholder="Название">
              <input class="field" data-bind="toilet" data-row-id="${row.id}" data-field="area" value="${escapeHtml(row.area)}" placeholder="Зона">
              <input class="field" data-bind="toilet" data-row-id="${row.id}" data-field="address" value="${escapeHtml(row.address)}" placeholder="Адрес">
              <input class="field flex-2" data-bind="toilet" data-row-id="${row.id}" data-field="mapLink" value="${escapeHtml(row.mapLink)}" placeholder="Ссылка на карту">
              <input class="field flex-2" data-bind="toilet" data-row-id="${row.id}" data-field="note" value="${escapeHtml(row.note)}" placeholder="Примечание">
              <button class="button button-danger" data-action="delete-toilet" data-row-id="${row.id}">Удалить</button>
            </div>
          `).join('')}
        </div>
      </section>
    `;
  }

  initChrome();
  render();

  if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => navigator.serviceWorker.register('./sw.js').catch(() => {}));
  }
})();
