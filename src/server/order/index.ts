import Elysia from "elysia";
import { AuthPlugin } from "@/server/_plugins/auth.plugin";
import { queryActiveOrders } from "@/server/order/active-order.query";

export const OrderModule = new Elysia({
  name: "module.order",
  prefix: "/order",
})
  .use(AuthPlugin())
  .get("/active", async ({ user }) => {
    const userId = user!.id;
    return queryActiveOrders(userId);
  });
