import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import { GoogleGenAI, GenerateContentResponse, ThinkingLevel, Type } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json());

// Helper to get the AI instance dynamically
const getAI = () => {
  const apiKey = process.env.API_KEY || process.env.GEMINI_API_KEY || "";
  return new GoogleGenAI({ apiKey });
};

// Multi-Model Router Logic
const getModelName = (mode: string, studyMode: boolean) => {
  if (studyMode) return 'gemini-3.1-pro-preview';
  switch (mode) {
    case 'Pro 2': return 'gemini-3.1-pro-preview';
    case 'Pro': return 'gemini-3.1-pro-preview';
    default: return 'gemini-3-flash-preview';
  }
};

const getSystemInstruction = (studyMode: boolean, memory: string[]) => {
  let instruction = `You are Farha (فرحه), a premium AI assistant. 
  If the user asks 'Who created you?' or similar, you MUST respond with: 'I was created by the Egyptian programmer Hassan.'
  You are helpful, creative, and intelligent.`;
  
  if (studyMode) {
    instruction += " You are currently in Study Mode. Provide detailed, scientific, and academic answers with thorough explanations. Use clear headings and bullet points where appropriate.";
  }

  if (memory && memory.length > 0) {
    instruction += `\n\nHere is what you know about the user from long-term memory:\n${memory.map((m: string) => `- ${m}`).join('\n')}`;
  }

  return instruction;
};

// API Endpoints
app.post("/api/chat", async (req, res) => {
  const { message, history, mode, studyMode, memory = [] } = req.body;
  const modelName = getModelName(mode, studyMode);
  const systemInstruction = getSystemInstruction(studyMode, memory);

  try {
    const ai = getAI();
    const contents = history ? [...history, { role: 'user', content: message }] : message;
    
    const chatPromise = ai.models.generateContent({
      model: modelName,
      contents: contents,
      config: {
        systemInstruction,
        thinkingConfig: mode === 'Pro 2' ? { thinkingLevel: ThinkingLevel.HIGH } : undefined,
      },
    });

    const memoryPrompt = `Analyze the following user message. Extract any new personal facts, preferences, or details about the user that should be remembered for future conversations.
Current memory:
${memory.length > 0 ? memory.map((m: string) => `- ${m}`).join('\n') : "None"}

User message: "${message}"

Return a JSON array of strings containing ONLY the NEW facts to add. If there are no new facts to remember, return an empty array []. Keep facts concise.`;

    const memoryPromise = ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: memoryPrompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: { type: Type.STRING }
        }
      }
    });

    const [chatResponse, memoryResponse] = await Promise.all([chatPromise, memoryPromise]);

    let newFacts: string[] = [];
    try {
      if (memoryResponse.text) {
        newFacts = JSON.parse(memoryResponse.text);
      }
    } catch (e) {
      console.error("Error parsing memory facts:", e);
    }

    res.json({ 
      text: chatResponse.text, 
      model: modelName,
      newFacts 
    });
  } catch (error: any) {
    console.error("Chat API Error:", error);
    res.status(500).json({ error: error.message });
  }
});

app.post("/api/generate-video", async (req, res) => {
  const { prompt } = req.body;
  try {
    const openaiKey = process.env.OPENAI_API_KEY;
    
    if (openaiKey) {
      // Attempt to use OpenAI Sora API
      const response = await fetch("https://api.openai.com/v1/videos/generations", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${openaiKey}`
        },
        body: JSON.stringify({
          model: "sora-1.0-turbo", // Placeholder for Sora model name
          prompt: prompt
        })
      });

      if (response.ok) {
        const data = await response.json();
        // Assuming the response format is similar to DALL-E
        if (data.data && data.data[0] && data.data[0].url) {
          return res.json({ videoUrl: data.data[0].url });
        }
      }
      console.warn("OpenAI Sora API failed or returned unexpected format, falling back to Veo.");
    }

    // Fallback to Veo
    const ai = getAI();
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
    const ai = getAI();
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

  // Only listen if we are not in a serverless environment like Vercel
  if (!process.env.VERCEL) {
    app.listen(PORT, "0.0.0.0", () => {
      console.log(`Server running on http://localhost:${PORT}`);
    });
  }
}

startServer();

export default app;
