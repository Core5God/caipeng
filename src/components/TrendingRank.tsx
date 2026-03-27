import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { getTrendingTopics } from '../services/gemini';
import { TrendingTopic } from '../types';
import { TrendingUp, Info, X, Sparkles, Share2 } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { Skeleton } from './ui/Skeleton';

export const TrendingRank: React.FC = () => {
  const [topics, setTopics] = useState<TrendingTopic[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedTopic, setSelectedTopic] = useState<TrendingTopic | null>(null);

  useEffect(() => {
    getTrendingTopics().then(data => {
      setTopics(data);
      setLoading(false);
    });
  }, []);

  if (loading) return (
    <section className="space-y-16 relative">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-8">
        <div className="space-y-4">
          <Skeleton className="h-4 w-32" />
          <Skeleton className="h-12 w-64" />
        </div>
        <Skeleton className="h-12 w-full md:w-64" />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {[1, 2, 3].map(i => (
          <div key={i} className="glass-card rounded-[2.5rem] p-10 space-y-6">
            <Skeleton className="w-16 h-16 rounded-2xl" />
            <div className="space-y-3">
              <Skeleton className="h-8 w-3/4" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-2/3" />
            </div>
            <div className="pt-6 border-t border-white/5 flex justify-between">
              <Skeleton className="h-3 w-20" />
              <Skeleton className="h-8 w-8 rounded-full" />
            </div>
          </div>
        ))}
      </div>
    </section>
  );

  return (
    <section className="space-y-16 relative">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-8">
        <div className="space-y-4">
          <div className="flex items-center gap-3 text-white/30">
            <TrendingUp size={16} />
            <span className="text-[9px] uppercase tracking-[0.4em] font-bold">每日科普热搜 / TRENDING TOPICS</span>
          </div>
          <h2 className="text-4xl md:text-6xl font-display font-bold tracking-tight">
            探索当下热门 / EXPLORE TRENDS
          </h2>
        </div>
        <p className="text-sm text-white/30 max-w-xs leading-relaxed">
          实时追踪全球科学动态，通过 AI 深度解析为您呈现最具价值的科普资讯。
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {topics.map((topic) => (
          <motion.div 
            key={topic.rank}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            whileHover={{ y: -10 }}
            onClick={() => setSelectedTopic(topic)}
            className="group relative glass-card rounded-[2.5rem] p-10 cursor-pointer overflow-hidden"
          >
            <div className="absolute top-0 right-0 p-8">
              <span className="text-6xl font-display font-bold text-white/[0.03] group-hover:text-white/[0.08] transition-colors duration-500">
                0{topic.rank}
              </span>
            </div>
            
            <div className="space-y-6 relative z-10">
              <div className="w-16 h-16 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-4xl group-hover:border-white/40 transition-all duration-500 group-hover:scale-110">
                {topic.emoji}
              </div>
              
              <div className="space-y-3">
                <h4 className="text-2xl font-display font-bold tracking-tight group-hover:text-white transition-colors">
                  {topic.title}
                </h4>
                <p className="text-sm text-white/40 leading-relaxed line-clamp-2 font-light">
                  {topic.summary}
                </p>
              </div>

              <div className="pt-6 flex items-center justify-between border-t border-white/5">
                <div className="flex items-center gap-2 text-[9px] uppercase tracking-widest text-white/20">
                  <div className="w-1 h-1 bg-green-500 rounded-full" />
                  AI 实时解析 / AI ANALYSIS
                </div>
                <div className="w-8 h-8 rounded-full border border-white/10 flex items-center justify-center group-hover:border-white/40 transition-colors">
                  <Info size={14} className="text-white/20 group-hover:text-white/60" />
                </div>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      <AnimatePresence>
        {selectedTopic && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 md:p-8">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedTopic(null)}
              className="absolute inset-0 bg-black/90 backdrop-blur-xl"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 40 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 40 }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="relative w-full max-w-5xl bg-brand-black border border-white/10 rounded-[3rem] overflow-hidden shadow-2xl flex flex-col md:flex-row max-h-[90vh]"
            >
              <button
                onClick={() => setSelectedTopic(null)}
                className="absolute top-8 right-8 z-20 p-3 rounded-full bg-black/40 border border-white/10 hover:bg-white hover:text-black transition-all duration-300"
              >
                <X size={20} />
              </button>

              <div className="w-full md:w-5/12 h-80 md:h-auto relative flex items-center justify-center bg-white/5 border-r border-white/5">
                <motion.div
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  className="text-[120px] md:text-[160px] drop-shadow-[0_0_40px_rgba(255,255,255,0.1)] select-none"
                >
                  {selectedTopic.emoji}
                </motion.div>
                <div className="absolute inset-0 bg-gradient-to-t from-brand-black via-transparent to-transparent md:bg-gradient-to-r" />
              </div>

              <div className="flex-1 p-10 md:p-16 overflow-y-auto custom-scrollbar">
                <div className="space-y-10">
                  <div className="space-y-4">
                    <div className="flex items-center gap-3 text-white/30">
                      <div className="w-8 h-[1px] bg-white/20" />
                      <span className="text-[10px] uppercase tracking-[0.4em] font-bold">Ranking #0{selectedTopic.rank}</span>
                    </div>
                    <h2 className="text-4xl md:text-5xl font-display font-bold tracking-tight leading-tight">
                      {selectedTopic.title}
                    </h2>
                  </div>
                  
                  <div className="prose prose-invert prose-sm max-w-none">
                    <div className="text-lg text-white/60 leading-relaxed font-light space-y-6">
                      <ReactMarkdown>{selectedTopic.detail}</ReactMarkdown>
                    </div>
                  </div>

                  <div className="pt-10 border-t border-white/5 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center">
                        <Sparkles size={18} className="text-white/40" />
                      </div>
                      <div className="flex flex-col">
                        <span className="text-[10px] uppercase tracking-widest text-white/60">AI Generated Insight</span>
                        <span className="text-[10px] uppercase tracking-widest text-white/20">Updated 2 mins ago</span>
                      </div>
                    </div>
                    <button className="btn-primary !py-3 !px-8 !text-[9px] uppercase tracking-widest">
                      分享知识 / SHARE
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </section>
  );
};
