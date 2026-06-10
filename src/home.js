import { CAT_ICONS, CAT_COLORS } from './categories.js'

export function renderHome({ recipes, activeCategory, searchQuery, onCategoryChange, onSearch, onRecipeClick }) {
  const filtered = recipes.filter(r => {
    const matchCat = activeCategory === 'All' || r.category === activeCategory
    const q = searchQuery.toLowerCase()
    const matchQ = !q || r.title.toLowerCase().includes(q) || (r.submitted_by || '').toLowerCase().includes(q)
    return matchCat && matchQ
  })

  const cats = ['All', ...Object.keys(CAT_ICONS)]
  const catCounts = {}
  cats.forEach(c => {
    catCounts[c] = c === 'All' ? recipes.length : recipes.filter(r => r.category === c).length
  })

  return `
    <div class="greeting">
      <h2>What are we making?</h2>
      <p>Browse the family collection</p>
    </div>

    <div class="search-wrap">
      <i class="ti ti-search search-icon"></i>
      <input
        type="text"
        id="searchInput"
        placeholder="Search recipes..."
        value="${searchQuery}"
        autocomplete="off"
      >
    </div>

    <div class="cat-strip" id="catStrip">
      ${cats.map(c => {
        const count = catCounts[c]
        if (c !== 'All' && count === 0) return ''
        return `<button class="cat-pill ${c === activeCategory ? 'active' : ''}" data-cat="${c}">
          ${c === 'All' ? 'All' : CAT_ICONS[c] + ' ' + c}
          <span style="opacity:0.6;font-size:11px;margin-left:3px">${count}</span>
        </button>`
      }).join('')}
    </div>

    <div class="section-label">${filtered.length} recipe${filtered.length !== 1 ? 's' : ''}</div>

    <div class="recipe-list">
      ${filtered.length === 0 ? `
        <div class="empty-state">
          <div class="es-emoji">🍴</div>
          <p>No recipes found.<br>Try a different search or add one!</p>
        </div>
      ` : filtered.map(r => `
        <div class="recipe-card" data-id="${r.id}">
          <div class="rc-icon" style="background:${CAT_COLORS[r.category] || '#f5f5f5'}">
            ${CAT_ICONS[r.category] || '🍴'}
          </div>
          <div class="rc-body">
            <div class="rc-name">${r.title}</div>
            <div class="rc-meta">${r.category}${r.submitted_by ? ' · by ' + r.submitted_by : ''}</div>
          </div>
          <i class="ti ti-chevron-right rc-arrow"></i>
        </div>
      `).join('')}
    </div>
  `
}
