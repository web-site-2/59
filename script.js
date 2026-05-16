/* ═══════════════════════════════════════════════════
   ROMANTIC SPA — script.js  v4
   Music on password screen · Deep romantic dark theme
   ═══════════════════════════════════════════════════ */
'use strict';

/* ══════════════════════════════════════════════════
   ⚙️  CONFIG — Edit to personalise
   ══════════════════════════════════════════════════ */
const CONFIG = {
  password:      'حبيبي',
  relationStart: new Date('2023-02-14T00:00:00'),

  messages: [
    { icon: '💌', text: 'لو عمري كان كتاب، كل صفحة فيه كانت بتبدأ بسمك...' },
    { icon: '🌹', text: 'ما عرفت معنى الطمأنينة إلا لما كنت جنبك، وما عرفت معنى الغياب إلا لما بعدت عني.' },
    { icon: '🌙', text: 'كل نجمة في السما تحكي جزء من قصتنا، والقصة لسه في أجمل فصولها.' },
    { icon: '💫', text: 'أنتِ مش بس حبيبتي، أنتِ البيت اللي حلمت بيه ولقيته أجمل مما تخيلت.' },
    { icon: '❤️', text: 'آسف على كل لحظة وجعتك فيها. وعدي إنك دايماً تلاقي قلبي طريق للبيت.' },
    { icon: '✨', text: 'بحبك مش بس الأيام الحلوة.. بحبك في كل يوم، في كل تفصيلة، في كل نظرة.' },
  ],

  finalTitle: 'أنتِ الأجمل في حياتي',
  finalMsg:
    'كل كلمة قلتها جاية من أعمق مكان في قلبي.\n' +
    'أنتِ نعمة ما أستحقها، وحلم صحيت منه وهو حقيقي.\n' +
    'بحبك دايماً... أكثر مما تتخيلي ❤️',
};

/* ══════════════════════════════════════════════════
   🌐  GLOBAL STATE
   ══════════════════════════════════════════════════ */
let _screen       = null;
let _cdTimer      = null;
let _confettiAF   = null;
let _typingTimer  = null;
let _transitioning = false;
let _musicPlaying  = false;

/* ══════════════════════════════════════════════════
   🌌  PARTICLE SYSTEM  (floating hearts/stars)
   ══════════════════════════════════════════════════ */
(function initParticles() {
  const canvas = document.getElementById('particleCanvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  let W, H;
  const CHARS = ['❤', '♡', '✦', '✿', '·'];
  const COLORS = [
    'rgba(240,98,146,',   // rose-300
    'rgba(194,24,91,',    // crimson
    'rgba(244,143,177,',  // rose-200
    'rgba(255,179,71,',   // gold
    'rgba(206,147,216,',  // purple tint
  ];
  const MAX = () => window.innerWidth < 480 ? 14 : 24;

  function resize() {
    W = canvas.width  = window.innerWidth;
    H = canvas.height = window.innerHeight;
  }

  function mkParticle() {
    const colorBase = COLORS[Math.floor(Math.random() * COLORS.length)];
    return {
      x:     Math.random() * W,
      y:     H + 20,
      size:  7 + Math.random() * 14,
      vy:    -(0.4 + Math.random() * 0.8),  // floating UP
      vx:    (Math.random() - 0.5) * 0.4,
      drift: Math.random() * Math.PI * 2,
      sway:  (Math.random() - 0.5) * 0.6,
      alpha: 0.12 + Math.random() * 0.35,
      char:  CHARS[Math.floor(Math.random() * CHARS.length)],
      color: colorBase,
      pulse: Math.random() * Math.PI * 2,
    };
  }

  let particles = [];

  function tick() {
    ctx.clearRect(0, 0, W, H);
    if (particles.length < MAX() && Math.random() < 0.055) {
      particles.push(mkParticle());
    }

    particles = particles.filter(p => {
      p.drift += 0.016;
      p.pulse += 0.04;
      p.x     += Math.sin(p.drift) * p.sway + p.vx;
      p.y     += p.vy;
      // subtle size pulse
      const sz = p.size * (1 + Math.sin(p.pulse) * 0.08);

      ctx.save();
      ctx.globalAlpha = p.alpha * (0.85 + Math.sin(p.pulse) * 0.15);
      ctx.font        = `${sz}px serif`;
      ctx.fillStyle   = p.color + '1)';
      ctx.textAlign   = 'center';
      ctx.fillText(p.char, p.x, p.y);
      ctx.restore();

      return p.y > -30;
    });

    requestAnimationFrame(tick);
  }

  window.addEventListener('resize', resize, { passive: true });
  resize();
  tick();
})();

/* ══════════════════════════════════════════════════
   🔊  CLICK SOUND
   ══════════════════════════════════════════════════ */
let _ac = null;
function playClick() {
  try {
    if (!_ac) _ac = new (window.AudioContext || window.webkitAudioContext)();
    if (_ac.state === 'suspended') _ac.resume();
    const osc  = _ac.createOscillator();
    const gain = _ac.createGain();
    osc.connect(gain);
    gain.connect(_ac.destination);
    osc.type = 'sine';
    osc.frequency.setValueAtTime(880, _ac.currentTime);
    osc.frequency.exponentialRampToValueAtTime(440, _ac.currentTime + 0.14);
    gain.gain.setValueAtTime(0.06, _ac.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, _ac.currentTime + 0.2);
    osc.start(_ac.currentTime);
    osc.stop(_ac.currentTime + 0.22);
  } catch (e) { /* silent */ }
}

/* ══════════════════════════════════════════════════
   🎬  SCREEN ENGINE
   ══════════════════════════════════════════════════ */
function showScreen(id, onShown) {
  if (_transitioning) return;
  const next = document.getElementById(id);
  if (!next || next === _screen) return;
  _transitioning = true;

  const prev = _screen;
  if (prev) {
    prev.classList.add('exit');
    setTimeout(() => prev.classList.remove('active', 'exit'), 650);
  }

  setTimeout(() => {
    next.classList.add('active');
    _screen = next;
    _transitioning = false;
    if (typeof onShown === 'function') onShown();
  }, prev ? 320 : 0);
}

/* ══════════════════════════════════════════════════
   🎵  MUSIC PLAYER  (on password screen)
   ══════════════════════════════════════════════════ */
function initMusicPlayer() {
  const audio    = document.getElementById('bgMusic');
  const disc     = document.getElementById('playerDisc');
  const bars     = document.getElementById('playerBars');
  const toggle   = document.getElementById('playerToggle');
  const iconEl   = document.getElementById('playerIcon');
  if (!audio || !toggle) return;

  function setPlaying(v) {
    _musicPlaying = v;
    if (iconEl)  iconEl.textContent = v ? '⏸' : '▶';
    if (disc)    disc.classList.toggle('spinning', v);
    if (bars)    bars.classList.toggle('active', v);
  }

  toggle.addEventListener('click', () => {
    playClick();
    if (!_musicPlaying) {
      audio.play().catch(() => {
        console.warn('Place music.mp3 in the same folder to enable music.');
      });
      setPlaying(true);
    } else {
      audio.pause();
      setPlaying(false);
    }
  });

  audio.addEventListener('ended', () => setPlaying(false));
}

/* ══════════════════════════════════════════════════
   📅  DATE BADGE
   ══════════════════════════════════════════════════ */
function initDateBadge() {
  const el = document.getElementById('dateText');
  if (!el) return;

  const diff = Math.max(0, Math.floor((Date.now() - CONFIG.relationStart) / 1000));
  const days = Math.floor(diff / 86400);
  const months = Math.floor(days / 30);
  const years  = Math.floor(days / 365);

  let str = '';
  if (years > 0)       str = `معاً منذ ${years} سنة`;
  else if (months > 0) str = `معاً منذ ${months} شهر`;
  else if (days > 0)   str = `معاً منذ ${days} يوم`;
  else                  str = 'معاً منذ البداية';

  el.textContent = str;
}

/* ══════════════════════════════════════════════════
   🔐  PASSWORD SCREEN
   ══════════════════════════════════════════════════ */
function initPassword() {
  const input  = document.getElementById('passwordInput');
  const btn    = document.getElementById('unlockBtn');
  const errMsg = document.getElementById('errorMsg');
  const eyeBtn = document.getElementById('eyeBtn');
  if (!input || !btn) return;

  eyeBtn.addEventListener('click', () => {
    const show = input.type === 'password';
    input.type = show ? 'text' : 'password';
    eyeBtn.textContent = show ? '🙈' : '👁️';
    input.focus();
  });

  // Inject shake keyframes once
  if (!document.getElementById('__kf')) {
    const s = document.createElement('style');
    s.id = '__kf';
    s.textContent = `@keyframes shakeX{
      0%,100%{transform:translateX(0)}
      20%{transform:translateX(-9px)}40%{transform:translateX(9px)}
      60%{transform:translateX(-5px)}80%{transform:translateX(5px)}
    }`;
    document.head.appendChild(s);
  }

  function tryUnlock() {
    const val = input.value.trim();
    if (val === CONFIG.password) {
      playClick();
      input.blur();
      errMsg.classList.remove('show');
      // music keeps playing across screens
      showScreen('screen-countdown', initCountdown);
    } else {
      errMsg.classList.add('show');
      input.style.animation = 'none';
      void input.offsetWidth;
      input.style.animation = 'shakeX 0.42s ease';
      input.style.borderColor = 'rgba(255,50,100,0.7)';
      setTimeout(() => {
        errMsg.classList.remove('show');
        input.style.borderColor = '';
        input.style.animation   = '';
      }, 2600);
    }
  }

  replaceWithClone(btn, 'click', tryUnlock);
  input.addEventListener('keydown', e => { if (e.key === 'Enter') tryUnlock(); });
}

/* ══════════════════════════════════════════════════
   ⏳  COUNTDOWN
   ══════════════════════════════════════════════════ */
function initCountdown() {
  if (_cdTimer) { clearInterval(_cdTimer); _cdTimer = null; }

  const cards = document.querySelectorAll('.count-cell');
  const E = {
    y:  document.getElementById('years'),
    mo: document.getElementById('months'),
    d:  document.getElementById('days'),
    h:  document.getElementById('hours'),
    m:  document.getElementById('minutes'),
    s:  document.getElementById('seconds'),
  };

  cards.forEach(c => c.classList.remove('revealed'));
  cards.forEach((c, i) => setTimeout(() => c.classList.add('revealed'), 260 + i * 120));

  function bump(el, str) {
    if (!el || el.textContent === str) return;
    el.textContent = str;
    el.classList.remove('bump');
    void el.offsetWidth;
    el.classList.add('bump');
    setTimeout(() => el.classList.remove('bump'), 300);
  }

  function update() {
    let diff = Math.max(0, Math.floor((Date.now() - CONFIG.relationStart) / 1000));
    const s  = diff % 60; diff = Math.floor(diff / 60);
    const m  = diff % 60; diff = Math.floor(diff / 60);
    const h  = diff % 24; diff = Math.floor(diff / 24);
    const y  = Math.floor(diff / 365);
    const mo = Math.floor((diff % 365) / 30);
    const d  = diff % 30;
    const p  = v => String(v).padStart(2, '0');
    bump(E.y, p(y)); bump(E.mo, p(mo)); bump(E.d, p(d));
    bump(E.h, p(h)); bump(E.m, p(m));  bump(E.s, p(s));
  }

  update();
  _cdTimer = setInterval(update, 1000);

  replaceWithClone(document.getElementById('countdownNext'), 'click', () => {
    playClick();
    showScreen('screen-messages', initMessages);
  });
}

/* ══════════════════════════════════════════════════
   💌  MESSAGES
   ══════════════════════════════════════════════════ */
function initMessages() {
  const msgs    = CONFIG.messages;
  const iconEl  = document.getElementById('msgIcon');
  const textEl  = document.getElementById('msgText');
  const dotsEl  = document.getElementById('dotsRow');
  const fillEl  = document.getElementById('msgBarFill');
  const card    = document.getElementById('msgCard');
  const nextBtn = replaceWithClone(document.getElementById('msgNext'), null, null);
  const nextLbl = nextBtn.querySelector('#msgNextLabel');

  let current = 0;
  let typing  = false;

  dotsEl.innerHTML = '';
  msgs.forEach((_, i) => {
    const d = document.createElement('button');
    d.className = 'dot' + (i === 0 ? ' active' : '');
    d.setAttribute('aria-label', `رسالة ${i + 1}`);
    d.addEventListener('click', () => { if (!typing && i !== current) showMsg(i); });
    dotsEl.appendChild(d);
  });

  function stopType() {
    if (_typingTimer) { clearInterval(_typingTimer); _typingTimer = null; }
    if (textEl) textEl.classList.remove('typing');
    typing = false;
  }

  function typeText(el, text, speed, onDone) {
    stopType();
    el.textContent = '';
    el.classList.add('typing');
    typing = true;
    let i = 0;
    _typingTimer = setInterval(() => {
      el.textContent += text[i++];
      if (i >= text.length) { stopType(); if (onDone) onDone(); }
    }, speed);
  }

  function showMsg(idx) {
    current = idx;
    stopType();
    if (fillEl) fillEl.style.width = `${((idx + 1) / msgs.length) * 100}%`;
    dotsEl.querySelectorAll('.dot').forEach((d, i) => d.classList.toggle('active', i === idx));

    card.classList.add('hiding');
    setTimeout(() => {
      iconEl.textContent = msgs[idx].icon;
      card.classList.remove('hiding');
      typeText(textEl, msgs[idx].text, 32);
    }, 280);

    if (nextLbl) nextLbl.textContent = idx === msgs.length - 1 ? 'إلى الصور 📸' : 'التالي';
  }

  showMsg(0);

  nextBtn.addEventListener('click', () => {
    playClick();
    if (current + 1 < msgs.length) {
      showMsg(current + 1);
    } else {
      stopType();
      showScreen('screen-gallery', initGallery);
    }
  });
}

/* ══════════════════════════════════════════════════
   🖼️  GALLERY
   ══════════════════════════════════════════════════ */
function initGallery() {
  const items = document.querySelectorAll('.gallery-item');
  items.forEach(it => it.classList.remove('revealed'));
  items.forEach((it, i) => setTimeout(() => it.classList.add('revealed'), 150 + i * 100));

  replaceWithClone(document.getElementById('galleryNext'), 'click', () => {
    playClick();
    showScreen('screen-final', initFinal);
  });
}

/* ══════════════════════════════════════════════════
   🎉  FINAL SCENE
   ══════════════════════════════════════════════════ */
function initFinal() {
  const titleEl = document.getElementById('finalTitle');
  const msgEl   = document.getElementById('finalMsg');
  if (titleEl) { titleEl.textContent = ''; titleEl.classList.remove('glow'); }
  if (msgEl)   msgEl.textContent = '';

  startConfetti();

  typeElement(titleEl, CONFIG.finalTitle, 68, () => {
    if (titleEl) titleEl.classList.add('glow');
    setTimeout(() => typeElement(msgEl, CONFIG.finalMsg, 30), 500);
  });

  replaceWithClone(document.getElementById('restartBtn'), 'click', fullReset);
}

function typeElement(el, text, speed, onDone) {
  if (!el) { if (onDone) onDone(); return; }
  el.textContent = '';
  el.classList.add('typing');
  const lines = text.split('\n');
  let li = 0, ci = 0;
  const iv = setInterval(() => {
    if (li >= lines.length) {
      clearInterval(iv);
      el.classList.remove('typing');
      if (onDone) onDone();
      return;
    }
    const line = lines[li];
    if (ci < line.length) { el.textContent += line[ci++]; }
    else { if (li < lines.length - 1) el.textContent += '\n'; li++; ci = 0; }
  }, speed);
}

/* ══════════════════════════════════════════════════
   🎊  CONFETTI
   ══════════════════════════════════════════════════ */
function startConfetti() {
  const canvas = document.getElementById('confettiCanvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  function resize() { canvas.width = window.innerWidth; canvas.height = window.innerHeight; }
  resize();
  window.addEventListener('resize', resize, { passive: true });

  const COLORS = ['#f06292','#e91e8c','#f48fb1','#c2185b','#ffb347','#ff8fab','#ce93d8'];
  const CHARS  = ['❤','✦','✿','★','♡'];
  const n      = window.innerWidth < 480 ? 55 : 90;

  const pieces = Array.from({ length: n }, () => ({
    x:    Math.random() * canvas.width,
    y:    -20 - Math.random() * canvas.height * 0.4,
    r:    4 + Math.random() * 9,
    vy:   1.3 + Math.random() * 2.6,
    drift:0,
    sway: (Math.random() - 0.5) * 1.3,
    rot:  Math.random() * 360,
    rotV: (Math.random() - 0.5) * 3.5,
    color:COLORS[Math.floor(Math.random() * COLORS.length)],
    char: CHARS[Math.floor(Math.random() * CHARS.length)],
    useC: Math.random() > 0.38,
  }));

  function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    pieces.forEach(p => {
      p.y += p.vy;
      p.drift += 0.02;
      p.x += Math.sin(p.drift) * p.sway;
      p.rot += p.rotV;
      if (p.y > canvas.height + 28) { p.y = -20; p.x = Math.random() * canvas.width; }
      ctx.save();
      ctx.translate(p.x, p.y);
      ctx.rotate(p.rot * Math.PI / 180);
      ctx.globalAlpha = 0.88;
      if (p.useC) {
        ctx.font = `${p.r * 2}px serif`;
        ctx.fillStyle = p.color;
        ctx.textAlign = 'center';
        ctx.fillText(p.char, 0, p.r);
      } else {
        ctx.fillStyle = p.color;
        ctx.fillRect(-p.r * 0.5, -p.r * 0.5, p.r, p.r * 1.4);
      }
      ctx.restore();
    });
    _confettiAF = requestAnimationFrame(draw);
  }
  draw();
}

function stopConfetti() {
  if (_confettiAF) { cancelAnimationFrame(_confettiAF); _confettiAF = null; }
  const c = document.getElementById('confettiCanvas');
  if (c) c.getContext('2d').clearRect(0, 0, c.width, c.height);
}

/* ══════════════════════════════════════════════════
   🔄  FULL RESET
   ══════════════════════════════════════════════════ */
function fullReset() {
  playClick();
  stopConfetti();
  if (_cdTimer)     { clearInterval(_cdTimer); _cdTimer = null; }
  if (_typingTimer) { clearInterval(_typingTimer); _typingTimer = null; }

  // Keep music playing across reset
  document.querySelectorAll('.count-cell').forEach(c => c.classList.remove('revealed'));
  document.querySelectorAll('.gallery-item').forEach(g => g.classList.remove('revealed'));

  const ft = document.getElementById('finalTitle');
  const fm = document.getElementById('finalMsg');
  if (ft) { ft.textContent = ''; ft.classList.remove('glow'); }
  if (fm)   fm.textContent = '';

  const fill = document.getElementById('msgBarFill');
  if (fill) fill.style.width = '0%';

  const pw  = document.getElementById('passwordInput');
  const eye = document.getElementById('eyeBtn');
  const err = document.getElementById('errorMsg');
  if (pw)  { pw.value = ''; pw.type = 'password'; }
  if (eye)   eye.textContent = '👁️';
  if (err)   err.classList.remove('show');

  showScreen('screen-password');
}

/* ══════════════════════════════════════════════════
   🛠️  UTILITY
   ══════════════════════════════════════════════════ */
function replaceWithClone(el, event, handler) {
  if (!el) return null;
  const clone = el.cloneNode(true);
  el.parentNode.replaceChild(clone, el);
  if (event && handler) clone.addEventListener(event, handler, { once: true });
  return clone;
}

/* ══════════════════════════════════════════════════
   🚀  INIT
   ══════════════════════════════════════════════════ */
document.addEventListener('DOMContentLoaded', () => {
  _screen = document.getElementById('screen-password');
  initMusicPlayer();
  initDateBadge();
  initPassword();
});
