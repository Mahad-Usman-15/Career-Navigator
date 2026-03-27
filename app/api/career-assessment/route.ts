import { NextRequest, NextResponse } from 'next/server'
import { requireAuth } from '@/lib/auth-guard'
import { prisma } from '@/lib/db'

// Input guardrail — detects gibberish before saving to DB
function isGibberish(text: string): boolean {
  const t = text.trim().toLowerCase()
  if (t.length < 5) return true
  const noSpaces = t.replace(/\s+/g, '')
  const diversity = new Set(noSpaces).size / noSpaces.length
  if (diversity < 0.15) return true
  const vowels = (t.match(/[aeiou]/g) || []).length
  if (noSpaces.length > 0 && vowels / noSpaces.length < 0.05) return true
  const realWords = t.split(/\s+/).filter(w => w.length >= 2)
  if (realWords.length < 2) return true
  return false
}

// MBTI calculation — ties resolve to first letter (E, S, T, J) via > operator (intentional default)
function calculateMBTI(mbtiAnswers: Record<string, number>): {
  type: string
  dimensions: { EI: string; SN: string; TF: string; JP: string }
  scores: Record<string, number>
} {
  const counts: Record<string, number> = { E: 0, I: 0, S: 0, N: 0, T: 0, F: 0, J: 0, P: 0 }
  const dimensionMap: Record<string, string> = {
    ei1: 'EI', ei2: 'EI', ei3: 'EI', ei4: 'EI', ei5: 'EI',
    sn1: 'SN', sn2: 'SN', sn3: 'SN', sn4: 'SN', sn5: 'SN',
    tf1: 'TF', tf2: 'TF', tf3: 'TF', tf4: 'TF', tf5: 'TF',
    jp1: 'JP', jp2: 'JP', jp3: 'JP', jp4: 'JP', jp5: 'JP'
  }

  Object.entries(mbtiAnswers).forEach(([questionId, answerIndex]) => {
    const dimension = dimensionMap[questionId]
    if (!dimension) return
    if (dimension === 'EI') { if (answerIndex === 0) counts.E++; else if (answerIndex === 1) counts.I++ }
    else if (dimension === 'SN') { if (answerIndex === 0) counts.S++; else if (answerIndex === 1) counts.N++ }
    else if (dimension === 'TF') { if (answerIndex === 0) counts.T++; else if (answerIndex === 1) counts.F++ }
    else if (dimension === 'JP') { if (answerIndex === 0) counts.J++; else if (answerIndex === 1) counts.P++ }
  })

  const mbtiType =
    (counts.E > counts.I ? 'E' : 'I') +
    (counts.S > counts.N ? 'S' : 'N') +
    (counts.T > counts.F ? 'T' : 'F') +
    (counts.J > counts.P ? 'J' : 'P')

  return {
    type: mbtiType,
    dimensions: {
      EI: counts.E > counts.I ? 'E' : 'I',
      SN: counts.S > counts.N ? 'S' : 'N',
      TF: counts.T > counts.F ? 'T' : 'F',
      JP: counts.J > counts.P ? 'J' : 'P'
    },
    scores: counts
  }
}

const iqQuestionsData: Array<{ id: number; answer: string }> = [
  { id: 1, answer: '42' },
  { id: 2, answer: 'True' },
  { id: 3, answer: 'Ounce' },
  { id: 4, answer: '30' },
  { id: 5, answer: 'Eating' },
  { id: 6, answer: 'Ocean' },
  { id: 7, answer: '36' },
  { id: 8, answer: 'Snake' },
  { id: 9, answer: '150 miles' },
  { id: 10, answer: '243' },
  { id: 11, answer: 'Still' },
  { id: 12, answer: '5 minutes' },
  { id: 13, answer: 'U' },
  { id: 14, answer: 'Grandson' },
  { id: 15, answer: '14' },
  { id: 16, answer: '32' },
  { id: 17, answer: '21' },
  { id: 18, answer: 'Cheese' },
  { id: 19, answer: '50' },
  { id: 20, answer: '40' },
  { id: 21, answer: 'Decagon' },
  { id: 22, answer: 'School' },
  { id: 23, answer: '100' },
  { id: 24, answer: '5' },
  { id: 25, answer: 'Cube' },
  { id: 26, answer: '25' },
  { id: 27, answer: 'KHOS' },
  { id: 28, answer: '7.5' },
  { id: 29, answer: 'Malevolent' },
  { id: 30, answer: 'P' }
]

function calculateIQScore(
  chronologicalAge: number,
  iqAnswers: Record<string, string>
): { rawScore: number; correctAnswers: number; mentalAge: number; chronologicalAge: number; iq_score: number } {
  let correctAnswers = 0
  Object.entries(iqAnswers).forEach(([questionId, userAnswer]) => {
    const question = iqQuestionsData.find(q => q.id === parseInt(questionId))
    if (question && question.answer === userAnswer) correctAnswers++
  })
  const rawScore = correctAnswers
  let mentalAge = chronologicalAge <= 16
    ? chronologicalAge + (correctAnswers * 2)
    : chronologicalAge + (correctAnswers * 1.5)
  mentalAge = Math.min(mentalAge, chronologicalAge + 30)
  const iqScore = Math.round((mentalAge / chronologicalAge) * 100)
  const normalizedIQ = Math.min(Math.max(iqScore, 70), 130)
  return { rawScore, correctAnswers, mentalAge: Math.round(mentalAge * 10) / 10, chronologicalAge, iq_score: normalizedIQ }
}

export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    // Constitution Principle I (layer 2) + Principle II: userId from session only
    const userId = await requireAuth()

    const data = await request.json()

    if (!data.name || !data.age || !data.current_qualification || !data.mbtiAnswers || !data.iqAnswers) {
      return NextResponse.json(
        { error: 'Missing required fields: name, age, qualification, mbtiAnswers, iqAnswers' },
        { status: 400 }
      )
    }

    // Input guardrails — validate free-text fields before DB write
    const age = parseInt(data.age)
    if (isNaN(age) || age < 13 || age > 100) {
      return NextResponse.json(
        { error: 'Age must be between 13 and 100.' },
        { status: 422 }
      )
    }

    if (!data.name.trim() || data.name.trim().length < 2) {
      return NextResponse.json(
        { error: 'Please enter your full name.' },
        { status: 422 }
      )
    }

    if (data.skills && isGibberish(data.skills)) {
      return NextResponse.json(
        { error: 'Skills input does not appear to be meaningful. Please describe your actual skills and interests.' },
        { status: 422 }
      )
    }

    if (data.strengths && isGibberish(data.strengths)) {
      return NextResponse.json(
        { error: 'Strengths input does not appear to be meaningful. Please describe your actual strengths.' },
        { status: 422 }
      )
    }

    if (data.aspirations && isGibberish(data.aspirations)) {
      return NextResponse.json(
        { error: 'Aspirations input does not appear to be meaningful. Please describe your actual goals.' },
        { status: 422 }
      )
    }

    const mbtiResult = calculateMBTI(data.mbtiAnswers)
    const iqResult = calculateIQScore(parseInt(data.age), data.iqAnswers)

    const skillsArray: string[] = data.skills
      ? data.skills.split(',').map((s: string) => s.trim()).filter((s: string) => s.length > 0)
      : []

    // T023: Archive any existing active assessment before creating a new one
    // This preserves history (isArchived: true) while the new submission becomes active
    const assessmentData = {
      name: data.name,
      email: data.email || null,
      age: parseInt(data.age),
      qualification: data.current_qualification,
      personality: {
        type: mbtiResult.type,
        dimensions: mbtiResult.dimensions,
        scores: mbtiResult.scores,
        mbtiAnswers: data.mbtiAnswers,
        evaluatedAt: new Date().toISOString()
      },
      iq: {
        rawScore: iqResult.rawScore,
        correctAnswers: iqResult.correctAnswers,
        mentalAge: iqResult.mentalAge,
        chronologicalAge: iqResult.chronologicalAge,
        iq_score: iqResult.iq_score,
        iqAnswers: data.iqAnswers,
        assessedAt: new Date().toISOString()
      },
      skills: {
        skills: skillsArray,
        interests: [],
        strengths: data.strengths || '',
        aspirations: data.aspirations || ''
      },
      isComplete: true
    }

    const existing = await prisma.career_assessments.findFirst({
      where: { clerkId: userId, isArchived: false }
    })

    // T023: Archive existing record (preserves history) then always create fresh record
    if (existing) {
      await prisma.career_assessments.update({
        where: { id: existing.id },
        data: { isArchived: true }
      })
    }

    const record = await prisma.career_assessments.create({
      data: { clerkId: userId, ...assessmentData }
    })

    return NextResponse.json({
      success: true,
      data: {
        id: record.id,
        mbtiType: mbtiResult.type,
        iqScore: iqResult.iq_score,
        completedAt: record.updatedAt
      }
    }, { status: 201 })

  } catch (error) {
    // CRITICAL: instanceof check passes through 401 from requireAuth()
    if (error instanceof NextResponse) return error
    console.error('Error saving assessment:', error)
    return NextResponse.json({ error: 'Failed to save assessment' }, { status: 500 })
  }
}

export async function GET(request: NextRequest): Promise<NextResponse> {
  try {
    // Constitution Principle I (layer 2) + Principle II: userId from session only
    const userId = await requireAuth()

    const record = await prisma.career_assessments.findFirst({
      where: { clerkId: userId, isArchived: false }
    })

    if (!record) {
      return NextResponse.json({ error: 'No assessment found' }, { status: 404 })
    }

    return NextResponse.json({ success: true, data: record })

  } catch (error) {
    // CRITICAL: instanceof check passes through 401 from requireAuth()
    if (error instanceof NextResponse) return error
    console.error('Error fetching assessment:', error)
    return NextResponse.json({ error: 'Failed to fetch assessment' }, { status: 500 })
  }
}
