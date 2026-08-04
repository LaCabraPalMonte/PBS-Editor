
(function(){
  /* N.º01 — secuencia de carga */
  function boot(){ document.body.classList.add('is-ready'); }
  if(document.readyState==='complete'){ requestAnimationFrame(boot); }
  else { window.addEventListener('load', function(){ requestAnimationFrame(boot); }); }

  [].slice.call(document.querySelectorAll('nav.top, .eyebrow, h1, .textbox, .cta-row, .dex')).forEach(function(el){
    el.classList.add('m-in');
  });

  /* N.º02 — revelado por scroll (una sola vez, con stagger por grupo) */
  var revealTargets = [].slice.call(document.querySelectorAll('.feature, .step, .comm-card, .download-panel, .av-notice'));
  var seen = new Map();
  revealTargets.forEach(function(el){
    el.classList.add('m-reveal');
    var p = el.parentElement;
    var n = seen.get(p) || 0;
    el.style.setProperty('--mi', n % 6);
    seen.set(p, n + 1);
  });
  var revealObs = new IntersectionObserver(function(entries){
    entries.forEach(function(e){
      if(e.isIntersecting){ e.target.classList.add('m-in2'); revealObs.unobserve(e.target); }
    });
  }, {threshold:.16, rootMargin:'0px 0px -8% 0px'});
  revealTargets.forEach(function(el){ revealObs.observe(el); });

  /* parallax de nubes del hero — sólo puntero fino, sólo mientras el hero está visible */
  var fineHover = window.matchMedia('(hover:hover) and (pointer:fine)').matches;
  var clouds = [].slice.call(document.querySelectorAll('.cloud'));
  var heroSky = document.querySelector('.hero-sky');
  var rates = [0.15, 0.3, 0.45];
  if(fineHover && heroSky && clouds.length){
    var ticking = false;
    window.addEventListener('scroll', function(){
      if(ticking) return; ticking = true;
      requestAnimationFrame(function(){
        var y = window.scrollY, heroH = heroSky.offsetHeight;
        if(y < heroH){
          clouds.forEach(function(c,i){ c.style.transform = 'translateY(' + Math.min(y*rates[i],40) + 'px)'; });
        }
        ticking = false;
      });
    }, {passive:true});
  }

  /* fijado (pin) de gallery-tabs contra la parte superior */
  var tabs = document.querySelector('.gallery-tabs');
  if(tabs && tabs.parentElement){
    var sentinel = document.createElement('div');
    sentinel.setAttribute('aria-hidden','true');
    sentinel.style.cssText = 'height:1px;';
    tabs.parentElement.insertBefore(sentinel, tabs);
    var pinObs = new IntersectionObserver(function(entries){
      entries.forEach(function(e){ tabs.classList.toggle('m-pinned', e.intersectionRatio < 1); });
    }, {threshold:[1]});
    pinObs.observe(sentinel);
  }

  /* N.º03 — píldora deslizante para toggle-group y gallery-tabs */
  function wireSegment(container){
    if(!container) return;
    var thumb = document.createElement('span');
    thumb.className = 'm-thumb';
    container.insertBefore(thumb, container.firstChild);
    function move(){
      var active = container.querySelector('[aria-pressed="true"]');
      if(!active) return;
      thumb.style.width = active.offsetWidth + 'px';
      thumb.style.height = active.offsetHeight + 'px';
      thumb.style.left = active.offsetLeft + 'px';
      thumb.style.top = active.offsetTop + 'px';
    }
    var mo = new MutationObserver(move);
    [].slice.call(container.querySelectorAll('button')).forEach(function(b){
      mo.observe(b, {attributes:true, attributeFilter:['aria-pressed']});
    });
    window.addEventListener('resize', move);
    setTimeout(move, 60);
  }
  wireSegment(document.querySelector('.toggle-group'));
  wireSegment(document.querySelector('.gallery-tabs'));

  /* N.º04 — scroll suave a anclas con curva propia + subrayado activo */
  var navLinks = [].slice.call(document.querySelectorAll('.navlinks a'));
  var navSections = navLinks.map(function(a){ return document.querySelector(a.getAttribute('href')); });
  function easeIO(x){ return x < 0.5 ? 4*x*x*x : 1 - Math.pow(-2*x+2, 3)/2; }
  function customScrollTo(target){
    var startY = window.scrollY;
    var endY = target.getBoundingClientRect().top + window.scrollY - 14;
    var dist = endY - startY;
    var dur = Math.min(620, Math.max(380, Math.abs(dist) * 0.5));
    var t0 = null;
    function step(ts){
      if(t0 === null) t0 = ts;
      var p = Math.min(1, (ts - t0) / dur);
      window.scrollTo(0, startY + dist * easeIO(p));
      if(p < 1) requestAnimationFrame(step);
    }
    requestAnimationFrame(step);
  }
  navLinks.forEach(function(a){
    a.addEventListener('click', function(e){
      var target = document.querySelector(a.getAttribute('href'));
      if(!target) return;
      e.preventDefault();
      customScrollTo(target);
    });
  });
  var navObs = new IntersectionObserver(function(entries){
    entries.forEach(function(e){
      var i = navSections.indexOf(e.target);
      if(i < 0 || !e.isIntersecting) return;
      navLinks.forEach(function(l,j){ l.classList.toggle('m-active', j === i); });
    });
  }, {rootMargin:'-30% 0px -60% 0px'});
  navSections.forEach(function(s){ if(s) navObs.observe(s); });

  /* clic en descarga: rebote del icono antes de navegar, nunca bloquea ⌘/Ctrl-clic */
  [].slice.call(document.querySelectorAll('a.btn-primary[href*="releases"]')).forEach(function(a){
    a.addEventListener('click', function(e){
      if(e.metaKey || e.ctrlKey || e.shiftKey || e.button === 1) return;
      var svg = a.querySelector('svg');
      if(!svg) return;
      e.preventDefault();
      svg.style.transition = 'transform .26s cubic-bezier(.34,1.56,.64,1)';
      svg.style.transform = 'translateY(4px)';
      setTimeout(function(){ svg.style.transform = 'translateY(0)'; }, 130);
      setTimeout(function(){ window.location.href = a.href; }, 260);
    });
  });

  /* N.º04/05 — modal de capturas: apertura shared-element, arrastre para cerrar, deslizar entre capturas */
  var lb = document.getElementById('mLightbox');
  if(!lb) return;
  var lbFrame = document.getElementById('mLbFrame');
  var lbShot = document.getElementById('mLbShot');
  var lbImg = document.getElementById('mLbImg');
  var lbName = document.getElementById('mLbName');
  var lastTrigger = null;
  var galleryImgs = [].slice.call(document.querySelectorAll('.gallery-shot img'));

  function openLightbox(imgEl){
    lastTrigger = imgEl;
    lbImg.src = imgEl.currentSrc || imgEl.src;
    lbImg.alt = imgEl.alt;
    lbName.textContent = (imgEl.alt.split(/[:,.]/)[0] || 'captura').slice(0, 60);
    lb.hidden = false;
    var r = imgEl.getBoundingClientRect();
    var dx = (r.left + r.width/2) - window.innerWidth/2;
    var dy = (r.top + r.height/2) - window.innerHeight/2;
    lbFrame.style.transform = 'translate(' + dx + 'px,' + dy + 'px) scale(.4)';
    requestAnimationFrame(function(){
      lb.classList.add('open');
      lbFrame.style.transform = 'translate(0,0) scale(1)';
    });
    document.addEventListener('keydown', onKey);
  }
  function closeLightbox(){
    lb.classList.remove('open'); lb.classList.add('closing');
    setTimeout(function(){
      lb.hidden = true; lb.classList.remove('closing');
      lbFrame.style.transform = '';
      document.querySelector('.m-lb-backdrop').style.background = '';
      if(lastTrigger) lastTrigger.focus({preventScroll:true});
    }, 320);
    document.removeEventListener('keydown', onKey);
  }
  function onKey(e){ if(e.key === 'Escape') closeLightbox(); }

  [].slice.call(document.querySelectorAll('.gallery-shot img, .shot-inline')).forEach(function(img){
    img.addEventListener('click', function(){ openLightbox(img); });
  });
  document.getElementById('mLbClose').addEventListener('click', closeLightbox);
  document.querySelector('.m-lb-backdrop').addEventListener('click', closeLightbox);

  var dragging = false, startX = 0, startY = 0, dx = 0, dy = 0;
  lbShot.addEventListener('pointerdown', function(e){
    dragging = true; startX = e.clientX; startY = e.clientY; dx = 0; dy = 0;
    lbShot.classList.add('grabbing'); lb.classList.add('dragging');
    lbShot.setPointerCapture(e.pointerId);
  });
  lbShot.addEventListener('pointermove', function(e){
    if(!dragging) return;
    dx = e.clientX - startX; dy = e.clientY - startY;
    if(Math.abs(dy) > Math.abs(dx)){
      var d = Math.max(0, dy);
      lbFrame.style.transform = 'translateY(' + d + 'px) scale(' + (1 - Math.min(d/900,.25)) + ')';
      document.querySelector('.m-lb-backdrop').style.background = 'rgba(8,14,28,' + Math.max(0,.78-d/300) + ')';
    } else {
      lbImg.style.transform = 'translateX(' + dx + 'px)';
    }
  });
  function endDrag(){
    if(!dragging) return; dragging = false;
    lbShot.classList.remove('grabbing'); lb.classList.remove('dragging');
    if(dy > 120 && Math.abs(dy) > Math.abs(dx)){
      closeLightbox();
    } else if((dx < -60 || dx > 60) && galleryImgs.length > 1){
      var i = galleryImgs.indexOf(lastTrigger);
      var ni = dx < 0 ? Math.min(galleryImgs.length-1,(i<0?0:i)+1) : Math.max(0,(i<0?0:i)-1);
      lbImg.style.transform = '';
      if(i >= 0 && galleryImgs[ni]) openLightbox(galleryImgs[ni]);
    } else {
      lbFrame.style.transform = 'translate(0,0) scale(1)';
      lbImg.style.transform = '';
      document.querySelector('.m-lb-backdrop').style.background = '';
    }
    dx = 0; dy = 0;
  }
  lbShot.addEventListener('pointerup', endDrag);
  lbShot.addEventListener('pointercancel', endDrag);
})();
