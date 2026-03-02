import mongoose from 'mongoose';

// 1. Clerk Identity Schema (Clerk Backend User Sync)
const ClerkIdentitySchema = new mongoose.Schema({
  clerkId: { type: String, required: true, unique: true },
  username: { type: String, default: null },
  createdAtClerk: { type: Number },
  imageUrl: { type: String },
  lastSignInAt: { type: Number }
}, { _id: false });

// 2. Personality Evaluation Schema
const PersonalitySchema = new mongoose.Schema({
  type: { 
    type: String, 
    enum: ['ISTJ', 'ISFJ', 'INFJ', 'INTJ', 'ISTP', 'ISFP', 'INFP', 'INTP', 'ESTP', 'ESFP', 'ENFP', 'ENTP', 'ESTJ', 'ESFJ', 'ENFJ', 'ENTJ'],
    required: true 
  },
  evaluatedAt: { type: Date, default: Date.now },
  mbtiAnswers: { type: Object }, // Store all MBTI answers for reference
  dimensions: {
    EI: { type: String, enum: ['E', 'I'] },
    SN: { type: String, enum: ['S', 'N'] },
    TF: { type: String, enum: ['T', 'F'] },
    JP: { type: String, enum: ['J', 'P'] }
  }
}, { _id: false });

// 3. IQ & Cognitive Schema
const IQAssessmentSchema = new mongoose.Schema({
  rawScore: { type: Number, min: 0, max: 10 },
  totalQuestions: { type: Number, default: 10 },
  mentalAge: { type: Number },
  chronologicalAge: { type: Number },
  iq_score: { type: Number }, // Changed from iq_level to iq_score
  assessedAt: { type: Date, default: Date.now },
  iqAnswers: { type: Object }, // Store all IQ answers for reference
  correctAnswers: { type: Number }
}, { _id: false });

// 4. Interests & Skills Schema
const SkillsSchema = new mongoose.Schema({
  skills: [{ type: String }],
  interests: [{ type: String }],
  strengths: { type: String },
  aspirations: { type: String }
}, { _id: false });

// ==========================================
// MAIN COLLECTIVE SCHEMA
// ==========================================
const CareerAssessmentSchema = new mongoose.Schema({
  // Personal Information
  name: { type: String, required: true },
  email: { type: String }, // Add email field
  age: { type: Number, required: true },
  
  // Qualification
  current_qualification: { 
    type: String, 
    enum: ['School', 'College', 'Under Graduate'],
    required: true 
  },

  // Embedded Sub-Documents
  clerkData: ClerkIdentitySchema,
  personality: PersonalitySchema,
  iq: IQAssessmentSchema,
  professionalProfile: SkillsSchema,

  // Metadata
  isAssessmentComplete: { type: Boolean, default: false },
  completedAt: { type: Date },
}, { 
  collection: 'careerassessment',
  timestamps: true 
});

// Create index for faster queries
CareerAssessmentSchema.index({ email: 1 });
CareerAssessmentSchema.index({ isAssessmentComplete: 1 });

// Prevent model recompilation error in development
const CareerAssessment = mongoose.models.CareerAssessment || 
  mongoose.model('CareerAssessment', CareerAssessmentSchema);

export default CareerAssessment;