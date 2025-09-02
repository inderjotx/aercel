import Docker from "dockerode";
import fs from "fs";

interface CreateImageProps {
    gitBranch: string;
    gitUrl: string;
    gitFolder: string;
    installCommand: string;
    buildCommand: string;
    startCommand: string;
    appId: string;
}

const appTypes = ['nextjs-app', 'discord-bot', 'server'];
type AppType = typeof appTypes[number];

export class ContainerService {

    private readonly docker: Docker;
    private readonly NEXJS_BASE_IMAGE = "node:22-alpine";
    private DEFAULT_PORT = 3000;

    constructor() {
        this.docker = new Docker({ socketPath: "/var/run/docker.sock" });
    }

    async buildAndRunApp(appType: AppType, props: CreateImageProps) {
        const imagePath = await this.getImagePath(appType, props);
        await this.buildImage(imagePath, props.appId);
        await this.runContainer(props.appId, this.DEFAULT_PORT);
        this.DEFAULT_PORT += 1;
    }

    async getImagePath(appType: AppType, props: CreateImageProps) {
        let image = '';
        switch (appType) {
            case "nextjs-app":
                image = this.createNextJsImage(props);
                break;
            default:
                throw new Error("Invalid app type");
        }

        fs.writeFileSync(`${props.appId}/Dockerfile`, image);
        return `${props.appId}/Dockerfile`;
    }


    async buildImage(imagePath: string, appId: string) {
        const stream = await this.docker.buildImage(
            {
                context: imagePath,
                src: fs.readdirSync(imagePath),
            },
            { t: `app-${appId}:latest` }
        );

        return new Promise((resolve, reject) => {
            this.docker.modem.followProgress(stream, (err: Error | null, res: unknown) =>
                err ? reject(err) : resolve(res)
            );
        });
    }


    async runContainer(appId: string, port: number) {
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

        const startCommand = JSON.stringify(props.startCommand.split(" ").map((command) => command.trim()));

        const image = `
FROM ${this.NEXJS_BASE_IMAGE}
WORKDIR /app

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