const {Router}=require("express")
const authMiddleware=require('../middlewares/auth.middleware')
const interviewController=require('../controller/interview.controller')
const upload=require('../middlewares/file.middleware')
const {
  aiReportLimiter,
  pdfGenerationLimiter,
} = require("../middlewares/rateLimiter.middleware");

const interviewRouter=Router()

interviewRouter.post('/',aiReportLimiter,authMiddleware.authUser,upload.single("resume"),interviewController.generateInterviewReportController)
interviewRouter.get('/status/:jobId',authMiddleware.authUser,interviewController.getInterviewJobStatusController)

interviewRouter.get('/report/:interviewId',authMiddleware.authUser,interviewController.getInterviewReportById)

interviewRouter.get('/',authMiddleware.authUser,interviewController.getAllInterviewReports)
interviewRouter.get('/generated-resumes',authMiddleware.authUser,interviewController.getGeneratedResumesController)

interviewRouter.patch('/report/:interviewId',authMiddleware.authUser,interviewController.renameInterviewReport)

interviewRouter.delete('/report/:interviewId',authMiddleware.authUser,interviewController.deleteInterviewReport)

interviewRouter.post("/resume/pdf/:interviewReportId",pdfGenerationLimiter,authMiddleware.authUser,interviewController.generateResumePdfController)
interviewRouter.post("/resume/pdf/:interviewReportId/save",authMiddleware.authUser,upload.single("resumePdf"),interviewController.saveGeneratedResumeController)
interviewRouter.get("/resume/:resumeId/download",authMiddleware.authUser,interviewController.downloadGeneratedResumeController)
interviewRouter.delete("/resume/:resumeId",authMiddleware.authUser,interviewController.deleteGeneratedResumeController)


module.exports=interviewRouter