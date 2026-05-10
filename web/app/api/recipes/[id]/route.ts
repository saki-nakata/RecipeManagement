import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/app/lib/db";
import fs from "fs/promises";
import path from "path";

type Params = { params: Promise<{ id: string }> };

export async function GET(_req: NextRequest, { params }: Params) {
  const { id } = await params;
  const recipe = await prisma.recipe.findUnique({
    where: { id: parseInt(id, 10) },
    include: { category: true },
  });
  if (!recipe) {
    return NextResponse.json({ error: "レシピが見つかりません" }, { status: 404 });
  }
  return NextResponse.json(recipe);
}

export async function PUT(req: NextRequest, { params }: Params) {
  const { id } = await params;
  const recipeId = parseInt(id, 10);

  const existing = await prisma.recipe.findUnique({ where: { id: recipeId } });
  if (!existing) {
    return NextResponse.json({ error: "レシピが見つかりません" }, { status: 404 });
  }

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

  const updated = await prisma.recipe.update({
    where: { id: recipeId },
    data: {
      title: title.trim(),
      description: description?.trim() || null,
      point: point?.trim() || null,
      ingredients: ingredients.trim(),
      instructions: instructions.trim(),
      servings: servings ?? null,
      cookTime: cookTime ?? null,
      imagePath: imagePath ?? existing.imagePath,
      categoryId: categoryId ?? 10,
    },
    include: { category: true },
  });

  return NextResponse.json(updated);
}

export async function DELETE(_req: NextRequest, { params }: Params) {
  const { id } = await params;
  const recipeId = parseInt(id, 10);

  const recipe = await prisma.recipe.findUnique({ where: { id: recipeId } });
  if (!recipe) {
    return NextResponse.json({ error: "レシピが見つかりません" }, { status: 404 });
  }

  if (recipe.imagePath) {
    const filePath = path.join(process.cwd(), "public", recipe.imagePath);
    await fs.unlink(filePath).catch(() => {});
  }

  await prisma.recipe.delete({ where: { id: recipeId } });
  return new NextResponse(null, { status: 204 });
}
