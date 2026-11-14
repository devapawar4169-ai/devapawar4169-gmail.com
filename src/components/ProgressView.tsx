import { useState } from "react";
import { Award, BookCheck, CheckCircle2, Lock, LogIn, Save, Star } from "lucide-react";
import { BADGE_CATALOG, LANGUAGE_OPTIONS, getLearnerLevel } from "../data/curriculum";
import type {
  AgeGroup,
  LanguageMode,
  LearningSessionSummary,
  QuizResultRecord,
  StudentProfile,
} from "../types";

interface ProgressViewProps {
  student: StudentProfile | null;
  guestStars: number;
  guestLessons: number;
  guestQuizzes: number;
  guestBadges: string[];
  ageGroup: AgeGroup;
  language: LanguageMode;
  sessions: LearningSessionSummary[];
  quizResults: QuizResultRecord[];
  onSignIn: () => void;
  onSavePreferences: (prefs: { displayName: string; ageGroup: AgeGroup; language: LanguageMode }) => Promise<void>;
  onOpenSessionTopic: (subject: string, topic: string) => void;
}

export function ProgressView({
  student,
  guestStars,
  guestLessons,
  guestQuizzes,
  guestBadges,
  ageGroup,
  language,
  sessions,
  quizResults,
  onSignIn,
  onSavePreferences,
  onOpenSessionTopic,
}: ProgressViewProps) {
  const [nameInput, setNameInput] = useState(student?.displayName || "Young Learner");
  const [ageInput, setAgeInput] = useState<AgeGroup>(student?.ageGroup || ageGroup);
  const [langInput, setLangInput] = useState<LanguageMode>(student?.language || language);
  const [saving, setSaving] = useState(false);
  const [savedNotice, setSavedNotice] = useState(false);

  const stars = student ? student.stars : guestStars;
  const lessons = student ? student.lessonsCompleted : guestLessons;
  const quizzes = student ? student.quizzesCompleted : guestQuizzes;
  const unlocked = student ? student.unlockedBadges : guestBadges;

  const levelInfo = getLearnerLevel(stars);

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setSavedNotice(false);
    try {
      await onSavePreferences({
        displayName: nameInput,
        ageGroup: ageInput,
        language: langInput,
      });
      setSavedNotice(true);
      setTimeout(() => setSavedNotice(false), 2500);
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="max-w-[1120px] mx-auto flex flex-col gap-6">
      {/* Sign-in Prompt Banner for Guests */}
      {!student && (
        <section className="bg-white border border-slate-200 rounded-xl p-6 flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="text-xl font-semibold text-slate-900">Save Your Learning Journey</h1>
            <p className="text-sm text-slate-600 mt-1">
              Sign in with Google to save your Stars, Sticker Badges, and lesson history across sessions.
            </p>
          </div>
          <button
            type="button"
            onClick={onSignIn}
            className="inline-flex items-center gap-2 px-5 py-2.5 text-sm font-semibold text-white bg-sky-600 hover:bg-sky-700 rounded-lg transition-colors whitespace-nowrap shrink-0"
          >
            <LogIn className="w-4 h-4" aria-hidden="true" />
            Sign In with Google
          </button>
        </section>
      )}

      {/* 4-Column Metric Row */}
      <section className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white border border-slate-200 rounded-xl p-5">
          <div className="text-xs font-medium text-slate-500">Total Stars</div>
          <div className="mt-2 flex items-center gap-2 text-2xl font-bold text-slate-900 font-mono tabular-nums">
            <Star className="w-5 h-5 fill-amber-500 text-amber-500" aria-hidden="true" />
            {stars}
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-5">
          <div className="text-xs font-medium text-slate-500">Learner Level</div>
          <div className="mt-2 text-xl font-bold text-slate-900">{levelInfo.title}</div>
          <div className="mt-2 w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
            <div className="h-full bg-sky-600" style={{ width: `${levelInfo.progressPct}%` }} />
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-5">
          <div className="text-xs font-medium text-slate-500">Lessons Guided</div>
          <div className="mt-2 flex items-center gap-2 text-2xl font-bold text-slate-900 font-mono tabular-nums">
            <BookCheck className="w-5 h-5 text-sky-600" aria-hidden="true" />
            {lessons}
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-5">
          <div className="text-xs font-medium text-slate-500">Quizzes Finished</div>
          <div className="mt-2 flex items-center gap-2 text-2xl font-bold text-slate-900 font-mono tabular-nums">
            <Award className="w-5 h-5 text-emerald-600" aria-hidden="true" />
            {quizzes}
          </div>
        </div>
      </section>

      {/* Profile Settings & Sticker Badges */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Student Preferences Form */}
        <form
          onSubmit={handleSave}
          className="lg:col-span-5 bg-white border border-slate-200 rounded-xl p-6 flex flex-col gap-4"
        >
          <div>
            <h2 className="text-lg font-semibold text-slate-900">Student Profile</h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Customize how Shikshak teaches and speaks.
            </p>
          </div>

          <label className="flex flex-col gap-1.5">
            <span className="text-xs font-semibold text-slate-700">Student Name</span>
            <input
              type="text"
              value={nameInput}
              onChange={(e) => setNameInput(e.target.value)}
              maxLength={80}
              className="px-3.5 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-lg text-slate-900 focus:outline-2 focus:outline-sky-600"
            />
          </label>

          <label className="flex flex-col gap-1.5">
            <span className="text-xs font-semibold text-slate-700">Age Group</span>
            <select
              value={ageInput}
              onChange={(e) => setAgeInput(e.target.value as AgeGroup)}
              className="px-3.5 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-lg text-slate-900 focus:outline-2 focus:outline-sky-600"
            >
              <option value="5-7">5–7 years (Early Explorer)</option>
              <option value="8-10">8–10 years (Curious Learner)</option>
              <option value="11-14">11–14 years (Young Scholar)</option>
            </select>
          </label>

          <label className="flex flex-col gap-1.5">
            <span className="text-xs font-semibold text-slate-700">Teaching Language</span>
            <select
              value={langInput}
              onChange={(e) => setLangInput(e.target.value as LanguageMode)}
              className="px-3.5 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-lg text-slate-900 focus:outline-2 focus:outline-sky-600"
            >
              {LANGUAGE_OPTIONS.map((lang) => (
                <option key={lang.id} value={lang.id}>
                  {lang.nativeLabel}
                </option>
              ))}
            </select>
          </label>

          <div className="flex items-center gap-3 pt-1">
            <button
              type="submit"
              disabled={saving}
              className="inline-flex items-center gap-1.5 px-4 py-2.5 text-sm font-semibold text-white bg-sky-600 hover:bg-sky-700 disabled:opacity-60 rounded-lg transition-colors"
            >
              <Save className="w-4 h-4" aria-hidden="true" />
              {saving ? "Saving..." : "Save Settings"}
            </button>
            {savedNotice && (
              <span className="text-xs font-semibold text-emerald-700">Preferences saved</span>
            )}
          </div>
        </form>

        {/* Sticker Badges */}
        <section className="lg:col-span-7 bg-white border border-slate-200 rounded-xl p-6">
          <div className="mb-4">
            <h2 className="text-lg font-semibold text-slate-900">Sticker Album</h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Unlock badges by asking questions, checking your understanding, and completing quizzes.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {BADGE_CATALOG.map((badge) => {
              const isUnlocked = unlocked.includes(badge.id);
              return (
                <div
                  key={badge.id}
                  className={`p-4 rounded-xl border flex items-start gap-3 ${
                    isUnlocked
                      ? "border-emerald-200 bg-emerald-50/40"
                      : "border-slate-200 bg-slate-50/70"
                  }`}
                >
                  <div
                    className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 ${
                      isUnlocked ? "bg-emerald-100 text-emerald-700" : "bg-slate-200 text-slate-500"
                    }`}
                  >
                    {isUnlocked ? (
                      <CheckCircle2 className="w-5 h-5" aria-hidden="true" />
                    ) : (
                      <Lock className="w-4 h-4" aria-hidden="true" />
                    )}
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-semibold text-slate-900">{badge.title}</span>
                      <span className="text-xs text-slate-500">· {badge.requirementText}</span>
                    </div>
                    <p className="text-xs text-slate-600 mt-1 leading-relaxed">{badge.description}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      </div>

      {/* Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <section className="bg-white border border-slate-200 rounded-xl p-6">
          <h2 className="text-lg font-semibold text-slate-900 mb-3">Recent Lessons</h2>
          {sessions.length === 0 ? (
            <p className="text-sm text-slate-500">
              No saved lessons yet. Start chatting with Shikshak in the Classroom to record your progress!
            </p>
          ) : (
            <div className="divide-y divide-slate-100">
              {sessions.map((sess) => (
                <button
                  key={sess.id}
                  type="button"
                  onClick={() => onOpenSessionTopic(sess.subject, sess.topic)}
                  className="w-full py-3 text-left flex items-center justify-between gap-4 hover:bg-slate-50 px-2 rounded-lg transition-colors"
                >
                  <div className="min-w-0">
                    <div className="text-sm font-semibold text-slate-900 truncate">{sess.topic}</div>
                    <div className="text-xs text-slate-500">
                      {sess.subject} · {sess.messageCount} messages
                    </div>
                  </div>
                  <span className="font-mono text-xs font-semibold text-amber-700 tabular-nums shrink-0">
                    +{sess.starsEarned} Stars
                  </span>
                </button>
              ))}
            </div>
          )}
        </section>

        <section className="bg-white border border-slate-200 rounded-xl p-6">
          <h2 className="text-lg font-semibold text-slate-900 mb-3">Recent Quiz Scores</h2>
          {quizResults.length === 0 ? (
            <p className="text-sm text-slate-500">
              No completed quizzes yet. Try a 5-question quiz in Practice Quiz!
            </p>
          ) : (
            <div className="divide-y divide-slate-100">
              {quizResults.map((res) => (
                <div key={res.id} className="py-3 flex items-center justify-between gap-4 px-2">
                  <div className="min-w-0">
                    <div className="text-sm font-semibold text-slate-900 truncate">{res.topic}</div>
                    <div className="text-xs text-slate-500">
                      {res.subject} · Ages {res.ageGroup}
                    </div>
                  </div>
                  <div className="text-right shrink-0">
                    <div className="font-mono text-sm font-semibold text-slate-900 tabular-nums">
                      {res.score} / {res.totalQuestions}
                    </div>
                    <div className="font-mono text-xs text-amber-700 tabular-nums">
                      +{res.starsEarned} Stars
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
