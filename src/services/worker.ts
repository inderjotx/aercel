
import { Worker } from "bullmq";
import { redis } from "./redis";

const worker = new Worker("aercel", async job => {
    switch (job.name) {
        case "deploy":
            console.log("Deploying application");
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
