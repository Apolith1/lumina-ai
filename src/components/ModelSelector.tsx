import React from 'react';
import { ChevronDown, Sparkles, Zap, Brain } from 'lucide-react';
import { ModelType } from '../types';
import { cn } from '../lib/utils';
import { motion, AnimatePresence } from 'motion/react';

interface ModelSelectorProps {
  selectedModel: ModelType;
  onSelect: (model: ModelType) => void;
  language: 'en' | 'ar';
}

const models = [
  { 
    id: 'Normal', 
    name: 'Normal', 
    nameAr: 'عادي',
    icon: Zap, 
    desc: 'Fast & efficient', 
    descAr: 'سريع وفعال',
    color: 'text-blue-400' 
  },
  { 
    id: 'Pro', 
    name: 'Pro', 
    nameAr: 'برو',
    icon: Sparkles, 
    desc: 'Enhanced reasoning', 
    descAr: 'تفكير معزز',
    color: 'text-purple-400' 
  },
  { 
    id: 'Pro 2', 
    name: 'Pro 2', 
    nameAr: 'برو ٢',
    icon: Brain, 
    desc: 'Maximum intelligence', 
    descAr: 'ذكاء أقصى',
    color: 'text-amber-400' 
  },
];

export function ModelSelector({ selectedModel, onSelect, language }: ModelSelectorProps) {
  const [isOpen, setIsOpen] = React.useState(false);
  const currentModel = models.find(m => m.id === selectedModel) || models[0];

  return (
    <div className="relative">
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          "flex items-center gap-2 px-4 py-2 rounded-2xl glass-dark border border-white/10 hover:bg-white/5 transition-all text-sm font-bold",
          language === 'ar' && "flex-row-reverse"
        )}
      >
        <currentModel.icon size={16} className={currentModel.color} />
        <span className="text-white/90">{language === 'ar' ? currentModel.nameAr : currentModel.name}</span>
        <ChevronDown size={14} className={cn("text-white/40 transition-transform", isOpen && "rotate-180")} />
      </button>

      <AnimatePresence>
        {isOpen && (
          <>
            <div 
              className="fixed inset-0 z-40" 
              onClick={() => setIsOpen(false)} 
            />
            <motion.div
              initial={{ opacity: 0, y: 10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 10, scale: 0.95 }}
              className={cn(
                "absolute top-full mt-2 z-50 glass-dark border border-white/10 rounded-2xl p-2 shadow-2xl overflow-hidden min-w-[200px]",
                language === 'ar' ? "left-0" : "right-0"
              )}
            >
              {models.map((model) => (
                <button
                  key={model.id}
                  onClick={() => {
                    onSelect(model.id as ModelType);
                    setIsOpen(false);
                  }}
                  className={cn(
                    "w-full flex items-start gap-3 p-3 rounded-xl transition-all hover:bg-white/5 text-left",
                    selectedModel === model.id && "bg-white/10",
                    language === 'ar' && "flex-row-reverse text-right"
                  )}
                >
                  <model.icon size={18} className={cn("mt-0.5", model.color)} />
                  <div className="flex-1">
                    <p className="text-sm font-bold text-white">{language === 'ar' ? model.nameAr : model.name}</p>
                    <p className="text-[10px] text-white/40 font-medium uppercase tracking-wider">
                      {language === 'ar' ? model.descAr : model.desc}
                    </p>
                  </div>
                </button>
              ))}
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
