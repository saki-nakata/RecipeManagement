import { NextResponse } from "next/server";
import { prisma } from "@/app/lib/db";

export async function GET() {
  const categories = await prisma.category.findMany({ orderBy: { id: "asc" } });
  return NextResponse.json(categories);
}
