/**
 * Nutrition Component - Gautham's Protein & Food Center
 * Clean focus on Food, Protein, Water. No bloated calorie micromanagement.
 */

import { appState } from '../state.js';

export function renderNutrition(container) {
  const profile = appState.profile;
  const log = appState.getTodayLog();
  const totalProtein = appState.getTodayTotalProtein();
  const proteinTarget = profile.proteinTargetG;
  const remainingProtein = Math.max(0, proteinTarget - totalProtein);

  container.innerHTML = `
    <div class="nutrition-page animate-fade-in">
      <header class="page-header">
        <div>
          <h1 class="page-title">Nutrition</h1>
          <p class="page-subtitle">Focus on high quality food, protein targets, and water.</p>
        </div>
      </header>

      <!-- SUMMARY BAR -->
      <div class="dash-card nutrition-summary-card">
        <div class="summary-main">
          <div class="summary-metric">
            <span class="metric-label">Today's Protein</span>
            <span class="metric-val highlight-protein">${totalProtein.toFixed(1)} <span class="unit">/ ${proteinTarget}g</span></span>
          </div>
          <div class="summary-metric">
            <span class="metric-label">Remaining Target</span>
            <span class="metric-val">${remainingProtein.toFixed(1)}g</span>
          </div>
          <div class="summary-metric">
            <span class="metric-label">Water Intake</span>
            <span class="metric-val highlight-water">${log.waterIntakeL.toFixed(1)} <span class="unit">/ ${profile.waterTargetL}L</span></span>
          </div>
        </div>
        <div class="summary-actions">
          <button class="btn-primary" id="btn-open-add-food-modal">+ Log Food</button>
          <button class="btn-secondary" id="btn-calc-protein-target">Calc Target</button>
        </div>
      </div>

      <!-- TABS FOR NUTRITION SECTIONS -->
      <div class="tab-subnav">
        <button class="tab-btn active" data-nut-tab="today-log">Today's Food Log (${log.foodEntries.length})</button>
        <button class="tab-btn" data-nut-tab="saved-meals">Saved Meals (${appState.savedMeals.length})</button>
        <button class="tab-btn" data-nut-tab="saved-foods">Saved Foods Library (${appState.savedFoods.length})</button>
      </div>

      <!-- SUBTAB 1: TODAY'S FOOD LOG -->
      <div class="nut-tab-pane active" id="pane-today-log">
        <div class="food-list-container">
          ${log.foodEntries.length === 0 ? `
            <div class="empty-state">
              <div class="empty-icon">🍳</div>
              <p>No food logged yet for today.</p>
              <button class="btn-primary-sm mt-3" id="empty-add-food-btn">+ Add Today's First Food</button>
            </div>
          ` : `
            <div class="food-items-list">
              ${log.foodEntries.map(entry => `
                <div class="dash-card food-entry-card" data-entry-id="${entry.id}">
                  <div class="food-entry-info">
                    <span class="food-name">${escapeHtml(entry.name)}</span>
                    <span class="food-qty">${escapeHtml(entry.qty)} ${entry.timestamp ? '• ' + entry.timestamp : ''}</span>
                  </div>
                  <div class="food-entry-protein">
                    <span class="protein-tag">+${entry.proteinG}g protein</span>
                  </div>
                  <div class="food-entry-actions">
                    <button class="btn-icon edit-entry-btn" data-id="${entry.id}" title="Edit Entry">✏️</button>
                    <button class="btn-icon delete-entry-btn" data-id="${entry.id}" title="Delete Entry">🗑️</button>
                  </div>
                </div>
              `).join('')}
            </div>
          `}
        </div>
      </div>

      <!-- SUBTAB 2: SAVED MEALS (REUSABLE TEMPLATES) -->
      <div class="nut-tab-pane" id="pane-saved-meals">
        <div class="pane-header-actions">
          <p class="pane-desc">Click <strong>+ Add to Today</strong> to log a saved meal. Adding it creates an isolated copy for today's log.</p>
          <button class="btn-secondary-sm" id="btn-create-saved-meal">+ New Saved Meal Template</button>
        </div>
        <div class="saved-meals-grid">
          ${appState.savedMeals.map(meal => `
            <div class="dash-card saved-meal-card" data-meal-id="${meal.id}">
              <div class="saved-meal-header">
                <h3 class="meal-title">${escapeHtml(meal.name)}</h3>
                <span class="meal-protein-badge">${meal.totalProteinG}g Protein</span>
              </div>
              <ul class="meal-items-preview">
                ${meal.items.map(item => `
                  <li><span>${escapeHtml(item.name)} (${escapeHtml(item.qty)})</span> <span>${item.proteinG}g</span></li>
                `).join('')}
              </ul>
              <div class="meal-card-footer">
                <button class="btn-primary-sm btn-add-meal-today" data-meal-id="${meal.id}">+ Add to Today</button>
                <button class="btn-micro btn-duplicate-meal" data-meal-id="${meal.id}">Duplicate</button>
                <button class="btn-micro btn-delete-meal" data-meal-id="${meal.id}">Delete</button>
              </div>
            </div>
          `).join('')}
        </div>
      </div>

      <!-- SUBTAB 3: SAVED FOODS LIBRARY -->
      <div class="nut-tab-pane" id="pane-saved-foods">
        <div class="pane-header-actions">
          <p class="pane-desc">Preloaded with popular high-protein Indian foods & custom ingredients.</p>
          <button class="btn-secondary-sm" id="btn-create-saved-food">+ Add Custom Food</button>
        </div>
        <div class="saved-foods-grid">
          ${appState.savedFoods.map(food => `
            <div class="dash-card saved-food-card">
              <div class="food-card-body">
                <span class="food-category-chip">${escapeHtml(food.category)}</span>
                <h4 class="saved-food-title">${escapeHtml(food.name)}</h4>
                <p class="saved-food-meta">${escapeHtml(food.defaultQty)} • <strong class="highlight-protein">${food.proteinG}g protein</strong></p>
              </div>
              <div class="food-card-actions">
                <button class="btn-primary-sm btn-quick-log-food" data-food-id="${food.id}">+ Log Today</button>
                <button class="btn-micro btn-delete-saved-food" data-food-id="${food.id}">Delete</button>
              </div>
            </div>
          `).join('')}
        </div>
      </div>

      <!-- MODAL CONTAINER FOR NUTRITION ACTIONS -->
      <div class="modal-overlay" id="nutrition-modal-overlay" style="display: none;">
        <div class="modal-content dash-card">
          <div class="modal-header">
            <h3 class="modal-title" id="nut-modal-title">Log Food</h3>
            <button class="modal-close-btn" id="nut-modal-close">&times;</button>
          </div>
          <div class="modal-body" id="nut-modal-body">
            <!-- Dynamic modal content -->
          </div>
        </div>
      </div>
    </div>
  `;

  attachNutritionEvents(container);
}

function attachNutritionEvents(container) {
  // Subtab Switching
  const tabBtns = container.querySelectorAll('.tab-btn');
  const panes = container.querySelectorAll('.nut-tab-pane');

  tabBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      tabBtns.forEach(b => b.classList.remove('active'));
      panes.forEach(p => p.classList.remove('active'));

      btn.classList.add('active');
      const targetId = 'pane-' + btn.getAttribute('data-nut-tab');
      const targetPane = container.querySelector('#' + targetId);
      if (targetPane) targetPane.classList.add('active');
    });
  });

  // Open Add Food Modal
  const openAddFoodBtn = container.querySelector('#btn-open-add-food-modal');
  const emptyAddFoodBtn = container.querySelector('#empty-add-food-btn');

  const handlerOpenAdd = () => {
    openFoodModal(container, 'add-food');
  };

  if (openAddFoodBtn) openAddFoodBtn.addEventListener('click', handlerOpenAdd);
  if (emptyAddFoodBtn) emptyAddFoodBtn.addEventListener('click', handlerOpenAdd);

  // Edit / Delete Logged Food Entries
  container.querySelectorAll('.edit-entry-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const entryId = e.currentTarget.getAttribute('data-id');
      const log = appState.getTodayLog();
      const entry = log.foodEntries.find(item => item.id === entryId);
      if (entry) {
        openFoodModal(container, 'edit-food', entry);
      }
    });
  });

  container.querySelectorAll('.delete-entry-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const entryId = e.currentTarget.getAttribute('data-id');
      if (confirm('Delete this food entry from today\'s log?')) {
        appState.deleteFoodEntry(entryId);
      }
    });
  });

  // Add Saved Meal to Today
  container.querySelectorAll('.btn-add-meal-today').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const mealId = e.currentTarget.getAttribute('data-meal-id');
      appState.addSavedMealToToday(mealId);
      alert('Saved meal added to today\'s food log!');
    });
  });

  // Duplicate / Delete Saved Meal
  container.querySelectorAll('.btn-duplicate-meal').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const mealId = e.currentTarget.getAttribute('data-meal-id');
      appState.duplicateSavedMeal(mealId);
    });
  });

  container.querySelectorAll('.btn-delete-meal').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const mealId = e.currentTarget.getAttribute('data-meal-id');
      if (confirm('Delete this saved meal template?')) {
        appState.deleteSavedMeal(mealId);
      }
    });
  });

  // Create New Saved Meal Template
  const createMealBtn = container.querySelector('#btn-create-saved-meal');
  if (createMealBtn) {
    createMealBtn.addEventListener('click', () => {
      openFoodModal(container, 'create-meal');
    });
  }

  // Quick Log Saved Food
  container.querySelectorAll('.btn-quick-log-food').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const foodId = e.currentTarget.getAttribute('data-food-id');
      const food = appState.savedFoods.find(f => f.id === foodId);
      if (food) {
        appState.addFoodEntryToToday({
          name: food.name,
          qty: food.defaultQty,
          proteinG: food.proteinG
        });
        alert(`Logged ${food.name} (${food.proteinG}g protein) to today's log!`);
      }
    });
  });

  // Create Custom Saved Food
  const createSavedFoodBtn = container.querySelector('#btn-create-saved-food');
  if (createSavedFoodBtn) {
    createSavedFoodBtn.addEventListener('click', () => {
      openFoodModal(container, 'create-food-item');
    });
  }

  // Delete Custom Saved Food
  container.querySelectorAll('.btn-delete-saved-food').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const foodId = e.currentTarget.getAttribute('data-food-id');
      if (confirm('Remove this food from your saved foods library?')) {
        appState.deleteSavedFood(foodId);
      }
    });
  });

  // Calculate Protein Target Calculator
  const calcProteinBtn = container.querySelector('#btn-calc-protein-target');
  if (calcProteinBtn) {
    calcProteinBtn.addEventListener('click', () => {
      const w = appState.profile.weightKg || 74.5;
      const recModerate = Math.round(w * 1.6);
      const recHigh = Math.round(w * 2.2);

      const msg = `Based on your weight (${w} kg):\n` +
                  `• Muscle Maintenance: ~${recModerate}g / day (1.6g/kg)\n` +
                  `• Mild Muscle Growth: ~${recHigh}g / day (2.2g/kg)\n\n` +
                  `Your current target: ${appState.profile.proteinTargetG}g.\n` +
                  `Would you like to set a new daily target?`;
      const val = prompt(msg, appState.profile.proteinTargetG);
      if (val !== null) {
        const newTarget = parseInt(val, 10);
        if (!isNaN(newTarget) && newTarget > 0) {
          appState.profile.proteinTargetG = newTarget;
          appState.notify();
        }
      }
    });
  }

  // Modal Close Button
  const modalOverlay = container.querySelector('#nutrition-modal-overlay');
  const modalClose = container.querySelector('#nut-modal-close');
  if (modalClose && modalOverlay) {
    modalClose.addEventListener('click', () => {
      modalOverlay.style.display = 'none';
    });
  }
}

function openFoodModal(container, mode, payload = null) {
  const modalOverlay = container.querySelector('#nutrition-modal-overlay');
  const modalTitle = container.querySelector('#nut-modal-title');
  const modalBody = container.querySelector('#nut-modal-body');

  modalOverlay.style.display = 'flex';

  if (mode === 'add-food') {
    modalTitle.textContent = 'Log Food Entry';
    modalBody.innerHTML = `
      <form id="form-add-food-log">
        <div class="form-group">
          <label class="form-label">Food Name</label>
          <input type="text" class="form-input" id="inp-food-name" placeholder="e.g. Chicken Breast, Whey Shake" required>
        </div>
        <div class="form-group">
          <label class="form-label">Serving / Quantity</label>
          <input type="text" class="form-input" id="inp-food-qty" placeholder="e.g. 150g, 1 scoop, 2 pieces" value="100g" required>
        </div>
        <div class="form-group">
          <label class="form-label">Protein (grams)</label>
          <input type="number" step="0.1" class="form-input" id="inp-food-protein" placeholder="e.g. 30" required>
        </div>
        <div class="form-actions">
          <button type="submit" class="btn-primary">Add Food</button>
        </div>
      </form>
    `;

    container.querySelector('#form-add-food-log').addEventListener('submit', (e) => {
      e.preventDefault();
      const name = container.querySelector('#inp-food-name').value.trim();
      const qty = container.querySelector('#inp-food-qty').value.trim();
      const proteinG = parseFloat(container.querySelector('#inp-food-protein').value);

      appState.addFoodEntryToToday({ name, qty, proteinG });
      modalOverlay.style.display = 'none';
    });
  } else if (mode === 'edit-food' && payload) {
    modalTitle.textContent = 'Edit Logged Food';
    modalBody.innerHTML = `
      <form id="form-edit-food-log">
        <div class="form-group">
          <label class="form-label">Food Name</label>
          <input type="text" class="form-input" id="inp-edit-food-name" value="${escapeHtml(payload.name)}" required>
        </div>
        <div class="form-group">
          <label class="form-label">Quantity</label>
          <input type="text" class="form-input" id="inp-edit-food-qty" value="${escapeHtml(payload.qty)}" required>
        </div>
        <div class="form-group">
          <label class="form-label">Protein (grams)</label>
          <input type="number" step="0.1" class="form-input" id="inp-edit-food-protein" value="${payload.proteinG}" required>
        </div>
        <div class="form-actions">
          <button type="submit" class="btn-primary">Save Changes</button>
        </div>
      </form>
    `;

    container.querySelector('#form-edit-food-log').addEventListener('submit', (e) => {
      e.preventDefault();
      const name = container.querySelector('#inp-edit-food-name').value.trim();
      const qty = container.querySelector('#inp-edit-food-qty').value.trim();
      const proteinG = parseFloat(container.querySelector('#inp-edit-food-protein').value);

      appState.updateFoodEntry(payload.id, { name, qty, proteinG });
      modalOverlay.style.display = 'none';
    });
  } else if (mode === 'create-food-item') {
    modalTitle.textContent = 'Add Custom Saved Food';
    modalBody.innerHTML = `
      <form id="form-create-saved-food">
        <div class="form-group">
          <label class="form-label">Food Title</label>
          <input type="text" class="form-input" id="inp-saved-food-name" placeholder="e.g. My Custom Whey Brand" required>
        </div>
        <div class="form-group">
          <label class="form-label">Default Serving Size</label>
          <input type="text" class="form-input" id="inp-saved-food-qty" placeholder="e.g. 1 scoop (30g)" value="100g" required>
        </div>
        <div class="form-group">
          <label class="form-label">Protein per Serving (grams)</label>
          <input type="number" step="0.1" class="form-input" id="inp-saved-food-protein" placeholder="e.g. 24" required>
        </div>
        <div class="form-group">
          <label class="form-label">Category</label>
          <input type="text" class="form-input" id="inp-saved-food-cat" placeholder="e.g. Custom, Dairy, Poultry" value="Custom">
        </div>
        <div class="form-actions">
          <button type="submit" class="btn-primary">Save Food to Library</button>
        </div>
      </form>
    `;

    container.querySelector('#form-create-saved-food').addEventListener('submit', (e) => {
      e.preventDefault();
      const name = container.querySelector('#inp-saved-food-name').value.trim();
      const defaultQty = container.querySelector('#inp-saved-food-qty').value.trim();
      const proteinG = parseFloat(container.querySelector('#inp-saved-food-protein').value);
      const category = container.querySelector('#inp-saved-food-cat').value.trim();

      appState.addSavedFood({ name, defaultQty, proteinG, category });
      modalOverlay.style.display = 'none';
    });
  } else if (mode === 'create-meal') {
    modalTitle.textContent = 'Create Saved Meal Template';
    modalBody.innerHTML = `
      <form id="form-create-meal-template">
        <div class="form-group">
          <label class="form-label">Meal Name</label>
          <input type="text" class="form-input" id="inp-meal-name" placeholder="e.g. Post-Workout Snack" required>
        </div>
        <div id="meal-items-container">
          <label class="form-label">Meal Ingredients / Items</label>
          <div class="meal-item-row">
            <input type="text" class="form-input item-name" placeholder="Item (e.g. Oats)" required>
            <input type="text" class="form-input item-qty" placeholder="Qty (50g)" required>
            <input type="number" step="0.1" class="form-input item-prot" placeholder="Prot (6.5g)" required>
          </div>
        </div>
        <button type="button" class="btn-secondary-sm mt-2" id="btn-add-meal-item-row">+ Add Ingredient Row</button>
        <div class="form-actions mt-4">
          <button type="submit" class="btn-primary">Save Meal Template</button>
        </div>
      </form>
    `;

    const rowContainer = container.querySelector('#meal-items-container');
    container.querySelector('#btn-add-meal-item-row').addEventListener('click', () => {
      const row = document.createElement('div');
      row.className = 'meal-item-row mt-2';
      row.innerHTML = `
        <input type="text" class="form-input item-name" placeholder="Item" required>
        <input type="text" class="form-input item-qty" placeholder="Qty" required>
        <input type="number" step="0.1" class="form-input item-prot" placeholder="Prot (g)" required>
      `;
      rowContainer.appendChild(row);
    });

    container.querySelector('#form-create-meal-template').addEventListener('submit', (e) => {
      e.preventDefault();
      const mealName = container.querySelector('#inp-meal-name').value.trim();
      const rows = rowContainer.querySelectorAll('.meal-item-row');
      const items = [];

      rows.forEach(r => {
        const name = r.querySelector('.item-name').value.trim();
        const qty = r.querySelector('.item-qty').value.trim();
        const proteinG = parseFloat(r.querySelector('.item-prot').value);
        if (name) {
          items.push({ name, qty, proteinG: isNaN(proteinG) ? 0 : proteinG });
        }
      });

      if (items.length > 0) {
        appState.addSavedMeal({ name: mealName, items });
        modalOverlay.style.display = 'none';
      }
    });
  }
}

function escapeHtml(str) {
  if (!str) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}
