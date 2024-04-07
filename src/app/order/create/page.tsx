import CreateForm from "@/app/order/create/form";
import { auth } from "@clerk/nextjs";

const Page = () => {
  const { userId } = auth();

  if (!userId) {
    return <>Unauthorized</>;
  }

  return <CreateForm clerkId={userId} />;
};

export default Page;
