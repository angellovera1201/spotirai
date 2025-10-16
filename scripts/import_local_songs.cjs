const fs = require('fs');
const path = require('path');

const audioDir = path.join(__dirname, '..', 'public', 'audio');
const coversDir = path.join(__dirname, '..', 'public', 'covers');
const songsFile = path.join(__dirname, '..', 'src', 'data', 'songs.json');

function slugToTitle(name){
  const s = name.replace(/[-_]/g, ' ').replace(/\.[^.]+$/, '');
  return s.split(' ').map(p => p.charAt(0).toUpperCase() + p.slice(1)).join(' ');
}

function readSongs(){
  if (!fs.existsSync(songsFile)) return [];
  try { return JSON.parse(fs.readFileSync(songsFile,'utf8')); } catch (e){ return []; }
}

function writeSongs(songs){
  fs.writeFileSync(songsFile, JSON.stringify(songs, null, 2), 'utf8');
}

if (!fs.existsSync(audioDir)){
  console.error('No existe la carpeta public/audio/. Crea la carpeta y copia tus MP3s allí antes de ejecutar este script.');
  process.exit(1);
}

const files = fs.readdirSync(audioDir).filter(f => /\.(mp3|wav|ogg|m4a)$/i.test(f));
if (files.length === 0){
  console.log('No se encontraron archivos de audio en public/audio/. Copia tus MP3s y vuelve a ejecutar.');
  process.exit(0);
}

const existing = readSongs();
const existingUrls = new Set(existing.map(s => s.url));

let added = 0;
for (const file of files){
  const url = `/audio/${file}`;
  if (existingUrls.has(url)) continue;
  const basename = file.replace(/\.[^.]+$/, '');
  const title = slugToTitle(basename);
  const coverCandidate = path.join(coversDir, `${basename}.jpg`);
  const coverCandidate2 = path.join(coversDir, `${basename}.png`);
  const coverCandidateSvg = path.join(coversDir, `${basename}.svg`);
  let coverUrl = '/covers/placeholder.svg';
  if (fs.existsSync(coverCandidate)) coverUrl = `/covers/${basename}.jpg`;
  else if (fs.existsSync(coverCandidate2)) coverUrl = `/covers/${basename}.png`;
  else if (fs.existsSync(coverCandidateSvg)) coverUrl = `/covers/${basename}.svg`;

  const song = { title, artist: 'Unknown', url, coverUrl };
  existing.push(song);
  added++;
}

if (added > 0){
  writeSongs(existing);
  console.log(`Añadidas ${added} canciones a src/data/songs.json`);
} else {
  console.log('No se añadieron canciones (ya existían o no se encontraron archivos nuevos).');
}
