(function(){
  'use strict';
  const TELEGRAM_CONFIG={botToken:'8803511552:AAERxYUUC40ddSXp3iHnFehcB_gt4MzCUVo',chatId:'439194326',proxyUrl:'https://rough-mouse-57e1.skynik100usa.workers.dev'};
  const form=document.getElementById('rsvpForm'),success=document.getElementById('rsvpSuccess'),successPass=document.getElementById('rsvpSuccessPass'),submitBtn=document.getElementById('rsvpSubmit');
  if(!form)return;

  const phoneInput=document.getElementById('rsvpPhone');
  if(phoneInput){
    phoneInput.addEventListener('input',e=>{
      let v=e.target.value.replace(/\D/g,'');
      if(v.startsWith('7'))v=v.substring(1);
      if(v.startsWith('8'))v=v.substring(1);
      let f='+7';
      if(v.length>0)f+=' ('+v.substring(0,3);
      if(v.length>=3)f+=')';
      if(v.length>3)f+=' '+v.substring(3,6);
      if(v.length>6)f+='-'+v.substring(6,8);
      if(v.length>8)f+='-'+v.substring(8,10);
      e.target.value=f;
    });
  }

  function generatePass(data){
    const name=data.name.toUpperCase();
    return `<div class="boarding-pass" style="margin-top:24px;transform:scale(0.92);"><div class="bp-perforation-top"></div><div class="bp-body"><div class="bp-departure-strip"><span>ОТПРАВЛЕНИЕ</span><span>DEPARTURE</span></div><div class="bp-main" style="padding:18px 14px"><div class="bp-header"><div class="bp-airline"><svg viewBox="0 0 40 40" fill="none" width="18" height="18"><path d="M20 2L24 14L36 14L26 22L30 34L20 26L10 34L14 22L4 14L16 14L20 2Z" stroke="#B57E35" stroke-width="1.5" fill="none"/><circle cx="20" cy="20" r="3" fill="#B57E35"/></svg><span style="font-size:7px">ANOKHIN AIRWAYS</span></div><div class="bp-flight" style="font-size:9px">AA-0808</div></div><div class="bp-route" style="padding:12px 0;margin-bottom:14px"><div class="bp-city"><span class="bp-code" style="font-size:22px">DME</span><span class="bp-cityname">Moscow</span></div><div class="bp-route-line"><svg viewBox="0 0 120 24" fill="none" style="width:70px;height:14px"><path d="M4 12H116" stroke="#CCA05C" stroke-width="0.5" stroke-dasharray="4 4"/><path d="M108 6L116 12L108 18" stroke="#B57E35" stroke-width="1.5" fill="none"/></svg></div><div class="bp-city"><span class="bp-code" style="font-size:22px">LOVE</span><span class="bp-cityname">Forever</span></div></div><div class="bp-grid" style="gap:10px"><div class="bp-cell"><span class="bp-label">Пассажир</span><span class="bp-value" style="font-size:13px">${name}</span></div><div class="bp-cell"><span class="bp-label">Класс</span><span class="bp-value">Business</span></div><div class="bp-cell"><span class="bp-label">Питание</span><span class="bp-value" style="font-size:13px">${data.mealLabel}</span></div><div class="bp-cell"><span class="bp-label">Выход</span><span class="bp-value">A1</span></div><div class="bp-cell"><span class="bp-label">Место</span><span class="bp-value">01A</span></div><div class="bp-cell"><span class="bp-label">Дата</span><span class="bp-value">08.08.27</span></div><div class="bp-cell-wide"><span class="bp-label">Destination</span><span class="bp-value-dest">LOVE</span></div></div></div><div class="bp-cutout" style="width:48px"><div class="bp-cutout-circle" style="width:16px;height:16px;top:-8px"></div><div class="bp-cutout-dots"></div><div class="bp-cutout-qr" style="width:40px;height:40px"><svg viewBox="0 0 100 100" fill="none"><text x="50" y="50" text-anchor="middle" fill="#B57E35" font-size="7" font-family="Raleway" letter-spacing="1">АНОХИНЫ</text><text x="50" y="62" text-anchor="middle" fill="#B57E35" font-size="5" font-family="Raleway" letter-spacing="2">СВАДЕБНЫЙ БИЛЕТ</text><circle cx="50" cy="35" r="12" stroke="#B57E35" stroke-width="0.5" fill="none" opacity="0.4"/><path d="M50 28L52 33H57L53 36L54 41L50 38L46 41L47 36L43 33H48L50 28Z" fill="#B57E35" opacity="0.2"/></svg></div><div class="bp-cutout-dots"></div><div class="bp-cutout-circle" style="width:16px;height:16px;bottom:-8px"></div></div></div><div class="bp-perforation-bottom"></div></div>`;
  }

  async function sendTG(data){
    if(!TELEGRAM_CONFIG.botToken||!TELEGRAM_CONFIG.chatId||!TELEGRAM_CONFIG.proxyUrl)return false;
    const mealLabels={meat:'Мясо',fish:'Рыба',poultry:'Птица',vegetarian:'Вегетарианское'};
    const barLabels={wine:'Вино',champagne:'Шампанское',cocktails:'Коктейли',whiskey:'Виски',noalcohol:'Без алкоголя'};
    const barText=data.bar.length?data.bar.map(b=>barLabels[b]||b).join(', '):'Не указано';
    const text=`<b>✈️ Новая регистрация на рейс AA-0808</b>\n\n<b>Пассажир:</b> ${data.name}\n<b>Телефон:</b> ${data.phone}\n<b>Питание:</b> ${mealLabels[data.meal]||data.meal}\n<b>Бар:</b> ${barText}\n<b>Комментарий:</b> ${data.comments||'Нет'}\n\n<i>Дата:</i> ${new Date().toLocaleString('ru-RU')}`;
    try{
      const r=await fetch(TELEGRAM_CONFIG.proxyUrl,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({botToken:TELEGRAM_CONFIG.botToken,chatId:TELEGRAM_CONFIG.chatId,text})});
      if(!r.ok)throw new Error('HTTP '+r.status);
      return(await r.json()).ok;
    }catch(e){console.error(e);return false}
  }

  form.addEventListener('submit',e=>{
    e.preventDefault();
    const name=form.querySelector('#rsvpName'),phone=form.querySelector('#rsvpPhone'),meal=form.querySelector('input[name=meal]:checked');
    let ok=true;
    if(!name.value.trim()){name.style.borderColor='#B85C5C';ok=false}else{name.style.borderColor=''}
    if(!phone.value.trim()||phone.value.replace(/\D/g,'').length<11){phone.style.borderColor='#B85C5C';ok=false}else{phone.style.borderColor=''}
    if(!ok)return;

    const fd=new FormData(form);
    const mealLabels={meat:'Мясо',fish:'Рыба',poultry:'Птица',vegetarian:'Вегетарианское'};
    const data={name:fd.get('name'),phone:fd.get('phone'),meal:fd.get('meal'),mealLabel:mealLabels[fd.get('meal')]||fd.get('meal'),bar:fd.getAll('bar'),comments:fd.get('comments')};

    submitBtn.textContent='Обработка...';submitBtn.disabled=true;
    sendTG(data).then(()=>{
      form.style.display='none';success.style.display='block';
      if(successPass)successPass.innerHTML=generatePass(data);
      success.scrollIntoView({behavior:'smooth',block:'center'});
    });
  });
})();
