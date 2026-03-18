import { z } from 'zod'

// SkillGapAnalysisSchema - validates AI response before any DB write (constitution Principle III).
// Used by POST /api/skillgap. Returns 503 if AI response does not match this shape.
export const SkillGapAnalysisSchema = z.object({
  missingSkills: z.array(z.string()),
  matchingSkills: z.array(z.string()),
  recommendations: z.string(),
  compatibilityScore: z.number().min(0).max(100),
  suggestedRoadmap: z.array(z.object({
    step: z.string(),
    resource: z.string()
  }))
})

// CareerGuidanceSchema - Phase 2 stub. Defined now so schema.prisma is stable.
// Used by POST /api/generateguidance (Phase 2 Stream A).
export const CareerGuidanceSchema = z.object({
  recommendations: z.array(z.object({
    title: z.string(),
    matchScore: z.number().min(0).max(100),
    reasoning: z.string(),
    marketOutlook: z.string(),
    roadmap: z.array(z.object({
      title: z.string(),
      description: z.string().optional(),
      duration: z.string().optional(),
      resources: z.array(z.object({
        name: z.string(),
        type: z.string(),
        link: z.string().optional()
      })).optional()
    }))
  })).min(3).max(5),
  overallTimeline: z.object({
    shortTermGoal: z.string(),
    longTermGoal: z.string()
  })
})

export type SkillGapAnalysis = z.infer<typeof SkillGapAnalysisSchema>
export type CareerGuidance = z.infer<typeof CareerGuidanceSchema>
