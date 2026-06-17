import { CATEGORIES } from './categories.js'

export function renderAdd() {
  return `
    <div class="add-header">
      <h2>Share a recipe</h2>
      <p>Add something the family will love</p>
    </div>

    <div class="add-tab-row">
      <button class="add-tab active" data-tab="manual">
        <i class="ti ti-pencil"></i> Fill it in
      </button>
      <button class="add-tab" data-tab="paste">
        <i class="ti ti-clipboard-text"></i> Paste a recipe
      </button>
    </div>

    <!-- PASTE TAB -->
    <div id="tab-paste" class="add-tab-content" style="display:none">
      <div class="form-section">
        <label class="form-label">Paste your recipe</label>
        <p class="form-hint" style="margin-bottom:10px">Copy and paste a recipe from anywhere — a website, an email, a text message. Claude will identify the ingredients and steps automatically.</p>
        <textarea class="form-input" id="pasteInput" rows="12" placeholder="Paste your recipe here...&#10;&#10;Example:&#10;Grandma's Chicken Soup&#10;Serves 6 • 1 hour&#10;&#10;Ingredients:&#10;1 whole chicken&#10;3 carrots, chopped&#10;...&#10;&#10;Instructions:&#10;1. Bring a large pot of water to a boil..."></textarea>
      </div>
      <button class="submit-btn" id="parseBtn">
        <i class="ti ti-sparkles"></i> Identify Ingredients &amp; Steps
      </button>
      <div id="parseError" class="error-banner" style="margin-top:12px"></div>
    </div>

    <!-- MANUAL TAB -->
    <div id="tab-manual" class="add-tab-content">
      <div id="successBanner" class="success-banner">
        Recipe saved! The family can see it now. 🎉
      </div>
      <div id="errorBanner" class="error-banner"></div>

      <div class="form-section">
        <div class="two-col">
          <div>
            <label class="form-label">Your name</label>
            <input class="form-input" id="f_name" type="text" placeholder="e.g. Grandma Rose" autocomplete="name">
          </div>
          <div>
            <label class="form-label">Initials</label>
            <input class="form-input" id="f_initials" type="text" placeholder="e.g. DAM" maxlength="3" style="text-transform:uppercase">
          </div>
        </div>
        <p class="form-hint">3 letters — shown on the recipe card so the family knows who shared it</p>
      </div>

      <div class="form-section">
        <label class="form-label">Recipe name</label>
        <input class="form-input" id="f_title" type="text" placeholder="e.g. Sunday Pot Roast">
      </div>

      <div class="form-section">
        <label class="form-label">Category</label>
        <select class="form-input" id="f_cat">
          <option value="">Select a category</option>
          ${CATEGORIES.map(c => `<option value="${c}">${c}</option>`).join('')}
        </select>
      </div>

      <div class="form-section">
        <label class="form-label">Serves &amp; Time</label>
        <div class="two-col">
          <input class="form-input" id="f_serves" type="text" placeholder="e.g. Serves 4–6">
          <input class="form-input" id="f_time" type="text" placeholder="e.g. 45 min">
        </div>
      </div>

      <div class="form-section">
        <label class="form-label">Ingredients</label>
        <p class="form-hint" style="margin-bottom:10px">Amount in the first box, ingredient name in the second</p>
        <div id="ingFields"></div>
        <button class="add-more-btn" id="addIngBtn">
          <i class="ti ti-plus"></i> Add ingredient
        </button>
      </div>

      <div class="form-section">
        <label class="form-label">Steps</label>
        <p class="form-hint" style="margin-bottom:10px">Write each step as a full sentence — include the amounts right in the text so cooks don't have to look back at the ingredient list</p>
        <div id="stepFields"></div>
        <button class="add-more-btn" id="addStepBtn">
          <i class="ti ti-plus"></i> Add step
        </button>
      </div>

      <div class="form-section">
        <label class="form-label">Notes <span style="font-weight:400;text-transform:none;font-size:12px">(optional)</span></label>
        <textarea class="form-input" id="f_notes" placeholder="Tips, substitutions, family history..."></textarea>
      </div>

      <button class="submit-btn" id="submitBtn">Save to Family Collection</button>
      <div style="height:32px"></div>
    </div>
  `
}

let ingCount = 0
let stepCount = 0

export function initAddForm(onSubmit) {
  ingCount = 0
  stepCount = 0

  // Tab switching
  document.querySelectorAll('.add-tab').forEach(tab => {
    tab.addEventListener('click', () => {
      document.querySelectorAll('.add-tab').forEach(t => t.classList.remove('active'))
      document.querySelectorAll('.add-tab-content').forEach(c => c.style.display = 'none')
      tab.classList.add('active')
      document.getElementById('tab-' + tab.dataset.tab).style.display = 'block'
    })
  })

  // Paste & parse
  document.getElementById('parseBtn').addEventListener('click', () => parseRecipe())

  // Manual form
  document.getElementById('addIngBtn').addEventListener('click', addIngField)
  document.getElementById('addStepBtn').addEventListener('click', addStepField)
  document.getElementById('submitBtn').addEventListener('click', () => handleSubmit(onSubmit))

  // Start with 4 ingredient rows and 2 step rows
  for (let i = 0; i < 4; i++) addIngField()
  for (let i = 0; i < 2; i++) addStepField()
}

async function parseRecipe() {
  const raw = document.getElementById('pasteInput').value.trim()
  const errorEl = document.getElementById('parseError')
  errorEl.style.display = 'none'

  if (!raw) {
    errorEl.textContent = 'Please paste a recipe first.'
    errorEl.style.display = 'block'
    return
  }

  const btn = document.getElementById('parseBtn')
  btn.disabled = true
  btn.innerHTML = '<i class="ti ti-loader-2 spin"></i> Identifying ingredients &amp; steps...'

  try {
    const response = await fetch('/api/parse-recipe', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text: raw }),
    })

    const parsed = await response.json()
    if (!response.ok) throw new Error(parsed.error || 'Parse failed')

    // Switch to manual tab and populate
    document.querySelectorAll('.add-tab').forEach(t => t.classList.remove('active'))
    document.querySelectorAll('.add-tab-content').forEach(c => c.style.display = 'none')
    document.querySelector('[data-tab="manual"]').classList.add('active')
    document.getElementById('tab-manual').style.display = 'block'

    // Fill in fields
    if (parsed.title) document.getElementById('f_title').value = parsed.title
    if (parsed.serves) document.getElementById('f_serves').value = parsed.serves
    if (parsed.time) document.getElementById('f_time').value = parsed.time
    if (parsed.notes) document.getElementById('f_notes').value = parsed.notes

    // Set category
    if (parsed.category) {
      const sel = document.getElementById('f_cat')
      Array.from(sel.options).forEach(opt => {
        if (opt.value === parsed.category) sel.value = parsed.category
      })
    }

    // Clear and repopulate ingredients
    document.getElementById('ingFields').innerHTML = ''
    ingCount = 0
    if (parsed.ingredients?.length) {
      parsed.ingredients.forEach(ing => {
        ingCount++
        const id = 'ing_' + ingCount
        const div = document.createElement('div')
        div.className = 'ing-row'
        div.id = id
        div.innerHTML = `
          <div class="ing-bullet">•</div>
          <input class="form-input amount-input" placeholder="Amount" value="${escHtml(ing.amount || '')}" aria-label="Amount">
          <input class="form-input name-input" placeholder="Ingredient" value="${escHtml(ing.name || '')}" aria-label="Ingredient name">
          <button class="remove-btn" aria-label="Remove ingredient">✕</button>
        `
        div.querySelector('.remove-btn').addEventListener('click', () => div.remove())
        document.getElementById('ingFields').appendChild(div)
      })
    }

    // Clear and repopulate steps
    document.getElementById('stepFields').innerHTML = ''
    stepCount = 0
    if (parsed.steps?.length) {
      parsed.steps.forEach((step, i) => {
        stepCount++
        const id = 'step_' + stepCount
        const div = document.createElement('div')
        div.className = 'step-row'
        div.id = id
        div.innerHTML = `
          <div class="step-badge">${i + 1}</div>
          <textarea class="form-input" rows="2" aria-label="Step ${i + 1}">${escHtml(step)}</textarea>
          <button class="remove-btn" aria-label="Remove step">✕</button>
        `
        div.querySelector('.remove-btn').addEventListener('click', () => {
          div.remove()
          renumberSteps('#stepFields')
        })
        document.getElementById('stepFields').appendChild(div)
      })
    }

    // Scroll to form top so user can review
    window.scrollTo({ top: 0, behavior: 'smooth' })

  } catch (err) {
    errorEl.textContent = `Could not parse the recipe: ${err.message}. Try again or use the manual form.`
    errorEl.style.display = 'block'
    console.error(err)
  } finally {
    btn.disabled = false
    btn.innerHTML = '<i class="ti ti-sparkles"></i> Identify Ingredients &amp; Steps'
  }
}

function addIngField() {
  ingCount++
  const id = 'ing_' + ingCount
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
}

function addStepField() {
  stepCount++
  const id = 'step_' + stepCount
  const div = document.createElement('div')
  div.className = 'step-row'
  div.id = id
  div.innerHTML = `
    <div class="step-badge">${document.querySelectorAll('#stepFields .step-row').length + 1}</div>
    <textarea class="form-input" rows="2" placeholder="Describe this step — include amounts (e.g. 'Add 2 tbsp butter and stir until...')" aria-label="Step"></textarea>
    <button class="remove-btn" aria-label="Remove step">✕</button>
  `
  div.querySelector('.remove-btn').addEventListener('click', () => {
    div.remove()
    renumberSteps('#stepFields')
  })
  document.getElementById('stepFields').appendChild(div)
}

function renumberSteps(containerSelector) {
  document.querySelectorAll(`${containerSelector} .step-row`).forEach((row, i) => {
    const badge = row.querySelector('.step-badge')
    if (badge) badge.textContent = i + 1
  })
}

function escHtml(str) {
  return String(str || '').replace(/&/g,'&amp;').replace(/"/g,'&quot;').replace(/</g,'&lt;').replace(/>/g,'&gt;')
}

async function handleSubmit(onSubmit) {
  const name = document.getElementById('f_name').value.trim()
  const initials = document.getElementById('f_initials').value.trim().toUpperCase()
  const title = document.getElementById('f_title').value.trim()
  const cat = document.getElementById('f_cat').value
  const errorBanner = document.getElementById('errorBanner')
  errorBanner.style.display = 'none'

  if (!name || !title || !cat) {
    errorBanner.textContent = 'Please fill in your name, the recipe name, and a category.'
    errorBanner.style.display = 'block'
    errorBanner.scrollIntoView({ behavior: 'smooth', block: 'center' })
    return
  }
  if (!/^[A-Za-z]{3}$/.test(initials)) {
    errorBanner.textContent = 'Please enter exactly 3 letters for your initials (e.g. DAM).'
    errorBanner.style.display = 'block'
    errorBanner.scrollIntoView({ behavior: 'smooth', block: 'center' })
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

  const recipe = {
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
    await onSubmit(recipe)
    document.getElementById('successBanner').style.display = 'block'
    document.getElementById('f_name').value = ''
    document.getElementById('f_initials').value = ''
    document.getElementById('f_title').value = ''
    document.getElementById('f_cat').value = ''
    document.getElementById('f_serves').value = ''
    document.getElementById('f_time').value = ''
    document.getElementById('f_notes').value = ''
    document.getElementById('ingFields').innerHTML = ''
    document.getElementById('stepFields').innerHTML = ''
    ingCount = 0
    stepCount = 0
    for (let i = 0; i < 4; i++) addIngField()
    for (let i = 0; i < 2; i++) addStepField()
    window.scrollTo({ top: 0, behavior: 'smooth' })
    setTimeout(() => { document.getElementById('successBanner').style.display = 'none' }, 5000)
  } catch (err) {
    errorBanner.textContent = 'Something went wrong saving your recipe. Please try again.'
    errorBanner.style.display = 'block'
  } finally {
    btn.disabled = false
    btn.textContent = 'Save to Family Collection'
  }
}
