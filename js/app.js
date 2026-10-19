(() => {
'use strict';
const $ = id => document.getElementById(id);
const config = window.GIFT_CONFIG;
const music = $('music'), bloom = $('bloomSound');
const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
// A small static star field keeps the mobile GPU free for the flowers.
const starFragment = document.createDocumentFragment();
for (let i = 0; i < (innerWidth < 600 ? 65 : 110); i++) {
  const star = document.createElement('i'); star.className = 'star';
  const size = i % 9 === 0 ? 2 : 1;
  star.style.cssText = `left:${Math.random()*100}%;top:${Math.random()*100}%;width:${size}px;height:${size}px;--o:${.25+Math.random()*.6};--duration:${3+Math.random()*5}s;--delay:${-Math.random()*8}s`;
  starFragment.append(star);
}
$('stars').append(starFragment);
document.addEventListener('visibilitychange', () => document.body.classList.toggle('page-hidden', document.hidden));
let soundOn = true, started = false, busy = false, timers = [], photos = [...config.photos], photoUrls = [], musicUrl = null;
const later = (fn, delay) => { const id = setTimeout(fn, delay); timers.push(id); return id; };
const safePlay = audio => { const result = audio.play(); if (result) result.catch(() => { $('sound').textContent = '♫ Chạm để nghe'; }); };
function setSound() {
  music.muted = !soundOn; bloom.muted = !soundOn;
  $('sound').setAttribute('aria-pressed', String(soundOn));
  $('sound').innerHTML = soundOn ? '♫ <span>Đang bật</span>' : '♪ <span>Đã tắt</span>';
}
function showScene(id, chapter) {
  document.querySelectorAll('.scene').forEach(scene => scene.classList.toggle('active', scene.id === id));
  $('chapter').textContent = chapter + ' — 03';
  window.scrollTo({top: 0, behavior: 'instant'});
}
function renderLetter() {
  $('dear').textContent = config.dear;
  $('letterText').replaceChildren(...config.paragraphs.map(text => { const p = document.createElement('p'); p.textContent = text; return p; }));
}
function burst() {
  const count = reduced ? 24 : (innerWidth < 600 ? 64 : 110);
  for (let i = 0; i < count; i++) {
    const node = document.createElement('div'); node.className = 'flying-flower';
    const size = 40 + Math.random() * (innerWidth < 600 ? 66 : 100);
    node.style.width = node.style.height = size + 'px';
    const img = document.createElement('img'); img.src = 'images/rose-real.webp'; img.alt = ''; node.append(img); $('petals').append(node);
    const angle = Math.random() * Math.PI * 2;
    const radius = Math.random() * Math.max(innerWidth, innerHeight) * .85;
    const x = Math.cos(angle) * radius, y = Math.sin(angle) * radius;
    const anim = node.animate([
      {transform: 'translate(-50%,-50%) scale(0)', opacity:0},
      {transform: `translate(${x}px,${y}px) rotate(${i*29}deg) scale(1)`, opacity:1, offset:.28},
      {transform: `translate(${x+60}px,${y+innerHeight*.8}px) rotate(${i*37}deg) scale(.8)`, opacity:0}
    ], {duration: reduced ? 1000 : 4300 + Math.random()*1600, delay:Math.random()*240, fill:'both', easing:'cubic-bezier(.12,.65,.35,1)'});
    anim.onfinish = () => node.remove();
  }
}
function musicFade() {
  let step = 0;
  function fade() { music.volume = Math.min(.42, step++ * .025); if (step < 19 && started) later(fade, 100); }
  fade();
}
$('sound').addEventListener('click', () => {
  soundOn = !soundOn; setSound();
  if (started && soundOn) safePlay(music);
});
$('start').addEventListener('click', () => {
  if (started) return; started = true; $('start').disabled = true;
  document.querySelectorAll('.real-rose').forEach(img => { if (!img.complete) img.loading = 'eager'; });
  // Start both audio elements within the user gesture; the music fades in after the flowers.
  music.volume = 0; music.currentTime = 0; setSound(); safePlay(music);
  bloom.currentTime = 0; safePlay(bloom);
  const rose = $('rose'); $('bloomTarget').append(rose);
  showScene('bloomScene', '01');
  later(() => rose.classList.add('open'), 120);
  later(() => { burst(); bloom.currentTime = 0; safePlay(bloom); }, reduced ? 500 : 2900);
  later(musicFade, reduced ? 800 : 3500);
  later(() => { showScene('letterScene', '02'); $('closeLetter').focus({preventScroll:true}); }, reduced ? 1900 : 6800);
});
const photoShow = new window.WhalePhotoShow({
  section: $('whaleScene'), sky: $('photoSky'), whale: $('whale'),
  status: $('journeyStatus'), phase: $('journeyPhase'), pauseButton: $('pauseJourney'),
  onBusy(value) { busy = value; $('morePhotos').disabled = value; }
});
function releasePhotos() { return photoShow.start(photos); }
$('closeLetter').addEventListener('click', () => { showScene('whaleScene', '03'); later(releasePhotos, 850); });
$('morePhotos').addEventListener('click', releasePhotos);
$('replay').addEventListener('click', () => {
  photoShow.stop();
  timers.forEach(clearTimeout); timers = []; started = false; busy = false;
  $('petals').replaceChildren(); $('photoSky').replaceChildren(); $('whale').classList.remove('open');
  $('morePhotos').disabled = false; $('start').disabled = false;
  $('rose').classList.remove('open'); document.querySelector('.flower-stage').append($('rose'));
  music.pause(); bloom.pause(); showScene('intro', '01'); $('start').focus({preventScroll:true});
});
$('customize').addEventListener('click', () => { $('dearInput').value = config.dear; $('letterInput').value = config.paragraphs.join('\n\n'); $('editor').showModal(); });
$('saveCustom').addEventListener('click', () => {
  config.dear = $('dearInput').value.trim() || 'Em yêu à,';
  config.paragraphs = $('letterInput').value.split(/\n\s*\n/).filter(p => p.trim()); renderLetter();
  const selected = [...$('photosInput').files].slice(0,6);
  if (selected.length) {
    photoShow.stop();
    photoUrls.forEach(URL.revokeObjectURL); photoUrls = selected.map(file => URL.createObjectURL(file));
    photos = photoUrls.map((src,i) => ({src,caption:'Kỷ niệm của chúng mình · '+(i+1)}));
  }
  const track = $('musicInput').files[0];
  if (track) { if (musicUrl) URL.revokeObjectURL(musicUrl); musicUrl = URL.createObjectURL(track); music.src = musicUrl; music.volume = .42; if(started) safePlay(music); }
  $('editor').close();
  if ($('whaleScene').classList.contains('active') && !busy) releasePhotos();
});
for (const id of ['editor','photoViewer']) $(id).addEventListener('click', event => {
  if(event.target === $(id)) { const r = $(id).getBoundingClientRect(); if(event.clientX < r.left || event.clientX > r.right || event.clientY < r.top || event.clientY > r.bottom) $(id).close(); }
});
music.src = config.music; renderLetter(); setSound();
// Decode larger cutouts before their scene, without blocking the opening screen.
for (const src of ['images/whale-cute-closed.webp','images/whale-cute-open.webp','images/rose-bud.webp']) { const image = new Image(); image.src = src; }
})();
