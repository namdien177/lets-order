import { type QueryParamsWithSearch } from "@/lib/types/pagination.types";
import { type NextPageProps } from "@/lib/types/nextjs";
import { cn, extractPaginationParams } from "@/lib/utils";
import { auth } from "@clerk/nextjs";
import { redirect } from "next/navigation";
import { findProducts } from "@/components/product/search-product/no-redirect.action";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Home, Trash } from "lucide-react";
import Link from "next/link";
import { Button, buttonVariants } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

type PageProps = NextPageProps<Record<string, string>, QueryParamsWithSearch>;

const Page = async ({ searchParams: rawParams }: PageProps) => {
  const paginationParams = extractPaginationParams(rawParams);
  const { userId: clerkId } = auth();

  if (!clerkId) {
    redirect("/sign-in");
  }

  const { data, total } = await findProducts({
    keyword: paginationParams.keyword,
    limit: paginationParams.limit,
    page: paginationParams.page,
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
              <BreadcrumbPage>Products</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>

        <div
          className={"flex flex-col gap-4 sm:flex-row sm:items-center sm:p-2"}
        >
          <div className="flex items-center gap-4">
            <Link
              href={"/product/create"}
              className={buttonVariants({ variant: "outline" })}
            >
              Create
            </Link>
          </div>

          <div
            className={"h-[1px] w-full bg-accent sm:block sm:h-4 sm:w-[2px]"}
          ></div>
        </div>
      </div>

      <div className="flex items-center gap-4">
        <h1 className={"text-xl uppercase"}>All Products</h1>
        <Badge>{total}</Badge>
      </div>

      <div className="flex flex-col gap-4 sm:flex-row sm:flex-wrap">
        {data.map((product) => (
          <Card key={product.id} className="w-full sm:w-1/2 sm:max-w-96">
            <CardHeader className="pb-3">
              <CardTitle>
                #{product.id} - {product.name}
              </CardTitle>
              <CardDescription className={"flex flex-col gap-4"}>
                <span>{product.description ?? "N/A"}</span>
                <div className="flex flex-col">
                  <h2>Created At:</h2>
                  <span>{product.createdAt}</span>
                </div>
              </CardDescription>
            </CardHeader>
            <CardFooter className={"gap-8"}>
              <Button className={""} variant={"destructive"}>
                <Trash size={16} />
              </Button>
              <Link
                className={cn(buttonVariants(), "flex-1")}
                href={`/product/edit/${product.id}`}
              >
                Edit
              </Link>
            </CardFooter>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default Page;
