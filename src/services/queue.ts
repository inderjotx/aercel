
import { Queue } from 'bullmq';
import { redis } from './redis';
import type { CreateImageProps } from './container';





export class QueueService {

    private readonly queue: Queue;

    constructor() {
        this.queue = new Queue('aercel', { connection: redis });
    }

    async deployApp(data: CreateImageProps & { appId: string, deploymentId: string }) {
        await this.addJob("buildAndRunApp", data)
    }

    async addJob(jobName: string, data: unknown) {
        await this.queue.add(jobName, data);
    }


}

export const queueService = new QueueService();