import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { getDailyQuiz } from '../services/gemini';
import { QuizQuestion } from '../types';
import { Brain, Trophy, ArrowRight, Sparkles, Check, X, Info } from 'lucide-react';
import { Skeleton } from './ui/Skeleton';

export const DailyQuiz: React.FC = () => {
  const [questions, setQuestions] = useState<QuizQuestion[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [score, setScore] = useState(0);
  const [showResult, setShowResult] = useState(false);
  const [loading, setLoading] = useState(true);

  const fetchQuestions = async () => {
    setLoading(true);
    try {
      const data = await getDailyQuiz();
      setQuestions(data);
      setCurrentIndex(0);
      setScore(0);
      setShowResult(false);
      setSelectedAnswer(null);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchQuestions();
  }, []);

  const handleAnswer = (index: number) => {
    if (selectedAnswer !== null) return;
    setSelectedAnswer(index);
    if (index === questions[currentIndex].answerIndex) {
      setScore(s => s + 1);
    }
  };

  const nextQuestion = () => {
    if (currentIndex < questions.length - 1) {
      setCurrentIndex(c => c + 1);
      setSelectedAnswer(null);
    } else {
      setShowResult(true);
    }
  };

  const shareAchievement = () => {
    const text = `我在 Omni-ID 智力觉醒挑战中获得了 ${score * 10} 分！准确率 ${Math.round((score / questions.length) * 100)}%。快来一起探索万物奥秘吧！`;
    if (navigator.share) {
      navigator.share({
        title: 'Omni-ID 挑战成就',
        text: text,
        url: window.location.href,
      }).catch(console.error);
    } else {
      navigator.clipboard.writeText(text);
      alert('成就已复制到剪贴板！');
    }
  };

  if (loading) return (
    <div className="w-full max-w-4xl mx-auto space-y-16">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-8">
        <div className="space-y-4">
          <Skeleton className="h-4 w-32" />
          <Skeleton className="h-12 w-64" />
        </div>
        <Skeleton className="w-16 h-16 rounded-full" />
      </div>
      <div className="p-10 md:p-16 glass-panel rounded-[3rem] space-y-12">
        <Skeleton className="h-12 w-3/4" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {[1, 2, 3, 4].map(i => <Skeleton key={i} className="h-24 rounded-[2rem]" />)}
        </div>
      </div>
    </div>
  );

  if (showResult) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-4xl mx-auto p-12 md:p-20 glass-panel rounded-[4rem] border-white/[0.08] text-center space-y-12 relative overflow-hidden"
      >
        <div className="absolute inset-0 bg-gradient-to-br from-white/[0.02] via-transparent to-white/[0.02]" />
        
        <div className="relative z-10 space-y-8">
          <motion.div
            initial={{ scale: 0, rotate: -45 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ type: "spring", damping: 15, stiffness: 150 }}
            className="w-24 h-24 rounded-[2rem] bg-white text-brand-black flex items-center justify-center mx-auto shadow-[0_20px_40px_-10px_rgba(255,255,255,0.3)]"
          >
            <Trophy size={40} />
          </motion.div>
          
          <div className="space-y-4">
            <h2 className="text-5xl md:text-7xl font-display font-bold tracking-tighter leading-none bg-gradient-to-b from-white to-white/40 bg-clip-text text-transparent">
              挑战完成
            </h2>
            <p className="text-lg md:text-xl text-white/40 font-light tracking-wide max-w-xl mx-auto leading-relaxed">
              恭喜！您已成功完成今日的智力觉醒挑战。<br/>知识的种子已在您的脑海中生根发芽。
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 relative z-10">
          {[
            { label: 'Total Score', value: score * 10, unit: 'pts', icon: Sparkles },
            { label: 'Accuracy', value: Math.round((score / questions.length) * 100), unit: '%', icon: Brain },
            { label: 'Time Spent', value: '2:45', unit: 'min', icon: Info }
          ].map((stat, idx) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 + idx * 0.1 }}
              className="p-8 rounded-[2.5rem] bg-white/[0.03] border border-white/[0.05] space-y-3"
            >
              <div className="flex items-center justify-center gap-2 text-white/20">
                <stat.icon size={12} />
                <span className="text-[9px] uppercase tracking-[0.3em] font-bold">{stat.label}</span>
              </div>
              <div className="flex items-baseline justify-center gap-1">
                <span className="text-4xl font-display font-bold tracking-tighter">{stat.value}</span>
                <span className="text-sm font-light text-white/20">{stat.unit}</span>
              </div>
            </motion.div>
          ))}
        </div>

        <div className="flex flex-col md:flex-row gap-6 justify-center relative z-10 pt-4">
          <motion.button
            whileHover={{ scale: 1.05, y: -2 }}
            whileTap={{ scale: 0.95 }}
            onClick={fetchQuestions}
            className="px-10 py-5 rounded-full bg-white/5 border border-white/10 text-white font-display font-bold text-[10px] uppercase tracking-[0.3em] hover:bg-white/10 transition-all"
          >
            再来一次 / PLAY AGAIN
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.05, y: -2 }}
            whileTap={{ scale: 0.95 }}
            onClick={shareAchievement}
            className="px-10 py-5 rounded-full bg-white text-brand-black font-display font-bold text-[10px] uppercase tracking-[0.3em] shadow-[0_20px_40px_-10px_rgba(255,255,255,0.4)] transition-all"
          >
            分享成就 / SHARE ACHIEVEMENT
          </motion.button>
        </div>
      </motion.div>
    );
  }

  const currentQuestion = questions[currentIndex];

  if (!currentQuestion) return (
    <div className="w-full h-[400px] flex items-center justify-center glass-panel rounded-[2.5rem]">
      <p className="text-white/40">暂时没有可用的挑战，请稍后再试。</p>
    </div>
  );

  return (
    <div className="w-full max-w-4xl mx-auto space-y-16">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-8">
        <div className="space-y-4">
          <div className="flex items-center gap-3 text-white/30">
            <Brain size={16} className="text-white/40" />
            <span className="text-[10px] uppercase tracking-[0.5em] font-black">Daily Challenge</span>
          </div>
          <h2 className="text-4xl md:text-6xl font-display font-bold tracking-tight leading-tight">
            智力觉醒
          </h2>
        </div>
        <div className="flex items-center gap-8 bg-white/[0.03] p-4 pr-8 rounded-full border border-white/[0.05]">
          <div className="w-16 h-16 rounded-full border-2 border-white/5 flex items-center justify-center relative shadow-2xl">
            <svg className="w-full h-full -rotate-90 scale-90">
              <circle
                cx="32"
                cy="32"
                r="28"
                fill="none"
                stroke="currentColor"
                strokeWidth="3"
                className="text-white/5"
              />
              <motion.circle
                cx="32"
                cy="32"
                r="28"
                fill="none"
                stroke="currentColor"
                strokeWidth="3"
                strokeDasharray="175.9"
                animate={{ strokeDashoffset: 175.9 * (1 - (currentIndex + 1) / questions.length) }}
                transition={{ duration: 0.8, ease: "easeOut" }}
                className="text-white drop-shadow-[0_0_8px_rgba(255,255,255,0.4)]"
              />
            </svg>
            <span className="absolute text-[11px] font-black tracking-tighter">{Math.round(((currentIndex + 1) / questions.length) * 100)}%</span>
          </div>
          <div className="flex flex-col">
            <span className="text-[10px] uppercase tracking-[0.2em] font-bold text-white/20">Progress</span>
            <span className="text-lg font-display font-bold tabular-nums">{currentIndex + 1} <span className="text-white/20 text-xs">/</span> {questions.length}</span>
          </div>
        </div>
      </div>

      <motion.div
        key={currentIndex}
        initial={{ opacity: 0, x: 30 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: -30 }}
        transition={{ type: "spring", damping: 25, stiffness: 200 }}
        className="space-y-10"
      >
        <div className="p-12 md:p-20 glass-panel rounded-[3.5rem] border-white/[0.08] space-y-16 relative overflow-hidden">
          {/* Decorative background */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/[0.02] rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
          
          <h3 className="text-3xl md:text-4xl font-display font-medium leading-[1.3] text-balance relative z-10">
            {currentQuestion.question}
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 relative z-10">
            {currentQuestion.options.map((option, index) => {
              const isCorrect = index === currentQuestion.answerIndex;
              const isSelected = selectedAnswer === index;
              const showCorrect = selectedAnswer !== null && isCorrect;
              const showWrong = isSelected && !isCorrect;

              return (
                <motion.button
                  key={index}
                  whileHover={selectedAnswer === null ? { y: -4, backgroundColor: "rgba(255,255,255,0.08)" } : {}}
                  whileTap={selectedAnswer === null ? { scale: 0.98 } : {}}
                  onClick={() => handleAnswer(index)}
                  className={`p-10 rounded-[2.5rem] text-left transition-all duration-500 border-2 relative overflow-hidden group ${
                    selectedAnswer === null
                      ? 'bg-white/[0.04] border-white/[0.05] hover:border-white/20 shadow-xl'
                      : showCorrect
                      ? 'bg-green-500/10 border-green-500/40 text-green-400 shadow-[0_0_30px_rgba(34,197,94,0.1)]'
                      : showWrong
                      ? 'bg-red-500/10 border-red-500/40 text-red-400 shadow-[0_0_30px_rgba(239,68,68,0.1)]'
                      : 'bg-white/[0.02] border-white/[0.02] opacity-30 scale-[0.98]'
                  }`}
                >
                  <div className="flex items-center gap-8 relative z-10">
                    <div className={`w-12 h-12 rounded-2xl flex items-center justify-center text-sm font-black border-2 transition-all duration-500 ${
                      selectedAnswer === null
                        ? 'bg-white/[0.05] border-white/[0.1] group-hover:bg-white group-hover:text-black group-hover:scale-110'
                        : showCorrect
                        ? 'bg-green-500 border-green-500 text-black scale-110 shadow-[0_0_15px_rgba(34,197,94,0.5)]'
                        : showWrong
                        ? 'bg-red-500 border-red-500 text-black scale-110 shadow-[0_0_15px_rgba(239,68,68,0.5)]'
                        : 'bg-white/[0.05] border-white/[0.05]'
                    }`}>
                      {String.fromCharCode(65 + index)}
                    </div>
                    <span className="text-xl font-light tracking-tight">{option}</span>
                  </div>
                </motion.button>
              );
            })}
          </div>
        </div>

        <AnimatePresence>
          {selectedAnswer !== null && (
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-10"
            >
              <div className="p-12 md:p-16 glass-panel rounded-[3rem] border-white/20 space-y-8 relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-white/20 to-transparent" />
                <div className="flex items-center gap-4">
                  <div className="w-10 h-[1px] bg-white/20" />
                  <span className="text-[11px] uppercase tracking-[0.5em] font-black text-white/40">Insight / 知识详解</span>
                </div>
                <p className="text-xl text-white/60 leading-relaxed font-light italic">
                  {currentQuestion.explanation}
                </p>
              </div>

              <div className="flex justify-end">
                <button
                  onClick={nextQuestion}
                  className="btn-primary group !py-5 !px-12 !text-[10px] uppercase tracking-[0.3em] font-black shadow-2xl hover:shadow-white/10"
                >
                  {currentIndex === questions.length - 1 ? '完成挑战 / COMPLETE CHALLENGE' : '下一题 / NEXT QUESTION'}
                  <ArrowRight size={18} className="group-hover:translate-x-2 transition-transform duration-300" />
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
};
