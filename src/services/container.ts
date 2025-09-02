import Docker from "dockerode";
import fs from "fs";

export interface CreateImageProps {
    gitBranch: string;
    gitUrl: string;
    gitFolder: string;
    installCommand: string;
    buildCommand: string;
    startCommand: string;
    appId: string;
    appType: AppType;
    deploymentId: string;
}

export type AppType = "nextjs-app" | "discord-bot" | "server";
import { db } from "@/server/db";
import { deployment } from "@/server/db/schema";
import { eq } from "drizzle-orm";

export class ContainerService {

    private readonly docker: Docker;
    private readonly NEXJS_BASE_IMAGE = "node:22-alpine";
    private DEFAULT_PORT = 3000;

    constructor() {
        this.docker = new Docker({ socketPath: "/var/run/docker.sock" });
    }

    async buildAndRunApp(appType: AppType, props: CreateImageProps) {
        try {
            const imagePath = await this.getImagePath(appType, props);
            const imageTag = `app-${props.appId}:latest`;

            // Build the image and get the result
            const buildResult = await this.buildImage(imagePath, props.appId);
            console.log(`Build completed for app ${props.appId}:`, buildResult);

            // Run the container
            const containerId = await this.runContainer(props.appId, this.DEFAULT_PORT);
            this.DEFAULT_PORT += 1;

            // Update deployment with container info and image tag
            await db.update(deployment).set({
                containerId: containerId,
                status: "running",
                url: `http://localhost:${this.DEFAULT_PORT}`,
                imageTag: imageTag,
            }).where(eq(deployment.id, props.deploymentId));

            console.log(`Successfully deployed app ${props.appId} with image tag: ${imageTag}`);

        } catch (error) {
            console.error('Error in buildAndRunApp:', error);
            throw new Error("Failed to build and run app ----------------->");
        }
    }

    async getImagePath(appType: AppType, props: CreateImageProps) {
        const path = await import("path");
        const tmpDir = "/tmp";
        let image = '';
        switch (appType) {
            case "nextjs-app":
                image = this.createNextJsImage(props);
                break;
            default:
                throw new Error("Invalid app type");
        }

        const appDir = path.join(tmpDir, `${props.appId}`);
        if (!fs.existsSync(appDir)) {
            fs.mkdirSync(appDir, { recursive: true });
        }

        const dockerfilePath = path.join(appDir, "Dockerfile");

        fs.writeFileSync(dockerfilePath, image);
        return appDir;
    }


    async buildImage(imagePath: string, appId: string): Promise<string> {
        const imageTag = `app-${appId}:latest`;

        // Build the image without specifying tag first
        const stream = await this.docker.buildImage({
            context: imagePath,
            src: ["Dockerfile"],
        }, {
            t: imageTag
        });

        await new Promise((resolve, reject) => {
            this.docker.modem.followProgress(stream, (err, res) => err ? reject(err) : resolve(res));
        })
        return imageTag;

    }


    async runContainer(appId: string, port: number): Promise<string> {
        const container = await this.docker.createContainer({
            Image: `app-${appId}:latest`,
            name: `container-${appId}`,
            ExposedPorts: { "3000/tcp": {} },
            HostConfig: {
                PortBindings: { "3000/tcp": [{ HostPort: `${port}` }] },
            },
        });
        await container.start();
        return container.id;
    }


    createNextJsImage(props: CreateImageProps) {

        const startCommand = JSON.stringify(props.startCommand.split(" ").map((command) => command.trim()).filter((command) => command !== ""));

        const image = `
FROM ${this.NEXJS_BASE_IMAGE}
WORKDIR /app

# install global package managers
RUN npm install -g pnpm yarn

# clone repo
RUN apk add --no-cache git && \
    git clone --branch ${props.gitBranch} ${props.gitUrl} . && \
    cd ${props.gitFolder}

# install deps
RUN ${props.installCommand}

# build app
RUN ${props.buildCommand}

# expose default Next.js port
EXPOSE 3000

# run app
CMD ${startCommand}
`;

        return image

    }


}



export const containerService = new ContainerService();