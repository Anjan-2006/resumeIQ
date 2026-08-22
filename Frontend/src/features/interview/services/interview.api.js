import axios from 'axios';
import { API_BASE_URL } from '../../../config/api';

const api = axios.create({
  baseURL: `${API_BASE_URL}/api/interview`,
  withCredentials: true
});

export async function generateReport({jobDescription,selfDescription,resumeFile}) {
    const formData=new FormData()

    formData.append("jobDescription",jobDescription)
    formData.append("selfDescription",selfDescription)
    formData.append("resume",resumeFile)


  try {
    const response = await api.post('/', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
    return response.data;
  } catch (err) {
    console.error("Generate report API error:", err);
    throw err;
  }
}

export async function getInterviewReportById(interviewId) {
  try {
    const response = await api.get(`/report/${interviewId}`);
    return response.data;
  } catch (err) {
    console.error("Get report by ID API error:", err);
    throw err;
  }
}

export async function getAllInterviewReports() {
  try {
    const response=await api.get('/');
    return response.data;
  } catch (err) {
    console.error("Get all reports API error:", err);
    throw err;
  }
}

export async function getGeneratedResumes() {
  try {
    const response = await api.get('/generated-resumes');
    return response.data;
  } catch (err) {
    console.error("Get generated resumes API error:", err);
    throw err;
  }
}

export async function renameInterviewReport(interviewId, title) {
  try {
    const response = await api.patch(`/report/${interviewId}`, { title });
    return response.data;
  } catch (err) {
    console.error("Rename report API error:", err);
    throw err;
  }
}

export async function deleteInterviewReport(interviewId) {
  try {
    const response = await api.delete(`/report/${interviewId}`);
    return response.data;
  } catch (err) {
    console.error("Delete report API error:", err);
    throw err;
  }
}

export async function generateResumePreview(interviewReportId) {
  try {
    const response = await api.post(`/resume/pdf/${interviewReportId}`, {}, {
      responseType: 'blob'
    });
    return response.data;
  } catch (err) {
    console.error("Generate resume preview API error:", err);
    throw err;
  }
}

export async function saveGeneratedResume(interviewReportId, pdfBlob, fileName) {
  try {
    const formData = new FormData();
    formData.append('resumePdf', pdfBlob, fileName || 'Tailored_Resume.pdf');
    const response = await api.post(`/resume/pdf/${interviewReportId}/save`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
    return response.data;
  } catch (err) {
    console.error("Save generated resume API error:", err);
    throw err;
  }
}

export async function downloadResumePdf(resumeId) {
  try {
    const response = await api.get(`/resume/${resumeId}/download`, {
      responseType: 'blob'
    });
    return response.data;
  } catch (err) {
    console.error("Download resume PDF API error:", err);
    throw err;
  }
}

export async function deleteGeneratedResume(resumeId) {
  try {
    const response = await api.delete(`/resume/${resumeId}`);
    return response.data;
  } catch (err) {
    console.error("Delete generated resume API error:", err);
    throw err;
  }
}
