'use strict';

/* HTML escape helpers (global scope, used by all page files) */
function _esc(str) {
  if (str == null) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function _escAttr(str) {
  if (str == null) return '';
  return String(str).replace(/&/g, '&amp;').replace(/"/g, '&quot;');
}

/* Category color palette: { bg, text } */
var CAT_COLORS = {
  1:  { bg: '#FFF9C4', text: '#796600' }, // ご飯
  2:  { bg: '#FFE0B2', text: '#8B4513' }, // 麺類
  3:  { bg: '#FFCDD2', text: '#B71C1C' }, // 肉料理
  4:  { bg: '#BBDEFB', text: '#1A237E' }, // 魚料理
  5:  { bg: '#DCEDC8', text: '#1B5E20' }, // 野菜料理
  6:  { bg: '#F8BBD0', text: '#880E4F' }, // スープ
  7:  { bg: '#E1BEE7', text: '#4A148C' }, // デザート
  8:  { bg: '#FFF3E0', text: '#BF360C' }, // パン
  9:  { bg: '#B2EBF2', text: '#006064' }, // 飲み物
  10: { bg: '#EEEEEE', text: '#424242' }, // その他
};

window.Components = {
  renderNavbar() {
    document.getElementById('navbar').innerHTML = `
      <div class="navbar-brand" onclick="Router.navigate('#/')">
        <span>レシピ管理アプリ</span>
      </div>
    `;
  },

  renderRecipeCard(recipe) {
    var cat    = RecipeData.getCategoryById(recipe.categoryId);
    var color  = recipe.categoryId && CAT_COLORS[recipe.categoryId] ? CAT_COLORS[recipe.categoryId] : null;
    var catBg  = color ? color.bg   : '#F0EDE4';
    var catTxt = color ? color.text : 'var(--color-primary)';

    var catHtml = cat
      ? '<span class="category-badge" style="background:' + catBg + ';color:' + catTxt + '">'
        + cat.icon + ' ' + _esc(cat.name) + '</span>'
      : '';
    var cookHtml = recipe.cookTime ? '<span class="meta-item">⏱ ' + recipe.cookTime + '分</span>' : '';
    var servHtml = recipe.servings ? '<span class="meta-item">👥 ' + recipe.servings + '人前</span>' : '';
    var favIcon  = recipe.isFavorite ? '❤️' : '🤍';
    var imgHtml  = recipe.imagePath
      ? '<img src="' + _escAttr(recipe.imagePath) + '" alt="' + _escAttr(recipe.title) + '">'
      : '<span class="card-image-placeholder">' + (cat ? cat.icon : '🍽') + '</span>';

    return '<div class="recipe-card" data-action="go-detail" data-id="' + recipe.id + '">'
      + '<div class="card-image" style="' + (recipe.imagePath ? '' : 'background:' + catBg) + '">'
      + imgHtml
      + '<button class="card-fav-btn" data-action="toggle-favorite" data-id="' + recipe.id + '"'
      + ' title="' + (recipe.isFavorite ? 'お気に入り解除' : 'お気に入り登録') + '">' + favIcon + '</button>'
      + '</div>'
      + '<div class="card-body">'
      + '<div class="card-title">' + _esc(recipe.title) + '</div>'
      + '<div class="card-meta">' + catHtml + cookHtml + servHtml + '</div>'
      + '</div>'
      + '</div>';
  },

  renderDeleteModal(recipe, onConfirm) {
    var overlay = document.createElement('div');
    overlay.className = 'modal-overlay';
    overlay.innerHTML = '<div class="modal" role="dialog" aria-modal="true">'
      + '<div class="modal-title">レシピを削除</div>'
      + '<div class="modal-body">「' + _esc(recipe.title) + '」を削除します。<br>この操作は取り消せません。</div>'
      + '<div class="modal-actions">'
      + '<button class="btn btn-secondary" id="modal-cancel">キャンセル</button>'
      + '<button class="btn btn-danger" id="modal-confirm">削除する</button>'
      + '</div>'
      + '</div>';
    document.body.appendChild(overlay);

    function close() { document.body.removeChild(overlay); }
    overlay.addEventListener('click', function(e) { if (e.target === overlay) close(); });
    overlay.querySelector('#modal-cancel').addEventListener('click', close);
    overlay.querySelector('#modal-confirm').addEventListener('click', function() {
      close();
      onConfirm();
    });
  },

  renderRecipeForm(recipe) {
    var cats = RecipeData.getCategories();
    var catOptions = cats.map(function(c) {
      var sel = recipe && recipe.categoryId === c.id ? ' selected' : '';
      return '<option value="' + c.id + '"' + sel + '>' + c.icon + ' ' + _esc(c.name) + '</option>';
    }).join('');

    var imageSection;
    if (recipe && recipe.imagePath) {
      imageSection = '<div class="image-preview-container" id="image-preview-container">'
        + '<img src="' + _escAttr(recipe.imagePath) + '" alt="現在の画像" class="image-preview">'
        + '<button type="button" class="image-remove-btn" id="image-remove-btn" title="画像を削除">✕</button>'
        + '</div>';
    } else {
      imageSection = '<div class="image-upload-area" id="image-upload-area">'
        + '<span class="image-upload-icon">📷</span>'
        + '<p class="image-upload-text">クリックして画像を選択、またはドラッグ&ドロップ</p>'
        + '<p class="image-upload-hint">JPEG / PNG / WebP / GIF、4MB以下</p>'
        + '<input type="file" id="image-file-input" accept="image/jpeg,image/png,image/webp,image/gif">'
        + '</div>';
    }

    /* Numbered instruction steps */
    var lines = recipe && recipe.instructions
      ? recipe.instructions.split('\n').filter(function(s) { return s.trim(); })
      : [];
    if (lines.length === 0) lines = [''];
    var stepsHtml = lines.map(function(line, idx) {
      return '<div class="step-item">'
        + '<span class="step-num">' + (idx + 1) + '</span>'
        + '<input type="text" class="form-input step-input"'
        + ' placeholder="ステップ' + (idx + 1) + 'を入力..."'
        + ' value="' + _escAttr(line) + '">'
        + '<button type="button" class="step-remove-btn" title="削除">✕</button>'
        + '</div>';
    }).join('');

    return '<div class="form-group">'
      + '<label class="form-label" for="input-title">レシピ名<span class="required">*</span></label>'
      + '<input type="text" id="input-title" class="form-input" placeholder="例：鶏の唐揚げ" maxlength="255"'
      + ' value="' + _escAttr(recipe ? recipe.title : '') + '">'
      + '<span class="error-message" id="err-title"></span>'
      + '</div>'

      + '<div class="form-group">'
      + '<label class="form-label" for="input-category">カテゴリ</label>'
      + '<select id="input-category" class="form-select">'
      + '<option value="">選択してください</option>'
      + catOptions
      + '</select>'
      + '</div>'

      + '<div class="form-group">'
      + '<label class="form-label">画像</label>'
      + '<div id="image-section">' + imageSection + '</div>'
      + '<span class="error-message" id="err-image"></span>'
      + '<input type="hidden" id="image-data-url" value="' + _escAttr(recipe && recipe.imagePath ? recipe.imagePath : '') + '">'
      + '</div>'

      + '<div class="form-group">'
      + '<label class="form-label" for="input-description">説明文</label>'
      + '<textarea id="input-description" class="form-textarea" placeholder="このレシピの説明を入力してください...">'
      + _esc(recipe && recipe.description ? recipe.description : '')
      + '</textarea>'
      + '</div>'

      + '<div class="form-row">'
      + '<div class="form-group">'
      + '<label class="form-label" for="input-cooktime">調理時間（分）</label>'
      + '<input type="number" id="input-cooktime" class="form-input" placeholder="例：30" min="1" max="9999"'
      + ' value="' + (recipe && recipe.cookTime ? recipe.cookTime : '') + '">'
      + '<span class="error-message" id="err-cooktime"></span>'
      + '</div>'
      + '<div class="form-group">'
      + '<label class="form-label" for="input-servings">何人前</label>'
      + '<input type="number" id="input-servings" class="form-input" placeholder="例：2" min="1" max="99"'
      + ' value="' + (recipe && recipe.servings ? recipe.servings : '') + '">'
      + '<span class="error-message" id="err-servings"></span>'
      + '</div>'
      + '</div>'

      + (function() {
          var ingLines = recipe && recipe.ingredients
            ? recipe.ingredients.split('\n').filter(function(s) { return s.trim(); })
            : [];
          if (ingLines.length === 0) ingLines = [''];
          var ingHtml = ingLines.map(function(line) {
            var spaceIdx  = line.indexOf(' ');
            var ingName   = spaceIdx >= 0 ? line.substring(0, spaceIdx) : line;
            var ingAmount = spaceIdx >= 0 ? line.substring(spaceIdx + 1) : '';
            return '<div class="ingredient-item">'
              + '<input type="text" class="form-input ingredient-name"'
              + ' placeholder="材料名（例：鶏もも肉）" value="' + _escAttr(ingName) + '">'
              + '<input type="text" class="form-input ingredient-amount"'
              + ' placeholder="分量（例：500g）" value="' + _escAttr(ingAmount) + '">'
              + '<button type="button" class="step-remove-btn" title="削除">✕</button>'
              + '</div>';
          }).join('');
          return '<div class="form-group">'
            + '<label class="form-label">材料<span class="required">*</span></label>'
            + '<div class="ingredients-container" id="ingredients-container">' + ingHtml + '</div>'
            + '<button type="button" class="btn btn-secondary btn-add-step" id="btn-add-ingredient">＋ 材料を追加</button>'
            + '<span class="error-message" id="err-ingredients"></span>'
            + '</div>';
        })()

      + '<div class="form-group">'
      + '<label class="form-label">作り方<span class="required">*</span></label>'
      + '<div class="steps-container" id="steps-container">'
      + stepsHtml
      + '</div>'
      + '<button type="button" class="btn btn-secondary btn-add-step" id="btn-add-step">＋ ステップを追加</button>'
      + '<span class="error-message" id="err-instructions"></span>'
      + '</div>'

      + '<div class="form-group" style="margin-top:2rem">'
      + '<label class="form-label" for="input-point">💡 ポイント・コツ</label>'
      + '<textarea id="input-point" class="form-textarea" placeholder="おいしく作るポイントやコツを書いてみましょう...">'
      + _esc(recipe && recipe.point ? recipe.point : '')
      + '</textarea>'
      + '</div>';
  },

  renderEmptyState(message, showAddBtn) {
    var msg = message || 'まだレシピがありません';
    var btnHtml = showAddBtn === false ? '' : '<button class="btn btn-primary" onclick="Router.navigate(\'#/recipes/new\')">📝 レシピを追加する</button>';
    return '<div class="empty-state">'
      + '<span class="empty-state-icon">🍽</span>'
      + '<h3>' + _esc(msg) + '</h3>'
      + '<p>お気に入りのレシピを追加してみましょう</p>'
      + btnHtml
      + '</div>';
  },
};
