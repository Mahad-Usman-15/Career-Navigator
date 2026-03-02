import { NextRequest, NextResponse } from "next/server"
import dbConnect from "@/lib/mongodb"
import User from "@/models/careerassesment"

function calculateMBTI(mbtiAnswers) {
    // Initialize counters for each dimension
    const counts = {
        E: 0, I: 0,
        S: 0, N: 0,
        T: 0, F: 0,
        J: 0, P: 0
    };


    const dimensionMap = {
        // EI questions
        'ei1': 'EI', 'ei2': 'EI', 'ei3': 'EI', 'ei4': 'EI', 'ei5': 'EI',
        // SN questions
        'sn1': 'SN', 'sn2': 'SN', 'sn3': 'SN', 'sn4': 'SN', 'sn5': 'SN',
        // TF questions
        'tf1': 'TF', 'tf2': 'TF', 'tf3': 'TF', 'tf4': 'TF', 'tf5': 'TF',
        // JP questions
        'jp1': 'JP', 'jp2': 'JP', 'jp3': 'JP', 'jp4': 'JP', 'jp5': 'JP'
    };

    Object.entries(mbtiAnswers).forEach(([questionId, answerIndex]) => {
        const dimension = dimensionMap[questionId];
        if (!dimension) return;

        if (dimension === 'EI') {
            if (answerIndex === 0) counts.E++;
            else if (answerIndex === 1) counts.I++;
        } else if (dimension === 'SN') {
            if (answerIndex === 0) counts.S++;
            else if (answerIndex === 1) counts.N++;
        } else if (dimension === 'TF') {
            if (answerIndex === 0) counts.T++;
            else if (answerIndex === 1) counts.F++;
        } else if (dimension === 'JP') {
            if (answerIndex === 0) counts.J++;
            else if (answerIndex === 1) counts.P++;
        }
    });
    const mbtiType =
        (counts.E > counts.I ? 'E' : 'I') +
        (counts.S > counts.N ? 'S' : 'N') +
        (counts.T > counts.F ? 'T' : 'F') +
        (counts.J > counts.P ? 'J' : 'P');


    return {
        type: mbtiType,
        dimensions: {
            EI: counts.E > counts.I ? 'E' : 'I',
            SN: counts.S > counts.N ? 'S' : 'N',
            TF: counts.T > counts.F ? 'T' : 'F',
            JP: counts.J > counts.P ? 'J' : 'P'
        },
        scores: counts
    };
}


function calculateIQScore(chronologicalAge, iqAnswers, iqQuestions) {
    let correctAnswers = 0;
    const results = {};

    // Check each answer
    Object.entries(iqAnswers).forEach(([questionId, userAnswer]) => {
        const question = iqQuestions.find(q => q.id === parseInt(questionId));
        if (question && question.answer === userAnswer) {
            correctAnswers++;
        }
    });
    // Calculate raw score (out of 10)
    const rawScore = correctAnswers;


    // Calculate mental age (simplified formula)
    // Mental age increases with correct answers, max mental age for adults is typically age + 20
    let mentalAge;
    if (chronologicalAge <= 16) {
        // For younger individuals, mental age grows faster
        mentalAge = chronologicalAge + (correctAnswers * 2);
    } else {
        // For adults, mental age grows slower
        mentalAge = chronologicalAge + (correctAnswers * 1.5);
    }

    // Cap mental age
    mentalAge = Math.min(mentalAge, chronologicalAge + 30);

    // Calculate IQ score using standard formula: (Mental Age / Chronological Age) * 100
    const iqScore = Math.round((mentalAge / chronologicalAge) * 100);

    // Normalize to common IQ range (70-130)
    const normalizedIQ = Math.min(Math.max(iqScore, 70), 130);

    return {
        rawScore,
        correctAnswers,
        mentalAge: Math.round(mentalAge * 10) / 10,
        chronologicalAge,
        iq_score: normalizedIQ
    };
}

// IQ Questions data (same as frontend)
const iqQuestionsData = [
    { id: 1, question: "What comes next in the sequence: 2, 6, 12, 20, 30, ?", answer: "42" },
    { id: 2, question: "If all Bloops are Razzies and all Razzies are Lazzies, then all Bloops are definitely Lazzies?", answer: "True" },
    { id: 3, question: "Which word does NOT belong with the others?", answer: "Ounce" },
    { id: 4, question: "What is 15% of 200?", answer: "30" },
    { id: 5, question: "Complete the analogy: Book is to Reading as Fork is to:", answer: "Eating" },
    { id: 6, question: "If you rearrange the letters 'CIFAIPC', you would have the name of a:", answer: "Ocean" },
    { id: 7, question: "What number should come next: 1, 4, 9, 16, 25, ?", answer: "36" },
    { id: 8, question: "Which one of the five is least like the other four?", answer: "Snake" },
    { id: 9, question: "A train travels 60 miles in 1 hour. How far will it travel in 2.5 hours?", answer: "150 miles" },
    { id: 10, question: "What is the missing number: 3, 9, 27, 81, ?", answer: "243" },
    { id: 11, question: "Which word is the odd one out?", answer: "Still" },
    { id: 12, question: "If 5 machines take 5 minutes to make 5 widgets, how long would 100 machines take to make 100 widgets?", answer: "5 minutes" },
    { id: 13, question: "What comes next: A, C, F, J, O, ?", answer: "U" },
    { id: 14, question: "A is B's brother. C is B's mother. D is C's father. How is A related to D?", answer: "Grandson" },
    { id: 15, question: "Which number doesn't belong: 2, 3, 5, 7, 11, 14, 17?", answer: "14" },
    { id: 16, question: "If CAT = 24, DOG = 26, what does PIG equal?", answer: "32" },
    { id: 17, question: "Complete: 1, 1, 2, 3, 5, 8, 13, ?", answer: "21" },
    { id: 18, question: "Water is to ice as milk is to:", answer: "Cheese" },
    { id: 19, question: "What is half of a quarter of 400?", answer: "50" },
    { id: 20, question: "If RED = 27, GREEN = 49, what does BLUE equal?", answer: "40" },
    { id: 21, question: "Which shape has the most sides?", answer: "Decagon" },
    { id: 22, question: "Elephant is to Herd as Fish is to:", answer: "School" },
    { id: 23, question: "What number is 40% of 250?", answer: "100" },
    { id: 24, question: "If Monday is coded as 1, Wednesday is coded as 3, what is Friday coded as?", answer: "5" },
    { id: 25, question: "Which doesn't fit: Circle, Triangle, Square, Cube?", answer: "Cube" },
    { id: 26, question: "3² + 4² = ?", answer: "25" },
    { id: 27, question: "If SEND = VHQG, what does HELP equal?", answer: "KHOS" },
    { id: 28, question: "A clock shows 3:15. What is the angle between the hour and minute hands?", answer: "7.5°" },
    { id: 29, question: "Which word means the opposite of 'benevolent'?", answer: "Malevolent" },
    { id: 30, question: "What comes next: Z, X, V, T, R, ?", answer: "P" },
];


export  async function POST(request) {
    try {
        await dbConnect();
        const data = await request.json();
        if (!data.name || !data.age || !data.current_qualification) {
            return NextResponse.json(
                { error: 'Missing required fields: name, age, qualification' },
                { status: 400 }
            );
        }

        const mbtiResult = calculateMBTI(data.mbtiAnswers || {});

        // Calculate IQ score
        const iqResult = calculateIQScore(
            parseInt(data.age),
            data.iqAnswers || {},
            iqQuestionsData
        );

        const skillsArray = data.skills
            ? data.skills.split(',').map(skill => skill.trim()).filter(skill => skill.length > 0)
            : [];
        const interestsArray = data.skills
            ? data.skills.toLowerCase().includes('programming') ? ['Programming'] : []
            : [];


        // Create assessment document
        const assessmentData = {
            name: data.name,
            email: data.email || null,
            age: parseInt(data.age),
            current_qualification: data.current_qualification,

            personality: {
                type: mbtiResult.type,
                dimensions: mbtiResult.dimensions,
                mbtiAnswers: data.mbtiAnswers || {},
                evaluatedAt: new Date()
            },

            iq: {
                rawScore: iqResult.rawScore,
                correctAnswers: iqResult.correctAnswers,
                mentalAge: iqResult.mentalAge,
                chronologicalAge: iqResult.chronologicalAge,
                iq_score: iqResult.iq_score,
                iqAnswers: data.iqAnswers || {},
                assessedAt: new Date()
            },

            professionalProfile: {
                skills: skillsArray,
                interests: interestsArray,
                strengths: data.strengths || '',
                aspirations: data.aspirations || ''
            },

            isAssessmentComplete: true,
            completedAt: new Date()
        };
        const assessment = new CareerAssessment(assessmentData);
        await assessment.save();

        return NextResponse.json({
            success: true,
            message: 'Assessment saved successfully',
            data: {
                id: assessment._id,
                mbtiType: mbtiResult.type,
                iqScore: iqResult.iq_score,
                completionDate: assessment.completedAt
            }
        }, { status: 201 });
    } catch (error) {
        console.error('Error saving assessment:', error);
        return NextResponse.json(
            { error: 'Failed to save assessment', details: error.message },
            { status: 500 }
        );
    }
}



// GET handler to retrieve assessments
export async function GET(request) {
  try {
    await dbConnect();

    const { searchParams } = new URL(request.url);
    const email = searchParams.get('email');
    const assessmentId = searchParams.get('id');

    if (assessmentId) {
      // Get specific assessment by ID
      const assessment = await CareerAssessment.findById(assessmentId);
      if (!assessment) {
        return NextResponse.json(
          { error: 'Assessment not found' },
          { status: 404 }
        );
      }
      return NextResponse.json({ success: true, data: assessment });
    }

    if (email) {
      // Get assessments by email
      const assessments = await CareerAssessment.find({ email }).sort({ completedAt: -1 });
      return NextResponse.json({ success: true, data: assessments });
    }

    // Get all assessments (for admin purposes)
    const assessments = await CareerAssessment.find({}).sort({ completedAt: -1 }).limit(100);
    return NextResponse.json({ success: true, data: assessments });

  } catch (error) {
    console.error('Error fetching assessments:', error);
    return NextResponse.json(
      { error: 'Failed to fetch assessments' },
      { status: 500 }
    );
  }
}