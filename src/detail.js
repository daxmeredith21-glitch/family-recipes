import { CAT_ICONS, CAT_COLORS } from './categories.js'

export function renderDetail(recipe) {
  const icon = CAT_ICONS[recipe.category] || '🍴'
  const catColor = CAT_COLORS[recipe.category] || '#f5f5f5'
  const ingredients = recipe.ingredients || []
  const steps = recipe.steps || []

  // Build Instacart URL with ingredients as search items
  const instacartItems = ingredients
    .map(i => [i.amount, i.name].filter(Boolean).join(' ').trim())
    .filter(Boolean)
  const instacartQuery = instacartItems.map(i => encodeURIComponent(i)).join(',')
  const instacartUrl = `https://www.instacart.com/store/search_v3/term?term=${encodeURIComponent(recipe.title + ' ingredients')}`

  return `
    <div class="detail-top-bar">
      <button class="back-btn" id="backBtn">
        <i class="ti ti-arrow-left"></i> Back
      </button>
      <button class="edit-btn" id="editBtn">
        <i class="ti ti-pencil"></i> Edit
      </button>
    </div>

    <div class="recipe-header">
      <div class="recipe-badges-row">
        <span class="recipe-cat-badge" style="background:${catColor};color:#333">
          ${icon} ${recipe.category}
        </span>
        ${recipe.initials ? `<span class="recipe-initials-badge">${recipe.initials.toUpperCase()}</span>` : ''}
      </div>
      <h1 class="recipe-title">${recipe.title}</h1>
      <div class="recipe-meta-row">
        ${recipe.serves ? `<span class="recipe-meta-item"><i class="ti ti-users" style="font-size:15px"></i> ${recipe.serves}</span>` : ''}
        ${recipe.time ? `<span class="recipe-meta-item"><i class="ti ti-clock" style="font-size:15px"></i> ${recipe.time}</span>` : ''}
      </div>
      ${recipe.submitted_by ? `<div class="submitted-by">Added by <span>${recipe.submitted_by}</span></div>` : ''}
    </div>

    ${ingredients.length ? `
      <div class="cook-section">
        <h3>Ingredients</h3>
        <div class="ing-grid">
          ${ingredients.map(i => `
            <div class="ing-item">
              <div class="ing-amount">${i.amount || ''}</div>
              <div class="ing-name">${i.name || ''}</div>
            </div>
          `).join('')}
        </div>

        <div class="shop-row">
          <a class="shop-btn instacart-btn" href="${instacartUrl}" target="_blank" rel="noopener">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" style="flex-shrink:0"><circle cx="12" cy="12" r="12" fill="#003D29"/><path d="M12 6a2 2 0 1 0 0-4 2 2 0 0 0 0 4zm-5.5 2.5A1.5 1.5 0 0 1 8 7h8a1.5 1.5 0 0 1 1.5 1.5v.5H6.5v-.5zm-.5 2h11l-1 7H7l-1-7z" fill="#fff"/></svg>
            Shop on Instacart
          </a>
          <button class="shop-btn copy-btn" id="copyIngredientsBtn">
            <i class="ti ti-clipboard"></i>
            Copy List
          </button>
        </div>

        <div id="copyConfirm" class="copy-confirm" style="display:none">
          <i class="ti ti-check"></i> Copied to clipboard!
        </div>
      </div>
    ` : ''}

    ${steps.length ? `
      <div class="cook-section">
        <h3>Steps</h3>
        <div class="step-list">
          ${steps.map((s, i) => `
            <div class="step-item">
              <div class="step-num">${i + 1}</div>
              <div class="step-text">${s}</div>
            </div>
          `).join('')}
        </div>
      </div>
    ` : ''}

    ${recipe.notes ? `
      <div class="cook-section">
        <h3>Notes</h3>
        <div class="notes-box">${recipe.notes}</div>
      </div>
    ` : ''}
  `
}

export function initDetailListeners(recipe) {
  const copyBtn = document.getElementById('copyIngredientsBtn')
  if (!copyBtn) return

  copyBtn.addEventListener('click', () => {
    const ingredients = recipe.ingredients || []
    const text = `${recipe.title} — Ingredients\n\n` +
      ingredients.map(i => `• ${[i.amount, i.name].filter(Boolean).join(' ')}`).join('\n')

    navigator.clipboard.writeText(text).then(() => {
      const confirm = document.getElementById('copyConfirm')
      if (confirm) {
        confirm.style.display = 'flex'
        setTimeout(() => { confirm.style.display = 'none' }, 2500)
      }
    }).catch(() => {
      // Fallback for older browsers
      const ta = document.createElement('textarea')
      ta.value = text
      document.body.appendChild(ta)
      ta.select()
      document.execCommand('copy')
      document.body.removeChild(ta)
      const confirm = document.getElementById('copyConfirm')
      if (confirm) {
        confirm.style.display = 'flex'
        setTimeout(() => { confirm.style.display = 'none' }, 2500)
      }
    })
  })
}
