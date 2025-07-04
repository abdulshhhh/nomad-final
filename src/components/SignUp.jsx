import { useState, useEffect } from 'react';

const slides = [
  {
    image: '/assets/images/Signupslider1.jpeg',
    title: 'Join our community',
    subtitle: 'Connect with travelers from around the world.',
  },
  {
    image: '/assets/images/Signupslider2.jpeg',
    title: 'Create your profile',
    subtitle: 'Share your travel preferences and interests.',
  },
  {
    image: '/assets/images/Signupslider3.jpeg',
    title: 'Start your journey',
    subtitle: 'Find your next adventure with like-minded travelers.',
  },
];

export default function SignUp({ onSignUpSuccess, onLoginClick, onBackToLanding }) {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    password: ''
  });
  const [agreed, setAgreed] = useState(false);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleCheckboxChange = (e) => {
    setAgreed(e.target.checked);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.fullName || !formData.email || !formData.password) {
      alert('Please fill in all fields');
      return;
    }

    if (!agreed) {
      alert('Please agree to the terms and conditions');
      return;
    }

    try {
      const response = await fetch('http://localhost:5000/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (response.ok) {
        // Note: localStorage is not available in this environment
        // localStorage.setItem('authToken', data.token);
        alert('Account created successfully!');
        onSignUpSuccess && onSignUpSuccess();
      } else {
        alert(data.message || 'Something went wrong!');
      }
    } catch (error) {
      console.error('Signup failed:', error);
      alert('Failed to create account. Please try again later.');
    }
  };

  return (
    <div className="min-h-screen w-full flex flex-col md:flex-row bg-gradient-to-r from-[#f6c28b] via-[#e1a87e] to-[#c47d5e] overflow-hidden md:overflow-hidden sm:overflow-y-auto">
      {/* Left slider section */}
      <div className="w-full md:w-1/2 h-[655px] sm:h-[400px] md:h-auto relative overflow-hidden">
        {slides.map((slide, index) => (
          <div
            key={index}
            className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${
              index === currentSlide ? 'opacity-100 z-10' : 'opacity-0 z-0'
            }`}
          >
            <img
              src={`${slide.image}?auto=format&fit=crop&w=900&q=80`}
              alt={slide.title}
              className="w-full h-full object-cover transform scale-105 transition-transform duration-10000 ease-in-out"
              style={{ transform: index === currentSlide ? 'scale(1.05)' : 'scale(1)' }}
              loading="lazy"
            />
            <div className="absolute inset-0 bg-gradient-to-b from-black/60 to-black/20 flex flex-col justify-center items-start p-6 sm:p-10 md:p-16 text-white">
              <h2 className="text-2xl sm:text-4xl md:text-5xl font-extrabold mb-3 drop-shadow-lg transform translate-y-4 opacity-0 transition-all duration-1000 ease-out"
                  style={{ transform: index === currentSlide ? 'translateY(0)' : 'translateY(4rem)', opacity: index === currentSlide ? 1 : 0 }}>
                {slide.title}
              </h2>
              <p className="text-base sm:text-lg md:text-xl max-w-sm drop-shadow-md transform translate-y-4 opacity-0 transition-all duration-1000 delay-300 ease-out"
                 style={{ transform: index === currentSlide ? 'translateY(0)' : 'translateY(4rem)', opacity: index === currentSlide ? 1 : 0 }}>
                {slide.subtitle}
              </p>
            </div>
          </div>
        ))}

        {/* Slide indicators */}
        <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 flex space-x-2 z-20">
          {slides.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentSlide(index)}
              className={`w-2 h-2 rounded-full transition-all duration-300 ${
                index === currentSlide ? 'bg-white w-6' : 'bg-white/50'
              }`}
              aria-label={`Go to slide ${index + 1}`}
            />
          ))}
        </div>

        {/* Swipe Up Indicator - Mobile Only */}
        <div className="absolute bottom-4 w-full flex justify-center sm:hidden z-20">
          <div className="flex flex-col items-center text-white text-sm animate-bounce">
            <span className="mb-1">Swipe Up</span>
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 10l7-7 7 7" />
            </svg>
          </div>
        </div>
      </div>

      {/* Right signup section */}
      <div className="w-full md:w-1/2 flex items-center justify-center p-6 sm:p-10 md:p-16 relative">
        {/* Decorative elements */}
        <div className="absolute top-10 right-10 w-20 h-20 bg-blue-400/20 rounded-full blur-xl"></div>
        <div className="absolute bottom-10 left-10 w-32 h-32 bg-yellow-400/20 rounded-full blur-xl"></div>

        <div className="w-full max-w-md bg-white/10 backdrop-blur-md rounded-3xl p-6 sm:p-10 shadow-2xl border border-white/20 animate-fade-in relative overflow-hidden group">
          {/* Glass reflection effect */}
          <div className="absolute -inset-[500px] bg-gradient-to-r from-transparent via-white/10 to-transparent -rotate-45 translate-x-[1000px] group-hover:translate-x-[-1000px] transition-transform duration-1500 ease-in-out"></div>

          {/* Back button */}
          {onBackToLanding && (
            <button
              onClick={onBackToLanding}
              className="absolute top-4 left-4 p-2 rounded-full bg-white/10 hover:bg-white/20 transition-colors text-white"
              aria-label="Back to landing page"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
          )}

          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-white mb-1 text-center drop-shadow-lg">
            Join
          </h2>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-center text-transparent bg-clip-text bg-gradient-to-r from-[#204231] via-[#5E5854] to-[#204231]">
            NomadNova
          </h2>

          <p className="text-white mt-3 mb-8 text-center font-medium">
            Create an account to start your adventure
          </p>

          <form className="space-y-5" onSubmit={handleSubmit}>
            <div className="relative">
              <input
                type="text"
                name="fullName"
                value={formData.fullName}
                onChange={handleChange}
                placeholder="Full Name"
                className="w-full px-5 py-3 rounded-xl border border-transparent bg-white/90 focus:outline-none focus:ring-2 focus:ring-[#EC8E3D] focus:ring-opacity-80 text-gray-900 font-medium transition-all duration-300 placeholder-gray-500"
                required
              />
              <div className="absolute inset-0 rounded-xl border border-white/30 pointer-events-none"></div>
            </div>

            <div className="relative">
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="Email Address"
                className="w-full px-5 py-3 rounded-xl border border-transparent bg-white/90 focus:outline-none focus:ring-2 focus:ring-[#EC8E3D] focus:ring-opacity-80 text-gray-900 font-medium transition-all duration-300 placeholder-gray-500"
                required
              />
              <div className="absolute inset-0 rounded-xl border border-white/30 pointer-events-none"></div>
            </div>

            <div className="relative">
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="Password"
                className="w-full px-5 py-3 rounded-xl border border-transparent bg-white/90 focus:outline-none focus:ring-2 focus:ring-[#EC8E3D] focus:ring-opacity-80 text-gray-900 font-medium transition-all duration-300 placeholder-gray-500"
                required
              />
              <div className="absolute inset-0 rounded-xl border border-white/30 pointer-events-none"></div>
            </div>

            {/* Terms and checkbox - MOVED ABOVE BUTTON */}
            <div className="flex items-start mb-2 gap-3">
              <div className="relative flex-shrink-0 mt-1">
                <input
                  type="checkbox"
                  id="agree-terms-signup"
                  checked={agreed}
                  onChange={handleCheckboxChange}
                  className="w-5 h-5 bg-white/20 border-2 border-white/50 rounded appearance-none cursor-pointer checked:bg-[#FCCB6E] checked:border-[#FCCB6E] focus:outline-none focus:ring-2 focus:ring-[#FCCB6E] focus:ring-offset-2 focus:ring-offset-transparent transition-all duration-200"
                />
                {/* Custom checkmark */}
                <div className={`absolute inset-0 flex items-center justify-center pointer-events-none transition-opacity duration-200 ${agreed ? 'opacity-100' : 'opacity-0'}`}>
                  <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                </div>
              </div>
              <label htmlFor="agree-terms-signup" className="text-white/80 text-xs cursor-pointer leading-tight">
                By signing up, you agree to our{' '}
                <a href="#" className="underline text-yellow-400 hover:text-yellow-300 font-semibold transition-colors">
                  Terms and Service
                </a>{' '}and{' '}
                <a href="#" className="underline text-yellow-400 hover:text-yellow-300 font-semibold transition-colors">
                  Privacy Policy
                </a>.
              </label>
            </div>

            <button
              type="submit"
              className={`w-full py-3 rounded-xl font-semibold shadow-lg transform transition-all duration-300 ${
                agreed 
                  ? 'bg-gradient-to-r from-[#EC8E3D] to-[#FCCB6E] hover:from-[#FCCB6E] hover:to-[#EC8E3D] text-white hover:shadow-xl hover:-translate-y-1 cursor-pointer' 
                  : 'bg-gray-400/50 text-gray-300 cursor-not-allowed'
              }`}
              disabled={!agreed}
            >
              Create Account
            </button>
          </form>

          <div className="flex items-center my-6">
            <hr className="flex-grow border-white/30" />
            <span className="mx-3 text-white text-sm">or</span>
            <hr className="flex-grow border-white/30" />
          </div>

          <button 
            className="w-full flex items-center justify-center bg-white hover:bg-gray-100 transition-all duration-300 rounded-xl py-3 mb-5 shadow-md hover:shadow-lg transform hover:-translate-y-1" 
            onClick={() => window.location.href = 'http://localhost:5000/api/auth/google'}
          >
            <img
              src="\assets\images\Google__G__logo.svg.webp"
              alt="Google icon"
              className="w-6 h-6 mr-3"
            />
            <span className="text-gray-800 font-semibold">Sign up with Google</span>
          </button>

          <div className="mt-6 text-center">
            <p className="text-white text-sm">
              Already have an account?{' '}
              <button
                onClick={() => onLoginClick()}
                className="text-[#FCCB6E] hover:text-white font-bold transition-colors relative group"
              >
                Login
                <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-[#FCCB6E] group-hover:w-full transition-all duration-300"></span>
              </button>
            </p>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes fadeIn {
          0% { opacity: 0; transform: translateY(10px);}
          100% { opacity: 1; transform: translateY(0);}
        }
        .animate-fade-in {
          animation: fadeIn 0.8s ease forwards;
        }
      `}</style>
    </div>
  );
}