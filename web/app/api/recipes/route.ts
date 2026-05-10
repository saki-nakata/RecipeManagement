import { NextRequest, NextResponse } from "next/server";
import { mockCategories } from "@/app/lib/mockData";
import * as mockData from "@/app/lib/mockData";

export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl;
  const q = searchParams.get("q")?.trim().toLowerCase();
  const categoryId = searchParams.get("categoryId");
  const favorite = searchParams.get("favorite");

  let results = [...mockData.mockRecipes];

  if (q) {
    results = results.filter(
      (r) =>
        r.title.toLowerCase().includes(q) ||
        r.description?.toLowerCase().includes(q)
    );
  }
  if (categoryId) {
    const cid = parseInt(categoryId, 10);
    if (!isNaN(cid)) {
      results = results.filter((r) => r.categoryId === cid);
    }
  }
  if (favorite === "true") {
    results = results.filter((r) => r.isFavorite);
  }

  results.sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );

  return NextResponse.json(results);
}

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null);
  if (!body) {
    return NextResponse.json({ error: "リクエストボディが不正です" }, { status: 400 });
  }

  const { title, description, point, ingredients, instructions, servings, cookTime, imagePath, categoryId } = body;

  if (!title || typeof title !== "string" || title.trim() === "") {
    return NextResponse.json({ error: "タイトルは必須です" }, { status: 400 });
  }
  if (title.length > 255) {
    return NextResponse.json({ error: "255文字以内で入力してください" }, { status: 400 });
  }
  if (!ingredients || typeof ingredients !== "string" || ingredients.trim() === "") {
    return NextResponse.json({ error: "材料は必須です" }, { status: 400 });
  }
  if (!instructions || typeof instructions !== "string" || instructions.trim() === "") {
    return NextResponse.json({ error: "作り方は必須です" }, { status: 400 });
  }
  if (categoryId !== undefined && (typeof categoryId !== "number" || !Number.isInteger(categoryId))) {
    return NextResponse.json({ error: "無効なカテゴリIDです" }, { status: 400 });
  }
  if (cookTime !== undefined && (!Number.isInteger(cookTime) || cookTime < 1)) {
    return NextResponse.json({ error: "調理時間は正の整数で入力してください" }, { status: 400 });
  }
  if (servings !== undefined && (!Number.isInteger(servings) || servings < 1)) {
    return NextResponse.json({ error: "人数は正の整数で入力してください" }, { status: 400 });
  }

  const cid: number = categoryId ?? 10;
  const category = mockCategories.find((c) => c.id === cid) ?? mockCategories[9];
  const now = new Date().toISOString();

  const newRecipe = {
    id: mockData.idCounter.value,
    title: title.trim(),
    description: description?.trim() || undefined,
    point: point?.trim() || undefined,
    ingredients: ingredients.trim(),
    instructions: instructions.trim(),
    servings: servings ?? undefined,
    cookTime: cookTime ?? undefined,
    imagePath: imagePath ?? undefined,
    isFavorite: false,
    categoryId: cid,
    category,
    createdAt: now,
    updatedAt: now,
  };

  mockData.mockRecipes.push(newRecipe);
  mockData.idCounter.value++;

  return NextResponse.json(newRecipe, { status: 201 });
}
