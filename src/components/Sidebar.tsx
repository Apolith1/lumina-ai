import React from 'react';
import { Plus, MessageSquare, Trash2, Search, Settings, LogOut, User, Image as ImageIcon } from 'lucide-react';
import { Chat } from '../types';
import { cn } from '../lib/utils';
import { motion, AnimatePresence } from 'motion/react';

interface SidebarProps {
  chats: Chat[];
  currentChatId: string | null;
  onSelectChat: (id: string) => void;
  onNewChat: () => void;
  onDeleteChat: (id: string) => void;
  user: any;
  onLogout: () => void;
  language: 'en' | 'ar';
  setLanguage: (lang: 'en' | 'ar') => void;
  view: 'chat' | 'gallery';
  setView: (view: 'chat' | 'gallery') => void;
  t: any;
}

export function Sidebar({ 
  chats, 
  currentChatId, 
  onSelectChat, 
  onNewChat, 
  onDeleteChat,
  user,
  onLogout,
  language,
  setLanguage,
  view,
  setView,
  t
}: SidebarProps) {
  const [search, setSearch] = React.useState("");

  const filteredChats = chats.filter(c => 
    c.title.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="w-80 h-full flex flex-col glass-dark border-r border-white/10 text-white overflow-hidden">
      <div className="p-4 space-y-4">
        <button 
          onClick={onNewChat}
          className="w-full flex items-center justify-center gap-2 bg-white/10 hover:bg-white/20 transition-all p-3 rounded-xl border border-white/10 font-medium"
        >
          <Plus size={20} />
          {t.newChat}
        </button>

        <div className="flex gap-2">
          <button 
            onClick={() => setView('chat')}
            className={cn(
              "flex-1 flex items-center justify-center gap-2 p-2 rounded-lg text-xs font-bold transition-all",
              view === 'chat' ? "bg-white text-black" : "bg-white/5 text-white/40 hover:text-white"
            )}
          >
            <MessageSquare size={14} />
            {t.chat}
          </button>
          <button 
            onClick={() => setView('gallery')}
            className={cn(
              "flex-1 flex items-center justify-center gap-2 p-2 rounded-lg text-xs font-bold transition-all",
              view === 'gallery' ? "bg-white text-black" : "bg-white/5 text-white/40 hover:text-white"
            )}
          >
            <ImageIcon size={14} />
            {t.gallery}
          </button>
        </div>
      </div>

      <div className="px-4 mb-4">
        <div className="relative">
          <Search className={cn("absolute top-1/2 -translate-y-1/2 text-white/40", language === 'ar' ? "right-3" : "left-3")} size={16} />
          <input 
            type="text" 
            placeholder={t.search}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className={cn(
              "w-full bg-white/5 border border-white/10 rounded-lg py-2 text-sm focus:outline-none focus:ring-1 focus:ring-white/20",
              language === 'ar' ? "pr-10 pl-4 text-right" : "pl-10 pr-4"
            )}
          />
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-2 space-y-1 custom-scrollbar">
        <AnimatePresence initial={false}>
          {filteredChats.map((chat) => (
            <motion.div
              key={chat.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className={cn(
                "group relative flex items-center gap-3 p-3 rounded-xl cursor-pointer transition-all hover:bg-white/5",
                currentChatId === chat.id && "bg-white/10 border border-white/10",
                language === 'ar' && "flex-row-reverse"
              )}
              onClick={() => {
                onSelectChat(chat.id);
                setView('chat');
              }}
            >
              <MessageSquare size={18} className="text-white/60 shrink-0" />
              <span className={cn("flex-1 truncate text-sm font-medium", language === 'ar' && "text-right")}>{chat.title}</span>
              
              <button 
                onClick={(e) => {
                  e.stopPropagation();
                  onDeleteChat(chat.id);
                }}
                className="opacity-0 group-hover:opacity-100 p-1 hover:text-red-400 transition-all"
              >
                <Trash2 size={14} />
              </button>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      <div className="p-4 border-t border-white/10 space-y-2">
        <div className={cn("flex items-center gap-2 p-1 bg-white/5 rounded-xl mb-4", language === 'ar' && "flex-row-reverse")}>
          <button 
            onClick={() => setLanguage('en')}
            className={cn("flex-1 py-1 rounded-lg text-[10px] font-bold uppercase tracking-widest transition-all", language === 'en' ? "bg-white text-black" : "text-white/40")}
          >
            English
          </button>
          <button 
            onClick={() => setLanguage('ar')}
            className={cn("flex-1 py-1 rounded-lg text-[10px] font-bold uppercase tracking-widest transition-all", language === 'ar' ? "bg-white text-black" : "text-white/40")}
          >
            العربية
          </button>
        </div>

        <div className={cn("flex items-center gap-3 p-2", language === 'ar' && "flex-row-reverse")}>
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold">
            {user?.photoURL ? (
              <img src={user.photoURL} alt="Avatar" className="w-full h-full rounded-full" />
            ) : (
              user?.email?.[0].toUpperCase() || <User size={20} />
            )}
          </div>
          <div className={cn("flex-1 truncate", language === 'ar' && "text-right")}>
            <p className="text-sm font-medium truncate">{user?.displayName || user?.email}</p>
            <p className="text-xs text-white/40 truncate">Premium Plan</p>
          </div>
        </div>
        
        <button 
          onClick={onLogout}
          className={cn("w-full flex items-center gap-3 p-2 rounded-lg hover:bg-white/5 text-white/60 hover:text-white transition-all text-sm", language === 'ar' && "flex-row-reverse")}
        >
          <LogOut size={18} />
          {t.signOut}
        </button>
      </div>
    </div>
  );
}
