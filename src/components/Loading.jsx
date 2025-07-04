import { useState, useEffect, useRef } from 'react';

export default function Loading({ onLoadingComplete }) {
  const [progress, setProgress] = useState(0);
  const [loadingPhase, setLoadingPhase] = useState(0);
  const canvasRef = useRef(null);
  const particlesRef = useRef([]);
  const rafRef = useRef(null);

  const loadingPhrases = [
    { text: 'Initializing your journey', color: '#FF9D6C' },
    { text: 'Mapping global destinations', color: '#FFBF69' },
    { text: 'Connecting with travelers', color: '#FF6B95' },
    { text: 'Calculating adventure routes', color: '#6FDFDF' },
    { text: 'Preparing your experience', color: '#B8DE6F' }
  ];

  // Canvas animation setup
  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    let width = window.innerWidth;
    let height = window.innerHeight;
    
    // Set canvas dimensions
    const setCanvasDimensions = () => {
      width = window.innerWidth;
      height = window.innerHeight;
      canvas.width = width * window.devicePixelRatio;
      canvas.height = height * window.devicePixelRatio;
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
      ctx.scale(window.devicePixelRatio, window.devicePixelRatio);
    };
    
    setCanvasDimensions();
    window.addEventListener('resize', setCanvasDimensions);
    
    // Initialize particles
    const initParticles = () => {
      particlesRef.current = [];
      const particleCount = Math.min(Math.floor(width * height / 10000), 100); // Cap at 100 particles
      
      for (let i = 0; i < particleCount; i++) {
        particlesRef.current.push({
          x: Math.random() * width,
          y: Math.random() * height,
          baseRadius: Math.random() * 2 + 0.5, // Base size
          radius: Math.random() * 2 + 0.5,
          randomOffset: Math.random() * 10, // For async pulsing
          color: `rgba(255, 255, 255, ${Math.random() * 0.5 + 0.2})`,
          speedX: Math.random() * 0.5 - 0.25,
          speedY: Math.random() * 0.5 - 0.25,
          directionChangeTime: Math.random() * 200 + 50,
          counter: 0
        });
      }
    };
    
    initParticles();
    
    // Animation loop
    const animate = () => {
      ctx.clearRect(0, 0, width, height);
      
      // Draw particles
      particlesRef.current.forEach(particle => {
        ctx.beginPath();
        ctx.arc(particle.x, particle.y, particle.radius, 0, Math.PI * 2);
        ctx.fillStyle = particle.color;
        ctx.fill();
        
        // Update position
        particle.x += particle.speedX;
        particle.y += particle.speedY;
        
        // Boundary check
        if (particle.x < 0) particle.x = width;
        if (particle.x > width) particle.x = 0;
        if (particle.y < 0) particle.y = height;
        if (particle.y > height) particle.y = 0;
        
        // Occasionally change direction
        particle.counter++;
        if (particle.counter >= particle.directionChangeTime) {
          particle.speedX = Math.random() * 0.5 - 0.25;
          particle.speedY = Math.random() * 0.5 - 0.25;
          particle.counter = 0;
        }
        
        // Add subtle size pulsing
        particle.radius = particle.baseRadius + Math.sin(Date.now() * 0.001 + particle.randomOffset) * 0.5;
      });
      
      // Draw connections between nearby particles
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.05)';
      ctx.lineWidth = 0.3;
      
      for (let i = 0; i < particlesRef.current.length; i++) {
        for (let j = i + 1; j < particlesRef.current.length; j++) {
          const p1 = particlesRef.current[i];
          const p2 = particlesRef.current[j];
          const dx = p1.x - p2.x;
          const dy = p1.y - p2.y;
          const distance = Math.sqrt(dx * dx + dy * dy);
          
          if (distance < 100) {
            ctx.beginPath();
            ctx.moveTo(p1.x, p1.y);
            ctx.lineTo(p2.x, p2.y);
            ctx.stroke();
          }
        }
      }
      
      rafRef.current = requestAnimationFrame(animate);
    };
    
    animate();
    
    // Cleanup
    return () => {
      window.removeEventListener('resize', setCanvasDimensions);
      if (rafRef.current) {
        cancelAnimationFrame(rafRef.current);
      }
    };
  }, []);
  
  // Progress and loading phases
  useEffect(() => {
    // Set favicon dynamically
    const link = document.querySelector("link[rel~='icon']") || document.createElement('link');
    link.rel = 'icon';
    link.href = '/assets/images/NomadNovalogo.jpg';
    document.head.appendChild(link);
    
    const progressIncrement = 3.5; 
    
    const interval = setInterval(() => {
      setProgress(prev => {
        const newProgress = prev + (progressIncrement + (Math.random() * 0.5));
        if (newProgress >= 100) {
          clearInterval(interval);
          return 100;
        }
        return newProgress;
      });
    }, 150);
    
    const phaseInterval = setInterval(() => {
      setLoadingPhase(prev => (prev + 1) % loadingPhrases.length);
    }, 2500);
    
    const completeTimeout = setTimeout(() => {
      setProgress(100);
      if (onLoadingComplete) {
        onLoadingComplete();
      }
    }, 4500);
    
    return () => {
      clearInterval(interval);
      clearInterval(phaseInterval);
      clearTimeout(completeTimeout);
    };
  }, [onLoadingComplete]);

  useEffect(() => {
    if (progress >= 100 && onLoadingComplete) {
      const timer = setTimeout(() => {
        onLoadingComplete();
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [progress, onLoadingComplete]);
  
  const segments = 20;
  const segmentWidth = 100 / segments;
  const filledSegments = Math.floor(progress / segmentWidth);
  
  return (
    <div className="fixed inset-0 bg-gradient-to-b from-gray-900 via-[#0f172a] to-black flex flex-col items-center justify-center z-50 overflow-hidden">
      <canvas 
        ref={canvasRef} 
        className="absolute inset-0 z-0"
      />
      
      <div className="absolute inset-0 bg-gradient-radial from-transparent to-black opacity-70 z-10" />
      
      <div className="relative z-20 flex flex-col items-center justify-center px-6">
        <div className="absolute w-40 h-40 rounded-full bg-gradient-to-r from-[#FF9D6C]/20 via-[#FFBF69]/20 to-[#FF6B95]/20 blur-2xl animate-pulse-slow" />
        
        <div className="mb-12 relative group perspective">
          <div className="absolute -inset-6 bg-gradient-to-r from-[#FF9D6C]/10 to-[#FF6B95]/10 rounded-full blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-1000" />
          <div className="relative transform transition-transform duration-1000 hover:rotate-y-12 animate-float">
            <img 
              src="/assets/images/NomadNovalogo.jpg" 
              alt="NomadNova Logo" 
              className="h-32 w-auto rounded-full shadow-xl shadow-[#FCCB6E]/20 ring-2 ring-white/10"
            />
            <div className="absolute inset-0 rounded-full bg-gradient-to-b from-white/30 to-transparent opacity-70" />
            <div className="absolute -inset-1 border border-white/10 rounded-full opacity-50" />
          </div>
        </div>
        
        <h2 className="text-6xl font-extrabold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-[#FF9D6C] via-[#FFBF69] to-[#FF6B95] mb-12 animate-gradient-x">
          NomadNova
        </h2>
        
        <div className="w-80 flex space-x-1 mb-3">
          {[...Array(segments)].map((_, i) => (
            <div 
              key={i} 
              className={`h-1.5 flex-1 rounded-full transition-all duration-300 ${
                i < filledSegments 
                  ? 'bg-gradient-to-r from-[#FF9D6C] to-[#FF6B95]' 
                  : 'bg-gray-800'
              }`}
              style={{
                transform: i < filledSegments ? 'scaleY(1.2)' : 'scaleY(1)',
                opacity: i < filledSegments ? 1 : 0.5,
                boxShadow: i < filledSegments ? '0 0 8px rgba(255, 157, 108, 0.5)' : 'none',
              }}
            />
          ))}
        </div>
        
        <p
          className="text-2xl font-semibold text-white text-center tracking-wide max-w-lg h-12"
          aria-live="polite"
        >
          {loadingPhrases[loadingPhase].text}
        </p>
      </div>
      
      <style>{`
        .animate-pulse-slow {
          animation: pulse 5s ease-in-out infinite;
        }
        .animate-float {
          animation: float 6s ease-in-out infinite;
        }
        @keyframes pulse {
          0%, 100% { opacity: 0.3; }
          50% { opacity: 1; }
        }
        @keyframes float {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-10px); }
        }
        .animate-gradient-x {
          background-size: 200% 100%;
          animation: gradient-x 4s ease infinite;
        }
        @keyframes gradient-x {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }
        .perspective {
          perspective: 600px;
        }
        .rotate-y-12 {
          transform-style: preserve-3d;
          transform: rotateY(12deg);
        }
      `}</style>
    </div>
  );
}
