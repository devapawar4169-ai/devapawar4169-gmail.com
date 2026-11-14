import { useState } from "react";
import { ArrowRight, Award, CheckCircle2, HelpCircle, RotateCcw, Star, XCircle } from "lucide-react";
import { SUBJECT_TRACKS, getLanguageLabel } from "../data/curriculum";
import type { AgeGroup, LanguageMode, QuizPayload } from "../types";

interface PracticeQuizViewProps {
  initialSubject: string;
  initialTopic: string;
  ageGroup: AgeGroup;
  language: LanguageMode;
  onQuizCompleted: (result: {
    subject: string;
    topic: string;
    score: number;
    totalQuestions: number;
    starsEarned: number;
  }) => void;
  onGoToClassroom: () => void;
}

export function PracticeQuizView({
  initialSubject,
  initialTopic,
  ageGroup,
  language,
  onQuizCompleted,
  onGoToClassroom,
}: PracticeQuizViewProps) {
  const [subject, setSubject] = useState(initialSubject);
  const [topic, setTopic] = useState(initialTopic);
  const [quiz, setQuiz] = useState<QuizPayload | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [currentIdx, setCurrentIdx] = useState(0);
  const [selectedIdx, setSelectedIdx] = useState<number | null>(null);
  const [showHint, setShowHint] = useState(false);
  const [score, setScore] = useState(0);
  const [finished, setFinished] = useState(false);

  const selectedTrack = SUBJECT_TRACKS.find((s) => s.name === subject) ?? SUBJECT_TRACKS[0];

  async function startQuiz(chosenSubject = subject, chosenTopic = topic) {
    setLoading(true);
    setError(null);
    setQuiz(null);
    setCurrentIdx(0);
    setSelectedIdx(null);
    setShowHint(false);
    setScore(0);
    setFinished(false);

    try {
      const res = await fetch("/api/teacher/quiz", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          subject: chosenSubject,
          topic: chosenTopic.trim() || chosenSubject,
          ageGroup,
          language,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Could not create practice quiz.");
      }
      if (!data.questions || !Array.isArray(data.questions) || data.questions.length === 0) {
        throw new Error("The quiz came back empty. Please try again.");
      }
      setQuiz(data as QuizPayload);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load quiz.");
    } finally {
      setLoading(false);
    }
  }

  function handleAnswer(optionIndex: number) {
    if (!quiz || selectedIdx !== null) return;
    setSelectedIdx(optionIndex);
    const currentQ = quiz.questions[currentIdx];
    if (optionIndex === currentQ.correctIndex) {
      setScore((prev) => prev + 1);
    }
  }

  function handleNextQuestion() {
    if (!quiz) return;
    if (currentIdx + 1 < quiz.questions.length) {
      setCurrentIdx((prev) => prev + 1);
      setSelectedIdx(null);
      setShowHint(false);
    } else {
      const total = quiz.questions.length;
      const starsEarned = score * 10 + 15;
      setFinished(true);
      onQuizCompleted({
        subject,
        topic: topic.trim() || subject,
        score,
        totalQuestions: total,
        starsEarned,
      });
    }
  }

  return (
    <div className="max-w-[960px] mx-auto flex flex-col gap-6">
      {/* Quiz Setup Bar */}
      <section className="bg-white border border-slate-200 rounded-xl p-6">
        <div className="flex flex-col gap-1 mb-5">
          <div className="text-xs text-slate-500 font-medium">
            Practice Mode · Ages {ageGroup} · {getLanguageLabel(language)} · 5 Questions
          </div>
          <h1 className="text-2xl font-semibold text-slate-900">
            Test What You Learned
          </h1>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
          <label className="flex flex-col gap-1.5">
            <span className="text-xs font-semibold text-slate-700">Subject</span>
            <select
              value={subject}
              onChange={(e) => {
                const nextSub = e.target.value;
                setSubject(nextSub);
                const track = SUBJECT_TRACKS.find((s) => s.name === nextSub);
                if (track && track.topics[0]) {
                  setTopic(track.topics[0].title);
                }
              }}
              className="px-3.5 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-lg text-slate-900 focus:outline-2 focus:outline-sky-600 min-h-[42px]"
            >
              {SUBJECT_TRACKS.map((track) => (
                <option key={track.id} value={track.name}>
                  {track.name}
                </option>
              ))}
            </select>
          </label>

          <label className="flex flex-col gap-1.5">
            <span className="text-xs font-semibold text-slate-700">Topic</span>
            <input
              type="text"
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              placeholder="e.g., Fractions, Planets, Verbs"
              className="px-3.5 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-lg text-slate-900 focus:outline-2 focus:outline-sky-600 min-h-[42px]"
            />
          </label>

          <button
            type="button"
            disabled={loading}
            onClick={() => startQuiz(subject, topic)}
            className="inline-flex items-center justify-center gap-2 px-5 py-2.5 text-sm font-semibold text-white bg-sky-600 hover:bg-sky-700 disabled:opacity-60 rounded-lg transition-colors min-h-[42px]"
          >
            {loading ? "Preparing Quiz..." : quiz ? "New Quiz" : "Start 5-Question Quiz"}
            <ArrowRight className="w-4 h-4" aria-hidden="true" />
          </button>
        </div>

        {/* Suggested topic buttons */}
        <div className="flex flex-wrap items-center gap-2 mt-4 pt-4 border-t border-slate-100">
          <span className="text-xs text-slate-500 font-medium mr-1">Quick topics:</span>
          {selectedTrack.topics.map((t) => (
            <button
              key={t.title}
              type="button"
              onClick={() => {
                setTopic(t.title);
                startQuiz(selectedTrack.name, t.title);
              }}
              className="px-3 py-1.5 text-xs font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-md transition-colors"
            >
              {t.title}
            </button>
          ))}
        </div>

        {error && (
          <div className="mt-4 p-3 rounded-lg bg-red-50 border border-red-200 text-sm text-red-800">
            {error}
          </div>
        )}
      </section>

      {/* Active Quiz Area */}
      {quiz && !finished && (
        <section className="bg-white border border-slate-200 rounded-xl p-6 flex flex-col gap-5">
          <div className="flex items-center justify-between gap-4 border-b border-slate-100 pb-4">
            <div>
              <h2 className="text-lg font-semibold text-slate-900">{quiz.quizTitle}</h2>
              <div className="text-xs text-slate-500 mt-0.5 tabular-nums">
                Question {currentIdx + 1} of {quiz.questions.length} · Score: {score}
              </div>
            </div>
            <button
              type="button"
              onClick={() => setShowHint((prev) => !prev)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-amber-800 bg-amber-50 hover:bg-amber-100 rounded-lg transition-colors"
            >
              <HelpCircle className="w-4 h-4" aria-hidden="true" />
              {showHint ? "Hide Hint" : "Need a Hint?"}
            </button>
          </div>

          {/* Progress Bar */}
          <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
            <div
              className="h-full bg-sky-600 transition-all duration-200"
              style={{ width: `${((currentIdx + (selectedIdx !== null ? 1 : 0)) / quiz.questions.length) * 100}%` }}
            />
          </div>

          <p className="text-lg font-semibold text-slate-900 leading-snug">
            {quiz.questions[currentIdx].question}
          </p>

          {showHint && (
            <div className="p-3.5 rounded-lg bg-amber-50 border border-amber-200 text-sm text-amber-900">
              <span className="font-semibold">Teacher Hint: </span>
              {quiz.questions[currentIdx].hint}
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {quiz.questions[currentIdx].options.map((opt, idx) => {
              const isSelected = selectedIdx === idx;
              const isCorrect = idx === quiz.questions[currentIdx].correctIndex;
              const answered = selectedIdx !== null;

              let style = "border-slate-200 bg-white hover:border-sky-400 text-slate-800";
              if (answered && isCorrect) {
                style = "border-emerald-600 bg-emerald-50 text-emerald-900 font-semibold";
              } else if (answered && isSelected && !isCorrect) {
                style = "border-red-500 bg-red-50 text-red-900";
              }

              return (
                <button
                  key={`${opt}-${idx}`}
                  type="button"
                  disabled={answered}
                  onClick={() => handleAnswer(idx)}
                  className={`p-4 text-left text-sm rounded-xl border transition-colors flex items-center justify-between gap-3 min-h-[52px] ${style}`}
                >
                  <span>{opt}</span>
                  {answered && isCorrect && (
                    <CheckCircle2 className="w-5 h-5 text-emerald-700 shrink-0" aria-hidden="true" />
                  )}
                  {answered && isSelected && !isCorrect && (
                    <XCircle className="w-5 h-5 text-red-600 shrink-0" aria-hidden="true" />
                  )}
                </button>
              );
            })}
          </div>

          {selectedIdx !== null && (
            <div className="flex flex-wrap items-center justify-between gap-4 pt-3 border-t border-slate-100">
              <p className="text-sm text-slate-700 flex-1 min-w-[220px]">
                <span className="font-semibold text-slate-900">Explanation: </span>
                {quiz.questions[currentIdx].explanation}
              </p>
              <button
                type="button"
                onClick={handleNextQuestion}
                className="inline-flex items-center gap-1.5 px-5 py-2.5 text-sm font-semibold text-white bg-sky-600 hover:bg-sky-700 rounded-lg transition-colors whitespace-nowrap shrink-0"
              >
                {currentIdx + 1 < quiz.questions.length ? "Next Question" : "Finish Quiz"}
                <ArrowRight className="w-4 h-4" aria-hidden="true" />
              </button>
            </div>
          )}
        </section>
      )}

      {/* Finished Quiz Summary */}
      {quiz && finished && (
        <section className="bg-white border border-slate-200 rounded-xl p-8 text-center flex flex-col items-center gap-4">
          <div className="w-14 h-14 rounded-full bg-amber-50 border border-amber-200 flex items-center justify-center text-amber-600">
            <Award className="w-7 h-7" aria-hidden="true" />
          </div>
          <h2 className="text-2xl font-bold text-slate-900">Well Done! Quiz Complete</h2>
          <p className="text-sm text-slate-600 max-w-md">
            You answered <span className="font-mono font-semibold text-slate-900 tabular-nums">{score}</span> out of{" "}
            <span className="font-mono font-semibold text-slate-900 tabular-nums">{quiz.questions.length}</span>{" "}
            questions correctly on {topic}.
          </p>

          <div className="inline-flex items-center gap-2 px-4 py-2 bg-amber-50 border border-amber-200 rounded-lg text-amber-800 font-semibold text-sm tabular-nums">
            <Star className="w-4 h-4 fill-amber-500 text-amber-500" aria-hidden="true" />
            +{score * 10 + 15} Stars Earned
          </div>

          <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
            <button
              type="button"
              onClick={() => startQuiz(subject, topic)}
              className="inline-flex items-center gap-1.5 px-4 py-2.5 text-sm font-semibold text-white bg-sky-600 hover:bg-sky-700 rounded-lg transition-colors"
            >
              <RotateCcw className="w-4 h-4" aria-hidden="true" />
              Try Another Quiz
            </button>
            <button
              type="button"
              onClick={onGoToClassroom}
              className="px-4 py-2.5 text-sm font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors"
            >
              Back to Classroom
            </button>
          </div>
        </section>
      )}
    </div>
  );
}
