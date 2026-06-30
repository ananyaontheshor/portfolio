// === interactions.js ===
(function(){
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // ---------- loader ----------
  const loader = document.getElementById('loader');
  const loaderFill = document.getElementById('loader-fill');
  let progress = 0;
  const loaderInterval = setInterval(() => {
    progress += Math.random() * 18;
    if(progress > 92) progress = 92;
    loaderFill.style.width = progress + '%';
  }, 90);

  function finishLoading(){
    clearInterval(loaderInterval);
    loaderFill.style.width = '100%';
    setTimeout(() => {
      loader.classList.add('hidden');
      runHeroIntro();
    }, 280);
  }

  if(window.__sceneReady){
    setTimeout(finishLoading, 400);
  } else {
    document.addEventListener('scene-ready', () => setTimeout(finishLoading, 400));
    // fallback in case scene takes too long or fails
    setTimeout(finishLoading, 2200);
  }

  // ---------- hero intro sequence ----------
  function runHeroIntro(){
    const eyebrow = document.getElementById('hero-eyebrow');
    const titleSpans = document.querySelectorAll('.hero-title .line span');
    const sub = document.getElementById('hero-sub');
    const cmds = document.getElementById('hero-cmds');
    const cue = document.getElementById('scroll-cue');

    if(reducedMotion){
      [eyebrow, sub, cmds, cue].forEach(el => { if(el){ el.style.opacity=1; el.style.transform='none'; }});
      titleSpans.forEach(s => { s.style.opacity=1; s.style.transform='none'; });
      return;
    }

    eyebrow.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
    setTimeout(() => { eyebrow.style.opacity = 1; eyebrow.style.transform = 'translateY(0)'; }, 100);

    titleSpans.forEach((span, i) => {
      span.style.transition = 'opacity 0.7s cubic-bezier(.16,1,.3,1), transform 0.7s cubic-bezier(.16,1,.3,1)';
      setTimeout(() => { span.style.opacity = 1; span.style.transform = 'translateY(0)'; }, 350 + i*150);
    });

    sub.style.transition = 'opacity 0.7s ease, transform 0.7s ease';
    setTimeout(() => { sub.style.opacity = 1; sub.style.transform = 'translateY(0)'; }, 750);

    cmds.style.transition = 'opacity 0.7s ease, transform 0.7s ease';
    setTimeout(() => { cmds.style.opacity = 1; cmds.style.transform = 'translateY(0)'; }, 950);

    cue.style.transition = 'opacity 0.8s ease';
    setTimeout(() => { cue.style.opacity = 1; }, 1300);
  }

  // ---------- quick command buttons ----------
  document.querySelectorAll('.quickcmds button').forEach(btn=>{
    btn.addEventListener('click', ()=>{
      const target = document.getElementById(btn.dataset.cmd);
      if(target) target.scrollIntoView({behavior: reducedMotion ? 'auto' : 'smooth'});
    });
  });

  // ---------- nav background on scroll + active link ----------
  const navbar = document.getElementById('navbar');
  const progressBar = document.getElementById('scroll-progress');
  const sectionEls = ['hero','about','projects','writing','path','contact']
    .map(id => document.getElementById(id)).filter(Boolean);

  function onScroll(){
    const sc = window.scrollY;
    navbar.classList.toggle('scrolled', sc > 40);

    const docHeight = document.documentElement.scrollHeight - window.innerHeight;
    const pct = docHeight > 0 ? (sc / docHeight) * 100 : 0;
    progressBar.style.width = pct + '%';
  }
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  // ---------- scroll reveal via IntersectionObserver ----------
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

  // ---------- cursor glow ----------
  const glow = document.getElementById('cursor-glow');
  if(glow){
    window.addEventListener('mousemove', (e) => {
      glow.style.left = e.clientX + 'px';
      glow.style.top = e.clientY + 'px';
    }, { passive: true });
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
        // reset any active tilt transform before measuring height, so perspective() doesn't distort scrollHeight
        query.style.transform = 'perspective(900px) rotateY(0deg) rotateX(0deg) translateZ(0)';
        body.style.maxHeight = body.scrollHeight + 'px';
        head.setAttribute('aria-expanded','true');
      }
    });
  });

  // ---------- recalc open accordion height on window resize (text reflow changes scrollHeight) ----------
  window.addEventListener('resize', () => {
    document.querySelectorAll('.query.open').forEach(q => {
      const body = q.querySelector('.query-body');
      body.style.maxHeight = body.scrollHeight + 'px';
    });
  });
})();
