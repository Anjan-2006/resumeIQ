import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router';
import useInterview from '../hooks/useInterview';
import { ResumeIQLogo } from '../../auth/components/Navbar';
import '../style/interview.scss';

const IconArrowLeft = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <line x1="19" y1="12" x2="5" y2="12" />
    <polyline points="12 19 5 12 12 5" />
  </svg>
);

/* ── Inline SVG Icons (no emojis) ── */
const IconCode = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="16 18 22 12 16 6" />
    <polyline points="8 6 2 12 8 18" />
  </svg>
);

const IconChat = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
  </svg>
);

const IconMap = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polygon points="1 6 1 22 8 18 16 22 23 18 23 2 16 6 8 2 1 6" />
    <line x1="8" y1="2" x2="8" y2="18" />
    <line x1="16" y1="6" x2="16" y2="22" />
  </svg>
);

const IconFileText = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
    <polyline points="14 2 14 8 20 8" />
    <line x1="16" y1="13" x2="8" y2="13" />
    <line x1="16" y1="17" x2="8" y2="17" />
    <polyline points="10 9 9 9 8 9" />
  </svg>
);

const IconDownload = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
    <polyline points="7 10 12 15 17 10" />
    <line x1="12" y1="15" x2="12" y2="3" />
  </svg>
);

const IconMaximize = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="15 3 21 3 21 9" />
    <polyline points="9 21 3 21 3 15" />
    <line x1="21" y1="3" x2="14" y2="10" />
    <line x1="3" y1="21" x2="10" y2="14" />
  </svg>
);

const IconMinimize = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="4 14 10 14 10 20" />
    <polyline points="20 10 14 10 14 4" />
    <line x1="10" y1="14" x2="3" y2="21" />
    <line x1="14" y1="10" x2="21" y2="3" />
  </svg>
);

const IconSparkles = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 3l1.912 4.936a2 2 0 0 0 1.152 1.152L20 11l-4.936 1.912a2 2 0 0 0-1.152 1.152L12 19l-1.912-4.936a2 2 0 0 0-1.152-1.152L4 11l4.936-1.912a2 2 0 0 0 1.152-1.152L12 3z" />
  </svg>
);

const IconShieldCheck = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
    <polyline points="9 12 11 14 15 10" />
  </svg>
);

const IconLayers = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polygon points="12 2 2 7 12 12 22 7 12 2" />
    <polyline points="2 17 12 22 22 17" />
    <polyline points="2 12 12 17 22 12" />
  </svg>
);

const IconCheckCircle = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
    <polyline points="22 4 12 14.01 9 11.01" />
  </svg>
);

const IconRefresh = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="23 4 23 10 17 10" />
    <polyline points="1 20 1 14 7 14" />
    <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15" />
  </svg>
);

const IconChevron = ({ isOpen }) => (
  <svg
    width="16"
    height="16"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2.5"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={`chevron-icon ${isOpen ? 'rotated' : ''}`}
  >
    <polyline points="6 9 12 15 18 9" />
  </svg>
);

const IconTarget = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10" />
    <circle cx="12" cy="12" r="6" />
    <circle cx="12" cy="12" r="2" />
  </svg>
);

const IconCheck = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="20 6 9 17 4 12" />
  </svg>
);

const IconAlert = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
    <line x1="12" y1="9" x2="12" y2="13" />
    <line x1="12" y1="17" x2="12.01" y2="17" />
  </svg>
);

const tabs = [
  { key: 'technical', label: 'Technical', icon: IconCode },
  { key: 'behavioral', label: 'Behavioral', icon: IconChat },
  { key: 'roadmap', label: 'Roadmap', icon: IconMap },
  { key: 'resume', label: 'Tailored Resume', icon: IconFileText },
];

export default function Interview({ reportData }) {
  const { id } = useParams();
  const navigate = useNavigate();
  const { getReportbyId, generateResumePreviewBlob, saveGeneratedResume } = useInterview();
  const [data, setData] = useState(reportData || null);
  const [loading, setLoading] = useState(Boolean(id));
  const [reportError, setReportError] = useState('');

  const [activeTab, setActiveTab] = useState('technical');
  const [openQuestionIndex, setOpenQuestionIndex] = useState(null);

  // Resume State (Generate -> Live Preview -> Download)
  const [generatingResume, setGeneratingResume] = useState(false);
  const [resumeBlob, setResumeBlob] = useState(null);
  const [resumeBlobUrl, setResumeBlobUrl] = useState(null);
  const [savedResume, setSavedResume] = useState(null);
  const [savingResume, setSavingResume] = useState(false);
  const [resumeError, setResumeError] = useState('');
  const [isPreviewFullscreen, setIsPreviewFullscreen] = useState(false);
  const previewRef = useRef(null);

  // Interactive Roadmap Task Completion (Persisted in localStorage per report)
  const [completedTasks, setCompletedTasks] = useState({});

  useEffect(() => {
    if (id) {
      setLoading(true);
      getReportbyId({ interviewId: id })
        .then((res) => {
          if (res && res.interviewReport) {
            setData(res.interviewReport);
            setReportError('');
          } else {
            setData(null);
            setReportError('This interview report could not be found.');
          }
        })
        .catch(() => {
          setData(null);
          setReportError('Unable to load this interview report.');
        })
        .finally(() => setLoading(false));
    } else if (reportData) {
      setData(reportData);
      setReportError('');
    } else {
      setData(null);
      setReportError('No interview report was selected.');
    }
  }, [id, reportData]);

  const report = data || {};
  const currentReportId = id || report?._id;

  // Load saved roadmap checklist from localStorage whenever current report changes
  useEffect(() => {
    if (currentReportId) {
      const saved = localStorage.getItem(`resumeiq_roadmap_${currentReportId}`);
      if (saved) {
        try {
          setCompletedTasks(JSON.parse(saved));
        } catch (e) {
          console.error("Failed to parse saved roadmap tasks", e);
        }
      } else {
        setCompletedTasks({});
      }
    }
  }, [currentReportId]);

  // Clean up blob URL on unmount
  useEffect(() => {
    return () => {
      if (resumeBlobUrl) {
        URL.revokeObjectURL(resumeBlobUrl);
      }
    };
  }, [resumeBlobUrl]);

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsPreviewFullscreen(document.fullscreenElement === previewRef.current);
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, []);

  const rawScore = report.matchScore || 0;
  const score = Math.round(rawScore > 0 && rawScore <= 1 ? rawScore * 100 : rawScore);
  const radius = 44;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (score / 100) * circumference;

  const techQs = report.technicalQuestions || [];
  const behavQs = report.behaviouralQuestions || [];
  const gaps = report.skillGaps || [];
  const roadmap = report.preparationPlanSchema || report.preparationPlan || [];

  // Count total and completed tasks
  const totalRoadmapTasks = roadmap.reduce((acc, curr) => acc + (curr.tasks?.length || 0), 0);
  const completedRoadmapTasksCount = Object.values(completedTasks).filter(Boolean).length;
  const roadmapProgressPct = totalRoadmapTasks > 0 ? Math.round((completedRoadmapTasksCount / totalRoadmapTasks) * 100) : 0;

  const toggleTask = (dayIdx, taskIdx) => {
    const taskKey = `${dayIdx}-${taskIdx}`;
    setCompletedTasks(prev => {
      const updated = {
        ...prev,
        [taskKey]: !prev[taskKey]
      };
      if (currentReportId) {
        localStorage.setItem(`resumeiq_roadmap_${currentReportId}`, JSON.stringify(updated));
      }
      return updated;
    });
  };

  const toggleQuestion = (idx) => {
    setOpenQuestionIndex(prev => (prev === idx ? null : idx));
  };

  // Step 1: Generate Resume & Create Live Preview Blob URL
  const handleGenerateResume = async () => {
    if (!currentReportId) {
      setResumeError('Report ID is required to generate the tailored resume.');
      return;
    }

    setGeneratingResume(true);
    setResumeError('');
    setSavedResume(null);

    try {
      const blob = await generateResumePreviewBlob({ interviewReportId: currentReportId });
      if (!(blob instanceof Blob) || blob.size === 0 || (blob.type && blob.type !== 'application/pdf')) {
        throw new Error('The server returned an invalid resume PDF.');
      }
      setResumeBlob(blob);
      if (resumeBlobUrl) {
        URL.revokeObjectURL(resumeBlobUrl);
      }
      const url = URL.createObjectURL(new Blob([blob], { type: 'application/pdf' }));
      setResumeBlobUrl(url);
    } catch (err) {
      console.error("Resume generation failed:", err);
      setResumeError(err.response?.data?.message || 'Failed to generate tailored resume PDF. Please check server logs.');
    } finally {
      setGeneratingResume(false);
    }
  };

  const handleSaveResume = async () => {
    if (!currentReportId || !resumeBlob) return;

    setSavingResume(true);
    setResumeError('');

    try {
      const rawTitle = report.title || 'Tailored_Resume';
      const cleanTitle = rawTitle.replace(/[^a-zA-Z0-9_-]/g, '_');
      const fileName = `${cleanTitle}_Resume.pdf`;
      const generatedResume = await saveGeneratedResume({
        interviewReportId: currentReportId,
        pdfBlob: resumeBlob,
        fileName
      });
      setSavedResume(generatedResume);
    } catch (err) {
      console.error("Resume save failed:", err);
      setResumeError(err.response?.data?.message || 'Failed to save your resume. Please try again.');
    } finally {
      setSavingResume(false);
    }
  };

  // Step 2: Download the already-generated PDF with exact .pdf extension
  const handleDownloadPdf = () => {
    if (!resumeBlob) return;

    const rawTitle = report.title || 'Tailored_Resume';
    const cleanTitle = rawTitle.replace(/[^a-zA-Z0-9_-]/g, '_');
    const filename = savedResume?.fileName || `${cleanTitle}_Resume.pdf`;

    const downloadUrl = window.URL.createObjectURL(resumeBlob);

    const a = document.createElement('a');
    a.style.display = 'none';
    a.href = downloadUrl;
    a.download = filename;
    document.body.appendChild(a);
    a.click();

    setTimeout(() => {
      document.body.removeChild(a);
      window.URL.revokeObjectURL(downloadUrl);
    }, 400);
  };

  const handleTogglePreviewFullscreen = async () => {
    try {
      if (document.fullscreenElement) {
        await document.exitFullscreen();
      } else if (previewRef.current) {
        await previewRef.current.requestFullscreen();
      }
    } catch (err) {
      console.error("Unable to enlarge resume preview:", err);
      setResumeError('Unable to enlarge the resume preview in this browser.');
    }
  };

  const getScoreColor = (s) => {
    if (s >= 80) return '#10b981';
    if (s >= 60) return '#f59e0b';
    return '#ef4444';
  };

  const getScoreVerdict = (s) => {
    if (s >= 80) return 'Strong match';
    if (s >= 60) return 'Good match';
    return 'Needs work';
  };

  const getSeverityLabel = (sev) => {
    if (sev === 'high') return 'Critical';
    if (sev === 'medium') return 'Moderate';
    return 'Minor';
  };

  if (loading) {
    return (
      <div className="iv-wrapper">
        <div className="iv-loading">
          <div className="iv-loading-spinner" />
          <span>Loading report</span>
        </div>
      </div>
    );
  }

  if (reportError || !report) {
    return (
      <div className="iv-wrapper">
          <div className="iv-error-state">
          <IconAlert />
          <h1>Report unavailable</h1>
          <p>{reportError || 'The interview report could not be loaded.'}</p>
          <div className="iv-error-actions">
            {id && <button className="iv-resume-action-btn primary" onClick={() => window.location.reload()}>Try again</button>}
            <button className="iv-resume-action-btn secondary" onClick={() => navigate('/')}>Back to dashboard</button>
          </div>
        </div>
      </div>
    );
  }

  const activeQuestions = activeTab === 'technical' ? techQs : behavQs;
  const prefix = activeTab === 'technical' ? 'T' : 'B';

  return (
    <>
    <div className="iv-back-bar">
      <button className="iv-back-btn" onClick={() => navigate('/')}>
        <IconArrowLeft />
        <span>Back to Home</span>
      </button>
      <div className="iv-back-bar-brand">
        <ResumeIQLogo size={28} />
        <span className="iv-back-bar-name">Resume<span className="iv-back-bar-accent">IQ</span></span>
      </div>
      <div className="iv-back-bar-title">{report.title || 'Interview Report'}</div>
    </div>
    <div className="iv-wrapper">
      <div className="iv-shell">

        {/* ── Sidebar ── */}
        <aside className="iv-sidebar">
          <div className="iv-sidebar-label">Navigation</div>
          <nav className="iv-sidebar-nav">
            {tabs.map(tab => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.key}
                  className={`iv-nav-btn ${activeTab === tab.key ? 'active' : ''}`}
                  onClick={() => { setActiveTab(tab.key); setOpenQuestionIndex(null); }}
                >
                  <span className="iv-nav-icon"><Icon /></span>
                  <span className="iv-nav-label">{tab.label}</span>
                </button>
              );
            })}
          </nav>
        </aside>

        {/* ── Main Content ── */}
        <main className="iv-main">

          {/* Questions Tabs (Technical / Behavioral) */}
          {(activeTab === 'technical' || activeTab === 'behavioral') && (
            <section className="iv-section">
              <header className="iv-section-header">
                <h1>{activeTab === 'technical' ? 'Technical Questions' : 'Behavioral Questions'}</h1>
                <span className="iv-pill">{activeQuestions.length} questions</span>
              </header>

              <div className="iv-questions">
                {activeQuestions.map((q, idx) => {
                  const isOpen = openQuestionIndex === idx;
                  return (
                    <div key={idx} className={`iv-q-card ${isOpen ? 'expanded' : ''}`}>
                      <div className="iv-q-header" onClick={() => toggleQuestion(idx)}>
                        <span className="iv-q-number">{prefix}{idx + 1}</span>
                        <span className="iv-q-text">{q.question}</span>
                        <IconChevron isOpen={isOpen} />
                      </div>

                      <div className={`iv-q-body ${isOpen ? 'visible' : ''}`}>
                        {q.intention && (
                          <div className="iv-q-block intention">
                            <div className="iv-q-block-label">
                              <IconTarget />
                              <span>Intention</span>
                            </div>
                            <p>{q.intention}</p>
                          </div>
                        )}
                        <div className="iv-q-block answer">
                          <div className="iv-q-block-label">
                            <IconCheck />
                            <span>{activeTab === 'behavioral' ? 'STAR Method Answer' : 'Expected Answer'}</span>
                          </div>
                          <p>{q.answer}</p>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </section>
          )}

          {/* Roadmap Tab - Redesigned Timeline with Persistent Checklist */}
          {activeTab === 'roadmap' && (
            <section className="iv-section iv-roadmap-section">
              <header className="iv-section-header">
                <div>
                  <h1>Preparation Roadmap</h1>
                  <p className="iv-section-subtitle">
                    A personalized, day-by-day action plan tailored to bridge your skill gaps and target interview requirements.
                  </p>
                </div>
                <div className="iv-header-badges">
                  <span className="iv-pill">{roadmap.length} Days Plan</span>
                  <span className="iv-pill accent">{totalRoadmapTasks} Total Tasks</span>
                </div>
              </header>

              {/* Progress Summary Card */}
              <div className="iv-roadmap-tracker">
                <div className="iv-tracker-info">
                  <span className="iv-tracker-label">Your Study Progress</span>
                  <span className="iv-tracker-count">
                    <strong>{completedRoadmapTasksCount}</strong> / {totalRoadmapTasks} tasks completed ({roadmapProgressPct}%)
                  </span>
                </div>
                <div className="iv-tracker-bar">
                  <div
                    className="iv-tracker-fill"
                    style={{ width: `${roadmapProgressPct}%` }}
                  />
                </div>
              </div>

              {/* Modern Vertical Timeline */}
              <div className="iv-timeline">
                {roadmap.map((item, dayIdx) => {
                  const dayTasks = item.tasks || [];
                  const dayCompletedCount = dayTasks.filter((_, tIdx) => completedTasks[`${dayIdx}-${tIdx}`]).length;
                  const isDayFullyComplete = dayTasks.length > 0 && dayCompletedCount === dayTasks.length;

                  return (
                    <div key={dayIdx} className={`iv-timeline-step ${isDayFullyComplete ? 'completed' : ''}`}>
                      {/* Timeline Node */}
                      <div className="iv-timeline-node-container">
                        <div className={`iv-timeline-node ${isDayFullyComplete ? 'checked' : ''}`}>
                          {isDayFullyComplete ? <IconCheck /> : dayIdx + 1}
                        </div>
                        {dayIdx < roadmap.length - 1 && <div className="iv-timeline-line" />}
                      </div>

                      {/* Timeline Card */}
                      <div className="iv-timeline-card">
                        <div className="iv-timeline-card-header">
                          <div className="iv-timeline-day-pill">
                            <span>Day {item.day || dayIdx + 1}</span>
                          </div>
                          <div className="iv-timeline-task-status">
                            {dayCompletedCount}/{dayTasks.length} Done
                          </div>
                        </div>

                        <h3 className="iv-timeline-focus">{item.focus}</h3>

                        <div className="iv-timeline-tasks">
                          {dayTasks.map((task, taskIdx) => {
                            const isDone = Boolean(completedTasks[`${dayIdx}-${taskIdx}`]);
                            return (
                              <div
                                key={taskIdx}
                                className={`iv-timeline-task-item ${isDone ? 'done' : ''}`}
                                onClick={() => toggleTask(dayIdx, taskIdx)}
                              >
                                <div className={`iv-task-checkbox ${isDone ? 'checked' : ''}`}>
                                  {isDone && <IconCheck />}
                                </div>
                                <span className="iv-task-text">{task}</span>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </section>
          )}

          {/* Tailored Resume Tab - Clean Generate -> Preview -> Download Flow */}
          {activeTab === 'resume' && (
            <section className="iv-section iv-resume-section">
              <header className="iv-section-header">
                <div>
                  <h1>Tailored Resume</h1>
                  <p className="iv-section-subtitle">
                    Generate and preview a single-page ATS-optimized resume tailored specifically for {report.title || 'this role'}.
                  </p>
                </div>
                {resumeBlobUrl && <span className="iv-pill highlight">Preview Ready</span>}
              </header>

              {/* State 1: Generate CTA (When resume not generated yet) */}
              {!resumeBlobUrl ? (
                <div className="iv-resume-generate-card">
                  <div className="iv-resume-generate-icon">
                    <IconFileText />
                  </div>
                  <h2>Generate Your Tailored Resume</h2>
                  <p>
                    Our AI models will format your background into an executive LaTeX/Jake's style 1-page resume, highlighting matching skills for <strong>{report.title || 'this job'}</strong>.
                  </p>

                  <button
                    className="iv-resume-primary-btn"
                    onClick={handleGenerateResume}
                    disabled={generatingResume}
                  >
                    {generatingResume ? (
                      <>
                        <div className="iv-btn-spinner" />
                        <span>Please wait, generating your resume (this may take a little time)...</span>
                      </>
                    ) : (
                      <>
                        <IconSparkles />
                        <span>Generate Tailored Resume</span>
                      </>
                    )}
                  </button>

                  {resumeError && (
                    <div className="iv-resume-alert error">
                      <IconAlert />
                      <span>{resumeError}</span>
                    </div>
                  )}
                </div>
              ) : (
                /* State 2: Live Preview with Download & Regenerate Action Bar */
                <div className="iv-resume-preview-container">
                  <div className="iv-resume-action-bar">
                    <div className="iv-resume-status">
                      <IconCheckCircle />
                      <span>{savedResume ? 'Resume Saved' : 'Preview Ready - Review Before Saving'}</span>
                    </div>

                    <div className="iv-resume-btn-group">
                      <button
                        className="iv-resume-action-btn secondary"
                        onClick={handleGenerateResume}
                        disabled={generatingResume || savingResume}
                        title="Generate another preview"
                      >
                        {generatingResume ? (
                          <div className="iv-btn-spinner dark" />
                        ) : (
                          <IconRefresh />
                        )}
                        <span>{generatingResume ? 'Generating...' : 'Not satisfied - Try again'}</span>
                      </button>

                      {savedResume ? (
                        <button
                          className="iv-resume-action-btn primary"
                          onClick={handleDownloadPdf}
                        >
                          <IconDownload />
                          <span>Download PDF</span>
                        </button>
                      ) : (
                        <button
                          className="iv-resume-action-btn primary"
                          onClick={handleSaveResume}
                          disabled={savingResume || generatingResume}
                        >
                          {savingResume ? <div className="iv-btn-spinner" /> : <IconCheck />}
                          <span>{savingResume ? 'Saving...' : 'Looks good - Keep & Save'}</span>
                        </button>
                      )}

                      <button
                        className="iv-resume-action-btn preview-toggle"
                        onClick={handleTogglePreviewFullscreen}
                        title={isPreviewFullscreen ? 'Exit enlarged preview' : 'Enlarge preview'}
                        aria-label={isPreviewFullscreen ? 'Exit enlarged preview' : 'Enlarge preview'}
                      >
                        {isPreviewFullscreen ? <IconMinimize /> : <IconMaximize />}
                      </button>
                    </div>
                  </div>

                  {resumeError && (
                    <div className="iv-resume-alert error">
                      <IconAlert />
                      <span>{resumeError}</span>
                    </div>
                  )}

                  {/* Embedded PDF Live Preview */}
                  <div ref={previewRef} className="iv-resume-preview-wrapper">
                    <iframe
                      src={`${resumeBlobUrl}#toolbar=0&navpanes=0`}
                      className="iv-resume-iframe"
                      title="Tailored Resume Preview"
                    />
                  </div>
                </div>
              )}
            </section>
          )}
        </main>

        {/* ── Right Panel ── */}
        <aside className="iv-right">

          {/* Score Widget */}
          <div className="iv-widget">
            <div className="iv-widget-title">Match Score</div>
            <div className="iv-score-ring">
              <svg width="120" height="120" viewBox="0 0 120 120">
                <circle className="iv-ring-bg" cx="60" cy="60" r={radius} />
                <circle
                  className="iv-ring-progress"
                  cx="60"
                  cy="60"
                  r={radius}
                  style={{
                    strokeDasharray: circumference,
                    strokeDashoffset: strokeDashoffset,
                    stroke: getScoreColor(score)
                  }}
                />
              </svg>
              <div className="iv-score-value">
                {score}<span className="iv-score-pct">%</span>
              </div>
            </div>
            <div className="iv-score-label" style={{ color: getScoreColor(score) }}>
              {getScoreVerdict(score)}
            </div>
          </div>

          {/* Skill Gaps Widget */}
          <div className="iv-widget">
            <div className="iv-widget-title">Skill Gaps</div>
            <div className="iv-gaps">
              {gaps.map((gap, idx) => {
                const sev = (gap.severity || 'medium').toLowerCase();
                return (
                  <div key={idx} className={`iv-gap-item ${sev}`}>
                    <div className="iv-gap-severity">
                      <IconAlert />
                      <span>{getSeverityLabel(sev)}</span>
                    </div>
                    <div className="iv-gap-text">{gap.skills}</div>
                  </div>
                );
              })}
            </div>
          </div>
        </aside>

      </div>
    </div>
    </>
  );
}
