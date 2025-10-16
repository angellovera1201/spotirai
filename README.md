# Spotirai (demo)

Proyecto pequeño con Vite (vanilla JS). El objetivo es una página lista con un reproductor. Puedes añadir canciones editando `src/data/songs.json` o usando el formulario en la UI (se guarda en localStorage).

Comandos:

```powershell
cd "c:/Users/angel/Downloads/spotirai"
npm.cmd install
npm.cmd run dev
```

Build para producción:

```powershell
npm.cmd run build
npm.cmd run preview
```

Notas:
- Las canciones añadidas con el formulario se guardan en localStorage y se cargarán automáticamente.
- Para producción sube la carpeta `dist` resultante.
