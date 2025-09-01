import { z } from "zod";

import { createTRPCRouter, protectedProcedure } from "@/server/api/trpc";
import { app, appType } from "@/server/db/schema";
import { eq } from "drizzle-orm";


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

export const myAppsSchema = z.object({
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

});
