import { NextResponse } from "next/server";
import { mockOrders } from "@/app/new/board/[id]/_generator/mock";

export const test = mockOrders;

export async function GET() {
  return NextResponse.json(test);
}
