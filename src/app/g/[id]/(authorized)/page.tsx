import { type NextPageProps } from "@/lib/types/nextjs";
import { db } from "@/server/db";
import { isNull } from "drizzle-orm";
import { clerkClient } from "@clerk/nextjs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { type User } from "@clerk/backend";

type PageProps = NextPageProps<{
  id: string;
}>;

function clerkUserFullName(user: Pick<User, "firstName" | "lastName">) {
  return `${user.firstName ?? ""} ${user.lastName ?? ""}`.trim();
}

function clerkUserFallbackName(user: Pick<User, "firstName" | "lastName">) {
  const firstChar = user.firstName?.charAt(0) ?? "";
  const secondChar = user.lastName?.charAt(0) ?? "";
  const combined = `${firstChar}${secondChar}` || "US";
  return combined.toUpperCase();
}

const Page = async ({ params: { id } }: PageProps) => {
  const groupId = Number(id);
  const activeEvent = await db.query.OrderEvents.findFirst({
    where: (table, { and, eq }) =>
      and(eq(table.orderGroupId, groupId), isNull(table.endingAt)),
    with: {
      receivedOrders: {
        columns: {
          clerkId: true,
          orderProductId: true,
        },
      },
    },
  });

  if (!activeEvent) {
    return <div>There is no active event</div>;
  }

  const userId = activeEvent.receivedOrders.map((order) => order.clerkId);
  let users: User[] = [];
  if (userId.length > 0) {
    users = await clerkClient.users.getUserList({ userId });
  }

  return (
    <div className={"flex flex-col gap-4"}>
      <h1 className={"text-2xl"}>Current Active Event</h1>
      <div className={"flex flex-col gap-4 rounded bg-background p-4"}>
        <div className="flex gap-4">
          <div className="flex flex-col items-end">
            <small className="text-sm">ID</small>
            <div className={"text-2xl font-light"}>#{activeEvent.id}</div>
          </div>

          <div className="flex flex-col">
            <small className="text-sm">Title</small>
            <h1 className={"text-2xl font-bold"}>{activeEvent.name}</h1>
          </div>
        </div>

        <div className="flex flex-col">
          <small className="text-sm">Current Participants</small>
          <div className="flex items-center gap-4">
            <div className={"text-right text-2xl font-light"}>
              {activeEvent.receivedOrders.length}
            </div>

            <div className="relative flex flex-1 flex-nowrap overflow-x-auto px-2">
              {users.map((user) => (
                <Avatar
                  className={"-ml-2 size-12 border-4 border-white"}
                  key={user.id}
                >
                  <AvatarImage
                    src={user.imageUrl}
                    alt={clerkUserFullName(user)}
                  />
                  <AvatarFallback>{clerkUserFallbackName(user)}</AvatarFallback>
                </Avatar>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Page;
