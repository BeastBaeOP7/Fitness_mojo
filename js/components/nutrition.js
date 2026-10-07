/**
 * Nutrition Component - Gautham's Protein & Food Workspace
 * Features Date Navigation, In-Page Modals (Zero Browser Prompts), Multi-Item Food Logging,
 * Saved Foods Library (with Edit/Delete), and Saved Meals Templates.
 */

import { appState } from '../state.js';
import { renderDateBar, attachDateBarEvents, showToast } from './common.js';

export function renderNutrition(container) {
  const profile = appState.profile;
  const log = appState.getSelectedDateLog();
  const totalProtein = appState.getSelectedDateTotalProtein();
  const proteinTarget = profile.proteinTargetG;
  const remainingProtein = Math.max(0, proteinTarget - totalProtein);
  const proteinPct = Math.min(100, Math.round((totalProtein / proteinTarget) * 100));

  container.innerHTML = `
    <div class="nutrition-page animate-fade-in">
      <!-- DATE NAVIGATOR BAR -->
      ${renderDateBar()}

      <header class="page-header mt-3">
        <div>
          <h1 class="page-title">Nutrition Workspace</h1>
          <p class="page-subtitle">Track food items, protein targets, water, and saved meal templates.</p>
        </div>
      </header>

      <!-- PROTEIN & WATER SUMMARY CARD -->
      <div class="dash-card nutrition-summary-card">
        <div class="summary-main">
          <div class="summary-metric">
            <span class="metric-label">Date Protein</span>
            <span class="metric-val highlight-protein">${totalProtein.toFixed(1)} <span class="unit">/ ${proteinTarget}g</span></span>
          </div>
          <div class="summary-metric">
            <span class="metric-label">Remaining</span>
            <span class="metric-val">${remainingProtein.toFixed(1)}g</span>
          </div>
          <div class="summary-metric">
            <span class="metric-label">Water Intake</span>
            <span class="metric-val highlight-water">${log.waterIntakeL.toFixed(1)} <span class="unit">/ ${profile.waterTargetL}L</span></span>
          </div>
        </div>
        <div class="progress-bar-track mt-2 mb-2">
          <div class="progress-bar-fill protein-fill" style="width: ${proteinPct}%"></div>
        </div>
        <div class="summary-actions">
          <button class="btn-primary" id="btn-open-add-food-modal">+ Log Food Item</button>
          <button class="btn-secondary" id="btn-calc-protein-target">Target Calculator</button>
        </div>
      </div>

      <!-- TABS FOR NUTRITION SECTIONS -->
      <div class="tab-subnav">
        <button class="tab-btn active" data-nut-tab="today-log">Logged Food (${log.foodEntries.length})</button>
        <button class="tab-btn" data-nut-tab="saved-foods">Saved Foods Library (${appState.savedFoods.length})</button>
        <button class="tab-btn" data-nut-tab="saved-meals">Saved Meal Templates (${appState.savedMeals.length})</button>
      </div>

      <!-- SUBTAB 1: LOGGED FOOD FOR SELECTED DATE -->
      <div class="nut-tab-pane active" id="pane-today-log">
        <div class="food-list-container">
          ${log.foodEntries.length === 0 ? `
            <div class="empty-state">
              <div class="empty-icon">🍳</div>
              <p>No food logged for ${appState.isTodaySelected() ? 'today' : appState.selectedDateStr}.</p>
              <button class="btn-primary-sm mt-3" id="empty-add-food-btn">+ Add First Food Item</button>
            </div>
          ` : `
            <div class="food-items-list">
              ${log.foodEntries.map(entry => `
                <div class="dash-card food-entry-card" data-entry-id="${entry.id}">
                  <div class="food-entry-info">
                    <span class="food-name">${escapeHtml(entry.name)}</span>
                    <span class="food-qty">${escapeHtml(entry.qty)} ${entry.timestamp ? '• ' + entry.timestamp : ''} ${entry.sourceMealName ? '• From: ' + escapeHtml(entry.sourceMealName) : ''}</span>
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

      <!-- SUBTAB 2: SAVED FOODS LIBRARY -->
      <div class="nut-tab-pane" id="pane-saved-foods">
        <div class="pane-header-actions">
          <p class="pane-desc">Custom food items and preloaded high-protein foods. Click <strong>+ Add</strong> to quickly log to ${appState.selectedDateStr}.</p>
          <button class="btn-secondary-sm" id="btn-create-saved-food">+ New Saved Food</button>
        </div>
        <div class="saved-foods-grid">
          ${appState.savedFoods.map(food => `
            <div class="dash-card saved-food-card">
              <div class="food-card-body">
                <span class="food-category-chip">${escapeHtml(food.category || 'General')}</span>
                <h4 class="saved-food-title">${escapeHtml(food.name)}</h4>
                <p class="saved-food-meta">${escapeHtml(food.defaultQty)} · <strong class="highlight-protein">${food.proteinG}g protein</strong></p>
              </div>
              <div class="food-card-actions mt-2">
                <button class="btn-primary-sm btn-quick-log-food" data-food-id="${food.id}">+ Add to Date</button>
                <button class="btn-micro btn-edit-saved-food" data-food-id="${food.id}">Edit</button>
                <button class="btn-micro btn-delete-saved-food" data-food-id="${food.id}">Delete</button>
              </div>
            </div>
          `).join('')}
        </div>
      </div>

      <!-- SUBTAB 3: SAVED MEALS (REUSABLE TEMPLATES) -->
      <div class="nut-tab-pane" id="pane-saved-meals">
        <div class="pane-header-actions">
          <p class="pane-desc">Multi-item reusable meal templates. Adding a meal creates independent copies in your target date log.</p>
          <button class="btn-secondary-sm" id="btn-create-saved-meal">+ New Meal Template</button>
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
                <button class="btn-primary-sm btn-add-meal-today" data-meal-id="${meal.id}">+ Add to Date Log</button>
                <button class="btn-micro btn-duplicate-meal" data-meal-id="${meal.id}">Duplicate</button>
                <button class="btn-micro btn-delete-meal" data-meal-id="${meal.id}">Delete</button>
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
          <div class="modal-body" id="nut-modal-body"></div>
        </div>
      </div>
    </div>
  `;

  attachDateBarEvents(container);
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
      const log = appState.getSelectedDateLog();
      const entry = log.foodEntries.find(item => item.id === entryId);
      if (entry) {
        openFoodModal(container, 'edit-food', entry);
      }
    });
  });

  container.querySelectorAll('.delete-entry-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const entryId = e.currentTarget.getAttribute('data-id');
      openFoodModal(container, 'confirm-delete-entry', { entryId });
    });
  });

  // Add Saved Meal to Selected Date
  container.querySelectorAll('.btn-add-meal-today').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const mealId = e.currentTarget.getAttribute('data-meal-id');
      const meal = appState.savedMeals.find(m => m.id === mealId);
      appState.addSavedMealToLog(mealId, appState.selectedDateStr);
      showToast(`Added saved meal "${meal ? meal.name : ''}" to ${appState.selectedDateStr}`);
    });
  });

  // Duplicate / Delete Saved Meal
  container.querySelectorAll('.btn-duplicate-meal').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const mealId = e.currentTarget.getAttribute('data-meal-id');
      appState.duplicateSavedMeal(mealId);
      showToast('Saved meal duplicated!');
    });
  });

  container.querySelectorAll('.btn-delete-meal').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const mealId = e.currentTarget.getAttribute('data-meal-id');
      openFoodModal(container, 'confirm-delete-meal', { mealId });
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
        appState.addFoodEntryToLog({
          name: food.name,
          qty: food.defaultQty,
          proteinG: food.proteinG
        }, appState.selectedDateStr);
        showToast(`Logged ${food.name} (${food.proteinG}g protein)`);
      }
    });
  });

  // Edit / Delete Custom Saved Food
  container.querySelectorAll('.btn-edit-saved-food').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const foodId = e.currentTarget.getAttribute('data-food-id');
      const food = appState.savedFoods.find(f => f.id === foodId);
      if (food) {
        openFoodModal(container, 'edit-saved-food', food);
      }
    });
  });

  container.querySelectorAll('.btn-delete-saved-food').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const foodId = e.currentTarget.getAttribute('data-food-id');
      openFoodModal(container, 'confirm-delete-saved-food', { foodId });
    });
  });

  // Create Custom Saved Food
  const createSavedFoodBtn = container.querySelector('#btn-create-saved-food');
  if (createSavedFoodBtn) {
    createSavedFoodBtn.addEventListener('click', () => {
      openFoodModal(container, 'create-food-item');
    });
  }

  // Target Calculator Button
  const calcProteinBtn = container.querySelector('#btn-calc-protein-target');
  if (calcProteinBtn) {
    calcProteinBtn.addEventListener('click', () => {
      openFoodModal(container, 'calc-target');
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
    modalTitle.textContent = `Log Food Item (${appState.selectedDateStr})`;
    modalBody.innerHTML = `
      <form id="form-add-food-log">
        <div class="form-group">
          <label class="form-label">Food Name</label>
          <input type="text" class="form-input" id="inp-food-name" placeholder="e.g. Chicken Breast, Whey Shake, Paneer" required>
        </div>
        <div class="form-group">
          <label class="form-label">Quantity / Serving Size</label>
          <input type="text" class="form-input" id="inp-food-qty" placeholder="e.g. 150g, 1 scoop, 3 eggs" value="100g" required>
        </div>
        <div class="form-group">
          <label class="form-label">Protein (grams)</label>
          <input type="number" step="0.1" class="form-input" id="inp-food-protein" placeholder="e.g. 30" required>
        </div>
        <div class="form-actions mt-3">
          <button type="button" class="btn-secondary-sm mr-2" id="btn-nut-modal-cancel">Cancel</button>
          <button type="submit" class="btn-primary">Add Food</button>
        </div>
      </form>
    `;

    container.querySelector('#btn-nut-modal-cancel').addEventListener('click', () => {
      modalOverlay.style.display = 'none';
    });

    container.querySelector('#form-add-food-log').addEventListener('submit', (e) => {
      e.preventDefault();
      const name = container.querySelector('#inp-food-name').value.trim();
      const qty = container.querySelector('#inp-food-qty').value.trim();
      const proteinG = parseFloat(container.querySelector('#inp-food-protein').value);

      appState.addFoodEntryToLog({ name, qty, proteinG }, appState.selectedDateStr);
      modalOverlay.style.display = 'none';
      showToast(`Added ${name} (${proteinG}g protein)`);
    });
  } else if (mode === 'edit-food' && payload) {
    modalTitle.textContent = 'Edit Logged Food Item';
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
        <div class="form-actions mt-3">
          <button type="button" class="btn-secondary-sm mr-2" id="btn-nut-modal-cancel">Cancel</button>
          <button type="submit" class="btn-primary">Save Changes</button>
        </div>
      </form>
    `;

    container.querySelector('#btn-nut-modal-cancel').addEventListener('click', () => {
      modalOverlay.style.display = 'none';
    });

    container.querySelector('#form-edit-food-log').addEventListener('submit', (e) => {
      e.preventDefault();
      const name = container.querySelector('#inp-edit-food-name').value.trim();
      const qty = container.querySelector('#inp-edit-food-qty').value.trim();
      const proteinG = parseFloat(container.querySelector('#inp-edit-food-protein').value);

      appState.updateFoodEntry(payload.id, { name, qty, proteinG }, appState.selectedDateStr);
      modalOverlay.style.display = 'none';
      showToast('Food entry updated');
    });
  } else if (mode === 'confirm-delete-entry' && payload) {
    modalTitle.textContent = 'Delete Logged Food';
    modalBody.innerHTML = `
      <p class="mb-3">Are you sure you want to remove this food item from your log?</p>
      <div class="form-actions">
        <button class="btn-secondary-sm mr-2" id="btn-cancel-del">Cancel</button>
        <button class="btn-danger-sm" id="btn-confirm-del">Delete Item</button>
      </div>
    `;

    container.querySelector('#btn-cancel-del').addEventListener('click', () => {
      modalOverlay.style.display = 'none';
    });

    container.querySelector('#btn-confirm-del').addEventListener('click', () => {
      appState.deleteFoodEntry(payload.entryId, appState.selectedDateStr);
      modalOverlay.style.display = 'none';
      showToast('Food entry deleted');
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
        <div class="form-actions mt-3">
          <button type="button" class="btn-secondary-sm mr-2" id="btn-nut-modal-cancel">Cancel</button>
          <button type="submit" class="btn-primary">Save Food</button>
        </div>
      </form>
    `;

    container.querySelector('#btn-nut-modal-cancel').addEventListener('click', () => {
      modalOverlay.style.display = 'none';
    });

    container.querySelector('#form-create-saved-food').addEventListener('submit', (e) => {
      e.preventDefault();
      const name = container.querySelector('#inp-saved-food-name').value.trim();
      const defaultQty = container.querySelector('#inp-saved-food-qty').value.trim();
      const proteinG = parseFloat(container.querySelector('#inp-saved-food-protein').value);
      const category = container.querySelector('#inp-saved-food-cat').value.trim();

      appState.addSavedFood({ name, defaultQty, proteinG, category });
      modalOverlay.style.display = 'none';
      showToast('Saved food added to library!');
    });
  } else if (mode === 'edit-saved-food' && payload) {
    modalTitle.textContent = 'Edit Saved Food';
    modalBody.innerHTML = `
      <form id="form-edit-saved-food">
        <div class="form-group">
          <label class="form-label">Food Title</label>
          <input type="text" class="form-input" id="inp-edit-sf-name" value="${escapeHtml(payload.name)}" required>
        </div>
        <div class="form-group">
          <label class="form-label">Default Serving Size</label>
          <input type="text" class="form-input" id="inp-edit-sf-qty" value="${escapeHtml(payload.defaultQty)}" required>
        </div>
        <div class="form-group">
          <label class="form-label">Protein (grams)</label>
          <input type="number" step="0.1" class="form-input" id="inp-edit-sf-protein" value="${payload.proteinG}" required>
        </div>
        <div class="form-group">
          <label class="form-label">Category</label>
          <input type="text" class="form-input" id="inp-edit-sf-cat" value="${escapeHtml(payload.category || 'Custom')}">
        </div>
        <div class="form-actions mt-3">
          <button type="button" class="btn-secondary-sm mr-2" id="btn-nut-modal-cancel">Cancel</button>
          <button type="submit" class="btn-primary">Save Changes</button>
        </div>
      </form>
    `;

    container.querySelector('#btn-nut-modal-cancel').addEventListener('click', () => {
      modalOverlay.style.display = 'none';
    });

    container.querySelector('#form-edit-saved-food').addEventListener('submit', (e) => {
      e.preventDefault();
      const name = container.querySelector('#inp-edit-sf-name').value.trim();
      const defaultQty = container.querySelector('#inp-edit-sf-qty').value.trim();
      const proteinG = parseFloat(container.querySelector('#inp-edit-sf-protein').value);
      const category = container.querySelector('#inp-edit-sf-cat').value.trim();

      appState.updateSavedFood(payload.id, { name, defaultQty, proteinG, category });
      modalOverlay.style.display = 'none';
      showToast('Saved food updated!');
    });
  } else if (mode === 'confirm-delete-saved-food' && payload) {
    modalTitle.textContent = 'Delete Saved Food';
    modalBody.innerHTML = `
      <p class="mb-3">Remove this item from your saved foods library?</p>
      <div class="form-actions">
        <button class="btn-secondary-sm mr-2" id="btn-cancel-sf-del">Cancel</button>
        <button class="btn-danger-sm" id="btn-confirm-sf-del">Delete Food</button>
      </div>
    `;

    container.querySelector('#btn-cancel-sf-del').addEventListener('click', () => {
      modalOverlay.style.display = 'none';
    });

    container.querySelector('#btn-confirm-sf-del').addEventListener('click', () => {
      appState.deleteSavedFood(payload.foodId);
      modalOverlay.style.display = 'none';
      showToast('Saved food removed');
    });
  } else if (mode === 'confirm-delete-meal' && payload) {
    modalTitle.textContent = 'Delete Meal Template';
    modalBody.innerHTML = `
      <p class="mb-3">Delete this saved meal template?</p>
      <div class="form-actions">
        <button class="btn-secondary-sm mr-2" id="btn-cancel-meal-del">Cancel</button>
        <button class="btn-danger-sm" id="btn-confirm-meal-del">Delete Meal</button>
      </div>
    `;

    container.querySelector('#btn-cancel-meal-del').addEventListener('click', () => {
      modalOverlay.style.display = 'none';
    });

    container.querySelector('#btn-confirm-meal-del').addEventListener('click', () => {
      appState.deleteSavedMeal(payload.mealId);
      modalOverlay.style.display = 'none';
      showToast('Saved meal template deleted');
    });
  } else if (mode === 'create-meal') {
    modalTitle.textContent = 'Create Saved Meal Template';
    modalBody.innerHTML = `
      <form id="form-create-meal-template">
        <div class="form-group">
          <label class="form-label">Meal Name</label>
          <input type="text" class="form-input" id="inp-meal-name" placeholder="e.g. Post-Workout Shake, Power Breakfast" required>
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
          <button type="button" class="btn-secondary-sm mr-2" id="btn-nut-modal-cancel">Cancel</button>
          <button type="submit" class="btn-primary">Save Meal Template</button>
        </div>
      </form>
    `;

    container.querySelector('#btn-nut-modal-cancel').addEventListener('click', () => {
      modalOverlay.style.display = 'none';
    });

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
        showToast('Saved meal template created!');
      }
    });
  } else if (mode === 'calc-target') {
    const w = appState.profile.weightKg || 74.5;
    const recModerate = Math.round(w * 1.6);
    const recHigh = Math.round(w * 2.2);

    modalTitle.textContent = 'Protein Target Calculator';
    modalBody.innerHTML = `
      <form id="form-calc-protein">
        <p class="settings-desc mb-3">Based on your logged body weight (<strong>${w} kg</strong>):</p>
        <div class="recs-list mb-3">
          <div class="rec-item">
            <span>Maintenance & General Fitness (1.6g/kg)</span>
            <strong>~${recModerate}g / day</strong>
          </div>
          <div class="rec-item mt-2">
            <span>Muscle Growth & Hypertrophy (2.2g/kg)</span>
            <strong>~${recHigh}g / day</strong>
          </div>
        </div>
        <div class="form-group">
          <label class="form-label">Set New Daily Protein Target (grams)</label>
          <input type="number" class="form-input" id="inp-new-protein-target" value="${appState.profile.proteinTargetG}" required>
        </div>
        <div class="form-actions mt-3">
          <button type="button" class="btn-secondary-sm mr-2" id="btn-nut-modal-cancel">Cancel</button>
          <button type="submit" class="btn-primary">Set Target</button>
        </div>
      </form>
    `;

    container.querySelector('#btn-nut-modal-cancel').addEventListener('click', () => {
      modalOverlay.style.display = 'none';
    });

    container.querySelector('#form-calc-protein').addEventListener('submit', (e) => {
      e.preventDefault();
      const val = parseInt(container.querySelector('#inp-new-protein-target').value, 10);
      if (!isNaN(val) && val > 0) {
        appState.profile.proteinTargetG = val;
        appState.notify();
        modalOverlay.style.display = 'none';
        showToast(`Daily protein target updated to ${val}g`);
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
