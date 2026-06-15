import { CAT_ICONS, CAT_COLORS } from './categories.js'

export function renderDetail(recipe) {
  const icon = CAT_ICONS[recipe.category] || '🍴'
  const catColor = CAT_COLORS[recipe.category] || '#f5f5f5'
  const ingredients = recipe.ingredients || []
  const steps = recipe.steps || []

  return `
    <button class="back-btn" id="backBtn">
      <i class="ti ti-arrow-left"></i> Back
    </button>

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
