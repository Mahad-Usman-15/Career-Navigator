import OpenAI from 'openai'
import { GoogleGenerativeAI } from '@google/generative-ai'
import { SkillGapAnalysisSchema, type SkillGapAnalysis } from '@/lib/schemas'

function buildPrompt(resumeContent: string, jobDescription: string): string {
  return `Analyze the resume below against the job description and return a JSON object.

Resume:
${resumeContent}

Job Description:
${jobDescription}

Return ONLY valid JSON matching this exact structure (no markdown, no explanation):
{
  "missingSkills": ["skill1", "skill2"],
  "matchingSkills": ["skill3", "skill4"],
  "recommendations": "Detailed advice on how to bridge the skill gap.",
  "compatibilityScore": 75,
  "suggestedRoadmap": [
    { "step": "Action to take", "resource": "Resource URL or name" }
  ]
}`
}

async function tryGroqAgent(
  model: string,
  prompt: string
): Promise<SkillGapAnalysis> {
  const groqClient = new OpenAI({
    baseURL: 'https://api.groq.com/openai/v1',
    apiKey: process.env.GROQ_API_KEY || '',
  })

  const completion = await groqClient.chat.completions.create({
    model,
    messages: [{ role: 'user', content: prompt }],
    response_format: { type: 'json_object' },
    temperature: 0.2, //controls the randomness of the output, lower is more deterministic
  })

  const text = completion.choices[0].message.content ?? ''
  return SkillGapAnalysisSchema.parse(JSON.parse(text))
}

async function tryGemini(prompt: string): Promise<SkillGapAnalysis> {
  const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '')
  const geminiModel = genAI.getGenerativeModel({
    model: 'gemini-2.0-flash',
    generationConfig: { responseMimeType: 'application/json' },
  })

  const result = await geminiModel.generateContent(prompt)
  const text = result.response.text()
  const parsed = SkillGapAnalysisSchema.parse(JSON.parse(text))
  return parsed
}

// Output guardrail — rejects hollow AI responses that look like hallucinations
function isHollowResult(result: SkillGapAnalysis): boolean {
  const hasNoSkills =
    result.missingSkills.length === 0 && result.matchingSkills.length === 0
  const suspiciousScore =
    result.compatibilityScore === 0 || result.compatibilityScore === 100
  return hasNoSkills && suspiciousScore
}

export async function analyzeSkillGap(
  resumeContent: string,
  jobDescription: string
): Promise<SkillGapAnalysis> {
  const prompt = buildPrompt(resumeContent, jobDescription)

  // Level 1: Groq llama-3.3-70b-versatile (strongest, primary)
  try {
    const result = await tryGroqAgent('llama-3.3-70b-versatile', prompt)
    if (isHollowResult(result)) throw new Error('Output guardrail: hollow result from level 1')
    return result
  } catch (err) {
    console.error('SkillAnalyzerAgent level 1 failed:', err)
  }

  // Level 2: Groq llama-3.1-8b-instant (lighter fallback)
  try {
    const result = await tryGroqAgent('llama-3.1-8b-instant', prompt)
    if (isHollowResult(result)) throw new Error('Output guardrail: hollow result from level 2')
    return result
  } catch (err) {
    console.error('SkillAnalyzerAgent level 2 failed:', err)
  }

  // Level 3: Gemini 2.0 Flash (secondary provider fallback)
  try {
    const result = await tryGemini(prompt)
    if (isHollowResult(result)) throw new Error('Output guardrail: hollow result from level 3')
    return result
  } catch (err) {
    console.error('SkillAnalyzerAgent level 3 failed:', err)
  }

  throw new Error('All AI providers failed')
}
