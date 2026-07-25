import { integer, sqliteTable, text } from "drizzle-orm/sqlite-core";
import { sql } from "drizzle-orm";
export const requests=sqliteTable("requests",{
  id:integer("id").primaryKey({autoIncrement:true}),
  name:text("name").notNull(),phone:text("phone").notNull(),service:text("service"),
  status:text("status").notNull().default("new"),appointmentAt:text("appointment_at"),
  acceptedBy:text("accepted_by"),createdAt:text("created_at").notNull().default(sql`CURRENT_TIMESTAMP`)
});
