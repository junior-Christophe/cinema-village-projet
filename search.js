const container = document.getElementById('search-container') || document.querySelector('.image-container');
const errorEl = document.querySelector('.error-message');
const inputEl = document.getElementById('search-input') || document.querySelector('.Search-input');
const loadMoreBtn = document.getElementById('load-more');
const OMDB_API_KEY = 'f840fb38';

let currentQuery = '';
let currentPage = 1;
let totalResults = 0;
let loading = false;

function setError(msg) {
    if (errorEl) errorEl.textContent = msg || '';
}

function debounce(fn, wait) {
    let t;
    return (...args) => {
        clearTimeout(t);
        t = setTimeout(() => fn(...args), wait);
    };
}

async function search(query, page = 1, append = false) {
    if (!query) {
        container.innerHTML = '';
        setError('');
        totalResults = 0;
        currentPage = 1;
        return;
    }
    if (loading) return;
    loading = true;
    setError('');
    try {
        const res = await fetch(`https://www.omdbapi.com/?s=${encodeURIComponent(query)}&page=${page}&apikey=${OMDB_API_KEY}`);
        const data = await res.json();
        if (data.Response === 'False') {
            if (!append) container.innerHTML = '';
            setError(data.Error || 'No results found.');
            totalResults = 0;
            loading = false;
            return;
        }
        totalResults = parseInt(data.totalResults || '0', 10) || 0;
        currentPage = page;
        renderResults(data.Search || [], append);
    } catch (err) {
        console.error(err);
        setError('Failed to fetch results.');
    } finally {
        loading = false;
        updateLoadMoreVisibility();
    }
}

function renderResults(items, append = false) {
    if (!Array.isArray(items)) return;
    if (!append) container.innerHTML = '';
    for (const item of items) {
        const card = document.createElement('div');
        card.style.background = '#111';
        card.style.padding = '8px';
        card.style.borderRadius = '6px';
        card.style.textAlign = 'center';

        const poster = (item.Poster && item.Poster !== 'N/A') ? item.Poster : 'https://via.placeholder.com/250x350?text=No+Image';
        const title = item.Title || item.name || '';
        const id = item.imdbID || item.id || '';

        const img = document.createElement('img');
        img.src = poster;
        img.alt = title;
        img.style.cursor = 'pointer';

        const h = document.createElement('div');
        h.textContent = title;
        h.style.color = 'white';
        h.style.margin = '8px 0';

        const link = document.createElement('a');
        link.href = `movie.html?id=${id}`;
        link.textContent = 'En savoir plus';
        link.className = 'more-btn';

        card.appendChild(img);
        card.appendChild(h);
        card.appendChild(link);
        container.appendChild(card);
    }
}

function updateLoadMoreVisibility() {
    if (!loadMoreBtn) return;
    const shown = container.children.length;
    if (totalResults > shown) {
        loadMoreBtn.style.display = 'inline-block';
    } else {
        loadMoreBtn.style.display = 'none';
    }
}

const debouncedSearch = debounce((q) => {
    currentPage = 1;
    search(q, 1, false);
}, 300);

if (inputEl) {
    inputEl.addEventListener('input', (e) => {
        const q = e.target.value.trim();
        currentQuery = q;
        debouncedSearch(q);
    });
}

if (loadMoreBtn) {
    loadMoreBtn.addEventListener('click', (e) => {
        e.preventDefault();
        if (!currentQuery) return;
        const next = currentPage + 1;
        search(currentQuery, next, true);
    });
}

// keep the old Search-button functional (triggers immediate search)
const legacyButton = document.querySelector('.Search-button');
if (legacyButton && inputEl) {
    legacyButton.addEventListener('click', (e) => {
        e.preventDefault();
        const q = inputEl.value.trim();
        currentQuery = q;
        currentPage = 1;
        search(q, 1, false);
    });
}

