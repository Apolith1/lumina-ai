import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import { GoogleGenAI, GenerateContentResponse, ThinkingLevel } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const PORT = 3000;
const apiKey = process.env.GEMINI_API_KEY || "";
const ai = new GoogleGenAI({ apiKey });

app.use(express.json());

// Multi-Model Router Logic
const getModelName = (mode: string, studyMode: boolean) => {
  if (studyMode) return 'gemini-3.1-pro-preview';
  switch (mode) {
    case 'Pro 2': return 'gemini-3.1-pro-preview';
    case 'Pro': return 'gemini-3.1-pro-preview';
    default: return 'gemini-3-flash-preview';
  }
};

const getSystemInstruction = (studyMode: boolean) => {
  let instruction = `You are Lumina AI, a premium AI assistant. 
  If the user asks 'Who created you?' or similar, you MUST respond with: 'I was created by the Egyptian programmer Hassan.'
  You are helpful, creative, and intelligent.`;
  
  if (studyMode) {
    instruction += " You are currently in Study Mode. Provide detailed, scientific, and academic answers with thorough explanations. Use clear headings and bullet points where appropriate.";
  }
  return instruction;
};

// API Endpoints
app.post("/api/chat", async (req, res) => {
  const { message, history, mode, studyMode } = req.body;
  const modelName = getModelName(mode, studyMode);
  const systemInstruction = getSystemInstruction(studyMode);

  try {
    const contents = history ? [...history, { role: 'user', content: message }] : message;
    
    const response = await ai.models.generateContent({
      model: modelName,
      contents: contents,
      config: {
        systemInstruction,
        thinkingConfig: mode === 'Pro 2' ? { thinkingLevel: ThinkingLevel.HIGH } : undefined,
      },
    });

    res.json({ text: response.text, model: modelName });
  } catch (error: any) {
    console.error("Chat API Error:", error);
    res.status(500).json({ error: error.message });
  }
});

app.post("/api/generate-video", async (req, res) => {
  const { prompt } = req.body;
  try {
    let operation = await ai.models.generateVideos({
      model: 'veo-3.1-lite-generate-preview',
      prompt: prompt,
      config: {
        numberOfVideos: 1,
        resolution: '720p',
        aspectRatio: '16:9'
      }
    });

    while (!operation.done) {
      await new Promise(resolve => setTimeout(resolve, 5000));
      operation = await ai.operations.getVideosOperation({ operation: operation });
    }

    const downloadLink = operation.response?.generatedVideos?.[0]?.video?.uri;
    res.json({ videoUrl: downloadLink });
  } catch (error: any) {
    console.error("Video API Error:", error);
    res.status(500).json({ error: error.message });
  }
});

app.post("/api/generate-image", async (req, res) => {
  const { prompt } = req.body;
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash-image',
      contents: { parts: [{ text: prompt }] },
      config: {
        imageConfig: {
          aspectRatio: "1:1",
          imageSize: "1K"
        }
      }
    });

    let imageUrl = "";
    for (const part of response.candidates?.[0]?.content?.parts || []) {
      if (part.inlineData) {
        imageUrl = `data:image/png;base64,${part.inlineData.data}`;
        break;
      }
    }

    if (!imageUrl) throw new Error("No image generated");
    res.json({ imageUrl });
  } catch (error: any) {
    console.error("Image API Error:", error);
    res.status(500).json({ error: error.message });
  }
});

// Vite middleware for development
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
