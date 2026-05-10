import { Category, Recipe } from "./types";

export const mockCategories: Category[] = [
  { id: 1, name: "ご飯", icon: "🍚" },
  { id: 2, name: "麺類", icon: "🍜" },
  { id: 3, name: "肉料理", icon: "🥩" },
  { id: 4, name: "魚料理", icon: "🐟" },
  { id: 5, name: "野菜料理", icon: "🥗" },
  { id: 6, name: "スープ", icon: "🍲" },
  { id: 7, name: "デザート", icon: "🍰" },
  { id: 8, name: "パン", icon: "🍞" },
  { id: 9, name: "飲み物", icon: "🍹" },
  { id: 10, name: "その他", icon: "🍽" },
];

const now = new Date().toISOString();

export let mockRecipes: Recipe[] = [
  {
    id: 1,
    title: "鶏の唐揚げ",
    description: "サクサクジューシーな唐揚げ",
    point: "二度揚げにするとよりカリッとします",
    ingredients: "鶏もも肉 300g\n醤油 大さじ2\nみりん 大さじ1\nにんにく 1片\n生姜 1片\n片栗粉 適量",
    instructions: "鶏肉を一口大に切る\n醤油・みりん・にんにく・生姜で30分漬ける\n片栗粉をまぶして180℃の油で4分揚げる\n一度取り出し、200℃で1分二度揚げする",
    servings: 2,
    cookTime: 45,
    isFavorite: true,
    categoryId: 3,
    category: { id: 3, name: "肉料理", icon: "🥩" },
    createdAt: now,
    updatedAt: now,
  },
  {
    id: 2,
    title: "味噌汁",
    description: "定番の味噌汁",
    ingredients: "豆腐 半丁\nわかめ 適量\n味噌 大さじ2\nだし 600ml",
    instructions: "だしを沸かす\n豆腐を角切りにして加える\nわかめを加える\n味噌を溶かして火を止める",
    servings: 2,
    cookTime: 10,
    isFavorite: false,
    categoryId: 6,
    category: { id: 6, name: "スープ", icon: "🍲" },
    createdAt: now,
    updatedAt: now,
  },
  {
    id: 3,
    title: "焼きそば",
    description: "ソース焼きそば",
    ingredients: "焼きそば麺 2袋\n豚バラ肉 100g\nキャベツ 1/4個\nソース 大さじ3\nサラダ油 適量",
    instructions: "野菜と肉を炒める\n麺を加えてほぐす\nソースで味付けする",
    servings: 2,
    cookTime: 15,
    isFavorite: false,
    categoryId: 2,
    category: { id: 2, name: "麺類", icon: "🍜" },
    createdAt: now,
    updatedAt: now,
  },
];

export const idCounter = { value: 4 };
