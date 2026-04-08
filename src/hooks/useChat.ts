import { useState, useEffect, useCallback } from 'react';
import { Chat, Message, ModelType, GalleryItem } from '../types';
import { firebaseService } from '../services/firebaseService';
import { aiService } from '../services/aiService';
import { v4 as uuidv4 } from 'uuid';

export function useChat(userId: string | undefined) {
  const [chats, setChats] = useState<Chat[]>([]);
  const [currentChatId, setCurrentChatId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [mode, setMode] = useState<ModelType>('Normal');
  const [studyMode, setStudyMode] = useState(false);

  const [galleryItems, setGalleryItems] = useState<GalleryItem[]>([]);

  const [memory, setMemory] = useState<string[]>([]);

  useEffect(() => {
    if (!userId) return;

    const unsubscribeChats = firebaseService.subscribeToChats(userId, (updatedChats) => {
      setChats(updatedChats);
    });

    const unsubscribeMemory = firebaseService.subscribeToMemory(userId, (facts) => {
      setMemory(facts);
    });

    // Fetch gallery items
    firebaseService.getGalleryItems(userId).then(items => {
      if (items) setGalleryItems(items);
    });

    return () => {
      unsubscribeChats();
      unsubscribeMemory();
    };
  }, [userId]);

  const currentChat = chats.find(c => c.id === currentChatId);

  const createNewChat = useCallback(async (title: string = "New Chat") => {
    if (!userId) return;

    const newChat: Chat = {
      id: uuidv4(),
      title,
      messages: [],
      createdAt: Date.now(),
      updatedAt: Date.now(),
      mode,
      studyMode,
      userId
    };

    await firebaseService.saveChat(newChat);
    setCurrentChatId(newChat.id);
    return newChat;
  }, [userId, mode, studyMode]);

  const sendMessage = useCallback(async (content: string) => {
    if (!userId) return;

    let chat = currentChat;
    if (!chat) {
      chat = await createNewChat(content.slice(0, 30));
    }

    if (!chat) return;

    const userMessage: Message = {
      id: uuidv4(),
      role: 'user',
      content,
      timestamp: Date.now()
    };

    const updatedMessages = [...chat.messages, userMessage];
    const updatedChat = { ...chat, messages: updatedMessages, updatedAt: Date.now() };
    
    await firebaseService.saveChat(updatedChat);
    setLoading(true);

    try {
      const response = await aiService.generateResponse(
        content, 
        mode, 
        studyMode, 
        updatedMessages.map(m => ({ role: m.role, content: m.content })),
        memory
      );

      if (response.newFacts && response.newFacts.length > 0) {
        await firebaseService.addUserMemory(userId, response.newFacts);
      }

      const assistantMessage: Message = {
        id: uuidv4(),
        role: 'assistant',
        content: response.text,
        timestamp: Date.now(),
        model: response.model,
        type: 'text'
      };

      const finalChat = { 
        ...updatedChat, 
        messages: [...updatedMessages, assistantMessage], 
        updatedAt: Date.now() 
      };
      
      await firebaseService.saveChat(finalChat);
    } catch (error) {
      console.error("Error generating response", error);
    } finally {
      setLoading(false);
    }
  }, [userId, currentChat, createNewChat, mode, studyMode]);

  const generateImage = useCallback(async (prompt: string) => {
    if (!userId) return;

    let chat = currentChat;
    if (!chat) {
      chat = await createNewChat(prompt.slice(0, 30));
    }

    if (!chat) return;

    const userMessage: Message = {
      id: uuidv4(),
      role: 'user',
      content: prompt,
      timestamp: Date.now()
    };

    const updatedMessages = [...chat.messages, userMessage];
    const updatedChat = { ...chat, messages: updatedMessages, updatedAt: Date.now() };
    await firebaseService.saveChat(updatedChat);

    setLoading(true);
    try {
      const imageUrl = await aiService.generateImage(prompt);
      
      // Save to gallery
      const galleryItem: GalleryItem = {
        id: uuidv4(),
        type: 'image',
        url: imageUrl,
        prompt,
        timestamp: Date.now(),
        userId
      };
      await firebaseService.saveGalleryItem(galleryItem);
      setGalleryItems(prev => [galleryItem, ...prev]);

      const assistantMessage: Message = {
        id: uuidv4(),
        role: 'assistant',
        content: `Generated image for: ${prompt}`,
        timestamp: Date.now(),
        model: 'gemini-2.5-flash-image',
        type: 'image',
        mediaUrl: imageUrl
      };

      const finalChat = { 
        ...updatedChat, 
        messages: [...updatedMessages, assistantMessage], 
        updatedAt: Date.now() 
      };
      
      await firebaseService.saveChat(finalChat);
    } catch (error) {
      console.error("Error generating image", error);
    } finally {
      setLoading(false);
    }
  }, [userId, currentChat, createNewChat]);

  const generateVideo = useCallback(async (prompt: string) => {
    if (!userId) return;

    let chat = currentChat;
    if (!chat) {
      chat = await createNewChat(prompt.slice(0, 30));
    }

    if (!chat) return;

    const userMessage: Message = {
      id: uuidv4(),
      role: 'user',
      content: prompt,
      timestamp: Date.now()
    };

    const updatedMessages = [...chat.messages, userMessage];
    const updatedChat = { ...chat, messages: updatedMessages, updatedAt: Date.now() };
    await firebaseService.saveChat(updatedChat);

    setLoading(true);
    try {
      const videoUrl = await aiService.generateVideo(prompt);
      
      const assistantMessage: Message = {
        id: uuidv4(),
        role: 'assistant',
        content: `Generated video for: ${prompt}`,
        timestamp: Date.now(),
        model: 'veo-3.1-lite-generate-preview',
        type: 'video',
        mediaUrl: videoUrl
      };

      const finalChat = { 
        ...updatedChat, 
        messages: [...updatedMessages, assistantMessage], 
        updatedAt: Date.now() 
      };
      
      await firebaseService.saveChat(finalChat);
    } catch (error) {
      console.error("Error generating video", error);
    } finally {
      setLoading(false);
    }
  }, [userId, currentChat, createNewChat]);

  const deleteChat = useCallback(async (chatId: string) => {
    await firebaseService.deleteChat(chatId);
    if (currentChatId === chatId) {
      setCurrentChatId(null);
    }
  }, [currentChatId]);

  return {
    chats,
    currentChat,
    currentChatId,
    setCurrentChatId,
    sendMessage,
    generateImage,
    generateVideo,
    createNewChat,
    deleteChat,
    loading,
    mode,
    setMode,
    studyMode,
    setStudyMode,
    galleryItems
  };
}
