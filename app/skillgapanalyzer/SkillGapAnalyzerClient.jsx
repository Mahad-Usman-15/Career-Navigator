"use client";

import { useState } from "react";
import Swal from "sweetalert2";

const toast = (icon, title) =>
  Swal.fire({
    toast: true,
    position: "top-end",
    icon,
    title,
    showConfirmButton: false,
    timer: 3500,
    timerProgressBar: true,
    background: "#222222",
    color: "#ffffff",
    iconColor: icon === "error" ? "#f87171" : icon === "success" ? "#4ade80" : "#60a5fa",
  });

export default function SkillGapAnalyzerClient() {
  const [inputMethod, setInputMethod] = useState("form");
  const [skills, setSkills] = useState("");
  const [experience, setExperience] = useState("");
  const [currentRole, setCurrentRole] = useState("");
  const [resume, setResume] = useState(null);
  const [jobDescription, setJobDescription] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file && file.type === "application/pdf") {
      setResume(file);
    } else {
      toast("error", "Please upload a PDF file only.");
      e.target.value = "";
    }
  };

  const handleAnalyze = async () => {
    if (inputMethod === "form") {
      if (!skills.trim() || !experience.trim() || !currentRole.trim()) {
        toast("warning", "Please fill in all form fields.");
        return;
      }
    } else {
      if (!resume) {
        toast("warning", "Please upload your resume.");
        return;
      }
    }

    if (!jobDescription.trim()) {
      toast("warning", "Please paste a job description.");
      return;
    }

    setIsLoading(true);
    setError(null);
    setResult(null);

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
        toast("error", msg);
      } else {
        setResult(data.analysis);
        toast("success", "Skill gap analysis complete!");
      }
    } catch {
      setError("Network error. Please check your connection and try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main
      className="min-h-screen font-sans"
      style={{ backgroundColor: "#171717" }}
    >
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
        <div
          className="rounded-2xl p-8 md:p-12"
          style={{ backgroundColor: "#222222" }}
        >
          <h2
            className="text-2xl md:text-3xl font-bold mb-4 text-center"
            style={{
              background: "linear-gradient(135deg, #1e3a8a 0%, #60a5fa 100%)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              backgroundClip: "text",
            }}
          >
            Your Skills & Experience
          </h2>
          <p className="text-white/80 text-center mb-8 max-w-xl mx-auto">
            Tell us about your current skills and experience. Choose one of the
            options below to get started.
          </p>

          {/* Input Method Toggle */}
          <div className="flex justify-center gap-4 mb-10">
            <button
              onClick={() => setInputMethod("form")}
              className="px-6 py-3 rounded-lg font-medium transition-all duration-200"
              style={{
                backgroundColor:
                  inputMethod === "form" ? "#3b82f6" : "#333333",
                color: "white",
              }}
            >
              Fill the Form
            </button>
            <button
              onClick={() => setInputMethod("upload")}
              className="px-6 py-3 rounded-lg font-medium transition-all duration-200"
              style={{
                backgroundColor:
                  inputMethod === "upload" ? "#3b82f6" : "#333333",
                color: "white",
              }}
            >
              Upload Resume
            </button>
          </div>

          {/* Option A: Fill the Form */}
          {inputMethod === "form" && (
            <div className="space-y-6">
              <div>
                <label className="block text-white font-medium mb-2">
                  Your Skills
                </label>
                <p className="text-white/60 text-sm mb-3">
                  List your technical and soft skills, separated by commas (e.g.,
                  JavaScript, React, Project Management, Communication)
                </p>
                <textarea
                  value={skills}
                  onChange={(e) => setSkills(e.target.value)}
                  placeholder="JavaScript, React, Node.js, Team Leadership, Agile..."
                  rows={4}
                  className="w-full px-4 py-3 rounded-lg text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                  style={{ backgroundColor: "#333333" }}
                />
              </div>

              <div>
                <label className="block text-white font-medium mb-2">
                  Years of Experience
                </label>
                <p className="text-white/60 text-sm mb-3">
                  Enter your total years of professional experience
                </p>
                <input
                  type="text"
                  value={experience}
                  onChange={(e) => setExperience(e.target.value)}
                  placeholder="e.g., 5 years"
                  className="w-full px-4 py-3 rounded-lg text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                  style={{ backgroundColor: "#333333" }}
                />
              </div>

              <div>
                <label className="block text-white font-medium mb-2">
                  Current Role / Background
                </label>
                <p className="text-white/60 text-sm mb-3">
                  Describe your current job title or professional background
                </p>
                <input
                  type="text"
                  value={currentRole}
                  onChange={(e) => setCurrentRole(e.target.value)}
                  placeholder="e.g., Frontend Developer at Tech Company"
                  className="w-full px-4 py-3 rounded-lg text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                  style={{ backgroundColor: "#333333" }}
                />
              </div>
            </div>
          )}

          {/* Option B: Upload Resume */}
          {inputMethod === "upload" && (
            <div className="text-center">
              <div
                className="border-2 border-dashed border-white/30 rounded-xl p-10 hover:border-blue-500 transition-colors"
              >
                <div className="mb-4">
                  <svg
                    className="w-16 h-16 mx-auto text-white/50"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={1.5}
                      d="M9 13h6m-3-3v6m5 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                    />
                  </svg>
                </div>
                <label className="cursor-pointer">
                  <span
                    className="px-6 py-3 rounded-lg font-medium inline-block mb-4 transition-all hover:opacity-90"
                    style={{ backgroundColor: "#3b82f6", color: "white" }}
                  >
                    Choose PDF File
                  </span>
                  <input
                    type="file"
                    accept=".pdf,application/pdf"
                    onChange={handleFileChange}
                    className="hidden"
                  />
                </label>
                <p className="text-white/60 text-sm">
                  Upload your resume in PDF format only
                </p>
                {resume && (
                  <p className="text-green-400 mt-4 font-medium">
                    Selected: {resume.name}
                  </p>
                )}
              </div>
              <p className="text-white/50 text-sm mt-4">
                Your resume will be analyzed to extract your skills and
                experience automatically.
              </p>
            </div>
          )}
        </div>
      </section>

      {/* Job Description Section */}
      <section className="px-6 py-16 max-w-4xl mx-auto">
        <div
          className="rounded-2xl p-8 md:p-12"
          style={{ backgroundColor: "#222222" }}
        >
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
            Paste the full job description for the position you&apos;re
            interested in. Include requirements, responsibilities, and
            qualifications for the most accurate analysis.
          </p>

          <div>
            <label className="block text-white font-medium mb-2">
              Job Description
            </label>
            <p className="text-white/60 text-sm mb-3">
              Copy and paste the complete job posting from the company&apos;s
              careers page or job board listing
            </p>
            <textarea
              value={jobDescription}
              onChange={(e) => setJobDescription(e.target.value)}
              placeholder="Paste the full job description here...

Example:
We are looking for a Senior Frontend Developer with 5+ years of experience in React, TypeScript, and modern web technologies. The ideal candidate will have experience with..."
              rows={10}
              className="w-full px-4 py-3 rounded-lg text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all resize-none"
              style={{ backgroundColor: "#333333" }}
            />
          </div>
        </div>
      </section>

      {/* Analyze CTA Section */}
      <section className="px-6 py-16 pb-24 max-w-4xl mx-auto text-center">
        <button
          onClick={handleAnalyze}
          disabled={isLoading}
          className="px-10 py-4 text-lg font-semibold rounded-xl transition-all duration-300 hover:scale-105 hover:shadow-lg hover:shadow-blue-500/25 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
          style={{
            background: "linear-gradient(135deg, #1e3a8a 0%, #3b82f6 100%)",
            color: "white",
          }}
        >
          {isLoading ? "Analyzing..." : "Analyze Skill Gap"}
        </button>
        <p className="text-white/50 text-sm mt-4">
          Get your personalized skill gap report in seconds
        </p>
      </section>

      {/* Error */}
      {error && (
        <section className="px-6 pb-12 max-w-4xl mx-auto">
          <div className="rounded-2xl p-6" style={{ backgroundColor: "#3b1a1a" }}>
            <p className="text-red-400 font-medium">{error}</p>
          </div>
        </section>
      )}

      {/* Results */}
      {result && (
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
                    <span key={i} className="px-3 py-1 rounded-full text-sm" style={{ backgroundColor: "#4b1c1c", color: "#f87171" }}>
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
              <div>
                <h3 className="text-white font-semibold mb-3">Matching Skills</h3>
                <div className="flex flex-wrap gap-2">
                  {result.matchingSkills?.map((skill, i) => (
                    <span key={i} className="px-3 py-1 rounded-full text-sm" style={{ backgroundColor: "#1a3d2b", color: "#4ade80" }}>
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
                      {typeof step === 'string' ? step : step.step}
                    </li>
                  ))}
                </ol>
              </div>
            )}
          </div>
        </section>
      )}
    </main>
  );
}
