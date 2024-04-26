import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";
import { Home, Plus } from "lucide-react";
import { type NextPageProps } from "@/lib/types/nextjs";
import { type QueryParamsWithSearch } from "@/lib/types/pagination.types";
import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import OrderInvolved from "@/components/_page/order/order-involved";
import { extractPaginationParams } from "@/lib/utils";

type PageProps = NextPageProps<Record<string, string>, QueryParamsWithSearch>;

const Page = async ({ searchParams: rawParams }: PageProps) => {
  const paginationParams = extractPaginationParams(rawParams);
  const { userId: clerkId } = auth();

  if (!clerkId) {
    redirect("/sign-in");
  }

  return (
    <div className={"container mx-auto flex flex-col gap-8 px-4 py-8"}>
      <div className="flex flex-col gap-8 sm:flex-row sm:items-center">
        <Breadcrumb className={"sm:flex-1"}>
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink href="/">
                <Home size={16} />
              </BreadcrumbLink>
            </BreadcrumbItem>

            <BreadcrumbSeparator />

            <BreadcrumbItem>
              <BreadcrumbPage>Orders</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>

        <Link
          href={"/order/create"}
          className={buttonVariants({
            className: "gap-2 capitalize",
          })}
        >
          <Plus size={16} />
          <span>
            Create <span className={"hidden md:inline"}>new order</span>
          </span>
        </Link>
      </div>

      <div className={"flex flex-col gap-4"}>
        <OrderInvolved clerkId={clerkId} initialQuery={paginationParams} />
      </div>
    </div>
  );
};

export default Page;
