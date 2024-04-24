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
import { extractPaginationParams, getEventStatusVerbose } from "@/lib/utils";
import { queryOrders } from "@/app/order/action";
import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { format } from "date-fns";
import OrderInvolved from "@/components/_page/order/order-involved";

type PageProps = NextPageProps<Record<string, string>, QueryParamsWithSearch>;

const Page = async ({ searchParams: rawParams }: PageProps) => {
  const paginationParams = extractPaginationParams(rawParams);
  const { userId: clerkId } = auth();

  if (!clerkId) {
    redirect("/sign-in");
  }

  const { data, total } = await queryOrders({
    ...paginationParams,
    clerkId,
  });

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
        <OrderInvolved clerkId={clerkId} />
      </div>

      {/*<div className="flex items-center gap-4">*/}
      {/*  <h1 className={"text-xl uppercase"}>All Orders</h1>*/}
      {/*  <Badge>{total}</Badge>*/}
      {/*</div>*/}

      {/*<div className="flex flex-col gap-4 sm:flex-row sm:flex-wrap">*/}
      {/*  {data.map((order) => (*/}
      {/*    <Card key={order.id} className="w-full sm:w-1/4 sm:max-w-80">*/}
      {/*      <CardHeader className="pb-3">*/}
      {/*        <CardTitle>*/}
      {/*          #{order.id} - {order.name}*/}
      {/*        </CardTitle>*/}
      {/*        <CardDescription>*/}
      {/*          <div className="flex gap-4">*/}
      {/*            <h2>Status:</h2>*/}
      {/*            <Badge>{getEventStatusVerbose(order.status)}</Badge>*/}
      {/*          </div>*/}
      {/*          <div className="flex gap-4">*/}
      {/*            <h2>Created At:</h2>*/}
      {/*            <span>{order.createdAt}</span>*/}
      {/*          </div>*/}
      {/*          {order.endingAt ? (*/}
      {/*            <div className="flex gap-4">*/}
      {/*              <h2>Ended At:</h2>*/}
      {/*              <span>{format(order.endingAt, "yyyy-MM-dd HH:mm:ss")}</span>*/}
      {/*            </div>*/}
      {/*          ) : null}*/}
      {/*        </CardDescription>*/}
      {/*      </CardHeader>*/}
      {/*      <CardFooter>*/}
      {/*        <Link*/}
      {/*          className={buttonVariants()}*/}
      {/*          href={`/order/show/${order.id}`}*/}
      {/*        >*/}
      {/*          View*/}
      {/*        </Link>*/}
      {/*      </CardFooter>*/}
      {/*    </Card>*/}
      {/*  ))}*/}
      {/*</div>*/}
    </div>
  );
};

export default Page;
