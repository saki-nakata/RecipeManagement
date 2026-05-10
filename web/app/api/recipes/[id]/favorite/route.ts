import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/app/lib/db";

type Params = { params: Promise<{ id: string }> };

export async function PATCH(_req: NextRequest, { params }: Params) {
  const { id } = await params;
  const recipeId = parseInt(id, 10);

  const recipe = await prisma.recipe.findUnique({ where: { id: recipeId } });
  if (!recipe) {
    return NextResponse.json({ error: "レシピが見つかりません" }, { status: 404 });
  }

  const updated = await prisma.recipe.update({
    where: { id: recipeId },
    data: { isFavorite: !recipe.isFavorite },
    include: { category: true },
  });

  return NextResponse.json(updated);
}
