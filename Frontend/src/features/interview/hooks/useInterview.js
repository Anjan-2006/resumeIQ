import { generateReport, getJobStatus, getInterviewReportById, getAllInterviewReports, getGeneratedResumes, renameInterviewReport, deleteInterviewReport, generateResumePreview, saveGeneratedResume as saveGeneratedResumeApi, downloadResumePdf, deleteGeneratedResume as deleteGeneratedResumeApi } from '../services/interview.api'
import { useContext } from 'react'
import { InterviewContext } from '../interview.context'



const useInterview = () => {
    const context = useContext(InterviewContext)

    if (!context) {
        throw new Error("Use Interview must be inside an Interview Provider")
    }

       const { loading, setLoading, report, setReport, reports, setReports, setGeneratedResumes } = context

    const generateInterviewReport = async ({ jobDescription, selfDescription, resumeFile }) => {
          setLoading(true)

          try{
                  const response = await generateReport({jobDescription,selfDescription,resumeFile})  
                  
                  // Synchronous response fallback
                  if (response && response.interviewReport && response.interviewReport.matchScore !== undefined) {
                    setReport(response.interviewReport);
                    return response;
                  }

                  // Asynchronous BullMQ background job processing
                  if (response && response.jobId) {
                    const { jobId, interviewId } = response;
                    const maxWaitMs = 120000;
                    const intervalMs = 2000;
                    const startTime = Date.now();

                    while (Date.now() - startTime < maxWaitMs) {
                      await new Promise((res) => setTimeout(res, intervalMs));
                      const statusData = await getJobStatus(jobId);

                      if (statusData.status === "completed") {
                        const finalRes = await getInterviewReportById(statusData.interviewId || interviewId);
                        setReport(finalRes.interviewReport);
                        return { interviewReport: finalRes.interviewReport };
                      }

                      if (statusData.status === "failed") {
                        throw new Error(statusData.error || "Interview report generation failed");
                      }
                    }

                    throw new Error("Report generation timed out. Please check your reports dashboard.");
                  }

                  return response;
          }
          catch(err){
              console.log(err)
              throw err;
          }
          finally{
              setLoading(false)
          }
    }

    const getReportbyId = async ({ interviewId }) => {
           setLoading(true)

           try{
                  const response = await getInterviewReportById(interviewId)
                  setReport(response.interviewReport)
                  return response
          }
          catch(err){
                  console.log(err)
                  throw err;
          }
          finally{
                 setLoading(false)
          }
    }

    const getAllReports = async () => {
           setLoading(true)
           try{
                  const response = await getAllInterviewReports()
                  setReports(response.interviewReports)
                  return response
           }
           catch(err){
                  console.log(err)
                  throw err;
           }
           finally{
                  setLoading(false)
           }
    }

    const getAllGeneratedResumes = async () => {
           try {
                  const response = await getGeneratedResumes()
                  setGeneratedResumes(response.generatedResumes)
                  return response
           }
           catch(err) {
                  console.log(err)
                  throw err
           }
    }

    const renameReport = async ({ interviewId, title }) => {
           try {
                  const response = await renameInterviewReport(interviewId, title)
                  setReports(prev => prev.map(r => r._id === interviewId ? { ...r, title } : r))
                  if (report && report._id === interviewId) {
                      setReport(prev => ({ ...prev, title }))
                  }
                  return response
           }
           catch(err) {
                  console.log(err)
                  throw err;
           }
    }

    const deleteReport = async ({ interviewId }) => {
           try {
                  const response = await deleteInterviewReport(interviewId)
                  setReports(prev => prev.filter(r => r._id !== interviewId))
                  if (report && report._id === interviewId) {
                      setReport(null)
                  }
                  return response
           }
           catch(err) {
                  console.log(err)
                  throw err;
           }
    }

    const generateResumePreviewBlob = async ({ interviewReportId }) => {
           try {
                  return await generateResumePreview(interviewReportId)
           }
           catch(err) {
                  console.error("Error generating resume preview:", err)
                  throw err
           }
    }

    const saveGeneratedResume = async ({ interviewReportId, pdfBlob, fileName }) => {
           try {
                  const response = await saveGeneratedResumeApi(interviewReportId, pdfBlob, fileName)
                  return response.generatedResume
           }
           catch(err) {
                  console.error("Error saving generated resume:", err)
                  throw err
           }
    }

    const fetchResumePdfBlob = async ({ resumeId }) => {
           try {
                  const blob = await downloadResumePdf(resumeId)
                  return blob
           }
           catch(err) {
                  console.error("Error fetching resume blob:", err)
                  throw err
           }
    }

    const downloadResume = async ({ resumeId, filename }) => {
           try {
                  const blob = await downloadResumePdf(resumeId)
                  const url = window.URL.createObjectURL(new Blob([blob], { type: 'application/pdf' }))
                  const link = document.createElement('a')
                  link.href = url
                  link.setAttribute('download', filename || `ResumeIQ_Tailored_Resume_${resumeId?.slice(-6) || 'latest'}.pdf`)
                  document.body.appendChild(link)
                  link.click()
                  link.parentNode.removeChild(link)
                  window.URL.revokeObjectURL(url)
                  return true
           }
          catch(err) {
                  console.error("Error downloading resume:", err)
                  throw err
           }
    }

    const deleteGeneratedResume = async ({ resumeId }) => {
           try {
                  const response = await deleteGeneratedResumeApi(resumeId)
                  setGeneratedResumes(prev => prev.filter(resume => resume._id !== resumeId))
                  return response
           }
           catch(err) {
                  console.error("Error deleting generated resume:", err)
                  throw err
           }
    }

    return {
        loading,
        report,
        reports,
       generatedResumes: context.generatedResumes,
        generateInterviewReport,
        getReportbyId,
        getAllReports,
       getAllGeneratedResumes,
        renameReport,
        deleteReport,
        fetchResumePdfBlob,
       generateResumePreviewBlob,
       saveGeneratedResume,
       deleteGeneratedResume,
        downloadResume
    }
}

export default useInterview