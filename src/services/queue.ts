
import { Queue } from 'bullmq';
import { redis } from './redis';




export class QueueService {

    private readonly queue: Queue;

    constructor() {
        this.queue = new Queue('aercel', { connection: redis });
    }

    async addJob(jobName: string, data: unknown) {
        await this.queue.add(jobName, data);
    }
}