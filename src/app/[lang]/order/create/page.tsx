import CreateForm from "@/app/order/create/form";
import { auth } from "@clerk/nextjs/server";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Home } from "lucide-react";
import { Badge } from "@/components/ui/badge";

const Page = async () => {
  const { userId } = auth();

  if (!userId) {
    return <>Unauthorized</>;
  }

  return (
    <div className={"container mx-auto flex flex-col gap-8 p-4 md:p-8"}>
      <Breadcrumb className={"w-full"}>
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink href="/">
              <Home size={16} />
            </BreadcrumbLink>
          </BreadcrumbItem>

          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbLink href={"/order"}>Order</BreadcrumbLink>
          </BreadcrumbItem>

          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage>
              <Badge>Create</Badge>
            </BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      <CreateForm clerkId={userId} />
    </div>
  );
};

export default Page;
