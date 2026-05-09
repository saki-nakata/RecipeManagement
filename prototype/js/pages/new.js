'use strict';

window.Pages = window.Pages || {};

window.Pages.new = {
  render() {
    document.getElementById('app').innerHTML =
      '<div class="form-container">'
      + '<button class="back-btn" id="btn-back">◀ 一覧に戻る</button>'
      + '<div class="page-header"><h1 class="page-title">新しいレシピを登録</h1></div>'
      + '<form id="recipe-form" novalidate>'
      + Components.renderRecipeForm(null)
      + '<div class="form-actions">'
      + '<button type="button" class="btn btn-secondary" id="btn-cancel">キャンセル</button>'
      + '<button type="submit" class="btn btn-primary">登録する →</button>'
      + '</div>'
      + '</form>'
      + '</div>';

    this._bindEvents();
  },

  _bindEvents() {
    var self = this;
    document.getElementById('btn-back').addEventListener('click', function() { Router.navigate('#/'); });
    document.getElementById('btn-cancel').addEventListener('click', function() { Router.navigate('#/'); });
    _setupImageUpload(self);
    _setupInstructionSteps();
    _setupIngredientItems();
    document.getElementById('recipe-form').addEventListener('submit', function(e) {
      e.preventDefault();
      self._submit();
    });
  },

  _submit() {
    var data = _collectFormData();
    var errors = _validateRecipe(data);
    _showFormErrors(errors);
    if (Object.keys(errors).length > 0) return;
    RecipeData.createRecipe(data);
    Router.navigate('#/');
  },
};

/* ===== Shared form helpers (used by new.js and edit.js) ===== */

function _collectFormData() {
  /* ingredients */
  var ingContainer = document.getElementById('ingredients-container');
  var ingredientsVal;
  if (ingContainer) {
    var ingItems = ingContainer.querySelectorAll('.ingredient-item');
    var ings = [];
    ingItems.forEach(function(item) {
      var nameEl   = item.querySelector('.ingredient-name');
      var amountEl = item.querySelector('.ingredient-amount');
      var name   = nameEl   ? nameEl.value.trim()   : '';
      var amount = amountEl ? amountEl.value.trim() : '';
      if (name) ings.push(amount ? name + ' ' + amount : name);
    });
    ingredientsVal = ings.join('\n');
  } else {
    ingredientsVal = '';
  }

  /* instructions steps */
  var stepsContainer = document.getElementById('steps-container');
  var instructionsVal;
  if (stepsContainer) {
    var stepInputs = stepsContainer.querySelectorAll('.step-input');
    var steps = [];
    stepInputs.forEach(function(el) { if (el.value.trim()) steps.push(el.value.trim()); });
    instructionsVal = steps.join('\n');
  } else {
    instructionsVal = '';
  }

  var pointEl = document.getElementById('input-point');
  return {
    title:        document.getElementById('input-title').value,
    description:  document.getElementById('input-description').value,
    point:        pointEl ? pointEl.value : null,
    ingredients:  ingredientsVal,
    instructions: instructionsVal,
    cookTime:     document.getElementById('input-cooktime').value,
    servings:     document.getElementById('input-servings').value,
    categoryId:   document.getElementById('input-category').value,
    imagePath:    document.getElementById('image-data-url').value || null,
  };
}

function _setupIngredientItems() {
  var container = document.getElementById('ingredients-container');
  var addBtn    = document.getElementById('btn-add-ingredient');
  if (!container || !addBtn) return;

  container.addEventListener('click', function(e) {
    var removeBtn = e.target.closest('.step-remove-btn');
    if (!removeBtn) return;
    var items = container.querySelectorAll('.ingredient-item');
    if (items.length > 1) {
      removeBtn.closest('.ingredient-item').remove();
    } else {
      container.querySelector('.ingredient-input').value = '';
    }
  });

  addBtn.addEventListener('click', function() {
    var div = document.createElement('div');
    div.className = 'ingredient-item';
    div.innerHTML = '<input type="text" class="form-input ingredient-name" placeholder="材料名（例：塩）">'
      + '<input type="text" class="form-input ingredient-amount" placeholder="分量（例：適量）">'
      + '<button type="button" class="step-remove-btn" title="削除">✕</button>';
    container.appendChild(div);
    div.querySelector('.ingredient-name').focus();
  });
}

function _setupInstructionSteps() {
  var container = document.getElementById('steps-container');
  var addBtn    = document.getElementById('btn-add-step');
  if (!container || !addBtn) return;

  container.addEventListener('click', function(e) {
    var removeBtn = e.target.closest('.step-remove-btn');
    if (!removeBtn) return;
    var items = container.querySelectorAll('.step-item');
    if (items.length > 1) {
      removeBtn.closest('.step-item').remove();
    } else {
      container.querySelector('.step-input').value = '';
    }
    _renumberSteps();
  });

  addBtn.addEventListener('click', function() {
    var num = container.querySelectorAll('.step-item').length + 1;
    var div = document.createElement('div');
    div.className = 'step-item';
    div.innerHTML = '<span class="step-num">' + num + '</span>'
      + '<input type="text" class="form-input step-input" placeholder="ステップ' + num + 'を入力...">'
      + '<button type="button" class="step-remove-btn" title="削除">✕</button>';
    container.appendChild(div);
    div.querySelector('.step-input').focus();
  });
}

function _renumberSteps() {
  var items = document.querySelectorAll('#steps-container .step-item');
  items.forEach(function(item, idx) {
    var numEl = item.querySelector('.step-num');
    if (numEl) numEl.textContent = idx + 1;
  });
}

function _validateRecipe(data) {
  var errors = {};
  if (!data.title || !data.title.trim()) {
    errors.title = 'レシピ名は必須です';
  } else if (data.title.length > 255) {
    errors.title = 'レシピ名は255文字以内で入力してください';
  }
  if (!data.ingredients || !data.ingredients.trim()) {
    errors.ingredients = '材料は必須です';
  }
  if (!data.instructions || !data.instructions.trim()) {
    errors.instructions = '作り方は必須です';
  }
  if (data.cookTime && (isNaN(data.cookTime) || Number(data.cookTime) < 1 || Number(data.cookTime) > 9999)) {
    errors.cookTime = '調理時間は1〜9999の数値で入力してください';
  }
  if (data.servings && (isNaN(data.servings) || Number(data.servings) < 1 || Number(data.servings) > 99)) {
    errors.servings = '人数は1〜99で入力してください';
  }
  return errors;
}

function _showFormErrors(errors) {
  var fields = ['title', 'ingredients', 'instructions', 'cooktime', 'servings'];
  fields.forEach(function(f) {
    var el  = document.getElementById('err-' + f);
    var inp = document.getElementById('input-' + f);
    if (el)  { el.textContent = ''; el.classList.remove('visible'); }
    if (inp) { inp.classList.remove('error'); }
  });

  function showErr(fieldId, msg) {
    var el  = document.getElementById('err-' + fieldId);
    var inp = document.getElementById('input-' + fieldId);
    if (el)  { el.textContent = msg; el.classList.add('visible'); }
    if (inp) { inp.classList.add('error'); }
  }

  if (errors.title)        showErr('title',        errors.title);
  if (errors.ingredients)  showErr('ingredients',  errors.ingredients);
  if (errors.instructions) showErr('instructions', errors.instructions);
  if (errors.cookTime)     showErr('cooktime',     errors.cookTime);
  if (errors.servings)     showErr('servings',     errors.servings);

  var first = document.querySelector('.form-input.error, .form-textarea.error');
  if (first) first.scrollIntoView({ behavior: 'smooth', block: 'center' });
}

function _setupImageUpload(pageObj) {
  var area      = document.getElementById('image-upload-area');
  var fileInput = document.getElementById('image-file-input');
  if (!area || !fileInput) return;

  area.addEventListener('dragover', function(e) {
    e.preventDefault();
    area.classList.add('dragover');
  });
  area.addEventListener('dragleave', function() { area.classList.remove('dragover'); });
  area.addEventListener('drop', function(e) {
    e.preventDefault();
    area.classList.remove('dragover');
    var file = e.dataTransfer.files[0];
    if (file) _handleImageFile(file, pageObj);
  });
  fileInput.addEventListener('change', function(e) {
    if (e.target.files[0]) _handleImageFile(e.target.files[0], pageObj);
  });
}

function _handleImageFile(file, pageObj) {
  var allowed = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
  var errEl = document.getElementById('err-image');
  if (!allowed.includes(file.type)) {
    errEl.textContent = 'JPEG・PNG・WebP・GIF形式の画像を選択してください';
    errEl.classList.add('visible');
    return;
  }
  if (file.size > 4 * 1024 * 1024) {
    errEl.textContent = '画像は4MB以下にしてください';
    errEl.classList.add('visible');
    return;
  }
  errEl.classList.remove('visible');

  var reader = new FileReader();
  reader.onload = function(e) {
    var dataUrl = e.target.result;
    document.getElementById('image-data-url').value = dataUrl;
    document.getElementById('image-section').innerHTML =
      '<div class="image-preview-container">'
      + '<img src="' + dataUrl + '" alt="プレビュー" class="image-preview">'
      + '<button type="button" class="image-remove-btn" id="image-remove-btn" title="画像を削除">✕</button>'
      + '</div>';
    document.getElementById('image-remove-btn').addEventListener('click', function() {
      document.getElementById('image-data-url').value = '';
      document.getElementById('image-section').innerHTML =
        '<div class="image-upload-area" id="image-upload-area">'
        + '<span class="image-upload-icon">📷</span>'
        + '<p class="image-upload-text">クリックして画像を選択、またはドラッグ&ドロップ</p>'
        + '<p class="image-upload-hint">JPEG / PNG / WebP / GIF、4MB以下</p>'
        + '<input type="file" id="image-file-input" accept="image/jpeg,image/png,image/webp,image/gif">'
        + '</div>';
      _setupImageUpload(pageObj);
    });
  };
  reader.readAsDataURL(file);
}
