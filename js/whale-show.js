(() => {
'use strict';
class WhalePhotoShow {
  static sequence(photos) {
    if (!photos.length) return [];
    const six = Array.from({length:6}, (_,index) => photos[index % Math.min(photos.length,6)]);
    return Array.from({length:3}, (_,round) => six.map((photo,index) => ({photo,round:round+1,index:index+1}))).flat();
  }
  constructor({section,sky,whale,status,phase,pauseButton,onBusy}) {
    Object.assign(this,{section,sky,whale,status,phase,pauseButton,onBusy});
    this.reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
    this.animations = new Set(); this.layers = new Set(); this.manualPaused = false; this.controller = null; this.serial = 0;
    pauseButton.addEventListener('click',() => { this.manualPaused = !this.manualPaused; this.syncPause(); });
    document.addEventListener('visibilitychange',() => this.syncPause());
    this.observer = new MutationObserver(() => this.syncPause());
    document.querySelectorAll('dialog').forEach(dialog => this.observer.observe(dialog,{attributes:true,attributeFilter:['open']}));
  }
  get paused() { return this.manualPaused || document.hidden || Boolean(document.querySelector('dialog[open]')); }
  syncPause() {
    const paused = this.paused;
    this.animations.forEach(animation => { if (animation.playState !== 'finished') paused ? animation.pause() : animation.play(); });
    this.pauseButton.textContent = this.manualPaused ? 'Tiếp tục ▷' : 'Tạm dừng Ⅱ';
    this.pauseButton.setAttribute('aria-pressed',String(this.manualPaused));
  }
  sleep(duration,signal) {
    return new Promise((resolve,reject) => {
      let remaining = duration,previous = performance.now(),timer;
      const abort = () => { clearTimeout(timer); signal.removeEventListener('abort',abort); reject(new DOMException('Stopped','AbortError')); };
      const tick = () => {
        if(signal.aborted) return abort();
        const now = performance.now(); if(!this.paused) remaining -= Math.min(now-previous,180); previous = now;
        if(remaining <= 0) { signal.removeEventListener('abort',abort); resolve(); }
        else timer = setTimeout(tick,this.paused ? 180 : 60);
      };
      signal.addEventListener('abort',abort,{once:true}); tick();
    });
  }
  animate(element,frames,options) {
    const animation = element.animate(frames,options); this.animations.add(animation);
    const done = () => this.animations.delete(animation); animation.finished.then(done,done);
    if(this.paused) animation.pause(); return animation;
  }
  mouthPoint() {
    const r = this.whale.querySelector('.mouth').getBoundingClientRect();
    return {x:r.left+r.width*.65,y:r.top+r.height*.5};
  }
  waterJet() {
    if(this.reduced) return;
    const rect = this.section.getBoundingClientRect(), mouth = this.mouthPoint(),sky = this.sky.getBoundingClientRect();
    const x = mouth.x-rect.left,y = mouth.y-rect.top,targetX = sky.left+sky.width*.5-rect.left,targetY = sky.top+sky.height*.5-rect.top;
    const layer = document.createElement('div'); layer.className = 'water-splash';layer.setAttribute('aria-hidden','true');
    this.section.append(layer);this.layers.add(layer);
    const svg = document.createElementNS('http://www.w3.org/2000/svg','svg'); svg.setAttribute('viewBox',`0 0 ${rect.width} ${rect.height}`);svg.setAttribute('preserveAspectRatio','none');layer.append(svg);
    for(let i=0;i<3;i++) {
      const path = document.createElementNS(svg.namespaceURI,'path');
      path.setAttribute('d',`M ${x} ${y} Q ${x-35-i*12} ${targetY-125-i*12} ${targetX+(i-1)*28} ${targetY+45}`);
      path.setAttribute('fill','none');path.setAttribute('stroke',['#8cdaff','#daf7ff','#ffffff'][i]);path.setAttribute('stroke-width',String(5-i*1.5));path.setAttribute('stroke-linecap','round');svg.append(path);
      const length = path.getTotalLength();path.style.strokeDasharray=String(length);
      this.animate(path,[{strokeDashoffset:length,opacity:0},{strokeDashoffset:length*.38,opacity:.9,offset:.3},{strokeDashoffset:0,opacity:.5,offset:.7},{strokeDashoffset:-length*.5,opacity:0}],{duration:1250+i*70,easing:'ease-out',fill:'both'});
    }
    const count = innerWidth < 600 ? 18 : 30;
    for(let i=0;i<count;i++) {
      const drop = document.createElement('i');drop.className='water-drop';drop.style.left=x+'px';drop.style.top=y+'px';
      const size=3+Math.random()*5;drop.style.width=size+'px';drop.style.height=(size*1.6)+'px';layer.append(drop);
      const dx=targetX-x+(Math.random()-.5)*170,dy=targetY-y;
      this.animate(drop,[{transform:'translate(-50%,-50%) scale(.2)',opacity:0},{transform:`translate(${dx*.5}px,${dy-100-Math.random()*70}px) scale(1) rotate(-25deg)`,opacity:.95,offset:.48},{transform:`translate(${dx}px,${dy+100+Math.random()*100}px) scale(.4) rotate(30deg)`,opacity:0}],{duration:1200+Math.random()*650,delay:Math.random()*140,easing:'cubic-bezier(.18,.55,.5,1)',fill:'both'});
    }
    const signal=this.controller.signal;
    this.sleep(2100,signal).then(() => {layer.remove();this.layers.delete(layer);},() => {layer.remove();this.layers.delete(layer);});
  }
  async fly(direction,signal) {
    // Translation only: the character keeps the same small size for the entire flight.
    const distance = Math.max(innerWidth,this.section.getBoundingClientRect().width)+160;
    const resting = 'translate(-50%,0) rotate(0deg)';
    const offscreen = direction === 'in'
      ? `translate(calc(-50% - ${distance}px),-32px) rotate(-9deg)`
      : `translate(calc(-50% + ${distance}px),-65px) rotate(-7deg)`;
    this.whale.classList.add('arrived');
    if(this.reduced) { if(direction === 'out') this.whale.classList.remove('arrived'); return; }
    const frames = direction === 'in'
      ? [{transform:offscreen,opacity:0},{opacity:1,offset:.18},{transform:resting,opacity:1}]
      : [{transform:resting,opacity:1},{opacity:1,offset:.7},{transform:offscreen,opacity:0}];
    const duration = direction === 'in' ? 1800 : 1400;
    const animation = this.animate(this.whale,frames,{duration,easing:'cubic-bezier(.22,.65,.28,1)',fill:'both'});
    // Remove the retained animation effect so replay can reliably hide the whale.
    animation.finished.then(() => { if(direction === 'out' && !signal.aborted) this.whale.classList.remove('arrived'); animation.cancel(); },() => {});
    await this.sleep(duration+80,signal);
    if(signal.aborted) throw new DOMException('Stopped','AbortError');
    if(direction === 'out') this.whale.classList.remove('arrived');
  }
  makeFrame(photo) {
    const frame=document.createElement('button');frame.className='memory memory-feature';frame.setAttribute('aria-label','Xem ảnh: '+photo.caption);
    const img=document.createElement('img');img.src=photo.src;img.alt=photo.caption;
    const caption=document.createElement('span');caption.textContent=photo.caption;frame.append(img,caption);this.sky.append(frame);
    frame.addEventListener('click',()=>{document.getElementById('fullPhoto').src=photo.src;document.getElementById('fullCaption').textContent=photo.caption;document.getElementById('photoViewer').showModal();});
    return frame;
  }
  stop() {
    this.serial++; if(this.controller)this.controller.abort();this.controller=null;
    this.animations.forEach(animation=>animation.cancel());this.animations.clear();
    this.layers.forEach(layer=>layer.remove());this.layers.clear();this.sky.replaceChildren();
    this.whale.classList.remove('open','swallowing','spouting','arrived');this.manualPaused=false;this.pauseButton.disabled=true;this.pauseButton.textContent='Tạm dừng Ⅱ';this.pauseButton.setAttribute('aria-pressed','false');
    this.onBusy(false);
  }
  async start(photos) {
    this.stop();const serial=this.serial,sequence=WhalePhotoShow.sequence([...photos]);
    if(!sequence.length) {this.phase.textContent='Thêm vài tấm ảnh để cá voi mang đến em nhé.';return;}
    const check = () => { if (signal.aborted || this.serial !== serial) throw new DOMException("Stopped","AbortError"); };
    const controller=new AbortController();this.controller=controller;const signal=controller.signal;
    this.onBusy(true);this.pauseButton.disabled=false;
    // Decode the six sources once. A slow photo never blocks cancellation or the sequence.
    for(const {photo} of sequence.slice(0,6)) {const image=new Image();image.src=photo.src;}
    try {
      this.status.textContent='Cá voi đang bay đến bên em…';
      this.phase.textContent='Một người bạn nhỏ, mang theo những kỷ niệm.';
      await this.fly('in',signal);check();
      for(const item of sequence) {
        this.status.textContent=`Lượt ${item.round} / 3 · Ảnh ${item.index} / 6`;
        this.phase.textContent='Một tia nước, một kỷ niệm của chúng mình.';
        this.whale.classList.add('open');await this.sleep(this.reduced?100:500,signal);check();
        this.whale.classList.add('spouting');this.waterJet();
        const frame=this.makeFrame(item.photo),mouth=this.mouthPoint(),sky=this.sky.getBoundingClientRect();
        const dx=mouth.x-(sky.left+sky.width/2),dy=mouth.y-(sky.top+sky.height/2);
        this.animate(frame,[{transform:`translate(calc(-50% + ${dx}px),calc(-50% + ${dy}px)) scale(.04) rotate(28deg)`,opacity:0},{opacity:1,offset:.22},{transform:'translate(-50%,-50%) scale(1) rotate(-4deg)',opacity:1}],{duration:this.reduced?180:1400,easing:'cubic-bezier(.15,.7,.25,1)',fill:'both'});
        await this.sleep(this.reduced?200:1450,signal);check();this.whale.classList.remove('open','spouting');
        this.phase.textContent='Chạm vào ảnh nếu em muốn ngắm lâu hơn ♡';
        await this.sleep(this.reduced?1400:2300,signal);check();
        this.phase.textContent='Cá voi cất kỷ niệm này, chuẩn bị một bất ngờ mới…';this.whale.classList.add('open','swallowing');
        await this.sleep(this.reduced?100:380,signal);check();
        const nextMouth=this.mouthPoint(),nextSky=this.sky.getBoundingClientRect();
        const tx=nextMouth.x-(nextSky.left+nextSky.width/2),ty=nextMouth.y-(nextSky.top+nextSky.height/2);
        this.animate(frame,[{transform:'translate(-50%,-50%) scale(1) rotate(-4deg)',opacity:1},{transform:`translate(calc(-50% + ${tx*.3}px),calc(-50% + ${ty*.2}px)) scale(.85) rotate(12deg)`,opacity:1,offset:.3},{transform:`translate(calc(-50% + ${tx}px),calc(-50% + ${ty}px)) scale(.025) rotate(75deg)`,opacity:0}],{duration:this.reduced?160:1050,easing:'cubic-bezier(.6,.02,.85,.4)',fill:'both'});
        await this.sleep(this.reduced?180:1100,signal);check();frame.remove();this.whale.classList.remove('open','swallowing');await this.sleep(this.reduced?100:220,signal);check();
      }
      await this.fly('out',signal);check();
      this.status.textContent='3 lượt · 18 lần gửi yêu thương';this.phase.textContent='Cá voi đã cất đủ những kỷ niệm của chúng mình ♡';
      const ending=document.createElement('div');ending.className='journey-done';const heart=document.createElement('span');heart.textContent='♡';const text=document.createElement('p');text.textContent='Tất cả đều được giữ lại, ở một nơi rất thương.';ending.append(heart,text);this.sky.append(ending);
    } catch(error) {if(error.name!=='AbortError')this.phase.textContent='Chạm “Xem lại 3 lượt” để tiếp tục cùng cá voi nhé.';}
    finally {if(this.serial===serial){this.controller=null;this.whale.classList.remove('open','swallowing','spouting');this.pauseButton.disabled=true;this.onBusy(false);}}
  }
}
window.WhalePhotoShow=WhalePhotoShow;
})();
