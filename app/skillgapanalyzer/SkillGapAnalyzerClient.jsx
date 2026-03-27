"use client";

import { useState } from "react";
import { toast } from "sonner";

// T026: Multi-step AI loading labels
const AI_LOADING_STEPS = [
  "Reading your resume…",
  "Comparing with job requirements…",
  "Searching for learning resources…",
  "Generating your roadmap…",
];

// T030: Validation helpers
const MAX_PDF_SIZE_MB = 5;
const JD_MIN_LENGTH = 100;
const JD_MAX_LENGTH = 5000;

export default function SkillGapAnalyzerClient() {
  const [inputMethod, setInputMethod] = useState("form");
  const [skills, setSkills] = useState("");
  const [experience, setExperience] = useState("");
  const [currentRole, setCurrentRole] = useState("");
  const [resume, setResume] = useState(null);
  const [jobDescription, setJobDescription] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [aiLoadingStep, setAiLoadingStep] = useState(0);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  // T030: inline validation errors
  const [validationErrors, setValidationErrors] = useState({});

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (file.type !== "application/pdf") {
      setValidationErrors(prev => ({ ...prev, resume: "Please upload a PDF file only." }));
      e.target.value = "";
      return;
    }
    if (file.size > MAX_PDF_SIZE_MB * 1024 * 1024) {
      setValidationErrors(prev => ({ ...prev, resume: `PDF must be under ${MAX_PDF_SIZE_MB}MB.` }));
      e.target.value = "";
      return;
    }
    setValidationErrors(prev => ({ ...prev, resume: null }));
    setResume(file);
  };

  // T030: validate before API call, show inline errors
  const validate = () => {
    const errors = {};
    if (inputMethod === "form") {
      if (!skills.trim()) errors.skills = "Skills are required.";
      if (!experience.trim()) errors.experience = "Years of experience is required.";
      if (!currentRole.trim()) errors.currentRole = "Current role or background is required.";
    } else {
      if (!resume) errors.resume = "Please upload your resume (PDF only, max 5MB).";
    }
    if (!jobDescription.trim()) {
      errors.jobDescription = "Please paste a job description.";
    } else if (jobDescription.trim().length < JD_MIN_LENGTH) {
      errors.jobDescription = `Job description is too short (${jobDescription.trim().length}/${JD_MIN_LENGTH} characters). Please paste the full job posting.`;
    } else if (jobDescription.trim().length > JD_MAX_LENGTH) {
      errors.jobDescription = `Job description is too long (max ${JD_MAX_LENGTH} characters). Please trim it down.`;
    }
    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleAnalyze = async () => {
    if (!validate()) return; // T030: abort if invalid — no API call

    setIsLoading(true);
    setAiLoadingStep(0);
    setError(null);
    setResult(null);

    // T026: cycle through AI loading steps
    const loadingInterval = setInterval(() => {
      setAiLoadingStep(prev => (prev + 1) % AI_LOADING_STEPS.length);
    }, 3000);

    try {
      const formData = new FormData();
      formData.append("jobDescription", jobDescription.trim());

      if (inputMethod === "upload") {
        formData.append("resume", resume);
      } else {
        const resumeText = `Skills: ${skills}\nExperience: ${experience}\nBackground: ${currentRole}`;
        formData.append("resumeText", resumeText);
      }

      const response = await fetch("/api/skillgap", {
        method: "POST",
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        const msg = data.error || "Analysis failed. Please try again.";
        setError(msg);
        toast.error(msg); // T025: Sonner instead of SweetAlert2
      } else {
        setResult(data.analysis);
        toast.success("Skill gap analysis complete!");
      }
    } catch {
      const msg = "Network error. Please check your connection and try again.";
      setError(msg);
      toast.error(msg);
    } finally {
      clearInterval(loadingInterval);
      setIsLoading(false);
    }
  };

  return (
    <main className="min-h-screen font-sans" style={{ backgroundColor: "#171717" }}>
      {/* Hero Section */}
      <section className="px-6 py-20 md:py-28 text-center max-w-5xl mx-auto">
        <h1
          className="text-4xl md:text-6xl font-bold mb-6 leading-tight text-balance"
          style={{
            background: "linear-gradient(135deg, #1e3a8a 0%, #60a5fa 100%)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            backgroundClip: "text",
          }}
        >
          Skill Gap Analyzer
        </h1>
        <p className="text-lg md:text-xl text-white/90 max-w-2xl mx-auto leading-relaxed text-pretty">
          Discover exactly which skills you need to land your dream job. Our
          intelligent analyzer compares your experience with job requirements to
          give you a personalized roadmap for success.
        </p>
      </section>

      {/* Skills & Experience Input Section */}
      <section className="px-6 py-16 max-w-4xl mx-auto">
        <div className="rounded-2xl p-8 md:p-12" style={{ backgroundColor: "#222222" }}>
          <h2
            className="text-2xl md:text-3xl font-bold mb-4 text-center"
            style={{
              background: "linear-gradient(135deg, #1e3a8a 0%, #60a5fa 100%)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              backgroundClip: "text",
            }}
          >
            Your Skills &amp; Experience
          </h2>
          <p className="text-white/80 text-center mb-8 max-w-xl mx-auto">
            Tell us about your current skills and experience. Choose one of the options below to get started.
          </p>

          {/* Input Method Toggle */}
          <div className="flex justify-center gap-4 mb-10">
            <button
              onClick={() => { setInputMethod("form"); setValidationErrors({}); }}
              className="px-6 py-3 rounded-lg font-medium transition-all duration-200"
              style={{ backgroundColor: inputMethod === "form" ? "#3b82f6" : "#333333", color: "white" }}
            >
              Fill the Form
            </button>
            <button
              onClick={() => { setInputMethod("upload"); setValidationErrors({}); }}
              className="px-6 py-3 rounded-lg font-medium transition-all duration-200"
              style={{ backgroundColor: inputMethod === "upload" ? "#3b82f6" : "#333333", color: "white" }}
            >
              Upload Resume
            </button>
          </div>

          {/* Option A: Fill the Form */}
          {inputMethod === "form" && (
            <div className="space-y-6">
              <div>
                <label className="block text-white font-medium mb-2">Your Skills</label>
                <p className="text-white/60 text-sm mb-3">
                  List your technical and soft skills, separated by commas
                </p>
                <textarea
                  value={skills}
                  onChange={(e) => { setSkills(e.target.value); setValidationErrors(prev => ({ ...prev, skills: null })); }}
                  placeholder="JavaScript, React, Node.js, Team Leadership, Agile..."
                  rows={4}
                  className="w-full px-4 py-3 rounded-lg text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                  style={{ backgroundColor: "#333333" }}
                />
                {validationErrors.skills && <p className="text-red-400 text-sm mt-1">{validationErrors.skills}</p>}
              </div>

              <div>
                <label className="block text-white font-medium mb-2">Years of Experience</label>
                <input
                  type="text"
                  value={experience}
                  onChange={(e) => { setExperience(e.target.value); setValidationErrors(prev => ({ ...prev, experience: null })); }}
                  placeholder="e.g., 5 years"
                  className="w-full px-4 py-3 rounded-lg text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                  style={{ backgroundColor: "#333333" }}
                />
                {validationErrors.experience && <p className="text-red-400 text-sm mt-1">{validationErrors.experience}</p>}
              </div>

              <div>
                <label className="block text-white font-medium mb-2">Current Role / Background</label>
                <input
                  type="text"
                  value={currentRole}
                  onChange={(e) => { setCurrentRole(e.target.value); setValidationErrors(prev => ({ ...prev, currentRole: null })); }}
                  placeholder="e.g., Frontend Developer at Tech Company"
                  className="w-full px-4 py-3 rounded-lg text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                  style={{ backgroundColor: "#333333" }}
                />
                {validationErrors.currentRole && <p className="text-red-400 text-sm mt-1">{validationErrors.currentRole}</p>}
              </div>
            </div>
          )}

          {/* Option B: Upload Resume */}
          {inputMethod === "upload" && (
            <div className="text-center">
              <div className="border-2 border-dashed border-white/30 rounded-xl p-10 hover:border-blue-500 transition-colors">
                <div className="mb-4">
                  <svg className="w-16 h-16 mx-auto text-white/50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                      d="M9 13h6m-3-3v6m5 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
                <label className="cursor-pointer">
                  <span className="px-6 py-3 rounded-lg font-medium inline-block mb-4 transition-all hover:opacity-90"
                    style={{ backgroundColor: "#3b82f6", color: "white" }}>
                    Choose PDF File
                  </span>
                  <input type="file" accept=".pdf,application/pdf" onChange={handleFileChange} className="hidden" />
                </label>
                <p className="text-white/60 text-sm">Upload your resume in PDF format only (max 5MB)</p>
                {resume && <p className="text-green-400 mt-4 font-medium">Selected: {resume.name}</p>}
              </div>
              {validationErrors.resume && <p className="text-red-400 text-sm mt-2">{validationErrors.resume}</p>}
            </div>
          )}
        </div>
      </section>

      {/* Job Description Section */}
      <section className="px-6 py-16 max-w-4xl mx-auto">
        <div className="rounded-2xl p-8 md:p-12" style={{ backgroundColor: "#222222" }}>
          <h2
            className="text-2xl md:text-3xl font-bold mb-4 text-center"
            style={{
              background: "linear-gradient(135deg, #1e3a8a 0%, #60a5fa 100%)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              backgroundClip: "text",
            }}
          >
            Target Job Description
          </h2>
          <p className="text-white/80 text-center mb-8 max-w-xl mx-auto">
            Paste the full job description for the position you&apos;re interested in.
          </p>

          <div>
            <label className="block text-white font-medium mb-2">Job Description</label>
            <p className="text-white/60 text-sm mb-3">
              Copy and paste the complete job posting (min 100 characters)
            </p>
            <textarea
              value={jobDescription}
              onChange={(e) => { setJobDescription(e.target.value); setValidationErrors(prev => ({ ...prev, jobDescription: null })); }}
              placeholder={"Paste the full job description here...\n\nExample:\nWe are looking for a Senior Frontend Developer with 5+ years of experience in React, TypeScript, and modern web technologies..."}
              rows={10}
              className="w-full px-4 py-3 rounded-lg text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all resize-none"
              style={{ backgroundColor: "#333333" }}
            />
            <div className="flex justify-between mt-1">
              {validationErrors.jobDescription
                ? <p className="text-red-400 text-sm">{validationErrors.jobDescription}</p>
                : <span />
              }
              <p className={`text-sm ml-auto ${jobDescription.length < JD_MIN_LENGTH ? 'text-white/30' : 'text-white/50'}`}>
                {jobDescription.length}/{JD_MAX_LENGTH}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Analyze CTA Section */}
      <section className="px-6 py-16 pb-24 max-w-4xl mx-auto text-center">
        <button
          onClick={handleAnalyze}
          disabled={isLoading}
          className="px-10 py-4 text-lg font-semibold rounded-xl transition-all duration-300 hover:scale-105 hover:shadow-lg hover:shadow-blue-500/25 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
          style={{ background: "linear-gradient(135deg, #1e3a8a 0%, #3b82f6 100%)", color: "white" }}
        >
          {isLoading ? "Analyzing…" : "Analyze Skill Gap"}
        </button>
        <p className="text-white/50 text-sm mt-4">Get your personalized skill gap report in seconds</p>
      </section>

      {/* T026: Multi-step AI loading animation */}
      {isLoading && (
        <section className="px-6 pb-16 max-w-4xl mx-auto">
          <div className="rounded-2xl p-8 bg-white/5 border border-white/10">
            <div className="flex flex-col items-center gap-4">
              <div className="w-10 h-10 border-4 border-cyan-400 border-t-transparent rounded-full animate-spin" />
              <p className="text-white/80 text-lg">{AI_LOADING_STEPS[aiLoadingStep]}</p>
              <div className="flex gap-1.5">
                {AI_LOADING_STEPS.map((_, i) => (
                  <div
                    key={i}
                    className={`h-1.5 w-6 rounded-full transition-colors duration-500 ${
                      i === aiLoadingStep ? "bg-cyan-400" : "bg-white/10"
                    }`}
                  />
                ))}
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Error */}
      {error && !isLoading && (
        <section className="px-6 pb-12 max-w-4xl mx-auto">
          <div className="rounded-2xl p-6" style={{ backgroundColor: "#3b1a1a" }}>
            <p className="text-red-400 font-medium">{error}</p>
          </div>
        </section>
      )}

      {/* Results */}
      {result && !isLoading && (
        <section className="px-6 pb-24 max-w-4xl mx-auto">
          <div className="rounded-2xl p-8 md:p-12" style={{ backgroundColor: "#222222" }}>
            <h2
              className="text-2xl md:text-3xl font-bold mb-6 text-center"
              style={{
                background: "linear-gradient(135deg, #1e3a8a 0%, #60a5fa 100%)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                backgroundClip: "text",
              }}
            >
              Your Skill Gap Report
            </h2>

            <div className="mb-6 text-center">
              <p className="text-white/60 text-sm mb-1">Compatibility Score</p>
              <p className="text-5xl font-bold text-blue-400">{result.compatibilityScore}%</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 className="text-white font-semibold mb-3">Missing Skills</h3>
                <div className="flex flex-wrap gap-2">
                  {result.missingSkills?.map((skill, i) => (
                    <span key={i} className="px-3 py-1 rounded-full text-sm"
                      style={{ backgroundColor: "#4b1c1c", color: "#f87171" }}>
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
              <div>
                <h3 className="text-white font-semibold mb-3">Matching Skills</h3>
                <div className="flex flex-wrap gap-2">
                  {result.matchingSkills?.map((skill, i) => (
                    <span key={i} className="px-3 py-1 rounded-full text-sm"
                      style={{ backgroundColor: "#1a3d2b", color: "#4ade80" }}>
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {result.suggestedRoadmap && result.suggestedRoadmap.length > 0 && (
              <div className="mt-6">
                <h3 className="text-white font-semibold mb-3">Suggested Learning Roadmap</h3>
                <ol className="space-y-2">
                  {result.suggestedRoadmap.map((step, i) => (
                    <li key={i} className="text-white/80 text-sm flex gap-2">
                      <span className="text-blue-400 font-medium">{i + 1}.</span>
                      {typeof step === "string" ? step : step.step}
                    </li>
                  ))}
                </ol>
              </div>
            )}

            {/* T029: Learning Resources panel — rendered only if resources exist */}
            {result.resources && (
              <div className="mt-8 pt-8 border-t border-white/10">
                <h3 className="text-white font-semibold text-lg mb-6">Learning Resources</h3>

                {result.resources.videos && result.resources.videos.length > 0 && (
                  <div className="mb-6">
                    <h4 className="text-white/60 text-sm uppercase tracking-wide mb-3">Video Tutorials</h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {result.resources.videos.map((video, i) => (
                        <a
                          key={i}
                          href={video.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-start gap-3 p-4 rounded-xl bg-white/5 hover:bg-white/10 transition-colors border border-white/10 group"
                        >
                          <div className="w-8 h-8 rounded-lg bg-red-500/20 flex items-center justify-center shrink-0">
                            <svg className="w-4 h-4 text-red-400" fill="currentColor" viewBox="0 0 24 24">
                              <path d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-2.88 2.5 2.89 2.89 0 01-2.89-2.89 2.89 2.89 0 012.89-2.89c.28 0 .54.04.79.1V9.01a6.33 6.33 0 00-.79-.05 6.34 6.34 0 00-6.34 6.34 6.34 6.34 0 006.34 6.34 6.34 6.34 0 006.33-6.34V8.69a8.28 8.28 0 004.83 1.54V6.79a4.85 4.85 0 01-1.06-.1z"/>
                            </svg>
                          </div>
                          <div className="min-w-0">
                            <p className="text-white text-sm font-medium line-clamp-2 group-hover:text-cyan-400 transition-colors">
                              {video.title}
                            </p>
                            {video.channel && <p className="text-white/40 text-xs mt-0.5">{video.channel}</p>}
                          </div>
                        </a>
                      ))}
                    </div>
                  </div>
                )}

                {result.resources.courses && result.resources.courses.length > 0 && (
                  <div>
                    <h4 className="text-white/60 text-sm uppercase tracking-wide mb-3">Courses</h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {result.resources.courses.map((course, i) => (
                        <a
                          key={i}
                          href={course.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-start gap-3 p-4 rounded-xl bg-white/5 hover:bg-white/10 transition-colors border border-white/10 group"
                        >
                          <div className="w-8 h-8 rounded-lg bg-blue-500/20 flex items-center justify-center shrink-0">
                            <svg className="w-4 h-4 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                                d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                            </svg>
                          </div>
                          <div className="min-w-0">
                            <p className="text-white text-sm font-medium line-clamp-2 group-hover:text-cyan-400 transition-colors">
                              {course.title}
                            </p>
                            <div className="flex items-center gap-2 mt-0.5">
                              {course.platform && <p className="text-white/40 text-xs">{course.platform}</p>}
                              {course.isFree && (
                                <span className="px-1.5 py-0.5 rounded text-xs bg-green-500/20 text-green-400 font-medium">
                                  Free
                                </span>
                              )}
                            </div>
                          </div>
                        </a>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </section>
      )}
    </main>
  );
}
