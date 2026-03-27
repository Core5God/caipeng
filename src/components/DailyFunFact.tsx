import React, { useEffect, useState } from 'react';
import { motion } from 'motion/react';
import { getDailyFunFact } from '../services/gemini';
import { FunFact } from '../types';
import { Sparkles } from 'lucide-react';
import { Skeleton } from './ui/Skeleton';

export const DailyFunFact: React.FC = () => {
  const [fact, setFact] = useState<FunFact | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getDailyFunFact().then(data => {
      setFact(data);
      setLoading(false);
    });
  }, []);

  if (loading || !fact) return (
    <div className="w-full min-h-[500px] flex flex-col lg:flex-row glass-panel rounded-[3rem] overflow-hidden">
      <div className="w-full lg:w-1/2 h-[300px] lg:h-auto flex items-center justify-center bg-white/5">
        <Skeleton className="w-32 h-32 md:w-48 md:h-48 rounded-full" />
      </div>
      <div className="flex-1 p-10 md:p-16 flex flex-col justify-center space-y-8">
        <div className="space-y-4">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-12 w-3/4" />
        </div>
        <div className="space-y-3">
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-2/3" />
        </div>
        <div className="pt-8 flex items-center gap-6">
          <div className="flex -space-x-3">
            {[1, 2, 3].map(i => <Skeleton key={i} className="w-8 h-8 rounded-full border-2 border-brand-black" />)}
          </div>
          <Skeleton className="h-3 w-32" />
        </div>
      </div>
    </div>
  );

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      className="group relative w-full overflow-hidden rounded-[3rem] glass-panel"
    >
      <div className="flex flex-col lg:flex-row min-h-[500px]">
        {/* Emoji Section */}
        <div className="w-full lg:w-1/2 h-[400px] lg:h-auto relative overflow-hidden flex items-center justify-center bg-white/5 border-r border-white/5 cursor-pointer">
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ 
              scale: { type: "spring", damping: 12, stiffness: 200 },
              opacity: { duration: 0.8 }
            }}
            whileHover={{ 
              scale: 1.1, 
              rotate: 5,
            }}
            whileTap={{ scale: 0.95, rotate: -5 }}
            className="text-[140px] md:text-[200px] lg:text-[240px] select-none transition-all duration-300 transform-gpu text-glow"
          >
            {fact.emoji}
          </motion.div>
          
          <div className="absolute inset-0 bg-gradient-to-t from-brand-black/40 via-transparent to-transparent pointer-events-none" />
          
          <div className="absolute bottom-8 left-8 flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-white/60" />
            </div>
            <span className="text-[10px] uppercase tracking-[0.3em] font-bold text-white/80">每日科普精选</span>
          </div>
        </div>

        {/* Content Section */}
        <div className="flex-1 p-10 md:p-16 flex flex-col justify-center space-y-8">
          <div className="space-y-4">
            <div className="flex items-center gap-4 text-white/30">
              <div className="h-[1px] w-8 bg-white/20" />
              <span className="text-[10px] uppercase tracking-[0.4em] font-bold">Science Daily</span>
            </div>
            <h2 className="text-4xl md:text-5xl font-display font-bold tracking-tight leading-tight">
              {fact.title}
            </h2>
          </div>

          <p className="text-lg text-white/50 leading-relaxed font-light">
            {fact.content}
          </p>

          <div className="pt-8 flex items-center gap-6">
            <div className="flex -space-x-3">
              {[1, 2, 3].map(i => (
                <div key={i} className="w-8 h-8 rounded-full border-2 border-brand-black bg-white/10 overflow-hidden">
                  <img src={`https://picsum.photos/seed/user${i}/100/100`} alt="User" className="w-full h-full object-cover" />
                </div>
              ))}
            </div>
            <span className="text-[10px] uppercase tracking-widest text-white/20">
              与 1.2k+ 探索者共同学习
            </span>
          </div>
        </div>
      </div>
    </motion.div>
  );
};
