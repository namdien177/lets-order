import { auth } from "@clerk/nextjs/server";
import CreateProductForm from "@/app/product/create/form";

const Page = () => {
  const { userId } = auth();

  if (!userId) {
    return <>Unauthorized</>;
  }

  return <CreateProductForm clerkId={userId} />;
};

export default Page;
