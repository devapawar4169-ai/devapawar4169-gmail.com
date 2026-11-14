import type { LanguageMode, SubjectTrack } from "../types";

export const LANGUAGE_OPTIONS: Array<{ id: LanguageMode; label: string; nativeLabel: string; speechLocale: string }> = [
  { id: "mr", label: "Marathi", nativeLabel: "मराठी (Marathi)", speechLocale: "mr-IN" },
  { id: "hi", label: "Hindi", nativeLabel: "हिन्दी (Hindi)", speechLocale: "hi-IN" },
  { id: "hinglish", label: "Hinglish", nativeLabel: "Hinglish", speechLocale: "en-IN" },
  { id: "en", label: "English", nativeLabel: "English", speechLocale: "en-IN" },
  { id: "gu", label: "Gujarati", nativeLabel: "ગુજરાતી (Gujarati)", speechLocale: "gu-IN" },
  { id: "ta", label: "Tamil", nativeLabel: "தமிழ் (Tamil)", speechLocale: "ta-IN" },
  { id: "te", label: "Telugu", nativeLabel: "తెలుగు (Telugu)", speechLocale: "te-IN" },
  { id: "bn", label: "Bengali", nativeLabel: "বাংলা (Bengali)", speechLocale: "bn-IN" },
  { id: "kn", label: "Kannada", nativeLabel: "ಕನ್ನಡ (Kannada)", speechLocale: "kn-IN" },
];

export function getSpeechLocale(lang: LanguageMode): string {
  return LANGUAGE_OPTIONS.find((l) => l.id === lang)?.speechLocale ?? "en-IN";
}

export function getLanguageLabel(lang: LanguageMode): string {
  return LANGUAGE_OPTIONS.find((l) => l.id === lang)?.nativeLabel ?? "English";
}

export const ASSETS = {
  teacherAvatar: "/src/assets/images/teacher_mentor_avatar_1794687670833.jpg",
  scienceBanner: "/src/assets/images/subject_science_banner_1794687670921.jpg",
  mathBanner: "/src/assets/images/subject_math_banner_1794687671823.jpg",
  heroDesk: "/src/assets/images/hero_classroom_desk_1794687672274.jpg",
};

export const SUBJECT_TRACKS: SubjectTrack[] = [
  {
    id: "math",
    name: "Mathematics",
    tagline: "Fractions, multiplication tricks, shapes, and visual puzzles.",
    image: ASSETS.mathBanner,
    simulationId: "fractions",
    topics: [
      {
        title: "Fractions & Sharing Fairly",
        duration: "5 min",
        starterPrompt: "Teach me fractions using pizza or roti slices!",
      },
      {
        title: "Multiplication Super Tricks",
        duration: "6 min",
        starterPrompt: "Show me easy tricks to remember multiplication tables.",
      },
      {
        title: "Shapes, Angles & Symmetry",
        duration: "5 min",
        starterPrompt: "How do triangles and circles appear in everyday buildings?",
      },
    ],
  },
  {
    id: "science",
    name: "Science & Space",
    tagline: "How plants eat, planets orbit, and rain forms in the sky.",
    image: ASSETS.scienceBanner,
    simulationId: "photosynthesis",
    topics: [
      {
        title: "How Plants Make Food",
        duration: "5 min",
        starterPrompt: "How do green leaves make food using sunlight and water?",
      },
      {
        title: "Our Solar System Journey",
        duration: "6 min",
        starterPrompt: "Take me on a tour of the Sun, Earth, Mars, and Saturn!",
      },
      {
        title: "The Water Cycle & Rain",
        duration: "5 min",
        starterPrompt: "How does ocean water turn into clouds and rain?",
      },
    ],
  },
  {
    id: "english",
    name: "English & Stories",
    tagline: "Vocabulary builders, grammar games, and creative storytelling.",
    image: ASSETS.heroDesk,
    topics: [
      {
        title: "Building Strong Sentences",
        duration: "5 min",
        starterPrompt: "Help me practice nouns, verbs, and fun adjectives with examples.",
      },
      {
        title: "Story Starters & Moral Tales",
        duration: "6 min",
        starterPrompt: "Let us write a short adventure story together step by step!",
      },
      {
        title: "Tricky Words & Spelling",
        duration: "4 min",
        starterPrompt: "Teach me 5 useful new words I can use at school today.",
      },
    ],
  },
  {
    id: "logic",
    name: "Logic & Coding",
    tagline: "Number patterns, step-by-step algorithms, and brain teasers.",
    simulationId: "patterns",
    topics: [
      {
        title: "Pattern Detectives",
        duration: "5 min",
        starterPrompt: "Give me fun number and shape pattern puzzles to solve!",
      },
      {
        title: "What Is an Algorithm?",
        duration: "5 min",
        starterPrompt: "Explain coding algorithms like making a sandwich orchai!",
      },
      {
        title: "If-Else Decision Games",
        duration: "6 min",
        starterPrompt: "How do computers make choices using If and Else?",
      },
    ],
  },
  {
    id: "world",
    name: "World & Nature",
    tagline: "Continents, oceans, animals, and everyday wonders of Earth.",
    simulationId: "solar",
    topics: [
      {
        title: "Why Do Seasons Change?",
        duration: "5 min",
        starterPrompt: "Why do we get summer, monsoon, and winter on Earth?",
      },
      {
        title: "Amazing Animal Habitats",
        duration: "5 min",
        starterPrompt: "How do polar bears and desert camels survive extreme weather?",
      },
      {
        title: "Mountains, Rivers & Oceans",
        duration: "5 min",
        starterPrompt: "How are tall mountains and long rivers formed?",
      },
    ],
  },
];

export interface BadgeDefinition {
  id: string;
  title: string;
  description: string;
  requirementText: string;
}

export const BADGE_CATALOG: BadgeDefinition[] = [
  {
    id: "first_lesson",
    title: "Curious Spark",
    description: "Completed your first interactive lesson with Shikshak.",
    requirementText: "1 Lesson",
  },
  {
    id: "quiz_starter",
    title: "Quiz Challenger",
    description: "Finished your first 5-question practice quiz.",
    requirementText: "1 Quiz",
  },
  {
    id: "star_collector_50",
    title: "Golden Notebook",
    description: "Earned 50 Stars through lessons and check-ins.",
    requirementText: "50 Stars",
  },
  {
    id: "star_collector_150",
    title: "Bright Scholar",
    description: "Reached 150 Stars across subjects.",
    requirementText: "150 Stars",
  },
  {
    id: "perfect_quiz",
    title: "Sharp Mind",
    description: "Scored 5 out of 5 on a practice quiz.",
    requirementText: "5/5 Quiz",
  },
  {
    id: "five_lessons",
    title: "Daily Explorer",
    description: "Completed 5 guided learning lessons.",
    requirementText: "5 Lessons",
  },
];

export function getLearnerLevel(stars: number): {
  title: string;
  nextThreshold: number;
  progressPct: number;
} {
  if (stars < 50) {
    return { title: "Seedling", nextThreshold: 50, progressPct: Math.min(100, Math.round((stars / 50) * 100)) };
  }
  if (stars < 150) {
    return {
      title: "Explorer",
      nextThreshold: 150,
      progressPct: Math.min(100, Math.round(((stars - 50) / 100) * 100)),
    };
  }
  if (stars < 300) {
    return {
      title: "Scholar",
      nextThreshold: 300,
      progressPct: Math.min(100, Math.round(((stars - 150) / 150) * 100)),
    };
  }
  return { title: "Young Mentor", nextThreshold: 500, progressPct: 100 };
}
