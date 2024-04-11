import { type OrderEvent } from "@/server/db/schema";
import { db } from "@/server/db";

type Props = {
  event: OrderEvent;
};

const EventMenu = async ({ event }: Props) => {
  const products = await db.query.OrderEventProductTable.findMany({
    where: (table, { eq }) => eq(table.eventId, event.id),
    with: {
      product: true,
    },
  });
};

export default EventMenu;
