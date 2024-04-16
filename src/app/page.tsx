import { buttonVariants } from "@/components/ui/button";
import {
  Card,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import Link from "next/link";

export default function HomePage() {
  return (
    <main className="container mx-auto flex min-h-screen flex-col gap-8 p-8">
      <div className="flex flex-col gap-8 overflow-x-auto md:flex-row md:flex-nowrap">
        <Card className="w-full md:w-80">
          <CardHeader className="pb-3">
            <CardTitle>Your Orders</CardTitle>
            <CardDescription>
              Create and manage your orders. View your order history and
              download invoices.
            </CardDescription>
          </CardHeader>
          <CardFooter>
            <Link className={buttonVariants()} href={"/order/create"}>
              Create Order
            </Link>
          </CardFooter>
        </Card>

        <Card className="w-full md:w-80">
          <CardHeader className="pb-3">
            <CardTitle>Your Products</CardTitle>
            <CardDescription>
              Create preset products for easy order creation and management.
            </CardDescription>
          </CardHeader>
          <CardFooter>
            <Link className={buttonVariants()} href={"product/create"}>
              Create Product
            </Link>
          </CardFooter>
        </Card>
      </div>
    </main>
  );
}
