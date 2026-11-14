import { useEffect, useState } from "react";
import {
  CheckCircle2,
  ChevronRight,
  HelpCircle,
  Play,
  RotateCcw,
  Sliders,
  Volume2,
  VolumeX,
} from "lucide-react";
import { getSpeechLocale } from "../data/curriculum";
import type { AgeGroup, LanguageMode, MiniCheck, VisualConcept } from "../types";

interface InteractiveStageProps {
  subject: string;
  topic: string;
  ageGroup: AgeGroup;
  language: LanguageMode;
  lessonTitle: string;
  visualConcept: VisualConcept;
  miniCheck: MiniCheck | null;
  isLoading: boolean;
  onAwardStars: (stars: number, reason: string) => void;
  onAskTeacher: (prompt: string) => void;
}

export function InteractiveStage({
  subject,
  topic,
  ageGroup,
  language,
  lessonTitle,
  visualConcept,
  miniCheck,
  isLoading,
  onAwardStars,
  onAskTeacher,
}: InteractiveStageProps) {
  const [stageTab, setStageTab] = useState<"board" | "lab">("board");
  const [activeStepIdx, setActiveStepIdx] = useState<number>(0);
  const [isSpeaking, setIsSpeaking] = useState(false);

  // Mini-check interactive state
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [checkSolved, setCheckSolved] = useState(false);

  // Interactive Lab states (Fractions, Photosynthesis, Patterns)
  const [fractionTotal, setFractionTotal] = useState(4);
  const [fractionTaken, setFractionTaken] = useState(2);
  const [sunlightPct, setSunlightPct] = useState(70);
  const [waterPct, setWaterPct] = useState(65);
  const [patternStep, setPatternStep] = useState(3);
  const [patternGuess, setPatternGuess] = useState("");
  const [patternFeedback, setPatternFeedback] = useState<string | null>(null);

  useEffect(() => {
    setActiveStepIdx(0);
    setSelectedOption(null);
    setCheckSolved(false);
  }, [lessonTitle, miniCheck?.question]);

  useEffect(() => {
    return () => {
      if (typeof window !== "undefined" && "speechSynthesis" in window) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  const cards = visualConcept.cards || [];
  const safeIdx = Math.min(activeStepIdx, Math.max(0, cards.length - 1));

  function handleSpeakLesson() {
    if (typeof window === "undefined" || !("speechSynthesis" in window)) return;
    if (isSpeaking) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
      return;
    }

    const parts = [
      lessonTitle,
      visualConcept.summary,
      ...cards.map((c) => `${c.title}. ${c.detail}`),
    ];
    const utterance = new SpeechSynthesisUtterance(parts.join(". "));
    utterance.lang = getSpeechLocale(language);
    utterance.rate = ageGroup === "5-7" ? 0.9 : 0.98;
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);
    window.speechSynthesis.cancel();
    setIsSpeaking(true);
    window.speechSynthesis.speak(utterance);
  }

  function handleSelectMiniOption(idx: number) {
    if (!miniCheck) return;
    setSelectedOption(idx);
    if (idx === miniCheck.correctIndex && !checkSolved) {
      setCheckSolved(true);
      onAwardStars(5, "Correct check-in answer");
    }
  }

  // Lab computations
  const clampedTaken = Math.min(fractionTaken, fractionTotal);
  const fractionPercent = Math.round((clampedTaken / fractionTotal) * 100);
  const photosynthesisRate = Math.round(Math.min(sunlightPct, waterPct) * 0.9 + ((sunlightPct + waterPct) / 2) * 0.1);
  const isPlantThriving = sunlightPct >= 35 && waterPct >= 35;
  const sequenceNumbers = [2, 2 + patternStep, 2 + patternStep * 2, 2 + patternStep * 3, 2 + patternStep * 4];
  const expectedNextNumber = 2 + patternStep * 5;

  const activeLabType = subject.toLowerCase().includes("math")
    ? "fractions"
    : subject.toLowerCase().includes("logic")
      ? "patterns"
      : "photosynthesis";

  return (
    <section
      aria-label="Interactive Learning Stage"
      className="bg-white border border-slate-200 rounded-xl p-5 sm:p-6 flex flex-col gap-5"
    >
      {/* Top Stage Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-100 pb-4">
        <div className="min-w-0">
          <div className="flex items-center gap-2 text-xs text-slate-500 font-medium">
            <span>{subject}</span>
            <span aria-hidden="true">·</span>
            <span className="truncate max-w-[220px]">{topic}</span>
            <span aria-hidden="true">·</span>
            <span>Ages {ageGroup}</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-semibold text-slate-900 mt-1 text-balance">
            {lessonTitle}
          </h1>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-lg">
            <button
              type="button"
              onClick={() => setStageTab("board")}
              className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-colors whitespace-nowrap shrink-0 ${
                stageTab === "board"
                  ? "bg-white text-slate-900 shadow-sm"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              Visual Board
            </button>
            <button
              type="button"
              onClick={() => setStageTab("lab")}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-md transition-colors whitespace-nowrap shrink-0 ${
                stageTab === "lab"
                  ? "bg-white text-slate-900 shadow-sm"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              <Sliders className="w-3.5 h-3.5" aria-hidden="true" />
              Interactive Lab
            </button>
          </div>

          <button
            type="button"
            onClick={handleSpeakLesson}
            aria-label={isSpeaking ? "Stop reading lesson aloud" : "Listen to lesson aloud"}
            className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-sky-700 bg-sky-50 hover:bg-sky-100 rounded-lg transition-colors whitespace-nowrap shrink-0 min-h-[38px]"
          >
            {isSpeaking ? (
              <>
                <VolumeX className="w-4 h-4" aria-hidden="true" />
                Stop Audio
              </>
            ) : (
              <>
                <Volume2 className="w-4 h-4" aria-hidden="true" />
                Listen
              </>
            )}
          </button>
        </div>
      </div>

      {stageTab === "board" ? (
        <div className="flex flex-col gap-5">
          {/* Summary Takeaway Banner */}
          <div className="bg-slate-50 border border-slate-200 rounded-lg p-4">
            <p className="text-sm sm:text-base font-medium text-slate-800 leading-relaxed">
              {isLoading ? "Shikshak is preparing your visual chalkboard..." : visualConcept.summary}
            </p>
          </div>

          {/* Step-by-Step Visual Concept Grid */}
          <div>
            <div className="flex items-center justify-between gap-4 mb-3">
              <span className="text-xs font-semibold text-slate-500">
                Concept Steps ({cards.length > 0 ? safeIdx + 1 : 0} of {cards.length})
              </span>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setActiveStepIdx(0)}
                  className="inline-flex items-center gap-1 px-2.5 py-1.5 text-xs font-medium text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 rounded-md transition-colors whitespace-nowrap shrink-0"
                >
                  <RotateCcw className="w-3.5 h-3.5" aria-hidden="true" />
                  Reset
                </button>
                <button
                  type="button"
                  disabled={cards.length === 0}
                  onClick={() => setActiveStepIdx((prev) => (prev + 1 < cards.length ? prev + 1 : 0))}
                  className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-semibold text-white bg-sky-600 hover:bg-sky-700 disabled:opacity-50 rounded-md transition-colors whitespace-nowrap shrink-0"
                >
                  <Play className="w-3.5 h-3.5" aria-hidden="true" />
                  Next Step
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              {cards.map((card, idx) => {
                const isFocused = idx === safeIdx;
                return (
                  <button
                    key={`${card.title}-${idx}`}
                    type="button"
                    onClick={() => setActiveStepIdx(idx)}
                    className={`text-left p-4 rounded-xl border transition-all ${
                      isFocused
                        ? "border-sky-500 bg-sky-50/50 ring-1 ring-sky-500/20"
                        : "border-slate-200 bg-white hover:border-slate-300"
                    }`}
                  >
                    <div className="flex items-center justify-between gap-2 mb-2">
                      <span className="text-xs font-semibold text-sky-700">{card.stepLabel}</span>
                      <span className="font-mono text-xs font-semibold text-slate-700 bg-slate-100 px-2 py-0.5 rounded tabular-nums">
                        {card.symbol}
                      </span>
                    </div>
                    <h3 className="text-base font-semibold text-slate-900 mb-1">{card.title}</h3>
                    <p className="text-sm text-slate-600 leading-relaxed">{card.detail}</p>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Interactive Mini Check-In */}
          {miniCheck && (
            <div className="border-t border-slate-200 pt-5">
              <div className="flex items-center justify-between gap-3 mb-2">
                <span className="text-xs font-semibold text-slate-600">
                  Quick Check-In · Earn +5 Stars
                </span>
                {checkSolved && (
                  <span className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-700">
                    <CheckCircle2 className="w-4 h-4" aria-hidden="true" />
                    Completed
                  </span>
                )}
              </div>
              <p className="text-base font-semibold text-slate-900 mb-3">{miniCheck.question}</p>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                {miniCheck.options.map((opt, idx) => {
                  const isChosen = selectedOption === idx;
                  const isCorrect = idx === miniCheck.correctIndex;
                  let btnClass = "border-slate-200 bg-white text-slate-800 hover:border-sky-400";
                  if (isChosen && isCorrect) {
                    btnClass = "border-emerald-600 bg-emerald-50 text-emerald-900 font-semibold";
                  } else if (isChosen && !isCorrect) {
                    btnClass = "border-amber-500 bg-amber-50 text-amber-900";
                  }

                  return (
                    <button
                      key={`${opt}-${idx}`}
                      type="button"
                      onClick={() => handleSelectMiniOption(idx)}
                      className={`px-3.5 py-2.5 text-sm text-left rounded-lg border transition-colors min-h-[44px] ${btnClass}`}
                    >
                      {opt}
                    </button>
                  );
                })}
              </div>

              {selectedOption !== null && (
                <div
                  className={`mt-3 p-3 rounded-lg text-sm flex items-start gap-2.5 ${
                    selectedOption === miniCheck.correctIndex
                      ? "bg-emerald-50 text-emerald-900 border border-emerald-200"
                      : "bg-amber-50 text-amber-900 border border-amber-200"
                  }`}
                >
                  {selectedOption === miniCheck.correctIndex ? (
                    <CheckCircle2 className="w-4 h-4 mt-0.5 text-emerald-700 shrink-0" aria-hidden="true" />
                  ) : (
                    <HelpCircle className="w-4 h-4 mt-0.5 text-amber-700 shrink-0" aria-hidden="true" />
                  )}
                  <div>
                    <span className="font-semibold">
                      {selectedOption === miniCheck.correctIndex ? "Correct! " : "Try again · Hint: "}
                    </span>
                    <span>
                      {selectedOption === miniCheck.correctIndex ? miniCheck.praise : miniCheck.hint}
                    </span>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      ) : (
        /* Interactive Simulation Lab */
        <div className="flex flex-col gap-5">
          {activeLabType === "fractions" && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center bg-slate-50 border border-slate-200 rounded-xl p-5">
              <div className="flex flex-col items-center justify-center gap-3">
                <svg viewBox="0 0 200 200" className="w-48 h-48" role="img" aria-label={`Fraction circle showing ${clampedTaken} out of ${fractionTotal} slices`}>
                  <circle cx="100" cy="100" r="88" fill="#FFFFFF" stroke="#CBD5E1" strokeWidth="2" />
                  {Array.from({ length: fractionTotal }).map((_, i) => {
                    const startAngle = (i * 2 * Math.PI) / fractionTotal - Math.PI / 2;
                    const endAngle = ((i + 1) * 2 * Math.PI) / fractionTotal - Math.PI / 2;
                    const x1 = 100 + 86 * Math.cos(startAngle);
                    const y1 = 100 + 86 * Math.sin(startAngle);
                    const x2 = 100 + 86 * Math.cos(endAngle);
                    const y2 = 100 + 86 * Math.sin(endAngle);
                    const largeArc = 2 * Math.PI / fractionTotal > Math.PI ? 1 : 0;
                    const filled = i < clampedTaken;
                    return (
                      <path
                        key={i}
                        d={`M 100 100 L ${x1} ${y1} A 86 86 0 ${largeArc} 1 ${x2} ${y2} Z`}
                        fill={filled ? "#0284C7" : "#F1F5F9"}
                        stroke="#FFFFFF"
                        strokeWidth="2.5"
                      />
                    );
                  })}
                </svg>
                <div className="font-mono text-lg font-semibold text-slate-900 tabular-nums">
                  {clampedTaken} / {fractionTotal} = {fractionPercent}%
                </div>
              </div>

              <div className="flex flex-col gap-4">
                <div>
                  <h3 className="text-base font-semibold text-slate-900">Fraction Sharing Explorer</h3>
                  <p className="text-sm text-slate-600 mt-1">
                    Slide to cut the wheel into equal parts and see how fractions work!
                  </p>
                </div>

                <label className="flex flex-col gap-1.5">
                  <span className="text-xs font-semibold text-slate-700 tabular-nums">
                    Total Equal Slices (Denominator): {fractionTotal}
                  </span>
                  <input
                    type="range"
                    min={2}
                    max={10}
                    value={fractionTotal}
                    onChange={(e) => {
                      const nextTotal = Number(e.target.value);
                      setFractionTotal(nextTotal);
                      if (fractionTaken > nextTotal) setFractionTaken(nextTotal);
                    }}
                    className="accent-sky-600"
                  />
                </label>

                <label className="flex flex-col gap-1.5">
                  <span className="text-xs font-semibold text-slate-700 tabular-nums">
                    Slices Shaded (Numerator): {clampedTaken}
                  </span>
                  <input
                    type="range"
                    min={0}
                    max={fractionTotal}
                    value={clampedTaken}
                    onChange={(e) => setFractionTaken(Number(e.target.value))}
                    className="accent-sky-600"
                  />
                </label>

                <button
                  type="button"
                  onClick={() => {
                    setStageTab("board");
                    onAskTeacher(
                      `Explain why ${clampedTaken}/${fractionTotal} equals ${fractionPercent}% using a real-life example!`
                    );
                  }}
                  className="inline-flex items-center justify-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-sky-600 hover:bg-sky-700 rounded-lg transition-colors self-start"
                >
                  Ask Teacher About {clampedTaken}/{fractionTotal}
                  <ChevronRight className="w-3.5 h-3.5" aria-hidden="true" />
                </button>
              </div>
            </div>
          )}

          {activeLabType === "photosynthesis" && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center bg-slate-50 border border-slate-200 rounded-xl p-5">
              <div className="flex flex-col items-center gap-3">
                <svg viewBox="0 0 240 180" className="w-full max-w-[260px]" role="img" aria-label="Plant photosynthesis energy diagram">
                  {/* Sun */}
                  <circle cx="42" cy="36" r={14 + sunlightPct * 0.1} fill="#F59E0B" opacity={0.3 + sunlightPct * 0.007} />
                  <circle cx="42" cy="36" r="12" fill="#D97706" />
                  {/* Water Drops */}
                  <path
                    d="M 195 28 C 195 28 208 46 208 54 A 13 13 0 1 1 182 54 C 182 46 195 28 195 28 Z"
                    fill="#0284C7"
                    opacity={0.25 + waterPct * 0.0075}
                  />
                  {/* Plant Stem & Leaf */}
                  <rect x="116" y="88" width="8" height="68" rx="4" fill="#059669" />
                  <ellipse
                    cx="92"
                    cy="98"
                    rx="32"
                    ry="16"
                    transform="rotate(-24 92 98)"
                    fill={isPlantThriving ? "#10B981" : "#94A3B8"}
                  />
                  <ellipse
                    cx="148"
                    cy="88"
                    rx="34"
                    ry="17"
                    transform="rotate(20 148 88)"
                    fill={isPlantThriving ? "#059669" : "#64748B"}
                  />
                  <rect x="85" y="152" width="70" height="16" rx="4" fill="#92400E" />
                </svg>

                <div className="flex items-center gap-3 text-xs font-semibold">
                  <span className={isPlantThriving ? "text-emerald-700" : "text-amber-700"}>
                    {isPlantThriving ? "● NOMINAL GROWTH" : "▲ LOW ENERGY"}
                  </span>
                  <span className="text-slate-300" aria-hidden="true">|</span>
                  <span className="font-mono tabular-nums text-slate-800">
                    Food Output: {photosynthesisRate}%
                  </span>
                </div>
              </div>

              <div className="flex flex-col gap-4">
                <div>
                  <h3 className="text-base font-semibold text-slate-900">Leaf Kitchen Simulator</h3>
                  <p className="text-sm text-slate-600 mt-1">
                    Adjust Sunlight and Water to see how fast a green leaf produces glucose and oxygen!
                  </p>
                </div>

                <label className="flex flex-col gap-1.5">
                  <span className="text-xs font-semibold text-slate-700 tabular-nums">
                    Sunlight Intensity: {sunlightPct}%
                  </span>
                  <input
                    type="range"
                    min={0}
                    max={100}
                    value={sunlightPct}
                    onChange={(e) => setSunlightPct(Number(e.target.value))}
                    className="accent-amber-600"
                  />
                </label>

                <label className="flex flex-col gap-1.5">
                  <span className="text-xs font-semibold text-slate-700 tabular-nums">
                    Water Supply: {waterPct}%
                  </span>
                  <input
                    type="range"
                    min={0}
                    max={100}
                    value={waterPct}
                    onChange={(e) => setWaterPct(Number(e.target.value))}
                    className="accent-sky-600"
                  />
                </label>

                <button
                  type="button"
                  onClick={() => {
                    setStageTab("board");
                    onAskTeacher(
                      `My plant has ${sunlightPct}% sunlight and ${waterPct}% water. What happens inside the leaf right now?`
                    );
                  }}
                  className="inline-flex items-center justify-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-sky-600 hover:bg-sky-700 rounded-lg transition-colors self-start"
                >
                  Ask Teacher About This State
                  <ChevronRight className="w-3.5 h-3.5" aria-hidden="true" />
                </button>
              </div>
            </div>
          )}

          {activeLabType === "patterns" && (
            <div className="bg-slate-50 border border-slate-200 rounded-xl p-5 flex flex-col gap-4">
              <div>
                <h3 className="text-base font-semibold text-slate-900">Number Pattern Detective</h3>
                <p className="text-sm text-slate-600 mt-1">
                  Pick a jump rule, study the sequence, and type the missing 6th number!
                </p>
              </div>

              <label className="flex flex-col gap-1.5 max-w-xs">
                <span className="text-xs font-semibold text-slate-700 tabular-nums">
                  Jump Rule: +{patternStep} each step
                </span>
                <input
                  type="range"
                  min={2}
                  max={12}
                  value={patternStep}
                  onChange={(e) => {
                    setPatternStep(Number(e.target.value));
                    setPatternGuess("");
                    setPatternFeedback(null);
                  }}
                  className="accent-sky-600"
                />
              </label>

              <div className="flex flex-wrap items-center gap-2.5">
                {sequenceNumbers.map((num, idx) => (
                  <div
                    key={idx}
                    className="w-14 h-14 rounded-lg bg-white border border-slate-200 flex items-center justify-center font-mono text-lg font-semibold text-slate-900 tabular-nums"
                  >
                    {num}
                  </div>
                ))}
                <div className="w-16 h-14 rounded-lg bg-sky-50 border-2 border-dashed border-sky-400 flex items-center justify-center font-mono text-lg font-semibold text-sky-700">
                  ?
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-2.5">
                <input
                  type="number"
                  value={patternGuess}
                  onChange={(e) => setPatternGuess(e.target.value)}
                  placeholder="Next number"
                  className="px-3 py-2 text-sm border border-slate-300 rounded-lg bg-white w-36 focus:outline-2 focus:outline-sky-600"
                />
                <button
                  type="button"
                  onClick={() => {
                    if (Number(patternGuess) === expectedNextNumber) {
                      setPatternFeedback(`Correct! Adding ${patternStep} gives ${expectedNextNumber}.`);
                      onAwardStars(5, "Solved pattern puzzle");
                    } else {
                      setPatternFeedback(`Almost! Try adding ${patternStep} to ${sequenceNumbers[4]}.`);
                    }
                  }}
                  className="px-4 py-2 text-sm font-semibold text-white bg-sky-600 hover:bg-sky-700 rounded-lg transition-colors"
                >
                  Check Answer
                </button>
              </div>
              {patternFeedback && <p className="text-sm font-medium text-slate-800">{patternFeedback}</p>}
            </div>
          )}
        </div>
      )}
    </section>
  );
}
