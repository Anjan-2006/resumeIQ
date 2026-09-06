require("dotenv").config()
const app=require("./src/app.js")
const connectTODB=require("./src/config/database.js")
const { createInterviewReportWorker } = require("./src/workers/interviewReport.worker.js")

connectTODB()

if (process.env.RUN_STANDALONE_WORKER !== "true") {
  createInterviewReportWorker();
  console.log("BullMQ Interview Report Worker running in-process");
}

app.listen(3000,()=>{
      console.log("listening at port 3000")
})