import { useState, useEffect, useRef, lazy, Suspense } from 'react';
import { motion, AnimatePresence, useScroll, useSpring } from 'motion/react';
import { Camera } from './components/Camera';
import { ResultDisplay } from './components/ResultDisplay';
import { Chat } from './components/Chat';
import { identifyImage, getDailyData } from './services/gemini';
import { IdentificationResult } from './types';
import { Sparkles, ArrowLeft, ChevronDown, Check, X } from 'lucide-react';
import { Skeleton } from './components/ui/Skeleton';

const DailyFunFact = lazy(() => import('./components/DailyFunFact').then(m => ({ default: m.DailyFunFact })));
const TrendingRank = lazy(() => import('./components/TrendingRank').then(m => ({ default: m.TrendingRank })));
const DailyQuiz = lazy(() => import('./components/DailyQuiz').then(m => ({ default: m.DailyQuiz })));

export default function App() {
  const [isProcessing, setIsProcessing] = useState(false);
  const [result, setResult] = useState<IdentificationResult | null>(null);
  const [currentImage, setCurrentImage] = useState<string | null>(null);
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, {
    stiffness: 100,
    damping: 30,
    restDelta: 0.001
  });

  useEffect(() => {
    // Pre-fetch daily data as early as possible
    getDailyData().catch(console.error);

    if (videoRef.current) {
      videoRef.current.play().catch(err => {
        console.log("Autoplay prevented:", err);
      });
    }
  }, []);

  const handleCapture = (base64: string) => {
    setPreviewImage(`data:image/jpeg;base64,${base64}`);
  };

  const confirmIdentification = async () => {
    if (!previewImage || isProcessing) return;
    
    setIsProcessing(true);
    const base64 = previewImage.split(',')[1];
    setCurrentImage(previewImage);
    
    try {
      const res = await identifyImage(base64);
      setResult(res);
      setPreviewImage(null); // Clear preview only on success
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (err) {
      console.error(err);
      alert("识别失败，请重试。");
    } finally {
      setIsProcessing(false);
    }
  };

  const cancelPreview = () => {
    if (isProcessing) return;
    setPreviewImage(null);
  };

  const reset = () => {
    setResult(null);
    setCurrentImage(null);
  };

  const backgroundVideo = "https://mp3tourl.com/videos/1774488411001-c6586746-8eea-4d55-bfa5-7eff3d2252fc.mp4";

  return (
    <div className="min-h-screen flex flex-col bg-brand-black text-brand-white selection:bg-white selection:text-black overflow-x-hidden relative">
      {/* Noise Overlay */}
      <div className="fixed inset-0 z-[100] pointer-events-none opacity-[0.03] mix-blend-overlay bg-[url('https://grainy-gradients.vercel.app/noise.svg')] bg-repeat" />

      {/* Scroll Progress */}
      <motion.div
        className="fixed top-0 left-0 right-0 h-1 bg-white origin-left z-[101]"
        style={{ scaleX }}
      />

      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 px-6 py-6 md:px-12 md:py-8 flex justify-between items-center bg-gradient-to-b from-black/80 to-transparent backdrop-blur-sm">
        <motion.div 
          initial={{ x: -20, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          className="flex items-center gap-3 group cursor-pointer" 
          onClick={reset}
        >
          <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center group-hover:rotate-12 transition-transform duration-500">
            <Sparkles className="w-5 h-5 text-black" />
          </div>
          <span className="text-sm font-display font-bold tracking-[0.3em] uppercase">Omni-ID</span>
        </motion.div>
        
        <nav className="hidden md:flex items-center gap-8">
          {['每日科普 / FACT', '热门排行 / TRENDS', '知识挑战 / QUIZ'].map((item, i) => (
            <motion.a 
              key={item}
              href={`#${['fact', 'trending', 'quiz'][i]}`}
              initial={{ y: -10, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.1 * i }}
              whileHover={{ y: -2 }}
              className="text-[9px] uppercase tracking-[0.2em] text-white/40 hover:text-white transition-all"
            >
              {item}
            </motion.a>
          ))}
        </nav>

        {result ? (
          <motion.button
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            onClick={reset}
            className="btn-secondary !py-2 !px-6 !text-[9px] uppercase tracking-widest"
          >
            <ArrowLeft size={12} />
            返回 / BACK
          </motion.button>
        ) : (
          <motion.div 
            initial={{ x: 20, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            className="flex items-center gap-4"
          >
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
            <span className="text-[9px] uppercase tracking-widest text-white/40">AI 助手在线 / AI AGENT ONLINE</span>
          </motion.div>
        )}
      </header>

      <main className="flex-1 flex flex-col">
        <AnimatePresence mode="wait">
          {!result ? (
            <motion.div key="home" className="flex flex-col">
              <motion.section
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="min-h-screen flex flex-col items-center justify-center px-6 relative overflow-hidden"
              >
                {/* Background Video */}
                <div className="absolute inset-0 z-0 overflow-hidden">
                  <video 
                    ref={videoRef}
                    autoPlay 
                    muted 
                    loop 
                    playsInline
                    preload="auto"
                    className="absolute inset-0 w-full h-full object-cover opacity-70"
                  >
                    <source src={backgroundVideo} type="video/mp4" />
                  </video>
                  {/* Overlays */}
                  <div className="absolute inset-0 bg-black/30 z-10" />
                  <div className="absolute inset-0 bg-gradient-to-b from-brand-black/80 via-transparent to-brand-black z-10" />
                </div>

                <div className="text-center space-y-12 max-w-5xl z-20">
                  <div className="space-y-6">
                    <motion.div
                      initial={{ y: 20, opacity: 0 }}
                      animate={{ y: 0, opacity: 1 }}
                      transition={{ duration: 0.8, ease: "easeOut" }}
                      className="inline-flex items-center gap-3 px-4 py-2 rounded-full bg-white/5 border border-white/10 backdrop-blur-md"
                    >
                      <div className="w-2 h-2 bg-white rounded-full animate-pulse" />
                      <span className="text-[10px] uppercase tracking-[0.3em] font-medium text-white/60">Next-Gen Visual Intelligence</span>
                    </motion.div>
                    
                    <h1 className="text-6xl md:text-8xl lg:text-9xl font-display font-bold tracking-tight leading-[1.1] text-glow py-4 flex justify-center gap-2">
                      {["万", "物", "皆", "有", "灵"].map((char, i) => (
                        <span key={i} className="inline-block overflow-hidden">
                          <motion.span
                            initial={{ y: "100%" }}
                            animate={{ y: 0 }}
                            transition={{ 
                              duration: 1.2, 
                              delay: 0.2 + i * 0.1, 
                              ease: [0.16, 1, 0.3, 1] 
                            }}
                            className="inline-block"
                          >
                            {char}
                          </motion.span>
                        </span>
                      ))}
                    </h1>
                    
                    <motion.p 
                      initial={{ y: 20, opacity: 0 }}
                      animate={{ y: 0, opacity: 1 }}
                      transition={{ delay: 0.8, duration: 1 }}
                      className="text-base md:text-lg text-white/40 max-w-2xl mx-auto leading-relaxed font-light tracking-wide"
                    >
                      透过 AI 的深度视觉感知，重新发现这个充满灵性的世界。
                      只需一键拍摄，即可洞悉万物背后的科学奥秘。
                    </motion.p>
                  </div>

                  <motion.div
                    initial={{ y: 40, opacity: 0, scale: 0.9 }}
                    animate={{ y: 0, opacity: 1, scale: 1 }}
                    transition={{ delay: 1, duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
                    className="pt-8 relative"
                  >
                    <Camera onCapture={handleCapture} isProcessing={isProcessing || !!previewImage} />
                    
                    {/* Image Preview Overlay */}
                    <AnimatePresence>
                      {previewImage && (
                        <motion.div
                          initial={{ opacity: 0, scale: 0.9, y: 20 }}
                          animate={{ opacity: 1, scale: 1, y: 0 }}
                          exit={{ opacity: 0, scale: 0.9, y: 20 }}
                          className="absolute inset-0 z-30 flex flex-col items-center justify-center bg-brand-black/90 backdrop-blur-xl rounded-[3rem] p-8 border border-white/10"
                        >
                          <div className="relative w-full max-w-sm aspect-square rounded-2xl overflow-hidden mb-8 border border-white/20 shadow-2xl">
                            <img src={previewImage} alt="Preview" className="w-full h-full object-cover" />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                          </div>
                          
                          <div className="flex gap-6">
                            <button
                              onClick={cancelPreview}
                              className="w-14 h-14 rounded-full bg-white/5 border border-white/10 flex items-center justify-center hover:bg-white/10 transition-colors"
                            >
                              <X className="w-6 h-6 text-white/60" />
                            </button>
                            <button
                              onClick={confirmIdentification}
                              disabled={isProcessing}
                              className="px-10 h-14 rounded-full bg-white text-black font-display font-bold text-xs uppercase tracking-widest flex items-center gap-3 hover:scale-105 active:scale-95 transition-all shadow-[0_0_30px_rgba(255,255,255,0.3)] disabled:opacity-50 disabled:scale-100"
                            >
                              {isProcessing ? (
                                <div className="w-5 h-5 border-2 border-black/20 border-t-black rounded-full animate-spin" />
                              ) : (
                                <Check className="w-5 h-5" />
                              )}
                              {isProcessing ? "正在解析..." : "确认识别"}
                            </button>
                          </div>
                          <p className="mt-6 text-[9px] text-white/40 uppercase tracking-[0.3em]">确认后将消耗 AI 算力进行深度解析 / AI POWERED ANALYSIS</p>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </motion.div>

                  {isProcessing && (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="flex flex-col items-center gap-6 pt-12"
                    >
                      <div className="flex gap-1">
                        {[0, 1, 2].map((i) => (
                          <motion.div
                            key={i}
                            animate={{ scaleY: [1, 2, 1], opacity: [0.3, 1, 0.3] }}
                            transition={{ repeat: Infinity, duration: 1, delay: i * 0.2 }}
                            className="w-1 h-4 bg-white rounded-full"
                          />
                        ))}
                      </div>
                      <span className="text-[9px] uppercase tracking-[0.8em] font-medium text-white/40">AI 正在深度解析中... / AI ANALYZING...</span>
                    </motion.div>
                  )}
                </div>

                <motion.div 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 2 }}
                  className="absolute bottom-12 left-1/2 -translate-x-1/2 flex flex-col items-center gap-4 opacity-20"
                >
                  <span className="text-[9px] uppercase tracking-[0.4em]">向下探索 / SCROLL TO EXPLORE</span>
                  <ChevronDown className="w-4 h-4 animate-bounce" />
                </motion.div>
              </motion.section>

              {/* Content Sections */}
              <div className="bg-brand-black px-6 md:px-12 py-32 space-y-48 max-w-7xl mx-auto w-full">
                <section id="fact" className="scroll-mt-32">
                  <Suspense fallback={<Skeleton className="w-full h-[500px] rounded-[3rem]" />}>
                    <DailyFunFact />
                  </Suspense>
                </section>
                <section id="trending" className="scroll-mt-32">
                  <Suspense fallback={<Skeleton className="w-full h-[600px] rounded-[3rem]" />}>
                    <TrendingRank />
                  </Suspense>
                </section>
                <section id="quiz" className="scroll-mt-32">
                  <Suspense fallback={<Skeleton className="w-full h-[400px] rounded-[3rem]" />}>
                    <DailyQuiz />
                  </Suspense>
                </section>
              </div>
            </motion.div>
          ) : (
            <motion.section
              key="result"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="pt-32 px-6 md:px-12 pb-32 bg-brand-black"
            >
              <ResultDisplay result={result} imageUrl={currentImage!} />
              <div className="max-w-5xl mx-auto mt-24">
                <Chat subject={result.name} />
              </div>
            </motion.section>
          )}
        </AnimatePresence>
      </main>

      {/* Footer */}
      <footer className="px-6 md:px-12 py-20 flex flex-col items-center gap-12 border-t border-white/5 bg-brand-black">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-12 w-full max-w-7xl">
          <div className="space-y-6">
            <div className="flex items-center gap-3">
              <Sparkles className="w-5 h-5" />
              <span className="text-sm font-display font-bold tracking-widest uppercase">Omni-ID</span>
            </div>
            <p className="text-xs text-white/30 leading-relaxed">
              全球领先的 AI 科普智能体，致力于通过视觉智能连接人类与科学知识。
            </p>
          </div>
          <div className="space-y-6">
            <h4 className="text-[10px] uppercase tracking-[0.3em] font-bold text-white/60">产品</h4>
            <ul className="space-y-4 text-[10px] uppercase tracking-widest text-white/30">
              <li><a href="#" className="hover:text-white transition-colors">视觉识别</a></li>
              <li><a href="#" className="hover:text-white transition-colors">实时对话</a></li>
              <li><a href="#" className="hover:text-white transition-colors">知识图谱</a></li>
            </ul>
          </div>
          <div className="space-y-6">
            <h4 className="text-[10px] uppercase tracking-[0.3em] font-bold text-white/60">资源</h4>
            <ul className="space-y-4 text-[10px] uppercase tracking-widest text-white/30">
              <li><a href="#" className="hover:text-white transition-colors">博客文章</a></li>
              <li><a href="#" className="hover:text-white transition-colors">更新日志</a></li>
              <li><a href="#" className="hover:text-white transition-colors">开发文档</a></li>
            </ul>
          </div>
          <div className="space-y-6">
            <h4 className="text-[10px] uppercase tracking-[0.3em] font-bold text-white/60">法律</h4>
            <ul className="space-y-4 text-[10px] uppercase tracking-widest text-white/30">
              <li><a href="#" className="hover:text-white transition-colors">隐私政策</a></li>
              <li><a href="#" className="hover:text-white transition-colors">使用条款</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Cookie 政策</a></li>
            </ul>
          </div>
        </div>
        
        <div className="w-full h-[1px] bg-white/5" />
        
        <div className="flex flex-col md:flex-row justify-between items-center gap-6 w-full max-w-7xl">
          <div className="text-[10px] text-white/20 uppercase tracking-[0.3em]">
            © 2026 OMNI-ID LABS · ALL RIGHTS RESERVED
          </div>
          <div className="flex gap-6">
            {['X', 'YouTube', 'LinkedIn', 'Instagram'].map(social => (
              <a key={social} href="#" className="text-[10px] text-white/20 hover:text-white transition-colors uppercase tracking-widest">
                {social}
              </a>
            ))}
          </div>
        </div>
      </footer>
    </div>
  );
}
