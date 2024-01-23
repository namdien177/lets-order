import { Item } from "./item";
import { auth } from "@clerk/nextjs";
import { type OrderGroup } from "@/server/db/schema";
import { Settings } from "lucide-react";

type Props = Pick<OrderGroup, "id" | "ownerClerkId" | "name">;

const GroupBuyNavigationBar = async ({ id, ownerClerkId, name }: Props) => {
  const user = auth();
  const baseHref = `/g/${id}`;
  return (
    <div className={"sticky inset-x-0 top-0 flex items-center gap-4 py-2"}>
      <Item href={baseHref}>What&apos;s new</Item>
      <Item href={`${baseHref}/menu`}>Menu</Item>
      <Item href={`${baseHref}/history`}>History</Item>

      <div className={"flex-1"} />

      <Item href={`${baseHref}/preference`}>Preference</Item>

      {user.userId === ownerClerkId && (
        <>
          <div className={"h-4 w-[2px] bg-gray-400"} />
          <Item href={`${baseHref}/setting`}>
            <Settings size={16} />
          </Item>
        </>
      )}
    </div>
  );
};

export default GroupBuyNavigationBar;
