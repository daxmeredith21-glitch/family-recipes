import { CATEGORIES } from './categories.js'

export function renderEdit(recipe) {
  return `
    <div class="add-header">
      <h2>Edit recipe</h2>
      <p>Changes save to the family collection immediately</p>
    </div>

    <div id="successBanner" class="success-banner">Changes saved! ✓</div>
    <div id="errorBanner" class="error-banner"></div>

    <div class="form-section">
      <div class="two-col">
        <div>
          <label class="form-label">Your name</label>
          <input class="form-input" id="f_name" type="text" value="${esc(recipe.submitted_by)}" autocomplete="name">
        </div>
        <div>
          <label class="form-label">Initials</label>
          <input class="form-input" id="f_initials" type="text" value="${esc(recipe.initials || '')}" maxlength="3" style="text-transform:uppercase">
        </div>
      </div>
    </div>

    <div class="form-section">
      <label class="form-label">Recipe name</label>
      <input class="form-input" id="f_title" type="text" value="${esc(recipe.title)}">
    </div>

    <div class="form-section">
      <label class="form-label">Category</label>
      <select class="form-input" id="f_cat">
        <option value="">Select a category</option>
        ${CATEGORIES.map(c => `<option value="${c}" ${recipe.category === c ? 'selected' : ''}>${c}</option>`).join('')}
      </select>
    </div>

    <div class="form-section">
      <label class="form-label">Serves &amp; Time</label>
      <div class="two-col">
        <input class="form-input" id="f_serves" type="text" value="${esc(recipe.serves || '')}" placeholder="e.g. Serves 4–6">
        <input class="form-input" id="f_time" type="text" value="${esc(recipe.time || '')}" placeholder="e.g. 45 min">
      </div>
    </div>

    <div class="form-section">
      <label class="form-label">Ingredients</label>
      <p class="form-hint" style="margin-bottom:10px">Amount in the first box, ingredient name in the second</p>
      <div id="ingFields">
        ${(recipe.ingredients || []).map((ing, i) => `
          <div class="ing-row" id="ing_${i}">
            <div class="ing-bullet">•</div>
            <input class="form-input amount-input" placeholder="Amount" value="${esc(ing.amount || '')}" aria-label="Amount">
            <input class="form-input name-input" placeholder="Ingredient" value="${esc(ing.name || '')}" aria-label="Ingredient name">
            <button class="remove-btn" data-remove="ing_${i}" aria-label="Remove ingredient">✕</button>
          </div>
        `).join('')}
      </div>
      <button class="add-more-btn" id="addIngBtn">
        <i class="ti ti-plus"></i> Add ingredient
      </button>
    </div>

    <div class="form-section">
      <label class="form-label">Steps</label>
      <p class="form-hint" style="margin-bottom:10px">Write each step as a full sentence — include the amounts right in the text</p>
      <div id="stepFields">
        ${(recipe.steps || []).map((step, i) => `
          <div class="step-row" id="step_${i}">
            <div class="step-badge">${i + 1}</div>
            <textarea class="form-input" rows="2" aria-label="Step ${i + 1}">${esc(step)}</textarea>
            <button class="remove-btn" data-remove="step_${i}" aria-label="Remove step">✕</button>
          </div>
        `).join('')}
      </div>
      <button class="add-more-btn" id="addStepBtn">
        <i class="ti ti-plus"></i> Add step
      </button>
    </div>

    <div class="form-section">
      <label class="form-label">Notes <span style="font-weight:400;text-transform:none;font-size:12px">(optional)</span></label>
      <textarea class="form-input" id="f_notes" placeholder="Tips, substitutions, family history...">${esc(recipe.notes || '')}</textarea>
    </div>

    <button class="submit-btn" id="submitBtn">Save Changes</button>
    <button class="delete-btn" id="deleteBtn">Delete Recipe</button>
    <div style="height:32px"></div>
  `
}

function esc(str) {
  return String(str || '').replace(/&/g,'&amp;').replace(/"/g,'&quot;').replace(/</g,'&lt;').replace(/>/g,'&gt;')
}

let ingCount = 0
let stepCount = 0

function renumberSteps(containerSelector) {
  document.querySelectorAll(`${containerSelector} .step-row`).forEach((row, i) => {
    const badge = row.querySelector('.step-badge')
    if (badge) badge.textContent = i + 1
  })
}

export function initEditForm(recipe, onSave, onDelete, onBack) {
  ingCount = (recipe.ingredients || []).length
  stepCount = (recipe.steps || []).length

  // Remove buttons for existing rows
  document.querySelectorAll('[data-remove]').forEach(btn => {
    btn.addEventListener('click', () => {
      document.getElementById(btn.dataset.remove)?.remove()
      renumberSteps('#stepFields')
    })
  })

  document.getElementById('addIngBtn').addEventListener('click', () => {
    ingCount++
    const id = 'ing_new_' + ingCount
    const div = document.createElement('div')
    div.className = 'ing-row'
    div.id = id
    div.innerHTML = `
      <div class="ing-bullet">•</div>
      <input class="form-input amount-input" placeholder="Amount" aria-label="Amount">
      <input class="form-input name-input" placeholder="Ingredient" aria-label="Ingredient name">
      <button class="remove-btn" aria-label="Remove ingredient">✕</button>
    `
    div.querySelector('.remove-btn').addEventListener('click', () => div.remove())
    document.getElementById('ingFields').appendChild(div)
  })

  document.getElementById('addStepBtn').addEventListener('click', () => {
    stepCount++
    const num = document.querySelectorAll('#stepFields .step-row').length + 1
    const id = 'step_new_' + stepCount
    const div = document.createElement('div')
    div.className = 'step-row'
    div.id = id
    div.innerHTML = `
      <div class="step-badge">${num}</div>
      <textarea class="form-input" rows="2" placeholder="Describe this step..." aria-label="Step ${num}"></textarea>
      <button class="remove-btn" aria-label="Remove step">✕</button>
    `
    div.querySelector('.remove-btn').addEventListener('click', () => {
      div.remove()
      renumberSteps('#stepFields')
    })
    document.getElementById('stepFields').appendChild(div)
  })

  document.getElementById('submitBtn').addEventListener('click', () => handleSave(recipe.id, onSave))

  document.getElementById('deleteBtn').addEventListener('click', () => {
    if (confirm('Delete this recipe? This cannot be undone.')) {
      onDelete(recipe.id)
    }
  })
}

async function handleSave(id, onSave) {
  const name = document.getElementById('f_name').value.trim()
  const initials = document.getElementById('f_initials').value.trim().toUpperCase()
  const title = document.getElementById('f_title').value.trim()
  const cat = document.getElementById('f_cat').value
  const errorBanner = document.getElementById('errorBanner')
  errorBanner.style.display = 'none'

  if (!name || !title || !cat) {
    errorBanner.textContent = 'Please fill in your name, the recipe name, and a category.'
    errorBanner.style.display = 'block'
    return
  }
  if (!/^[A-Za-z]{3}$/.test(initials)) {
    errorBanner.textContent = 'Please enter exactly 3 letters for your initials (e.g. DAM).'
    errorBanner.style.display = 'block'
    return
  }

  const ingredients = []
  document.querySelectorAll('#ingFields .ing-row').forEach(row => {
    const amount = row.querySelector('.amount-input').value.trim()
    const name = row.querySelector('.name-input').value.trim()
    if (amount || name) ingredients.push({ amount, name })
  })

  const steps = []
  document.querySelectorAll('#stepFields .step-row').forEach(row => {
    const ta = row.querySelector('textarea')
    if (ta && ta.value.trim()) steps.push(ta.value.trim())
  })

  const updates = {
    title,
    category: cat,
    submitted_by: name,
    initials,
    serves: document.getElementById('f_serves').value.trim(),
    time: document.getElementById('f_time').value.trim(),
    ingredients,
    steps,
    notes: document.getElementById('f_notes').value.trim(),
  }

  const btn = document.getElementById('submitBtn')
  btn.disabled = true
  btn.textContent = 'Saving...'

  try {
    await onSave(id, updates)
    document.getElementById('successBanner').style.display = 'block'
    window.scrollTo({ top: 0, behavior: 'smooth' })
    setTimeout(() => { document.getElementById('successBanner').style.display = 'none' }, 4000)
  } catch (err) {
    errorBanner.textContent = 'Something went wrong. Please try again.'
    errorBanner.style.display = 'block'
  } finally {
    btn.disabled = false
    btn.textContent = 'Save Changes'
  }
}
