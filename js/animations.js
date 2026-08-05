(function(){
  'use strict';
  function init(){
    if(typeof gsap==='undefined'||typeof ScrollTrigger==='undefined'){
      setTimeout(init,100);return;
    }
    gsap.registerPlugin(ScrollTrigger);

    // Scroll reveal
    const revealEls=document.querySelectorAll(
      '.section-title,.section-eyebrow,.section-subtitle,.bp-main,.story-photo,.story-text,.route-svg,.timeline-item,.venue-card,.dc-item,.dress-photo,.baggage-card,.countdown-unit,.rsvp-field,.rsvp-submit'
    );
    const obs=new IntersectionObserver((entries)=>{
      entries.forEach(en=>{
        if(en.isIntersecting){
          en.target.classList.add('visible');
          obs.unobserve(en.target);
        }
      });
    },{threshold:0.15});
    revealEls.forEach(el=>{el.classList.add('reveal');obs.observe(el)});

    // Boarding pass
    const bp=document.getElementById('boardingPass');
    if(bp){
      gsap.fromTo(bp,{y:60,opacity:0,rotateX:5},{y:0,opacity:1,rotateX:0,duration:1.2,ease:'power3.out',scrollTrigger:{trigger:bp,start:'top 85%'}});
    }

    // Route plane
    const fp=document.getElementById('flightPath');
    const rp=document.getElementById('routePlane');
    if(fp&&rp){
      const len=fp.getTotalLength();
      gsap.set(rp,{motionPath:{path:fp,align:fp,alignOrigin:[.5,.5],autoRotate:true}});
      gsap.to(rp,{motionPath:{path:fp,align:fp,alignOrigin:[.5,.5],autoRotate:true},ease:'none',scrollTrigger:{trigger:'.route-visual',start:'top 80%',end:'bottom 20%',scrub:1}});
      gsap.fromTo(fp,{strokeDasharray:len,strokeDashoffset:len},{strokeDashoffset:0,ease:'none',scrollTrigger:{trigger:'.route-visual',start:'top 80%',end:'bottom 20%',scrub:1}});
    }

    // Timeline plane
    const tTrack=document.getElementById('timelineTrack');
    const tPlane=document.getElementById('timelinePlane');
    if(tTrack&&tPlane){
      const items=tTrack.querySelectorAll('.timeline-item');
      ScrollTrigger.create({
        trigger:tTrack,start:'top 70%',end:'bottom 50%',
        onUpdate:(self)=>{
          const idx=Math.min(Math.floor(self.progress*items.length),items.length-1);
          items.forEach((it,i)=>it.classList.toggle('active',i===idx));
          if(items[idx]){
            const r=items[idx].getBoundingClientRect();
            const tr=tTrack.getBoundingClientRect();
            tPlane.style.top=(r.top-tr.top+10)+'px';
          }
        }
      });
    }

    // Parallax
    gsap.utils.toArray('.hero-rings,.story-orb,.rsvp-orb').forEach(el=>{
      gsap.to(el,{y:-40,ease:'none',scrollTrigger:{trigger:el.closest('section'),start:'top bottom',end:'bottom top',scrub:1}});
    });
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init);else init();
})();
