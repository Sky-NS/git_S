/**
 * ANOKHIN AIRWAYS — Google Apps Script Proxy
 * 
 * Инструкция по настройке:
 * 1. Перейдите на https://script.google.com
 * 2. Создайте новый проект
 * 3. Удалите весь код по умолчанию и вставьте этот
 * 4. Нажмите «Развернуть» → «Новое развертывание»
 * 5. Тип: «Веб-приложение»
 * 6. Кто имеет доступ: «Все»
 * 7. Нажмите «Развернуть», дайте разрешения
 * 8. Скопируйте URL вида https://script.google.com/macros/s/XXXX/exec
 * 9. Вставьте его в js/rsvp.js в поле proxyUrl
 */

function doPost(e) {
  try {
    var data = JSON.parse(e.postData.contents);

    var url = 'https://api.telegram.org/bot' + data.botToken + '/sendMessage';
    var payload = JSON.stringify({
      chat_id: data.chatId,
      text: data.text,
      parse_mode: 'HTML'
    });

    var options = {
      method: 'post',
      contentType: 'application/json',
      payload: payload,
      muteHttpExceptions: true
    };

    var response = UrlFetchApp.fetch(url, options);
    var json = JSON.parse(response.getContentText());

    return ContentService
      .createTextOutput(JSON.stringify(json))
      .setMimeType(ContentService.MimeType.JSON);

  } catch(err) {
    return ContentService
      .createTextOutput(JSON.stringify({ok: false, error: err.toString()}))
      .setMimeType(ContentService.MimeType.JSON);
  }
}
