/**
 * Manual test: Career Guidance Agent
 * Uses a realistic INTJ student profile typical of Karachi university student.
 * Run: node scripts/test-careerguidance.mjs
 */
import { readFileSync } from 'fs'
import { fileURLToPath } from 'url'
import { dirname, resolve } from 'path'

const __dirname = dirname(fileURLToPath(import.meta.url))

// Load env vars from .env.local
const envContent = readFileSync(resolve(__dirname, '../.env.local'), 'utf8')
for (const line of envContent.split('\n')) {
  const trimmed = line.trim()
  if (!trimmed || trimmed.startsWith('#')) continue
  const eqIdx = trimmed.indexOf('=')
  if (eqIdx === -1) continue
  const key = trimmed.slice(0, eqIdx).trim()
  let val = trimmed.slice(eqIdx + 1).trim()
  if (val.startsWith('"') && val.endsWith('"')) val = val.slice(1, -1)
  if (!process.env[key]) process.env[key] = val
}

// Sample assessment input (mirrors what the DB returns)
const mockAssessment = {
  personality: {
    type: 'INTJ',
    dimensions: { EI: 'I', SN: 'N', TF: 'T', JP: 'J' },
    scores: { E: 3, I: 7, S: 4, N: 6, T: 8, F: 2, J: 7, P: 3 }
  },
  iq: {
    iq_score: 118,
    rawScore: 24,
    correctAnswers: 24,
    mentalAge: 17,
    chronologicalAge: 20
  },
  qualification: 'BS Computer Science (3rd year)',
  skills: {
    skills: ['Python', 'React', 'Node.js', 'Problem Solving', 'SQL'],
    strengths: 'Strong logical reasoning and self-learning ability',
    aspirations: 'Want to work in AI/ML or software engineering'
  }
}

async function tryGroq(model, prompt) {
  const OpenAI = (await import('openai')).default
  const client = new OpenAI({
    baseURL: 'https://api.groq.com/openai/v1',
    apiKey: process.env.GROQ_API_KEY,
  })
  const completion = await client.chat.completions.create({
    model,
    messages: [{ role: 'user', content: prompt }],
    response_format: { type: 'json_object' },
    temperature: 0.3,
  })
  return JSON.parse(completion.choices[0].message.content)
}

async function tryGemini(prompt) {
  const { GoogleGenerativeAI } = await import('@google/generative-ai')
  const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY)
  const model = genAI.getGenerativeModel({
    model: 'gemini-2.0-flash',
    generationConfig: { responseMimeType: 'application/json' },
  })
  const result = await model.generateContent(prompt)
  return JSON.parse(result.response.text())
}

function validate(obj) {
  return (
    obj &&
    Array.isArray(obj.recommendations) &&
    obj.recommendations.length >= 1 &&
    obj.overallTimeline?.shortTermGoal &&
    obj.overallTimeline?.longTermGoal
  )
}

function buildPrompt(assessment) {
  const mbtiType = assessment.personality?.type ?? 'Unknown'
  const iqScore = assessment.iq?.iq_score ?? 'Unknown'
  const skillsList = assessment.skills?.skills?.join(', ') ?? ''

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

async function main() {
  console.log('=== Career Guidance Agent — Manual Test ===\n')
  console.log('Profile: INTJ · IQ 118 · BS CS 3rd year · Python/React/Node.js · Karachi\n')

  const prompt = buildPrompt(mockAssessment)
  let result = null

  // Level 1
  console.log('🤖 Level 1: Groq llama-3.3-70b-versatile...')
  try {
    result = await tryGroq('llama-3.3-70b-versatile', prompt)
    if (!validate(result)) throw new Error('Invalid shape')
    console.log('✅ Level 1 succeeded\n')
  } catch (e) {
    console.error(`   ❌ Failed: ${e.message}`)

    // Level 2
    console.log('🤖 Level 2: Groq llama-3.1-8b-instant...')
    try {
      result = await tryGroq('llama-3.1-8b-instant', prompt)
      if (!validate(result)) throw new Error('Invalid shape')
      console.log('✅ Level 2 succeeded\n')
    } catch (e2) {
      console.error(`   ❌ Failed: ${e2.message}`)

      // Level 3
      console.log('🤖 Level 3: Gemini 2.0 Flash...')
      try {
        result = await tryGemini(prompt)
        if (!validate(result)) throw new Error('Invalid shape')
        console.log('✅ Level 3 succeeded\n')
      } catch (e3) {
        console.error(`   ❌ Failed: ${e3.message}`)
        console.error('\n❌ All providers failed')
        process.exit(1)
      }
    }
  }

  // Print results
  console.log('='.repeat(55))
  console.log('CAREER GUIDANCE — INTJ Student, BS CS, Karachi')
  console.log('='.repeat(55))

  result.recommendations.forEach((rec, i) => {
    console.log(`\n${i + 1}. ${rec.title}  (${rec.matchScore}% match)`)
    console.log(`   Reasoning   : ${rec.reasoning}`)
    console.log(`   Market      : ${rec.marketOutlook}`)
    if (rec.roadmap?.length) {
      console.log(`   Roadmap (${rec.roadmap.length} steps):`)
      rec.roadmap.forEach((step, j) => {
        console.log(`     ${j + 1}. ${step.title} — ${step.duration}`)
        console.log(`        ${step.description}`)
        if (step.resources?.length) {
          step.resources.forEach(r => console.log(`        📚 ${r.name}${r.link ? ' → ' + r.link : ''}`))
        }
      })
    }
  })

  console.log('\n⏱  Overall Timeline:')
  console.log(`   Short-term: ${result.overallTimeline.shortTermGoal}`)
  console.log(`   Long-term : ${result.overallTimeline.longTermGoal}`)
  console.log('\n=== TEST COMPLETE ===')
}

main().catch(err => {
  console.error('Unexpected error:', err)
  process.exit(1)
})
