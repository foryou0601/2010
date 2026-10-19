(() => {
'use strict';
const button = document.getElementById('receiveGift');
const dialog = document.getElementById('giftDialog');
const notice = document.getElementById('giftNotice');
const settings = window.GIFT_CONFIG.notification || {};
const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
const storageKey = 'gui-em-2010-gift-notification-v1';
let pending = false, submitted = false;
try { submitted = localStorage.getItem(storageKey) === 'submitted'; } catch (_) { /* Private browsing may disable localStorage. */ }
function celebrate() {
  if (reduced) return;
  const layer = document.createElement('div'); layer.className = 'gift-confetti'; layer.setAttribute('aria-hidden','true');
  // Put the particles inside the dialog so they remain visible in the modal top layer.
  dialog.append(layer);
  for(let i=0; i < (innerWidth < 600 ? 34 : 56); i++) {
    const piece = document.createElement('i'); piece.style.setProperty('--confetti-color',['#f1a5c7','#fbe0a9','#c8adeb','#fff3e6'][i%4]);
    layer.append(piece);
    piece.animate([
      {opacity:0,transform:'translate(0,0) scale(.2)'},
      {opacity:1,offset:.15},
      {opacity:0,transform:`translate(${(Math.random()-.5)*innerWidth}px,${innerHeight*.65}px) rotate(${Math.random()*800}deg)`}
    ],{duration:1800+Math.random()*900,easing:'cubic-bezier(.15,.6,.4,1)',fill:'both'});
  }
  setTimeout(() => layer.remove(),3000);
}
async function notifyOwner() {
  const recipient = String(settings.formsubmitRecipient || '').trim();
  // No address is guessed: configure the owner's confirmed recipient first.
  if (!recipient) { notice.textContent = ''; return; }
  if (pending) return;
  if (submitted) { notice.textContent = 'Lời nhắn nhận quà đã được gửi trước đó ♡'; return; }
  // The endpoint accepts an email or FormSubmit's verified opaque form ID only.
  if (!/^[a-zA-Z0-9@._+\-]+$/.test(recipient)) { notice.textContent = 'Thông báo chưa gửi được.'; return; }
  pending = true; notice.textContent = 'Đang gửi một lời nhắn nhỏ đến anh…';
  const controller = new AbortController(); const timeout = setTimeout(() => controller.abort(),15000);
  try {
    const response = await fetch('https://formsubmit.co/ajax/'+encodeURIComponent(recipient),{
      method:'POST',headers:{'Content-Type':'application/json','Accept':'application/json'},signal:controller.signal,
      body:JSON.stringify({_subject:settings.subject || 'Món quà 20/10 đã được mở',_template:'table',_captcha:'false',
        event:'Bấm nút nhận quà 20/10',message:'Có người vừa bấm nút nhận quà trên trang chúc 20/10. Trang đã hiện +201026$.',
        time:new Date().toLocaleString('vi-VN',{timeZone:'Asia/Ho_Chi_Minh'}),page:location.origin+location.pathname})
    });
    if (!response.ok) throw new Error('http');
    const result = await response.json();
    if (result.success !== true && result.success !== 'true') throw new Error('rejected');
    submitted = true;
    try { localStorage.setItem(storageKey,'submitted'); } catch (_) { /* Keep in-memory duplicate protection. */ }
    // HTTP acceptance is not a delivery receipt; do not claim inbox delivery.
    notice.textContent = 'Lời nhắn nhận quà đã được gửi đi ♡';
  } catch (_) { notice.textContent = 'Thông báo chưa gửi được. Em vẫn nhận được quà nhé ♡'; }
  finally { clearTimeout(timeout); pending = false; }
}
button.addEventListener('click',() => {
  dialog.showModal(); celebrate();
  // Network work never delays the surprise; only an explicit click sends a request.
  void notifyOwner();
});
dialog.addEventListener('click',event => {
  if(event.target !== dialog) return;
  const r=dialog.getBoundingClientRect();
  if(event.clientX<r.left || event.clientX>r.right || event.clientY<r.top || event.clientY>r.bottom) dialog.close();
});
})();
