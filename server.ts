import "dotenv/config";
import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import { GoogleGenAI, Type, ThinkingLevel } from "@google/genai";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
app.use(express.json({ limit: "1mb" }));

const PORT = Number(process.env.PORT) || 3000;
const isProd = process.argv.includes("--prod") || process.env.NODE_ENV === "production";

function getAiClient(): GoogleGenAI {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error("GEMINI_API_KEY is not configured on the server.");
  }
  return new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        "User-Agent": "aistudio-build",
      },
    },
  });
}

function getLanguageDirective(language: string): string {
  switch (language) {
    case "mr":
      return "Respond in simple, warm, child-friendly Marathi (मराठी, Devanagari script) so school children can read and understand easily, adding common school terms in brackets where helpful.";
    case "hi":
      return "Respond in simple, warm, child-friendly Hindi (हिन्दी, Devanagari script) mixed with common everyday school terms in brackets where helpful for kids.";
    case "gu":
      return "Respond in simple, warm, child-friendly Gujarati (ગુજરાતી script) suitable for school children.";
    case "ta":
      return "Respond in simple, warm, child-friendly Tamil (தமிழ் script) suitable for school children.";
    case "te":
      return "Respond in simple, warm, child-friendly Telugu (తెలుగు script) suitable for school children.";
    case "bn":
      return "Respond in simple, warm, child-friendly Bengali (বাংলা script) suitable for school children.";
    case "kn":
      return "Respond in simple, warm, child-friendly Kannada (ಕನ್ನಡ script) suitable for school children.";
    case "hinglish":
      return "Respond in warm, natural Hinglish (Hindi written in easy Roman script mixed with simple English, like a friendly Indian school teacher talking to a child, e.g., 'Chalo samajhte hain! Plants apna khana sunlight se banate hain...').";
    default:
      return "Respond in clear, warm, encouraging everyday English suitable for children.";
  }
}

function getAgeDirective(ageGroup: string): string {
  if (ageGroup === "5-7") {
    return "Student age is 5-7 years (Early Explorer). Use very short sentences, playful everyday examples (toys, fruits, animals, sunshine), zero heavy jargon, and lots of encouragement.";
  }
  if (ageGroup === "11-14") {
    return "Student age is 11-14 years (Young Scholar). Give clear scientific/mathematical intuition, real-world connections, crisp formulas or mechanisms where relevant, and a thoughtful challenge question.";
  }
  return "Student age is 8-10 years (Curious Learner). Use vivid analogies (cricket, kitchen, bicycles, planets), clear 3-step explanations, and an engaging check-in question.";
}

app.get("/api/health", (_req, res) => {
  res.json({ ok: true });
});

app.post("/api/teacher/teach", async (req, res) => {
  try {
    const {
      message,
      subject = "Science & Space",
      topic = "How Plants Make Food",
      ageGroup = "8-10",
      language = "hinglish",
      history = [],
    } = req.body ?? {};

    if (!message || typeof message !== "string" || !message.trim()) {
      res.status(400).json({ error: "Please enter a question or message for your teacher." });
      return;
    }

    const ai = getAiClient();

    const safeHistory = Array.isArray(history)
      ? history.slice(-8).map((item: { role?: string; text?: string }) => ({
          role: item.role === "teacher" ? "model" : "user",
          parts: [{ text: String(item.text || "").slice(0, 1200) }],
        }))
      : [];

    const systemInstruction = `You are Shikshak, a kind, patient, inspiring AI teacher mentor for children.
Subject focus: ${subject}. Current topic: ${topic}.
${getAgeDirective(String(ageGroup))}
${getLanguageDirective(String(language))}

Teaching Rules:
1. Keep explanations bite-sized, joyful, and strictly child-safe.
2. Never give long walls of text—keep teacherReply concise (2-4 short paragraphs max) and end with a gentle encouraging prompt.
3. Always include a structured visualConcept (3 to 4 clear visual steps, comparisons, or key cards) for the interactive chalkboard.
4. Always include a fun miniCheck (3 options) that tests whether the child understood the idea just explained, plus a gentle hint and enthusiastic praise.
5. Suggest 3 short followUpPrompts (under 8 words each) the child might want to ask next.`;

    const contents = [
      ...safeHistory,
      { role: "user", parts: [{ text: message.trim().slice(0, 1000) }] },
    ];

    const response = await ai.models.generateContent({
      model: "gemini-4-hydrogen",
      contents,
      config: {
        systemInstruction,
        thinkingConfig: { thinkingLevel: ThinkingLevel.LOW },
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            lessonTitle: {
              type: Type.STRING,
              description: "Short engaging title for the visual chalkboard (3-7 words).",
            },
            teacherReply: {
              type: Type.STRING,
              description: "Warm, bite-sized explanation from the teacher in the requested language and age level.",
            },
            visualConcept: {
              type: Type.OBJECT,
              properties: {
                mode: {
                  type: Type.STRING,
                  description: "One of: steps, formula, comparison, story",
                },
                summary: {
                  type: Type.STRING,
                  description: "One clear takeaway sentence for the top of the chalkboard.",
                },
                cards: {
                  type: Type.ARRAY,
                  items: {
                    type: Type.OBJECT,
                    properties: {
                      stepLabel: {
                        type: Type.STRING,
                        description: "Short label like Step 1, Rule, or Key Idea.",
                      },
                      title: {
                        type: Type.STRING,
                        description: "Short concept title (2-5 words).",
                      },
                      detail: {
                        type: Type.STRING,
                        description: "Clear 1-sentence visual description or example.",
                      },
                      symbol: {
                        type: Type.STRING,
                        description: "Short symbolic formula, number, or 1-word cue (e.g., 6CO2, 1/2, Step 1).",
                      },
                    },
                    required: ["stepLabel", "title", "detail", "symbol"],
                  },
                },
              },
              required: ["mode", "summary", "cards"],
            },
            miniCheck: {
              type: Type.OBJECT,
              properties: {
                question: {
                  type: Type.STRING,
                  description: "A friendly 1-sentence multiple choice check-in question for the child.",
                },
                options: {
                  type: Type.ARRAY,
                  items: { type: Type.STRING },
                  description: "Exactly 3 short answer choices.",
                },
                correctIndex: {
                  type: Type.INTEGER,
                  description: "0-based index (0, 1, or 2) of the correct option.",
                },
                hint: {
                  type: Type.STRING,
                  description: "A kind hint if the child chooses the wrong answer.",
                },
                praise: {
                  type: Type.STRING,
                  description: "Warm celebratory feedback when the child gets it right.",
                },
              },
              required: ["question", "options", "correctIndex", "hint", "praise"],
            },
            followUpPrompts: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
              description: "3 short clickable next questions for the child.",
            },
          },
          required: ["lessonTitle", "teacherReply", "visualConcept", "miniCheck", "followUpPrompts"],
        },
      },
    });

    const rawText = (response.text ?? "{}").trim();
    const parsed = JSON.parse(rawText);
    res.json(parsed);
  } catch (error) {
    console.error("Teacher teach API error:", error);
    const errMsg = error instanceof Error ? error.message : "Failed to reach the teacher agent.";
    res.status(500).json({ error: errMsg });
  }
});

app.post("/api/teacher/quiz", async (req, res) => {
  try {
    const {
      subject = "Mathematics",
      topic = "Fractions & Sharing",
      ageGroup = "8-10",
      language = "hinglish",
    } = req.body ?? {};

    const ai = getAiClient();

    const systemInstruction = `You are Shikshak, a supportive AI teacher creating a 5-question interactive practice quiz for a child.
Subject: ${subject}. Topic: ${topic}.
${getAgeDirective(String(ageGroup))}
${getLanguageDirective(String(language))}
Make questions fun, clear, unambiguous, with 4 short options each, a gentle hint, and an encouraging 1-sentence explanation.`;

    const response = await ai.models.generateContent({
      model: "gemini-4-hydrogen",
      contents: `Create a 5-question practice quiz on "${topic}" in "${subject}".`,
      config: {
        systemInstruction,
        thinkingConfig: { thinkingLevel: ThinkingLevel.LOW },
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            quizTitle: {
              type: Type.STRING,
              description: "Short encouraging quiz title.",
            },
            questions: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  question: { type: Type.STRING },
                  options: {
                    type: Type.ARRAY,
                    items: { type: Type.STRING },
                  },
                  correctIndex: { type: Type.INTEGER },
                  hint: { type: Type.STRING },
                  explanation: { type: Type.STRING },
                },
                required: ["question", "options", "correctIndex", "hint", "explanation"],
              },
            },
          },
          required: ["quizTitle", "questions"],
        },
      },
    });

    const rawText = (response.text ?? "{}").trim();
    const parsed = JSON.parse(rawText);
    res.json(parsed);
  } catch (error) {
    console.error("Teacher quiz API error:", error);
    const errMsg = error instanceof Error ? error.message : "Failed to generate practice quiz.";
    res.status(500).json({ error: errMsg });
  }
});

app.post("/api/chatbot/message", async (req, res) => {
  try {
    const {
      message,
      role = "tutor",
      ageGroup = "8-10",
      language = "hinglish",
      history = [],
      useSearch = false,
    } = req.body ?? {};

    if (!message || typeof message !== "string" || !message.trim()) {
      res.status(400).json({ error: "Please enter a message for the chatbot." });
      return;
    }

    const ai = getAiClient();

    let selectedModel = "gemini-4-hydrogen";
    let roleDirective =
      "You are Study Buddy, a kind, patient homework helper for kids. Guide the child step by step, encourage them, and keep explanations short and easy to follow.";

    if (role === "storyteller") {
      selectedModel = "gemini-4-hydrogen";
      roleDirective =
        "You are Story & Riddle Buddy, an imaginative children's storyteller. Tell short, interactive, child-safe stories, science adventures, or fun riddles, and ask the child what should happen next.";
    } else if (role === "quick") {
      selectedModel = useSearch ? "gemini-4-hydrogen" : "gemini-3.1-flash-lite";
      roleDirective =
        "You are Quick Flash Buddy, a super-fast, concise kids' helper. Give clear, accurate 1 to 3 sentence answers for spellings, word meanings, math tables, and quick facts.";
    }

    const systemInstruction = `${roleDirective}
${getAgeDirective(String(ageGroup))}
${getLanguageDirective(String(language))}
Keep every reply strictly child-safe, warm, and free of complex jargon.`;

    // Ensure history starts with a 'user' message and alternates cleanly between 'user' and 'model'
    const normalizedHistory: Array<{ role: "user" | "model"; parts: Array<{ text: string }> }> = [];
    if (Array.isArray(history)) {
      for (const item of history.slice(-16)) {
        const mappedRole = item?.role === "assistant" || item?.role === "model" ? "model" : "user";
        const text = String(item?.text || "").trim().slice(0, 1500);
        if (!text) continue;
        if (normalizedHistory.length === 0 && mappedRole !== "user") continue;
        const last = normalizedHistory[normalizedHistory.length - 1];
        if (last && last.role === mappedRole) continue;
        normalizedHistory.push({ role: mappedRole, parts: [{ text }] });
      }
      if (normalizedHistory.length > 0 && normalizedHistory[normalizedHistory.length - 1].role === "user") {
        normalizedHistory.pop();
      }
    }

    const chat = ai.chats.create({
      model: selectedModel,
      history: normalizedHistory,
      config: {
        systemInstruction,
        ...(useSearch ? { tools: [{ googleSearch: {} }] } : {}),
      },
    });

    const response = await chat.sendMessage({
      message: message.trim().slice(0, 1200),
    });

    const reply = (response.text ?? "").trim();
    if (!reply) {
      throw new Error("Chatbot returned an empty response.");
    }

    const rawChunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks ?? [];
    const sources: Array<{ title: string; url: string }> = [];
    const seenUrls = new Set<string>();
    for (const chunk of rawChunks) {
      const uri = chunk?.web?.uri;
      const title = chunk?.web?.title;
      if (uri && !seenUrls.has(uri)) {
        seenUrls.add(uri);
        sources.push({ title: title || uri, url: uri });
      }
    }

    res.json({ reply, modelUsed: selectedModel, sources: sources.slice(0, 5) });
  } catch (error) {
    console.error("Chatbot API error:", error);
    const errMsg = error instanceof Error ? error.message : "Failed to reach the chatbot.";
    res.status(500).json({ error: errMsg });
  }
});

app.post("/api/search/ask", async (req, res) => {
  try {
    const {
      query: userQuery,
      ageGroup = "8-10",
      language = "hinglish",
    } = req.body ?? {};

    if (!userQuery || typeof userQuery !== "string" || !userQuery.trim()) {
      res.status(400).json({ error: "Please enter a topic or question to search." });
      return;
    }

    const ai = getAiClient();
    const systemInstruction = `You are Shikshak, a safe and trustworthy encyclopedia teacher for children.
Use Google Search results to give accurate, up-to-date facts explained clearly for kids.
${getAgeDirective(String(ageGroup))}
${getLanguageDirective(String(language))}
Format cleanly with a short direct answer followed by 2-3 simple bullet points. Never include unsafe or adult content.`;

    const response = await ai.models.generateContent({
      model: "gemini-4-hydrogen",
      contents: userQuery.trim().slice(0, 500),
      config: {
        systemInstruction,
        tools: [{ googleSearch: {} }],
      },
    });

    const answer = (response.text ?? "").trim();
    const metadata = response.candidates?.[0]?.groundingMetadata;
    const rawChunks = metadata?.groundingChunks ?? [];
    const sources: Array<{ title: string; url: string }> = [];
    const seenUrls = new Set<string>();

    for (const chunk of rawChunks) {
      const uri = chunk?.web?.uri;
      const title = chunk?.web?.title;
      if (uri && !seenUrls.has(uri)) {
        seenUrls.add(uri);
        sources.push({ title: title || uri, url: uri });
      }
    }

    const searchQueries: string[] = Array.isArray(metadata?.webSearchQueries)
      ? metadata.webSearchQueries.slice(0, 4)
      : [];

    res.json({
      answer: answer || "I could not find an answer for that topic. Try rephrasing your question!",
      sources: sources.slice(0, 6),
      searchQueries,
    });
  } catch (error) {
    console.error("Google Search grounding error:", error);
    const errMsg = error instanceof Error ? error.message : "Failed to search Google.";
    res.status(500).json({ error: errMsg });
  }
});

app.post("/api/maths/solve", async (req, res) => {
  try {
    const {
      classLevel = 5,
      topic = "Fractions",
      question,
      language = "hinglish",
    } = req.body ?? {};

    if (!question || typeof question !== "string" || !question.trim()) {
      res.status(400).json({ error: "Please enter a Maths question or topic." });
      return;
    }

    const clampedClass = Math.min(10, Math.max(1, Number(classLevel) || 5));
    const ai = getAiClient();

    const systemInstruction = `You are Shikshak Maths Mentor teaching a school student in Class ${clampedClass} (Std ${clampedClass}, Indian NCERT/CBSE & universal school standard).
Topic context: ${topic}.
${getLanguageDirective(String(language))}
Rules:
1. Show every calculation step clearly so a Class ${clampedClass} child can follow and copy the method neatly in their notebook.
2. State the exact formula or rule used.
3. Give a crisp finalAnswer.
4. Provide one similar practiceTryIt problem with its short answer and hint so the student can test themselves.`;

    const response = await ai.models.generateContent({
      model: "gemini-4-hydrogen",
      contents: `Class ${clampedClass} Maths question: ${question.trim().slice(0, 800)}`,
      config: {
        systemInstruction,
        thinkingConfig: { thinkingLevel: ThinkingLevel.LOW },
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            problemTitle: { type: Type.STRING },
            formulaUsed: { type: Type.STRING },
            steps: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  stepNumber: { type: Type.INTEGER },
                  title: { type: Type.STRING },
                  work: { type: Type.STRING },
                  note: { type: Type.STRING },
                },
                required: ["stepNumber", "title", "work", "note"],
              },
            },
            finalAnswer: { type: Type.STRING },
            practiceTryIt: {
              type: Type.OBJECT,
              properties: {
                question: { type: Type.STRING },
                answer: { type: Type.STRING },
                hint: { type: Type.STRING },
              },
              required: ["question", "answer", "hint"],
            },
          },
          required: ["problemTitle", "formulaUsed", "steps", "finalAnswer", "practiceTryIt"],
        },
      },
    });

    const rawText = (response.text ?? "{}").trim();
    const parsed = JSON.parse(rawText);
    res.json(parsed);
  } catch (error) {
    console.error("Maths solve error:", error);
    const errMsg = error instanceof Error ? error.message : "Failed to solve Maths problem.";
    res.status(500).json({ error: errMsg });
  }
});

async function startServer() {
  if (!isProd) {
    const { createServer: createViteServer } = await import("vite");
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.resolve(__dirname, "dist");
    app.use(express.static(distPath));
    app.get("*", (_req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Shikshak server listening on http://0.0.0.0:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error("Failed to start server:", err);
  process.exit(1);
});
