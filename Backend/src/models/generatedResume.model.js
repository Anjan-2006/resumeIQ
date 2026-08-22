const mongoose = require("mongoose")

const generatedResumeSchema = new mongoose.Schema({
      user: {
            type: mongoose.Schema.Types.ObjectId,
            required: true,
            ref: "users"
      },
      fileName: {
            type: String,
            required: true
      },
      s3Key: {
            type: String,
            required: true
      }
}, { timestamps: true })

const generatedResumeModel = mongoose.model("GeneratedResume", generatedResumeSchema)

module.exports = generatedResumeModel