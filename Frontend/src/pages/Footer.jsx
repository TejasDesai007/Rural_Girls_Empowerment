import React, { useState, useEffect } from "react";

const Footer = () => {
  const [hover, setHover] = useState(false);
  const [animationActive, setAnimationActive] = useState(false);

  // Trigger animation on component mount
  useEffect(() => {
    setAnimationActive(true);
  }, []);

  return (
    <footer 
      className="px-6 py-8 relative overflow-hidden"
      style={{
        background: "linear-gradient(135deg, #f3e5f5 0%, #e1bee7 50%, #ce93d8 100%)"
      }}
    >
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-0 left-0 w-full h-full">
          {[...Array(12)].map((_, i) => (
            <div 
              key={i}
              className={`absolute rounded-full bg-white opacity-70 transition-all duration-1000 ease-in-out ${animationActive ? 'scale-100' : 'scale-0'}`}
              style={{
                width: `${Math.random() * 5 + 2}rem`,
                height: `${Math.random() * 5 + 2}rem`,
                top: `${Math.random() * 100}%`,
                left: `${Math.random() * 100}%`,
                animationDelay: `${i * 0.2}s`,
                animation: "float 10s ease-in-out infinite",
                animationDelay: `${i * 0.8}s`
              }}
            />
          ))}
        </div>
      </div>

      <div className="relative z-10 max-w-4xl mx-auto text-center">
        <div 
          className={`flex justify-center gap-8 mb-4 transition-all duration-700 ${animationActive ? 'opacity-100 transform translate-y-0' : 'opacity-0 transform translate-y-8'}`}
        >
          <a 
            href="/about" 
            className="text-purple-800 hover:text-purple-900 font-medium transition-all duration-300 hover:scale-105 relative group"
            onMouseEnter={() => setHover(true)}
            onMouseLeave={() => setHover(false)}
          >
            About
            <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-purple-500 transition-all duration-300 group-hover:w-full"></span>
          </a>
          <a 
            href="/privacy-terms" 
            className="text-purple-800 hover:text-purple-900 font-medium transition-all duration-300 hover:scale-105 relative group"
          >
            Privacy Policy
            <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-purple-500 transition-all duration-300 group-hover:w-full"></span>
          </a>
        </div>

        <div className={`mt-6 transition-all duration-700 delay-200 ${animationActive ? 'opacity-100 transform translate-y-0' : 'opacity-0 transform translate-y-8'}`}>
          <p className="text-sm text-purple-900 font-medium">Built in collaboration with Google by Team DevRangers</p>
          <p className="mt-2 text-xs text-purple-800">© 2025 Rural Empower. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;