import OpenAI from 'openai'
import { GoogleGenerativeAI } from '@google/generative-ai'
import { CareerGuidanceSchema, type CareerGuidance } from '@/lib/schemas'

export type AssessmentInput = {
  personality: {
    type: string
    dimensions: { EI: string; SN: string; TF: string; JP: string }
    scores: Record<string, number>
  }
  iq: {
    iq_score: number
    rawScore?: number
    correctAnswers?: number
    mentalAge?: number
  }
  qualification: string
  skills: {
    skills: string[]
    strengths?: string
    aspirations?: string
  }
}

function buildPrompt(assessment: AssessmentInput): string {
  const mbtiType = assessment.personality?.type ?? 'Unknown'
  const iqScore = assessment.iq?.iq_score ?? 'Unknown'
  const skillsList = Array.isArray(assessment.skills?.skills)
    ? assessment.skills.skills.join(', ')
    : ''

  return `You are a career counsellor specialising in the Pakistani job market.

A student has completed their career assessment with the following profile:
- MBTI personality type: ${mbtiType}
- IQ score: ${iqScore}
- Highest qualification: ${assessment.qualification}
- Skills: ${skillsList}
${assessment.skills?.strengths ? `- Strengths: ${assessment.skills.strengths}` : ''}
${assessment.skills?.aspirations ? `- Aspirations: ${assessment.skills.aspirations}` : ''}

Generate 3 to 5 career path recommendations tailored specifically to the Pakistani job market (Karachi and major cities).

Return ONLY valid JSON matching this exact structure (no markdown, no explanation):
{
  "recommendations": [
    {
      "title": "Career title",
      "matchScore": 85,
      "reasoning": "Why this fits the student based on their profile",
      "marketOutlook": "Pakistan-specific market context and demand",
      "roadmap": [
        {
          "title": "Step title",
          "description": "What to do",
          "duration": "e.g. 2 months",
          "resources": [{"name": "Resource name", "type": "online", "link": "optional URL"}]
        }
      ]
    }
  ],
  "overallTimeline": {
    "shortTermGoal": "Goal for next 6-12 months",
    "longTermGoal": "Goal for next 3-5 years"
  }
}`
}

async function tryGroqAgent(
  model: string,
  prompt: string
): Promise<CareerGuidance> {
  const groqClient = new OpenAI({
    baseURL: 'https://api.groq.com/openai/v1',
    apiKey: process.env.GROQ_API_KEY || '',
  })

  const completion = await groqClient.chat.completions.create({
    model,
    messages: [{ role: 'user', content: prompt }],
    response_format: { type: 'json_object' },
    temperature: 0.3,
  })

  const text = completion.choices[0].message.content ?? ''
  return CareerGuidanceSchema.parse(JSON.parse(text))
}

async function tryGemini(prompt: string): Promise<CareerGuidance> {
  const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '')
  const geminiModel = genAI.getGenerativeModel({
    model: 'gemini-2.0-flash',
    generationConfig: { responseMimeType: 'application/json' },
  })

  const result = await geminiModel.generateContent(prompt)
  const text = result.response.text()
  const parsed = CareerGuidanceSchema.parse(JSON.parse(text))
  return parsed
}

// Output guardrail — rejects hollow AI responses that look like hallucinations
function isHollowGuidance(result: CareerGuidance): boolean {
  if (!result.recommendations || result.recommendations.length === 0) return true
  const allZeroScores = result.recommendations.every(
    r => r.matchScore === 0 || r.matchScore === 100
  )
  const allEmptyTitles = result.recommendations.every(r => !r.title || r.title.trim().length < 3)
  return allZeroScores && allEmptyTitles
}

export async function generateCareerGuidance(
  assessment: AssessmentInput
): Promise<CareerGuidance> {
  const prompt = buildPrompt(assessment)

  // Level 1: Groq llama-3.3-70b-versatile (strongest, primary)
  try {
    const result = await tryGroqAgent('llama-3.3-70b-versatile', prompt)
    if (isHollowGuidance(result)) throw new Error('Output guardrail: hollow result from level 1')
    return result
  } catch (err) {
    console.error('CareerGuidanceAgent level 1 failed:', err)
  }

  // Level 2: Groq llama-3.1-8b-instant (lighter fallback)
  try {
    const result = await tryGroqAgent('llama-3.1-8b-instant', prompt)
    if (isHollowGuidance(result)) throw new Error('Output guardrail: hollow result from level 2')
    return result
  } catch (err) {
    console.error('CareerGuidanceAgent level 2 failed:', err)
  }

  // Level 3: Gemini 2.0 Flash (secondary provider fallback)
  try {
    const result = await tryGemini(prompt)
    if (isHollowGuidance(result)) throw new Error('Output guardrail: hollow result from level 3')
    return result
  } catch (err) {
    console.error('CareerGuidanceAgent level 3 failed:', err)
  }

  throw new Error('All AI providers failed')
}
