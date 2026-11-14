import { useEffect, useRef, useState } from "react";
import { ExternalLink, Globe, MessageSquare, RotateCcw, Send, Volume2, X } from "lucide-react";
import { getLanguageLabel, getSpeechLocale } from "../data/curriculum";
import type { AgeGroup, LanguageMode, SearchSource } from "../types";

export type ChatbotRole = "tutor" | "storyteller" | "quick";

interface BuddyMessage {
  id: string;
  role: "user" | "assistant";
  text: string;
  chatbotRole: ChatbotRole;
  sources?: SearchSource[];
}

interface StudyBuddyChatbotProps {
  studentUid: string | null;
  ageGroup: AgeGroup;
  language: LanguageMode;
  externalOpenSignal?: number;
}

const ROLE_CONFIG: Record<
  ChatbotRole,
  { label: string; description: string; starters: string[] }
> = {
  tutor: {
    label: "Homework Helper",
    description: "Step-by-step guidance for Class 1–10 school questions",
    starters: [
      "Help me solve 3/4 + 1/4 step by step",
      "Why do we see lightning before thunder?",
      "Explain Pythagoras theorem for Class 8",
    ],
  },
  storyteller: {
    label: "Story Buddy",
    description: "Interactive adventures and brain riddles",
    starters: [
      "Tell me a short interactive story about Mars",
      "Give me a fun science riddle to solve!",
      "Start a Panchatantra-style animal story",
    ],
  },
  quick: {
    label: "Quick Flash",
    description: "Fast 1-2 line answers for tables & spellings",
    starters: [
      "What is 12 × 7?",
      "Correct spelling: recieve or receive?",
      "Which is the largest ocean on Earth?",
    ],
  },
};

export function StudyBuddyChatbot({
  studentUid,
  ageGroup,
  language,
  externalOpenSignal = 0,
}: StudyBuddyChatbotProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [activeRole, setActiveRole] = useState<ChatbotRole>("tutor");
  const [useSearch, setUseSearch] = useState(true);
  const [messages, setMessages] = useState<BuddyMessage[]>([]);
  const [input, setInput] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const threadRef = useRef<HTMLDivElement | null>(null);

  const storageKey = `shikshak_buddy_chat_${studentUid || "guest"}`;

  useEffect(() => {
    if (externalOpenSignal > 0) {
      setIsOpen(true);
    }
  }, [externalOpenSignal]);

  useEffect(() => {
    try {
      const saved = localStorage.getItem(storageKey);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) {
          setMessages(parsed.slice(-30));
          return;
        }
      }
      setMessages([]);
    } catch {
      setMessages([]);
    }
  }, [storageKey]);

  useEffect(() => {
    try {
      localStorage.setItem(storageKey, JSON.stringify(messages.slice(-30)));
    } catch {
      // Ignore storage quota issues
    }
  }, [messages, storageKey]);

  useEffect(() => {
    if (isOpen && threadRef.current) {
      threadRef.current.scrollTop = threadRef.current.scrollHeight;
    }
  }, [messages, isOpen, isSending]);

  async function sendMessage(textToSend: string) {
    const cleanText = textToSend.trim();
    if (!cleanText || isSending) return;

    const userMessage: BuddyMessage = {
      id: `bu-${Date.now()}`,
      role: "user",
      text: cleanText,
      chatbotRole: activeRole,
    };

    const nextHistory = [...messages, userMessage];
    setMessages(nextHistory);
    setInput("");
    setErrorMsg(null);
    setIsSending(true);

    try {
      const roleHistory = nextHistory
        .filter((m) => m.chatbotRole === activeRole)
        .slice(0, -1)
        .map((m) => ({ role: m.role, text: m.text }));

      const res = await fetch("/api/chatbot/message", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: cleanText,
          role: activeRole,
          ageGroup,
          language,
          history: roleHistory,
          useSearch,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Could not get a reply from Study Buddy.");
      }

      const assistantMessage: BuddyMessage = {
        id: `ba-${Date.now()}`,
        role: "assistant",
        text: data.reply,
        chatbotRole: activeRole,
        sources: Array.isArray(data.sources) ? data.sources : undefined,
      };
      setMessages((prev) => [...prev, assistantMessage]);
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : "Failed to reach Study Buddy.");
    } finally {
      setIsSending(false);
    }
  }

  function handleSpeak(text: string) {
    if (typeof window === "undefined" || !("speechSynthesis" in window)) return;
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = getSpeechLocale(language);
    utterance.rate = ageGroup === "5-7" ? 0.92 : 1.0;
    window.speechSynthesis.speak(utterance);
  }

  const roleInfo = ROLE_CONFIG[activeRole];
  const visibleMessages = messages.filter((m) => m.chatbotRole === activeRole);

  return (
    <>
      {/* Floating Chat Trigger */}
      {!isOpen && (
        <button
          type="button"
          onClick={() => setIsOpen(true)}
          aria-label="Open Study Buddy Chatbot"
          className="fixed bottom-5 right-5 z-40 inline-flex items-center gap-2 px-4 py-3 text-sm font-semibold text-white bg-sky-600 hover:bg-sky-700 rounded-xl shadow-lg transition-colors whitespace-nowrap shrink-0 min-h-[44px]"
        >
          <MessageSquare className="w-4 h-4" aria-hidden="true" />
          Study Buddy Chat
        </button>
      )}

      {/* Multi-Turn Chatbot Panel */}
      {isOpen && (
        <section
          aria-label="Study Buddy Chatbot"
          className="fixed bottom-4 right-4 z-50 w-[calc(100vw-2rem)] sm:w-[420px] h-[560px] max-h-[84vh] bg-white border border-slate-200 rounded-xl shadow-xl flex flex-col overflow-hidden"
        >
          {/* Header */}
          <div className="px-4 py-3 border-b border-slate-200 flex items-center justify-between gap-3 bg-white">
            <div className="min-w-0">
              <h2 className="text-base font-semibold text-slate-900 truncate">Study Buddy Chat</h2>
              <p className="text-xs text-slate-500 truncate">
                {roleInfo.label} · {getLanguageLabel(language)}
              </p>
            </div>
            <div className="flex items-center gap-1 shrink-0">
              <button
                type="button"
                onClick={() => setUseSearch((prev) => !prev)}
                className={`inline-flex items-center gap-1 px-2.5 py-1.5 text-xs font-semibold rounded-md border transition-colors whitespace-nowrap ${
                  useSearch
                    ? "bg-sky-50 border-sky-200 text-sky-700"
                    : "bg-slate-50 border-slate-200 text-slate-600"
                }`}
                title="Toggle live Google Search grounding"
              >
                <Globe className="w-3.5 h-3.5" aria-hidden="true" />
                {useSearch ? "Search On" : "Search Off"}
              </button>
              <button
                type="button"
                onClick={() => {
                  setMessages((prev) => prev.filter((m) => m.chatbotRole !== activeRole));
                  setErrorMsg(null);
                }}
                aria-label="Clear current chat"
                title="Clear chat"
                className="p-2 text-slate-500 hover:text-slate-900 rounded-lg hover:bg-slate-100 transition-colors"
              >
                <RotateCcw className="w-4 h-4" aria-hidden="true" />
              </button>
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                aria-label="Close Study Buddy Chat"
                className="p-2 text-slate-500 hover:text-slate-900 rounded-lg hover:bg-slate-100 transition-colors"
              >
                <X className="w-4 h-4" aria-hidden="true" />
              </button>
            </div>
          </div>

          {/* Chatbot Role Selector */}
          <div className="px-3 py-2 border-b border-slate-100 bg-slate-50">
            <div className="grid grid-cols-3 gap-1 p-1 bg-slate-200/70 rounded-lg">
              {(Object.keys(ROLE_CONFIG) as ChatbotRole[]).map((r) => (
                <button
                  key={r}
                  type="button"
                  onClick={() => {
                    setActiveRole(r);
                    setErrorMsg(null);
                  }}
                  className={`px-2 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap truncate ${
                    activeRole === r
                      ? "bg-white text-slate-900 shadow-sm font-semibold"
                      : "text-slate-600 hover:text-slate-900"
                  }`}
                >
                  {ROLE_CONFIG[r].label}
                </button>
              ))}
            </div>
          </div>

          {/* Scrollable Message Thread */}
          <div ref={threadRef} className="flex-1 overflow-y-auto p-4 flex flex-col gap-3 bg-[#F8FAFC]">
            {visibleMessages.length === 0 ? (
              <div className="flex flex-col gap-3 my-auto">
                <div className="bg-white border border-slate-200 rounded-xl p-4">
                  <p className="text-sm font-semibold text-slate-900">{roleInfo.label}</p>
                  <p className="text-xs text-slate-600 mt-1 leading-relaxed">{roleInfo.description}</p>
                </div>
                <div className="flex flex-col gap-1.5">
                  <span className="text-xs font-medium text-slate-500">Try asking:</span>
                  {roleInfo.starters.map((starter) => (
                    <button
                      key={starter}
                      type="button"
                      onClick={() => sendMessage(starter)}
                      className="text-left px-3 py-2 text-xs font-medium text-sky-700 bg-white border border-slate-200 hover:border-sky-400 rounded-lg transition-colors"
                    >
                      {starter}
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              visibleMessages.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex flex-col ${msg.role === "user" ? "items-end" : "items-start"}`}
                >
                  <div
                    className={`max-w-[88%] rounded-xl px-3.5 py-2.5 text-sm leading-relaxed ${
                      msg.role === "user"
                        ? "bg-sky-600 text-white"
                        : "bg-white border border-slate-200 text-slate-800"
                    }`}
                  >
                    <div className="whitespace-pre-line">{msg.text}</div>
                    {msg.sources && msg.sources.length > 0 && (
                      <div className="mt-2 pt-2 border-t border-slate-100 flex flex-wrap gap-1.5">
                        {msg.sources.map((src, sIdx) => (
                          <a
                            key={`${src.url}-${sIdx}`}
                            href={src.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 text-[11px] font-medium text-sky-700 hover:underline max-w-[200px]"
                          >
                            <span className="truncate">{src.title}</span>
                            <ExternalLink className="w-2.5 h-2.5 shrink-0" aria-hidden="true" />
                          </a>
                        ))}
                      </div>
                    )}
                    {msg.role === "assistant" && (
                      <button
                        type="button"
                        onClick={() => handleSpeak(msg.text)}
                        className="mt-1.5 inline-flex items-center gap-1 text-xs font-semibold text-sky-700 hover:text-sky-800"
                      >
                        <Volume2 className="w-3.5 h-3.5" aria-hidden="true" />
                        Listen
                      </button>
                    )}
                  </div>
                </div>
              ))
            )}

            {isSending && (
              <div className="flex items-start">
                <div className="bg-white border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-500">
                  Thinking...
                </div>
              </div>
            )}

            {errorMsg && (
              <div className="bg-red-50 border border-red-200 text-red-800 rounded-lg px-3 py-2 text-xs">
                {errorMsg}
              </div>
            )}
          </div>

          {/* Input Bar */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              sendMessage(input);
            }}
            className="p-3 border-t border-slate-200 bg-white flex items-center gap-2"
          >
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder={`Ask ${roleInfo.label}...`}
              className="flex-1 px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg text-slate-900 placeholder:text-slate-400 focus:outline-2 focus:outline-sky-600 min-h-[40px]"
            />
            <button
              type="submit"
              disabled={!input.trim() || isSending}
              aria-label="Send message"
              className="inline-flex items-center justify-center px-3.5 py-2 text-sm font-semibold text-white bg-sky-600 hover:bg-sky-700 disabled:opacity-50 rounded-lg transition-colors min-h-[40px]"
            >
              <Send className="w-4 h-4" aria-hidden="true" />
            </button>
          </form>
        </section>
      )}
    </>
  );
}
