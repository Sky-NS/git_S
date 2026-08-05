(function(){
  'use strict';
  const WEDDING_DATE=new Date('2027-08-08T13:00:00').getTime();
  const els={days:document.getElementById('countDays'),hours:document.getElementById('countHours'),minutes:document.getElementById('countMinutes'),seconds:document.getElementById('countSeconds')};
  function pad(n){return n<10?'0'+n:String(n)}
  function tick(){
    const diff=WEDDING_DATE-Date.now();
    if(diff<=0){['days','hours','minutes','seconds'].forEach(k=>els[k]&&(els[k].textContent='00'));return}
    const d=Math.floor(diff/864e5),h=Math.floor((diff%864e5)/36e5),m=Math.floor((diff%36e5)/6e4),s=Math.floor((diff%6e4)/1e3);
    if(els.days)els.days.textContent=pad(d);
    if(els.hours)els.hours.textContent=pad(h);
    if(els.minutes)els.minutes.textContent=pad(m);
    if(els.seconds)els.seconds.textContent=pad(s);
  }
  tick();
  setInterval(tick,1000);
})();
