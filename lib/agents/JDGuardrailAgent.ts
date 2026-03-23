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
const jdClassifierAgent = new Agent({
  name: 'JD Classifier',
  model: 'llama-3.3-70b-versatile',
  instructions: `You determine whether the input text is a real job description.

A real job description is valid if it mentions ANY of:
- Job duties or responsibilities
- Required qualifications, skills, or experience
- A role or position (formal or informal)

Return isValid: true for any recognizable job posting — even brief, informal, or non-English ones.
Return isValid: false ONLY for clearly nonsensical input: random characters, lorem ipsum, or text with zero relation to any job or role.
Never be overly strict. When in doubt, return isValid: true.

Respond with ONLY a raw JSON object, no markdown:
{"isValid": true, "reason": "brief explanation"}`,
})

type JDCheckResult = { isValid: boolean; reason: string }

function parseClassifierOutput(text: string): JDCheckResult {
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

// Gate agent — carries the inputGuardrail and runs jdClassifierAgent before allowing execution.
// If tripwireTriggered is true the SDK throws InputGuardrailTripwireTriggered.
const gateAgent = new Agent({
  name: 'Skill Analyzer Gate',
  model: 'llama-3.3-70b-versatile',
  instructions: 'You are a pass-through gate that validates inputs.',
  inputGuardrails: [
    {
      name: 'Job Description Validator',
      execute: async ({ input, context }) => {
        const result = await run(jdClassifierAgent, String(input), { context })
        const parsed = parseClassifierOutput(result.finalOutput as string ?? '')
        return {
          tripwireTriggered: !parsed.isValid,
          outputInfo: parsed,
        }
      },
    },
  ],
})

/**
 * Validates that `jobDescription` is a real job posting.
 *
 * Throws `InputGuardrailTripwireTriggered` (re-exported below) if the LLM
 * determines the text is not a valid JD.
 *
 * Fails open on any API/network error — never blocks a valid user due to
 * Groq being unavailable.
 */
export async function validateJobDescription(jobDescription: string): Promise<void> {
  try {
    await run(gateAgent, jobDescription)
  } catch (err) {
    if (err instanceof InputGuardrailTripwireTriggered) {
      throw err // re-throw so the route can return 422
    }
    // Any other error (network, rate-limit, etc.) — fail open
    console.warn('JDGuardrailAgent: guardrail check failed, allowing request through:', err)
  }
}

export { InputGuardrailTripwireTriggered }
