import { ModelType } from "../types";

export class AIService {
  async generateResponse(
    prompt: string, 
    mode: ModelType = 'Normal', 
    studyMode: boolean = false,
    history: { role: 'user' | 'assistant', content: string }[] = []
  ) {
    const response = await fetch("/api/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message: prompt, history, mode, studyMode }),
    });

    if (!response.ok) throw new Error("Failed to generate response");
    return await response.json();
  }

  async generateImage(prompt: string) {
    const response = await fetch("/api/generate-image", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ prompt }),
    });

    if (!response.ok) throw new Error("Failed to generate image");
    const data = await response.json();
    return data.imageUrl;
  }

  async generateVideo(prompt: string) {
    const response = await fetch("/api/generate-video", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ prompt }),
    });

    if (!response.ok) throw new Error("Failed to generate video");
    const data = await response.json();
    return data.videoUrl;
  }
}

export const aiService = new AIService();
