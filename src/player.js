class Player {
  constructor({ songs = [], elements = {} } = {}) {
    this.songs = songs;
    this.index = 0;
    this.audio = new Audio();
    this.elements = elements;
    this.isPlaying = false;

    this._bindEvents();
    this._renderPlaylist();
    this._loadSong(this.index);
  }

  _bindEvents() {
    const { play, prev, next, progress, addSongForm } = this.elements;

    // volume & search
    this.volumeEl = document.getElementById('volume');
    this.searchEl = document.getElementById('search');

    if (this.volumeEl) {
      this.audio.volume = parseFloat(this.volumeEl.value) || 1;
      this.volumeEl.addEventListener('input', (e) => { this.audio.volume = parseFloat(e.target.value); });
    }

    if (this.searchEl) {
      this.searchEl.addEventListener('input', (e) => { this._filterPlaylist(e.target.value); });
    }

    play?.addEventListener('click', () => this.togglePlay());
    prev?.addEventListener('click', () => this.prev());
    next?.addEventListener('click', () => this.next());

    this.audio.addEventListener('timeupdate', () => this._updateProgress());
    this.audio.addEventListener('ended', () => this.next());

    progress?.addEventListener('input', (e) => {
      const pct = e.target.value;
      if (this.audio.duration) this.audio.currentTime = (pct / 100) * this.audio.duration;
    });

    addSongForm?.addEventListener('submit', (e) => {
      e.preventDefault();
      const title = document.getElementById('songTitle').value.trim();
      const artist = document.getElementById('songArtist').value.trim();
      const url = document.getElementById('songUrl').value.trim();
      const cover = document.getElementById('songCover')?.value.trim();
      if (!title || !url) return;
      const item = { title, artist, url, coverUrl: cover };
      this.songs.push(item);
      this._saveLocal();
      this._renderPlaylist();
      addSongForm.reset();
    });
  }

  _saveLocal() {
    try { localStorage.setItem('spotirai-songs', JSON.stringify(this.songs)); } catch (err) { console.warn('No se pudo guardar en localStorage', err); }
  }

  _loadLocal() {
    try {
      const raw = localStorage.getItem('spotirai-songs');
      if (raw) this.songs = JSON.parse(raw);
    } catch (err) { /* ignore */ }
  }

  _renderPlaylist() {
    const ul = this.elements.playlist;
    if (!ul) return;
    ul.innerHTML = '';
    this.songs.forEach((s, i) => {
      const li = document.createElement('li');
      li.textContent = `${s.title} — ${s.artist || 'Desconocido'}`;
      li.dataset.index = i;
      li.addEventListener('click', () => { this.playIndex(i); });
      ul.appendChild(li);
    });
    this._highlightCurrent();
  }

  _highlightCurrent() {
    const lis = this.elements.playlist?.querySelectorAll('li') || [];
    lis.forEach(li => {
      if (Number(li.dataset.index) === this.index) li.style.background = 'rgba(6,182,212,0.12)'; else li.style.background = '';
    });
  }

  _filterPlaylist(q){
    const txt = (q||'').toLowerCase();
    const lis = this.elements.playlist?.querySelectorAll('li') || [];
    lis.forEach(li => {
      const i = Number(li.dataset.index);
      const s = this.songs[i];
      const ok = s.title.toLowerCase().includes(txt) || (s.artist||'').toLowerCase().includes(txt);
      li.style.display = ok ? '' : 'none';
    });
  }

  _loadSong(i) {
    if (!this.songs[i]) return;
    const s = this.songs[i];
    this.audio.src = s.url;
    document.getElementById('track-title').textContent = s.title || '—';
    document.getElementById('track-artist').textContent = s.artist || '—';
    const coverEl = document.getElementById('cover');
    if (coverEl) coverEl.src = s.coverUrl || 'https://picsum.photos/seed/placeholder/300/300';
  }

  togglePlay() {
    if (this.isPlaying) return this.pause();
    return this.play();
  }

  async play() {
    try {
      await this.audio.play();
      this.isPlaying = true;
      this.elements.play.textContent = '⏸️';
    } catch (err) {
      console.warn('Play error', err);
    }
  }

  pause() {
    this.audio.pause();
    this.isPlaying = false;
    this.elements.play.textContent = '▶️';
  }

  prev() { this.index = (this.index - 1 + this.songs.length) % this.songs.length; this._loadSong(this.index); if (this.isPlaying) this.play(); }
  next() { this.index = (this.index + 1) % this.songs.length; this._loadSong(this.index); if (this.isPlaying) this.play(); }
  playIndex(i) { this.index = i; this._loadSong(i); this.play(); }

  _updateProgress() {
    const { progress, currentTime, duration } = this.elements;
    if (!this.audio.duration) return;
    const pct = (this.audio.currentTime / this.audio.duration) * 100;
    if (progress) progress.value = pct;
    if (currentTime) currentTime.textContent = formatTime(this.audio.currentTime);
    if (duration) duration.textContent = formatTime(this.audio.duration);
  }
}

function formatTime(sec) {
  if (!sec || Number.isNaN(sec)) return '0:00';
  const m = Math.floor(sec / 60);
  const s = Math.floor(sec % 60).toString().padStart(2, '0');
  return `${m}:${s}`;
}

export { Player };
