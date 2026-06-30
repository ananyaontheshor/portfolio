// === interactions.js ===
(function(){
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // ---------- loader ----------
  const loader = document.getElementById('loader');
  const loaderFill = document.getElementById('loader-fill');
  let progress = 0;
  const loaderInterval = setInterval(() => {
    progress += Math.random() * 20;
    if(progress > 92) progress = 92;
    loaderFill.style.width = progress + '%';
  }, 80);

  function finishLoading(){
    clearInterval(loaderInterval);
    loaderFill.style.width = '100%';
    setTimeout(() => {
      loader.classList.add('hidden');
      runHeroIntro();
    }, 250);
  }

  if(window.__sceneReady){
    setTimeout(finishLoading, 350);
  } else {
    document.addEventListener('scene-ready', () => setTimeout(finishLoading, 350));
    setTimeout(finishLoading, 1800); // fallback
  }

  // ---------- hero intro ----------
  function runHeroIntro(){
    const eyebrow = document.getElementById('hero-eyebrow');
    const kicker = document.getElementById('hero-kicker');
    const wrap = document.getElementById('console-wrap');
    const cmds = document.getElementById('hero-cmds');
    const cue = document.getElementById('scroll-cue');

    if(reducedMotion){
      [eyebrow, kicker, cmds].forEach(el => { if(el){ el.style.opacity=1; el.style.transform='none'; }});
      wrap.classList.add('in');
      if(cue) cue.style.opacity = 1;
      return;
    }

    setTimeout(() => { eyebrow.style.opacity = 1; eyebrow.style.transform = 'translateY(0)'; }, 80);
    setTimeout(() => { kicker.style.opacity = 1; kicker.style.transform = 'translateY(0)'; }, 200);
    setTimeout(() => { wrap.classList.add('in'); }, 350);
    setTimeout(() => { cmds.style.opacity = 1; cmds.style.transform = 'translateY(0)'; }, 950);
    setTimeout(() => { if(cue) cue.style.opacity = 1; }, 1300);
    setTimeout(() => { if(window.__focusTerminal && window.innerWidth > 760) window.__focusTerminal(); }, 1400);
  }

  // ---------- quick command buttons -> real terminal ----------
  document.querySelectorAll('.quickcmds button').forEach(btn=>{
    btn.addEventListener('click', ()=>{
      const cmd = btn.dataset.run;
      if(cmd && window.__runTerminalCommand){
        window.__runTerminalCommand(cmd);
        document.getElementById('console-wrap').scrollIntoView({behavior: reducedMotion ? 'auto' : 'smooth', block:'center'});
        if(window.__focusTerminal) window.__focusTerminal();
      }
    });
  });

  // ---------- nav scroll state + progress bar ----------
  const navbar = document.getElementById('navbar');
  const progressBar = document.getElementById('scroll-progress');

  function onScroll(){
    const sc = window.scrollY;
    navbar.classList.toggle('scrolled', sc > 40);
    const docHeight = document.documentElement.scrollHeight - window.innerHeight;
    const pct = docHeight > 0 ? (sc / docHeight) * 100 : 0;
    progressBar.style.width = pct + '%';
  }
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  // ---------- scroll reveal ----------
  const revealEls = document.querySelectorAll('.reveal, .reveal-stagger');
  if('IntersectionObserver' in window){
    const io = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if(entry.isIntersecting){
          entry.target.classList.add('in-view');
          io.unobserve(entry.target);
        }
      });
    }, { threshold: 0.15, rootMargin: '0px 0px -60px 0px' });
    revealEls.forEach(el => io.observe(el));
  } else {
    revealEls.forEach(el => el.classList.add('in-view'));
  }

  // ---------- project card 3D tilt ----------
  if(!reducedMotion && window.innerWidth > 760){
    document.querySelectorAll('.query').forEach(card => {
      card.addEventListener('mousemove', (e) => {
        const rect = card.getBoundingClientRect();
        const x = (e.clientX - rect.left) / rect.width - 0.5;
        const y = (e.clientY - rect.top) / rect.height - 0.5;
        card.style.transform = `perspective(900px) rotateY(${x * 6}deg) rotateX(${-y * 6}deg) translateZ(4px)`;
      });
      card.addEventListener('mouseleave', () => {
        card.style.transform = 'perspective(900px) rotateY(0deg) rotateX(0deg) translateZ(0)';
      });
    });
  }

  // ---------- accordion ----------
  document.querySelectorAll('.query-head').forEach(head=>{
    head.addEventListener('click', ()=>{
      const query = head.closest('.query');
      const body = query.querySelector('.query-body');
      const isOpen = query.classList.contains('open');

      document.querySelectorAll('.query.open').forEach(q=>{
        if(q !== query){
          q.classList.remove('open');
          q.querySelector('.query-body').style.maxHeight = null;
          q.querySelector('.query-head').setAttribute('aria-expanded','false');
        }
      });

      if(isOpen){
        query.classList.remove('open');
        body.style.maxHeight = null;
        head.setAttribute('aria-expanded','false');
      } else {
        query.classList.add('open');
        query.style.transform = 'perspective(900px) rotateY(0deg) rotateX(0deg) translateZ(0)';
        body.style.maxHeight = body.scrollHeight + 'px';
        head.setAttribute('aria-expanded','true');
      }
    });
  });

  window.addEventListener('resize', () => {
    document.querySelectorAll('.query.open').forEach(q => {
      const body = q.querySelector('.query-body');
      body.style.maxHeight = body.scrollHeight + 'px';
    });
  });
})();
