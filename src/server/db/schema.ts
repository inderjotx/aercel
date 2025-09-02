import { relations, sql } from "drizzle-orm";
import { pgTable, text, timestamp, boolean, pgEnum, jsonb } from "drizzle-orm/pg-core";

export const user = pgTable("user", {
  id: text("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  emailVerified: boolean("email_verified")
    .$defaultFn(() => false)
    .notNull(),
  image: text("image"),
  createdAt: timestamp("created_at")
    .$defaultFn(() => /* @__PURE__ */ new Date())
    .notNull(),
  updatedAt: timestamp("updated_at")
    .$defaultFn(() => /* @__PURE__ */ new Date())
    .notNull(),
});

export const session = pgTable("session", {
  id: text("id").primaryKey().default(sql`gen_random_uuid()`),
  expiresAt: timestamp("expires_at").notNull(),
  token: text("token").notNull().unique(),
  createdAt: timestamp("created_at").notNull(),
  updatedAt: timestamp("updated_at").notNull(),
  ipAddress: text("ip_address"),
  userAgent: text("user_agent"),
  userId: text("user_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
});

export const account = pgTable("account", {
  id: text("id").primaryKey().default(sql`gen_random_uuid()`),
  accountId: text("account_id").notNull(),
  providerId: text("provider_id").notNull(),
  userId: text("user_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  accessToken: text("access_token"),
  refreshToken: text("refresh_token"),
  idToken: text("id_token"),
  accessTokenExpiresAt: timestamp("access_token_expires_at"),
  refreshTokenExpiresAt: timestamp("refresh_token_expires_at"),
  scope: text("scope"),
  password: text("password"),
  createdAt: timestamp("created_at").notNull(),
  updatedAt: timestamp("updated_at").notNull(),
});

export const verification = pgTable("verification", {
  id: text("id").primaryKey().default(sql`gen_random_uuid()`),
  identifier: text("identifier").notNull(),
  value: text("value").notNull(),
  expiresAt: timestamp("expires_at").notNull(),
  createdAt: timestamp("created_at").$defaultFn(
    () => /* @__PURE__ */ new Date(),
  ),
  updatedAt: timestamp("updated_at").$defaultFn(
    () => /* @__PURE__ */ new Date(),
  ),
});

export const appType = pgEnum("app_type", ["discord-bot", "server", "nextjs-app"]);

export const deploymentStatus = pgEnum("deployment_status", ["pending", "building", "running", "stopped"]);


export const app = pgTable("app", {
  id: text("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  description: text("description"),
  type: appType("type").notNull(),
  userId: text("user_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  createdAt: timestamp("created_at")
    .$defaultFn(() => /* @__PURE__ */ new Date())
    .notNull(),
  updatedAt: timestamp("updated_at")
    .$defaultFn(() => /* @__PURE__ */ new Date())
    .notNull(),

  gitUrl: text("git_url").notNull(),
  gitBranch: text("git_branch").default("main"),
  gitToken: text("git_token"),
  gitFolder: text("git_folder").default("."),
  environmentVariables: jsonb("environment_variables").default({}),
  startCommand: text("start_command"),
  installCommand: text("install_command"),
  buildCommand: text("build_command"),
});


export const deployment = pgTable("deployment", {
  id: text("id").primaryKey().default(sql`gen_random_uuid()`),
  appId: text("app_id")
    .notNull()
    .references(() => app.id, { onDelete: "cascade" }),
  createdAt: timestamp("created_at")
    .$defaultFn(() => /* @__PURE__ */ new Date())
    .notNull(),
  status: deploymentStatus("status").default("pending"),
  containerId: text("container_id"),
  url: text("url"),
  imageTag: text("image_tag"),
  updatedAt: timestamp("updated_at").$defaultFn(() => new Date()).notNull(),
});


export const log = pgTable("log", {
  id: text("id").primaryKey().default(sql`gen_random_uuid()`),
  deploymentId: text("deployment_id")
    .notNull()
    .references(() => deployment.id, { onDelete: "cascade" }),
  timestamp: timestamp("timestamp").$defaultFn(() => new Date()).notNull(),
  message: jsonb("message").notNull().default({}),
});



export const appRelations = relations(app, ({ many, one }) => ({
  deployments: many(deployment),
  user: one(user, { fields: [app.userId], references: [user.id] }),
}));

export const deploymentRelations = relations(deployment, ({ many, one }) => ({
  logs: many(log),
  app: one(app, { fields: [deployment.appId], references: [app.id] }),
}));

export const logRelations = relations(log, ({ one }) => ({
  deployment: one(deployment, { fields: [log.deploymentId], references: [deployment.id] }),
}));

export const userRelations = relations(user, ({ many }) => ({
  apps: many(app),
}));