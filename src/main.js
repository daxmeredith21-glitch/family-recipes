import './style.css'
import { supabase } from './supabase.js'
import { renderHome } from './home.js'
import { renderDetail, initDetailListeners } from './detail.js'
import { renderAdd, initAddForm } from './add.js'
import { renderEdit, initEditForm } from './edit.js'
import { renderKayakList } from './kayak-list.js'
import { renderKayakAdd } from './kayak-add.js'
import { renderKayakDetail } from './kayak-detail.js'

// ── State ──────────────────────────────────────────────────────────────────
const state = {
  screen: 'home',       // 'home' | 'detail' | 'add' | 'edit' | 'kayak-list' | 'kayak-add' | 'kayak-detail'
  recipes: [],
  loading: true,
  activeCategory: 'All',
  activeInitials: 'All',
  sortBy: 'recent',
  searchQuery: '',
  currentRecipe: null,
  currentKayakTripId: null,
}

const app = document.getElementById('app')

// ── Render ─────────────────────────────────────────────────────────────────
function render() {
  app.innerHTML = `
    ${renderNav()}
    <main class="screen active" id="mainContent">
      ${renderScreen()}
    </main>
  `
  attachListeners()

  // Kayak screens are async and take a container directly
  if (state.screen === 'kayak-list') {
    renderKayakList(document.getElementById('mainContent'), (screen, id) => {
      state.screen = screen
      if (id) state.currentKayakTripId = id
      render()
      window.scrollTo(0, 0)
    })
  }
  if (state.screen === 'kayak-add') {
    renderKayakAdd(document.getElementById('mainContent'), () => {
      state.screen = 'kayak-list'
      render()
    })
  }
  if (state.screen === 'kayak-detail' && state.currentKayakTripId) {
    renderKayakDetail(document.getElementById('mainContent'), state.currentKayakTripId, () => {
      state.screen = 'kayak-list'
      render()
    })
  }
}

function renderHomeContent() {
  const main = document.getElementById('mainContent')
  if (!main) return
  main.innerHTML = renderHome({
    recipes: state.recipes,
    activeCategory: state.activeCategory,
    activeInitials: state.activeInitials,
    sortBy: state.sortBy,
    searchQuery: state.searchQuery,
  })
  attachHomeListeners()
}

function renderNav() {
  const isKayak = state.screen.startsWith('kayak')
  return `
    <nav class="nav">
      <div class="nav-title">Family <span>Recipes</span></div>
      <div class="nav-actions">
        <button class="nav-btn ${!isKayak && state.screen !== 'add' ? 'active' : ''}" id="navBrowse">Browse</button>
        <button class="nav-btn ${state.screen === 'add' ? 'active' : ''}" id="navAdd">+ Add</button>
        <button class="nav-btn ${isKayak ? 'active' : ''}" id="navKayak">🛶 Kayak</button>
      </div>
    </nav>
  `
}

function renderScreen() {
  // Kayak screens render themselves asynchronously into the container after this returns
  if (state.screen.startsWith('kayak')) {
    return `<div class="loading"><div class="spinner"></div>Loading…</div>`
  }

  if (state.loading) {
    return `<div class="loading"><div class="spinner"></div>Loading recipes...</div>`
  }
  if (state.screen === 'home') {
    return renderHome({
      recipes: state.recipes,
      activeCategory: state.activeCategory,
      activeInitials: state.activeInitials,
      sortBy: state.sortBy,
      searchQuery: state.searchQuery,
    })
  }
  if (state.screen === 'detail' && state.currentRecipe) {
    return renderDetail(state.currentRecipe)
  }
  if (state.screen === 'edit' && state.currentRecipe) {
    return renderEdit(state.currentRecipe)
  }
  if (state.screen === 'add') {
    return renderAdd()
  }
  return ''
}

// ── Listeners ──────────────────────────────────────────────────────────────
function attachListeners() {
  document.getElementById('navBrowse')?.addEventListener('click', () => {
    state.screen = 'home'
    render()
    window.scrollTo(0, 0)
  })

  document.getElementById('navAdd')?.addEventListener('click', () => {
    state.screen = 'add'
    render()
    window.scrollTo(0, 0)
  })

  document.getElementById('navKayak')?.addEventListener('click', () => {
    state.screen = 'kayak-list'
    render()
    window.scrollTo(0, 0)
  })

  if (state.screen === 'home') attachHomeListeners()

  // Detail
  document.getElementById('backBtn')?.addEventListener('click', () => {
    state.screen = 'home'
    render()
  })
  document.getElementById('editBtn')?.addEventListener('click', () => {
    state.screen = 'edit'
    render()
    window.scrollTo(0, 0)
  })
  if (state.screen === 'detail' && state.currentRecipe) {
    initDetailListeners(state.currentRecipe)
  }

  // Edit
  if (state.screen === 'edit' && state.currentRecipe) {
    initEditForm(
      state.currentRecipe,
      async (id, updates) => {
        await updateRecipe(id, updates)
      },
      async (id) => {
        await deleteRecipe(id)
        state.screen = 'home'
        render()
      },
      () => {
        state.screen = 'detail'
        render()
      }
    )
  }

  // Add
  if (state.screen === 'add') {
    initAddForm(async (recipe) => {
      await addRecipe(recipe)
    })
  }
}

function attachHomeListeners() {
  document.getElementById('searchInput')?.addEventListener('input', e => {
    state.searchQuery = e.target.value
    renderHomeContent()
    const input = document.getElementById('searchInput')
    if (input) {
      input.focus()
      const val = input.value
      input.setSelectionRange(val.length, val.length)
    }
  })

  document.querySelectorAll('#catStrip .cat-pill').forEach(btn => {
    btn.addEventListener('click', () => {
      state.activeCategory = btn.dataset.cat
      renderHomeContent()
    })
  })

  document.querySelectorAll('#initStrip .cat-pill').forEach(btn => {
    btn.addEventListener('click', () => {
      state.activeInitials = btn.dataset.init
      renderHomeContent()
    })
  })

  document.querySelectorAll('.sort-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      state.sortBy = btn.dataset.sort
      renderHomeContent()
    })
  })

  document.querySelectorAll('.recipe-card').forEach(card => {
    card.addEventListener('click', () => {
      const id = card.dataset.id
      const recipe = state.recipes.find(r => String(r.id) === String(id))
      if (recipe) {
        state.currentRecipe = recipe
        state.screen = 'detail'
        render()
        window.scrollTo(0, 0)
      }
    })
  })
}

// ── Data ───────────────────────────────────────────────────────────────────
async function loadRecipes() {
  try {
    const { data, error } = await supabase
      .from('recipes')
      .select('*')
      .order('created_at', { ascending: false })
    if (error) throw error
    state.recipes = data || []
  } catch (err) {
    console.error('Error loading recipes:', err)
    state.recipes = []
  } finally {
    state.loading = false
    render()
  }
}

async function addRecipe(recipe) {
  const { data, error } = await supabase
    .from('recipes')
    .insert([recipe])
    .select()
    .single()
  if (error) throw error
  state.recipes.unshift(data)
}

async function updateRecipe(id, updates) {
  const { data, error } = await supabase
    .from('recipes')
    .update(updates)
    .eq('id', id)
    .select()
    .single()
  if (error) throw error
  const idx = state.recipes.findIndex(r => r.id === id)
  if (idx !== -1) state.recipes[idx] = data
  state.currentRecipe = data
}

async function deleteRecipe(id) {
  const { error } = await supabase
    .from('recipes')
    .delete()
    .eq('id', id)
  if (error) throw error
  state.recipes = state.recipes.filter(r => r.id !== id)
  state.currentRecipe = null
}

// ── Boot ───────────────────────────────────────────────────────────────────
render()
loadRecipes()
