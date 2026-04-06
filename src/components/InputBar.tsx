import React from 'react';
import { Send, Image as ImageIcon, Video, Mic, Paperclip, Sparkles } from 'lucide-react';
import { cn } from '../lib/utils';
import { motion, AnimatePresence } from 'motion/react';

interface InputBarProps {
  onSend: (content: string) => void;
  onGenerateImage: (prompt: string) => void;
  onGenerateVideo: (prompt: string) => void;
  loading: boolean;
  language: 'en' | 'ar';
  t: any;
}

export function InputBar({ onSend, onGenerateImage, onGenerateVideo, loading, language, t }: InputBarProps) {
  const [input, setInput] = React.useState("");
  const [mode, setMode] = React.useState<'text' | 'image' | 'video'>('text');
  const textareaRef = React.useRef<HTMLTextAreaElement>(null);

  const handleSubmit = (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!input.trim() || loading) return;

    if (mode === 'image') {
      onGenerateImage(input);
    } else if (mode === 'video') {
      onGenerateVideo(input);
    } else {
      onSend(input);
    }
    setInput("");
    setMode('text');
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  React.useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  }, [input]);

  return (
    <div className="w-full max-w-4xl mx-auto p-4 pb-8">
      <div className="relative glass-dark border border-white/10 rounded-3xl p-2 shadow-2xl transition-all focus-within:border-white/20">
        <div className={cn("flex items-center gap-2 px-2 pb-2 border-b border-white/5 mb-2", language === 'ar' && "flex-row-reverse")}>
          <button 
            onClick={() => setMode('text')}
            className={cn(
              "flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all",
              mode === 'text' ? "bg-blue-500 text-white" : "text-white/40 hover:text-white hover:bg-white/5"
            )}
          >
            <Sparkles size={14} />
            {t.chat}
          </button>
          <button 
            onClick={() => setMode('image')}
            className={cn(
              "flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all",
              mode === 'image' ? "bg-purple-500 text-white" : "text-white/40 hover:text-white hover:bg-white/5"
            )}
          >
            <ImageIcon size={14} />
            {t.gallery}
          </button>
          <button 
            onClick={() => setMode('video')}
            className={cn(
              "flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all",
              mode === 'video' ? "bg-red-500 text-white" : "text-white/40 hover:text-white hover:bg-white/5"
            )}
          >
            <Video size={14} />
            {t.video}
          </button>
        </div>

        <div className={cn("flex items-end gap-2 p-1", language === 'ar' && "flex-row-reverse")}>
          <button className="p-3 text-white/40 hover:text-white transition-all rounded-2xl hover:bg-white/5 shrink-0">
            <Paperclip size={20} />
          </button>
          
          <textarea
            ref={textareaRef}
            rows={1}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={mode === 'image' ? t.imagePlaceholder : mode === 'video' ? t.videoPlaceholder : t.placeholder}
            className={cn(
              "flex-1 bg-transparent border-none focus:ring-0 text-white placeholder:text-white/20 py-3 px-2 resize-none max-h-60 custom-scrollbar text-sm leading-relaxed",
              language === 'ar' && "text-right"
            )}
            dir={language === 'ar' ? "rtl" : "ltr"}
          />

          <div className={cn("flex items-center gap-1 shrink-0", language === 'ar' && "flex-row-reverse")}>
            <button className="p-3 text-white/40 hover:text-white transition-all rounded-2xl hover:bg-white/5">
              <Mic size={20} />
            </button>
            
            <button 
              onClick={handleSubmit}
              disabled={!input.trim() || loading}
              className={cn(
                "p-3 rounded-2xl transition-all",
                input.trim() && !loading 
                  ? "bg-white text-black hover:bg-white/90 scale-105 active:scale-95" 
                  : "bg-white/5 text-white/20"
              )}
            >
              {loading ? (
                <motion.div 
                  animate={{ rotate: 360 }}
                  transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
                >
                  <Sparkles size={20} />
                </motion.div>
              ) : (
                <Send size={20} className={cn(language === 'ar' && "rotate-180")} />
              )}
            </button>
          </div>
        </div>
      </div>
      <p className="text-[10px] text-center mt-3 text-white/20 font-medium uppercase tracking-widest">
        {t.mistakes}
      </p>
    </div>
  );
}
