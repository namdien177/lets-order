import CreateForm from "@/app/order/create/form";
import { auth } from "@clerk/nextjs";
import { createOrderEvent } from "@/app/order/create/action";

const Page = async () => {
  const { userId } = auth();

  if (!userId) {
    return <>Unauthorized</>;
  }

  return <CreateForm clerkId={userId} onSubmit={createOrderEvent} />;
};

export default Page;
