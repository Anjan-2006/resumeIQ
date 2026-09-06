require("dotenv").config();
const connectToDB = require("./src/config/database");
const { createInterviewReportWorker } = require("./src/workers/interviewReport.worker");

async function startWorker() {
  await connectToDB();
  const worker = createInterviewReportWorker();
  console.log("=== ResumeIQ BullMQ Interview Report Worker Started ===");

  const shutdown = async () => {
    console.log("Shutting down BullMQ worker gracefully...");
    await worker.close();
    process.exit(0);
  };

  process.on("SIGTERM", shutdown);
  process.on("SIGINT", shutdown);
}

startWorker().catch((err) => {
  console.error("Worker fatal startup error:", err);
  process.exit(1);
});
