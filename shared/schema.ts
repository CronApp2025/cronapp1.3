import { mysqlTable, varchar, int, timestamp, date, boolean, text, serial, tinyint } from "drizzle-orm/mysql-core";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import { z } from "zod";
import { relations } from "drizzle-orm";

// Users table definition - adaptado a la estructura existente
export const users = mysqlTable("users", {
  id: int("id").primaryKey().autoincrement(),
  nombre: varchar("nombre", { length: 255 }).notNull(),
  apellido: varchar("apellido", { length: 255 }).notNull(),
  email: varchar("email", { length: 255 }).notNull(),
  password: varchar("password", { length: 255 }).notNull(),
  fecha_nacimiento: date("fecha_nacimiento").notNull(),
  created_at: timestamp("created_at").defaultNow(),
  updated_at: timestamp("updated_at").defaultNow(),
});

// Medical conditions table - adaptado a la estructura existente
export const conditions = mysqlTable("conditions", {
  id: int("id").primaryKey().autoincrement(),
  user_id: int("user_id").notNull(),
  name: varchar("name", { length: 255 }).notNull(),
  type: varchar("type", { length: 255 }).notNull(),
  icon: varchar("icon", { length: 255 }).default("activity"),
  diagnosed_date: date("diagnosed_date").notNull(),
  last_updated: timestamp("last_updated").defaultNow(),
  created_at: timestamp("created_at").defaultNow(),
  updated_at: timestamp("updated_at").defaultNow(),
});

// Medical metrics table - adaptado a la estructura existente
export const metrics = mysqlTable("metrics", {
  id: int("id").primaryKey().autoincrement(),
  condition_id: int("condition_id").notNull(),
  key: varchar("key", { length: 255 }).notNull(),
  value: varchar("value", { length: 255 }).notNull(),
  unit: varchar("unit", { length: 255 }),
  risk_level: varchar("risk_level", { length: 50 }),
  date_recorded: timestamp("date_recorded").defaultNow(),
});

// Risk alerts - adaptado a la estructura existente
export const alerts = mysqlTable("alerts", {
  id: int("id").primaryKey().autoincrement(),
  user_id: int("user_id").notNull(),
  alert_type: varchar("alert_type", { length: 255 }).notNull(),
  description: text("description").notNull(),
  risk_level: int("risk_level").notNull(),
  is_resolved: tinyint("is_resolved").default(0),
  created_at: timestamp("created_at").defaultNow(),
  updated_at: timestamp("updated_at").defaultNow(),
});

// Educational resources - adaptado a la estructura existente
export const educationalResources = mysqlTable("educational_resources", {
  id: int("id").primaryKey().autoincrement(),
  title: varchar("title", { length: 255 }).notNull(),
  description: text("description").notNull(),
  category: varchar("category", { length: 100 }).notNull(),
  resource_type: varchar("resource_type", { length: 100 }).notNull(),
  url: text("url"),
  is_new: tinyint("is_new").default(1),
  created_at: timestamp("created_at").defaultNow(),
  updated_at: timestamp("updated_at").defaultNow(),
});

// Password reset tokens - adaptado a la estructura existente
export const passwordResetTokens = mysqlTable("password_reset_tokens", {
  id: int("id").primaryKey().autoincrement(),
  user_id: int("user_id").notNull(),
  token: varchar("token", { length: 255 }).notNull(),
  expires_at: timestamp("expires_at").notNull(),
  used_at: timestamp("used_at"),
  created_at: timestamp("created_at").defaultNow(),
});

// Define relations
export const userRelations = relations(users, ({ many }) => ({
  conditions: many(conditions),
  alerts: many(alerts),
  passwordResetTokens: many(passwordResetTokens),
}));

export const conditionRelations = relations(conditions, ({ one, many }) => ({
  user: one(users, {
    fields: [conditions.user_id],
    references: [users.id],
  }),
  metrics: many(metrics),
}));

export const metricRelations = relations(metrics, ({ one }) => ({
  condition: one(conditions, {
    fields: [metrics.condition_id],
    references: [conditions.id],
  }),
}));

export const alertRelations = relations(alerts, ({ one }) => ({
  user: one(users, {
    fields: [alerts.user_id],
    references: [users.id],
  }),
}));

export const passwordResetTokenRelations = relations(passwordResetTokens, ({ one }) => ({
  user: one(users, {
    fields: [passwordResetTokens.user_id],
    references: [users.id],
  }),
}));

// Schemas for validation
export const userInsertSchema = createInsertSchema(users, {
  nombre: (schema) => schema.min(2, "El nombre debe tener al menos 2 caracteres"),
  apellido: (schema) => schema.min(2, "El apellido debe tener al menos 2 caracteres"),
  email: (schema) => schema.email("Debe proporcionar un email válido"),
  password: (schema) => schema.min(6, "La contraseña debe tener al menos 6 caracteres"),
  fecha_nacimiento: (schema) => schema,
}).omit({ created_at: true, updated_at: true });

export const userLoginSchema = z.object({
  email: z.string().email("Debe proporcionar un email válido"),
  password: z.string().min(6, "La contraseña debe tener al menos 6 caracteres"),
});

export const userUpdateSchema = createInsertSchema(users, {
  nombre: (schema) => schema.min(2, "El nombre debe tener al menos 2 caracteres"),
  apellido: (schema) => schema.min(2, "El apellido debe tener al menos 2 caracteres"),
  email: (schema) => schema.email("Debe proporcionar un email válido"),
  fecha_nacimiento: (schema) => schema,
}).partial().omit({ password: true, created_at: true, updated_at: true });

export const conditionInsertSchema = createInsertSchema(conditions, {
  name: (schema) => schema.min(2, "El nombre debe tener al menos 2 caracteres"),
  type: (schema) => schema.min(2, "El tipo debe tener al menos 2 caracteres"),
}).omit({ created_at: true, updated_at: true, last_updated: true });

export const metricInsertSchema = createInsertSchema(metrics, {
  key: (schema) => schema.min(1, "La clave debe tener al menos 1 caracter"),
  value: (schema) => schema.min(1, "El valor debe tener al menos 1 caracter"),
}).omit({ date_recorded: true });

export const alertInsertSchema = createInsertSchema(alerts, {
  alert_type: (schema) => schema.min(2, "El tipo debe tener al menos 2 caracteres"),
  description: (schema) => schema.min(2, "La descripción debe tener al menos 2 caracteres"),
  risk_level: (schema) => schema.gte(0, "El nivel debe ser mayor o igual a 0").lte(100, "El nivel debe ser menor o igual a 100"),
}).omit({ created_at: true, updated_at: true, is_resolved: true });

export const educationalResourceInsertSchema = createInsertSchema(educationalResources, {
  title: (schema) => schema.min(2, "El título debe tener al menos 2 caracteres"),
  description: (schema) => schema.min(2, "La descripción debe tener al menos 2 caracteres"),
  category: (schema) => schema.min(2, "La categoría debe tener al menos 2 caracteres"),
  resource_type: (schema) => schema.min(2, "El tipo debe tener al menos 2 caracteres"),
}).omit({ created_at: true, updated_at: true, is_new: true });

export const forgotPasswordSchema = z.object({
  email: z.string().email("Debe proporcionar un email válido"),
});

export const resetPasswordSchema = z.object({
  new_password: z.string().min(6, "La contraseña debe tener al menos 6 caracteres"),
});

// Type definitions
export type UserInsert = z.infer<typeof userInsertSchema>;
export type UserLogin = z.infer<typeof userLoginSchema>;
export type UserUpdate = z.infer<typeof userUpdateSchema>;
export type User = typeof users.$inferSelect;
export type ConditionInsert = z.infer<typeof conditionInsertSchema>;
export type Condition = typeof conditions.$inferSelect;
export type MetricInsert = z.infer<typeof metricInsertSchema>;
export type Metric = typeof metrics.$inferSelect;
export type AlertInsert = z.infer<typeof alertInsertSchema>;
export type Alert = typeof alerts.$inferSelect;
export type EducationalResourceInsert = z.infer<typeof educationalResourceInsertSchema>;
export type EducationalResource = typeof educationalResources.$inferSelect;
export type ForgotPassword = z.infer<typeof forgotPasswordSchema>;
export type ResetPassword = z.infer<typeof resetPasswordSchema>;

// Definición de tipo para representación de un paciente en la UI
export type Patient = {
  id: number;
  fullName: string; // nombre + apellido
  age: number;
  gender: string;
  status: string;
  fecha_nacimiento: string;
  conditions: Array<{
    id: number;
    name: string;
    icon: string;
    lastUpdated: string;
  }>;
};
