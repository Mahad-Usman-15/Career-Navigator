// T042: Prisma seed functions for E2E tests
// All records use TEST_CLERK_ID prefix to isolate test data from production records
import { prisma } from '@/lib/db'

export const TEST_CLERK_ID = 'test_user_e2e'

export async function seedAssessment(clerkId: string = TEST_CLERK_ID) {
  return prisma.career_assessments.create({
    data: {
      clerkId,
      name: 'Test Student',
      email: 'test@example.com',
      age: '20',
      qualification: 'A-levels',
      personality: {
        type: 'INTJ',
        answers: {}
      },
      iq: {
        iq_score: 115,
        answers: []
      },
      skills: {
        skills: ['Python', 'JavaScript', 'Data Analysis'],
        strengths: 'Problem solving and analytical thinking',
        aspirations: 'Software engineer at a tech company'
      },
      isComplete: true,
      isArchived: false
    }
  })
}

export async function seedGuidance(clerkId: string = TEST_CLERK_ID, assessmentId: string) {
  return prisma.career_guidance.create({
    data: {
      clerkId,
      assessmentId,
      assessmentSnapshot: {
        mbtiType: 'INTJ',
        iqScore: 115,
        qualification: 'A-levels',
        skills: { skills: ['Python', 'JavaScript'] }
      },
      recommendations: [
        { title: 'Software Engineer', matchScore: 92, marketOutlook: 'High demand across Pakistan and globally' },
        { title: 'Data Analyst', matchScore: 85, marketOutlook: 'Growing field with strong salary prospects' },
        { title: 'Product Manager', matchScore: 78, marketOutlook: 'Emerging role in Pakistani tech ecosystem' }
      ],
      overallTimeline: {
        shortTerm: '6 months',
        longTerm: '3 years',
        milestones: []
      }
    }
  })
}

export async function seedSkillGap(clerkId: string = TEST_CLERK_ID) {
  return prisma.skill_gaps.create({
    data: {
      clerkId,
      resumeSource: 'text',
      resumeContent: 'Python developer with 2 years experience in data analysis and JavaScript.',
      jobDescription: 'Senior Software Engineer role requiring React, Node.js, TypeScript, PostgreSQL, and AWS.',
      analysis: {
        compatibilityScore: 68,
        missingSkills: ['React', 'TypeScript', 'AWS', 'PostgreSQL'],
        matchingSkills: ['Python', 'JavaScript', 'Data Analysis'],
        suggestedRoadmap: [
          { skill: 'React', priority: 'high', estimatedWeeks: 8 },
          { skill: 'TypeScript', priority: 'high', estimatedWeeks: 4 }
        ]
      }
    }
  })
}

export async function clearTestData(clerkId: string = TEST_CLERK_ID) {
  await prisma.skill_gaps.deleteMany({ where: { clerkId } })
  await prisma.career_guidance.deleteMany({ where: { clerkId } })
  await prisma.career_assessments.deleteMany({ where: { clerkId } })
}
