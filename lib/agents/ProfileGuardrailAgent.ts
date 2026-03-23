import { Agent, run, InputGuardrailTripwireTriggered, setDefaultOpenAIClient } from '@openai/agents'
import OpenAI from 'openai'

// Configure the SDK to use Groq once at module load time
const groqClient = new OpenAI({
  baseURL: 'https://api.groq.com/openai/v1',
  apiKey: process.env.GROQ_API_KEY || '',
})
setDefaultOpenAIClient(groqClient)

// Classifier agent — no outputType so the SDK uses plain text (avoids json_schema
// which Groq's endpoint rejects). We ask for JSON in the instructions and parse manually.
const profileClassifierAgent = new Agent({
  name: 'Profile Classifier',
  model: 'llama-3.3-70b-versatile',
  instructions: `You determine whether a student's career profile contains meaningful input.

The profile will list their skills, and optionally their strengths and aspirations.

Return isValid: true if ALL of the following hold:
- At least one skill looks like a real skill, technology, subject, or competency
- Any strengths text (if present) resembles a real human quality, trait, or area of expertise
- Any aspirations text (if present) resembles a real career goal, field of interest, or ambition

Return isValid: false ONLY when the content is clearly nonsensical — random keyboard mashing (e.g. "asdfgh"), meaningless repeated characters, lorem ipsum, or text with zero connection to any real skill or human quality.

Be lenient. A student may list informal skills like "good at maths" or "cricket". These are valid.
When in doubt, return isValid: true.

Respond with ONLY a raw JSON object, no markdown:
{"isValid": true, "reason": "brief explanation"}`,
})

type ProfileCheckResult = { isValid: boolean; reason: string }

function parseClassifierOutput(text: string): ProfileCheckResult {
  try {
    const clean = text.replace(/```json|```/g, '').trim()
    const parsed = JSON.parse(clean)
    return {
      isValid: Boolean(parsed.isValid),
      reason: String(parsed.reason ?? ''),
    }
  } catch {
    // Unparseable output — fail open (assume valid)
    return { isValid: true, reason: '' }
  }
}

// Gate agent — runs profileClassifierAgent as an inputGuardrail before allowing execution.
const profileGateAgent = new Agent({
  name: 'Profile Gate',
  model: 'llama-3.3-70b-versatile',
  instructions: 'You are a pass-through gate that validates career profile inputs.',
  inputGuardrails: [
    {
      name: 'Profile Input Validator',
      execute: async ({ input, context }) => {
        const result = await run(profileClassifierAgent, String(input), { context })
        const parsed = parseClassifierOutput(result.finalOutput as string ?? '')
        return {
          tripwireTriggered: !parsed.isValid,
          outputInfo: parsed,
        }
      },
    },
  ],
})

export type ProfileInput = {
  skills: string[]
  strengths?: string | null
  aspirations?: string | null
}

/**
 * Validates that skills, strengths, and aspirations contain meaningful content.
 *
 * Throws `InputGuardrailTripwireTriggered` if the LLM determines the input
 * is nonsensical or random.
 *
 * Fails open on any API/network error — never blocks a real user due to
 * Groq being unavailable.
 */
export async function validateProfileInput(profile: ProfileInput): Promise<void> {
  const lines: string[] = []

  if (profile.skills.length > 0) {
    lines.push(`Skills: ${profile.skills.join(', ')}`)
  }
  if (profile.strengths?.trim()) {
    lines.push(`Strengths: ${profile.strengths.trim()}`)
  }
  if (profile.aspirations?.trim()) {
    lines.push(`Aspirations: ${profile.aspirations.trim()}`)
  }

  // Nothing to validate — let the downstream agent handle empty inputs
  if (lines.length === 0) return

  const profileText = lines.join('\n')

  try {
    await run(profileGateAgent, profileText)
  } catch (err) {
    if (err instanceof InputGuardrailTripwireTriggered) {
      throw err // re-throw so the route can return 422
    }
    // Any other error (network, rate-limit, etc.) — fail open
    console.warn('ProfileGuardrailAgent: guardrail check failed, allowing request through:', err)
  }
}

export { InputGuardrailTripwireTriggered }
