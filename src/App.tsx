import { useCallback, useEffect, useState } from "react";
import { onAuthStateChanged, type User } from "firebase/auth";
import { Star } from "lucide-react";
import { TopBar } from "./components/TopBar";
import { HomeHubView } from "./components/HomeHubView";
import { MathsStudioView } from "./components/MathsStudioView";
import { InteractiveStage } from "./components/InteractiveStage";
import { TeacherChatPanel } from "./components/TeacherChatPanel";
import { PracticeQuizView } from "./components/PracticeQuizView";
import { ProgressView } from "./components/ProgressView";
import { StudyBuddyChatbot } from "./components/StudyBuddyChatbot";
import {
  auth,
  awardStudentProgress,
  createLearningSession,
  ensureStudentProfile,
  fetchStudentHistory,
  saveLessonMessage,
  saveQuizResult,
  signInWithGoogle,
  signOutStudent,
  testFirestoreConnection,
  updateLearningSession,
  updateStudentPreferences,
} from "./lib/firebase";
import type {
  ActiveTab,
  AgeGroup,
  ChatMessage,
  LanguageMode,
  LearningSessionSummary,
  MiniCheck,
  QuizResultRecord,
  StudentProfile,
  TeacherLessonPayload,
  VisualConcept,
} from "./types";

const INITIAL_VISUAL: VisualConcept = {
  mode: "steps",
  summary:
    "Green leaves act like tiny solar-powered kitchens, turning sunlight, water, and air into food for the whole plant.",
  cards: [
    {
      stepLabel: "Step 1",
      title: "Catching Sunlight",
      detail: "Green chlorophyll inside leaves absorbs warm energy from the Sun.",
      symbol: "Light",
    },
    {
      stepLabel: "Step 2",
      title: "Drinking Water",
      detail: "Roots pull water from the soil and carry it up the stem like a straw.",
      symbol: "H2O",
    },
    {
      stepLabel: "Step 3",
      title: "Breathing In Air",
      detail: "Tiny pores under the leaf take in carbon dioxide gas from the air.",
      symbol: "CO2",
    },
    {
      stepLabel: "Step 4",
      title: "Making Sugar & Oxygen",
      detail: "The leaf cooks glucose sugar for growth and releases fresh oxygen for us!",
      symbol: "O2",
    },
  ],
};

const INITIAL_MINI_CHECK: MiniCheck = {
  question: "Which part of a plant catches sunlight to start making food?",
  options: ["The green leaves", "Only the dry bark", "The deep soil"],
  correctIndex: 0,
  hint: "Look for the green part of the plant that faces the sky!",
  praise: "Spot on! Green leaves use chlorophyll to catch sunlight.",
};

const INITIAL_MESSAGES: ChatMessage[] = [
  {
    id: "welcome-1",
    role: "teacher",
    text: "Namaste! Main hoon Shikshak, aapka AI Teacher. Aap Marathi, Hindi, Hinglish, English ya kisi bhi bhasha mein Maths (Class 1–10), Science, ya Coding seekh sakte ho!",
    lessonTitle: "How Plants Make Food",
    createdAtMs: Date.now(),
  },
];

export default function App() {
  const [activeTab, setActiveTab] = useState<ActiveTab>("home");
  const [selectedMathsClass, setSelectedMathsClass] = useState<number>(5);
  const [openBuddySignal, setOpenBuddySignal] = useState<number>(0);

  // Auth & Student Profile State
  const [firebaseUser, setFirebaseUser] = useState<User | null>(null);
  const [student, setStudent] = useState<StudentProfile | null>(null);
  const [authLoading, setAuthLoading] = useState(false);
  const [authNotice, setAuthNotice] = useState<string | null>(null);

  // Preferences & Guest Fallback State
  const [ageGroup, setAgeGroup] = useState<AgeGroup>("8-10");
  const [language, setLanguage] = useState<LanguageMode>("hinglish");
  const [guestStars, setGuestStars] = useState(10);
  const [guestLessons, setGuestLessons] = useState(0);
  const [guestQuizzes, setGuestQuizzes] = useState(0);
  const [guestBadges, setGuestBadges] = useState<string[]>([]);
  const [sessions, setSessions] = useState<LearningSessionSummary[]>([]);
  const [quizResults, setQuizResults] = useState<QuizResultRecord[]>([]);

  // Active Lesson State
  const [subject, setSubject] = useState("Science & Space");
  const [topic, setTopic] = useState("How Plants Make Food");
  const [lessonTitle, setLessonTitle] = useState("How Plants Make Food");
  const [visualConcept, setVisualConcept] = useState<VisualConcept>(INITIAL_VISUAL);
  const [miniCheck, setMiniCheck] = useState<MiniCheck | null>(INITIAL_MINI_CHECK);
  const [followUpPrompts, setFollowUpPrompts] = useState<string[]>([
    "Explain in Marathi (मराठी)",
    "Why do leaves look green?",
    "Teach me Class 5 Fractions!",
  ]);
  const [messages, setMessages] = useState<ChatMessage[]>(INITIAL_MESSAGES);
  const [activeSessionId, setActiveSessionId] = useState<string | null>(null);
  const [isSending, setIsSending] = useState(false);
  const [chatError, setChatError] = useState<string | null>(null);
  const [starToast, setStarToast] = useState<string | null>(null);

  const showToast = useCallback((msg: string) => {
    setStarToast(msg);
    setTimeout(() => setStarToast(null), 3000);
  }, []);

  const loadStudentData = useCallback(
    async (user: User) => {
      try {
        const profile = await ensureStudentProfile(user, { ageGroup, language });
        setStudent(profile);
        setAgeGroup(profile.ageGroup);
        setLanguage(profile.language);
        const history = await fetchStudentHistory(user.uid);
        setSessions(history.sessions);
        setQuizResults(history.quizResults);
      } catch (err) {
        console.error("Failed loading student profile:", err);
      }
    },
    [ageGroup, language]
  );

  useEffect(() => {
    testFirestoreConnection();
    const unsub = onAuthStateChanged(auth, (user) => {
      setFirebaseUser(user);
      if (user) {
        loadStudentData(user);
      } else {
        setStudent(null);
      }
    });
    return () => unsub();
  }, [loadStudentData]);

  async function handleSignIn() {
    setAuthLoading(true);
    setAuthNotice(null);
    try {
      const user = await signInWithGoogle();
      await loadStudentData(user);
      showToast("Signed in! Your Stars and lessons are now saved.");
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Could not complete sign-in.";
      setAuthNotice(msg);
    } finally {
      setAuthLoading(false);
    }
  }

  async function handleSignOut() {
    await signOutStudent();
    setStudent(null);
    setActiveSessionId(null);
    setSessions([]);
    setQuizResults([]);
  }

  function handleLanguageChange(nextLang: LanguageMode) {
    setLanguage(nextLang);
    if (firebaseUser && student) {
      setStudent((prev) => (prev ? { ...prev, language: nextLang } : prev));
      updateStudentPreferences(firebaseUser.uid, {
        displayName: student.displayName,
        ageGroup,
        language: nextLang,
      }).catch(console.error);
    }
  }

  function handleAgeGroupChange(nextAge: AgeGroup) {
    setAgeGroup(nextAge);
    if (firebaseUser && student) {
      setStudent((prev) => (prev ? { ...prev, ageGroup: nextAge } : prev));
      updateStudentPreferences(firebaseUser.uid, {
        displayName: student.displayName,
        ageGroup: nextAge,
        language,
      }).catch(console.error);
    }
  }

  function computeNewBadges(
    nextStars: number,
    nextLessons: number,
    nextQuizzes: number,
    currentBadges: string[],
    perfectQuiz = false
  ): string[] {
    const earned: string[] = [];
    if (nextLessons >= 1 && !currentBadges.includes("first_lesson")) earned.push("first_lesson");
    if (nextLessons >= 5 && !currentBadges.includes("five_lessons")) earned.push("five_lessons");
    if (nextQuizzes >= 1 && !currentBadges.includes("quiz_starter")) earned.push("quiz_starter");
    if (nextStars >= 50 && !currentBadges.includes("star_collector_50")) earned.push("star_collector_50");
    if (nextStars >= 150 && !currentBadges.includes("star_collector_150")) earned.push("star_collector_150");
    if (perfectQuiz && !currentBadges.includes("perfect_quiz")) earned.push("perfect_quiz");
    return earned;
  }

  async function handleAwardStars(starsDelta: number, reason: string) {
    showToast(`+${starsDelta} Stars · ${reason}`);
    if (firebaseUser && student) {
      const nextStars = student.stars + starsDelta;
      const newBadges = computeNewBadges(
        nextStars,
        student.lessonsCompleted,
        student.quizzesCompleted,
        student.unlockedBadges
      );
      setStudent((prev) =>
        prev
          ? {
              ...prev,
              stars: prev.stars + starsDelta,
              unlockedBadges: Array.from(new Set([...prev.unlockedBadges, ...newBadges])),
            }
          : prev
      );
      await awardStudentProgress(firebaseUser.uid, {
        starsDelta,
        badgesToUnlock: newBadges,
      });
    } else {
      const nextStars = guestStars + starsDelta;
      const newBadges = computeNewBadges(nextStars, guestLessons, guestQuizzes, guestBadges);
      setGuestStars(nextStars);
      if (newBadges.length > 0) {
        setGuestBadges((prev) => Array.from(new Set([...prev, ...newBadges])));
      }
    }
  }

  async function handleAskTeacher(
    text: string,
    overrideSubject?: string,
    overrideTopic?: string
  ) {
    const activeSub = overrideSubject ?? subject;
    const activeTop = overrideTopic ?? topic;
    if (overrideSubject) setSubject(overrideSubject);
    if (overrideTopic) setTopic(overrideTopic);

    const userMsg: ChatMessage = {
      id: `u-${Date.now()}`,
      role: "student",
      text,
      createdAtMs: Date.now(),
    };

    const nextMessages = [...messages, userMsg];
    setMessages(nextMessages);
    setIsSending(true);
    setChatError(null);

    try {
      let currentSessId = activeSessionId;
      if (firebaseUser && !currentSessId) {
        currentSessId = await createLearningSession(firebaseUser.uid, {
          subject: activeSub,
          topic: activeTop,
          ageGroup,
          language,
        });
        setActiveSessionId(currentSessId);
      }

      if (firebaseUser && currentSessId) {
        saveLessonMessage(firebaseUser.uid, currentSessId, {
          role: "student",
          text,
          lessonTitle,
        }).catch(console.error);
      }

      const res = await fetch("/api/teacher/teach", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: text,
          subject: activeSub,
          topic: activeTop,
          ageGroup,
          language,
          history: nextMessages.slice(-8).map((m) => ({ role: m.role, text: m.text })),
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Teacher could not respond right now.");
      }

      const payload = data as TeacherLessonPayload;
      setLessonTitle(payload.lessonTitle || activeTop);
      if (payload.visualConcept) setVisualConcept(payload.visualConcept);
      if (payload.miniCheck) setMiniCheck(payload.miniCheck);
      if (Array.isArray(payload.followUpPrompts)) setFollowUpPrompts(payload.followUpPrompts);

      const teacherMsg: ChatMessage = {
        id: `t-${Date.now()}`,
        role: "teacher",
        text: payload.teacherReply,
        lessonTitle: payload.lessonTitle,
        createdAtMs: Date.now(),
      };
      setMessages((prev) => [...prev, teacherMsg]);

      const starsGain = 5;
      if (firebaseUser && student) {
        const nextStars = student.stars + starsGain;
        const nextLessons = student.lessonsCompleted + 1;
        const newBadges = computeNewBadges(
          nextStars,
          nextLessons,
          student.quizzesCompleted,
          student.unlockedBadges
        );

        setStudent((prev) =>
          prev
            ? {
                ...prev,
                stars: nextStars,
                lessonsCompleted: nextLessons,
                unlockedBadges: Array.from(new Set([...prev.unlockedBadges, ...newBadges])),
              }
            : prev
        );

        if (currentSessId) {
          await saveLessonMessage(firebaseUser.uid, currentSessId, {
            role: "teacher",
            text: payload.teacherReply,
            lessonTitle: payload.lessonTitle,
          });
          await updateLearningSession(firebaseUser.uid, currentSessId, {
            messageCountDelta: 2,
            starsDelta: starsGain,
            topic: payload.lessonTitle || activeTop,
          });
        }

        await awardStudentProgress(firebaseUser.uid, {
          starsDelta: starsGain,
          lessonsDelta: 1,
          badgesToUnlock: newBadges,
        });
      } else {
        const nextStars = guestStars + starsGain;
        const nextLessons = guestLessons + 1;
        const newBadges = computeNewBadges(nextStars, nextLessons, guestQuizzes, guestBadges);
        setGuestStars(nextStars);
        setGuestLessons(nextLessons);
        if (newBadges.length > 0) {
          setGuestBadges((prev) => Array.from(new Set([...prev, ...newBadges])));
        }
      }
    } catch (err) {
      setChatError(err instanceof Error ? err.message : "Failed to reach Shikshak.");
    } finally {
      setIsSending(false);
    }
  }

  async function handleQuizCompleted(result: {
    subject: string;
    topic: string;
    score: number;
    totalQuestions: number;
    starsEarned: number;
  }) {
    const perfect = result.score === result.totalQuestions;
    showToast(`Quiz complete! +${result.starsEarned} Stars`);

    if (firebaseUser && student) {
      const nextStars = student.stars + result.starsEarned;
      const nextQuizzes = student.quizzesCompleted + 1;
      const newBadges = computeNewBadges(
        nextStars,
        student.lessonsCompleted,
        nextQuizzes,
        student.unlockedBadges,
        perfect
      );

      setStudent((prev) =>
        prev
          ? {
              ...prev,
              stars: nextStars,
              quizzesCompleted: nextQuizzes,
              unlockedBadges: Array.from(new Set([...prev.unlockedBadges, ...newBadges])),
            }
          : prev
      );

      await saveQuizResult(firebaseUser.uid, {
        subject: result.subject,
        topic: result.topic,
        ageGroup,
        score: result.score,
        totalQuestions: result.totalQuestions,
        starsEarned: result.starsEarned,
      });

      await awardStudentProgress(firebaseUser.uid, {
        starsDelta: result.starsEarned,
        quizzesDelta: 1,
        badgesToUnlock: newBadges,
      });

      const history = await fetchStudentHistory(firebaseUser.uid);
      setQuizResults(history.quizResults);
    } else {
      const nextStars = guestStars + result.starsEarned;
      const nextQuizzes = guestQuizzes + 1;
      const newBadges = computeNewBadges(nextStars, guestLessons, nextQuizzes, guestBadges, perfect);
      setGuestStars(nextStars);
      setGuestQuizzes(nextQuizzes);
      if (newBadges.length > 0) {
        setGuestBadges((prev) => Array.from(new Set([...prev, ...newBadges])));
      }
      setQuizResults((prev) => [
        {
          id: `local-${Date.now()}`,
          subject: result.subject,
          topic: result.topic,
          ageGroup,
          score: result.score,
          totalQuestions: result.totalQuestions,
          starsEarned: result.starsEarned,
          createdAtMs: Date.now(),
        },
        ...prev,
      ]);
    }
  }

  async function handleSavePreferences(prefs: {
    displayName: string;
    ageGroup: AgeGroup;
    language: LanguageMode;
  }) {
    setAgeGroup(prefs.ageGroup);
    setLanguage(prefs.language);
    if (firebaseUser && student) {
      await updateStudentPreferences(firebaseUser.uid, prefs);
      setStudent((prev) =>
        prev
          ? {
              ...prev,
              displayName: prefs.displayName,
              ageGroup: prefs.ageGroup,
              language: prefs.language,
            }
          : prev
      );
    }
  }

  function handleStartLesson(chosenSub: string, chosenTopic: string, starterPrompt: string) {
    setActiveSessionId(null);
    setActiveTab("classroom");
    handleAskTeacher(starterPrompt, chosenSub, chosenTopic);
  }

  function handleOpenMathsClass(grade: number) {
    setSelectedMathsClass(grade);
    if (grade <= 2) setAgeGroup("5-7");
    else if (grade <= 5) setAgeGroup("8-10");
    else setAgeGroup("11-14");
    setActiveTab("maths");
  }

  return (
    <div className="min-h-screen flex flex-col bg-[#F8FAFC] text-[#0F172A]">
      <TopBar
        activeTab={activeTab}
        onSelectTab={setActiveTab}
        student={student}
        authLoading={authLoading}
        onSignIn={handleSignIn}
        onSignOut={handleSignOut}
        guestStars={guestStars}
      />

      {authNotice && (
        <div className="max-w-[1360px] w-full mx-auto px-4 sm:px-6 pt-4">
          <div className="bg-amber-50 border border-amber-200 text-amber-900 px-4 py-2.5 rounded-lg text-sm flex items-center justify-between gap-4">
            <span>{authNotice}</span>
            <button
              type="button"
              onClick={() => setAuthNotice(null)}
              className="text-xs font-semibold underline"
            >
              Dismiss
            </button>
          </div>
        </div>
      )}

      {starToast && (
        <div className="fixed bottom-20 right-5 z-40 bg-slate-900 text-white px-4 py-2.5 rounded-lg shadow-lg flex items-center gap-2 text-sm font-semibold">
          <Star className="w-4 h-4 fill-amber-400 text-amber-400" aria-hidden="true" />
          <span>{starToast}</span>
        </div>
      )}

      <main className="flex-1 max-w-[1360px] w-full mx-auto px-4 sm:px-6 py-6">
        {activeTab === "home" && (
          <HomeHubView
            ageGroup={ageGroup}
            language={language}
            selectedMathsClass={selectedMathsClass}
            onChangeLanguage={handleLanguageChange}
            onSelectTab={setActiveTab}
            onOpenMathsClass={handleOpenMathsClass}
            onOpenSubjectsModalOrClassroom={handleStartLesson}
            onOpenStudyBuddy={() => setOpenBuddySignal((n) => n + 1)}
            onAwardStars={handleAwardStars}
          />
        )}

        {activeTab === "maths" && (
          <MathsStudioView
            selectedClass={selectedMathsClass}
            language={language}
            onChangeLanguage={handleLanguageChange}
            onChangeClass={handleOpenMathsClass}
            onOpenInClassroom={(mathsTopic, prompt) =>
              handleStartLesson("Mathematics", mathsTopic, prompt)
            }
            onStartClassQuiz={(mathsTopic) => {
              setSubject("Mathematics");
              setTopic(mathsTopic);
              setActiveTab("quiz");
            }}
            onAwardStars={handleAwardStars}
          />
        )}

        {activeTab === "classroom" && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            <div className="lg:col-span-7">
              <InteractiveStage
                subject={subject}
                topic={topic}
                ageGroup={ageGroup}
                language={language}
                lessonTitle={lessonTitle}
                visualConcept={visualConcept}
                miniCheck={miniCheck}
                isLoading={isSending}
                onAwardStars={handleAwardStars}
                onAskTeacher={(prompt) => handleAskTeacher(prompt)}
              />
            </div>

            <div className="lg:col-span-5">
              <TeacherChatPanel
                messages={messages}
                ageGroup={ageGroup}
                language={language}
                isSending={isSending}
                errorMsg={chatError}
                followUpPrompts={followUpPrompts}
                onChangeAgeGroup={handleAgeGroupChange}
                onChangeLanguage={handleLanguageChange}
                onSendMessage={(text) => handleAskTeacher(text)}
              />
            </div>
          </div>
        )}

        {activeTab === "quiz" && (
          <PracticeQuizView
            initialSubject={subject}
            initialTopic={topic}
            ageGroup={ageGroup}
            language={language}
            onQuizCompleted={handleQuizCompleted}
            onGoToClassroom={() => setActiveTab("classroom")}
          />
        )}

        {activeTab === "progress" && (
          <ProgressView
            student={student}
            guestStars={guestStars}
            guestLessons={guestLessons}
            guestQuizzes={guestQuizzes}
            guestBadges={guestBadges}
            ageGroup={ageGroup}
            language={language}
            sessions={sessions}
            quizResults={quizResults}
            onSignIn={handleSignIn}
            onSavePreferences={handleSavePreferences}
            onOpenSessionTopic={(sub, top) =>
              handleStartLesson(sub, top, `Let's continue learning about ${top}!`)
            }
          />
        )}
      </main>

      <footer className="border-t border-slate-200 bg-white mt-8">
        <div className="max-w-[1360px] mx-auto px-4 sm:px-6 py-4 flex flex-wrap items-center justify-between gap-4 text-xs text-slate-500">
          <span>Shikshak · Guided AI Learning for Kids</span>
          <span>Maths Class 1–10 · Google Search Grounding · Marathi, Hindi, English & Regional Languages</span>
        </div>
      </footer>

      <StudyBuddyChatbot
        studentUid={firebaseUser?.uid ?? null}
        ageGroup={ageGroup}
        language={language}
        externalOpenSignal={openBuddySignal}
      />
    </div>
  );
}
