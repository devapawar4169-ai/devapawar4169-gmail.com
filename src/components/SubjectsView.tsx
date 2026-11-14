import { useState } from "react";
import { ArrowRight, BookOpen, Compass, Cpu, FlaskConical, Sigma } from "lucide-react";
import { ASSETS, SUBJECT_TRACKS } from "../data/curriculum";

interface SubjectsViewProps {
  onStartLesson: (subject: string, topic: string, starterPrompt: string) => void;
}

export function SubjectsView({ onStartLesson }: SubjectsViewProps) {
  const [customSubject, setCustomSubject] = useState("Science & Space");
  const [customTopic, setCustomTopic] = useState("");
  const [failedImages, setFailedImages] = useState<Record<string, boolean>>({});

  function markImageFailed(key: string) {
    setFailedImages((prev) => ({ ...prev, [key]: true }));
  }

  function handleCustomSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!customTopic.trim()) return;
    onStartLesson(
      customSubject,
      customTopic.trim(),
      `Teach me about "${customTopic.trim()}" in an easy, step-by-step way with an example!`
    );
  }

  function getTrackIcon(id: string) {
    switch (id) {
      case "math":
        return <Sigma className="w-5 h-5 text-sky-700" aria-hidden="true" />;
      case "science":
        return <FlaskConical className="w-5 h-5 text-emerald-700" aria-hidden="true" />;
      case "english":
        return <BookOpen className="w-5 h-5 text-amber-700" aria-hidden="true" />;
      case "logic":
        return <Cpu className="w-5 h-5 text-sky-700" aria-hidden="true" />;
      default:
        return <Compass className="w-5 h-5 text-emerald-700" aria-hidden="true" />;
    }
  }

  return (
    <div className="max-w-[1240px] mx-auto flex flex-col gap-8">
      {/* Hero Split Banner */}
      <section className="bg-white border border-slate-200 rounded-xl overflow-hidden grid grid-cols-1 lg:grid-cols-12 items-stretch">
        <div className="lg:col-span-7 p-6 sm:p-8 flex flex-col justify-between gap-6">
          <div>
            <p className="text-xs font-semibold text-sky-700 mb-2">
              Guided Curriculum · Ages 5 to 14
            </p>
            <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 text-balance leading-tight">
              Pick a Subject or Ask Your Teacher About Any Topic
            </h1>
            <p className="text-sm sm:text-base text-slate-600 mt-3 max-w-xl leading-relaxed">
              Every lesson combines step-by-step explanations in English, Hinglish, or Hindi with a visual chalkboard and a quick check-in quiz.
            </p>
          </div>

          <form onSubmit={handleCustomSubmit} className="flex flex-wrap items-center gap-2.5 pt-2">
            <select
              value={customSubject}
              onChange={(e) => setCustomSubject(e.target.value)}
              aria-label="Choose subject"
              className="px-3 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-lg text-slate-900 min-h-[42px]"
            >
              {SUBJECT_TRACKS.map((t) => (
                <option key={t.id} value={t.name}>
                  {t.name}
                </option>
              ))}
            </select>
            <input
              type="text"
              value={customTopic}
              onChange={(e) => setCustomTopic(e.target.value)}
              placeholder="Type any topic (e.g., Volcanoes, Decimals)"
              className="flex-1 min-w-[210px] px-3.5 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-lg text-slate-900 placeholder:text-slate-400 min-h-[42px]"
            />
            <button
              type="submit"
              disabled={!customTopic.trim()}
              className="inline-flex items-center gap-1.5 px-4 py-2.5 text-sm font-semibold text-white bg-sky-600 hover:bg-sky-700 disabled:opacity-50 rounded-lg transition-colors whitespace-nowrap shrink-0 min-h-[42px]"
            >
              Start Lesson
              <ArrowRight className="w-4 h-4" aria-hidden="true" />
            </button>
          </form>
        </div>

        <div className="lg:col-span-5 bg-slate-100 min-h-[220px]">
          {!failedImages.heroDesk ? (
            <img
              src={ASSETS.heroDesk}
              alt="Sunlit children's study desk with open encyclopedia, globe, and magnifying glass"
              referrerPolicy="no-referrer"
              onError={() => markImageFailed("heroDesk")}
              className="w-full h-full lg:h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex flex-col items-center justify-center p-6 text-slate-600 bg-gradient-to-br from-sky-50 to-slate-100">
              <BookOpen className="w-10 h-10 text-sky-600 mb-2" aria-hidden="true" />
              <span className="text-sm font-semibold">Shikshak Learning Desk</span>
            </div>
          )}
        </div>
      </section>

      {/* Subject Cards Grid */}
      <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {SUBJECT_TRACKS.map((track) => {
          const hasImage = Boolean(track.image) && !failedImages[track.id];
          return (
            <article
              key={track.id}
              className="bg-white border border-slate-200 rounded-xl overflow-hidden flex flex-col justify-between"
            >
              <div>
                {hasImage ? (
                  <div className="h-40 bg-slate-50 border-b border-slate-100 overflow-hidden">
                    <img
                      src={track.image}
                      alt={`${track.name} educational illustration`}
                      referrerPolicy="no-referrer"
                      onError={() => markImageFailed(track.id)}
                      className="w-full h-full object-cover"
                    />
                  </div>
                ) : (
                  <div className="h-24 bg-slate-50 border-b border-slate-100 px-5 flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-white border border-slate-200 flex items-center justify-center">
                      {getTrackIcon(track.id)}
                    </div>
                    <span className="text-sm font-semibold text-slate-700">{track.name} Lab</span>
                  </div>
                )}

                <div className="p-5">
                  <h2 className="text-lg font-semibold text-slate-900">{track.name}</h2>
                  <p className="text-sm text-slate-600 mt-1 leading-relaxed">{track.tagline}</p>

                  <div className="mt-4 flex flex-col gap-2">
                    {track.topics.map((item) => (
                      <button
                        key={item.title}
                        type="button"
                        onClick={() => onStartLesson(track.name, item.title, item.starterPrompt)}
                        className="w-full text-left px-3.5 py-2.5 rounded-lg border border-slate-200 hover:border-sky-400 hover:bg-sky-50/40 transition-colors flex items-center justify-between gap-2"
                      >
                        <div className="min-w-0">
                          <div className="text-sm font-medium text-slate-900 truncate">{item.title}</div>
                          <div className="text-xs text-slate-500">{item.duration}</div>
                        </div>
                        <ArrowRight className="w-4 h-4 text-slate-400 shrink-0" aria-hidden="true" />
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </article>
          );
        })}
      </section>
    </div>
  );
}
