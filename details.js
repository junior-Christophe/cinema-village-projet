const detailsContainer = document.getElementById('details-container');
const OMDB_API_KEY = 'f840fb38';

function getIdFromQuery() {
    const params = new URLSearchParams(window.location.search);
    return params.get('id');
}

async function loadDetails() {
    const id = getIdFromQuery();
    if (!id) {
        detailsContainer.innerHTML = '<p style="color:white">No show id provided.</p>';
        return;
    }
    try {
        let show;
        if (id.startsWith('tt')) {
            const res = await fetch(`https://www.omdbapi.com/?i=${id}&apikey=${OMDB_API_KEY}`);
            const data = await res.json();
            if (data.Response === 'False') throw new Error('Show not found');
            show = { _omdb: true, ...data };
        } else {
            const res = await fetch(`https://api.tvmaze.com/shows/${id}`);
            if (!res.ok) throw new Error('Show not found');
            const data = await res.json();
            show = { _omdb: false, ...data };
        }
        renderDetails(show);
    } catch (err) {
        console.error(err);
        detailsContainer.innerHTML = '<p style="color:white">Failed to load show details.</p>';
    }
}

function renderDetails(show) {
    function formatDateFrench(dStr) {
        if (!dStr) return '';
        const d = new Date(dStr);
        if (isNaN(d)) return dStr; // fallback to original string
        const dd = String(d.getDate()).padStart(2, '0');
        const mm = String(d.getMonth() + 1).padStart(2, '0');
        const yyyy = d.getFullYear();
        return `${dd}/${mm}/${yyyy}`;
    }

    if (show._omdb) {
        const img = show.Poster && show.Poster !== 'N/A' ? show.Poster : '';
        const ratingsHtml = Array.isArray(show.Ratings) && show.Ratings.length ? `
            <p><strong>Notes:</strong> ${show.Ratings.map(r => `${r.Source}: ${r.Value}`).join(' — ')}</p>
        ` : '';
        const dvdHtml = show.DVD && show.DVD !== 'N/A' ? `<p><strong>Date sortie DVD:</strong> ${formatDateFrench(show.DVD)}</p>` : '';
        detailsContainer.innerHTML = `
            <h1>${show.Title || ''} ${show.Year ? `(${show.Year})` : ''}</h1>
            ${img ? `<img src="${img}" alt="${show.Title}">` : ''}
            <p><strong>Genre :</strong> ${show.Genre || 'N/A'}</p>
            <p><strong>Acteurs :</strong> ${show.Actors || 'N/A'}</p>
            <p><strong>Durée :</strong> ${show.Runtime || 'N/A'}</p>
            <p><strong>Réalisateur :</strong> ${show.Director || 'N/A'}</p>
            <p><strong>Note IMDb :</strong> ${show.imdbRating || 'N/A'}</p>
            ${ratingsHtml}
            ${dvdHtml}
            <h3>Résumé</h3>
            <div style="line-height:1.5;">${show.Plot || 'N/A'}</div>
        `;
    } else {
        const imgSrc = show.image ? (show.image.original || show.image.medium) : '';
        const rating = show.rating && show.rating.average ? show.rating.average : 'N/A';
        detailsContainer.innerHTML = `
            <h1>${show.name || ''}</h1>
            ${imgSrc ? `<img src="${imgSrc}" alt="${show.name}">` : ''}
            <p><strong>Genres :</strong> ${show.genres ? show.genres.join(', ') : 'N/A'}</p>
            <p><strong>Acteurs :</strong> ${show._embedded && show._embedded.cast ? show._embedded.cast.map(c=>c.person && c.person.name).filter(Boolean).join(', ') : 'N/A'}</p>
            <p><strong>Note :</strong> ${rating}</p>
            <h3>Résumé</h3>
            <div style="line-height:1.5">${show.summary || ''}</div>
        `;
    }
}

loadDetails();
