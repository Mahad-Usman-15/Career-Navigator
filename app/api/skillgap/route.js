import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import SkillGap from '../../../models/skillgap';
import { generateSkillGapAnalysis } from '../../../lib/ai-agent'; // We'll define the prompt logic here

export async function POST(req) {
  try {
    await dbConnect();

    // 1. Extract data from request (sent from your Frontend)
    const { clerkId, name, resumeText, jobDescription, resumeSource, clerkData } = await req.json();

    if (!resumeText || !jobDescription) {
      return NextResponse.json({ error: "Missing resume or job description" }, { status: 400 });
    }

    // 2. Trigger the SkillsgapAnalyzer Agent
    // This function calls Gemini/OpenAI and returns the Structured AnalysisResultSchema
    const aiAnalysis = await generateSkillGapAnalysis(resumeText, jobDescription);

    // 3. Save to MongoDB using your defined Schema
    const newEntry = await SkillGap.create({
      clerkId,
      name,
      resumeSource,
      resumeContent: resumeText, // Saved in Markdown/Text
      jobDescription,
      analysis: aiAnalysis, // Matches AnalysisResultSchema
      metadata: {
        username: clerkData?.username,
        clerkCreatedAt: clerkData?.createdAt
      }
    });

    return NextResponse.json({ success: true, data: newEntry }, { status: 201 });

  } catch (error) {
    console.error("SKILLS_GAP_ERROR:", error);
    return NextResponse.json({ error: "Failed to process analysis" }, { status: 500 });
  }
}