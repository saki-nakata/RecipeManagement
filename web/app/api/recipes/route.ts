import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/app/lib/db";

export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl;
  const q = searchParams.get("q")?.trim().toLowerCase();
  const categoryId = searchParams.get("categoryId");
  const favorite = searchParams.get("favorite");

  const recipes = await prisma.recipe.findMany({
    where: {
      ...(q
        ? {
            OR: [
              { title: { contains: q } },
              { description: { contains: q } },
            ],
          }
        : {}),
      ...(categoryId && !isNaN(parseInt(categoryId, 10))
        ? { categoryId: parseInt(categoryId, 10) }
        : {}),
      ...(favorite === "true" ? { isFavorite: true } : {}),
    },
    include: { category: true },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json(recipes);
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

  const newRecipe = await prisma.recipe.create({
    data: {
      title: title.trim(),
      description: description?.trim() || null,
      point: point?.trim() || null,
      ingredients: ingredients.trim(),
      instructions: instructions.trim(),
      servings: servings ?? null,
      cookTime: cookTime ?? null,
      imagePath: imagePath ?? null,
      categoryId: categoryId ?? 10,
    },
    include: { category: true },
  });

  return NextResponse.json(newRecipe, { status: 201 });
}
