
import { Worker } from "bullmq";
import { redis } from "./redis";
import { containerService } from "./container";
import type { AppType, CreateImageProps } from "./container";

const worker = new Worker("aercel", async job => {
    switch (job.name) {
        case "buildAndRunApp":
            await containerService.buildAndRunApp(job?.data?.appType as unknown as AppType, job.data as CreateImageProps);
            break;
        case "test":
            console.log("Testing application");
            break;
        default:
            console.log("Unknown job");
            break;
    }
}, { connection: redis });

worker.on("completed", job => {
    console.log(`✅ Job ${job.id} completed`);
});

worker.on("failed", (job, err) => {
    console.error(`❌ Job ${job?.id} failed: ${err.message}`);
});

worker.on("ready", () => {
    console.log("🚀 Worker is running and waiting for jobs...");
});

console.log("🔄 Starting worker...");
