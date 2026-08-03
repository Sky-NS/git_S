/**
 * ANOKHIN AIRWAYS — Cloudflare Worker Proxy (Service Worker format)
 * 
 * ИНСТРУКЦИЯ:
 * 1. Зайдите в панель Cloudflare Workers
 * 2. Нажмите «Create a Service» (НЕ «Create a Worker» в модульном формате)
 * 3. Или отредактируйте существующий Worker
 * 4. Удалите весь код по умолчанию
 * 5. Вставьте этот код
 * 6. Нажмите «Save and Deploy»
 * 7. Скопируйте URL Worker'а
 * 8. Вставьте в js/rsvp.js в поле proxyUrl (БЕЗ слеша в конце!)
 */

addEventListener('fetch', event => {
  event.respondWith(handleRequest(event.request))
})

async function handleRequest(request) {
  // CORS preflight
  if (request.method === 'OPTIONS') {
    return new Response(null, {
      status: 204,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type'
      }
    })
  }

  // Only POST allowed
  if (request.method !== 'POST') {
    return new Response(JSON.stringify({ok: false, error: 'Method Not Allowed'}), {
      status: 405,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      }
    })
  }

  try {
    const { botToken, chatId, text } = await request.json()

    if (!botToken || !chatId || !text) {
      return new Response(JSON.stringify({ok: false, error: 'Missing parameters'}), {
        status: 400,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*'
        }
      })
    }

    const response = await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: chatId,
        text: text,
        parse_mode: 'HTML'
      })
    })

    const data = await response.json()

    return new Response(JSON.stringify(data), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      }
    })

  } catch (err) {
    return new Response(JSON.stringify({ok: false, error: err.message}), {
      status: 500,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      }
    })
  }
}
