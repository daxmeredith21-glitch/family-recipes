import { CAT_ICONS, CAT_COLORS } from './categories.js'

export function renderHome({ recipes, activeCategory, activeInitials, sortBy, searchQuery }) {
  // Filter
  let filtered = recipes.filter(r => {
    const matchCat = activeCategory === 'All' || r.category === activeCategory
    const matchInit = activeInitials === 'All' || (r.initials || '').toUpperCase() === activeInitials
    const q = searchQuery.toLowerCase()
    const matchQ = !q || r.title.toLowerCase().includes(q) || (r.submitted_by || '').toLowerCase().includes(q) || (r.initials || '').toLowerCase().includes(q)
    return matchCat && matchInit && matchQ
  })

  // Sort
  if (sortBy === 'az') {
    filtered = [...filtered].sort((a, b) => a.title.localeCompare(b.title))
  } else {
    filtered = [...filtered].sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
  }

  const cats = ['All', ...Object.keys(CAT_ICONS)]
  const catCounts = {}
  cats.forEach(c => {
    catCounts[c] = c === 'All' ? recipes.length : recipes.filter(r => r.category === c).length
  })

  // Build unique initials list, sorted alphabetically
  const initialsSet = new Set(recipes.map(r => (r.initials || '').toUpperCase()).filter(Boolean))
  const initialsList = ['All', ...Array.from(initialsSet).sort()]
  const initialsCounts = {}
  initialsList.forEach(i => {
    initialsCounts[i] = i === 'All' ? recipes.length : recipes.filter(r => (r.initials || '').toUpperCase() === i).length
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

    <div class="filter-row-label">Category</div>
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

    ${initialsList.length > 2 ? `
    <div class="filter-row-label">Submitted by</div>
    <div class="cat-strip" id="initStrip">
      ${initialsList.map(i => `
        <button class="cat-pill init-pill ${i === activeInitials ? 'active' : ''}" data-init="${i}">
          ${i}
          <span style="opacity:0.6;font-size:11px;margin-left:3px">${initialsCounts[i]}</span>
        </button>
      `).join('')}
    </div>
    ` : ''}

    <div class="sort-row">
      <div class="section-label" style="margin-bottom:0">${filtered.length} recipe${filtered.length !== 1 ? 's' : ''}</div>
      <div class="sort-toggle">
        <button class="sort-btn ${sortBy === 'recent' ? 'active' : ''}" data-sort="recent">Recent</button>
        <button class="sort-btn ${sortBy === 'az' ? 'active' : ''}" data-sort="az">A–Z</button>
      </div>
    </div>

    <div class="recipe-list">
      ${filtered.length === 0 ? `
        <div class="empty-state">
          <div class="es-emoji">🍴</div>
          <p>No recipes found.<br>Try a different search or filter combination.</p>
        </div>
      ` : filtered.map(r => `
        <div class="recipe-card" data-id="${r.id}">
          <div class="rc-icon-wrap">
            <div class="rc-icon" style="background:${CAT_COLORS[r.category] || '#f5f5f5'}">
              ${CAT_ICONS[r.category] || '🍴'}
            </div>
            ${r.initials ? `<div class="rc-initials">${r.initials.toUpperCase()}</div>` : ''}
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
