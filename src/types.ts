export type AgeGroup = "5-7" | "8-10" | "11-14";
export type LanguageMode = "en" | "hinglish" | "hi" | "mr" | "gu" | "ta" | "te" | "bn" | "kn";
export type ActiveTab = "home" | "maths" | "classroom" | "quiz" | "progress";

export interface VisualCard {
  stepLabel: string;
  title: string;
  detail: string;
  symbol: string;
}

export interface VisualConcept {
  mode: "steps" | "formula" | "comparison" | "story" | string;
  summary: string;
  cards: VisualCard[];
}

export interface MiniCheck {
  question: string;
  options: string[];
  correctIndex: number;
  hint: string;
  praise: string;
}

export interface TeacherLessonPayload {
  lessonTitle: string;
  teacherReply: string;
  visualConcept: VisualConcept;
  miniCheck: MiniCheck;
  followUpPrompts: string[];
}

export interface ChatMessage {
  id: string;
  role: "student" | "teacher";
  text: string;
  lessonTitle?: string;
  visualConcept?: VisualConcept;
  miniCheck?: MiniCheck;
  followUpPrompts?: string[];
  createdAtMs: number;
}

export interface QuizQuestion {
  question: string;
  options: string[];
  correctIndex: number;
  hint: string;
  explanation: string;
}

export interface QuizPayload {
  quizTitle: string;
  questions: QuizQuestion[];
}

export interface StudentProfile {
  uid: string;
  displayName: string;
  ageGroup: AgeGroup;
  language: LanguageMode;
  stars: number;
  lessonsCompleted: number;
  quizzesCompleted: number;
  unlockedBadges: string[];
}

export interface QuizResultRecord {
  id: string;
  subject: string;
  topic: string;
  ageGroup: AgeGroup;
  score: number;
  totalQuestions: number;
  starsEarned: number;
  createdAtMs: number;
}

export interface LearningSessionSummary {
  id: string;
  subject: string;
  topic: string;
  ageGroup: AgeGroup;
  language: LanguageMode;
  messageCount: number;
  starsEarned: number;
  updatedAtMs: number;
}

export interface SubjectTrack {
  id: string;
  name: string;
  tagline: string;
  image?: string;
  simulationId?: "fractions" | "photosynthesis" | "solar" | "patterns";
  topics: Array<{
    title: string;
    duration: string;
    starterPrompt: string;
  }>;
}

export interface SearchSource {
  title: string;
  url: string;
}

export interface SearchAnswerPayload {
  answer: string;
  sources: SearchSource[];
  searchQueries: string[];
}

export interface MathsSolveStep {
  stepNumber: number;
  title: string;
  work: string;
  note: string;
}

export interface MathsSolvePayload {
  problemTitle: string;
  formulaUsed: string;
  steps: MathsSolveStep[];
  finalAnswer: string;
  practiceTryIt: {
    question: string;
    answer: string;
    hint: string;
  };
}
