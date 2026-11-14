import { useState } from "react";
import {
  ArrowRight,
  Calculator,
  CheckCircle2,
  GraduationCap,
  HelpCircle,
  Send,
  Volume2,
} from "lucide-react";
import { LANGUAGE_OPTIONS, getSpeechLocale } from "../data/curriculum";
import { MATHS_CLASS_CURRICULUM } from "../data/mathsCurriculum";
import type { LanguageMode, MathsSolvePayload } from "../types";

interface MathsStudioViewProps {
  selectedClass: number;
  language: LanguageMode;
  onChangeLanguage: (lang: LanguageMode) => void;
  onChangeClass: (grade: number) => void;
  onOpenInClassroom: (topic: string, prompt: string) => void;
  onStartClassQuiz: (topic: string) => void;
  onAwardStars: (stars: number, reason: string) => void;
}

export function MathsStudioView({
  selectedClass,
  language,
  onChangeLanguage,
  onChangeClass,
  onOpenInClassroom,
  onStartClassQuiz,
  onAwardStars,
}: MathsStudioViewProps) {
  const currentLevel =
    MATHS_CLASS_CURRICULUM.find((c) => c.grade === selectedClass) ?? MATHS_CLASS_CURRICULUM[4];

  const [activeTopic, setActiveTopic] = useState(currentLevel.chapters[0].title);
  const [questionInput, setQuestionInput] = useState(currentLevel.chapters[0].sampleQuestion);
  const [solving, setSolving] = useState(false);
  const [solveError, setSolveError] = useState<string | null>(null);
  const [solution, setSolution] = useState<MathsSolvePayload | null>(null);

  // Practice check state inside solution
  const [tryInput, setTryInput] = useState("");
  const [tryStatus, setTryStatus] = useState<"idle" | "checked">("idle");
  const [showTryHint, setShowTryHint] = useState(false);

  // Interactive Lab states by class tier
  const [tableNumber, setTableNumber] = useState(6);
  const [algA, setAlgA] = useState(2);
  const [algB, setAlgB] = useState(4);
  const [algX, setAlgX] = useState(5);
  const [trigAngle, setTrigAngle] = useState(30);
  const [trigHypotenuse, setTrigHypotenuse] = useState(10);

  function handleSelectGrade(grade: number) {
    onChangeClass(grade);
    const nextLevel = MATHS_CLASS_CURRICULUM.find((c) => c.grade === grade);
    if (nextLevel && nextLevel.chapters[0]) {
      setActiveTopic(nextLevel.chapters[0].title);
      setQuestionInput(nextLevel.chapters[0].sampleQuestion);
    }
    setSolution(null);
    setSolveError(null);
  }

  async function solveQuestion(qText: string, topicName = activeTopic) {
    const clean = qText.trim();
    if (!clean || solving) return;
    setQuestionInput(clean);
    setSolving(true);
    setSolveError(null);
    setTryInput("");
    setTryStatus("idle");
    setShowTryHint(false);

    try {
      const res = await fetch("/api/maths/solve", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          classLevel: selectedClass,
          topic: topicName,
          question: clean,
          language,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Could not solve this problem.");
      }
      setSolution(data as MathsSolvePayload);
      onAwardStars(5, `Solved Class ${selectedClass} Maths problem`);
    } catch (err) {
      setSolveError(err instanceof Error ? err.message : "Failed to solve Maths question.");
    } finally {
      setSolving(false);
    }
  }

  function speakSolution(sol: MathsSolvePayload) {
    if (typeof window === "undefined" || !("speechSynthesis" in window)) return;
    window.speechSynthesis.cancel();
    const text = `${sol.problemTitle}. Formula: ${sol.formulaUsed}. ${sol.steps
      .map((s) => `Step ${s.stepNumber}: ${s.title}. ${s.work}.`)
      .join(" ")} Final Answer: ${sol.finalAnswer}.`;
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = getSpeechLocale(language);
    window.speechSynthesis.speak(utterance);
  }

  // Interactive math lab calculations
  const algC = algA * algX + algB;
  const rad = (trigAngle * Math.PI) / 180;
  const sinVal = Math.sin(rad);
  const cosVal = Math.cos(rad);
  const tanVal = Math.tan(rad);
  const oppLen = (trigHypotenuse * sinVal).toFixed(2);
  const adjLen = (trigHypotenuse * cosVal).toFixed(2);

  return (
    <div className="max-w-[1280px] mx-auto flex flex-col gap-6">
      {/* Class 1 to 10 Selector Header */}
      <section className="bg-white border border-slate-200 rounded-xl p-6 flex flex-col gap-4">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <div className="text-xs font-semibold text-sky-700">
              Maths Studio · Standard 1 to Standard 10
            </div>
            <h1 className="text-2xl font-bold text-slate-900 mt-1">
              Class {selectedClass}: {currentLevel.stageTitle}
            </h1>
          </div>
          <div className="flex flex-wrap items-center gap-2 shrink-0">
            <select
              aria-label="Maths teaching language"
              value={language}
              onChange={(e) => onChangeLanguage(e.target.value as LanguageMode)}
              className="px-2.5 py-2 text-xs font-semibold bg-slate-100 border border-slate-200 rounded-lg text-slate-900"
            >
              {LANGUAGE_OPTIONS.map((lang) => (
                <option key={lang.id} value={lang.id}>
                  {lang.nativeLabel}
                </option>
              ))}
            </select>
            <button
              type="button"
              onClick={() =>
                onOpenInClassroom(
                  `Class ${selectedClass} Maths: ${activeTopic}`,
                  `Teach me Class ${selectedClass} Maths topic "${activeTopic}" step by step with simple examples.`
                )
              }
              className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors whitespace-nowrap"
            >
              <GraduationCap className="w-4 h-4" aria-hidden="true" />
              Teach in Classroom
            </button>
            <button
              type="button"
              onClick={() => onStartClassQuiz(`Class ${selectedClass} Maths - ${activeTopic}`)}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-white bg-sky-600 hover:bg-sky-700 rounded-lg transition-colors whitespace-nowrap"
            >
              Take Class {selectedClass} Quiz
              <ArrowRight className="w-3.5 h-3.5" aria-hidden="true" />
            </button>
          </div>
        </div>

        {/* Grade 1-10 Buttons */}
        <div className="grid grid-cols-5 sm:grid-cols-10 gap-2 pt-2 border-t border-slate-100">
          {MATHS_CLASS_CURRICULUM.map((lvl) => (
            <button
              key={lvl.grade}
              type="button"
              onClick={() => handleSelectGrade(lvl.grade)}
              className={`py-2 px-2 rounded-lg text-xs font-semibold tabular-nums border transition-colors whitespace-nowrap ${
                selectedClass === lvl.grade
                  ? "bg-sky-600 text-white border-sky-600"
                  : "bg-slate-50 text-slate-700 border-slate-200 hover:border-sky-400"
              }`}
            >
              Class {lvl.grade}
            </button>
          ))}
        </div>
      </section>

      {/* Main Two-Column Maths Workspace */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left: Chapters & Step-by-Step AI Maths Solver */}
        <section className="lg:col-span-7 bg-white border border-slate-200 rounded-xl p-6 flex flex-col gap-5">
          <div>
            <h2 className="text-lg font-semibold text-slate-900">
              Class {selectedClass} Chapters & Step-by-Step Solver
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Pick a chapter or type any homework sum to see full step-by-step notebook working.
            </p>
          </div>

          {/* Chapters */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            {currentLevel.chapters.map((ch) => {
              const isSelected = activeTopic === ch.title;
              return (
                <button
                  key={ch.title}
                  type="button"
                  onClick={() => {
                    setActiveTopic(ch.title);
                    solveQuestion(ch.sampleQuestion, ch.title);
                  }}
                  className={`text-left p-3.5 rounded-lg border transition-colors ${
                    isSelected
                      ? "border-sky-500 bg-sky-50/50"
                      : "border-slate-200 bg-white hover:border-slate-300"
                  }`}
                >
                  <div className="text-sm font-semibold text-slate-900">{ch.title}</div>
                  <div className="text-xs text-slate-600 mt-1 line-clamp-2">{ch.summary}</div>
                </button>
              );
            })}
          </div>

          {/* Question Form */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              solveQuestion(questionInput, activeTopic);
            }}
            className="flex flex-wrap sm:flex-nowrap items-center gap-2 pt-2 border-t border-slate-100"
          >
            <input
              type="text"
              value={questionInput}
              onChange={(e) => setQuestionInput(e.target.value)}
              placeholder={`Ask any Class ${selectedClass} Maths problem...`}
              className="flex-1 min-w-[200px] px-3.5 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-lg text-slate-900 focus:outline-2 focus:outline-sky-600 min-h-[42px]"
            />
            <button
              type="submit"
              disabled={!questionInput.trim() || solving}
              className="inline-flex items-center justify-center gap-1.5 px-4 py-2.5 text-sm font-semibold text-white bg-sky-600 hover:bg-sky-700 disabled:opacity-50 rounded-lg transition-colors whitespace-nowrap shrink-0 min-h-[42px]"
            >
              <Calculator className="w-4 h-4" aria-hidden="true" />
              {solving ? "Solving..." : "Solve Step by Step"}
            </button>
          </form>

          {solveError && (
            <div className="p-3 rounded-lg bg-red-50 border border-red-200 text-sm text-red-800">
              {solveError}
            </div>
          )}

          {/* Step-by-Step Solution Output */}
          {solution && (
            <div className="border-t border-slate-200 pt-5 flex flex-col gap-4">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <h3 className="text-base font-bold text-slate-900">{solution.problemTitle}</h3>
                  <div className="text-xs font-mono text-sky-800 bg-sky-50 border border-sky-200 px-2.5 py-1 rounded mt-1.5 inline-block">
                    Rule / Formula: {solution.formulaUsed}
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => speakSolution(solution)}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-sky-700 bg-sky-50 hover:bg-sky-100 rounded-lg"
                >
                  <Volume2 className="w-4 h-4" aria-hidden="true" />
                  Listen Steps
                </button>
              </div>

              <div className="flex flex-col gap-2.5">
                {solution.steps.map((step) => (
                  <div
                    key={step.stepNumber}
                    className="p-3.5 rounded-lg border border-slate-200 bg-slate-50/60"
                  >
                    <div className="flex items-center justify-between gap-2 mb-1">
                      <span className="text-xs font-semibold text-sky-700">
                        Step {step.stepNumber} · {step.title}
                      </span>
                    </div>
                    <div className="font-mono text-sm font-semibold text-slate-900 tabular-nums">
                      {step.work}
                    </div>
                    <p className="text-xs text-slate-600 mt-1">{step.note}</p>
                  </div>
                ))}
              </div>

              <div className="p-4 rounded-lg bg-emerald-50 border border-emerald-200 flex items-center justify-between gap-3">
                <div>
                  <div className="text-xs font-semibold text-emerald-800">Final Answer</div>
                  <div className="font-mono text-lg font-bold text-emerald-950 tabular-nums">
                    {solution.finalAnswer}
                  </div>
                </div>
                <CheckCircle2 className="w-6 h-6 text-emerald-700 shrink-0" aria-hidden="true" />
              </div>

              {/* Try It Yourself Bonus */}
              <div className="p-4 rounded-lg border border-slate-200 bg-white flex flex-col gap-2.5">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-xs font-semibold text-slate-600">Now You Try One!</span>
                  <button
                    type="button"
                    onClick={() => setShowTryHint((prev) => !prev)}
                    className="inline-flex items-center gap-1 text-xs font-semibold text-amber-700"
                  >
                    <HelpCircle className="w-3.5 h-3.5" aria-hidden="true" />
                    {showTryHint ? "Hide Hint" : "Show Hint"}
                  </button>
                </div>
                <p className="text-sm font-semibold text-slate-900">{solution.practiceTryIt.question}</p>
                {showTryHint && (
                  <p className="text-xs text-amber-800 bg-amber-50 p-2 rounded">
                    Hint: {solution.practiceTryIt.hint}
                  </p>
                )}
                <div className="flex flex-wrap items-center gap-2">
                  <input
                    type="text"
                    value={tryInput}
                    onChange={(e) => setTryInput(e.target.value)}
                    placeholder="Type your answer..."
                    className="px-3 py-2 text-sm border border-slate-200 rounded-lg bg-slate-50 flex-1 min-w-[160px]"
                  />
                  <button
                    type="button"
                    onClick={() => setTryStatus("checked")}
                    className="inline-flex items-center gap-1 px-3.5 py-2 text-xs font-semibold text-white bg-sky-600 hover:bg-sky-700 rounded-lg"
                  >
                    <Send className="w-3.5 h-3.5" aria-hidden="true" />
                    Reveal & Check
                  </button>
                </div>
                {tryStatus === "checked" && (
                  <p className="text-xs font-semibold text-emerald-800">
                    Expected Answer: <span className="font-mono">{solution.practiceTryIt.answer}</span>
                  </p>
                )}
              </div>
            </div>
          )}
        </section>

        {/* Right: Grade-Adaptive Interactive Visual Maths Explorer */}
        <aside className="lg:col-span-5 bg-white border border-slate-200 rounded-xl p-6 flex flex-col gap-5">
          {currentLevel.visualizer === "tables" && (
            <>
              <div>
                <span className="text-xs font-semibold text-sky-700">
                  Interactive Tool · Classes 1–4
                </span>
                <h2 className="text-lg font-semibold text-slate-900 mt-0.5">
                  Multiplication Table Explorer (1 to 20)
                </h2>
                <p className="text-xs text-slate-600 mt-1">
                  Pick any table number to study its pattern and practice aloud.
                </p>
              </div>

              <div className="grid grid-cols-5 gap-1.5">
                {Array.from({ length: 20 }, (_, i) => i + 1).map((num) => (
                  <button
                    key={num}
                    type="button"
                    onClick={() => setTableNumber(num)}
                    className={`py-1.5 rounded-md text-xs font-mono font-semibold tabular-nums border transition-colors ${
                      tableNumber === num
                        ? "bg-sky-600 text-white border-sky-600"
                        : "bg-slate-50 text-slate-700 border-slate-200 hover:border-sky-400"
                    }`}
                  >
                    {num}
                  </button>
                ))}
              </div>

              <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 grid grid-cols-2 gap-2">
                {Array.from({ length: 10 }, (_, i) => i + 1).map((mult) => (
                  <div
                    key={mult}
                    className="bg-white border border-slate-200 rounded-lg px-3 py-2 font-mono text-sm font-semibold text-slate-900 tabular-nums flex items-center justify-between"
                  >
                    <span>
                      {tableNumber} × {mult}
                    </span>
                    <span className="text-sky-700">{tableNumber * mult}</span>
                  </div>
                ))}
              </div>
            </>
          )}

          {currentLevel.visualizer === "algebra" && (
            <>
              <div>
                <span className="text-xs font-semibold text-sky-700">
                  Interactive Tool · Classes 5–8
                </span>
                <h2 className="text-lg font-semibold text-slate-900 mt-0.5">
                  Linear Equation Balance Lab
                </h2>
                <p className="text-xs text-slate-600 mt-1">
                  Change <span className="font-mono">a</span>, <span className="font-mono">b</span>, and{" "}
                  <span className="font-mono">x</span> to see how linear equations stay balanced!
                </p>
              </div>

              <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 text-center">
                <div className="text-xs text-slate-500 font-medium">Equation</div>
                <div className="font-mono text-2xl font-bold text-slate-900 mt-1 tabular-nums">
                  {algA}x + {algB} = {algC}
                </div>
                <div className="font-mono text-sm text-sky-700 mt-2 tabular-nums">
                  {algA}({algX}) + {algB} = {algA * algX} + {algB} = {algC}
                </div>
              </div>

              <div className="flex flex-col gap-3">
                <label className="flex flex-col gap-1">
                  <span className="text-xs font-semibold text-slate-700 tabular-nums">
                    Coefficient a: {algA}
                  </span>
                  <input
                    type="range"
                    min={1}
                    max={9}
                    value={algA}
                    onChange={(e) => setAlgA(Number(e.target.value))}
                    className="accent-sky-600"
                  />
                </label>
                <label className="flex flex-col gap-1">
                  <span className="text-xs font-semibold text-slate-700 tabular-nums">
                    Constant b: {algB}
                  </span>
                  <input
                    type="range"
                    min={0}
                    max={15}
                    value={algB}
                    onChange={(e) => setAlgB(Number(e.target.value))}
                    className="accent-sky-600"
                  />
                </label>
                <label className="flex flex-col gap-1">
                  <span className="text-xs font-semibold text-slate-700 tabular-nums">
                    Unknown x: {algX}
                  </span>
                  <input
                    type="range"
                    min={1}
                    max={12}
                    value={algX}
                    onChange={(e) => setAlgX(Number(e.target.value))}
                    className="accent-emerald-600"
                  />
                </label>
              </div>

              <button
                type="button"
                onClick={() => solveQuestion(`Solve for x step by step: ${algA}x + ${algB} = ${algC}`, "Linear Equations")}
                className="px-4 py-2 text-xs font-semibold text-white bg-sky-600 hover:bg-sky-700 rounded-lg transition-colors self-start"
              >
                Solve {algA}x + {algB} = {algC} Step-by-Step
              </button>
            </>
          )}

          {currentLevel.visualizer === "trigonometry" && (
            <>
              <div>
                <span className="text-xs font-semibold text-sky-700">
                  Interactive Tool · Classes 9–10
                </span>
                <h2 className="text-lg font-semibold text-slate-900 mt-0.5">
                  Right-Triangle Trigonometry Explorer
                </h2>
                <p className="text-xs text-slate-600 mt-1">
                  Slide angle θ and hypotenuse H to watch sin θ, cos θ, and tan θ update live.
                </p>
              </div>

              <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 flex flex-col items-center gap-3">
                <svg viewBox="0 0 240 160" className="w-full max-w-[260px]" role="img" aria-label="Right triangle trigonometry diagram">
                  {(() => {
                    const basePx = Math.max(40, Math.round(140 * cosVal));
                    const heightPx = Math.max(30, Math.round(115 * sinVal));
                    const x0 = 40;
                    const y0 = 135;
                    const x1 = x0 + basePx;
                    const y1 = y0;
                    const x2 = x1;
                    const y2 = y0 - heightPx;
                    return (
                      <>
                        <polygon
                          points={`${x0},${y0} ${x1},${y1} ${x2},${y2}`}
                          fill="#E0F2FE"
                          stroke="#0284C7"
                          strokeWidth="2.5"
                        />
                        <rect x={x1 - 10} y={y1 - 10} width="10" height="10" fill="none" stroke="#0F172A" strokeWidth="1.5" />
                        <text x={x0 + 18} y={y0 - 8} fontSize="11" fill="#0F172A" fontFamily="monospace">
                          {trigAngle}°
                        </text>
                        <text x={(x0 + x1) / 2 - 18} y={y0 + 16} fontSize="11" fill="#334155" fontFamily="monospace">
                          Adj: {adjLen}
                        </text>
                        <text x={x1 + 6} y={(y1 + y2) / 2} fontSize="11" fill="#059669" fontFamily="monospace">
                          Opp: {oppLen}
                        </text>
                      </>
                    );
                  })()}
                </svg>

                <div className="grid grid-cols-3 gap-2 w-full text-center">
                  <div className="bg-white border border-slate-200 rounded-lg p-2">
                    <div className="text-[11px] text-slate-500">sin {trigAngle}°</div>
                    <div className="font-mono text-sm font-bold text-sky-700 tabular-nums">
                      {sinVal.toFixed(3)}
                    </div>
                  </div>
                  <div className="bg-white border border-slate-200 rounded-lg p-2">
                    <div className="text-[11px] text-slate-500">cos {trigAngle}°</div>
                    <div className="font-mono text-sm font-bold text-slate-900 tabular-nums">
                      {cosVal.toFixed(3)}
                    </div>
                  </div>
                  <div className="bg-white border border-slate-200 rounded-lg p-2">
                    <div className="text-[11px] text-slate-500">tan {trigAngle}°</div>
                    <div className="font-mono text-sm font-bold text-emerald-700 tabular-nums">
                      {tanVal.toFixed(3)}
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex flex-col gap-3">
                <label className="flex flex-col gap-1">
                  <span className="text-xs font-semibold text-slate-700 tabular-nums">
                    Angle θ: {trigAngle}°
                  </span>
                  <input
                    type="range"
                    min={15}
                    max={75}
                    step={5}
                    value={trigAngle}
                    onChange={(e) => setTrigAngle(Number(e.target.value))}
                    className="accent-sky-600"
                  />
                </label>

                <label className="flex flex-col gap-1">
                  <span className="text-xs font-semibold text-slate-700 tabular-nums">
                    Hypotenuse H: {trigHypotenuse} units
                  </span>
                  <input
                    type="range"
                    min={5}
                    max={25}
                    value={trigHypotenuse}
                    onChange={(e) => setTrigHypotenuse(Number(e.target.value))}
                    className="accent-emerald-600"
                  />
                </label>
              </div>
            </>
          )}
        </aside>
      </div>
    </div>
  );
}
