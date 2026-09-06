const { Worker } = require("bullmq");
const config = require("../config/config");
const redisConnection = require("../config/redis");
const interviewModel = require("../models/interviewReport.model");
const { generateInterviewReport } = require("../services/ai.service");
const { QUEUE_NAME } = require("../queues/interviewReport.queue");

function createInterviewReportWorker() {
  const worker = new Worker(
    QUEUE_NAME,
    async (job) => {
      const { interviewId, userId } = job.data;

      const report = await interviewModel.findOne({
        _id: interviewId,
        user: userId,
      });

      if (!report) {
        throw new Error(`Interview report ${interviewId} not found for user ${userId}`);
      }

      // Idempotency: skip re-calling AI if report is already successfully generated
      if (report.status === "completed" && report.matchScore !== undefined && report.matchScore !== null) {
        return { interviewId: report._id.toString() };
      }

      // Mark status as processing
      report.status = "processing";
      await report.save();

      // Invoke the Groq AI service with the stored resume text and descriptions
      const aiResult = await generateInterviewReport({
        resume: report.resume,
        selfDescription: report.selfDescription,
        jobDescription: report.jobDescription,
      });

      // Populate generated report data into MongoDB
      report.title = aiResult.title || report.title;
      report.matchScore = aiResult.matchScore;
      report.technicalQuestions = aiResult.technicalQuestions;
      report.behaviouralQuestions = aiResult.behavioralQuestions;
      report.skillGaps = aiResult.skillGaps;
      report.preparationPlanSchema = aiResult.preparationPlan;
      report.status = "completed";
      report.error = null;
      await report.save();

      return { interviewId: report._id.toString() };
    },
    {
      connection: redisConnection,
      concurrency: config.WORKER_CONCURRENCY || 2,
    }
  );

  worker.on("completed", (job) => {
    console.log(`[BullMQ Worker] Job ${job.id} (interview: ${job.data.interviewId}) completed successfully.`);
  });

  worker.on("failed", async (job, err) => {
    const attemptsMade = job ? job.attemptsMade : 0;
    const maxAttempts = job?.opts?.attempts || 3;
    console.error(`[BullMQ Worker] Job ${job?.id} attempt ${attemptsMade}/${maxAttempts} failed:`, err.message);

    if (job && attemptsMade >= maxAttempts) {
      try {
        await interviewModel.findByIdAndUpdate(job.data.interviewId, {
          status: "failed",
          error: err.message || "Interview report generation failed",
        });
      } catch (dbErr) {
        console.error("Failed to update interview report status to failed:", dbErr);
      }
    }
  });

  worker.on("error", (err) => {
    console.error("[BullMQ Worker] Unexpected worker error:", err.message);
  });

  return worker;
}

module.exports = {
  createInterviewReportWorker,
};
