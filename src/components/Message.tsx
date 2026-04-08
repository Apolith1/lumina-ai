import React from 'react';
import Markdown from 'react-markdown';
import { User, Bot, Download, Share2, RefreshCw, Copy, Check } from 'lucide-react';
import { Message as MessageType } from '../types';
import { cn } from '../lib/utils';
import { motion } from 'motion/react';

interface MessageProps {
  message: MessageType;
  isStreaming?: boolean;
  language: 'en' | 'ar';
}

export function Message({ message, isStreaming, language }: MessageProps) {
  const [copied, setCopied] = React.useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(message.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={cn(
        "flex gap-4 p-6 rounded-2xl transition-all group",
        message.role === 'user' ? "bg-white/5 border border-white/10" : "bg-transparent",
        language === 'ar' && "flex-row-reverse"
      )}
    >
      <div className={cn(
        "w-10 h-10 rounded-xl flex items-center justify-center shrink-0 border border-white/10",
        message.role === 'user' ? "bg-blue-500/20 text-blue-400" : "bg-purple-500/20 text-purple-400"
      )}>
        {message.role === 'user' ? <User size={20} /> : <Bot size={20} />}
      </div>

      <div className={cn("flex-1 space-y-4 overflow-hidden", language === 'ar' && "text-right")}>
        <div className={cn("flex items-center justify-between", language === 'ar' && "flex-row-reverse")}>
          <p className="text-xs font-bold uppercase tracking-widest text-white/40">
            {message.role === 'user' ? (language === 'ar' ? "أنت" : "You") : (language === 'ar' ? "فرحه" : "Farha")}
            {message.model && <span className="ml-2 px-2 py-0.5 rounded-full bg-white/5 text-[10px] lowercase font-medium">{message.model}</span>}
          </p>
          
          <div className={cn("flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-all", language === 'ar' && "flex-row-reverse")}>
            <button 
              onClick={handleCopy}
              className="p-1.5 hover:bg-white/10 rounded-lg text-white/40 hover:text-white transition-all"
            >
              {copied ? <Check size={14} className="text-green-400" /> : <Copy size={14} />}
            </button>
          </div>
        </div>

        <div className={cn("markdown-body text-white/90", language === 'ar' && "text-right")} dir={language === 'ar' ? "rtl" : "ltr"}>
          <Markdown>{message.content}</Markdown>
        </div>

        {message.type === 'image' && message.mediaUrl && (
          <div className="mt-4 rounded-2xl overflow-hidden border border-white/10 glass">
            <img 
              src={message.mediaUrl} 
              alt="Generated" 
              className="w-full h-auto max-h-[500px] object-contain"
              referrerPolicy="no-referrer"
            />
          </div>
        )}

        {message.type === 'video' && message.mediaUrl && (
          <div className="mt-4 rounded-2xl overflow-hidden border border-white/10 glass">
            <video 
              src={message.mediaUrl} 
              controls
              autoPlay
              loop
              className="w-full h-auto max-h-[500px] object-contain"
            />
          </div>
        )}

        {isStreaming && (
          <div className="flex gap-1 mt-2">
            <motion.div 
              animate={{ opacity: [0.3, 1, 0.3] }}
              transition={{ repeat: Infinity, duration: 1.5 }}
              className="w-1.5 h-1.5 rounded-full bg-white/40"
            />
            <motion.div 
              animate={{ opacity: [0.3, 1, 0.3] }}
              transition={{ repeat: Infinity, duration: 1.5, delay: 0.2 }}
              className="w-1.5 h-1.5 rounded-full bg-white/40"
            />
            <motion.div 
              animate={{ opacity: [0.3, 1, 0.3] }}
              transition={{ repeat: Infinity, duration: 1.5, delay: 0.4 }}
              className="w-1.5 h-1.5 rounded-full bg-white/40"
            />
          </div>
        )}
      </div>
    </motion.div>
  );
}
