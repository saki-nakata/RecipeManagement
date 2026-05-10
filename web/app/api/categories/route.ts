import { NextResponse } from "next/server";
import { mockCategories } from "@/app/lib/mockData";

export async function GET() {
  return NextResponse.json(mockCategories);
}
