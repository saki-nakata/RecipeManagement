import { NextResponse } from "next/server";
import { recipeService } from "@/app/lib/services/recipeService";
import { AppError } from "@/app/lib/errors";

export async function GET() {
  try {
    const categories = await recipeService.getAllCategories();
    return NextResponse.json(categories);
  } catch (err) {
    if (err instanceof AppError) {
      return NextResponse.json({ error: err.message }, { status: err.statusCode });
    }
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
