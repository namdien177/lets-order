import { mysqlTable } from "./_core";
import {
  bigint,
  mysqlEnum,
  primaryKey,
  timestamp,
  varchar,
} from "drizzle-orm/mysql-core";
import { relations, sql } from "drizzle-orm";
import { OrderGroups } from "@/server/db/schema/order-groups";

export const MEMBER_STATUS = ["requesting", "active", "blacklisted"] as const;
export type MemberStatus = (typeof MEMBER_STATUS)[number];

export const OrderGroupMembers = mysqlTable(
  "order_group_members",
  {
    orderGroupId: bigint("order_group_id", { mode: "number" }).notNull(),
    memberClerkId: varchar("member_clerk_id", { length: 256 }).notNull(),
    name: varchar("name", { length: 256 }).notNull(),
    avatar: varchar("avatar", { length: 256 }).notNull(),
    status: mysqlEnum("status", MEMBER_STATUS).notNull(),
    requestJoiningAt: timestamp("request_joining_at")
      .default(sql`CURRENT_TIMESTAMP`)
      .notNull(),
    joinedAt: timestamp("joined_at"),
    blacklistedAt: timestamp("blacklisted_at"),
    updatedAt: timestamp("updatedAt").onUpdateNow(),
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
