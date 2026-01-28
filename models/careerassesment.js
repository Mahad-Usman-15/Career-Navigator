import mongoose from 'mongoose';

// 1. Clerk Identity Schema (Clerk Backend User Sync)
const ClerkIdentitySchema = new mongoose.Schema({
  clerkId: { type: String, required: true, unique: true }, // The 'id' from Clerk
  username: { type: String, default: null },
  createdAtClerk: { type: Number }, // Clerk's unix timestamp
  imageUrl: { type: String },
  lastSignInAt: { type: Number }
});

// 2. Personality Evaluation Schema
const PersonalitySchema = new mongoose.Schema({
  type: { 
    type: String, 
    enum: ['ISTJ', 'ISFJ', 'INFJ', 'INTJ', 'ISTP', 'ISFP', 'INFP', 'INTP', 'ESTP', 'ESFP', 'ENFP', 'ENTP', 'ESTJ', 'ESFJ', 'ENFJ', 'ENTJ'],
    required: true 
  },
  evaluatedAt: { type: Date, default: Date.now }
});

// 3. IQ & Cognitive Schema
const IQAssessmentSchema = new mongoose.Schema({
  rawScore: { type: Number, min: 0, max: 10 }, // Out of 10 random questions
  mentalAge: { type: Number },
  chronologicalAge: { type: Number }, // Derived from Personal Info
  iq_level: { type: Number }, // Calculated: (Mental Age / Chronological Age) * 100
  assessedAt: { type: Date, default: Date.now }
});

// 4. Interests & Skills Schema
const SkillsSchema = new mongoose.Schema({
  skills: [{ type: String }], // Array to support multiple skills e.g., ["Programming"]
  interests: [{ type: String }] // e.g., ["Writing"]
});

// ==========================================
// MAIN COLLECTIVE SCHEMA
// ==========================================
const CareerAssessmentSchema = new mongoose.Schema({
  // Personal Information
  name: { type: String, required: true },
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
}, { 
  collection: 'careerassessment', // Force collection name
  timestamps: true 
});

// Prevents model recompilation error in Next.js development
const User = mongoose.models.User || mongoose.model('User', CareerAssessmentSchema);

export default User;