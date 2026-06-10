import './style.css'
import { supabase } from './supabase.js'
import { renderHome } from './home.js'
import { renderDetail } from './detail.js'
import { renderAdd, initAddForm } from './add.js'

// ── State ──────────────────────────────────────────────────────────────────
const state = {
  screen: 'home',       // 'home' | 'detail' | 'add'
  recipes: [],
  loading: true,
  activeCategory: 'All',
  searchQuery: '',
  currentRecipe: null,
}

// ── Root element ───────────────────────────────────────────────────────────
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
}

function renderNav() {
  return `
    <nav class="nav">
      <div class="nav-title">Family <span>Recipes</span></div>
      <div class="nav-actions">
        <button class="nav-btn ${state.screen !== 'add' ? 'active' : ''}" id="navBrowse">Browse</button>
        <button class="nav-btn ${state.screen === 'add' ? 'active' : ''}" id="navAdd">+ Add</button>
      </div>
    </nav>
  `
}

function renderScreen() {
  if (state.loading) {
    return `<div class="loading"><div class="spinner"></div>Loading recipes...</div>`
  }

  if (state.screen === 'home') {
    return renderHome({
      recipes: state.recipes,
      activeCategory: state.activeCategory,
      searchQuery: state.searchQuery,
    })
  }

  if (state.screen === 'detail' && state.currentRecipe) {
    return renderDetail(state.currentRecipe)
  }

  if (state.screen === 'add') {
    return renderAdd()
  }

  return ''
}

// ── Event listeners ────────────────────────────────────────────────────────
function attachListeners() {
  // Nav
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

  // Home screen
  if (state.screen === 'home') {
    // Search
    document.getElementById('searchInput')?.addEventListener('input', e => {
      state.searchQuery = e.target.value
      // Re-render just the list portion without full redraw for smoothness
      const main = document.getElementById('mainContent')
      if (main) {
        main.innerHTML = renderHome({
          recipes: state.recipes,
          activeCategory: state.activeCategory,
          searchQuery: state.searchQuery,
        })
        attachHomeListeners()
      }
    })

    attachHomeListeners()
  }

  // Detail screen
  document.getElementById('backBtn')?.addEventListener('click', () => {
    state.screen = 'home'
    render()
  })

  // Add screen
  if (state.screen === 'add') {
    initAddForm(async (recipe) => {
      await addRecipe(recipe)
    })
  }
}

function attachHomeListeners() {
  // Category pills
  document.querySelectorAll('.cat-pill').forEach(btn => {
    btn.addEventListener('click', () => {
      state.activeCategory = btn.dataset.cat
      const main = document.getElementById('mainContent')
      if (main) {
        main.innerHTML = renderHome({
          recipes: state.recipes,
          activeCategory: state.activeCategory,
          searchQuery: state.searchQuery,
        })
        attachHomeListeners()
      }
    })
  })

  // Recipe cards
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

  // Re-attach search listener after partial re-render
  document.getElementById('searchInput')?.addEventListener('input', e => {
    state.searchQuery = e.target.value
    const main = document.getElementById('mainContent')
    if (main) {
      main.innerHTML = renderHome({
        recipes: state.recipes,
        activeCategory: state.activeCategory,
        searchQuery: state.searchQuery,
      })
      attachHomeListeners()
    }
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

  // Prepend new recipe to local state
  state.recipes.unshift(data)
}

// ── Boot ───────────────────────────────────────────────────────────────────
render() // Show loading state immediately
loadRecipes()
