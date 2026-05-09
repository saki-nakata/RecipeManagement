'use strict';

window.Pages = window.Pages || {};

window.Pages.list = {
  _filter: { keyword: '', categoryId: null, favOnly: false, sortBy: 'newest' },
  _debounceTimer: null,

  render() {
    this._filter = { keyword: '', categoryId: null, favOnly: false, sortBy: 'newest' };
    this._draw();
  },

  _draw() {
    var self = this;
    var recipes = RecipeData.getAllRecipes(this._filter);
    var cats = RecipeData.getCategories();

    /* --- sorting --- */
    var sortBy = this._filter.sortBy;
    recipes.sort(function(a, b) {
      if (sortBy === 'newest')   return new Date(b.createdAt) - new Date(a.createdAt);
      if (sortBy === 'oldest')   return new Date(a.createdAt) - new Date(b.createdAt);
      if (sortBy === 'name')     return a.title.localeCompare(b.title, 'ja');
      if (sortBy === 'cooktime') {
        if (!a.cookTime && !b.cookTime) return 0;
        if (!a.cookTime) return 1;
        if (!b.cookTime) return -1;
        return a.cookTime - b.cookTime;
      }
      return 0;
    });

    var catOptions = cats.map(function(c) {
      var sel = self._filter.categoryId == c.id ? ' selected' : '';
      return '<option value="' + c.id + '"' + sel + '>' + c.icon + ' ' + c.name + '</option>';
    }).join('');

    var sortOptions = [
      { value: 'newest',   label: '新着順' },
      { value: 'oldest',   label: '古い順' },
      { value: 'name',     label: '名前順' },
      { value: 'cooktime', label: '調理時間順' },
    ].map(function(o) {
      var sel = self._filter.sortBy === o.value ? ' selected' : '';
      return '<option value="' + o.value + '"' + sel + '>' + o.label + '</option>';
    }).join('');

    var hasFilter = this._filter.keyword || this._filter.categoryId || this._filter.favOnly;
    var gridHtml;
    if (recipes.length === 0) {
      gridHtml = Components.renderEmptyState(
        hasFilter ? '条件に一致するレシピがありません' : null,
        !hasFilter
      );
    } else {
      gridHtml = '<p class="recipe-count">' + recipes.length + '件のレシピ</p>'
        + '<div class="recipe-grid">'
        + recipes.map(function(r) { return Components.renderRecipeCard(r); }).join('')
        + '</div>';
    }

    var favActive = this._filter.favOnly ? ' active' : '';
    var searchVal = this._filter.keyword
      ? this._filter.keyword.replace(/&/g,'&amp;').replace(/"/g,'&quot;')
      : '';

    document.getElementById('app').innerHTML =
      '<div class="list-page-header">'
      + '<div>'
      + '<h1 class="list-title">レシピ一覧</h1>'
      + '<p class="list-subtitle">おいしいレシピをみつけよう</p>'
      + '</div>'
      + '<button class="btn btn-outline-primary" onclick="Router.navigate(\'#/recipes/new\')">＋ レシピを追加</button>'
      + '</div>'
      + '<div class="filter-bar">'
      + '<div class="search-input-wrap">'
      + '<span class="search-icon">🔍</span>'
      + '<input type="text" class="search-input" id="search-input"'
      + ' placeholder="レシピ名・材料で検索..." value="' + searchVal + '">'
      + '</div>'
      + '<select class="filter-select" id="category-filter">'
      + '<option value="">すべてのカテゴリ</option>'
      + catOptions
      + '</select>'
      + '<button class="btn-fav-filter' + favActive + '" id="fav-filter-btn">❤️ お気に入り</button>'
      + '<select class="filter-select" id="sort-filter">'
      + sortOptions
      + '</select>'
      + '</div>'
      + gridHtml;

    this._bindEvents();
  },

  _bindEvents() {
    var self = this;
    var app = document.getElementById('app');

    var searchInput = document.getElementById('search-input');
    if (searchInput) {
      searchInput.addEventListener('input', function(e) {
        var val = e.target.value;
        clearTimeout(self._debounceTimer);
        self._debounceTimer = setTimeout(function() {
          self._filter.keyword = val;
          self._draw();
          var el = document.getElementById('search-input');
          if (el) { el.focus(); el.setSelectionRange(val.length, val.length); }
        }, 300);
      });
    }

    var catFilter = document.getElementById('category-filter');
    if (catFilter) {
      catFilter.addEventListener('change', function(e) {
        self._filter.categoryId = e.target.value || null;
        self._draw();
      });
    }

    var favBtn = document.getElementById('fav-filter-btn');
    if (favBtn) {
      favBtn.addEventListener('click', function() {
        self._filter.favOnly = !self._filter.favOnly;
        self._draw();
      });
    }

    var sortFilter = document.getElementById('sort-filter');
    if (sortFilter) {
      sortFilter.addEventListener('change', function(e) {
        self._filter.sortBy = e.target.value;
        self._draw();
      });
    }

    app.addEventListener('click', function(e) {
      var favTarget = e.target.closest('[data-action="toggle-favorite"]');
      if (favTarget) {
        e.stopPropagation();
        var id = Number(favTarget.dataset.id);
        var updated = RecipeData.toggleFavorite(id);
        if (updated) {
          favTarget.textContent = updated.isFavorite ? '❤️' : '🤍';
          favTarget.title = updated.isFavorite ? 'お気に入り解除' : 'お気に入り登録';
        }
        if (self._filter.favOnly) {
          self._draw();
        }
        return;
      }

      var card = e.target.closest('[data-action="go-detail"]');
      if (card) {
        Router.navigate('#/recipes/' + card.dataset.id);
      }
    });
  },
};
