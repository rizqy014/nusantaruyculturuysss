// ===== HEADER INTERACTIVE EFFECTS =====
const header = document.querySelector("header");
const headerVideo = document.getElementById("header-video");

// Mouse tracking effect
if (header) {
    header.addEventListener("mousemove", (e) => {
        const rect = header.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        
        // Subtle parallax effect
        const moveX = (x - rect.width / 2) * 0.02;
        const moveY = (y - rect.height / 2) * 0.02;
        
        if (headerVideo) {
            headerVideo.style.transform = `scale(1.05) translate(${moveX}px, ${moveY}px)`;
        }
    });

    header.addEventListener("mouseleave", () => {
        if (headerVideo) {
            headerVideo.style.transform = "scale(1.05)";
        }
    });
}

// Create floating particles effect
const createParticles = () => {
    const header = document.querySelector("header");
    if (!header) return;

    for (let i = 0; i < 15; i++) {
        const particle = document.createElement("div");
        particle.className = "particle";
        
        const size = Math.random() * 60 + 20;
        const left = Math.random() * 100;
        const delay = Math.random() * 2;
        const duration = Math.random() * 4 + 6;
        
        particle.style.width = size + "px";
        particle.style.height = size + "px";
        particle.style.left = left + "%";
        particle.style.bottom = "-100px";
        particle.style.animationDelay = delay + "s";
        particle.style.animationDuration = duration + "s";
        
        header.appendChild(particle);

        // Remove particle after animation
        setTimeout(() => {
            particle.remove();
        }, (duration + delay) * 1000);
    }

    // Recreate particles periodically
    setTimeout(createParticles, 8000);
};

// Start particles on load
document.addEventListener("DOMContentLoaded", () => {
    createParticles();
});

// ===== SEARCH FUNCTIONALITY =====
const searchInput = document.getElementById("searchInput");
const searchResults = document.getElementById("searchResults");
const cards = document.querySelectorAll(".card");

// Create search data from cards
const searchData = Array.from(cards).map(card => {
    const title = card.querySelector("h3")?.textContent || "";
    const province = card.querySelector(".card-description p")?.textContent || "";
    const cardElement = card;

    return { title, province, cardElement };
});

// Search function
const performSearch = (query) => {
    if (query.trim() === "") {
        searchResults.classList.remove("active");
        cards.forEach(card => card.style.display = "");
        return;
    }

    const lowerQuery = query.toLowerCase();
    const matches = searchData.filter(item => 
        item.title.toLowerCase().includes(lowerQuery) ||
        item.province.toLowerCase().includes(lowerQuery)
    );

    if (matches.length === 0) {
        searchResults.innerHTML = '<div class="search-result-item">Tidak ada hasil yang ditemukan</div>';
        searchResults.classList.add("active");
        return;
    }

    searchResults.innerHTML = matches.map(match => `
        <div class="search-result-item" onclick="scrollToCard('${match.title}')">
            <div class="search-result-name">${match.title}</div>
            <div class="search-result-province">${match.province}</div>
        </div>
    `).join("");
    searchResults.classList.add("active");

    // Filter cards to show only matches
    cards.forEach(card => {
        const title = card.querySelector("h3")?.textContent || "";
        card.style.display = matches.some(m => m.title === title) ? "" : "none";
    });
};

// Scroll to card function
const scrollToCard = (title) => {
    const card = Array.from(cards).find(c => c.querySelector("h3")?.textContent === title);
    if (card) {
        card.scrollIntoView({ behavior: "smooth", block: "nearest", inline: "center" });
        searchInput.value = "";
        searchResults.classList.remove("active");
        cards.forEach(c => c.style.display = "");
    }
};

// Event listener for search
searchInput.addEventListener("input", (e) => {
    performSearch(e.target.value);
});

// Close search results when clicking outside
document.addEventListener("click", (e) => {
    if (!e.target.closest(".search-container")) {
        searchResults.classList.remove("active");
    }
});

// ===== SCROLL REVEAL ANIMATION =====
const revealCards = () => {
    const allCards = document.querySelectorAll(".card");
    
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = "1";
                entry.target.style.transform = "translateY(0)";
                observer.unobserve(entry.target);
            }
        });
    }, { threshold: 0.1 });
    
    allCards.forEach(card => {
        observer.observe(card);
    });
};


// ===== PARALLAX EFFECT PADA HEADER =====
window.addEventListener("scroll", () => {
    const header = document.querySelector("header");
    if (header) {
        const scrollPosition = window.pageYOffset;
        header.style.backgroundPosition = `center ${scrollPosition * 0.5}px`;
    }
});

// ===== SMOOTH SCROLL LINKS =====
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function(e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            target.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
    });
});

// ===== CARD CLICK ANIMATION =====
const allCards = document.querySelectorAll(".card");

allCards.forEach(card => {
    card.addEventListener("click", function() {
        // Ripple effect
        const ripple = document.createElement("span");
        ripple.style.position = "absolute";
        ripple.style.width = "20px";
        ripple.style.height = "20px";
        ripple.style.background = "rgba(212, 175, 55, 0.5)";
        ripple.style.borderRadius = "50%";
        ripple.style.pointerEvents = "none";
        ripple.style.animation = "ripple 0.6s ease-out";
        
        const rect = this.getBoundingClientRect();
        const x = event.clientX - rect.left;
        const y = event.clientY - rect.top;
        
        ripple.style.left = (x - 10) + "px";
        ripple.style.top = (y - 10) + "px";
        
        this.appendChild(ripple);
        
        setTimeout(() => ripple.remove(), 600);
        
        // No intrusive alert; keep ripple as feedback. Maps open via the button.
    });
});

// ===== RIPPLE ANIMATION =====
const style = document.createElement('style');
style.textContent = `
    @keyframes ripple {
        to {
            transform: scale(4);
            opacity: 0;
        }
    }
`;
document.head.appendChild(style);

// ===== INITIAL SETUP =====
document.addEventListener("DOMContentLoaded", () => {
    // reorganize to 4 vertical columns with a small map per column
    makeColumnsWithMaps(4);

    revealCards();

    // Add hover effect
    const addHoverEffect = () => {
        cards.forEach(card => {
            card.addEventListener("mouseenter", () => {
                card.style.animation = "glow 2s ease-in-out infinite";
            });
            
            card.addEventListener("mouseleave", () => {
                card.style.animation = "none";
            });
        });
    };
    addHoverEffect();
});

// ===== PAGE LOAD ANIMATION =====
window.addEventListener("load", () => {
    document.body.style.animation = "fadeInUp 0.8s ease";
});


/* === MAP MODAL & INTERACTIVE CARD BACKGROUND === */
function initMapModalAndCardBg() {
    const mapModal = document.getElementById('mapModal');
    const mapModalClose = document.getElementById('mapModalClose');
    const mapModalIframe = document.getElementById('mapModalIframe');
    const mapModalTitle = document.getElementById('mapModalTitle');

    if (!mapModal || !mapModalIframe) return;

    // Build an embed URL: prefer explicit data attributes (place id or coordinates), fallback to title+province
    const buildEmbedFromCard = (card) => {
        if (!card) return 'https://www.google.com/maps?q=Indonesia&output=embed';
        const placeId = card.dataset.placeid;
        const lat = card.dataset.lat;
        const lng = card.dataset.lng;

        if (placeId && placeId.trim().length > 0) {
            // Use Google Maps query with place_id for more accurate embedding
            return 'https://www.google.com/maps?q=place_id:' + encodeURIComponent(placeId) + '&output=embed';
        }

        if (lat && lng) {
            return 'https://www.google.com/maps?q=' + encodeURIComponent(lat + ',' + lng) + '&z=14&output=embed';
        }

        // Fallback: build from title + province
        const title = card.querySelector('h3')?.textContent?.trim() || '';
        let province = '';
        const shortP = card.querySelector('p');
        if (shortP) province = shortP.textContent.trim();
        if (!province) {
            const descP = card.querySelector('.card-description p');
            if (descP) province = descP.textContent.replace(/Daerah:\s*/i, '').trim();
        }
        const query = (title + ' ' + province).trim() || title || province || 'Indonesia';
        return 'https://www.google.com/maps?q=' + encodeURIComponent(query) + '&output=embed';
    };

    // Open modal when maps-button clicked — build embed reliably from card content
    document.querySelectorAll('.maps-button').forEach(btn => {
        btn.addEventListener('click', (ev) => {
            ev.preventDefault();
            const card = btn.closest('.card');
            if (!card) return;
            const title = card.querySelector('h3')?.textContent || 'Peta Lokasi';
            const embedUrl = buildEmbedFromCard(card);

            // Scroll the card into view so the user can see which card opened
            try { card.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' }); } catch (e) {}

            mapModalTitle.textContent = title;
                // show loading spinner
                let loader = mapModal.querySelector('.map-modal-loading');
                if (!loader) {
                    loader = document.createElement('div');
                    loader.className = 'map-modal-loading';
                    const spin = document.createElement('div');
                    spin.className = 'spinner';
                    loader.appendChild(spin);
                    mapModal.querySelector('.map-modal-content').insertBefore(loader, mapModalIframe);
                }
                loader.style.display = 'flex';

                // set iframe and open modal
                mapModalIframe.onload = () => {
                    // hide loader after iframe loads
                    if (loader) loader.style.display = 'none';
                    try { mapModalClose.focus(); } catch (e) {}
                };
                mapModalIframe.src = embedUrl;

                // Set coordinates / open-in-google link in modal footer
                const coordsEl = document.getElementById('mapModalCoords');
                const openBtn = document.getElementById('mapModalOpenBtn');
                const placeId = card.dataset.placeid;
                const lat = card.dataset.lat;
                const lng = card.dataset.lng;

                if (placeId && placeId.trim().length > 0) {
                    if (coordsEl) coordsEl.textContent = 'Place ID: ' + placeId;
                    if (openBtn) openBtn.href = 'https://www.google.com/maps/place/?q=place_id:' + encodeURIComponent(placeId);
                } else if (lat && lng) {
                    if (coordsEl) coordsEl.textContent = lat + ', ' + lng;
                    if (openBtn) openBtn.href = 'https://www.google.com/maps/search/?api=1&query=' + encodeURIComponent(lat + ',' + lng);
                } else {
                    // fallback to title-based search
                    const fallbackQuery = encodeURIComponent(title + ' ' + (card.querySelector('p')?.textContent || ''));
                    if (coordsEl) coordsEl.textContent = '—';
                    if (openBtn) openBtn.href = 'https://www.google.com/maps/search/?api=1&query=' + fallbackQuery;
                }
                mapModal.setAttribute('aria-hidden', 'false');
                mapModal.classList.add('open');
                document.body.style.overflow = 'hidden';

                // accessibility: save last focused element and trap focus
                const lastFocus = document.activeElement;
                try { mapModalClose.focus(); } catch (e) {}

                const keyHandler = (ev) => {
                    if (ev.key === 'Escape') closeModal();
                };

                const focusHandler = (ev) => {
                    if (!mapModal.contains(ev.target)) {
                        ev.stopPropagation();
                        try { mapModalClose.focus(); } catch (e) {}
                    }
                };

                document.addEventListener('keydown', keyHandler);
                document.addEventListener('focusin', focusHandler);

                // attach cleanup to closeModal via property so it can remove listeners
                mapModal._cleanup = () => {
                    document.removeEventListener('keydown', keyHandler);
                    document.removeEventListener('focusin', focusHandler);
                    if (lastFocus) try { lastFocus.focus(); } catch (e) {}
                    mapModal._cleanup = null;
                };
        });
    });

    // Close handlers
    const closeModal = () => {
        mapModal.classList.remove('open');
        mapModalIframe.src = '';
        document.body.style.overflow = '';
        mapModal.setAttribute('aria-hidden', 'true');
        if (mapModal._cleanup) mapModal._cleanup();
    };

    mapModalClose.addEventListener('click', closeModal);
    mapModal.addEventListener('click', (e) => {
        if (e.target === mapModal) closeModal();
    });

    // Interactive radial background following mouse for each card
    document.querySelectorAll('.card').forEach(card => {
        card.addEventListener('mousemove', (e) => {
            const rect = card.getBoundingClientRect();
            const x = ((e.clientX - rect.left) / rect.width) * 100;
            const y = ((e.clientY - rect.top) / rect.height) * 100;
            card.style.setProperty('--mx', x + '%');
            card.style.setProperty('--my', y + '%');
        });

        card.addEventListener('mouseleave', () => {
            card.style.setProperty('--mx', '50%');
            card.style.setProperty('--my', '20%');
        });
    });
}

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initMapModalAndCardBg);
} else {
    initMapModalAndCardBg();
}

/* === COLUMNIZER WITH PER-COLUMN MAPS === */
function makeColumnsWithMaps(columnCount = 4) {
    const container = document.querySelector('.cards');
    if (!container) return;

    const existing = Array.from(container.querySelectorAll('.card'));
    if (existing.length === 0) return;

    if (container.classList.contains('columns-ready')) return;

    const wrapper = document.createElement('div');
    wrapper.className = 'columns';

    const cols = [];
    for (let i = 0; i < columnCount; i++) {
        const c = document.createElement('div');
        c.className = 'card-column';
        c.setAttribute('data-col', i);
        cols.push(c);
        wrapper.appendChild(c);
    }

    // distribute cards round-robin
    existing.forEach((card, idx) => {
        const col = cols[idx % columnCount];
        col.appendChild(card);
    });

    // for each column, insert a small map at the top that links to Google Maps for the province
    cols.forEach(col => {
        const firstCard = col.querySelector('.card');
        let mapQuery = 'Indonesia';
        if (firstCard) {
            const lat = firstCard.dataset.lat;
            const lng = firstCard.dataset.lng;
            const provinceP = firstCard.querySelector('p');
            const province = provinceP ? provinceP.textContent.trim() : '';
            if (lat && lng) mapQuery = lat + ',' + lng;
            else if (province) mapQuery = province;
        }

        const mapWrap = document.createElement('div');
        mapWrap.className = 'column-map';

        const iframe = document.createElement('iframe');
        // show the province/coord at a zoom that fits province-level view
        iframe.src = 'https://www.google.com/maps?q=' + encodeURIComponent(mapQuery) + '&z=6&output=embed';
        iframe.loading = 'lazy';
        mapWrap.appendChild(iframe);

        const caption = document.createElement('div');
        caption.className = 'map-caption';
        caption.textContent = firstCard ? (firstCard.querySelector('p')?.textContent || 'Lokasi') : 'Lokasi';
        mapWrap.appendChild(caption);

        // clicking the map opens the location in Google Maps in a new tab
        mapWrap.addEventListener('click', () => {
            const mapsUrl = 'https://www.google.com/maps/search/?api=1&query=' + encodeURIComponent(mapQuery);
            window.open(mapsUrl, '_blank');
        });

        col.insertBefore(mapWrap, col.firstChild);
    });

    container.innerHTML = '';
    container.appendChild(wrapper);
    container.classList.add('columns-ready');

    // rebuild searchData variable (so search still works)
    // `cards` and `searchData` are const earlier; to keep original names working, update in-place
    try {
        // find global cards and searchData via window (they are const; rebuilding local references)
        // We'll re-query nodes used by search functions by replacing the searchData array contents
        if (window.searchData && Array.isArray(window.searchData)) {
            // not present in this scope; fallback to nothing
        }
    } catch (e) {}
}
