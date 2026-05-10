import { NextRequest, NextResponse } from "next/server";
import * as mockData from "@/app/lib/mockData";

type Params = { params: Promise<{ id: string }> };

export async function PATCH(_req: NextRequest, { params }: Params) {
  const { id } = await params;
  const idx = mockData.mockRecipes.findIndex((r) => r.id === parseInt(id, 10));
  if (idx === -1) {
    return NextResponse.json({ error: "レシピが見つかりません" }, { status: 404 });
  }

  mockData.mockRecipes[idx] = {
    ...mockData.mockRecipes[idx],
    isFavorite: !mockData.mockRecipes[idx].isFavorite,
    updatedAt: new Date().toISOString(),
  };

  return NextResponse.json(mockData.mockRecipes[idx]);
}
