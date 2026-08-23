import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router';
import Navbar from '../components/Navbar';
import useInterview from '../../interview/hooks/useInterview';
import '../styles/home.scss';

/* ── SVG Icons ── */
const IconBriefcase = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="2" y="7" width="20" height="14" rx="2" ry="2" />
    <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" />
  </svg>
);

const IconUser = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
    <circle cx="12" cy="7" r="4" />
  </svg>
);

const IconUpload = () => (
  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
    <polyline points="17 8 12 3 7 8" />
    <line x1="12" y1="3" x2="12" y2="15" />
  </svg>
);

const IconFile = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
    <polyline points="14 2 14 8 20 8" />
  </svg>
);

const IconX = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <line x1="18" y1="6" x2="6" y2="18" />
    <line x1="6" y1="6" x2="18" y2="18" />
  </svg>
);

const IconArrowRight = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <line x1="5" y1="12" x2="19" y2="12" />
    <polyline points="12 5 19 12 12 19" />
  </svg>
);

const IconWarning = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
    <line x1="12" y1="9" x2="12" y2="13" />
    <line x1="12" y1="17" x2="12.01" y2="17" />
  </svg>
);

const IconCheck = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="20 6 9 17 4 12" />
  </svg>
);

const IconZap = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
  </svg>
);

const IconCpu = () => (
  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <rect x="4" y="4" width="16" height="16" rx="2" ry="2" />
    <rect x="9" y="9" width="6" height="6" />
    <line x1="9" y1="1" x2="9" y2="4" />
    <line x1="15" y1="1" x2="15" y2="4" />
    <line x1="9" y1="20" x2="9" y2="23" />
    <line x1="15" y1="20" x2="15" y2="23" />
    <line x1="20" y1="9" x2="23" y2="9" />
    <line x1="20" y1="14" x2="23" y2="14" />
    <line x1="1" y1="9" x2="4" y2="9" />
    <line x1="1" y1="14" x2="4" y2="14" />
  </svg>
);

const IconPlus = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <line x1="12" y1="5" x2="12" y2="19" />
    <line x1="5" y1="12" x2="19" y2="12" />
  </svg>
);

const IconClock = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10" />
    <polyline points="12 6 12 12 16 14" />
  </svg>
);

const IconEdit = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
    <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
  </svg>
);

const IconTrash = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="3 6 5 6 21 6" />
    <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
  </svg>
);

const IconEye = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7z" />
    <circle cx="12" cy="12" r="3" />
  </svg>
);

const IconDownload = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
    <polyline points="7 10 12 15 17 10" />
    <line x1="12" y1="15" x2="12" y2="3" />
  </svg>
);

const IconEmpty = () => (
  <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
    <polyline points="14 2 14 8 20 8" />
    <line x1="9" y1="15" x2="15" y2="15" />
  </svg>
);

const formatFilename = (name) => {
  if (!name) return 'Untitled Document';
  return name
    .replace(/\.[^/.]+$/, '') // Remove extension
    .replace(/[_-]+/g, ' ')   // Replace underscores/hyphens with spaces
    .replace(/\s+/g, ' ')     // Remove extra spaces
    .trim();
};

export default function Home() {
  const { generateInterviewReport, getAllReports, reports, renameReport, deleteReport, getAllGeneratedResumes, generatedResumes, fetchResumePdfBlob, downloadResume, deleteGeneratedResume } = useInterview();

  const navigate = useNavigate();
  const [jobDescription, setJobDescription] = useState('');
  const [selfDescription, setSelfDescription] = useState('');
  const resumeInputRef = useRef();
  const [loading, setLoading] = useState(false);
  const [loadingStep, setLoadingStep] = useState(1);
  const [error, setError] = useState('');
  const [file, setFile] = useState(null);
  const [dragActive, setDragActive] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [reportsLoading, setReportsLoading] = useState(true);
  const [editingId, setEditingId] = useState(null);
  const [editingTitle, setEditingTitle] = useState('');
  const [deletingId, setDeletingId] = useState(null);
  const [resumesLoading, setResumesLoading] = useState(true);
  const [deletingResumeId, setDeletingResumeId] = useState(null);
  const [previewResume, setPreviewResume] = useState(null);

  // Fetch recent reports on mount
  useEffect(() => {
    getAllReports()
      .catch(() => {})
      .finally(() => setReportsLoading(false));
  }, []);

  useEffect(() => {
    getAllGeneratedResumes()
      .catch(() => {})
      .finally(() => setResumesLoading(false));
  }, []);

  useEffect(() => {
    const closePreviewOnEscape = (e) => {
      if (e.key === 'Escape') setPreviewResume(null);
    };

    document.addEventListener('keydown', closePreviewOnEscape);
    return () => document.removeEventListener('keydown', closePreviewOnEscape);
  }, []);

  useEffect(() => {
    return () => {
      if (previewResume?.url) window.URL.revokeObjectURL(previewResume.url);
    };
  }, [previewResume]);

  const handleStartRename = (e, report) => {
    e.stopPropagation();
    setEditingId(report._id);
    setEditingTitle(report.title || '');
    setDeletingId(null);
  };

  const handleSaveRename = async (e, interviewId) => {
    e.preventDefault();
    e.stopPropagation();
    if (!editingTitle.trim()) return;

    try {
      await renameReport({ interviewId, title: editingTitle.trim() });
      setEditingId(null);
    } catch (err) {
      console.error(err);
    }
  };

  const handleDelete = async (e, interviewId) => {
    e.stopPropagation();
    try {
      await deleteReport({ interviewId });
      setDeletingId(null);
    } catch (err) {
      console.error(err);
    }
  };

  const handlePreviewResume = async (e, resume) => {
    e.stopPropagation();
    try {
      const blob = await fetchResumePdfBlob({ resumeId: resume._id });
      const url = window.URL.createObjectURL(blob);
      setPreviewResume({ fileName: resume.fileName, url });
    } catch (err) {
      console.error(err);
    }
  };

  const closeResumePreview = () => {
    setPreviewResume(null);
  };

  const handleDownloadResume = async (e, resume) => {
    e.stopPropagation();
    try {
      await downloadResume({ resumeId: resume._id, filename: resume.fileName });
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteResume = async (e, resumeId) => {
    e.stopPropagation();
    try {
      await deleteGeneratedResume({ resumeId });
      setDeletingResumeId(null);
    } catch (err) {
      console.error(err);
    }
  };

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];
      if (selectedFile.size > 3 * 1024 * 1024) {
        setError('File size exceeds 3MB limit.');
        return;
      }
      if (selectedFile.type !== 'application/pdf' || !/\.pdf$/i.test(selectedFile.name)) {
        setError('Only PDF resume files are supported.');
        return;
      }
      setError('');
      setFile(selectedFile);
    }
  };

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const droppedFile = e.dataTransfer.files[0];
      if (droppedFile.size > 3 * 1024 * 1024) {
        setError('File size exceeds 3MB limit.');
        return;
      }
      if (droppedFile.type !== 'application/pdf' || !/\.pdf$/i.test(droppedFile.name)) {
        setError('Only PDF resume files are supported.');
        return;
      }
      setError('');
      setFile(droppedFile);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const uploadedFile = file || resumeInputRef.current?.files?.[0];

    if (!jobDescription.trim()) {
      setError('Please provide a job description.');
      return;
    }
    if (!uploadedFile) {
      setError('Please upload your resume (PDF only).');
      return;
    }

    setError('');
    setLoading(true);
    setLoadingStep(1);

    const stepInterval = setInterval(() => {
      setLoadingStep((prev) => (prev < 3 ? prev + 1 : prev));
    }, 4000);

    try {
      const response = await generateInterviewReport({
        jobDescription,
        selfDescription,
        resumeFile: uploadedFile
      });
      clearInterval(stepInterval);

      if (response && response.interviewReport && response.interviewReport._id) {
        navigate(`/interview/${response.interviewReport._id}`);
      } else {
        setError('Report generation failed. Please try again.');
        setLoading(false);
      }
    } catch (err) {
      clearInterval(stepInterval);
      console.error(err);
      setError(err.response?.data?.message || 'Failed to generate report. Make sure Groq API key is valid.');
      setLoading(false);
    }
  };

  const getNormalizedScore = (s) => {
    let raw = s || 0;
    if (raw > 0 && raw <= 1) raw = raw * 100;
    return Math.round(raw);
  };

  const getScoreColor = (s) => {
    const score = getNormalizedScore(s);
    if (score >= 80) return 'score-high';
    if (score >= 60) return 'score-mid';
    return 'score-low';
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return '';
    const d = new Date(dateStr);
    const now = new Date();
    const diffMs = now - d;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins} min${diffMins > 1 ? 's' : ''} ago`;
    if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays} days ago`;
    
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  return (
    <div className="hm-page">
      <Navbar />

      <main className="hm-content">
        <section className="hm-hero">
          <div className="hm-hero-badge">
            <span className="hm-badge-dot" />
            <span>AI-Powered Career Assistant</span>
          </div>
          <h1>
            Your Interview <span className="hm-accent">Command Center</span>
          </h1>
          <p>
            Generate AI-powered interview reports, track your preparation progress, and ace your next interview.
          </p>
        </section>

        {/* ── Dashboard Layout ── */}
        <div className="hm-dashboard">

          {/* ── Generate New Report Section ── */}
          {!showForm ? (
            <button
              className="hm-new-report-trigger"
              onClick={() => setShowForm(true)}
            >
              <div className="hm-trigger-icon">
                <IconPlus />
              </div>
              <div className="hm-trigger-content">
                <h3>Generate New Report</h3>
                <p>Upload your resume and job description to get AI-powered insights</p>
              </div>
              <IconArrowRight />
            </button>
          ) : (
            <div className="hm-form-section">
              <div className="hm-form-header">
                <h2>Generate New Report</h2>
                <button
                  type="button"
                  className="hm-form-close"
                  onClick={() => { setShowForm(false); setError(''); }}
                >
                  <IconX />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="hm-form-grid">
                {/* LEFT COLUMN */}
                <div className="hm-form-left">
                  <div className="hm-card">
                    <div className="hm-card-label">
                      <span className="hm-label-title">
                        <IconBriefcase />
                        <span>Job Description</span>
                        <span className="hm-required">*</span>
                      </span>
                      <span className="hm-char-count">{jobDescription.length} chars</span>
                    </div>
                    <textarea
                      placeholder="Paste the target job description here (role, responsibilities, required skills)..."
                      value={jobDescription}
                      onChange={(e) => setJobDescription(e.target.value)}
                      rows={6}
                      required
                    />
                  </div>

                  <div className="hm-card">
                    <div className="hm-card-label">
                      <span className="hm-label-title">
                        <IconUser />
                        <span>Self Description</span>
                        <span className="hm-optional">Optional</span>
                      </span>
                      <span className="hm-char-count">{selfDescription.length} chars</span>
                    </div>
                    <textarea
                      placeholder="Tell us about your key achievements, career goals, or background highlights..."
                      value={selfDescription}
                      onChange={(e) => setSelfDescription(e.target.value)}
                      rows={4}
                    />
                  </div>
                </div>

                {/* RIGHT COLUMN */}
                <div className="hm-form-right">
                  <div className="hm-card hm-upload-card">
                    <div className="hm-card-label">
                      <span className="hm-label-title">
                        <IconFile />
                        <span>Upload Resume</span>
                        <span className="hm-required">*</span>
                      </span>
                    </div>

                    <div
                      className={`hm-dropzone ${dragActive ? 'drag-active' : ''}`}
                      onDragEnter={handleDrag}
                      onDragLeave={handleDrag}
                      onDragOver={handleDrag}
                      onDrop={handleDrop}
                    >
                      <input
                        type="file"
                        accept=".pdf,application/pdf"
                        ref={resumeInputRef}
                        onChange={handleFileChange}
                      />
                      <div className="hm-drop-icon"><IconUpload /></div>
                      <div className="hm-drop-title">Drop your resume here</div>
                      <div className="hm-drop-sub">
                        or <span>click to browse</span> from device
                      </div>
                        <div className="hm-drop-limits">Supports PDF only (Max 3MB)</div>
                    </div>

                    {file && (
                      <div className="hm-file-preview">
                        <div className="hm-file-info">
                          <span className="hm-file-icon"><IconFile /></span>
                          <div>
                            <div className="hm-file-name">{file.name}</div>
                            <div className="hm-file-size">{(file.size / (1024 * 1024)).toFixed(2)} MB</div>
                          </div>
                        </div>
                        <button
                          type="button"
                          className="hm-remove-file"
                          onClick={() => setFile(null)}
                          title="Remove file"
                        >
                          <IconX />
                        </button>
                      </div>
                    )}
                  </div>

                  <div className="hm-card hm-action-card">
                    <h3>Ready for Analysis?</h3>
                    <p>Groq AI will generate a complete evaluation and custom roadmap.</p>
                    <button
                      type="submit"
                      className="hm-submit-btn"
                      disabled={loading}
                    >
                      {loading ? (
                        <>
                          <span className="hm-btn-spinner" />
                          Generating...
                        </>
                      ) : (
                        <>
                          Generate AI Report
                          <IconArrowRight />
                        </>
                      )}
                    </button>

                    {error && (
                      <div className="hm-error">
                        <IconWarning />
                        <span>{error}</span>
                      </div>
                    )}
                  </div>
                </div>
              </form>
            </div>
          )}

          {/* ── Recent Reports Section ── */}
          <section className="hm-reports-section">
            <div className="hm-reports-header">
              <h2>Recent Reports</h2>
              {reports && reports.length > 0 && (
                <span className="hm-reports-count">{reports.length} report{reports.length !== 1 ? 's' : ''}</span>
              )}
            </div>

            {reportsLoading ? (
              <div className="hm-reports-loading">
                <div className="hm-btn-spinner" />
                <span>Loading reports...</span>
              </div>
            ) : !reports || reports.length === 0 ? (
              <div className="hm-empty-state">
                <div className="hm-empty-icon"><IconEmpty /></div>
                <h3>No reports yet</h3>
                <p>Generate your first AI interview report to see it here.</p>
                {!showForm && (
                  <button className="hm-empty-cta" onClick={() => setShowForm(true)}>
                    <IconPlus />
                    <span>Create Your First Report</span>
                  </button>
                )}
              </div>
            ) : (
              <div className="hm-reports-grid">
                {reports.map((report) => (
                  <div
                    key={report._id}
                    className="hm-report-card"
                    onClick={() => navigate(`/interview/${report._id}`)}
                  >
                    <div className="hm-report-top">
                      <div className={`hm-score-badge ${getScoreColor(report.matchScore)}`}>
                        {getNormalizedScore(report.matchScore)}%
                      </div>
                      <div className="hm-card-actions" onClick={(e) => e.stopPropagation()}>
                        {deletingId === report._id ? (
                          <div className="hm-delete-confirm">
                            <span>Delete?</span>
                            <button
                              type="button"
                              className="hm-confirm-btn"
                              onClick={(e) => handleDelete(e, report._id)}
                              title="Confirm delete"
                            >
                              Yes
                            </button>
                            <button
                              type="button"
                              className="hm-cancel-btn"
                              onClick={(e) => { e.stopPropagation(); setDeletingId(null); }}
                              title="Cancel"
                            >
                              No
                            </button>
                          </div>
                        ) : (
                          <>
                            <button
                              type="button"
                              className="hm-action-icon-btn"
                              onClick={(e) => handleStartRename(e, report)}
                              title="Rename report"
                            >
                              <IconEdit />
                            </button>
                            <button
                              type="button"
                              className="hm-action-icon-btn delete"
                              onClick={(e) => { e.stopPropagation(); setDeletingId(report._id); }}
                              title="Delete report"
                            >
                              <IconTrash />
                            </button>
                          </>
                        )}
                      </div>
                    </div>

                    {editingId === report._id ? (
                      <form className="hm-rename-form" onSubmit={(e) => handleSaveRename(e, report._id)} onClick={(e) => e.stopPropagation()}>
                        <input
                          type="text"
                          className="hm-rename-input"
                          value={editingTitle}
                          onChange={(e) => setEditingTitle(e.target.value)}
                          autoFocus
                          required
                        />
                        <button type="submit" className="hm-rename-btn save" title="Save">
                          <IconCheck />
                        </button>
                        <button type="button" className="hm-rename-btn cancel" onClick={() => setEditingId(null)} title="Cancel">
                          <IconX />
                        </button>
                      </form>
                    ) : (
                      <h4 className="hm-report-title" title={report.title || 'Untitled Report'}>{report.title || 'Untitled Report'}</h4>
                    )}

                    <div className="hm-report-meta">
                      <IconClock />
                      <span>{formatDate(report.createdAt)}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>

          {/* ── Recently Generated Resumes Section ── */}
          <section className="hm-resumes-section">
            <div className="hm-reports-header">
              <h2>Recently Generated Resumes</h2>
              {generatedResumes && generatedResumes.length > 0 && (
                <span className="hm-reports-count">{generatedResumes.length} resume{generatedResumes.length !== 1 ? 's' : ''}</span>
              )}
            </div>

            {resumesLoading ? (
              <div className="hm-reports-loading">
                <div className="hm-btn-spinner" />
                <span>Loading resumes...</span>
              </div>
            ) : !generatedResumes || generatedResumes.length === 0 ? (
              <div className="hm-empty-state">
                <div className="hm-empty-icon"><IconEmpty /></div>
                <h3>No generated resumes yet</h3>
                <p>Your tailored resumes will appear here after you generate them.</p>
              </div>
            ) : (
              <div className="hm-reports-grid">
                {generatedResumes.map((resume) => (
                  <div key={resume._id} className="hm-report-card hm-resume-card">
                    <div className="hm-report-top">
                      <span className="hm-resume-file-icon"><IconFile /></span>
                      <div className="hm-card-actions" onClick={(e) => e.stopPropagation()}>
                        {deletingResumeId === resume._id ? (
                          <div className="hm-delete-confirm">
                            <span>Delete?</span>
                            <button type="button" className="hm-confirm-btn" onClick={(e) => handleDeleteResume(e, resume._id)} title="Confirm delete">Yes</button>
                            <button type="button" className="hm-cancel-btn" onClick={(e) => { e.stopPropagation(); setDeletingResumeId(null); }} title="Cancel">No</button>
                          </div>
                        ) : (
                          <button
                            type="button"
                            className="hm-action-icon-btn delete"
                            onClick={(e) => { e.stopPropagation(); setDeletingResumeId(resume._id); }}
                            title="Delete resume"
                          >
                            <IconTrash />
                          </button>
                        )}
                      </div>
                    </div>

                    <h4 className="hm-report-title" title={resume.fileName}>{formatFilename(resume.fileName)}</h4>
                    <div className="hm-report-meta">
                      <IconClock />
                      <span>{formatDate(resume.createdAt)}</span>
                    </div>
                    <div className="hm-resume-card-actions">
                      <button type="button" className="hm-resume-text-action" onClick={(e) => handlePreviewResume(e, resume)}>
                        <IconEye />
                        <span>Preview</span>
                      </button>
                      <button type="button" className="hm-resume-text-action" onClick={(e) => handleDownloadResume(e, resume)}>
                        <IconDownload />
                        <span>Download</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>
        </div>
      </main>

      {previewResume && (
        <div className="hm-resume-preview-overlay" onClick={closeResumePreview}>
          <div className="hm-resume-preview-modal" onClick={(e) => e.stopPropagation()}>
            <div className="hm-resume-preview-header">
              <div>
                <span className="hm-resume-preview-label">Resume Preview</span>
                <h2>{formatFilename(previewResume.fileName)}</h2>
              </div>
              <button
                type="button"
                className="hm-form-close"
                onClick={closeResumePreview}
                title="Close preview"
                aria-label="Close preview"
              >
                <IconX />
              </button>
            </div>
            <iframe
              src={`${previewResume.url}#toolbar=0&navpanes=0`}
              className="hm-resume-preview-frame"
              title={`Preview of ${formatFilename(previewResume.fileName)}`}
            />
          </div>
        </div>
      )}

      {/* LOADING MODAL */}
      {loading && (
        <div className="hm-modal-overlay">
          <div className="hm-modal">
            <div className="hm-modal-icon"><IconCpu /></div>
            <h2>Analyzing Profile & Job Match</h2>
            <p>Our Groq LLM model is generating your custom report (~20 sec)...</p>

            <div className="hm-steps">
              <div className={`hm-step ${loadingStep >= 1 ? 'active' : ''} ${loadingStep > 1 ? 'done' : ''}`}>
                <span className="hm-step-icon">
                  {loadingStep > 1 ? <IconCheck /> : <IconZap />}
                </span>
                <span>Parsing resume text & job requirements...</span>
              </div>
              <div className={`hm-step ${loadingStep >= 2 ? 'active' : ''} ${loadingStep > 2 ? 'done' : ''}`}>
                <span className="hm-step-icon">
                  {loadingStep > 2 ? <IconCheck /> : <IconZap />}
                </span>
                <span>Calculating match score & skill gaps...</span>
              </div>
              <div className={`hm-step ${loadingStep >= 3 ? 'active' : ''}`}>
                <span className="hm-step-icon"><IconZap /></span>
                <span>Crafting technical & STAR behavioral questions...</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
