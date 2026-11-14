import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider, signInWithPopup, signOut, type User } from "firebase/auth";
import {
  collection,
  doc,
  getDoc,
  getDocFromServer,
  getDocs,
  getFirestore,
  limit,
  orderBy,
  query,
  serverTimestamp,
  setDoc,
  updateDoc,
  increment,
  arrayUnion,
} from "firebase/firestore";
import firebaseConfig from "../../firebase-applet-config.json";
import type {
  AgeGroup,
  LanguageMode,
  LearningSessionSummary,
  QuizResultRecord,
  StudentProfile,
} from "../types";

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app, firebaseConfig.firestoreDatabaseId);
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();

export enum OperationType {
  CREATE = "create",
  UPDATE = "update",
  DELETE = "delete",
  LIST = "list",
  GET = "get",
  WRITE = "write",
}

interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
    tenantId?: string | null;
    providerInfo?: {
      providerId?: string | null;
      email?: string | null;
    }[];
  };
}

export function handleFirestoreError(
  error: unknown,
  operationType: OperationType,
  path: string | null
): never {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
      isAnonymous: auth.currentUser?.isAnonymous,
      tenantId: auth.currentUser?.tenantId,
      providerInfo:
        auth.currentUser?.providerData?.map((provider) => ({
          providerId: provider.providerId,
          email: provider.email,
        })) || [],
    },
    operationType,
    path,
  };
  console.error("Firestore Error: ", JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

export async function testFirestoreConnection(): Promise<void> {
  try {
    await getDocFromServer(doc(db, "test", "connection"));
  } catch (error) {
    if (error instanceof Error && error.message.includes("the client is offline")) {
      console.error("Please check your Firebase configuration.");
    }
  }
}

export async function signInWithGoogle(): Promise<User> {
  const result = await signInWithPopup(auth, googleProvider);
  return result.user;
}

export async function signOutStudent(): Promise<void> {
  await signOut(auth);
}

function sanitizeId(raw: string): string {
  return raw.replace(/[^a-zA-Z0-9_\-]/g, "_").slice(0, 120);
}

export async function ensureStudentProfile(
  user: User,
  defaults: { ageGroup: AgeGroup; language: LanguageMode }
): Promise<StudentProfile> {
  const studentId = sanitizeId(user.uid);
  const path = `students/${studentId}`;
  const ref = doc(db, "students", studentId);

  try {
    const snap = await getDoc(ref);
    if (snap.exists()) {
      const data = snap.data();
      return {
        uid: String(data.uid ?? studentId),
        displayName: String(data.displayName ?? user.displayName ?? "Young Learner"),
        ageGroup: (data.ageGroup as AgeGroup) || defaults.ageGroup,
        language: (data.language as LanguageMode) || defaults.language,
        stars: Number(data.stars ?? 0),
        lessonsCompleted: Number(data.lessonsCompleted ?? 0),
        quizzesCompleted: Number(data.quizzesCompleted ?? 0),
        unlockedBadges: Array.isArray(data.unlockedBadges) ? data.unlockedBadges : [],
      };
    }

    const displayName = (user.displayName || user.email?.split("@")[0] || "Young Learner").slice(0, 80);
    await setDoc(ref, {
      uid: studentId,
      displayName,
      ageGroup: defaults.ageGroup,
      language: defaults.language,
      stars: 10,
      lessonsCompleted: 0,
      quizzesCompleted: 0,
      unlockedBadges: [],
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });

    return {
      uid: studentId,
      displayName,
      ageGroup: defaults.ageGroup,
      language: defaults.language,
      stars: 10,
      lessonsCompleted: 0,
      quizzesCompleted: 0,
      unlockedBadges: [],
    };
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}

export async function updateStudentPreferences(
  uid: string,
  prefs: { displayName: string; ageGroup: AgeGroup; language: LanguageMode }
): Promise<void> {
  const studentId = sanitizeId(uid);
  const path = `students/${studentId}`;
  try {
    await updateDoc(doc(db, "students", studentId), {
      displayName: prefs.displayName.trim().slice(0, 80) || "Young Learner",
      ageGroup: prefs.ageGroup,
      language: prefs.language,
      updatedAt: serverTimestamp(),
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, path);
  }
}

export async function awardStudentProgress(
  uid: string,
  delta: {
    starsDelta: number;
    lessonsDelta?: number;
    quizzesDelta?: number;
    badgesToUnlock?: string[];
  }
): Promise<void> {
  const studentId = sanitizeId(uid);
  const path = `students/${studentId}`;
  try {
    const payload: Record<string, unknown> = {
      stars: increment(Math.max(0, Math.round(delta.starsDelta))),
      updatedAt: serverTimestamp(),
    };
    if (delta.lessonsDelta && delta.lessonsDelta > 0) {
      payload.lessonsCompleted = increment(delta.lessonsDelta);
    }
    if (delta.quizzesDelta && delta.quizzesDelta > 0) {
      payload.quizzesCompleted = increment(delta.quizzesDelta);
    }
    if (delta.badgesToUnlock && delta.badgesToUnlock.length > 0) {
      payload.unlockedBadges = arrayUnion(...delta.badgesToUnlock.slice(0, 5));
    }
    await updateDoc(doc(db, "students", studentId), payload);
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, path);
  }
}

export async function createLearningSession(
  uid: string,
  data: { subject: string; topic: string; ageGroup: AgeGroup; language: LanguageMode }
): Promise<string> {
  const studentId = sanitizeId(uid);
  const sessionId = `sess_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
  const path = `students/${studentId}/sessions/${sessionId}`;
  try {
    await setDoc(doc(db, "students", studentId, "sessions", sessionId), {
      studentId,
      subject: data.subject.slice(0, 60),
      topic: data.topic.slice(0, 120),
      ageGroup: data.ageGroup,
      language: data.language,
      messageCount: 0,
      starsEarned: 0,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
    return sessionId;
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, path);
  }
}

export async function saveLessonMessage(
  uid: string,
  sessionId: string,
  msg: { role: "student" | "teacher"; text: string; lessonTitle?: string }
): Promise<void> {
  const studentId = sanitizeId(uid);
  const cleanSessionId = sanitizeId(sessionId);
  const messageId = `msg_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
  const path = `students/${studentId}/sessions/${cleanSessionId}/messages/${messageId}`;
  try {
    await setDoc(doc(db, "students", studentId, "sessions", cleanSessionId, "messages", messageId), {
      studentId,
      sessionId: cleanSessionId,
      role: msg.role,
      text: msg.text.slice(0, 4000),
      lessonTitle: (msg.lessonTitle ?? "").slice(0, 160),
      createdAt: serverTimestamp(),
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, path);
  }
}

export async function updateLearningSession(
  uid: string,
  sessionId: string,
  updates: { messageCountDelta: number; starsDelta: number; topic?: string }
): Promise<void> {
  const studentId = sanitizeId(uid);
  const cleanSessionId = sanitizeId(sessionId);
  const path = `students/${studentId}/sessions/${cleanSessionId}`;
  try {
    const payload: Record<string, unknown> = {
      messageCount: increment(updates.messageCountDelta),
      starsEarned: increment(updates.starsDelta),
      updatedAt: serverTimestamp(),
    };
    if (updates.topic) {
      payload.topic = updates.topic.slice(0, 120);
    }
    await updateDoc(doc(db, "students", studentId, "sessions", cleanSessionId), payload);
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, path);
  }
}

export async function saveQuizResult(
  uid: string,
  result: {
    subject: string;
    topic: string;
    ageGroup: AgeGroup;
    score: number;
    totalQuestions: number;
    starsEarned: number;
  }
): Promise<void> {
  const studentId = sanitizeId(uid);
  const resultId = `quiz_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
  const path = `students/${studentId}/quizResults/${resultId}`;
  try {
    await setDoc(doc(db, "students", studentId, "quizResults", resultId), {
      studentId,
      subject: result.subject.slice(0, 60),
      topic: result.topic.slice(0, 120),
      ageGroup: result.ageGroup,
      score: Math.min(10, Math.max(0, Math.round(result.score))),
      totalQuestions: Math.min(10, Math.max(1, Math.round(result.totalQuestions))),
      starsEarned: Math.min(500, Math.max(0, Math.round(result.starsEarned))),
      createdAt: serverTimestamp(),
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, path);
  }
}

export async function fetchStudentHistory(uid: string): Promise<{
  sessions: LearningSessionSummary[];
  quizResults: QuizResultRecord[];
}> {
  const studentId = sanitizeId(uid);
  try {
    const sessionsQuery = query(
      collection(db, "students", studentId, "sessions"),
      orderBy("updatedAt", "desc"),
      limit(8)
    );
    const quizQuery = query(
      collection(db, "students", studentId, "quizResults"),
      orderBy("createdAt", "desc"),
      limit(8)
    );
    const [sessSnap, quizSnap] = await Promise.all([getDocs(sessionsQuery), getDocs(quizQuery)]);

    const sessions: LearningSessionSummary[] = sessSnap.docs.map((d) => {
      const data = d.data();
      return {
        id: d.id,
        subject: String(data.subject ?? ""),
        topic: String(data.topic ?? ""),
        ageGroup: (data.ageGroup as AgeGroup) || "8-10",
        language: (data.language as LanguageMode) || "hinglish",
        messageCount: Number(data.messageCount ?? 0),
        starsEarned: Number(data.starsEarned ?? 0),
        updatedAtMs: data.updatedAt?.toMillis ? data.updatedAt.toMillis() : Date.now(),
      };
    });

    const quizResults: QuizResultRecord[] = quizSnap.docs.map((d) => {
      const data = d.data();
      return {
        id: d.id,
        subject: String(data.subject ?? ""),
        topic: String(data.topic ?? ""),
        ageGroup: (data.ageGroup as AgeGroup) || "8-10",
        score: Number(data.score ?? 0),
        totalQuestions: Number(data.totalQuestions ?? 5),
        starsEarned: Number(data.starsEarned ?? 0),
        createdAtMs: data.createdAt?.toMillis ? data.createdAt.toMillis() : Date.now(),
      };
    });

    return { sessions, quizResults };
  } catch (error) {
    handleFirestoreError(error, OperationType.LIST, `students/${studentId}/sessions`);
  }
}
