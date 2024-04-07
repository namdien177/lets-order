"use client";

import { Search } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useQuery } from "@tanstack/react-query";
import { findProducts } from "@/components/product/search-product/no-redirect.action";
import { useState } from "react";
import useDebounce from "@/lib/hooks/useDebounce";
import { Badge } from "@/components/ui/badge";
import { type Product } from "@/server/db/schema";

type Props = {
  clerkId: string;
  excludes?: number[];
  onSelected?: (
    product: Pick<Product, "id" | "name" | "description" | "price">,
  ) => void;
  onSelectAll?: (
    products: Pick<Product, "id" | "name" | "description" | "price">[],
  ) => void;
};

const SearchOwnedProductNoRedirectForm = ({
  clerkId,
  excludes = [],
  onSelected,
  onSelectAll,
}: Props) => {
  const [rawKeyword, setKeyword] = useState<string>("");
  const keyword = useDebounce(rawKeyword);

  const { data, isPending } = useQuery({
    queryKey: ["findProducts", clerkId, excludes, keyword],
    queryFn: () => findProducts({ clerkId, excludes, keyword }),
    enabled: keyword.length >= 3 && keyword.length <= 60,
  });
  const products = data?.data ?? [];

  return (
    <Card className="w-full">
      <CardHeader className="flex flex-col items-center gap-4">
        <div className="flex w-full flex-col gap-2">
          <CardTitle>Available products</CardTitle>
          <CardDescription>
            Belows are the list of products that available for this event.
          </CardDescription>
        </div>

        <div className="flex w-full gap-2">
          <label className={"relative flex flex-1"}>
            <Search
              size={16}
              className={"absolute left-3 top-1/2 -translate-y-1/2 transform"}
            />
            <Input
              className={"w-full pl-10 pr-14"}
              maxLength={60}
              placeholder={"product name, product description, etc..."}
              onChange={(e) => setKeyword(e.target.value)}
            />
          </label>

          <Button
            onClick={() => {
              if (products.length === 0) {
                return;
              }
              onSelectAll?.(products);
              setKeyword("");
            }}
            disabled={products.length === 0 || isPending}
          >
            Select All {products.length > 0 && <Badge>{products.length}</Badge>}
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead className="w-40 text-center">Amount</TableHead>
              <TableHead className={"w-28 text-center"}>Action</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {products.map((product) => (
              <TableRow key={product.id}>
                <TableCell>
                  <div className="font-medium">{product.name}</div>
                  <div className="hidden text-sm text-muted-foreground md:inline">
                    {product.description}
                  </div>
                </TableCell>
                <TableCell className="text-right">
                  {product.price.toLocaleString("vi", {
                    style: "currency",
                    currency: "vnd",
                  })}
                </TableCell>
                <TableCell>
                  <Button onClick={() => onSelected?.(product)}>Add</Button>
                </TableCell>
              </TableRow>
            ))}
            {products.length === 0 && !isPending && (
              <TableRow>
                <TableCell colSpan={3} className={"text-center text-accent"}>
                  No product found
                </TableCell>
              </TableRow>
            )}
            {isPending && (
              <TableRow>
                <TableCell colSpan={3} className={"text-center"}>
                  Loading...
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
};

export default SearchOwnedProductNoRedirectForm;
