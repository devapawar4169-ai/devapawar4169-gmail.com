import { useEffect, useRef, useState } from "react";
import { Mic, MicOff, Send, Volume2 } from "lucide-react";
import { ASSETS, LANGUAGE_OPTIONS, getSpeechLocale } from "../data/curriculum";
import type { AgeGroup, ChatMessage, LanguageMode } from "../types";

interface TeacherChatPanelProps {
  messages: ChatMessage[];
  ageGroup: AgeGroup;
  language: LanguageMode;
  isSending: boolean;
  errorMsg: string | null;
  followUpPrompts: string[];
  onChangeAgeGroup: (age: AgeGroup) => void;
  onChangeLanguage: (lang: LanguageMode) => void;
  onSendMessage: (text: string) => void;
}

interface SpeechRecognitionAlternativeLike {
  transcript: string;
}
interface SpeechRecognitionResultLike {
  0: SpeechRecognitionAlternativeLike;
}
interface SpeechRecognitionEventLike {
  results: ArrayLike<SpeechRecognitionResultLike>;
}
interface SpeechRecognitionInstance {
  lang: string;
  interimResults: boolean;
  onresult: ((event: SpeechRecognitionEventLike) => void) | null;
  onend: (() => void) | null;
  onerror: (() => void) | null;
  start: () => void;
  stop: () => void;
}

export function TeacherChatPanel({
  messages,
  ageGroup,
  language,
  isSending,
  errorMsg,
  followUpPrompts,
  onChangeAgeGroup,
  onChangeLanguage,
  onSendMessage,
}: TeacherChatPanelProps) {
  const [input, setInput] = useState("");
  const [isListening, setIsListening] = useState(false);
  const [avatarFailed, setAvatarFailed] = useState(false);
  const scrollRef = useRef<HTMLDivElement | null>(null);
  const recognitionRef = useRef<SpeechRecognitionInstance | null>(null);

  const speechAvailable =
    typeof window !== "undefined" &&
    ("SpeechRecognition" in window || "webkitSpeechRecognition" in window);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isSending]);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!input.trim() || isSending) return;
    onSendMessage(input.trim());
    setInput("");
  }

  function handleSpeakMessage(text: string) {
    if (typeof window === "undefined" || !("speechSynthesis" in window)) return;
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = getSpeechLocale(language);
    utterance.rate = ageGroup === "5-7" ? 0.9 : 0.98;
    window.speechSynthesis.speak(utterance);
  }

  function toggleVoiceInput() {
    if (!speechAvailable) return;
    if (isListening && recognitionRef.current) {
      recognitionRef.current.stop();
      setIsListening(false);
      return;
    }

    const win = window as unknown as Record<string, unknown>;
    const SpeechRecCtor = (win.SpeechRecognition || win.webkitSpeechRecognition) as
      | (new () => SpeechRecognitionInstance)
      | undefined;
    if (!SpeechRecCtor) return;

    const recognition = new SpeechRecCtor();
    recognition.lang = getSpeechLocale(language);
    recognition.interimResults = false;
    recognition.onresult = (event) => {
      const transcript = event.results[0]?.[0]?.transcript || "";
      if (transcript) {
        setInput((prev) => (prev ? `${prev} ${transcript}` : transcript));
      }
    };
    recognition.onend = () => setIsListening(false);
    recognition.onerror = () => setIsListening(false);

    recognitionRef.current = recognition;
    setIsListening(true);
    recognition.start();
  }

  return (
    <aside
      aria-label="Shikshak Teacher Conversation"
      className="bg-white border border-slate-200 rounded-xl flex flex-col h-[640px] lg:h-[680px]"
    >
      {/* Teacher Profile & Preferences Deck */}
      <div className="p-4 border-b border-slate-200 flex flex-col gap-3">
        <div className="flex items-center gap-3">
          {!avatarFailed ? (
            <img
              src={ASSETS.teacherAvatar}
              alt="Shikshak mentor illustration"
              referrerPolicy="no-referrer"
              onError={() => setAvatarFailed(true)}
              className="w-11 h-11 rounded-full object-cover border border-slate-200 shrink-0"
            />
          ) : (
            <div className="w-11 h-11 rounded-full bg-sky-100 text-sky-800 font-bold flex items-center justify-center shrink-0">
              S
            </div>
          )}
          <div className="min-w-0">
            <h2 className="text-base font-semibold text-slate-900 leading-tight">Shikshak Mentor</h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Bilingual personal tutor · Guided step-by-step teaching
            </p>
          </div>
        </div>

        {/* Age & Language Controls */}
        <div className="flex flex-wrap items-center gap-2 pt-1">
          <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-lg">
            {(["5-7", "8-10", "11-14"] as AgeGroup[]).map((age) => (
              <button
                key={age}
                type="button"
                onClick={() => onChangeAgeGroup(age)}
                className={`px-2.5 py-1 text-xs font-medium rounded-md transition-colors whitespace-nowrap shrink-0 ${
                  ageGroup === age
                    ? "bg-white text-slate-900 shadow-sm font-semibold"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                {age} yrs
              </button>
            ))}
          </div>

          <select
            aria-label="Teaching language"
            value={language}
            onChange={(e) => onChangeLanguage(e.target.value as LanguageMode)}
            className="px-2.5 py-1.5 text-xs font-semibold bg-slate-100 border border-slate-200 rounded-lg text-slate-900 focus:outline-2 focus:outline-sky-600"
          >
            {LANGUAGE_OPTIONS.map((lang) => (
              <option key={lang.id} value={lang.id}>
                {lang.nativeLabel}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Chat Stream */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 flex flex-col gap-3.5 bg-[#F8FAFC]">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex flex-col ${msg.role === "student" ? "items-end" : "items-start"}`}
          >
            <div
              className={`max-w-[88%] rounded-xl px-4 py-3 text-sm leading-relaxed ${
                msg.role === "student"
                  ? "bg-sky-600 text-white"
                  : "bg-white border border-slate-200 text-slate-800"
              }`}
            >
              <div className="whitespace-pre-line">{msg.text}</div>
              {msg.role === "teacher" && (
                <button
                  type="button"
                  onClick={() => handleSpeakMessage(msg.text)}
                  className="mt-2 inline-flex items-center gap-1 text-xs font-semibold text-sky-700 hover:text-sky-800"
                >
                  <Volume2 className="w-3.5 h-3.5" aria-hidden="true" />
                  Read aloud
                </button>
              )}
            </div>
          </div>
        ))}

        {isSending && (
          <div className="flex items-start">
            <div className="bg-white border border-slate-200 rounded-xl px-4 py-3 text-sm text-slate-500">
              Shikshak is writing an explanation...
            </div>
          </div>
        )}

        {errorMsg && (
          <div className="bg-red-50 border border-red-200 text-red-800 rounded-lg px-3.5 py-2.5 text-xs font-medium">
            {errorMsg}
          </div>
        )}
      </div>

      {/* Suggested Next Prompts */}
      {followUpPrompts.length > 0 && (
        <div className="px-4 py-2.5 border-t border-slate-100 bg-white flex flex-wrap gap-1.5">
          {followUpPrompts.slice(0, 3).map((prompt, idx) => (
            <button
              key={`${prompt}-${idx}`}
              type="button"
              disabled={isSending}
              onClick={() => onSendMessage(prompt)}
              className="px-2.5 py-1.5 text-xs font-medium text-sky-700 bg-sky-50 hover:bg-sky-100 disabled:opacity-50 rounded-md transition-colors text-left"
            >
              {prompt}
            </button>
          ))}
        </div>
      )}

      {/* Message Composer */}
      <form onSubmit={handleSubmit} className="p-3.5 border-t border-slate-200 bg-white flex items-center gap-2 rounded-b-xl">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ask any question (e.g., Why is the sky blue?)"
          className="flex-1 px-3.5 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-lg text-slate-900 placeholder:text-slate-400 focus:outline-2 focus:outline-sky-600 min-h-[42px]"
        />
        {speechAvailable && (
          <button
            type="button"
            onClick={toggleVoiceInput}
            aria-label={isListening ? "Stop voice input" : "Speak your question"}
            className={`p-2.5 rounded-lg border transition-colors min-h-[42px] min-w-[42px] flex items-center justify-center ${
              isListening
                ? "bg-red-50 border-red-300 text-red-700"
                : "bg-slate-50 border-slate-200 text-slate-600 hover:text-slate-900"
            }`}
          >
            {isListening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
          </button>
        )}
        <button
          type="submit"
          disabled={!input.trim() || isSending}
          className="inline-flex items-center gap-1.5 px-4 py-2.5 text-sm font-semibold text-white bg-sky-600 hover:bg-sky-700 disabled:opacity-50 rounded-lg transition-colors min-h-[42px] whitespace-nowrap shrink-0"
        >
          <Send className="w-4 h-4" aria-hidden="true" />
          Ask
        </button>
      </form>
    </aside>
  );
}
