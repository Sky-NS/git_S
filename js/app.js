(function(){
  'use strict';

  // Intro overlay
  const intro=document.getElementById('introOverlay');
  const introBtn=document.getElementById('introBtn');
  const pageWrapper=document.getElementById('pageWrapper');
  if(pageWrapper) pageWrapper.style.display='none';

  if(intro && introBtn){
    introBtn.addEventListener('click',()=>{
      intro.classList.add('hidden');
      setTimeout(()=>{intro.style.display='none';if(pageWrapper)pageWrapper.style.display='block';},900);
    });
  }

  // Intro particles
  const cvs=document.getElementById('introParticles');
  if(cvs){
    const ctx=cvs.getContext('2d');
    const resize=()=>{cvs.width=window.innerWidth;cvs.height=window.innerHeight};
    resize();
    window.addEventListener('resize',resize);
    const particles=Array.from({length:35},()=>({
      x:Math.random()*cvs.width,
      y:Math.random()*cvs.height,
      r:Math.random()*2+1,
      vy:-(Math.random()*.35+.08),
      heart:Math.random()<.35,
      alpha:Math.random()*.5+.3
    }));
    function draw(){
      ctx.clearRect(0,0,cvs.width,cvs.height);
      particles.forEach(p=>{
        p.y+=p.vy;
        if(p.y<-20)p.y=cvs.height+20;
        ctx.globalAlpha=p.alpha;
        ctx.fillStyle='#B57E35';
        if(p.heart){
          ctx.font='12px serif';
          ctx.fillText('♡',p.x,p.y);
        }else{
          ctx.beginPath();
          ctx.arc(p.x,p.y,p.r,0,Math.PI*2);
          ctx.fill();
        }
      });
      ctx.globalAlpha=1;
      requestAnimationFrame(draw);
    }
    draw();
  }

  // Flying planes
  const fpContainer=document.getElementById('flyingPlanes');
  if(fpContainer){
    const planes=['✈','🛩','✈'];
    planes.forEach((p,i)=>{
      const el=document.createElement('div');
      el.className='flying-plane';
      el.textContent=p;
      el.style.top=(15+i*25)+'%';
      el.style.animation=`planeFly${i+1} ${16+i*3}s linear infinite`;
      el.style.animationDelay=(i*4)+'s';
      fpContainer.appendChild(el);
    });
  }

  // Cursor sparks
  const sparkContainer=document.getElementById('cursorSparks');
  let lastSpark=0;
  if(sparkContainer && window.matchMedia('(pointer:fine)').matches){
    document.addEventListener('mousemove',e=>{
      const now=Date.now();
      if(now-lastSpark<90||Math.random()>.35)return;
      lastSpark=now;
      const spark=document.createElement('div');
      spark.className='cursor-spark';
      const size=Math.random()*5+3;
      spark.style.width=size+'px';
      spark.style.height=size+'px';
      spark.style.left=e.clientX+'px';
      spark.style.top=e.clientY+'px';
      spark.style.background=Math.random()>.5?'#B57E35':'#E8D09A';
      sparkContainer.appendChild(spark);
      setTimeout(()=>spark.remove(),680);
    });
  }

  // Progress bar
  const pBar=document.getElementById('progressBar');
  if(pBar){
    window.addEventListener('scroll',()=>{
      const s=window.scrollY;
      const d=document.documentElement.scrollHeight-window.innerHeight;
      pBar.style.width=(d?((s/d)*100):0)+'%';
    },{passive:true});
  }

  // Mobile nav
  const navToggle=document.getElementById('navToggle');
  const navMenu=document.getElementById('navMenu');
  if(navToggle && navMenu){
    navToggle.addEventListener('click',()=>{
      const open=navMenu.classList.toggle('open');
      navToggle.classList.toggle('active',open);
      document.body.style.overflow=open?'hidden':'';
    });
    navMenu.querySelectorAll('.nav-link').forEach(l=>l.addEventListener('click',()=>{
      navMenu.classList.remove('open');
      navToggle.classList.remove('active');
      document.body.style.overflow='';
    }));
  }

  // Smooth scroll
  document.querySelectorAll('a[href^="#"]').forEach(a=>{
    a.addEventListener('click',e=>{
      e.preventDefault();
      const t=document.querySelector(a.getAttribute('href'));
      if(t)window.scrollTo({top:t.offsetTop-20,behavior:'smooth'});
    });
  });

  // Boarding pass 3D tilt
  const bp=document.getElementById('boardingPass');
  if(bp && window.matchMedia('(pointer:fine)').matches){
    bp.addEventListener('mousemove',e=>{
      const r=bp.getBoundingClientRect();
      const x=e.clientX-r.left,y=e.clientY-r.top;
      bp.style.transform=`perspective(1000px) rotateX(${(y-r.height/2)/30}deg) rotateY(${-(x-r.width/2)/30}deg) translateY(-2px)`;
    });
    bp.addEventListener('mouseleave',()=>{
      bp.style.transform='perspective(1000px) rotateX(0) rotateY(0) translateY(0)';
    });
  }

  // Heart burst
  function createBurst(x,y){
    const items=['♡','✈','💛','⭐'];
    for(let i=0;i<12;i++){
      const el=document.createElement('div');
      el.textContent=items[Math.floor(Math.random()*items.length)];
      el.style.cssText='position:fixed;left:'+x+'px;top:'+y+'px;font-size:'+(Math.random()*10+14)+'px;color:var(--gold);pointer-events:none;z-index:9999;transition:all 1.1s ease;';
      document.body.appendChild(el);
      const angle=(Math.PI*2*i)/12;
      const dist=Math.random()*45+55;
      requestAnimationFrame(()=>{
        el.style.transform=`translate(${Math.cos(angle)*dist}px,${Math.sin(angle)*dist}px) scale(1.3)`;
        el.style.opacity='0';
      });
      setTimeout(()=>el.remove(),1100);
    }
  }

  const rings=document.getElementById('heroRings');
  if(rings) rings.addEventListener('click',e=>createBurst(e.clientX,e.clientY));

  // RSVP burst
  const rsvpForm=document.getElementById('rsvpForm');
  if(rsvpForm){
    rsvpForm.addEventListener('submit',e=>{
      if(rsvpForm.checkValidity()){
        const btn=document.getElementById('rsvpSubmit');
        const rect=btn.getBoundingClientRect();
        createBurst(rect.left+rect.width/2,rect.top+rect.height/2);
      }
    });
  }

  // Service Worker
  if('serviceWorker' in navigator){
    window.addEventListener('load',()=>{
      navigator.serviceWorker.register('sw.js').catch(()=>{});
    });
  }

  console.log('%c ANOKHIN AIRWAYS ','background:#1C1208;color:#E8D09A;font-size:14px;font-weight:bold;padding:8px 16px;border-radius:4px');
})();
