import React from 'react';
import { useAuth } from './hooks/useAuth';
import { useChat } from './hooks/useChat';
import { Sidebar } from './components/Sidebar';
import { Message } from './components/Message';
import { InputBar } from './components/InputBar';
import { ModelSelector } from './components/ModelSelector';
import { ModelType, GalleryItem } from './types';
import { motion, AnimatePresence } from 'motion/react';
import { Sparkles, Bot, LogIn, Settings, Search, ImageIcon, Menu } from 'lucide-react';
import { cn } from './lib/utils';
import { firebaseService } from './services/firebaseService';

const translations = {
  en: {
    newChat: "New Chat",
    search: "Search chats...",
    signOut: "Sign Out",
    placeholder: "Ask me anything...",
    imagePlaceholder: "Describe the image you want to generate...",
    mistakes: "Lumina AI can make mistakes. Check important info.",
    studyMode: "Study Mode",
    studyModeDesc: "Scientific & detailed answers",
    chat: "Chat",
    gallery: "Gallery",
    video: "Video",
    noChats: "No chats yet. Start a new one!",
    noGallery: "No generated images yet.",
    welcome: "Welcome to Farha",
    welcomeDesc: "Your premium AI assistant for everything.",
    loginTitle: "Farha",
    loginDesc: "Experience the next generation of AI",
    loginButton: "Sign in with Google",
    videoPlaceholder: "Describe the video you want to generate...",
    suggestions: [
      "Write a professional email for a job application",
      "Explain quantum computing in simple terms",
      "Generate a 4K image of a cyberpunk street",
      "Help me debug a React useEffect loop"
    ]
  },
  ar: {
    newChat: "محادثة جديدة",
    search: "البحث في المحادثات...",
    signOut: "تسجيل الخروج",
    placeholder: "اسألني عن أي شيء...",
    imagePlaceholder: "صف الصورة التي تريد إنشاؤها...",
    videoPlaceholder: "صف الفيديو الذي تريد إنشاؤه...",
    mistakes: "قد يرتكب Lumina AI أخطاء. تحقق من المعلومات المهمة.",
    studyMode: "وضع الدراسة",
    studyModeDesc: "إجابات علمية ومفصلة",
    chat: "محادثة",
    gallery: "المعرض",
    video: "فيديو",
    noChats: "لا توجد محادثات بعد. ابدأ واحدة جديدة!",
    noGallery: "لا توجد صور منشأة بعد.",
    welcome: "مرحباً بك في فرحه",
    welcomeDesc: "مساعدك الذكي المتميز لكل شيء.",
    loginTitle: "فرحه",
    loginDesc: "اختبر الجيل القادم من الذكاء الاصطناعي",
    loginButton: "تسجيل الدخول باستخدام Google",
    suggestions: [
      "اكتب بريدًا إلكترونيًا احترافيًا لطلب وظيفة",
      "اشرح الحوسبة الكمومية بكلمات بسيطة",
      "قم بإنشاء صورة 4K لشارع سايبربانك",
      "ساعدني في تصحيح حلقة React useEffect"
    ]
  }
};

export default function App() {
  const { user, loading: authLoading, signIn, signInAsGuest, logOut, isAuthenticated } = useAuth();
  const [language, setLanguage] = React.useState<'en' | 'ar'>('en');
  const [view, setView] = React.useState<'chat' | 'gallery'>('chat');
  const [galleryItems, setGalleryItems] = React.useState<GalleryItem[]>([]);
  const scrollRef = React.useRef<HTMLDivElement>(null);
  const [authError, setAuthError] = React.useState<string | null>(null);
  const [isSidebarOpen, setIsSidebarOpen] = React.useState<boolean>(true);

  const handleGuestLogin = async () => {
    try {
      setAuthError(null);
      await signInAsGuest();
    } catch (error: any) {
      if (error?.code === 'auth/admin-restricted-operation') {
        setAuthError("Anonymous Authentication is not enabled. Please enable it in your Firebase Console > Authentication > Sign-in method.");
      } else {
        setAuthError("Failed to sign in as guest. Please try again.");
      }
    }
  };

  const { 
    chats, 
    currentChat, 
    currentChatId, 
    setCurrentChatId, 
    sendMessage, 
    generateImage,
    generateVideo,
    createNewChat, 
    deleteChat,
    loading: chatLoading,
    mode,
    setMode,
    studyMode,
    setStudyMode
  } = useChat(user?.uid || null);

  const handleSendMessage = async (text: string) => {
    setIsSidebarOpen(false);
    await sendMessage(text);
  };

  const handleGenerateImage = async (prompt: string, image?: string) => {
    setIsSidebarOpen(false);
    await generateImage(prompt, image);
  };

  const handleGenerateVideo = async (prompt: string, image?: string) => {
    setIsSidebarOpen(false);
    await generateVideo(prompt, image);
  };

  const t = translations[language];

  React.useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [currentChat?.messages]);

  React.useEffect(() => {
    if (user?.uid && view === 'gallery') {
      firebaseService.getGalleryItems(user.uid).then(items => {
        if (items) setGalleryItems(items);
      });
    }
  }, [user?.uid, view]);

  React.useEffect(() => {
    if (user) {
      firebaseService.saveUser(user);
    }
  }, [user]);

  if (authLoading) {
    return (
      <div className="h-screen w-screen bg-[#050505] flex flex-col items-center justify-center gap-6">
        <motion.div 
          animate={{ scale: [1, 1.1, 1], rotate: [0, 10, -10, 0] }}
          transition={{ repeat: Infinity, duration: 4 }}
          className="w-24 h-24 rounded-3xl bg-gradient-to-br from-blue-500 via-purple-600 to-pink-500 flex items-center justify-center shadow-2xl shadow-purple-500/20"
        >
          <Sparkles size={48} className="text-white" />
        </motion.div>
        <div className="flex flex-col items-center gap-2">
          <h1 className="text-2xl font-bold text-white tracking-tight">{language === 'ar' ? 'فرحه' : 'Farha'}</h1>
          <p className="text-white/40 text-sm font-medium uppercase tracking-widest">Initializing Intelligence</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="h-screen w-screen bg-[#050505] flex overflow-hidden relative">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,_rgba(59,130,246,0.1),_transparent_50%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_20%,_rgba(168,85,247,0.1),_transparent_50%)]" />
        
        <div className="flex-1 flex flex-col p-12 relative z-10">
          <div className="flex items-center gap-3 mb-20">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center shadow-lg shadow-purple-500/20">
              <Sparkles size={20} className="text-white" />
            </div>
            <h1 className="text-xl font-bold text-white tracking-tight">{language === 'ar' ? 'فرحه' : 'Farha'}</h1>
          </div>

          <div className="max-w-2xl">
            <motion.h2 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-6xl font-bold text-white leading-[1.1] tracking-tight mb-8"
            >
              The next generation of <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-500">AI Assistance</span>.
            </motion.h2>
            <motion.p 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="text-xl text-white/60 leading-relaxed mb-12 max-w-lg"
            >
              Experience a premium AI assistant with multi-model intelligence, real-time memory, and creative generation capabilities.
            </motion.p>

            {authError && (
              <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-sm"
              >
                {authError}
              </motion.div>
            )}

            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="flex flex-col gap-4 w-fit"
            >
              <button 
                onClick={() => signIn()}
                className="flex items-center gap-3 bg-white text-black px-8 py-4 rounded-2xl font-bold text-lg hover:bg-white/90 transition-all hover:scale-105 active:scale-95 shadow-xl shadow-white/10"
              >
                <LogIn size={20} />
                Get Started with Google
              </button>
              <button 
                onClick={handleGuestLogin}
                className="flex items-center justify-center gap-3 bg-white/5 text-white px-8 py-4 rounded-2xl font-bold text-lg hover:bg-white/10 transition-all hover:scale-105 active:scale-95 border border-white/10"
              >
                Continue without an account
              </button>
            </motion.div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={cn("h-screen w-screen bg-[#050505] flex text-white overflow-hidden font-sans", language === 'ar' && "flex-row-reverse")}>
      <AnimatePresence initial={false}>
        {isSidebarOpen && (
          <motion.div
            initial={{ width: 0, opacity: 0 }}
            animate={{ width: 320, opacity: 1 }}
            exit={{ width: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
            className="h-full shrink-0 overflow-hidden"
          >
            <Sidebar 
              chats={chats} 
              currentChatId={currentChatId} 
              onSelectChat={setCurrentChatId}
              onNewChat={() => createNewChat(t.newChat)}
              onDeleteChat={deleteChat}
              user={user}
              onLogout={logOut}
              language={language}
              setLanguage={setLanguage}
              view={view}
              setView={setView}
              t={t}
            />
          </motion.div>
        )}
      </AnimatePresence>

      <div className="flex-1 flex flex-col relative overflow-hidden">
        <header className={cn("h-16 flex items-center justify-between px-6 border-b border-white/10 glass-dark z-20", language === 'ar' && "flex-row-reverse")}>
          <div className={cn("flex items-center gap-3", language === 'ar' && "flex-row-reverse")}>
            <button 
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              className="p-2 -ml-2 rounded-lg hover:bg-white/10 text-white/60 hover:text-white transition-colors"
            >
              <Menu size={20} />
            </button>
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center shadow-lg shadow-purple-500/20">
              <Sparkles size={16} className="text-white" />
            </div>
            <h2 className="font-bold tracking-tight">{view === 'gallery' ? t.gallery : (currentChat?.title || (language === 'ar' ? "فرحه" : "Farha"))}</h2>
          </div>

          <div className={cn("flex items-center gap-4", language === 'ar' && "flex-row-reverse")}>
            <div className={cn("flex items-center gap-3 px-3 py-1.5 rounded-xl bg-white/5 border border-white/10", language === 'ar' && "flex-row-reverse")}>
              <div className={cn("flex flex-col items-end", language === 'ar' && "items-start")}>
                <span className="text-[10px] font-bold uppercase tracking-widest text-white/40">{t.studyMode}</span>
              </div>
              <button 
                onClick={() => setStudyMode(!studyMode)}
                className={cn(
                  "w-10 h-5 rounded-full transition-all relative",
                  studyMode ? "bg-blue-500" : "bg-white/10"
                )}
              >
                <motion.div 
                  animate={{ x: studyMode ? 20 : 2 }}
                  className="absolute top-1 left-0 w-3 h-3 rounded-full bg-white shadow-sm"
                />
              </button>
            </div>
            <ModelSelector selectedModel={mode} onSelect={setMode} language={language} />
          </div>
        </header>

        <main 
          ref={scrollRef}
          className="flex-1 overflow-y-auto custom-scrollbar p-4 md:p-8"
        >
          <div className="max-w-4xl mx-auto">
            <AnimatePresence mode="wait">
              {view === 'gallery' ? (
                <motion.div 
                  key="gallery"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"
                >
                  {galleryItems.length > 0 ? (
                    galleryItems.map((item) => (
                      <motion.div 
                        key={item.id}
                        layoutId={item.id}
                        className="group relative aspect-square rounded-3xl overflow-hidden border border-white/10 bg-white/5 cursor-pointer"
                      >
                        <img 
                          src={item.url} 
                          alt={item.prompt} 
                          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                          referrerPolicy="no-referrer"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-all duration-300 p-6 flex flex-col justify-end">
                          <p className={cn("text-sm text-white font-medium line-clamp-2", language === 'ar' && "text-right")}>{item.prompt}</p>
                          <p className={cn("text-[10px] text-white/40 mt-2 font-bold uppercase tracking-widest", language === 'ar' && "text-right")}>
                            {new Date(item.timestamp).toLocaleDateString(language === 'ar' ? 'ar-EG' : 'en-US')}
                          </p>
                        </div>
                      </motion.div>
                    ))
                  ) : (
                    <div className="col-span-full h-[60vh] flex flex-col items-center justify-center text-center space-y-4">
                      <div className="w-16 h-16 rounded-2xl bg-white/5 flex items-center justify-center text-white/20">
                        <ImageIcon size={32} />
                      </div>
                      <p className="text-white/40 font-medium">{t.noGallery}</p>
                    </div>
                  )}
                </motion.div>
              ) : !currentChat || currentChat.messages.length === 0 ? (
                <motion.div 
                  key="welcome"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="h-[60vh] flex flex-col items-center justify-center text-center gap-6"
                >
                  <div className="w-24 h-24 rounded-[32px] bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center shadow-[0_0_50px_rgba(59,130,246,0.3)]">
                    <Sparkles className="text-white" size={48} />
                  </div>
                  <div className="space-y-2">
                    <h2 className="text-3xl font-black text-white tracking-tight">{t.welcome}</h2>
                    <p className="text-white/40 font-medium max-w-xs mx-auto">{t.welcomeDesc}</p>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-8 w-full">
                    {t.suggestions.map((suggestion, i) => (
                      <button 
                        key={i}
                        onClick={() => handleSendMessage(suggestion)}
                        className={cn(
                          "p-4 rounded-2xl bg-white/5 border border-white/10 hover:bg-white/10 hover:border-white/20 transition-all text-sm font-medium text-white/60 hover:text-white",
                          language === 'ar' ? "text-right" : "text-left"
                        )}
                      >
                        {suggestion}
                      </button>
                    ))}
                  </div>
                </motion.div>
              ) : (
                <motion.div 
                  key="messages"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="space-y-6 pb-32"
                >
                  {currentChat.messages.map((msg) => (
                    <Message key={msg.id} message={msg} language={language} />
                  ))}
                  {chatLoading && (
                    <div className={cn("flex gap-4 p-6", language === 'ar' && "flex-row-reverse")}>
                      <div className="w-10 h-10 rounded-xl bg-purple-500/20 text-purple-400 flex items-center justify-center border border-white/10">
                        <Bot size={20} />
                      </div>
                      <div className="flex items-center gap-1 mt-4">
                        <motion.div animate={{ scale: [1, 1.5, 1] }} transition={{ repeat: Infinity, duration: 1 }} className="w-1.5 h-1.5 rounded-full bg-white/20" />
                        <motion.div animate={{ scale: [1, 1.5, 1] }} transition={{ repeat: Infinity, duration: 1, delay: 0.2 }} className="w-1.5 h-1.5 rounded-full bg-white/20" />
                        <motion.div animate={{ scale: [1, 1.5, 1] }} transition={{ repeat: Infinity, duration: 1, delay: 0.4 }} className="w-1.5 h-1.5 rounded-full bg-white/20" />
                      </div>
                    </div>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </main>

        {view === 'chat' && (
          <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-[#050505] via-[#050505]/90 to-transparent pt-10">
            <InputBar 
              onSend={handleSendMessage} 
              onGenerateImage={handleGenerateImage}
              onGenerateVideo={handleGenerateVideo}
              loading={chatLoading} 
              language={language}
              t={t}
            />
          </div>
        )}
      </div>
    </div>
  );
}
