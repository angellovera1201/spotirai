import { Player } from './player';

async function loadSongs() {
  // Try localStorage first
  let songs = [];
  try {
    const raw = localStorage.getItem('spotirai-songs');
    if (raw) songs = JSON.parse(raw);
  } catch (err) { /* ignore */ }

  if (!songs || songs.length === 0) {
    // fetch default list
    try {
      const res = await fetch('/src/data/songs.json');
      songs = await res.json();
    } catch (err) {
      console.warn('No se pudieron cargar canciones por defecto', err);
    }
  }

  return songs;
}

document.addEventListener('DOMContentLoaded', async () => {
  const songs = await loadSongs();

  const player = new Player({
    songs,
    elements: {
      play: document.getElementById('play'),
      prev: document.getElementById('prev'),
      next: document.getElementById('next'),
      progress: document.getElementById('progress'),
      playlist: document.getElementById('playlist'),
      addSongForm: document.getElementById('addSongForm'),
      currentTime: document.getElementById('current-time'),
      duration: document.getElementById('duration')
    }
  });

  console.log('Spotirai cargado', player);
});

