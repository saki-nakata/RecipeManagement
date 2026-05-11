import { NextRequest, NextResponse } from "next/server";
import { recipeService } from "@/app/lib/services/recipeService";
import { AppError } from "@/app/lib/errors";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = req.nextUrl;
    const recipes = await recipeService.searchRecipes({
      q: searchParams.get("q"),
      categoryId: searchParams.get("categoryId"),
      favorite: searchParams.get("favorite"),
    });
    return NextResponse.json(recipes);
  } catch (err) {
    if (err instanceof AppError) {
      return NextResponse.json({ error: err.message }, { status: err.statusCode });
    }
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => null);
    if (!body) {
      return NextResponse.json({ error: "リクエストボディが不正です" }, { status: 400 });
    }
    const recipe = await recipeService.createRecipe(body);
    return NextResponse.json(recipe, { status: 201 });
  } catch (err) {
    if (err instanceof AppError) {
      return NextResponse.json({ error: err.message }, { status: err.statusCode });
    }
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
