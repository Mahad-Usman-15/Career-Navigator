import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

export async function generateSkillGapAnalysis(resume, jd) {
  const model = genAI.getGenerativeModel({ 
    model: "gemini-1.5-flash",
    generationConfig: { responseMimeType: "application/json" } // Force JSON output
  });

  const prompt = `
    You are an Expert Career Coach AI. 
    Task: Compare the User's Resume against the Job Description.
    
    Resume: ${resume}
    Job Description: ${jd}

    Return a JSON object strictly following this structure:
    {
      "missingSkills": ["string"],
      "matchingSkills": ["string"],
      "recommendations": "Markdown formatted string with advice",
      "compatibilityScore": number (0-100),
      "suggestedRoadmap": [{"step": "string", "resource": "string"}]
    }
  `;

  const result = await model.generateContent(prompt);
  return JSON.parse(result.response.text());
}