'use strict';

window.Pages = window.Pages || {};

window.Pages.detail = {
  render(id) {
    var recipe = RecipeData.getRecipeById(id);
    if (!recipe) {
      document.getElementById('app').innerHTML =
        '<div class="empty-state not-found">'
        + '<span class="empty-state-icon">😕</span>'
        + '<h3>レシピが見つかりません</h3>'
        + '<p>削除されたか、URLが正しくない可能性があります</p>'
        + '<button class="btn btn-primary" onclick="Router.navigate(\'#/\')">一覧に戻る</button>'
        + '</div>';
      return;
    }

    var cat      = RecipeData.getCategoryById(recipe.categoryId);
    var catHtml  = cat ? '<span class="category-badge">' + cat.icon + ' ' + _esc(cat.name) + '</span>' : '';
    var cookHtml = recipe.cookTime ? '<span class="meta-item">⏱ ' + recipe.cookTime + '分</span>' : '';
    var servHtml = recipe.servings ? '<span class="meta-item">👥 ' + recipe.servings + '人前</span>' : '';

    var imageHtml = recipe.imagePath
      ? '<img src="' + _escAttr(recipe.imagePath) + '" alt="' + _escAttr(recipe.title) + '" class="detail-image">'
      : '<div class="detail-image-placeholder">🍽</div>';

    var descHtml = recipe.description
      ? '<div class="detail-section">'
        + '<h2 class="detail-section-title">📝 説明</h2>'
        + '<p class="detail-description">' + _esc(recipe.description) + '</p>'
        + '</div>'
      : '';

    var ingredients  = recipe.ingredients.split('\n').filter(function(s) { return s.trim(); });
    var instructions = recipe.instructions.split('\n').filter(function(s) { return s.trim(); });

    var ingredientsHtml =
      '<div class="detail-section">'
      + '<h2 class="detail-section-title">🥕 材料</h2>'
      + '<ul class="ingredients-list">'
      + ingredients.map(function(i) { return '<li>' + _esc(i) + '</li>'; }).join('')
      + '</ul>'
      + '</div>';

    var instructionsHtml =
      '<div class="detail-section">'
      + '<h2 class="detail-section-title">👨‍🍳 作り方</h2>'
      + '<ol class="instructions-list">'
      + instructions.map(function(s, idx) {
          return '<li>'
            + '<span class="step-number">' + (idx + 1) + '</span>'
            + '<span>' + _esc(s) + '</span>'
            + '</li>';
        }).join('')
      + '</ol>'
      + '</div>';

    var favClass = recipe.isFavorite ? ' active' : '';
    var favIcon  = recipe.isFavorite ? '❤️' : '🤍';
    var favTitle = recipe.isFavorite ? 'お気に入り解除' : 'お気に入り登録';

    var pointHtml = recipe.point
      ? '<div class="detail-section">'
        + '<h2 class="detail-section-title">💡 ポイント・コツ</h2>'
        + '<div class="point-box">' + _esc(recipe.point) + '</div>'
        + '</div>'
      : '';

    document.getElementById('app').innerHTML =
      '<button class="back-btn" id="btn-back">◀ 一覧に戻る</button>'
      + imageHtml
      + '<div class="detail-header">'
      + '<h1 class="detail-title">' + _esc(recipe.title) + '</h1>'
      + '<div class="detail-actions">'
      + '<button class="fav-btn-detail' + favClass + '" id="btn-fav" title="' + favTitle + '">' + favIcon + '</button>'
      + '<button class="btn btn-icon" id="btn-edit">✎ 編集</button>'
      + '<button class="btn btn-icon" id="btn-delete" style="color:var(--color-error);border-color:var(--color-error);">🗑 削除</button>'
      + '</div>'
      + '</div>'
      + '<div class="detail-meta">' + catHtml + cookHtml + servHtml + '</div>'
      + descHtml
      + ingredientsHtml
      + instructionsHtml
      + pointHtml;

    this._bindEvents(recipe);
  },

  _bindEvents(recipe) {
    document.getElementById('btn-back').addEventListener('click', function() {
      Router.navigate('#/');
    });
    document.getElementById('btn-edit').addEventListener('click', function() {
      Router.navigate('#/recipes/' + recipe.id + '/edit');
    });
    document.getElementById('btn-fav').addEventListener('click', function() {
      var updated = RecipeData.toggleFavorite(recipe.id);
      var btn = document.getElementById('btn-fav');
      if (btn && updated) {
        btn.textContent = updated.isFavorite ? '❤️' : '🤍';
        btn.title = updated.isFavorite ? 'お気に入り解除' : 'お気に入り登録';
        btn.classList.toggle('active', updated.isFavorite);
        recipe.isFavorite = updated.isFavorite;
      }
    });
    document.getElementById('btn-delete').addEventListener('click', function() {
      Components.renderDeleteModal(recipe, function() {
        RecipeData.deleteRecipe(recipe.id);
        Router.navigate('#/');
      });
    });
  },
};
