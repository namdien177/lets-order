import { type QueryParamsWithSearch } from "@/lib/types/pagination.types";
import { type NextPageProps } from "@/lib/types/nextjs";
import { cn, extractPaginationParams } from "@/lib/utils";
import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
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
import { searchOwnProduct } from "@/server/queries/product.query";
import { Table, TableCell, TableHeader, TableRow } from "@/components/ui/table";

type PageProps = NextPageProps<Record<string, string>, QueryParamsWithSearch>;

const Page = async ({ searchParams: rawParams }: PageProps) => {
  const paginationParams = extractPaginationParams(rawParams);
  const { userId: clerkId } = auth();

  if (!clerkId) {
    redirect("/sign-in");
  }

  const { data, total } = await searchOwnProduct({
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
          <div
            className={"h-[1px] w-full bg-accent sm:block sm:h-4 sm:w-[2px]"}
          ></div>
          <div className="flex items-center gap-4">
            <Link
              href={"/product/create"}
              className={buttonVariants({ variant: "outline" })}
            >
              Create
            </Link>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-4">
        <h1 className={"text-xl uppercase"}>All Products</h1>
        <Badge>{total}</Badge>
      </div>

      <div className="flex flex-col gap-4 sm:flex-row sm:flex-wrap">
        <Table>
          <TableHeader>
            <TableRow>
              <TableCell>No.</TableCell>
              <TableCell>Info</TableCell>
              <TableCell>Used</TableCell>
            </TableRow>
          </TableHeader>
        </Table>

        {data.map((product) => (
          <Card key={product.id} className="w-full sm:w-1/2 sm:max-w-80">
            <CardHeader className="pb-3">
              <CardTitle>{product.name}</CardTitle>
              <CardDescription className={"flex flex-col gap-4"}>
                <span>{product.description ?? "N/A"}</span>
              </CardDescription>
            </CardHeader>
            <CardFooter className={"gap-4"}>
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
