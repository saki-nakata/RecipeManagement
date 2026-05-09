'use strict';

window.Pages = window.Pages || {};

window.Pages.edit = {
  _recipeId: null,

  render(id) {
    var recipe = RecipeData.getRecipeById(id);
    if (!recipe) {
      document.getElementById('app').innerHTML =
        '<div class="empty-state not-found">'
        + '<span class="empty-state-icon">😕</span>'
        + '<h3>レシピが見つかりません</h3>'
        + '<button class="btn btn-primary" onclick="Router.navigate(\'#/\')">一覧に戻る</button>'
        + '</div>';
      return;
    }

    this._recipeId = id;

    document.getElementById('app').innerHTML =
      '<div class="form-container">'
      + '<button class="back-btn" id="btn-back">◀ 詳細に戻る</button>'
      + '<div class="page-header"><h1 class="page-title">レシピを編集</h1></div>'
      + '<form id="recipe-form" novalidate>'
      + Components.renderRecipeForm(recipe)
      + '<div class="form-actions">'
      + '<button type="button" class="btn btn-secondary" id="btn-cancel">キャンセル</button>'
      + '<button type="submit" class="btn btn-primary">更新する →</button>'
      + '</div>'
      + '</form>'
      + '</div>';

    this._bindEvents(recipe);
  },

  _bindEvents(recipe) {
    var self = this;

    document.getElementById('btn-back').addEventListener('click', function() {
      Router.navigate('#/recipes/' + recipe.id);
    });
    document.getElementById('btn-cancel').addEventListener('click', function() {
      Router.navigate('#/recipes/' + recipe.id);
    });

    /* If existing image is shown, wire up remove button */
    var removeBtn = document.getElementById('image-remove-btn');
    if (removeBtn) {
      removeBtn.addEventListener('click', function() {
        document.getElementById('image-data-url').value = '';
        document.getElementById('image-section').innerHTML =
          '<div class="image-upload-area" id="image-upload-area">'
          + '<span class="image-upload-icon">📷</span>'
          + '<p class="image-upload-text">クリックして画像を選択、またはドラッグ&ドロップ</p>'
          + '<p class="image-upload-hint">JPEG / PNG / WebP / GIF、4MB以下</p>'
          + '<input type="file" id="image-file-input" accept="image/jpeg,image/png,image/webp,image/gif">'
          + '</div>';
        _setupImageUpload(self);
      });
    } else {
      _setupImageUpload(self);
    }

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
    RecipeData.updateRecipe(this._recipeId, data);
    Router.navigate('#/recipes/' + this._recipeId);
  },
};
