const { Queue } = require("bullmq");
const redisConnection = require("../config/redis");

const QUEUE_NAME = "interviewReportQueue";

const interviewReportQueue = new Queue(QUEUE_NAME, {
  connection: redisConnection,
  defaultJobOptions: {
    attempts: 3,
    backoff: {
      type: "exponential",
      delay: 2000,
    },
    removeOnComplete: {
      age: 3600, // Keep completed job metadata in Redis for 1 hour
      count: 1000,
    },
    removeOnFail: {
      age: 86400, // Keep failed job metadata in Redis for 24 hours
      count: 1000,
    },
  },
});

module.exports = {
  interviewReportQueue,
  QUEUE_NAME,
};
