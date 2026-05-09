'use strict';

const RECIPES_KEY = 'recipe_app_recipes';
const INITIALIZED_KEY = 'recipe_app_initialized';

const CATEGORIES = [
  { id: 1,  name: 'ご飯',     icon: '🍚' },
  { id: 2,  name: '麺類',     icon: '🍜' },
  { id: 3,  name: '肉料理',   icon: '🥩' },
  { id: 4,  name: '魚料理',   icon: '🐟' },
  { id: 5,  name: '野菜料理', icon: '🥗' },
  { id: 6,  name: 'スープ',   icon: '🍲' },
  { id: 7,  name: 'デザート', icon: '🍰' },
  { id: 8,  name: 'パン',     icon: '🍞' },
  { id: 9,  name: '飲み物',   icon: '🍹' },
  { id: 10, name: 'その他',   icon: '🍽' },
];

const MOCK_RECIPES = [
  {
    id: 1,
    title: '鶏の唐揚げ',
    description: '外はカリカリ、中はジューシーな定番の唐揚げ。下味をしっかりつけることがポイントです。',
    ingredients: '鶏もも肉 500g\n醤油 大さじ3\n酒 大さじ2\nにんにく 2片\n生姜 1片\n片栗粉 適量\nサラダ油 適量',
    instructions: '鶏肉を一口大に切る\n醤油・酒・すりおろしたにんにく・生姜で30分漬け込む\n片栗粉をまぶす\n170℃の油で5分揚げる\n一度取り出して休ませ、180℃で2分揚げる',
    point: '二度揚げすることでより外がカリッと仕上がります。油の温度管理がポイント！',
    servings: 2,
    cookTime: 30,
    imagePath: null,
    isFavorite: true,
    categoryId: 3,
    createdAt: '2025-01-10T10:00:00.000Z',
    updatedAt: '2025-01-10T10:00:00.000Z',
  },
  {
    id: 2,
    title: 'トマトパスタ',
    description: 'フレッシュトマトを使った爽やかなパスタ。シンプルだけど美味しい一品。',
    ingredients: 'パスタ 200g\nトマト缶 1缶\nにんにく 3片\nオリーブオイル 大さじ3\n塩 適量\n黒胡椒 適量\nバジル 適量',
    instructions: 'にんにくをみじん切りにする\nオリーブオイルでにんにくを炒める\nトマト缶を加えて10分煮る\n塩・胡椒で味を整える\nゆでたパスタと和える\nバジルを飾る',
    point: null,
    servings: 2,
    cookTime: 20,
    imagePath: null,
    isFavorite: false,
    categoryId: 2,
    createdAt: '2025-01-11T10:00:00.000Z',
    updatedAt: '2025-01-11T10:00:00.000Z',
  },
  {
    id: 3,
    title: '肉じゃが',
    description: '懐かしい味わいの定番おかず。じっくり煮込むことで味がしみ込みます。',
    ingredients: '牛薄切り肉 200g\nじゃがいも 3個\n玉ねぎ 1個\nにんじん 1本\nしらたき 1袋\n醤油 大さじ3\n砂糖 大さじ2\nみりん 大さじ2\n酒 大さじ2\nだし汁 200ml',
    instructions: '野菜を食べやすい大きさに切る\n鍋に油を熱し、牛肉を炒める\n野菜を加えてさらに炒める\nだし汁と調味料を加えて蓋をして20分煮る\n落し蓋をして味をなじませる',
    point: '砂糖を入れすぎないのがコツ。煮詰まりすぎたらだし汁を足して調整してください。',
    servings: 4,
    cookTime: 45,
    imagePath: null,
    isFavorite: true,
    categoryId: 1,
    createdAt: '2025-01-12T10:00:00.000Z',
    updatedAt: '2025-01-12T10:00:00.000Z',
  },
  {
    id: 4,
    title: '抹茶プリン',
    description: '濃厚な抹茶の香りが広がる和風デザート。おもてなしにもぴったりです。',
    ingredients: '牛乳 300ml\n生クリーム 100ml\n抹茶パウダー 大さじ1.5\n砂糖 40g\nゼラチン 5g\n水 大さじ2',
    instructions: 'ゼラチンを水でふやかす\n牛乳を温め、砂糖と抹茶を溶かす\n生クリームを加える\nゼラチンを溶かして混ぜる\n型に流し込んで冷蔵庫で2時間冷やす',
    point: null,
    servings: 4,
    cookTime: 30,
    imagePath: null,
    isFavorite: false,
    categoryId: 7,
    createdAt: '2025-01-13T10:00:00.000Z',
    updatedAt: '2025-01-13T10:00:00.000Z',
  },
  {
    id: 5,
    title: '豚汁',
    description: '具だくさんで体が温まる定番の豚汁。寒い日にぴったりです。',
    ingredients: '豚バラ肉 150g\nじゃがいも 2個\nにんじん 1本\n大根 1/4本\nこんにゃく 1/2枚\n味噌 大さじ4\nだし汁 800ml\nごま油 小さじ1',
    instructions: '野菜を食べやすい大きさに切る\nごま油で豚肉を炒める\n野菜を加えて炒める\nだし汁を加えて野菜が柔らかくなるまで煮る\n味噌を溶かし入れる',
    point: null,
    servings: 4,
    cookTime: 30,
    imagePath: null,
    isFavorite: false,
    categoryId: 6,
    createdAt: '2025-01-14T10:00:00.000Z',
    updatedAt: '2025-01-14T10:00:00.000Z',
  },
];

function _load() {
  try {
    return JSON.parse(localStorage.getItem(RECIPES_KEY)) || [];
  } catch {
    return [];
  }
}

function _save(recipes) {
  localStorage.setItem(RECIPES_KEY, JSON.stringify(recipes));
}

window.RecipeData = {
  init() {
    if (!localStorage.getItem(INITIALIZED_KEY)) {
      _save(MOCK_RECIPES);
      localStorage.setItem(INITIALIZED_KEY, 'true');
    }
  },

  getAllRecipes({ keyword = '', categoryId = null, favOnly = false } = {}) {
    let recipes = _load();
    if (keyword) {
      const kw = keyword.toLowerCase();
      recipes = recipes.filter(r =>
        r.title.toLowerCase().includes(kw) ||
        r.ingredients.toLowerCase().includes(kw)
      );
    }
    if (categoryId !== null && categoryId !== '') {
      recipes = recipes.filter(r => r.categoryId === Number(categoryId));
    }
    if (favOnly) {
      recipes = recipes.filter(r => r.isFavorite);
    }
    return recipes;
  },

  getRecipeById(id) {
    return _load().find(r => r.id === Number(id)) || null;
  },

  createRecipe(data) {
    const recipes = _load();
    const now = new Date().toISOString();
    const recipe = {
      id: Date.now(),
      title: data.title || '',
      description: data.description || null,
      point: data.point || null,
      ingredients: data.ingredients || '',
      instructions: data.instructions || '',
      servings: data.servings ? Number(data.servings) : null,
      cookTime: data.cookTime ? Number(data.cookTime) : null,
      imagePath: data.imagePath || null,
      isFavorite: false,
      categoryId: data.categoryId ? Number(data.categoryId) : null,
      createdAt: now,
      updatedAt: now,
    };
    recipes.push(recipe);
    _save(recipes);
    return recipe;
  },

  updateRecipe(id, data) {
    const recipes = _load();
    const idx = recipes.findIndex(r => r.id === Number(id));
    if (idx === -1) return null;
    const cur = recipes[idx];
    const updated = {
      ...cur,
      title: data.title || cur.title,
      description: data.description !== undefined ? (data.description || null) : cur.description,
      point: 'point' in data ? (data.point || null) : cur.point,
      ingredients: data.ingredients || cur.ingredients,
      instructions: data.instructions || cur.instructions,
      servings: data.servings ? Number(data.servings) : null,
      cookTime: data.cookTime ? Number(data.cookTime) : null,
      imagePath: 'imagePath' in data ? (data.imagePath || null) : cur.imagePath,
      categoryId: data.categoryId ? Number(data.categoryId) : null,
      updatedAt: new Date().toISOString(),
    };
    recipes[idx] = updated;
    _save(recipes);
    return updated;
  },

  deleteRecipe(id) {
    _save(_load().filter(r => r.id !== Number(id)));
  },

  toggleFavorite(id) {
    const recipes = _load();
    const idx = recipes.findIndex(r => r.id === Number(id));
    if (idx === -1) return null;
    recipes[idx].isFavorite = !recipes[idx].isFavorite;
    recipes[idx].updatedAt = new Date().toISOString();
    _save(recipes);
    return recipes[idx];
  },

  getCategories() {
    return CATEGORIES;
  },

  getCategoryById(id) {
    return CATEGORIES.find(c => c.id === Number(id)) || null;
  },
};
