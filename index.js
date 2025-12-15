const homeContainer = document.getElementById('home-container');
const OMDB_API_KEY = 'f840fb38';

// Small custom list of featured titles to show on the homepage
const featuredTitles = [
    'The Shawshank Redemption',
    'The Godfather',
    'The Dark Knight',
    'Inception',
    'pulp fiction',
    'fight club',
    'The Matrix',
    'The Lord of the Rings: The Fellowship of the Ring'
];

async function loadPopular() {
    try {
        const results = [];
        for (const title of featuredTitles) {
            const res = await fetch(`https://www.omdbapi.com/?t=${encodeURIComponent(title)}&apikey=${OMDB_API_KEY}`);
            const data = await res.json();
            if (data && data.Response !== 'False' && data.imdbID) {
                results.push(data);
            } else {
                // fallback: try a search query if exact title lookup fails
                const sres = await fetch(`https://www.omdbapi.com/?s=${encodeURIComponent(title)}&apikey=${OMDB_API_KEY}`);
                const sdata = await sres.json();
                if (sdata && sdata.Response !== 'False' && Array.isArray(sdata.Search) && sdata.Search.length) {
                    results.push(sdata.Search[0]);
                }
            }
        }
        if (results.length === 0) {
            homeContainer.innerHTML = '<p style="color:white;text-align:center">No featured shows available.</p>';
        } else {
            renderShows(results, homeContainer);
        }
    } catch (err) {
        console.error(err);
        homeContainer.innerHTML = '<p style="color:white;text-align:center">Failed to load featured shows.</p>';
    }
}

function renderShows(items, container) {
    container.innerHTML = '';
    for (const item of items) {
        if (!item) continue;
        const card = document.createElement('div');
        card.style.background = '#111';
        card.style.padding = '8px';
        card.style.borderRadius = '6px';
        card.style.textAlign = 'center';

        const poster = (item.Poster && item.Poster !== 'N/A') ? item.Poster : (item.image && (item.image.medium || item.image.original)) || 'https://via.placeholder.com/250x350?text=No+Image';
        const title = item.Title || item.title || item.name || '';
        const id = item.imdbID || item.imdb_id || item.imdb || item.id || '';

        const img = document.createElement('img');
        img.src = poster;
        img.alt = title;
        img.style.cursor = 'pointer';
        img.addEventListener('click', () => {
            window.location.href = `movie.html?id=${item.imdbID || id}`;
        });

        const h = document.createElement('div');
        h.textContent = title;
        h.style.color = 'white';
        h.style.margin = '8px 0';

        const link = document.createElement('a');
        link.href = `movie.html?id=${item.imdbID || id}`;
        link.textContent = 'En savoir plus';
        link.className = 'more-btn';

        card.appendChild(img);
        card.appendChild(h);
        card.appendChild(link);

        container.appendChild(card);
    }
}

// wire the Charger button to reload the featured list (no page reload)
const loadFeaturedBtn = document.getElementById('load-featured');
if (loadFeaturedBtn) {
    loadFeaturedBtn.addEventListener('click', (e) => {
        e.preventDefault();
        loadPopular();
    });
}

loadPopular();
