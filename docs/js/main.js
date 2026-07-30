  function showView(name){
    document.getElementById('view-raw').classList.toggle('active', name === 'raw');
    document.getElementById('view-visual').classList.toggle('active', name === 'visual');
    document.querySelector('[data-view="raw"]').setAttribute('aria-pressed', String(name === 'raw'));
    document.querySelector('[data-view="visual"]').setAttribute('aria-pressed', String(name === 'visual'));
  }

const galleryData = {
  dashboard: {url:"PBS_Editor -- dashboard", caption:"1025 Pokemon, 835 movimientos, 790 objetos y 21 entrenadores del proyecto Pokemon Olympus, listos para editar."},
  trainer: {url:"PBS_Editor -- trainers.txt", caption:"Ficha completa del entrenador: tipo, version, items y texto de derrota, sin tocar trainers.txt a mano."},
  map: {url:"PBS_Editor -- town_map.txt", caption:"26 puntos de interes en la region Essen, editados haciendo clic directamente sobre el mapa."},
  tileset: {url:"PBS_Editor -- Tilesets.rxdata", caption:"Seleccion por arrastre sobre la hoja de tiles para aplicar passage, priority o terrain tag en bloque."}
};
function showShot(name){
  document.querySelectorAll('.gallery-shot').forEach(el => el.classList.toggle('active', el.id === 'shot-' + name));
  document.querySelectorAll('.gallery-tabs button').forEach(btn => btn.setAttribute('aria-pressed', String(btn.dataset.shot === name)));
  document.getElementById('gallery-url').textContent = galleryData[name].url;
  document.getElementById('gallery-caption').textContent = galleryData[name].caption;
}
