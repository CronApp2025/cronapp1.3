import { pgTable, text, serial, integer, timestamp, date, boolean } from "drizzle-orm/pg-core";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import { z } from "zod";
import { relations } from "drizzle-orm";

// Users table definition
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  nombre: text("nombre").notNull(),
  apellido: text("apellido").notNull(),
  email: text("email").notNull().unique(),
  password: text("password"),
  fecha_nacimiento: date("fecha_nacimiento").notNull(),
  created_at: timestamp("created_at").defaultNow().notNull(),
  updated_at: timestamp("updated_at").defaultNow().notNull(),
});

// Medical conditions table
export const conditions = pgTable("conditions", {
  id: serial("id").primaryKey(),
  user_id: integer("user_id").references(() => users.id).notNull(),
  name: text("name").notNull(),
  type: text("type").notNull(),
  icon: text("icon").default("activity"), // 'heart', 'activity', etc.
  diagnosed_date: date("diagnosed_date").notNull(),
  last_updated: timestamp("last_updated").defaultNow().notNull(),
  created_at: timestamp("created_at").defaultNow().notNull(),
  updated_at: timestamp("updated_at").defaultNow().notNull(),
});

// Medical metrics table
export const metrics = pgTable("metrics", {
  id: serial("id").primaryKey(),
  condition_id: integer("condition_id").references(() => conditions.id).notNull(),
  key: text("key").notNull(),
  value: text("value").notNull(),
  unit: text("unit"),
  risk_level: text("risk_level"), // 'normal', 'warning', 'danger'
  date_recorded: timestamp("date_recorded").defaultNow().notNull(),
});

// Risk alerts
export const alerts = pgTable("alerts", {
  id: serial("id").primaryKey(),
  user_id: integer("user_id").references(() => users.id).notNull(),
  alert_type: text("alert_type").notNull(), // Tipo de alerta (presión, glucosa, etc.)
  description: text("description").notNull(),
  risk_level: integer("risk_level").notNull(), // Nivel de riesgo (0-100)
  is_resolved: boolean("is_resolved").default(false),
  created_at: timestamp("created_at").defaultNow().notNull(),
  updated_at: timestamp("updated_at").defaultNow().notNull(),
});

// Educational resources
export const educationalResources = pgTable("educational_resources", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  description: text("description").notNull(),
  category: text("category").notNull(), // 'brain', 'heart', 'eye', etc.
  resource_type: text("resource_type").notNull(), // 'article', 'guide', 'video', etc.
  url: text("url"),
  is_new: boolean("is_new").default(true),
  created_at: timestamp("created_at").defaultNow().notNull(),
  updated_at: timestamp("updated_at").defaultNow().notNull(),
});

// Password reset tokens
export const passwordResetTokens = pgTable("password_reset_tokens", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id).notNull(),
  token: text("token").notNull().unique(),
  expiresAt: timestamp("expires_at").notNull(),
  usedAt: timestamp("used_at"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
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
    fields: [passwordResetTokens.userId],
    references: [users.id],
  }),
}));

// Schemas for validation
export const userInsertSchema = createInsertSchema(users, {
  nombre: (schema) => schema.min(2, "El nombre debe tener al menos 2 caracteres"),
  apellido: (schema) => schema.min(2, "El apellido debe tener al menos 2 caracteres"),
  email: (schema) => schema.email("Debe proporcionar un email válido"),
  password: (schema) => schema.optional(),
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
}).omit({ created_at: true, updated_at: true });

export const metricInsertSchema = createInsertSchema(metrics, {
  key: (schema) => schema.min(1, "La clave debe tener al menos 1 caracter"),
  value: (schema) => schema.min(1, "El valor debe tener al menos 1 caracter"),
});

export const alertInsertSchema = createInsertSchema(alerts, {
  alert_type: (schema) => schema.min(2, "El tipo debe tener al menos 2 caracteres"),
  description: (schema) => schema.min(2, "La descripción debe tener al menos 2 caracteres"),
  risk_level: (schema) => schema.gte(0, "El nivel debe ser mayor o igual a 0").lte(100, "El nivel debe ser menor o igual a 100"),
}).omit({ created_at: true, updated_at: true });

export const educationalResourceInsertSchema = createInsertSchema(educationalResources, {
  title: (schema) => schema.min(2, "El título debe tener al menos 2 caracteres"),
  description: (schema) => schema.min(2, "La descripción debe tener al menos 2 caracteres"),
  category: (schema) => schema.min(2, "La categoría debe tener al menos 2 caracteres"),
  resource_type: (schema) => schema.min(2, "El tipo debe tener al menos 2 caracteres"),
}).omit({ created_at: true, updated_at: true });

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
