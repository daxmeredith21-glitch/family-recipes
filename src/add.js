import { CATEGORIES } from './categories.js'

export function renderAdd() {
  return `
    <div class="add-header">
      <h2>Share a recipe</h2>
      <p>Add something the family will love</p>
    </div>

    <div id="successBanner" class="success-banner">
      Recipe saved! The family can see it now. 🎉
    </div>
    <div id="errorBanner" class="error-banner"></div>

    <div class="form-section">
      <label class="form-label">Your name</label>
      <input class="form-input" id="f_name" type="text" placeholder="e.g. Grandma Rose" autocomplete="name">
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
  `
}

let ingCount = 0
let stepCount = 0

export function initAddForm(onSubmit) {
  ingCount = 0
  stepCount = 0

  document.getElementById('addIngBtn').addEventListener('click', addIngField)
  document.getElementById('addStepBtn').addEventListener('click', addStepField)
  document.getElementById('submitBtn').addEventListener('click', () => handleSubmit(onSubmit))

  // Start with 4 ingredient rows and 2 step rows
  for (let i = 0; i < 4; i++) addIngField()
  for (let i = 0; i < 2; i++) addStepField()
}

function addIngField() {
  ingCount++
  const id = 'ing_' + ingCount
  const div = document.createElement('div')
  div.className = 'ing-row'
  div.id = id
  div.innerHTML = `
    <input class="form-input amount-input" placeholder="Amount" aria-label="Amount">
    <input class="form-input name-input" placeholder="Ingredient" aria-label="Ingredient name">
    <button class="remove-btn" aria-label="Remove ingredient">✕</button>
  `
  div.querySelector('.remove-btn').addEventListener('click', () => div.remove())
  document.getElementById('ingFields').appendChild(div)
}

function addStepField() {
  stepCount++
  const num = stepCount
  const id = 'step_' + num
  const div = document.createElement('div')
  div.className = 'step-row'
  div.id = id
  div.innerHTML = `
    <div class="step-badge">${num}</div>
    <textarea class="form-input" rows="2" placeholder="Describe this step — include amounts (e.g. 'Add 2 tbsp butter and stir until...')" aria-label="Step ${num}"></textarea>
    <button class="remove-btn" aria-label="Remove step">✕</button>
  `
  div.querySelector('.remove-btn').addEventListener('click', () => div.remove())
  document.getElementById('stepFields').appendChild(div)
}

async function handleSubmit(onSubmit) {
  const name = document.getElementById('f_name').value.trim()
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
    // Reset form
    document.getElementById('f_name').value = ''
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
