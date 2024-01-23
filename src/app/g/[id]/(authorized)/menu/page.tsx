import { type NextPageProps } from "@/lib/types/nextjs";
import { db } from "@/server/db";
import { OrderProducts } from "@/server/db/schema";
import { and, eq, isNull } from "drizzle-orm";

type PageProps = NextPageProps<{
  id: string;
}>;

const Page = async ({ params: { id } }: PageProps) => {
  const groupId = Number(id);

  const products = await db.query.OrderProducts.findMany({
    where: and(
      eq(OrderProducts.orderGroupId, groupId),
      isNull(OrderProducts.deletedAt),
    ),
  });

  return (
    <div>
      <h1>Menu</h1>
      <div>
        {products.map((product) => (
          <div key={product.id}>
            <div>{product.name}</div>
            <div>{product.description}</div>
            <div>{product.price}</div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Page;
