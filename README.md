# PBS Editor — sitio web + releases

Este repo (público) contiene solo la web de promoción/descarga de PBS Editor. El código fuente completo puede seguir viviendo en tu repo privado del juego; aquí solo necesitas lo que ves publicado.

## Puesta en marcha (una sola vez)

1. **Crear el repo en GitHub**
   - Nuevo repositorio público, por ejemplo `PBS-Editor` (si usas otro nombre, reemplázalo en `docs/index.html`: hay 4 enlaces que apuntan a `LaCabraPalMonte/PBS-Editor`).
   - Sube el contenido de esta carpeta (`docs/` y este `README.md`) a la rama `main`.

2. **Activar GitHub Pages**
   - En el repo: **Settings → Pages**.
   - En "Build and deployment" → Source: **Deploy from a branch**.
   - Branch: `main`, carpeta: **/docs**. Guardar.
   - En 1-2 minutos la web queda publicada en:
     `https://lacabrapalmonte.github.io/PBS-Editor/`

3. **Subir la primera Release (el .zip descargable)**
   - En el repo: **Releases → Draft a new release**.
   - Tag: `v1.0.1` (o la versión actual).
   - Sube el archivo comprimido de `PBS_Editor_Release/` y **renómbralo exactamente** `PBS_Editor_Release.zip` antes de subirlo.
   - Publica la release.
   - El botón "Descargar" de la web usa el enlace permanente
     `.../releases/latest/download/PBS_Editor_Release.zip`, así que **no hay que tocar la web en cada versión nueva**: solo sube una Release nueva con un asset con ese mismo nombre y el botón sirve siempre la última.

4. **`version.json` ya está listo — es la referencia oficial de versión**
   - `docs/version.json` es el manifiesto que consulta automáticamente el launcher (`PBS_Editor/updater.py`, constante `VERSION_MANIFEST_URL`) para saber si hay una versión nueva. Una vez publicada esta web, queda accesible en `https://lacabrapalmonte.github.io/PBS-Editor/version.json`.
   - El `PBS_Editor/version.json` del repo del juego (privado) **ya no se usa**: se dejó solo como nota para no confundir, porque un manifiesto en un repo privado no es accesible para los usuarios finales del `.exe`.

## Mantenimiento en cada nueva versión

1. Sube la nueva Release con el asset `PBS_Editor_Release.zip` (paso 3 de arriba).
2. Actualiza `Config.APP_VERSION` en `pbs_editor/config.py` (repo del juego).
3. Actualiza `docs/version.json` con el mismo número de versión y unas notas breves, y haz `git push` a `main` **de este repo**. El launcher detectará la nueva versión en su próximo arranque.
4. Si cambias features importantes, actualiza también `docs/index.html` (sección "Características" y el badge de versión).

`docs/version.json` tiene esta forma:

```json
{
    "version": "1.0.2",
    "download_url": "https://github.com/LaCabraPalMonte/PBS-Editor/releases/latest/download/PBS_Editor_Release.zip",
    "notes": "Descripción breve de los cambios"
}
```

El `download_url` es un enlace permanente a la Release más reciente — normalmente solo hace falta tocar `version` y `notes` en cada release.

## Estructura

```
docs/
├── index.html     # estructura de la web
├── css/style.css   # estilos
├── js/main.js       # toggle del hero + galería de capturas
├── version.json     # manifiesto que consulta el auto-updater del launcher
├── favicon.ico      # ícono de FireFalcon_7, reutilizado de la app
└── screenshots/     # capturas reales de la app (webp)
```
