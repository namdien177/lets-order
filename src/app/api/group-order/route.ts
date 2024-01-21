import { type NextRequest, NextResponse } from "next/server";
import { groupOrderCreateSchema } from "@/app/(authenticated)/create/group-order/mutate";
import { db } from "@/server/db";
import { OrderGroups } from "@/server/db/schema";
import { auth } from "@clerk/nextjs";
import { LogErrorAPI } from "@/lib/server/error-log/api.error-log";

export const POST = async (req: NextRequest) => {
  const validatePayload = groupOrderCreateSchema.safeParse(await req.json());
  const { userId } = auth();

  if (!userId) {
    return NextResponse.json(
      {
        message: "Unauthenticated",
      },
      { status: 401 },
    );
  }

  if (!validatePayload.success) {
    return NextResponse.json(
      {
        message: "Invalid payload",
        error: validatePayload.error.flatten(),
      },
      {
        status: 400,
      },
    );
  }

  try {
    const createInstance = await db.insert(OrderGroups).values({
      name: validatePayload.data.name,
      description: validatePayload.data.description,
      inviteCode: validatePayload.data.inviteCode,
      ownerClerkId: userId,
    });

    console.log(createInstance);
    return NextResponse.json(
      {
        message: "Success",
        data: {
          id: Number(createInstance.insertId),
        },
      },
      {
        status: 200,
      },
    );
  } catch (e) {
    LogErrorAPI(e, "POST /api/group-order");

    return NextResponse.json(
      {
        message: "Server Error",
        error: e,
      },
      {
        status: 500,
      },
    );
  }
};
