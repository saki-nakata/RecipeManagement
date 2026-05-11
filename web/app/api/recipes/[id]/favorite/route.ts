import { NextRequest, NextResponse } from "next/server";
import { recipeService } from "@/app/lib/services/recipeService";
import { AppError } from "@/app/lib/errors";

type Params = { params: Promise<{ id: string }> };

export async function PATCH(_req: NextRequest, { params }: Params) {
  try {
    const { id } = await params;
    const recipe = await recipeService.toggleFavorite(id);
    return NextResponse.json(recipe);
  } catch (err) {
    if (err instanceof AppError) {
      return NextResponse.json({ error: err.message }, { status: err.statusCode });
    }
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
