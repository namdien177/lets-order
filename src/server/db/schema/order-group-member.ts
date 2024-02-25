import { createDbTable } from "./_core";
import { relations, sql } from "drizzle-orm";
import { OrderGroups } from "@/server/db/schema/order-groups";
import { integer, primaryKey, text } from "drizzle-orm/sqlite-core";

export const MEMBER_STATUS = ["requesting", "active", "blacklisted"] as const;
export type MemberStatus = (typeof MEMBER_STATUS)[number];

export const OrderGroupMembers = createDbTable(
  "order_group_members",
  {
    orderGroupId: integer("order_group_id", { mode: "number" }).notNull(),
    memberClerkId: text("member_clerk_id", { length: 256 }).notNull(),
    name: text("name", { length: 256 }).notNull(),
    avatar: text("avatar", { length: 256 }).notNull(),
    status: text("status", { enum: MEMBER_STATUS }).notNull(),
    requestJoiningAt: text("request_joining_at")
      .default(sql`CURRENT_TIMESTAMP`)
      .notNull(),
    joinedAt: text("joined_at"),
    blacklistedAt: text("blacklisted_at"),
    updatedAt: text("updatedAt"),
  },
  (example) => ({
    primaryKey: primaryKey({
      columns: [example.orderGroupId, example.memberClerkId],
    }),
  }),
);

export const OrderGroupMemberRelations = relations(
  OrderGroupMembers,
  ({ one }) => ({
    orderGroup: one(OrderGroups, {
      fields: [OrderGroupMembers.orderGroupId],
      references: [OrderGroups.id],
    }),
  }),
);

export type OrderGroupMember = typeof OrderGroupMembers.$inferSelect;
