import { auth } from "@clerk/nextjs/server";
import CreateProductForm from "@/app/product/create/form";
import { redirect } from "next/navigation";

const Page = () => {
  const { userId } = auth();

  if (!userId) {
    return <>Unauthorized</>;
  }

  return (
    <CreateProductForm
      clerkId={userId}
      onSubmit={async () => {
        "use server";
        redirect("/product");
      }}
    />
  );
};

export default Page;
