import { Input } from "@/components/ui/input";
import { ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { db } from "@/server/db";
import { eq } from "drizzle-orm";
import { OrderGroups } from "@/server/db/schema";
import { redirect } from "next/navigation";

type Props = {
  className?: string;
};

const OrderGroupQuickJoinForm = ({ className }: Props) => {
  async function findGroup(formData: FormData) {
    "use server";

    const code = formData.get("join-code");

    if (!code) return;

    const group = await db.query.OrderGroups.findFirst({
      where: eq(OrderGroups.inviteCode, code as string),
    });

    if (!group) {
      redirect("/g?code-status=not-found");
    }

    redirect(`/g/${group.id}`);
  }

  return (
    <form action={findGroup} className={cn("relative", className)}>
      <Input
        name={"join-code"}
        placeholder={"Joining a group"}
        className={"w-[256px] pr-10"}
      />

      <button
        type={"submit"}
        className={
          "group absolute right-0 top-0 flex h-full w-10 items-center justify-center"
        }
      >
        <ArrowRight className={"group-hover:animate-slide-left-in"} size={16} />
      </button>
    </form>
  );
};

export default OrderGroupQuickJoinForm;
