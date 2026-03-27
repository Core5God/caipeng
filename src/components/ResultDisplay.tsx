import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { IdentificationResult } from '../types';
import { Info, History, Shield, Zap, Leaf, Microscope, Globe, Star, Sparkles, Search, BookOpen, Palette, Loader2 } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { generateIllustration } from '../services/gemini';

const ICON_MAP: Record<string, any> = {
  Info, History, Shield, Zap, Leaf, Microscope, Globe, Star, Sparkles, Search, BookOpen
};

interface ResultDisplayProps {
  result: IdentificationResult;
  imageUrl: string;
}

export const ResultDisplay: React.FC<ResultDisplayProps> = ({ result, imageUrl }) => {
  const [aiArt, setAiArt] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);

  const handleGenerateArt = async () => {
    if (isGenerating) return;
    setIsGenerating(true);
    try {
      const art = await generateIllustration(result.name);
      setAiArt(art);
    } catch (error) {
      console.error("Art generation failed:", error);
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      className="w-full max-w-5xl mx-auto space-y-16 pb-32"
    >
      <div className="relative aspect-[21/9] overflow-hidden rounded-3xl border border-white/10 shadow-2xl group">
        <AnimatePresence mode="wait">
          <motion.img
            key={aiArt || imageUrl}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            src={aiArt || imageUrl}
            alt={result.name}
            className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105"
            referrerPolicy="no-referrer"
            onError={(e) => {
              const target = e.target as HTMLImageElement;
              if (!target.src.includes('picsum.photos')) {
                target.src = `https://picsum.photos/seed/${encodeURIComponent(result.name)}/1200/800`;
              }
            }}
          />
        </AnimatePresence>
        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent flex flex-col justify-end p-12">
          <div className="flex items-end justify-between">
            <div className="space-y-4">
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-3">
                  <div className="h-[1px] w-8 bg-white/40" />
                  <span className="text-[10px] uppercase tracking-[0.4em] text-white/60">
                    {result.category}
                  </span>
                </div>
                <button
                  onClick={handleGenerateArt}
                  disabled={isGenerating}
                  className="flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/5 border border-white/10 hover:bg-white/10 transition-all text-[9px] uppercase tracking-widest text-white/60 hover:text-white disabled:opacity-50"
                >
                  {isGenerating ? (
                    <Loader2 size={12} className="animate-spin" />
                  ) : (
                    <Palette size={12} />
                  )}
                  {isGenerating ? '正在生成 / GENERATING...' : 'AI 艺术图 / AI ART'}
                </button>
              </div>
              <h1 className="text-7xl font-serif italic text-white tracking-tight leading-none flex items-center gap-6">
                {result.name}
                <motion.span 
                  whileHover={{ 
                    scale: 1.15, 
                    rotate: [0, -5, 5, 0],
                  }}
                  whileTap={{ scale: 0.85 }}
                  transition={{ type: "spring", damping: 12, stiffness: 300 }}
                  className="text-6xl not-italic inline-block cursor-pointer select-none transform-gpu text-glow"
                >
                  {result.emoji}
                </motion.span>
              </h1>
              <p className="text-white/60 text-sm max-w-xl font-light tracking-wide">{result.description}</p>
            </div>
            <div className="text-right space-y-1">
              <span className="text-[10px] uppercase tracking-[0.5em] text-white/40 block">AI 置信度</span>
              <span className="text-4xl font-light tracking-tighter">{(result.confidence * 100).toFixed(0)}%</span>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
        {result.sections.map((section, idx) => {
          const IconComponent = ICON_MAP[section.icon] || Info;
          
          return (
            <motion.div
              key={section.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.1 }}
              className="glass-panel p-10 rounded-3xl space-y-6 hover:bg-white/[0.07] transition-all duration-500 group"
            >
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-xl bg-white/5 group-hover:bg-white/10 transition-colors">
                  <IconComponent className="text-white/60" size={20} />
                </div>
                <h3 className="text-xs uppercase tracking-[0.3em] font-bold">{section.title}</h3>
              </div>
              <div className="prose prose-invert prose-sm max-w-none text-white/70 leading-relaxed font-light">
                <ReactMarkdown>{section.content}</ReactMarkdown>
              </div>
            </motion.div>
          );
        })}
      </div>
    </motion.div>
  );
};
