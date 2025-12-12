/* Unified interactive script
   - builds 4 vertical scrollable columns with a small clickable map at the top of each column
   - search + dropdown
   - reveal animations
   - ripple + hover interactions
   - modal map loader (on card's 'Buka di Google Maps')
*/

// --- Utilities
const qs = (s, ctx = document) => ctx.querySelector(s);
const qsa = (s, ctx = document) => Array.from(ctx.querySelectorAll(s));

// --- Header effects (parallax + particles)
const headerEl = qs('header');
const headerVideo = qs('#header-video');
if (headerEl && headerVideo) {
    headerEl.addEventListener('mousemove', (e) => {
        const rect = headerEl.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        const moveX = (x - rect.width / 2) * 0.02;
        const moveY = (y - rect.height / 2) * 0.02;
        headerVideo.style.transform = `scale(1.08) translate(${moveX}px, ${moveY}px)`;
    });
    headerEl.addEventListener('mouseleave', () => headerVideo.style.transform = 'scale(1.08)');
}

function createParticles() {
    const header = qs('header');
    if (!header) return;
    for (let i=0;i<12;i++){
        const p = document.createElement('div'); p.className='particle';
        const size = Math.random()*50+16; p.style.width = p.style.height = size+'px';
        p.style.left = (Math.random()*100)+'%'; p.style.bottom = '-120px';
        p.style.animationDelay = (Math.random()*2)+'s'; p.style.animationDuration = (6+Math.random()*5)+'s';
        header.appendChild(p);
        setTimeout(()=>p.remove(), (8+Math.random()*6)*1000);
    }
    setTimeout(createParticles, 9000);
}

// --- Search and card index
let cards = qsa('.card');
let searchData = [];
function buildSearchData(){
    cards = qsa('.card');
    searchData = cards.map(card => {
        const title = card.querySelector('h3')?.textContent?.trim() || '';
        const province = (card.querySelector('p')?.textContent || '').trim();
        return { title, province, card };
    });
}

const searchInput = qs('#searchInput');
const searchResults = qs('#searchResults');
function performSearch(q){
    if (!q || q.trim()===''){
        searchResults.classList.remove('active');
        cards.forEach(c=>c.style.display='');
        return;
    }
    const lq = q.toLowerCase();
    const matches = searchData.filter(it => it.title.toLowerCase().includes(lq) || it.province.toLowerCase().includes(lq));
    if (matches.length===0){
        searchResults.innerHTML = '<div class="search-result-item">Tidak ada hasil yang ditemukan</div>';
        searchResults.classList.add('active');
        return;
    }
    searchResults.innerHTML = matches.map(m=>`<div class="search-result-item" data-title="${m.title}"><div class="search-result-name">${m.title}</div><div class="search-result-province">${m.province}</div></div>`).join('');
    searchResults.classList.add('active');
    // show only matches
    cards.forEach(c => {
        const t = c.querySelector('h3')?.textContent || '';
        c.style.display = matches.some(m=>m.title===t)? '' : 'none';
    });
}

function scrollToCardTitle(title){
    const item = searchData.find(s=>s.title===title);
    if (item && item.card){
        // scroll card into view within its column
        item.card.scrollIntoView({behavior:'smooth', block:'center'});
        searchInput.value=''; searchResults.classList.remove('active'); cards.forEach(c=>c.style.display='');
    }
}

// delegate click on search results
document.addEventListener('click', (e)=>{
    if (e.target.closest('.search-result-item')){
        const el = e.target.closest('.search-result-item');
        const title = el.dataset.title || el.querySelector('.search-result-name')?.textContent;
        if (title) scrollToCardTitle(title);
    }
    if (!e.target.closest('.search-container')){
        searchResults.classList.remove('active');
    }
});

// --- Column builder with per-column map
function makeColumnsWithMaps(columnCount=4){
    const container = qs('.cards'); if(!container) return;
    const existing = qsa('.card', container);
    if (existing.length===0) return;
    if (container.classList.contains('columns-ready')) return;

    const wrapper = document.createElement('div'); wrapper.className='columns';
    const cols = [];
    for(let i=0;i<columnCount;i++){ const c=document.createElement('div'); c.className='card-column'; c.dataset.col=i; cols.push(c); wrapper.appendChild(c);} 

    // distribute round-robin
    existing.forEach((card, idx)=>{ cols[idx % columnCount].appendChild(card); });

    // add top map to each column
    cols.forEach(col=>{
        const first = col.querySelector('.card');
        let mapQuery = 'Indonesia';
        let caption = 'Lokasi';
        if (first){ const lat = first.dataset.lat; const lng = first.dataset.lng; const prov = first.querySelector('p')?.textContent?.trim(); if (lat && lng) mapQuery = lat+','+lng; else if (prov) mapQuery = prov; caption = prov || caption; }
        const mapWrap = document.createElement('div'); mapWrap.className='column-map';
        const ifr = document.createElement('iframe'); ifr.src = 'https://www.google.com/maps?q='+encodeURIComponent(mapQuery)+'&z=6&output=embed'; ifr.loading='lazy'; mapWrap.appendChild(ifr);
        const cap = document.createElement('div'); cap.className='map-caption'; cap.textContent = caption; mapWrap.appendChild(cap);
        mapWrap.addEventListener('click', ()=>{ window.open('https://www.google.com/maps/search/?api=1&query='+encodeURIComponent(mapQuery), '_blank'); });
        col.insertBefore(mapWrap, col.firstChild);
    });

    container.innerHTML = ''; container.appendChild(wrapper); container.classList.add('columns-ready');
}

// --- Reveal animation
function revealCards(){
    const all = qsa('.card');
    const obs = new IntersectionObserver((entries, ob)=>{ entries.forEach(en=>{ if(en.isIntersecting){ en.target.style.opacity='1'; en.target.style.transform='translateY(0)'; ob.unobserve(en.target); } }); }, {threshold:0.08});
    all.forEach(a=>obs.observe(a));
}

// --- Card interactions: ripple + hover
function attachCardInteractions(){
    const all = qsa('.card');
    all.forEach(card=>{
        // prevent duplicate handlers by marking
        if (card.dataset._handled) return; card.dataset._handled='1';
        card.style.position = card.style.position || 'relative';
        card.addEventListener('click', (ev)=>{
            const r = document.createElement('span'); r.className='card-ripple'; r.style.position='absolute'; r.style.width='22px'; r.style.height='22px'; r.style.background='rgba(212,175,55,0.45)'; r.style.borderRadius='50%'; r.style.pointerEvents='none'; r.style.animation='ripple 0.6s ease-out';
            const rect = card.getBoundingClientRect(); const x = ev.clientX - rect.left; const y = ev.clientY - rect.top; r.style.left = (x-11)+'px'; r.style.top=(y-11)+'px'; card.appendChild(r); setTimeout(()=>r.remove(),700);
        });
        card.addEventListener('mouseenter', ()=>{ card.style.animation='glow 2s ease-in-out infinite'; });
        card.addEventListener('mouseleave', ()=>{ card.style.animation='none'; });
    });
    if (!qs('#ripple-style')){ const s = document.createElement('style'); s.id='ripple-style'; s.textContent='@keyframes ripple{to{transform:scale(4);opacity:0}} .card-ripple{transform-origin:center}'; document.head.appendChild(s);}    
}

// --- Map modal (opened from card .maps-button)
function initMapModalAndCardBg(){
    const mapModal = qs('#mapModal'); if(!mapModal) return; const iframe = qs('#mapModalIframe'); const closeBtn = qs('#mapModalClose'); const titleEl = qs('#mapModalTitle'); const coordsEl = qs('#mapModalCoords'); const openBtn = qs('#mapModalOpenBtn');

    function buildEmbed(card){ if(!card) return 'https://www.google.com/maps?q=Indonesia&output=embed'; const place = card.dataset.placeid; const lat=card.dataset.lat; const lng=card.dataset.lng; if(place) return 'https://www.google.com/maps?q=place_id:'+encodeURIComponent(place)+'&output=embed'; if(lat && lng) return 'https://www.google.com/maps?q='+encodeURIComponent(lat+','+lng)+'&z=14&output=embed'; const t = (card.querySelector('h3')?.textContent||'') + ' ' + (card.querySelector('p')?.textContent||''); return 'https://www.google.com/maps?q='+encodeURIComponent(t.trim()||'Indonesia')+'&output=embed'; }

    qsa('.maps-button').forEach(btn=>{
        btn.addEventListener('click',(ev)=>{
            ev.preventDefault(); const card = btn.closest('.card'); if(!card) return; const title = card.querySelector('h3')?.textContent||'Peta Lokasi'; const embed = buildEmbed(card);
            titleEl.textContent = title;
            // loader
            let loader = mapModal.querySelector('.map-modal-loading'); if(!loader){ loader = document.createElement('div'); loader.className='map-modal-loading'; const sp = document.createElement('div'); sp.className='spinner'; loader.appendChild(sp); mapModal.querySelector('.map-modal-content').insertBefore(loader, iframe); }
            loader.style.display='flex'; iframe.onload = ()=>{ if(loader) loader.style.display='none'; try{ closeBtn.focus(); }catch(e){} };
            iframe.src = embed; mapModal.classList.add('open'); mapModal.setAttribute('aria-hidden','false'); document.body.style.overflow='hidden';

            // coords and open link
            if(coordsEl && openBtn){ const place = card.dataset.placeid; const lat=card.dataset.lat; const lng=card.dataset.lng; if(place){ coordsEl.textContent = 'Place ID: '+place; openBtn.href = 'https://www.google.com/maps/place/?q=place_id:'+encodeURIComponent(place); } else if(lat && lng){ coordsEl.textContent = lat+','+lng; openBtn.href='https://www.google.com/maps/search/?api=1&query='+encodeURIComponent(lat+','+lng);} else { coordsEl.textContent='—'; openBtn.href='https://www.google.com/maps/search/?api=1&query='+encodeURIComponent(title+' '+(card.querySelector('p')?.textContent||'')); } }

            // focus trap minimal
            const lastFocus = document.activeElement;
            const onKey = (e)=>{ if(e.key==='Escape') closeModal(); };
            const onFocus = (e)=>{ if(!mapModal.contains(e.target)){ e.stopPropagation(); try{ closeBtn.focus(); }catch(e){} } };
            document.addEventListener('keydown', onKey); document.addEventListener('focusin', onFocus);
            mapModal._cleanup = ()=>{ document.removeEventListener('keydown', onKey); document.removeEventListener('focusin', onFocus); if(lastFocus) try{ lastFocus.focus(); }catch(e){} mapModal._cleanup=null; };
        });
    });

    function closeModal(){ mapModal.classList.remove('open'); iframe.src=''; mapModal.setAttribute('aria-hidden','true'); document.body.style.overflow=''; if(mapModal._cleanup) mapModal._cleanup(); }
    closeBtn.addEventListener('click', closeModal); mapModal.addEventListener('click',(e)=>{ if(e.target===mapModal) closeModal(); });

    // interactive background on cards
    qsa('.card').forEach(card=>{
        card.addEventListener('mousemove',(e)=>{ const r=card.getBoundingClientRect(); const x = ((e.clientX - r.left)/r.width)*100; const y = ((e.clientY - r.top)/r.height)*100; card.style.setProperty('--mx', x+'%'); card.style.setProperty('--my', y+'%'); });
        card.addEventListener('mouseleave', ()=>{ card.style.setProperty('--mx','50%'); card.style.setProperty('--my','20%'); });
    });
}

// --- Background Music Player
(function setupMusicPlayer(){
    const musicToggle = qs('#musicToggle');
    const bgMusic = qs('#bgMusic');
    const musicStatus = qs('#musicStatus');

    if(!musicToggle || !bgMusic) return;

    let isPlaying = false;

    musicToggle.addEventListener('click', (e)=>{
        e.preventDefault();
        isPlaying = !isPlaying;

        if(isPlaying){
            bgMusic.play().catch(err => {
                console.warn('Audio play failed:', err);
                musicStatus.textContent = '❌ Gagal memutar musik';
                isPlaying = false;
                musicToggle.classList.remove('playing');
                return;
            });
            musicToggle.classList.add('playing');
            musicStatus.textContent = '▶ Musik dimainkan...';
            musicToggle.title = 'Hentikan musik';
        } else {
            bgMusic.pause();
            musicToggle.classList.remove('playing');
            musicStatus.textContent = '🎵 Musik tradisional Indonesia';
            musicToggle.title = 'Putar musik';
        }
    });

    // Handle audio end
    bgMusic.addEventListener('ended', () => {
        isPlaying = false;
        musicToggle.classList.remove('playing');
        musicStatus.textContent = '🎵 Musik tradisional Indonesia';
        musicToggle.title = 'Putar musik';
    });

    // Optional: Auto-play music (commented by default - user preference)
    // Uncomment below to auto-play on page load
    // setTimeout(() => { musicToggle.click(); }, 2000);
})();

// --- Init on DOM ready
document.addEventListener('DOMContentLoaded', ()=>{
    createParticles();
    // initialize layout: use single-card carousel (do not convert into columns)
    // if you want columns instead, call makeColumnsWithMaps(4) here
    buildSearchData();
    attachCardInteractions();
    revealCards();
    initMapModalAndCardBg();

    // small helper: keyboard arrow navigation (removed for grid layout)
    // Grid layout uses natural scrolling instead of carousel navigation
    
    // scroll feedback for grid
    (function setupGridScroll(){
        const container = qs('.cards'); if(!container) return;
        
        // smooth scroll snap feedback
        window.addEventListener('scroll', ()=>{
            const cards = qsa('.card', container);
            let closestCard = cards[0];
            let closestDist = Infinity;
            cards.forEach(card=>{
                const rect = card.getBoundingClientRect();
                const dist = Math.abs(rect.top - window.innerHeight/2);
                if(dist < closestDist){
                    closestDist = dist;
                    closestCard = card;
                }
            });
            // subtle visual feedback: highlight closest card
            cards.forEach(c => c.style.opacity = c === closestCard ? '1' : '0.8');
        });
    })();

    // add scroll indicator for grid
    (function setupScrollIndicator(){
        let scrollIndicator = qs('.scroll-hint');
        if(!scrollIndicator){
            scrollIndicator = document.createElement('div');
            scrollIndicator.className = 'scroll-hint';
            scrollIndicator.innerHTML = '⬇ scroll down to explore ⬇';
            scrollIndicator.style.cssText = `
                position: fixed;
                bottom: 40px;
                left: 50%;
                transform: translateX(-50%);
                background: linear-gradient(135deg, #d4af37, #f0c674);
                color: #333;
                padding: 12px 24px;
                border-radius: 50px;
                font-weight: 700;
                z-index: 100;
                box-shadow: 0 6px 16px rgba(212,175,55,0.5);
                animation: float 2.5s ease-in-out infinite;
                pointer-events: none;
                font-size: 0.95rem;
            `;
            document.body.appendChild(scrollIndicator);
            setTimeout(() => { 
                if(scrollIndicator) {
                    scrollIndicator.style.opacity = '0'; 
                    scrollIndicator.style.transition = 'opacity 0.6s ease';
                }
            }, 12000);
        }
    })();

    // wire search input
    if (searchInput) {
        searchInput.addEventListener('input', (e)=> performSearch(e.target.value));
        // Enter triggers search immediately
        searchInput.addEventListener('keydown', (e)=>{
            if (e.key === 'Enter') {
                e.preventDefault();
                performSearch(searchInput.value);
            }
        });
    }

    const searchBtn = qs('#searchBtn');
    if (searchBtn) {
        searchBtn.addEventListener('click', (e)=>{
            e.preventDefault();
            performSearch(searchInput ? searchInput.value : '');
            if (searchResults) searchResults.classList.add('active');
        });
    }
});

// ensure search results click uses our scroll function
window.scrollToCardTitle = scrollToCardTitle;

