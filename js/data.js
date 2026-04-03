
window.APP_SEED = {
  appName: "Japan Trip Constructor",
  tagline: "Конструктор маршрутов, бронирований и памяток в одном офлайн-приложении",
  theme: "light",
  trips: [
    {
      id: "japan-2026",
      title: "Japan 2026",
      subtitle: "Осака · Фудзи · Токио · Шанхай",
      route: "Москва → Шанхай → Осака → Фудзи → Токио → Шанхай → Москва",
      startDate: "2026-05-11",
      endDate: "2026-05-26",
      accent: "#b03e3e",
      description: "Базовый маршрут из исходного репозитория. Его можно дублировать, править и расширять под любую поездку.",
      flights: [
        { id: "f1", from: "Москва (SVO)", to: "Шанхай (PVG)", date: "2026-05-10", time: "19:05", code: "MU-592" },
        { id: "f2", from: "Шанхай (PVG)", to: "Осака (KIX)", date: "2026-05-11", time: "14:45", code: "MU-8649" },
        { id: "f3", from: "Токио (NRT)", to: "Шанхай (PVG)", date: "2026-05-25", time: "13:50", code: "MU-524" },
        { id: "f4", from: "Шанхай (PVG)", to: "Москва (SVO)", date: "2026-05-26", time: "09:25", code: "MU-247" }
      ],
      stays: [
        { id: "s1", place: "Ebie House", city: "Осака", dates: "11–18 мая", nights: 7, link: "https://www.booking.com/Share-FVKrDuX" },
        { id: "s2", place: "ID Stay Kawaguchiko", city: "Фудзи", dates: "18–20 мая", nights: 2, link: "https://www.booking.com/Share-clpy9hJ" },
        { id: "s3", place: "Ryan inn 99", city: "Токио", dates: "20–25 мая", nights: 5, link: "https://www.booking.com/Share-lQHXfZX" },
        { id: "s4", place: "Ramada Plaza Shanghai Pudong Airport", city: "Шанхай", dates: "25–26 мая", nights: 1, link: "https://www.booking.com/Share-8FxhAs" }
      ],
      cities: [
        { id: "osaka", name: "Осака", dates: "11–18 мая", nights: 7, emoji: "🌆", note: "Первые 7 ночей и база для Киото/Нары" },
        { id: "fuji", name: "Фудзи", dates: "18–20 мая", nights: 2, emoji: "🗻", note: "Озеро Кавагути и виды на гору" },
        { id: "tokyo", name: "Токио", dates: "20–25 мая", nights: 5, emoji: "🗼", note: "Город, в котором хочется потеряться" },
        { id: "shanghai", name: "Шанхай", dates: "25–26 мая", nights: 1, emoji: "🏙", note: "Пересадка и последний отель перед вылетом" }
      ],
      days: [
        {
          id: "day-1",
          date: "2026-05-11",
          city: "Осака",
          title: "Прилёт и адаптация",
          summary: "Приезд в KIX, трансфер и спокойный вечер рядом с домом.",
          items: [
            { id: "d1i1", time: "17:20", type: "flight", title: "Прилёт в Осаку", details: "KIX → трансфер на такси/поезд", mapLink: "https://maps.google.com/?q=KIX" },
            { id: "d1i2", time: "21:00", type: "stay", title: "Заезд в Ebie House", details: "Ключи, заселение и ужин рядом с жильём", mapLink: "https://maps.google.com/?q=Ebie+House" }
          ]
        },
        {
          id: "day-2",
          date: "2026-05-12",
          city: "Осака",
          title: "Центр и Dotonbori",
          summary: "Классический маршрут без спешки.",
          items: [
            { id: "d2i1", time: "10:00", type: "poi", title: "Osaka Castle", details: "Парк, башня и виды на центр", mapLink: "https://maps.google.com/?q=Osaka+Castle" },
            { id: "d2i2", time: "17:30", type: "food", title: "Dotonbori", details: "Ужин и неоновые улицы", mapLink: "https://maps.google.com/?q=Dotonbori" }
          ]
        },
        {
          id: "day-3",
          date: "2026-05-13",
          city: "Осака",
          title: "Университет и шопинг",
          summary: "Один день на более лёгкий темп.",
          items: [
            { id: "d3i1", time: "11:00", type: "poi", title: "Umeda Sky Building", details: "Обзорная площадка и городские виды", mapLink: "https://maps.google.com/?q=Umeda+Sky+Building" },
            { id: "d3i2", time: "19:00", type: "shop", title: "Shinsaibashi", details: "Шопинг и прогулка", mapLink: "https://maps.google.com/?q=Shinsaibashi" }
          ]
        }
      ],
      notes: [
        { id: "n1", title: "Что важно не забыть", body: "Визовые документы, eSIM, зарядки, наличные, копии бронирований." },
        { id: "n2", title: "План Б", body: "Если погода плохая — меняем уличные точки на музеи и торговые центры." }
      ]
    }
  ],
  budget: [
    { id: "b1", category: "Жильё", item: "Ebie House", amount: 78400, currency: "JPY", paid: true },
    { id: "b2", category: "Транспорт", item: "Поезда и трансферы", amount: 36200, currency: "JPY", paid: false },
    { id: "b3", category: "Еда", item: "Кафе и магазины", amount: 48000, currency: "JPY", paid: false },
    { id: "b4", category: "Разное", item: "Сувениры и входные билеты", amount: 21000, currency: "JPY", paid: false }
  ],
  contacts: [
    { id: "c1", name: "Страховка", role: "Полис и телефон поддержки", phone: "+00 000 000 000", note: "Проверь номер на полисе перед выездом" },
    { id: "c2", name: "Посольство", role: "Эмердженси контакты", phone: "+81 00 0000 0000", note: "Сохранить отдельно офлайн" },
    { id: "c3", name: "Семья", role: "Главный чат", phone: "+7 000 000-00-00", note: "Добавить несколько каналов связи" }
  ],
  glossary: [
    { id: "g1", jp: "駅", ru: "станция", note: "чаще всего на указателях" },
    { id: "g2", jp: "出口", ru: "выход", note: "полезно в метро" },
    { id: "g3", jp: "トイレ", ru: "туалет", note: "ищется на табличках" },
    { id: "g4", jp: "改札", ru: "турникет", note: "вход в зону поездов" },
    { id: "g5", jp: "現金", ru: "наличные", note: "cash" }
  ],

  cityPages: {
    osaka: {
      emoji: "🌆",
      title: "Осака",
      dates: "11–18 мая",
      nights: 7,
      note: "База для Киото и Нары, с вечерними прогулками и шопингом.",
      highlights: [
        { title: "Dotonbori", text: "Неон, еда и ночные прогулки вдоль канала." },
        { title: "Osaka Castle", text: "Классическая точка для первого дня в городе." },
        { title: "Umeda Sky Building", text: "Смотровая площадка и отличные виды на мегаполис." }
      ],
      days: [
        { title: "День 1 · Прилёт", text: "Трансфер, заселение и очень мягкий вечер." },
        { title: "День 2 · Центр", text: "Замок, парк и ужин в Dotonbori." },
        { title: "День 3 · Лёгкий темп", text: "Шопинг, кафе и прогулки без спешки." }
      ]
    },
    fuji: {
      emoji: "🗻",
      title: "Фудзи",
      dates: "18–20 мая",
      nights: 2,
      note: "Тишина, озёра и виды на гору, если повезёт с погодой.",
      highlights: [
        { title: "Lake Kawaguchiko", text: "Побережье, виды и спокойный ритм." },
        { title: "Arakurayama Sengen", text: "Иконичный вид на Фудзи и пагоду." },
        { title: "Onsen", text: "Расслабляющий вечер после переезда." }
      ],
      days: [
        { title: "День 1 · Переезд", text: "Из Осаки в район Кавагутико." },
        { title: "День 2 · Видовая программа", text: "Озеро, смотровые и медленный вечер." }
      ]
    },
    tokyo: {
      emoji: "🗼",
      title: "Токио",
      dates: "20–25 мая",
      nights: 5,
      note: "Самый насыщенный блок маршрута: районы, еда, музеи и шопинг.",
      highlights: [
        { title: "Shibuya", text: "Классический символ большого города." },
        { title: "Asakusa", text: "Традиционный Токио и храмы." },
        { title: "Akihabara", text: "Техника, аниме и вечерний свет." }
      ],
      days: [
        { title: "День 1 · Заселение", text: "Переезд и вечер рядом с домом." },
        { title: "День 2 · Классический Токио", text: "Asakusa, Skytree и набережная." },
        { title: "День 3 · Шибуя и Синдзюку", text: "Самые узнаваемые районы города." }
      ]
    },
    shanghai: {
      emoji: "🏙",
      title: "Шанхай",
      dates: "25–26 мая",
      nights: 1,
      note: "Короткая финальная остановка перед вылетом домой.",
      highlights: [
        { title: "Pudong Airport Hotel", text: "Практичный отель возле аэропорта." },
        { title: "The Bund", text: "Если остаётся время на короткую прогулку." },
        { title: "Transfer", text: "Главная задача — комфортно пережить пересадку." }
      ],
      days: [
        { title: "День 1 · Пересадка", text: "Заселение и отдых после длинного маршрута." }
      ]
    }
  },
  toilets: [
    { id: "t1", name: "Osaka Station Restroom", area: "Осака", address: "Near north gate", mapLink: "https://maps.google.com/?q=Osaka+Station", note: "удобно перед отправлением" },
    { id: "t2", name: "Tokyo Station Restroom", area: "Токио", address: "Inside station complex", mapLink: "https://maps.google.com/?q=Tokyo+Station", note: "быстрый доступ" }
  ],
  visaChecklist: [
    { id: "v1", text: "Загранпаспорт и копия", done: true },
    { id: "v2", text: "Брони отелей", done: true },
    { id: "v3", text: "Авиабилеты", done: true },
    { id: "v4", text: "Справка о финансах", done: false },
    { id: "v5", text: "Медстраховка", done: false }
  ]
};
