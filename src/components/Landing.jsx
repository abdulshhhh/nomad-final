import { useNavigate } from 'react-router-dom';
import { useState, useEffect, useMemo } from 'react';
import Loading from './Loading';

const SLIDE_INTERVAL = 5000;
const BACKGROUNDS = [
  "/assets/images/Welcomeslider1.jpeg",
  "/assets/images/Welcomeslider2.jpeg", 
  "/assets/images/Welcomeslider3.jpeg",
  "/assets/images/Welcomeslider4.jpeg"
];

const useBackgroundSlider = (backgrounds, interval) => {
  const [activeLayer, setActiveLayer] = useState(true);
  const [bg1, setBg1] = useState(0);
  const [bg2, setBg2] = useState(1);

  useEffect(() => {
    const timer = setInterval(() => {
      setActiveLayer(prev => {
        const isActive = !prev;
        if (isActive) {
          setBg2(prev => (prev + 1) % backgrounds.length);
        } else {
          setBg1(prev => (prev + 1) % backgrounds.length);
        }
        return isActive;
      });
    }, interval);

    return () => clearInterval(timer);
  }, [backgrounds.length, interval]);

  return { activeLayer, bg1, bg2 };
};

export default function Landing() {
  const navigate = useNavigate();
  const { activeLayer, bg1, bg2 } = useBackgroundSlider(BACKGROUNDS, SLIDE_INTERVAL);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 2000);
    return () => clearTimeout(timer);
  }, []);

  const backgroundStyle1 = useMemo(() => ({ 
    backgroundImage: `url(${BACKGROUNDS[bg1]})` 
  }), [bg1]);

  const backgroundStyle2 = useMemo(() => ({ 
    backgroundImage: `url(${BACKGROUNDS[bg2]})` 
  }), [bg2]);


  if (loading) return <Loading onLoadingComplete={() => setLoading(false)} />;

  return (
    <div className="relative min-h-screen text-white overflow-hidden">
      <div
        className={`absolute inset-0 bg-cover bg-center transition-opacity duration-1000 ${
          activeLayer ? 'opacity-100 z-10' : 'opacity-0 z-0'
        }`}
        style={backgroundStyle1}
      />
      <div
        className={`absolute inset-0 bg-cover bg-center transition-opacity duration-1000 ${
          !activeLayer ? 'opacity-100 z-10' : 'opacity-0 z-0'
        }`}
        style={backgroundStyle2}
      />
      
      <div className="relative z-20 flex flex-col items-center justify-center min-h-screen text-center px-4 bg-black/45 backdrop-blur-[1px]">
        <h1 className="text-4xl font-extrabold text-white-400 mb-2 mt-6">
          Your Journey should be as exciting as your <br />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-yellow-600 to-green-500">
            Destination
          </span>
        </h1>
        
        <h2 className="text-5xl mt-1 font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-[#FCCB6E] to-[#EE9C8F]">
          NomadNova
        </h2>
        
        <p className="text-2xl font-southmind text-gray-300 mt-2 max-w-xl">
          "Unleash the Nomad in You"
        </p>

        <div className="flex gap-4 mt-8">
            <>
              <button
                onClick={() => navigate('/login')}
                className="font-cinzel bg-[#EC8E3D] text-white px-6 py-3 rounded-full shadow-lg hover:bg-yellow-600 transition duration-300"
              >
                Forge your Journey
              </button>
              <button
                onClick={() => navigate('/signup')}
                className="font-cinzel bg-transparent border-2 border-white hover:bg-white/10 transition duration-300 px-8 py-3 rounded-full text-white"
              >
                Sign Up
              </button>
            </>
        </div>
      </div>
    </div>
  );
}