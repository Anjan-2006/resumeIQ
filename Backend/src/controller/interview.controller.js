const pdfParse = require('pdf-parse');
const { generateInterviewReport, generateResumePdf } = require('../services/ai.service');
const interviewModel = require('../models/interviewReport.model');
const generatedResumeModel = require('../models/generatedResume.model');
const { uploadResumePdf, getResumePdf, deleteResumePdf } = require('../services/s3.service');
const { interviewReportQueue } = require('../queues/interviewReport.queue');
const mongoose = require('mongoose');
const userModel = require('../models/user.model');

const GUEST_REPORT_LIMIT = 2;
const GUEST_RESUME_LIMIT = 2;

async function consumeGuestQuota(userId, field, limit) {
  const user = await userModel.findOneAndUpdate(
    { _id: userId, isGuest: true, [field]: { $lt: limit } },
    { $inc: { [field]: 1 } },
    { returnDocument: 'after' }
  );

  if (!user) {
    const guestUser = await userModel.findOne({ _id: userId, isGuest: true }).select(field);
    if (guestUser) {
      return false;
    }
  }

  return Boolean(user) || !(await userModel.exists({ _id: userId, isGuest: true }));
}



async function generateInterviewReportController(req, res) {
  try {
    if (!req.file || req.file.buffer.subarray(0, 5).toString() !== "%PDF-") {
      return res.status(400).json({ message: "Only valid PDF resume files are supported" });
    }

    const isAllowed = await consumeGuestQuota(req.user.id, 'guestReportGenerations', GUEST_REPORT_LIMIT);
    if (!isAllowed) {
      return res.status(429).json({ message: "Guest demo report limit reached. Please create an account to continue." });
    }

    const parser = new pdfParse.PDFParse(Uint8Array.from(req.file.buffer));
    const resumeContent = await parser.getText();
    const resumeText = resumeContent.text || resumeContent;

    const { selfDescription, jobDescription } = req.body;
    if (!jobDescription || !jobDescription.trim()) {
      return res.status(400).json({ message: "Job Description is required" });
    }

    // Create initial interview report record with pending status
    const interviewReport = await interviewModel.create({
      user: req.user.id,
      resume: resumeText,
      selfDescription: selfDescription || "",
      jobDescription: jobDescription,
      title: "Generating Interview Report...",
      status: "pending",
    });

    // Enqueue background job in BullMQ
    let job;
    try {
      job = await interviewReportQueue.add("GENERATE_INTERVIEW_REPORT", {
        interviewId: interviewReport._id.toString(),
        userId: req.user.id,
      });
    } catch (queueErr) {
      console.error("Failed to enqueue interview report job to BullMQ:", queueErr);
      await interviewModel.findByIdAndDelete(interviewReport._id);
      return res.status(503).json({ message: "Service temporarily unavailable. Could not queue job." });
    }

    return res.status(202).json({
      message: "Interview report generation started",
      jobId: job.id,
      interviewId: interviewReport._id,
    });
  } catch (error) {
    console.error("Error in generateInterviewReportController:", error);
    return res.status(500).json({ message: "Unable to start interview report generation" });
  }
}

async function getInterviewJobStatusController(req, res) {
  try {
    const { jobId } = req.params;
    if (!jobId) {
      return res.status(400).json({ message: "Job ID is required" });
    }

    const job = await interviewReportQueue.getJob(jobId);
    if (!job) {
      return res.status(404).json({ message: "Job not found" });
    }

    // User authorization: verify that the requesting user owns the job
    if (job.data && job.data.userId && job.data.userId.toString() !== req.user.id.toString()) {
      return res.status(403).json({ message: "Unauthorized to access this job status" });
    }

    const state = await job.getState();
    const interviewId = job.returnvalue?.interviewId || job.data?.interviewId;

    if (state === "completed") {
      return res.status(200).json({
        jobId,
        status: "completed",
        interviewId,
      });
    }

    if (state === "failed") {
      return res.status(200).json({
        jobId,
        status: "failed",
        error: job.failedReason || "Interview report generation failed",
      });
    }

    return res.status(200).json({
      jobId,
      status: state === "delayed" ? "waiting" : state,
      interviewId,
    });
  } catch (error) {
    console.error("Error in getInterviewJobStatusController:", error);
    return res.status(500).json({ message: "Unable to retrieve job status" });
  }
}

async function getInterviewReportById(req, res) {
  try {
    const { interviewId } = req.params;
    const interviewReport = await interviewModel.findOne({
      _id: interviewId,
      user: req.user.id,
    });

    if (!interviewReport) {
      return res.status(404).json({
        message: "Interview Report Not Found",
      });
    }

    return res.status(200).json({
      message: "Interview report fetched successfully",
      interviewReport,
    });
  } catch (err) {
    return res.status(500).json({
      message: "Unable to fetch interview report",
    });
  }
}

async function getAllInterviewReports(req, res) {
  try {
    const interviewReports = await interviewModel
      .find({ user: req.user.id })
      .sort({ createdAt: -1 })
      .select('-resume -selfDescription -jobDescription -__v -technicalQuestions -behaviouralQuestions -skillGaps -preparationPlanSchema');

    return res.status(200).json({
      message: "Interview reports fetched successfully",
      interviewReports,
    });
  } catch (err) {
    return res.status(500).json({
      message: "Unable to fetch interview reports",
    });
  }
}

async function getGeneratedResumesController(req, res) {
  try {
    const generatedResumes = await generatedResumeModel
      .find({ user: req.user.id })
      .sort({ createdAt: -1 })
      .select('_id fileName createdAt');

    return res.status(200).json({
      message: "Generated resumes fetched successfully",
      generatedResumes
    });
  } catch (err) {
    console.error("Error fetching generated resumes:", err);
    return res.status(500).json({
      message: "Unable to fetch generated resumes"
    });
  }
}

async function renameInterviewReport(req, res) {
  try {
    const { interviewId } = req.params;
    const { title } = req.body;

    if (!title || !title.trim()) {
      return res.status(400).json({ message: "Title is required" });
    }

    const interviewReport = await interviewModel.findOneAndUpdate(
      { _id: interviewId, user: req.user.id },
      { title: title.trim() },
      { returnDocument: 'after' }
    ).select('title');

    if (!interviewReport) {
      return res.status(404).json({ message: "Interview Report Not Found" });
    }

    return res.status(200).json({
      message: "Report renamed successfully",
      interviewReport,
    });
  } catch (err) {
    return res.status(500).json({
      message: "Unable to rename interview report",
    });
  }
}

async function deleteInterviewReport(req, res) {
  try {
    const { interviewId } = req.params;

    const interviewReport = await interviewModel.findOneAndDelete({
      _id: interviewId,
      user: req.user.id,
    });

    if (!interviewReport) {
      return res.status(404).json({ message: "Interview Report Not Found" });
    }

    return res.status(200).json({
      message: "Report deleted successfully",
    });
  } catch (err) {
    return res.status(500).json({
      message: "Unable to delete interview report",
    });
  }
}

async function generateResumePdfController(req, res) {
  try {
    const { interviewReportId } = req.params;

    const interviewReport = await interviewModel.findOne({
      _id: interviewReportId,
      user: req.user.id,
    });

    if (!interviewReport) {
      return res.status(404).json({
        message: "Interview report not found",
      });
    }

    const { resume, selfDescription, jobDescription } = interviewReport;

    const isAllowed = await consumeGuestQuota(req.user.id, 'guestResumeGenerations', GUEST_RESUME_LIMIT);
    if (!isAllowed) {
      return res.status(429).json({message:"Guest demo resume limit reached. Please create an account to continue."});
    }

    const pdfBuffer = await generateResumePdf({ resume, jobDescription, selfDescription });
    res.set({
      "Content-Type": "application/pdf",
      "Content-Disposition": "inline",
      "Content-Length": pdfBuffer.length
    });

    return res.send(pdfBuffer);
  } catch (err) {
    console.error("Error in generateResumePdfController:", err);
    return res.status(500).json({
      message: "Unable to generate resume preview"
    });
  }
}

async function saveGeneratedResumeController(req, res) {
  try {
    const { interviewReportId } = req.params;
    const interviewReport = await interviewModel.findOne({
      _id: interviewReportId,
      user: req.user.id,
    });

    if (!interviewReport) {
      return res.status(404).json({ message: "Interview report not found" });
    }

    if (!req.file || req.file.buffer.length < 5 || req.file.buffer.subarray(0, 5).toString() !== "%PDF-") {
      return res.status(400).json({ message: "A valid resume PDF is required" });
    }

    const pdfBuffer = req.file.buffer;
    const resumeId = new mongoose.Types.ObjectId();
    const fileName = `${(interviewReport.title || 'Tailored_Resume').replace(/[^a-zA-Z0-9_-]/g, '_')}_Resume.pdf`;
    const s3Key = `resumes/${req.user.id}/${resumeId}.pdf`;

    await uploadResumePdf({ s3Key, pdfBuffer });

    let generatedResume;
    try {
      generatedResume = await generatedResumeModel.create({
        _id: resumeId,
        user: req.user.id,
        fileName,
        s3Key
      });
    } catch (metadataError) {
      await deleteResumePdf(s3Key).catch((cleanupError) => {
        console.error("Unable to clean up uploaded resume:", cleanupError);
      });
      throw metadataError;
    }

    return res.status(201).json({
      message: "Resume generated successfully",
      generatedResume: {
        resumeId: generatedResume._id,
        fileName: generatedResume.fileName,
        createdAt: generatedResume.createdAt
      }
    });
  } catch (err) {
    console.error("Error in saveGeneratedResumeController:", err);
    return res.status(500).json({
      message: "Unable to save resume"
    });
  }
}

async function downloadGeneratedResumeController(req, res) {
  try {
    const generatedResume = await generatedResumeModel.findOne({
      _id: req.params.resumeId,
      user: req.user.id,
    });

    if (!generatedResume) {
      return res.status(404).json({ message: "Generated resume not found" });
    }

    const pdfBuffer = await getResumePdf(generatedResume.s3Key);

    res.set({
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="${generatedResume.fileName}"`,
      "Content-Length": pdfBuffer.length
    });

    return res.send(pdfBuffer);
  } catch (err) {
    console.error("Error in downloadGeneratedResumeController:", err);
    if (err.code === "NoSuchKey" || err.name === "NoSuchKey" || err.name === "CastError") {
      return res.status(404).json({ message: "Generated resume file not found" });
    }
    return res.status(500).json({
      message: "Unable to download resume"
    });
  }
}

async function deleteGeneratedResumeController(req, res) {
  try {
    const generatedResume = await generatedResumeModel.findOne({
      _id: req.params.resumeId,
      user: req.user.id,
    });

    if (!generatedResume) {
      return res.status(404).json({ message: "Generated resume not found" });
    }

    await deleteResumePdf(generatedResume.s3Key);
    await generatedResumeModel.deleteOne({ _id: generatedResume._id });

    return res.status(200).json({ message: "Generated resume deleted successfully" });
  } catch (err) {
    console.error("Error in deleteGeneratedResumeController:", err);
    return res.status(500).json({ message: "Unable to delete resume" });
  }
}


module.exports = {
  generateInterviewReportController,
  getInterviewReportById,
  getAllInterviewReports,
  getGeneratedResumesController,
  renameInterviewReport,
  deleteInterviewReport,
  generateResumePdfController,
  saveGeneratedResumeController,
  downloadGeneratedResumeController,
  deleteGeneratedResumeController,
  getInterviewJobStatusController
};