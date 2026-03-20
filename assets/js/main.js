(() => {
  const menuBtn = document.querySelector('[data-menu]');
  const sidebar = document.querySelector('.sidebar');

  if (menuBtn && sidebar) {
    menuBtn.addEventListener('click', () => {
      sidebar.classList.toggle('open');
    });

    document.querySelectorAll('.nav a').forEach((link) => {
      link.addEventListener('click', () => sidebar.classList.remove('open'));
    });
  }

  const searchInput = document.querySelector('.search input');
  if (!searchInput) return;

  const cards = Array.from(document.querySelectorAll('.card'));
  const resultsEl = document.querySelector('[data-search-results]');
  const index = Array.isArray(window.SEARCH_INDEX) ? window.SEARCH_INDEX : [];

  const escapeHtml = (value) =>
    value.replace(/[&<>"']/g, (char) => {
      const map = {
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&#39;"
      };
      return map[char] || char;
    });

  const renderResults = (items, query) => {
    if (!resultsEl) return;
    if (!query) {
      resultsEl.classList.remove('active');
      resultsEl.innerHTML = '';
      return;
    }

    resultsEl.classList.add('active');

    if (!items.length) {
      resultsEl.innerHTML = `<div class="search-result empty">No results for “${escapeHtml(query)}”.</div>`;
      return;
    }

    const limited = items.slice(0, 8);
    resultsEl.innerHTML = limited
      .map((item) => {
        const tags = Array.isArray(item.tags) ? item.tags.slice(0, 3) : [];
        const tagHtml = tags
          .map((tag) => `<span class="pill">${escapeHtml(tag)}</span>`)
          .join('');
        return `
          <a class="search-result" href="${escapeHtml(item.url)}">
            <div class="search-result-title">${escapeHtml(item.title)}</div>
            <div class="search-result-meta">${escapeHtml(item.summary || '')}</div>
            <div class="search-result-tags">${tagHtml}</div>
          </a>
        `;
      })
      .join('');
  };

  const filterCards = (query) => {
    if (!cards.length) return;
    if (!query) {
      cards.forEach((card) => {
        card.style.display = '';
      });
      return;
    }

    cards.forEach((card) => {
      const text = card.textContent ? card.textContent.toLowerCase() : '';
      card.style.display = text.includes(query) ? '' : 'none';
    });
  };

  const handleSearch = () => {
    const query = searchInput.value.trim().toLowerCase();
    filterCards(query);

    if (!resultsEl) return;
    if (!query) {
      renderResults([], '');
      return;
    }

    const terms = query.split(/\s+/).filter(Boolean);
    const results = index.filter((item) => {
      const haystack = `${item.title || ''} ${item.summary || ''} ${(item.tags || []).join(' ')}`.toLowerCase();
      return terms.every((term) => haystack.includes(term));
    });

    renderResults(results, query);
  };

  searchInput.addEventListener('input', handleSearch);
})();
