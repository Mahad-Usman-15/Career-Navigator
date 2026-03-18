/**
 * Manual test: Skill Gap Analyzer — Areeb Usman.pdf vs Bioengineering JD
 * Uses direct OpenAI/Groq API calls with json_object mode (not Agent SDK structured outputs)
 * Run: node scripts/test-skillgap.mjs
 */
import { readFileSync } from 'fs'
import { fileURLToPath } from 'url'
import { dirname, resolve } from 'path'
import { createRequire } from 'module'

const __dirname = dirname(fileURLToPath(import.meta.url))
const require = createRequire(import.meta.url)

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

const JOB_DESCRIPTION = `
Seeking a degreed engineer at the Staff, Senior, or Managing level. Salary and position commensurate with experience and education level. Competitive pay at any level of education/experience. The successful candidate will analyze human injury scenarios, will reconstruct accidents, and may contribute to our medical device testing program. FE and PE are a plus. BS to PhD in bioengineering or related field.

Responsibilities
-Determine injury mechanism and pertinent biomechanics in real-world injury cases
-Study direction and mechanism of forces on body joints in specific loading scenarios
-Reconstruct vehicle and pedestrian accidents
-Apply physics, such as conservation of energy, conservation of momentum calculations to determine accelerations and energy of impacts
-investigate accident scenarios to determine happenings for clients
-local travel for vehicle and/or site inspections

Qualifications
Degree in bioengineering or related field
Problem solving
Verbal communication
Written communication
`

function buildPrompt(resumeText, jobDescription) {
  return `Analyze the resume below against the job description and return a JSON object.

Resume:
${resumeText}

Job Description:
${jobDescription}

Return ONLY valid JSON with this exact structure (no markdown, no extra text):
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
    temperature: 0.2,
  })
  const text = completion.choices[0].message.content
  return JSON.parse(text)
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
    Array.isArray(obj.missingSkills) &&
    Array.isArray(obj.matchingSkills) &&
    typeof obj.recommendations === 'string' &&
    typeof obj.compatibilityScore === 'number' &&
    Array.isArray(obj.suggestedRoadmap)
  )
}

async function main() {
  console.log('=== Skill Gap Analyzer — Manual Test ===\n')

  // Step 1: Read & parse PDF
  const pdfPath = resolve(__dirname, '../Areeb Usman.pdf')
  console.log(`📄 Reading: ${pdfPath}`)
  const buffer = readFileSync(pdfPath)

  const { PDFParse } = require('pdf-parse')
  const parser = new PDFParse({ data: buffer })
  const parsed = await parser.getText()
  const resumeText = parsed.text.trim()

  console.log(`   Extracted ${resumeText.length} chars`)
  if (resumeText.length < 50) {
    console.error('❌ Scanned PDF — not enough extractable text')
    process.exit(1)
  }
  console.log('\n--- Resume Preview (first 500 chars) ---')
  console.log(resumeText.slice(0, 500) + '\n...\n')

  const prompt = buildPrompt(resumeText, JOB_DESCRIPTION)
  let analysis = null

  // Level 1: Groq llama-3.3-70b-versatile
  console.log('🤖 Level 1: Groq llama-3.3-70b-versatile...')
  try {
    analysis = await tryGroq('llama-3.3-70b-versatile', prompt)
    if (!validate(analysis)) throw new Error('Invalid shape')
    console.log('✅ Level 1 succeeded\n')
  } catch (e) {
    console.error(`   ❌ Failed: ${e.message}`)

    // Level 2: Groq llama-3.1-8b-instant
    console.log('🤖 Level 2: Groq llama-3.1-8b-instant...')
    try {
      analysis = await tryGroq('llama-3.1-8b-instant', prompt)
      if (!validate(analysis)) throw new Error('Invalid shape')
      console.log('✅ Level 2 succeeded\n')
    } catch (e2) {
      console.error(`   ❌ Failed: ${e2.message}`)

      // Level 3: Gemini 2.0 Flash
      console.log('🤖 Level 3: Gemini 2.0 Flash...')
      try {
        analysis = await tryGemini(prompt)
        if (!validate(analysis)) throw new Error('Invalid shape')
        console.log('✅ Level 3 succeeded\n')
      } catch (e3) {
        console.error(`   ❌ Failed: ${e3.message}`)
        console.error('\n❌ All providers failed')
        process.exit(1)
      }
    }
  }

  // Print results
  console.log('='.repeat(50))
  console.log('SKILL GAP ANALYSIS — Areeb Usman vs Bioengineering JD')
  console.log('='.repeat(50))
  console.log(`\n🎯 Compatibility Score: ${analysis.compatibilityScore}%\n`)

  console.log(`✅ Matching Skills (${analysis.matchingSkills.length}):`)
  analysis.matchingSkills.forEach(s => console.log(`   • ${s}`))

  console.log(`\n❌ Missing Skills (${analysis.missingSkills.length}):`)
  analysis.missingSkills.forEach(s => console.log(`   • ${s}`))

  console.log(`\n📋 Recommendations:\n${analysis.recommendations}`)

  console.log(`\n🗺️  Suggested Roadmap (${analysis.suggestedRoadmap.length} steps):`)
  analysis.suggestedRoadmap.forEach((item, i) => {
    console.log(`   ${i + 1}. ${item.step}`)
    console.log(`      → ${item.resource}`)
  })

  console.log('\n=== TEST COMPLETE ===')
}

main().catch(err => {
  console.error('Unexpected error:', err)
  process.exit(1)
})
