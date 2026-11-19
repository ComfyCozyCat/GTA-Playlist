'use strict';
/* Leonida.FM — standalone, dependency-free personal song tracker. */
const $ = (selector, root = document) => root.querySelector(selector);
const STORAGE_KEY = 'gta-playlist-liked-v1';
const PREF_KEY = 'gta-playlist-collapsed-v1';
const state = { stations: [], liked: new Set(), collapsed: new Set(), station: 'all', query: '', likedOnly: false, sort: 'station', activeSong: null, previousFocus: null };
function readSet(key) { try { const value = JSON.parse(localStorage.getItem(key) || '[]'); return new Set(Array.isArray(value) ? value.filter(v => typeof v === 'string') : []); } catch { return new Set(); } }
function saveSet(key, value) { try { localStorage.setItem(key, JSON.stringify([...value])); return true; } catch { setStatus('Storage is unavailable — likes may not survive a refresh.'); return false; } }
state.liked = readSet(STORAGE_KEY);
state.collapsed = readSet(PREF_KEY);
const normalize = str => String(str || '').toLocaleLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
const spotifySearch = song => 'https://open.spotify.com/search/' + encodeURIComponent(song.title + ' ' + song.artist);
const text = (tag, className, value) => { const node = document.createElement(tag); if (className) node.className = className; node.textContent = value; return node; };
function setStatus(message) { $('#status').textContent = message; }
function refreshCounts() { $('#likes-count').textContent = state.liked.size; const total = state.stations.reduce((n, s) => n + s.tracks.length, 0); $('#total-count').textContent = state.stations.length + ' STATIONS · ' + total + ' TRACKS'; }
function saveLike(id, liked) { if (liked) state.liked.add(id); else state.liked.delete(id); saveSet(STORAGE_KEY, state.liked); refreshCounts(); }
function visibleSongs(station) {
  const query = normalize(state.query.trim());
  const tracks = station.tracks.filter(song => (!state.likedOnly || state.liked.has(song.id)) && (!query || normalize(song.title + ' ' + song.artist + ' ' + station.name + ' ' + station.genre).includes(query)));
  if (state.sort === 'title') tracks.sort((a,b) => a.title.localeCompare(b.title));
  if (state.sort === 'artist') tracks.sort((a,b) => a.artist.localeCompare(b.artist) || a.title.localeCompare(b.title));
  return tracks;
}
function renderNav() {
  const nav = $('#station-nav');
  nav.replaceChildren();
  const all = [{id:'all',name:'All stations'}, ...state.stations];
  for (const station of all) {
    const button = text('button','station-chip' + (state.station === station.id ? ' active' : ''),station.id==='all' ? 'ALL STATIONS' : station.name.toUpperCase());
    button.type='button'; button.dataset.station=station.id; button.setAttribute('aria-pressed',String(state.station===station.id));
    button.addEventListener('click',()=>{state.station=station.id;renderNav();renderStations();});
    nav.append(button);
  }
}
function songCard(song, station) {
  const card = $('#song-template').content.firstElementChild.cloneNode(true);
  card.style.setProperty('--station',station.color);
  $('.song-name',card).textContent = song.title;
  $('.artist-name',card).textContent = song.artist;
  const art = $('.art-button',card);
  const info = $('.song-info',card);
  const syncLiked = () => {
    const liked = state.liked.has(song.id);
    card.classList.toggle('is-liked',liked);
    art.setAttribute('aria-pressed',String(liked));
    art.setAttribute('aria-label',(liked?'Unlike ':'Like ')+song.title+' by '+song.artist);
    art.title = liked ? 'Remove from liked songs' : 'Like this song';
  };
  syncLiked();
  art.addEventListener('click',()=>{ saveLike(song.id,!state.liked.has(song.id));syncLiked();if(state.likedOnly) renderStations(); });
  info.addEventListener('click',()=>openDetails(song,station));
  info.setAttribute('aria-label','Details for '+song.title+' by '+song.artist);
  return card;
}
function renderStations() {
  const list = $('#station-list'); const fragment=document.createDocumentFragment();
  let visibleCount=0, visibleStations=0;
  for(const station of state.stations) {
    if (state.station!=='all' && station.id!==state.station) continue;
    const tracks=visibleSongs(station);
    const nonMusic=station.type!=='music';
    if(!nonMusic && tracks.length===0) continue;
    if(nonMusic && (state.query || state.likedOnly)) {
      if (state.likedOnly || (state.query && !normalize(station.name+' '+station.genre).includes(normalize(state.query)))) continue;
    }
    visibleStations++; visibleCount+=tracks.length;
    const section=document.createElement('section');section.className='station-section';section.id='station-'+station.id;section.style.setProperty('--station',station.color);
    const heading=text('div','station-heading','');
    const headingMain=text('div','station-heading-main','');
    const logo=text('div','station-logo',station.name.slice(0,1).toUpperCase());logo.setAttribute('aria-hidden','true');
    const label=document.createElement('div');
    label.append(text('div','station-kicker',station.genre.toUpperCase()),text('h2','',station.name),text('p','station-subtitle',station.host));
    headingMain.append(logo,label);
    const count=text('span','station-count',nonMusic?(station.type==='hidden'?'SECRET STATION':'TALK RADIO'):tracks.length+' SONG'+(tracks.length===1?'':'S'));
    const toggle=text('button','station-toggle','⌄');toggle.type='button';toggle.setAttribute('aria-label','Toggle '+station.name+' tracks');
    const isExpanded=!state.collapsed.has(station.id);
    toggle.setAttribute('aria-expanded',String(isExpanded));
    heading.append(headingMain,count,toggle);
    section.append(heading);
    const strip=document.createElement('div');strip.className='track-strip';strip.hidden=!isExpanded;
    if (nonMusic) strip.append(text('p','empty-station',station.type==='hidden'?'Hidden station: unlock The Vault in-game. Its song list is not verified yet.':'Talk programming; no music tracks in the source catalog.'));
    else tracks.forEach(song=>strip.append(songCard(song,station)));
    section.append(strip);
    toggle.addEventListener('click',()=>{const expand=toggle.getAttribute('aria-expanded')!=='true';toggle.setAttribute('aria-expanded',String(expand));strip.hidden=!expand;if(expand)state.collapsed.delete(station.id);else state.collapsed.add(station.id);saveSet(PREF_KEY,state.collapsed);});
    fragment.append(section);
  }
  if(!visibleStations) fragment.append(text('div','empty-results','No songs found. Try another search or turn off the liked-only filter.'));
  list.replaceChildren(fragment);
  setStatus('Showing '+visibleCount+' song'+(visibleCount===1?'':'s')+' across '+visibleStations+' station'+(visibleStations===1?'':'s')+'. Song catalog from launch-day third-party reporting.');
}
function detailFact(label,value) {const node=text('div','detail-fact','');node.append(text('span','',label),text('span','',value));return node;}
function openDetails(song,station) {
  state.activeSong={song,station};state.previousFocus=document.activeElement;
  const parent=$('#detail-content');parent.replaceChildren();
  parent.append(text('div','detail-cover','♫'),text('div','eyebrow','✦ NOW PLAYING · '+station.name.toUpperCase()),text('h2','',song.title),text('p','detail-artist',song.artist));
  const facts=text('div','detail-facts','');
  facts.append(detailFact('RADIO STATION',station.name),detailFact('GENRE',station.genre),detailFact('SOURCE STATUS','Reported in launch-day guide'),detailFact('SPOTIFY','Search link (not a verified track ID)'));
  parent.append(facts);
  const actions=text('div','detail-actions','');
  const spotify=text('a','primary-action','↗ FIND ON SPOTIFY');spotify.href=song.spotifyUrl || spotifySearch(song);spotify.target='_blank';spotify.rel='noopener noreferrer';
  const like=text('button','secondary-action','');like.type='button';
  const sync=()=>{like.textContent=state.liked.has(song.id)?'♥ Liked — remove':'♡ Like this song';};
  sync();
  like.addEventListener('click',()=>{saveLike(song.id,!state.liked.has(song.id));sync();renderStations();});
  actions.append(spotify,like);parent.append(actions,text('p','detail-notice','Song identification is based on independently published station lists. Spotify opens search results until an exact official song URL has been verified. Artwork and previews are not fetched from Spotify.'));
  showModal('#detail-overlay','.detail-panel');
}
function showModal(selector,panelSelector) { $(selector).hidden=false;document.body.classList.add('modal-open');$(panelSelector,$(selector)).focus?.(); }
function closeModal(selector) {$(selector).hidden=true;if($('#detail-overlay').hidden && $('#backup-overlay').hidden)document.body.classList.remove('modal-open');state.previousFocus?.focus?.();}
function expandAll(expand) {for(const station of state.stations) {if(expand)state.collapsed.delete(station.id);else state.collapsed.add(station.id);}saveSet(PREF_KEY,state.collapsed);renderStations();}
function exportLikes() {
  const songs=state.stations.flatMap(s=>s.tracks).filter(s=>state.liked.has(s.id)).map(s=>({id:s.id,title:s.title,artist:s.artist}));
  const payload={version:1,exportedAt:new Date().toISOString(),likedIds:[...state.liked],songs};
  const url=URL.createObjectURL(new Blob([JSON.stringify(payload,null,2)],{type:'application/json'}));
  const link=document.createElement('a');link.href=url;link.download='gta-playlist-likes.json';document.body.append(link);link.click();link.remove();setTimeout(()=>URL.revokeObjectURL(url),1000);
  $('#backup-message').textContent='Exported '+state.liked.size+' liked song(s).';
}
async function importLikes(file) {
  if(!file)return;
  try {
    if(file.size>2_000_000)throw Error('Backup file is too large.');
    const payload=JSON.parse(await file.text());
    if(payload.version!==1 || !Array.isArray(payload.likedIds)||payload.likedIds.some(id=>typeof id!=='string'))throw Error('Not a compatible GTA-Playlist backup.');
    const valid=new Set(state.stations.flatMap(s=>s.tracks.map(t=>t.id)));
    const imported=payload.likedIds.filter(id=>valid.has(id));
    const before=state.liked.size;imported.forEach(id=>state.liked.add(id));
    saveSet(STORAGE_KEY,state.liked);refreshCounts();renderStations();
    $('#backup-message').textContent='Imported '+imported.length+' recognized song IDs. You now have '+state.liked.size+' likes (previously '+before+').';
  } catch(err) {$('#backup-message').textContent='Import failed: '+err.message;}
  $('#import-input').value='';
}
function wireEvents() {
  $('#search-input').addEventListener('input',event=>{state.query=event.target.value;renderStations();});
  $('#search-toggle').addEventListener('click',()=>{$('#search-input').focus();$('#search-input').scrollIntoView({behavior:'smooth',block:'center'});});
  $('#liked-filter').addEventListener('click',()=>{state.likedOnly=!state.likedOnly;const btn=$('#liked-filter');btn.classList.toggle('active',state.likedOnly);btn.setAttribute('aria-pressed',String(state.likedOnly));renderStations();});
  $('#sort-select').addEventListener('change',event=>{state.sort=event.target.value;renderStations();});
  $('#expand-all').addEventListener('click',()=>expandAll(true));
  $('#collapse-all').addEventListener('click',()=>expandAll(false));
  $('#random-button').addEventListener('click',()=>{
    const candidates=state.stations.filter(s=>state.station==='all'||s.id===state.station).flatMap(s=>visibleSongs(s).map(song=>({song,station:s})));
    if(!candidates.length){setStatus('No songs match the current filters.');return;}
    const bytes=new Uint32Array(1);if(globalThis.crypto?.getRandomValues)crypto.getRandomValues(bytes);else bytes[0]=Math.floor(Math.random()*0xffffffff);
    const picked=candidates[bytes[0]%candidates.length];openDetails(picked.song,picked.station);
  });
  $('#detail-close').addEventListener('click',()=>closeModal('#detail-overlay'));
  $('#detail-overlay').addEventListener('click',event=>{if(event.target.hasAttribute('data-close'))closeModal('#detail-overlay');});
  $('#backup-button').addEventListener('click',()=>{state.previousFocus=document.activeElement;$('#backup-message').textContent='';showModal('#backup-overlay','.detail-panel');});
  $('#backup-close').addEventListener('click',()=>closeModal('#backup-overlay'));
  $('#backup-overlay').addEventListener('click',event=>{if(event.target.hasAttribute('data-backup-close'))closeModal('#backup-overlay');});
  $('#export-button').addEventListener('click',exportLikes);
  $('#import-input').addEventListener('change',event=>importLikes(event.target.files[0]));
  document.addEventListener('keydown',event=>{
    if(event.key==='Escape'){if(!$('#detail-overlay').hidden)closeModal('#detail-overlay');else if(!$('#backup-overlay').hidden)closeModal('#backup-overlay');}
    if(event.key==='Tab'){const shown=!$('#detail-overlay').hidden?$('#detail-overlay'):!$('#backup-overlay').hidden?$('#backup-overlay'):null;if(!shown)return;const focusable=[...shown.querySelectorAll('button,a[href],input:not([hidden]),label.import-button')].filter(el=>el.getClientRects().length);if(!focusable.length)return;const first=focusable[0],last=focusable[focusable.length-1];if(event.shiftKey && document.activeElement===first){event.preventDefault();last.focus();}else if(!event.shiftKey && document.activeElement===last){event.preventDefault();first.focus();}}
  });
}
async function init() {
  wireEvents();
  try {
    const response=await fetch('./data/stations.json',{cache:'no-cache'});if(!response.ok)throw Error('HTTP '+response.status);
    const catalog=await response.json();
    if(!Array.isArray(catalog.stations))throw Error('Invalid station catalog');
    state.stations=catalog.stations;
    refreshCounts();renderNav();renderStations();
  }catch(err) {
    $('#station-list').replaceChildren(text('div','empty-results','Unable to load station catalog. Serve the site over HTTP and refresh.'));
    setStatus('Data loading failed: '+err.message);
  }
  if('serviceWorker' in navigator && location.protocol.startsWith('http'))navigator.serviceWorker.register('./sw.js').catch(()=>{});
}
init();
