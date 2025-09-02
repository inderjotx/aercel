import { z } from "zod";

import { queueService } from "@/services/queue";
import { createTRPCRouter, protectedProcedure } from "@/server/api/trpc";
import { appConfig } from "@/lib/default";
import { app, appType, deployment } from "@/server/db/schema";
import { eq, and } from "drizzle-orm";


const createAppSchema = z.object({
    name: z.string().min(1),
    gitUrl: z.string().min(1),
    type: z.enum(appType.enumValues),
    gitBranch: z.string().min(1),
    gitToken: z.string().optional(),
    gitFolder: z.string().optional(),
    environmentVariables: z.record(z.string(), z.string()),
    startCommand: z.string().min(1),
    installCommand: z.string().optional(),
    buildCommand: z.string().optional(),
});

const updateAppSchema = z.object({
    id: z.string(),
    name: z.string().min(1),
    gitUrl: z.string().min(1),
    type: z.enum(appType.enumValues),
    gitBranch: z.string().min(1),
    gitToken: z.string().optional(),
    gitFolder: z.string().optional(),
    environmentVariables: z.record(z.string(), z.string()),
    startCommand: z.string().min(1),
    installCommand: z.string().optional(),
    buildCommand: z.string().optional(),
});

const deleteAppSchema = z.object({
    id: z.string(),
});

export const myAppsSchema = z.object({
    page: z.number().min(1).default(1),
    limit: z.number().min(1).default(10),
});

const getAppSchema = z.object({
    id: z.string(),
});

const createDeploymentSchema = z.object({
    appId: z.string(),
});

const getDeploymentsSchema = z.object({
    appId: z.string(),
    page: z.number().min(1).default(1),
    limit: z.number().min(1).default(10),
});



export const applicationRouter = createTRPCRouter({
    myApps: protectedProcedure
        .input(myAppsSchema)
        .query(({ ctx, input }) => {
            const { page, limit } = input;
            const apps = ctx.db.query.app.findMany({
                where: eq(app.userId, ctx.user.id),
                offset: (page - 1) * limit,
                limit: limit,
            });

            return apps;
        }),

    create: protectedProcedure
        .input(createAppSchema)
        .mutation(async ({ ctx, input }) => {
            await ctx.db.insert(app).values({
                name: input.name,
                gitUrl: input.gitUrl,
                type: input.type,
                gitBranch: input.gitBranch,
                gitToken: input.gitToken,
                gitFolder: input.gitFolder,
                environmentVariables: input.environmentVariables,
                startCommand: input.startCommand,
                installCommand: input.installCommand,
                buildCommand: input.buildCommand,
                userId: ctx.user.id,
            });
        }),

    update: protectedProcedure
        .input(updateAppSchema)
        .mutation(async ({ ctx, input }) => {
            await ctx.db
                .update(app)
                .set({
                    name: input.name,
                    gitUrl: input.gitUrl,
                    type: input.type,
                    gitBranch: input.gitBranch,
                    gitToken: input.gitToken,
                    gitFolder: input.gitFolder,
                    environmentVariables: input.environmentVariables,
                    startCommand: input.startCommand,
                    installCommand: input.installCommand,
                    buildCommand: input.buildCommand,
                    updatedAt: new Date(),
                })
                .where(eq(app.id, input.id));
        }),

    delete: protectedProcedure
        .input(deleteAppSchema)
        .mutation(async ({ ctx, input }) => {
            await ctx.db
                .delete(app)
                .where(eq(app.id, input.id));
        }),

    getApp: protectedProcedure
        .input(getAppSchema)
        .query(async ({ ctx, input }) => {
            const appData = await ctx.db.query.app.findFirst({
                where: and(eq(app.id, input.id), eq(app.userId, ctx.user.id)),
                with: {
                    deployments: {
                        orderBy: (deployments, { desc }) => [desc(deployments.createdAt)],
                        limit: 10,
                    },
                },
            });

            if (!appData) {
                throw new Error("Application not found");
            }

            return appData;
        }),

    createDeployment: protectedProcedure
        .input(createDeploymentSchema)
        .mutation(async ({ ctx, input }) => {
            // Verify the app belongs to the user
            const appData = await ctx.db.query.app.findFirst({
                where: and(eq(app.id, input.appId), eq(app.userId, ctx.user.id)),
            });

            if (!appData) {
                throw new Error("Application not found");
            }

            // Create a placeholder deployment
            const newDeployment = await ctx.db.insert(deployment).values({
                appId: input.appId,
                status: "pending",
                containerId: null,
                url: null,
                imageTag: null,
            }).returning();

            if (!newDeployment?.[0]) {
                throw new Error("Failed to create deployment");
            }

            await queueService.deployApp({
                appId: input.appId,
                deploymentId: newDeployment?.[0].id,
                gitBranch: appData.gitBranch ?? config.gitBranch,
                gitUrl: appData.gitUrl,
                gitFolder: appData.gitFolder ?? config.gitFolder,
                installCommand: appData.installCommand ?? config.installCommand[appData.type],
                buildCommand: appData.buildCommand ?? config.buildCommand[appData.type],
                startCommand: appData.startCommand ?? config.startCommand[appData.type],
                appType: appData.type,
            });

            return newDeployment[0];
        }),

    getDeployments: protectedProcedure
        .input(getDeploymentsSchema)
        .query(async ({ ctx, input }) => {
            const { page, limit } = input;

            // Verify the app belongs to the user
            const appData = await ctx.db.query.app.findFirst({
                where: and(eq(app.id, input.appId), eq(app.userId, ctx.user.id)),
            });

            if (!appData) {
                throw new Error("Application not found");
            }

            const deployments = await ctx.db.query.deployment.findMany({
                where: eq(deployment.appId, input.appId),
                orderBy: (deployments, { desc }) => [desc(deployments.createdAt)],
                offset: (page - 1) * limit,
                limit: limit,
                with: {
                    logs: {
                        orderBy: (logs, { desc }) => [desc(logs.timestamp)],
                        limit: 5,
                    },
                },
            });

            return deployments;
        }),

});
