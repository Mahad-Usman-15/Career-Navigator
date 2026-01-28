import mongoose from 'mongoose';

const RoadmapStepSchema = new mongoose.Schema({
  title: { type: String, required: true }, // e.g., "Learn Python"
  description: { type: String }, // e.g., "Focus on NumPy and Pandas"
  duration: { type: String }, // e.g., "3 Months"
  resources: [{ 
    name: String, 
    type: { type: String, enum: ['Course', 'Certification', 'Book', 'Project'] },
    link: String 
  }]
});

const CareerPathSchema = new mongoose.Schema({
  title: { type: String, required: true }, // e.g., "Data Analyst"
  matchScore: { type: Number, min: 0, max: 100 }, // How well it fits the user's IQ/Personality
  reasoning: { type: String }, // Why the AI picked this (e.g., "High logical IQ + ISTJ traits")
  marketOutlook: { type: String }, // e.g., "High Demand in Karachi tech sector"
  roadmap: [RoadmapStepSchema] // Sequential steps to achieve this career
});

const CareerGuidanceSchema = new mongoose.Schema({
  // 1. Relational Links
  clerkId: { type: String, required: true, index: true },
  
  // 2. Snapshots of data used for this specific generation
  // (Important for history if the user's skills change later)
  assessmentSnapshot: {
    iq_level: Number,
    personalityType: String,
    current_qualification: String
  },

  // 3. AI Generated Content
  recommendations: [CareerPathSchema], // Array of 3-5 paths
  
  // 4. Global Roadmap Timeline
  // A summarized view of the next 1-2 years
  overallTimeline: {
    shortTermGoal: String,
    longTermGoal: String
  },

  generatedAt: { type: Date, default: Date.now }
}, { 
  collection: 'careerguidance',
  timestamps: true 
});

const CareerGuidance = mongoose.models.CareerGuidance || mongoose.model('CareerGuidance', CareerGuidanceSchema);

export default CareerGuidance;