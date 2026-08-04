
(function(){
  /* __EVO_LINES__ (js/evo-data.js): cada entrada es una evolución de 3 etapas
     + su(s) mega verificada(s) contra los datos reales del juego --
     PBS/pokemon.txt (cadena Evolution = A,Level,N) cruzado con
     PBS/pokemon_forms.txt (sólo formas con MegaStone = de verdad, no formas
     regionales/otras). Se elige una al azar en cada carga. Los sprites viven
     en graphics/pokemon/front/<ID>.png -- ver js/evo-data.js para cómo se
     regenera esa lista si se añaden más líneas. */
  var LINES = window.__EVO_LINES__ || [];
  var SPRITE_DIR = 'graphics/pokemon/front/';
  var SIZES = [170, 220, 280, 340];

  var wrap = document.getElementById('evoWrap');
  if(!wrap || !LINES.length) return;
  var sticky = wrap.querySelector('.evo-sticky');
  var sil = document.getElementById('evoSpriteSil');
  var col = document.getElementById('evoSpriteColor');
  var evoNo = document.getElementById('evoNo');
  var evoName = document.getElementById('evoName');
  var flash = document.getElementById('evoFlash');
  var dots = [].slice.call(document.getElementById('evoDots').children);
  var clouds = [].slice.call(document.querySelectorAll('#evoClouds .evo-cloud'));
  var reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  var line = LINES[Math.floor(Math.random() * LINES.length)];
  var stages = line.stages.map(function(s, i){
    return {sprite: SPRITE_DIR + s.sprite + '.png', no: s.no, name: s.name, size: SIZES[i]};
  });

  function apply(idx, reveal, size){
    var s = stages[idx];
    if(sil.dataset.src !== s.sprite){
      sil.src = s.sprite; sil.dataset.src = s.sprite;
      col.src = s.sprite;
      col.alt = s.name + ' -- evolucion de PBS Editor';
      evoNo.textContent = s.no; evoName.textContent = s.name;
      dots.forEach(function(d,i){ d.classList.toggle('on', i === idx); });
    }
    sil.style.opacity = String(1 - reveal);
    col.style.opacity = String(reveal);
    sil.style.width = col.style.width = size + 'px';
    sil.style.height = col.style.height = size + 'px';
    var pop = 0.92 + reveal * 0.08;
    sil.style.transform = col.style.transform = 'scale(' + pop + ')';
  }

  function render(p){
    p = Math.max(0, Math.min(1, p));
    var stageF = p * stages.length;
    var idx = Math.min(stages.length - 1, Math.floor(stageF));
    var lp = stageF - idx;
    var reveal = Math.min(1, lp / 0.22);
    var s = stages[idx];
    var prevSize = idx > 0 ? stages[idx-1].size : stages[0].size * 0.82;
    var size = prevSize + (s.size - prevSize) * Math.min(1, lp / 0.3 + 0.001);
    apply(idx, reveal, size);

    var minDist = 1;
    for(var b = 1; b < stages.length; b++){
      minDist = Math.min(minDist, Math.abs(p - b / stages.length));
    }
    var fw = 0.045;
    flash.style.opacity = String(Math.max(0, 1 - minDist / fw) * 0.9);

    clouds.forEach(function(c, i){
      var rate = 40 + i * 22;
      c.style.transform = 'translateY(' + (-(p - 0.5) * rate) + 'px)';
    });
  }

  if(reduced){
    var last = stages.length - 1;
    apply(last, 1, stages[last].size);
    flash.style.display = 'none';
    return;
  }

  /* iconos flotando en profundidad -- sólo con puntero fino, evita coste en móvil */
  var driftEls = [];
  if(window.matchMedia('(hover:hover) and (pointer:fine)').matches){
    var driftHost = document.getElementById('evoIconsDrift');
    var driftIcons = ['PIKACHU','EEVEE','GENGAR','LUCARIO','GARDEVOIR','SNORLAX','MEWTWO','UMBREON'];
    var positions = [[8,20],[18,68],[30,32],[42,80],[55,15],[68,58],[80,25],[90,72]];
    positions.forEach(function(pos, i){
      var el = document.createElement('div');
      el.className = 'evo-idrift-icon';
      el.style.backgroundImage = 'url(graphics/pokemon/icons/' + driftIcons[i % driftIcons.length] + '.png)';
      el.style.left = pos[0] + '%';
      el.style.top = pos[1] + '%';
      el.dataset.rate = String(20 + (i % 4) * 14);
      driftHost.appendChild(el);
      driftEls.push(el);
    });
  }

  var ticking = false;
  function tick(){
    var rect = wrap.getBoundingClientRect();
    var vh = window.innerHeight;

    /* JS-driven pin: absolute-at-top (not yet reached) -> fixed (scrubbing)
       -> absolute-at-bottom (scrolled past). See css/evo.css .evo-sticky notes. */
    if(rect.top > 0){
      sticky.classList.remove('m-fixed', 'm-bottom');
    } else if(rect.bottom < vh){
      sticky.classList.remove('m-fixed');
      sticky.classList.add('m-bottom');
    } else {
      sticky.classList.remove('m-bottom');
      sticky.classList.add('m-fixed');
    }

    var total = wrap.offsetHeight - vh;
    var p = total > 0 ? Math.max(0, Math.min(1, -rect.top / total)) : 0;
    render(p);

    driftEls.forEach(function(el){
      var rate = parseFloat(el.dataset.rate);
      el.style.transform = 'translateY(' + (-(p - 0.5) * rate) + 'px)';
    });

    ticking = false;
  }
  function onScroll(){
    if(ticking) return; ticking = true;
    requestAnimationFrame(tick);
  }
  window.addEventListener('scroll', onScroll, {passive:true});
  window.addEventListener('resize', onScroll);
  tick();
})();

/* tira secundaria de iconos -- reusa el bob de 2 frames real del juego */
(function(){
  var track = document.getElementById('iconStripTrack');
  if(!track) return;
  var names = ['PIKACHU','EEVEE','SQUIRTLE','BULBASAUR','CHARMANDER','JIGGLYPUFF','GENGAR','LUCARIO','GARDEVOIR','SNORLAX'];
  var frag = document.createDocumentFragment();
  [names, names].forEach(function(set){
    set.forEach(function(name){
      var s = document.createElement('span');
      s.style.backgroundImage = 'url(graphics/pokemon/icons/' + name + '.png)';
      s.style.animationDelay = (Math.random() * 0.6).toFixed(2) + 's';
      frag.appendChild(s);
    });
  });
  track.appendChild(frag);
})();
