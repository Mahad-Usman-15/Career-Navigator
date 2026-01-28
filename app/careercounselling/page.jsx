"use client"

import { useState, useMemo } from "react"
import { X, ChevronRight, ChevronLeft, User, Brain, Lightbulb, Target, Sparkles, CheckCircle2 } from "lucide-react"

// MBTI Questions Data
const mbtiQuestions = {
  EI: [
    { id: "ei1", question: "At a party, you tend to:", options: ["Interact with many, including strangers", "Interact with a few, known to you"] },
    { id: "ei2", question: "You feel more energized after:", options: ["Spending time with a group of people", "Spending time alone or with one close friend"] },
    { id: "ei3", question: "In conversations, you usually:", options: ["Initiate and keep the conversation going", "Wait for others to approach you"] },
    { id: "ei4", question: "When working on a project, you prefer:", options: ["Collaborating with a team", "Working independently"] },
    { id: "ei5", question: "Your ideal weekend involves:", options: ["Going out and socializing", "Staying home and relaxing"] },
  ],
  SN: [
    { id: "sn1", question: "You are more interested in:", options: ["What is actual and present", "What is possible and future"] },
    { id: "sn2", question: "When learning something new, you prefer:", options: ["Hands-on experience and facts", "Theories and abstract concepts"] },
    { id: "sn3", question: "You tend to focus more on:", options: ["Details and specifics", "The big picture and patterns"] },
    { id: "sn4", question: "You trust more:", options: ["Your direct experience", "Your gut instincts and hunches"] },
    { id: "sn5", question: "When reading, you prefer:", options: ["Literal and straightforward content", "Figurative and symbolic content"] },
  ],
  TF: [
    { id: "tf1", question: "When making decisions, you rely more on:", options: ["Logic and objective analysis", "Personal values and how others feel"] },
    { id: "tf2", question: "You value more in others:", options: ["Competence and fairness", "Empathy and compassion"] },
    { id: "tf3", question: "When giving feedback, you tend to be:", options: ["Direct and honest, even if it hurts", "Tactful and considerate of feelings"] },
    { id: "tf4", question: "In a conflict, you prioritize:", options: ["Finding the most logical solution", "Maintaining harmony and relationships"] },
    { id: "tf5", question: "You are more convinced by:", options: ["A well-reasoned argument", "A heartfelt appeal"] },
  ],
  JP: [
    { id: "jp1", question: "You prefer to:", options: ["Have things decided and settled", "Keep options open and flexible"] },
    { id: "jp2", question: "Your workspace is usually:", options: ["Organized and structured", "Flexible and adaptable to change"] },
    { id: "jp3", question: "When starting a project, you:", options: ["Plan thoroughly before beginning", "Dive in and figure it out as you go"] },
    { id: "jp4", question: "Deadlines make you feel:", options: ["Focused and productive", "Stressed and constrained"] },
    { id: "jp5", question: "You prefer schedules that are:", options: ["Fixed and predictable", "Spontaneous and changeable"] },
  ],
}

// IQ Questions Data
const iqQuestions = [
  { id: 1, question: "What comes next in the sequence: 2, 6, 12, 20, 30, ?", options: ["40", "42", "44", "48"], answer: "42" },
  { id: 2, question: "If all Bloops are Razzies and all Razzies are Lazzies, then all Bloops are definitely Lazzies?", options: ["True", "False", "Cannot be determined", "Sometimes"], answer: "True" },
  { id: 3, question: "Which word does NOT belong with the others?", options: ["Inch", "Ounce", "Centimeter", "Yard"], answer: "Ounce" },
  { id: 4, question: "What is 15% of 200?", options: ["25", "30", "35", "40"], answer: "30" },
  { id: 5, question: "Complete the analogy: Book is to Reading as Fork is to:", options: ["Drawing", "Writing", "Eating", "Cooking"], answer: "Eating" },
  { id: 6, question: "If you rearrange the letters 'CIFAIPC', you would have the name of a:", options: ["City", "Animal", "Ocean", "Country"], answer: "Ocean" },
  { id: 7, question: "What number should come next: 1, 4, 9, 16, 25, ?", options: ["30", "36", "49", "64"], answer: "36" },
  { id: 8, question: "Which one of the five is least like the other four?", options: ["Bear", "Snake", "Cow", "Dog"], answer: "Snake" },
  { id: 9, question: "A train travels 60 miles in 1 hour. How far will it travel in 2.5 hours?", options: ["120 miles", "140 miles", "150 miles", "180 miles"], answer: "150 miles" },
  { id: 10, question: "What is the missing number: 3, 9, 27, 81, ?", options: ["162", "243", "324", "729"], answer: "243" },
  { id: 11, question: "Which word is the odd one out?", options: ["Swift", "Fast", "Quick", "Still"], answer: "Still" },
  { id: 12, question: "If 5 machines take 5 minutes to make 5 widgets, how long would 100 machines take to make 100 widgets?", options: ["5 minutes", "20 minutes", "100 minutes", "500 minutes"], answer: "5 minutes" },
  { id: 13, question: "What comes next: A, C, F, J, O, ?", options: ["T", "U", "V", "W"], answer: "U" },
  { id: 14, question: "A is B's brother. C is B's mother. D is C's father. How is A related to D?", options: ["Grandson", "Son", "Grandfather", "Uncle"], answer: "Grandson" },
  { id: 15, question: "Which number doesn't belong: 2, 3, 5, 7, 11, 14, 17?", options: ["3", "7", "14", "17"], answer: "14" },
  { id: 16, question: "If CAT = 24, DOG = 26, what does PIG equal?", options: ["24", "26", "32", "34"], answer: "32" },
  { id: 17, question: "Complete: 1, 1, 2, 3, 5, 8, 13, ?", options: ["18", "20", "21", "26"], answer: "21" },
  { id: 18, question: "Water is to ice as milk is to:", options: ["Cream", "Cheese", "Butter", "Frozen milk"], answer: "Cheese" },
  { id: 19, question: "What is half of a quarter of 400?", options: ["25", "50", "100", "200"], answer: "50" },
  { id: 20, question: "If RED = 27, GREEN = 49, what does BLUE equal?", options: ["36", "40", "42", "44"], answer: "40" },
  { id: 21, question: "Which shape has the most sides?", options: ["Pentagon", "Hexagon", "Octagon", "Decagon"], answer: "Decagon" },
  { id: 22, question: "Elephant is to Herd as Fish is to:", options: ["Flock", "Pack", "School", "Swarm"], answer: "School" },
  { id: 23, question: "What number is 40% of 250?", options: ["80", "90", "100", "110"], answer: "100" },
  { id: 24, question: "If Monday is coded as 1, Wednesday is coded as 3, what is Friday coded as?", options: ["4", "5", "6", "7"], answer: "5" },
  { id: 25, question: "Which doesn't fit: Circle, Triangle, Square, Cube?", options: ["Circle", "Triangle", "Square", "Cube"], answer: "Cube" },
  { id: 26, question: "3² + 4² = ?", options: ["7", "12", "24", "25"], answer: "25" },
  { id: 27, question: "If SEND = VHQG, what does HELP equal?", options: ["KHPS", "JHOS", "KHOS", "LIPS"], answer: "KHOS" },
  { id: 28, question: "A clock shows 3:15. What is the angle between the hour and minute hands?", options: ["0°", "7.5°", "15°", "22.5°"], answer: "7.5°" },
  { id: 29, question: "Which word means the opposite of 'benevolent'?", options: ["Kind", "Malevolent", "Generous", "Helpful"], answer: "Malevolent" },
  { id: 30, question: "What comes next: Z, X, V, T, R, ?", options: ["O", "P", "Q", "S"], answer: "P" },
]

const steps = [
  { id: 1, title: "Personal Info", icon: User },
  { id: 2, title: "Personality", icon: Brain },
  { id: 3, title: "IQ Test", icon: Lightbulb },
  { id: 4, title: "Skills", icon: Target },
  { id: 5, title: "Strengths", icon: Sparkles },
  { id: 6, title: "Aspirations", icon: CheckCircle2 },
]

export default function CareerCounsellor() {
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [currentStep, setCurrentStep] = useState(1)
  const [isCompleted, setIsCompleted] = useState(false)
  
  // Form data
  const [personalInfo, setPersonalInfo] = useState({ name: "", age: "", qualifications: [] })
  const [mbtiAnswers, setMbtiAnswers] = useState({})
  const [iqAnswers, setIqAnswers] = useState({})
  const [skills, setSkills] = useState("")
  const [strengths, setStrengths] = useState("")
  const [aspirations, setAspirations] = useState("")
  const [randomIqQuestions, setRandomIqQuestions] = useState([])

  const qualificationOptions = ["School", "College", "Undergraduate"]

  // Function to shuffle array using Fisher-Yates algorithm
  const shuffleArray = (array) => {
    const shuffled = [...array]
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1))
      ;[shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]]
    }
    return shuffled
  }

  // Function to generate 10 random questions
  const generateRandomIqQuestions = () => {
    const shuffled = shuffleArray(iqQuestions)
    return shuffled.slice(0, 10)
  }

  const handleQualificationChange = (qual) => {
    setPersonalInfo(prev => ({
      ...prev,
      qualifications: prev.qualifications.includes(qual)
        ? prev.qualifications.filter(q => q !== qual)
        : [...prev.qualifications, qual]
    }))
  }

  const handleMbtiAnswer = (questionId, answerIndex) => {
    setMbtiAnswers(prev => ({ ...prev, [questionId]: answerIndex }))
  }

  const handleIqAnswer = (questionId, answer) => {
    setIqAnswers(prev => ({ ...prev, [questionId]: answer }))
  }

  const isStep1Valid = personalInfo.name.trim() && personalInfo.age && personalInfo.qualifications.length > 0
  const isStep2Valid = Object.keys(mbtiAnswers).length === 20
  const isStep3Valid = Object.keys(iqAnswers).length === 10
  const isStep4Valid = skills.trim().length > 10
  const isStep5Valid = strengths.trim().length > 10
  const isStep6Valid = aspirations.trim().length > 10

  const canProceed = () => {
    switch (currentStep) {
      case 1: return isStep1Valid
      case 2: return isStep2Valid
      case 3: return isStep3Valid
      case 4: return isStep4Valid
      case 5: return isStep5Valid
      case 6: return isStep6Valid
      default: return false
    }
  }

  const handleNext = () => {
    if (currentStep < 6) {
      setCurrentStep(prev => prev + 1)
    }
  }

  const handlePrevious = () => {
    if (currentStep > 1) {
      setCurrentStep(prev => prev - 1)
    }
  }

  const handleComplete = () => {
    setIsCompleted(true)
    setIsModalOpen(false)
  }

  const openModal = () => {
    setIsModalOpen(true)
    setCurrentStep(1)
    setRandomIqQuestions(generateRandomIqQuestions())
    setIqAnswers({})
  }

  return (
    <main className="min-h-screen bg-[#171717]">
      {/* Hero Section */}
      <section className="relative overflow-hidden">
        {/* Background decoration */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-20 left-10 w-72 h-72 bg-blue-500/10 rounded-full blur-3xl" />
          <div className="absolute bottom-20 right-10 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl" />
        </div>

        <div className="relative max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-24 sm:py-32">
          <div className="text-center space-y-8">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 text-sm text-white/70">
              <Sparkles className="w-4 h-4 text-cyan-400" />
              AI-Powered Career Guidance
            </div>

            {/* Headline */}
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold leading-tight">
              <span className="bg-linear-to-r from-blue-600 via-blue-400 to-cyan-400 bg-clip-text text-transparent">
                Discover Your
              </span>
              <br />
              <span className="bg-linear-to-r from-cyan-400 via-blue-400 to-blue-600 bg-clip-text text-transparent">
                Perfect Career Path
              </span>
            </h1>

            {/* Tagline */}
            <p className="text-lg sm:text-xl text-white/80 max-w-2xl mx-auto leading-relaxed">
              Take our comprehensive career assessment combining personality analysis, 
              cognitive evaluation, and personal interests to find careers that truly match who you are.
            </p>

            {/* CTA Button */}
            <div className="pt-4">
              {isCompleted ? (
                <div className="inline-flex items-center gap-3 px-8 py-4 rounded-2xl bg-linear-to-r from-green-500 to-emerald-500 text-white font-semibold text-lg">
                  <CheckCircle2 className="w-6 h-6" />
                  Assessment Completed
                </div>
              ) : (
                <button
                  onClick={openModal}
                  className="group inline-flex items-center gap-3 px-8 py-4 rounded-2xl bg-linear-to-r from-blue-600 to-cyan-500 text-white font-semibold text-lg shadow-lg shadow-blue-500/25 hover:shadow-blue-500/40 hover:scale-105 transition-all duration-300"
                >
                  Start Career Assessment
                  <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </button>
              )}
            </div>

            {/* Features */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 pt-12 max-w-3xl mx-auto">
              {[
                { icon: Brain, title: "MBTI Analysis", desc: "Discover your personality type" },
                { icon: Lightbulb, title: "IQ Assessment", desc: "Evaluate cognitive abilities" },
                { icon: Target, title: "Career Match", desc: "Find your ideal path" },
              ].map((feature, index) => (
                <div key={index} className="p-6 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-sm">
                  <feature.icon className="w-8 h-8 text-cyan-400 mb-3 mx-auto" />
                  <h3 className="text-white font-semibold mb-1">{feature.title}</h3>
                  <p className="text-white/60 text-sm">{feature.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Test Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="relative w-full max-w-4xl max-h-[90vh] bg-[#1a1a1a] rounded-3xl border border-white/10 shadow-2xl overflow-hidden flex flex-col">
            {/* Modal Header */}
            <div className="shrink-0 p-6 border-b border-white/10">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold bg-linear-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">
                  Career Assessment
                </h2>
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="p-2 rounded-full hover:bg-white/10 text-white/60 hover:text-white transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Stepper */}
              <div className="flex items-center justify-between">
                {steps.map((step, index) => {
                  const StepIcon = step.icon
                  const isActive = currentStep === step.id
                  const isComplete = currentStep > step.id

                  return (
                    <div key={step.id} className="flex items-center flex-1">
                      <div className="flex flex-col items-center">
                        <div
                          className={`w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300 ${
                            isComplete
                              ? "bg-linear-to-r from-green-500 to-emerald-500 text-white"
                              : isActive
                              ? "bg-linear-to-r from-blue-500 to-cyan-500 text-white ring-4 ring-blue-500/30"
                              : "bg-white/10 text-white/40"
                          }`}
                        >
                          {isComplete ? (
                            <CheckCircle2 className="w-5 h-5" />
                          ) : (
                            <StepIcon className="w-5 h-5" />
                          )}
                        </div>
                        <span className={`text-xs mt-2 hidden sm:block ${isActive ? "text-cyan-400" : "text-white/40"}`}>
                          {step.title}
                        </span>
                      </div>
                      {index < steps.length - 1 && (
                        <div
                          className={`flex-1 h-0.5 mx-2 transition-colors duration-300 ${
                            isComplete ? "bg-linear-to-r from-green-500 to-emerald-500" : "bg-white/10"
                          }`}
                        />
                      )}
                    </div>
                  )
                })}
              </div>
            </div>

            {/* Modal Content */}
            <div className="flex-1 overflow-y-auto p-6">
              {/* Step 1: Personal Information */}
              {currentStep === 1 && (
                <div className="space-y-6">
                  <div>
                    <h3 className="text-2xl font-semibold bg-linear-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent mb-2">
                      Personal Information
                    </h3>
                    <p className="text-white/60">
                      We need some basic information to personalize your career recommendations. 
                      Your data helps us understand your educational background and life stage.
                    </p>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <label className="block text-white text-sm font-medium mb-2">Full Name</label>
                      <input
                        type="text"
                        value={personalInfo.name}
                        onChange={(e) => setPersonalInfo(prev => ({ ...prev, name: e.target.value }))}
                        placeholder="Enter your full name"
                        className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-cyan-500/50 focus:border-transparent transition-all"
                      />
                    </div>

                    <div>
                      <label className="block text-white text-sm font-medium mb-2">Age</label>
                      <input
                        type="number"
                        value={personalInfo.age}
                        onChange={(e) => setPersonalInfo(prev => ({ ...prev, age: e.target.value }))}
                        placeholder="Enter your age"
                        min="13"
                        max="100"
                        className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-cyan-500/50 focus:border-transparent transition-all"
                      />
                    </div>

                    <div>
                      <label className="block text-white text-sm font-medium mb-3">
                        Current Qualification Level
                      </label>
                      <div className="space-y-3">
                        {qualificationOptions.map((qual) => (
                          <label
                            key={qual}
                            className={`flex items-center gap-3 p-4 rounded-xl border cursor-pointer transition-all ${
                              personalInfo.qualifications.includes(qual)
                                ? "bg-cyan-500/10 border-cyan-500/50"
                                : "bg-white/5 border-white/10 hover:bg-white/10"
                            }`}
                          >
                            <input
                              type="checkbox"
                              checked={personalInfo.qualifications.includes(qual)}
                              onChange={() => handleQualificationChange(qual)}
                              className="w-5 h-5 rounded border-white/20 text-cyan-500 focus:ring-cyan-500/50 bg-transparent"
                            />
                            <span className="text-white">{qual}</span>
                          </label>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Step 2: MBTI Personality Test */}
              {currentStep === 2 && (
                <div className="space-y-6">
                  <div>
                    <h3 className="text-2xl font-semibold bg-linear-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent mb-2">
                      Personality Type Assessment
                    </h3>
                    <p className="text-white/60">
                      Answer all 20 questions honestly based on your natural preferences. 
                      There are no right or wrong answers.
                    </p>
                    <div className="mt-3 p-3 rounded-lg bg-cyan-500/10 border border-cyan-500/20">
                      <p className="text-cyan-400 text-sm">
                        Progress: {Object.keys(mbtiAnswers).length} / 20 questions answered
                      </p>
                    </div>
                  </div>

                  {/* Extraversion vs Introversion */}
                  <div className="space-y-4">
                    <h4 className="text-lg font-medium text-blue-400 border-b border-white/10 pb-2">
                      Extraversion (E) vs Introversion (I)
                    </h4>
                    {mbtiQuestions.EI.map((q, idx) => (
                      <div key={q.id} className="p-4 rounded-xl bg-white/5 border border-white/10">
                        <p className="text-white mb-3">{idx + 1}. {q.question}</p>
                        <div className="space-y-2">
                          {q.options.map((option, optIdx) => (
                            <label
                              key={optIdx}
                              className={`flex items-center gap-3 p-3 rounded-lg cursor-pointer transition-all ${
                                mbtiAnswers[q.id] === optIdx
                                  ? "bg-cyan-500/20 border border-cyan-500/50"
                                  : "bg-white/5 hover:bg-white/10"
                              }`}
                            >
                              <input
                                type="radio"
                                name={q.id}
                                checked={mbtiAnswers[q.id] === optIdx}
                                onChange={() => handleMbtiAnswer(q.id, optIdx)}
                                className="w-4 h-4 text-cyan-500 focus:ring-cyan-500/50 bg-transparent border-white/20"
                              />
                              <span className="text-white/80">{option}</span>
                            </label>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Sensing vs Intuition */}
                  <div className="space-y-4">
                    <h4 className="text-lg font-medium text-blue-400 border-b border-white/10 pb-2">
                      Sensing (S) vs Intuition (N)
                    </h4>
                    {mbtiQuestions.SN.map((q, idx) => (
                      <div key={q.id} className="p-4 rounded-xl bg-white/5 border border-white/10">
                        <p className="text-white mb-3">{idx + 6}. {q.question}</p>
                        <div className="space-y-2">
                          {q.options.map((option, optIdx) => (
                            <label
                              key={optIdx}
                              className={`flex items-center gap-3 p-3 rounded-lg cursor-pointer transition-all ${
                                mbtiAnswers[q.id] === optIdx
                                  ? "bg-cyan-500/20 border border-cyan-500/50"
                                  : "bg-white/5 hover:bg-white/10"
                              }`}
                            >
                              <input
                                type="radio"
                                name={q.id}
                                checked={mbtiAnswers[q.id] === optIdx}
                                onChange={() => handleMbtiAnswer(q.id, optIdx)}
                                className="w-4 h-4 text-cyan-500 focus:ring-cyan-500/50 bg-transparent border-white/20"
                              />
                              <span className="text-white/80">{option}</span>
                            </label>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Thinking vs Feeling */}
                  <div className="space-y-4">
                    <h4 className="text-lg font-medium text-blue-400 border-b border-white/10 pb-2">
                      Thinking (T) vs Feeling (F)
                    </h4>
                    {mbtiQuestions.TF.map((q, idx) => (
                      <div key={q.id} className="p-4 rounded-xl bg-white/5 border border-white/10">
                        <p className="text-white mb-3">{idx + 11}. {q.question}</p>
                        <div className="space-y-2">
                          {q.options.map((option, optIdx) => (
                            <label
                              key={optIdx}
                              className={`flex items-center gap-3 p-3 rounded-lg cursor-pointer transition-all ${
                                mbtiAnswers[q.id] === optIdx
                                  ? "bg-cyan-500/20 border border-cyan-500/50"
                                  : "bg-white/5 hover:bg-white/10"
                              }`}
                            >
                              <input
                                type="radio"
                                name={q.id}
                                checked={mbtiAnswers[q.id] === optIdx}
                                onChange={() => handleMbtiAnswer(q.id, optIdx)}
                                className="w-4 h-4 text-cyan-500 focus:ring-cyan-500/50 bg-transparent border-white/20"
                              />
                              <span className="text-white/80">{option}</span>
                            </label>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Judging vs Perceiving */}
                  <div className="space-y-4">
                    <h4 className="text-lg font-medium text-blue-400 border-b border-white/10 pb-2">
                      Judging (J) vs Perceiving (P)
                    </h4>
                    {mbtiQuestions.JP.map((q, idx) => (
                      <div key={q.id} className="p-4 rounded-xl bg-white/5 border border-white/10">
                        <p className="text-white mb-3">{idx + 16}. {q.question}</p>
                        <div className="space-y-2">
                          {q.options.map((option, optIdx) => (
                            <label
                              key={optIdx}
                              className={`flex items-center gap-3 p-3 rounded-lg cursor-pointer transition-all ${
                                mbtiAnswers[q.id] === optIdx
                                  ? "bg-cyan-500/20 border border-cyan-500/50"
                                  : "bg-white/5 hover:bg-white/10"
                              }`}
                            >
                              <input
                                type="radio"
                                name={q.id}
                                checked={mbtiAnswers[q.id] === optIdx}
                                onChange={() => handleMbtiAnswer(q.id, optIdx)}
                                className="w-4 h-4 text-cyan-500 focus:ring-cyan-500/50 bg-transparent border-white/20"
                              />
                              <span className="text-white/80">{option}</span>
                            </label>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Step 3: IQ Test */}
              {currentStep === 3 && (
                <div className="space-y-6">
                  <div>
                    <h3 className="text-2xl font-semibold bg-linear-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent mb-2">
                      Cognitive Assessment
                    </h3>
                    <p className="text-white/60">
                      Complete all 10 questions to assess your problem-solving and logical reasoning abilities.
                      Take your time and think carefully.
                    </p>
                    <div className="mt-3 p-3 rounded-lg bg-cyan-500/10 border border-cyan-500/20">
                      <p className="text-cyan-400 text-sm">
                        Progress: {Object.keys(iqAnswers).length} / 10 questions answered
                      </p>
                    </div>
                  </div>

                  <div className="space-y-4">
                    {randomIqQuestions.map((q, idx) => (
                      <div key={q.id} className="p-4 rounded-xl bg-white/5 border border-white/10">
                        <p className="text-white mb-3 font-medium">{idx + 1}. {q.question}</p>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                          {q.options.map((option, optIdx) => (
                            <label
                              key={optIdx}
                              className={`flex items-center gap-3 p-3 rounded-lg cursor-pointer transition-all ${
                                iqAnswers[q.id] === option
                                  ? "bg-cyan-500/20 border border-cyan-500/50"
                                  : "bg-white/5 hover:bg-white/10"
                              }`}
                            >
                              <input
                                type="radio"
                                name={`iq-${q.id}`}
                                checked={iqAnswers[q.id] === option}
                                onChange={() => handleIqAnswer(q.id, option)}
                                className="w-4 h-4 text-cyan-500 focus:ring-cyan-500/50 bg-transparent border-white/20"
                              />
                              <span className="text-white/80">{option}</span>
                            </label>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Step 4: Skills & Interests */}
              {currentStep === 4 && (
                <div className="space-y-6">
                  <div>
                    <h3 className="text-2xl font-semibold bg-linear-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent mb-2">
                      Skills & Interests
                    </h3>
                    <p className="text-white/60">
                      Tell us about your skills and interests. What are you good at? What do you enjoy doing?
                      Be as detailed as possible.
                    </p>
                  </div>

                  <div className="p-4 rounded-xl bg-blue-500/10 border border-blue-500/20">
                    <p className="text-blue-400 text-sm">
                      <strong>Examples:</strong> Programming, public speaking, creative writing, data analysis, 
                      leadership, problem-solving, art & design, music, sports, teaching, research, etc.
                    </p>
                  </div>

                  <div>
                    <label className="block text-white text-sm font-medium mb-2">
                      Describe your skills and interests
                    </label>
                    <textarea
                      value={skills}
                      onChange={(e) => setSkills(e.target.value)}
                      placeholder="I am skilled in... I'm interested in..."
                      rows={8}
                      className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-cyan-500/50 focus:border-transparent transition-all resize-none"
                    />
                    <p className="text-white/40 text-sm mt-2">
                      Minimum 10 characters required ({skills.length} / 10)
                    </p>
                  </div>
                </div>
              )}

              {/* Step 5: Strengths & Weaknesses */}
              {currentStep === 5 && (
                <div className="space-y-6">
                  <div>
                    <h3 className="text-2xl font-semibold bg-linear-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent mb-2">
                      Strengths & Weaknesses
                    </h3>
                    <p className="text-white/60">
                      Honest self-assessment is key to finding the right career. What are your greatest strengths? 
                      What areas do you want to improve?
                    </p>
                  </div>

                  <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/20">
                    <p className="text-amber-400 text-sm">
                      <strong>Tip:</strong> Think about feedback you've received from teachers, mentors, or colleagues. 
                      Consider both professional and personal qualities.
                    </p>
                  </div>

                  <div>
                    <label className="block text-white text-sm font-medium mb-2">
                      Describe your strengths and weaknesses
                    </label>
                    <textarea
                      value={strengths}
                      onChange={(e) => setStrengths(e.target.value)}
                      placeholder="My strengths include... Areas I want to improve are..."
                      rows={8}
                      className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-cyan-500/50 focus:border-transparent transition-all resize-none"
                    />
                    <p className="text-white/40 text-sm mt-2">
                      Minimum 10 characters required ({strengths.length} / 10)
                    </p>
                  </div>
                </div>
              )}

              {/* Step 6: Future Aspirations */}
              {currentStep === 6 && (
                <div className="space-y-6">
                  <div>
                    <h3 className="text-2xl font-semibold bg-linear-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent mb-2">
                      Future Aspirations
                    </h3>
                    <p className="text-white/60">
                      Dream big! What do you want to achieve in your career and life? 
                      Where do you see yourself in 5, 10, or 20 years?
                    </p>
                  </div>

                  <div className="p-4 rounded-xl bg-green-500/10 border border-green-500/20">
                    <p className="text-green-400 text-sm">
                      <strong>Remember:</strong> Your aspirations shape your journey. Think about the impact you want 
                      to make, the lifestyle you desire, and the legacy you want to leave.
                    </p>
                  </div>

                  <div>
                    <label className="block text-white text-sm font-medium mb-2">
                      What do you want to pursue in the future?
                    </label>
                    <textarea
                      value={aspirations}
                      onChange={(e) => setAspirations(e.target.value)}
                      placeholder="In the future, I want to... My dream career is... I aspire to..."
                      rows={8}
                      className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-cyan-500/50 focus:border-transparent transition-all resize-none"
                    />
                    <p className="text-white/40 text-sm mt-2">
                      Minimum 10 characters required ({aspirations.length} / 10)
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="shrink-0 p-6 border-t border-white/10 flex items-center justify-between">
              <button
                onClick={handlePrevious}
                disabled={currentStep === 1}
                className="flex items-center gap-2 px-6 py-3 rounded-xl bg-white/5 text-white hover:bg-white/10 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
              >
                <ChevronLeft className="w-5 h-5" />
                Previous
              </button>

              {currentStep < 6 ? (
                <button
                  onClick={handleNext}
                  disabled={!canProceed()}
                  className="flex items-center gap-2 px-6 py-3 rounded-xl bg-linear-to-r from-blue-600 to-cyan-500 text-white font-medium disabled:opacity-30 disabled:cursor-not-allowed hover:shadow-lg hover:shadow-blue-500/25 transition-all"
                >
                  Next Step
                  <ChevronRight className="w-5 h-5" />
                </button>
              ) : (
                <button
                  onClick={handleComplete}
                  disabled={!canProceed()}
                  className="flex items-center gap-2 px-6 py-3 rounded-xl bg-linear-to-r from-green-500 to-emerald-500 text-white font-medium disabled:opacity-30 disabled:cursor-not-allowed hover:shadow-lg hover:shadow-green-500/25 transition-all"
                >
                  <CheckCircle2 className="w-5 h-5" />
                  Complete Assessment
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </main>
  )
}
