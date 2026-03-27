import React, { useRef, useState } from 'react';
import { Camera as CameraIcon, Upload, X, Sparkles } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface CameraProps {
  onCapture: (base64: string) => void;
  isProcessing: boolean;
}

export const Camera: React.FC<CameraProps> = ({ onCapture, isProcessing }) => {
  const [showCamera, setShowCamera] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { facingMode: 'environment', width: { ideal: 1920 }, height: { ideal: 1080 } } 
      });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        setShowCamera(true);
      }
    } catch (err) {
      console.error("Camera error:", err);
      alert("无法访问摄像头，请检查权限。");
    }
  };

  const stopCamera = () => {
    if (videoRef.current?.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      stream.getTracks().forEach(track => track.stop());
    }
    setShowCamera(false);
  };

  const capturePhoto = () => {
    if (videoRef.current) {
      const canvas = document.createElement('canvas');
      // Resize for optimization: max 1024px
      const MAX_SIZE = 1024;
      let width = videoRef.current.videoWidth;
      let height = videoRef.current.videoHeight;
      
      if (width > height) {
        if (width > MAX_SIZE) {
          height *= MAX_SIZE / width;
          width = MAX_SIZE;
        }
      } else {
        if (height > MAX_SIZE) {
          width *= MAX_SIZE / height;
          height = MAX_SIZE;
        }
      }
      
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext('2d');
      ctx?.drawImage(videoRef.current, 0, 0, width, height);
      // Lower quality for faster transmission and less API occupancy
      const base64 = canvas.toDataURL('image/jpeg', 0.7).split(',')[1];
      onCapture(base64);
      stopCamera();
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement('canvas');
          const MAX_SIZE = 1024;
          let width = img.width;
          let height = img.height;
          
          if (width > height) {
            if (width > MAX_SIZE) {
              height *= MAX_SIZE / width;
              width = MAX_SIZE;
            }
          } else {
            if (height > MAX_SIZE) {
              width *= MAX_SIZE / height;
              height = MAX_SIZE;
            }
          }
          
          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          ctx?.drawImage(img, 0, 0, width, height);
          const base64 = canvas.toDataURL('image/jpeg', 0.7).split(',')[1];
          onCapture(base64);
        };
        img.src = reader.result as string;
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="flex flex-col items-center gap-12 w-full max-w-4xl mx-auto">
      <div className="flex flex-col md:flex-row gap-8 w-full">
        {/* Camera Trigger */}
        <motion.button
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          whileHover={{ 
            y: -8, 
            scale: 1.02,
            boxShadow: "0 20px 40px rgba(0,0,0,0.4), 0 0 20px rgba(255,255,255,0.1)" 
          }}
          whileTap={{ scale: 0.96 }}
          onClick={startCamera}
          disabled={isProcessing}
          className="flex-1 group relative aspect-[4/3] md:aspect-square rounded-[2.5rem] overflow-hidden glass-panel flex flex-col items-center justify-center gap-6 transition-all duration-500 disabled:opacity-50"
        >
          <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
          <div className="scan-line opacity-0 group-hover:opacity-100" />
          <div className="w-20 h-20 rounded-full border border-white/10 flex items-center justify-center relative group-hover:border-white/40 transition-all duration-500">
            <div className="absolute inset-0 rounded-full border-t-2 border-white/40 animate-spin duration-[3s] opacity-0 group-hover:opacity-100" />
            <CameraIcon className="w-8 h-8 text-white/40 group-hover:text-white group-hover:scale-110 transition-all duration-500" />
          </div>
          <div className="text-center space-y-2 z-10">
            <h3 className="text-sm font-display font-bold tracking-[0.3em] uppercase group-hover:tracking-[0.4em] transition-all duration-500">开启视觉感知</h3>
            <p className="text-[10px] text-white/30 uppercase tracking-widest">使用摄像头实时拍摄识别</p>
          </div>
        </motion.button>

        {/* Upload Trigger */}
        <motion.button
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
          whileHover={{ 
            y: -8, 
            scale: 1.02,
            boxShadow: "0 20px 40px rgba(0,0,0,0.4), 0 0 20px rgba(255,255,255,0.1)" 
          }}
          whileTap={{ scale: 0.96 }}
          onClick={() => fileInputRef.current?.click()}
          disabled={isProcessing}
          className="flex-1 group relative aspect-[4/3] md:aspect-square rounded-[2.5rem] overflow-hidden glass-panel flex flex-col items-center justify-center gap-6 transition-all duration-500 disabled:opacity-50"
        >
          <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
          <div className="scan-line opacity-0 group-hover:opacity-100" />
          <div className="w-20 h-20 rounded-full border border-white/10 flex items-center justify-center group-hover:border-white/40 transition-all duration-500">
            <Upload className="w-8 h-8 text-white/40 group-hover:text-white group-hover:scale-110 transition-all duration-500" />
          </div>
          <div className="text-center space-y-2 z-10">
            <h3 className="text-sm font-display font-bold tracking-[0.3em] uppercase group-hover:tracking-[0.4em] transition-all duration-500">上传本地图像</h3>
            <p className="text-[10px] text-white/30 uppercase tracking-widest">从相册选择已有照片</p>
          </div>
        </motion.button>
      </div>

      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileUpload}
        accept="image/*"
        className="hidden"
      />

      <AnimatePresence>
        {showCamera && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] bg-black flex flex-col items-center justify-center"
          >
            <video
              ref={videoRef}
              autoPlay
              playsInline
              className="w-full h-full object-cover grayscale-[0.2] contrast-[1.1]"
            />
            
            {/* Scanning UI Overlay */}
            <div className="absolute inset-0 pointer-events-none">
              <div className="absolute top-12 left-12 w-12 h-12 border-t-2 border-l-2 border-white/40" />
              <div className="absolute top-12 right-12 w-12 h-12 border-t-2 border-r-2 border-white/40" />
              <div className="absolute bottom-12 left-12 w-12 h-12 border-b-2 border-l-2 border-white/40" />
              <div className="absolute bottom-12 right-12 w-12 h-12 border-b-2 border-r-2 border-white/40" />
              
              <motion.div 
                animate={{ top: ['0%', '100%', '0%'] }}
                transition={{ repeat: Infinity, duration: 4, ease: "linear" }}
                className="absolute left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-white/50 to-transparent z-10"
              />

              <div className="absolute top-12 left-1/2 -translate-x-1/2 px-6 py-2 rounded-full bg-black/40 backdrop-blur-md border border-white/10 flex items-center gap-3">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                <span className="text-[10px] uppercase tracking-[0.3em] font-medium">Vision Agent Active</span>
              </div>
            </div>

            <div className="absolute bottom-16 flex gap-12 items-center">
              <button
                onClick={stopCamera}
                className="p-5 rounded-full bg-black/40 backdrop-blur-md border border-white/10 hover:bg-white/10 transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
              
              <button
                onClick={capturePhoto}
                className="group relative"
              >
                <div className="absolute inset-0 bg-white/20 blur-2xl rounded-full scale-150 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                <div className="w-24 h-24 rounded-full border-4 border-white flex items-center justify-center bg-transparent hover:bg-white transition-all duration-500 active:scale-90">
                  <div className="w-20 h-20 rounded-full border border-black/10 group-hover:border-black/20" />
                </div>
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
