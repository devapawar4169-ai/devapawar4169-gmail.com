import { useRef, useState } from "react";
import {
  ArrowRight,
  Award,
  BookOpen,
  Calculator,
  Compass,
  ExternalLink,
  Globe,
  GraduationCap,
  Search,
  Volume2,
} from "lucide-react";
import { ASSETS, LANGUAGE_OPTIONS, getSpeechLocale } from "../data/curriculum";
import type { ActiveTab, AgeGroup, LanguageMode, SearchAnswerPayload } from "../types";

interface HomeHubViewProps {
  ageGroup: AgeGroup;
  language: LanguageMode;
  selectedMathsClass: number;
  onChangeLanguage: (lang: LanguageMode) => void;
  onSelectTab: (tab: ActiveTab) => void;
  onOpenMathsClass: (grade: number) => void;
  onOpenSubjectsModalOrClassroom: (subject: string, topic: string, prompt: string) => void;
  onOpenStudyBuddy: () => void;
  onAwardStars: (stars: number, reason: string) => void;
}

type HomeOptionKey = "maths" | "classroom" | "search" | "quiz" | "subjects" | "progress";

const SAMPLE_SEARCHES = [
  "Chandrayaan-3 mission facts for kids",
  "How does a rainbow form in the sky?",
  "Why is Mount Everest still growing?",
];

export function HomeHubView({
  ageGroup,
  language,
  selectedMathsClass,
  onChangeLanguage,
  onSelectTab,
  onOpenMathsClass,
  onOpenSubjectsModalOrClassroom,
  onOpenStudyBuddy,
  onAwardStars,
}: HomeHubViewProps) {
  const [activeOption, setActiveOption] = useState<HomeOptionKey>("maths");
  const [heroFailed, setHeroFailed] = useState(false);

  // Live Google Search Grounding state
  const [searchQuery, setSearchQuery] = useState("");
  const [searchLoading, setSearchLoading] = useState(false);
  const [searchError, setSearchError] = useState<string | null>(null);
  const [searchResult, setSearchResult] = useState<SearchAnswerPayload | null>(null);
  const searchInputRef = useRef<HTMLInputElement | null>(null);

  async function runGoogleSearch(queryText: string) {
    const clean = queryText.trim();
    if (!clean || searchLoading) return;
    setSearchQuery(clean);
    setActiveOption("search");
    setSearchLoading(true);
    setSearchError(null);

    try {
      const res = await fetch("/api/search/ask", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          query: clean,
          ageGroup,
          language,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Could not complete Google Search.");
      }
      setSearchResult(data as SearchAnswerPayload);
      onAwardStars(2, "Explored with Google Search");
    } catch (err) {
      setSearchError(err instanceof Error ? err.message : "Search failed.");
    } finally {
      setSearchLoading(false);
    }
  }

  function speakSearchAnswer(text: string) {
    if (typeof window === "undefined" || !("speechSynthesis" in window)) return;
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = getSpeechLocale(language);
    window.speechSynthesis.speak(utterance);
  }

  const optionsList: Array<{
    key: HomeOptionKey;
    title: string;
    detail: string;
    actionLabel: string;
    icon: typeof Calculator;
    onSelect: () => void;
  }> = [
    {
      key: "maths",
      title: "Maths Class 1 to 10",
      detail: "Tables, fractions, algebra, geometry, and Class 10 trigonometry with step-by-step solutions.",
      actionLabel: `Open Class ${selectedMathsClass}`,
      icon: Calculator,
      onSelect: () => onSelectTab("maths"),
    },
    {
      key: "classroom",
      title: "AI Teacher Classroom",
      detail: "Visual chalkboard, interactive Science & Math labs, voice read-aloud, and mini check-ins.",
      actionLabel: "Enter Classroom",
      icon: GraduationCap,
      onSelect: () => onSelectTab("classroom"),
    },
    {
      key: "search",
      title: "Google Fact Search",
      detail: "Search real-world facts, science discoveries, and school topics with verified web sources.",
      actionLabel: "Search Below",
      icon: Globe,
      onSelect: () => {
        setActiveOption("search");
        searchInputRef.current?.focus();
      },
    },
    {
      key: "quiz",
      title: "Practice Quiz",
      detail: "5-question adaptive quizzes with helpful hints, explanations, and Star rewards.",
      actionLabel: "Start Quiz",
      icon: Award,
      onSelect: () => onSelectTab("quiz"),
    },
    {
      key: "subjects",
      title: "Science, English & Coding",
      detail: "Launch guided lessons on plants, solar system, grammar, stories, and algorithms.",
      actionLabel: "Start Science Lesson",
      icon: Compass,
      onSelect: () =>
        onOpenSubjectsModalOrClassroom(
          "Science & Space",
          "Our Solar System Journey",
          "Take me on a fun guided tour of the Solar System!"
        ),
    },
    {
      key: "progress",
      title: "Student Login & Progress",
      detail: "Sign in with Google to save Stars, Sticker Badges, and lesson history across sessions.",
      actionLabel: "View Progress",
      icon: BookOpen,
      onSelect: () => onSelectTab("progress"),
    },
  ];

  return (
    <div className="max-w-[1280px] mx-auto flex flex-col gap-8">
      {/* Hero Split + Live Google Search */}
      <section className="bg-white border border-slate-200 rounded-xl overflow-hidden grid grid-cols-1 lg:grid-cols-12 items-stretch">
        <div className="lg:col-span-7 p-6 sm:p-8 flex flex-col justify-between gap-5">
          <div>
            <div className="text-xs font-semibold text-sky-700 mb-2">
              Shikshak Home · Ages {ageGroup} · Bilingual Learning Hub
            </div>
            <h1 className="text-2xl sm:text-4xl font-bold text-slate-900 text-balance leading-tight">
              Your Complete AI Teacher, Class 1–10 Maths & Google Search Desk
            </h1>
            <p className="text-sm sm:text-base text-slate-600 mt-3 max-w-xl leading-relaxed">
              Choose an option below to learn step by step, solve Class 1 to 10 Maths sums, practice quizzes, or search verified Google facts in Marathi, Hindi, Hinglish, English, and more.
            </p>
            <div className="mt-4 flex flex-wrap items-center gap-2">
              <span className="text-xs font-semibold text-slate-700">Language:</span>
              <select
                aria-label="Choose teaching language"
                value={language}
                onChange={(e) => onChangeLanguage(e.target.value as LanguageMode)}
                className="px-3 py-1.5 text-xs font-semibold bg-slate-100 border border-slate-200 rounded-lg text-slate-900 focus:outline-2 focus:outline-sky-600"
              >
                {LANGUAGE_OPTIONS.map((lang) => (
                  <option key={lang.id} value={lang.id}>
                    {lang.nativeLabel}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Live Google Search Bar */}
          <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 flex flex-col gap-3">
            <div className="flex items-center justify-between gap-2">
              <span className="text-xs font-semibold text-slate-700 inline-flex items-center gap-1.5">
                <Globe className="w-3.5 h-3.5 text-sky-700" aria-hidden="true" />
                Live Google Knowledge Search for Kids
              </span>
              <button
                type="button"
                onClick={onOpenStudyBuddy}
                className="text-xs font-semibold text-sky-700 hover:underline whitespace-nowrap shrink-0"
              >
                Open Study Buddy Chat
              </button>
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                runGoogleSearch(searchQuery);
              }}
              className="flex flex-wrap sm:flex-nowrap items-center gap-2"
            >
              <input
                ref={searchInputRef}
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search any fact (e.g., How fast does light travel?)"
                className="flex-1 min-w-[200px] px-3.5 py-2.5 text-sm bg-white border border-slate-200 rounded-lg text-slate-900 placeholder:text-slate-400 focus:outline-2 focus:outline-sky-600 min-h-[42px]"
              />
              <button
                type="submit"
                disabled={!searchQuery.trim() || searchLoading}
                className="inline-flex items-center justify-center gap-1.5 px-4 py-2.5 text-sm font-semibold text-white bg-sky-600 hover:bg-sky-700 disabled:opacity-50 rounded-lg transition-colors whitespace-nowrap shrink-0 min-h-[42px]"
              >
                <Search className="w-4 h-4" aria-hidden="true" />
                {searchLoading ? "Searching..." : "Google Search"}
              </button>
            </form>

            <div className="flex flex-wrap items-center gap-1.5">
              {SAMPLE_SEARCHES.map((sample) => (
                <button
                  key={sample}
                  type="button"
                  onClick={() => runGoogleSearch(sample)}
                  className="px-2.5 py-1 text-xs font-medium text-slate-700 bg-white border border-slate-200 hover:border-sky-400 rounded-md transition-colors"
                >
                  {sample}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="lg:col-span-5 bg-slate-100 min-h-[240px]">
          {!heroFailed ? (
            <img
              src={ASSETS.heroDesk}
              alt="Children's sunlit desk with open encyclopedia, globe, and magnifying glass"
              referrerPolicy="no-referrer"
              onError={() => setHeroFailed(true)}
              className="w-full h-full lg:h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center p-6 bg-sky-50 text-sky-800 font-semibold">
              Shikshak Learning Studio
            </div>
          )}
        </div>
      </section>

      {/* Google Search Result Panel */}
      {(searchError || searchResult) && (
        <section
          aria-label="Google Search Answer"
          className="bg-white border border-slate-200 rounded-xl p-6 flex flex-col gap-4"
        >
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-3">
            <div>
              <span className="text-xs font-semibold text-sky-700">Google Search Grounded Answer</span>
              <h2 className="text-lg font-semibold text-slate-900 mt-0.5">{searchQuery}</h2>
            </div>
            {searchResult && (
              <button
                type="button"
                onClick={() => speakSearchAnswer(searchResult.answer)}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-sky-700 bg-sky-50 hover:bg-sky-100 rounded-lg transition-colors"
              >
                <Volume2 className="w-4 h-4" aria-hidden="true" />
                Read Aloud
              </button>
            )}
          </div>

          {searchError ? (
            <p className="text-sm text-red-700">{searchError}</p>
          ) : (
            searchResult && (
              <>
                <div className="text-sm sm:text-base text-slate-800 leading-relaxed whitespace-pre-line">
                  {searchResult.answer}
                </div>

                {searchResult.sources.length > 0 && (
                  <div className="pt-3 border-t border-slate-100">
                    <div className="text-xs font-semibold text-slate-500 mb-2">
                      Verified Google Search Sources
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {searchResult.sources.map((src, idx) => (
                        <a
                          key={`${src.url}-${idx}`}
                          href={src.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-sky-700 bg-slate-50 border border-slate-200 hover:border-sky-400 rounded-lg transition-colors max-w-[280px]"
                        >
                          <span className="truncate">{src.title}</span>
                          <ExternalLink className="w-3 h-3 shrink-0" aria-hidden="true" />
                        </a>
                      ))}
                    </div>
                  </div>
                )}
              </>
            )
          )}
        </section>
      )}

      {/* Separate Active Option Cards */}
      <section aria-label="Learning Options" className="flex flex-col gap-4">
        <div className="flex items-center justify-between gap-4">
          <div>
            <h2 className="text-xl font-semibold text-slate-900">Explore Learning Options</h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Every learning tool is organized in its own space—select any card to start.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {optionsList.map((opt) => {
            const Icon = opt.icon;
            const isSelected = activeOption === opt.key;
            return (
              <button
                key={opt.key}
                type="button"
                onClick={() => {
                  setActiveOption(opt.key);
                  opt.onSelect();
                }}
                className={`text-left p-5 rounded-xl border transition-all flex flex-col justify-between gap-4 bg-white ${
                  isSelected
                    ? "border-sky-600 ring-1 ring-sky-600/20"
                    : "border-slate-200 hover:border-slate-300"
                }`}
              >
                <div>
                  <div className="flex items-center justify-between gap-3 mb-3">
                    <div
                      className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                        isSelected ? "bg-sky-600 text-white" : "bg-slate-100 text-slate-700"
                      }`}
                    >
                      <Icon className="w-5 h-5" aria-hidden="true" />
                    </div>
                    <span
                      className={`text-xs font-semibold ${
                        isSelected ? "text-sky-700" : "text-slate-400"
                      }`}
                    >
                      {isSelected ? "Active" : "Ready"}
                    </span>
                  </div>
                  <h3 className="text-base font-semibold text-slate-900">{opt.title}</h3>
                  <p className="text-sm text-slate-600 mt-1.5 leading-relaxed">{opt.detail}</p>
                </div>

                <div className="inline-flex items-center gap-1.5 text-xs font-semibold text-sky-700">
                  <span>{opt.actionLabel}</span>
                  <ArrowRight className="w-3.5 h-3.5" aria-hidden="true" />
                </div>
              </button>
            );
          })}
        </div>
      </section>

      {/* Class 1 to 10 Quick Maths Launcher */}
      <section className="bg-white border border-slate-200 rounded-xl p-6 flex flex-col gap-4">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h2 className="text-lg font-semibold text-slate-900">Maths Class 1 to 10 Quick Selector</h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Jump directly to your school class for step-by-step sums, tables, algebra, or trigonometry.
            </p>
          </div>
          <button
            type="button"
            onClick={() => onSelectTab("maths")}
            className="text-xs font-semibold text-sky-700 hover:underline whitespace-nowrap shrink-0"
          >
            Open Full Maths Studio
          </button>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-5 lg:grid-cols-10 gap-2.5">
          {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((grade) => (
            <button
              key={grade}
              type="button"
              onClick={() => onOpenMathsClass(grade)}
              className={`py-2.5 px-3 rounded-lg border text-sm font-semibold tabular-nums transition-colors ${
                selectedMathsClass === grade
                  ? "bg-sky-600 text-white border-sky-600"
                  : "bg-slate-50 text-slate-800 border-slate-200 hover:border-sky-400 hover:bg-sky-50"
              }`}
            >
              Class {grade}
            </button>
          ))}
        </div>
      </section>
    </div>
  );
}
