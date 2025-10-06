import React from 'react';
import BackgroundImage from '../assets/BackgroundStart.jpg';
import NasaLogo from '../assets/nasalogo.png';

const WelcomeOverlay = ({ onStart, isVisible }) => {
  return (
    <div 
      className={`welcome-overlay ${isVisible ? 'visible' : 'hidden'}`}
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100vw',
        height: '100vh',
        zIndex: 9999,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        transition: 'transform 0.8s ease-in-out',
        transform: isVisible ? 'translateY(0)' : 'translateY(-100%)'
      }}
    >
      <div 
        className="absolute inset-0 bg-black"
        style={{ opacity: 0.7 }}
      />
      
      <div 
        className="absolute inset-0"
        style={{
          backgroundImage: `url(${BackgroundImage})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat',
          opacity: 0.3
        }}
      />
      
      <div className="absolute top-3 left-3 sm:top-6 sm:left-6 z-20 flex space-x-2 sm:space-x-4">
        <a
          href="https://github.com/andrlpz/NASA-Space-Apps-Challenge-Meteor-Madness"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center justify-center w-8 h-8 sm:w-12 sm:h-12 bg-white/10 backdrop-blur-sm rounded-full hover:bg-white/20 transition-all duration-300 hover:scale-110"
          title="View on GitHub"
        >
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="currentColor"
            className="text-white sm:w-6 sm:h-6"
          >
            <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
          </svg>
        </a>
        
        <a
          href="https://www.spaceappschallenge.org/2025/challenges/meteor-madness/"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center justify-center w-8 h-8 sm:w-12 sm:h-12 bg-white/10 backdrop-blur-sm rounded-full hover:bg-white/20 transition-all duration-300 hover:scale-110"
          title="NASA Space Apps Challenge"
        >
          <img
            src={NasaLogo}
            alt="NASA Logo"
            className="w-5 h-5 sm:w-8 sm:h-8 object-contain"
          />
        </a>
      </div>

      <div className="relative z-10 text-center text-white px-4 sm:px-8">
        <h1 
          className="welcome-title mb-6 sm:mb-8"
          style={{
            fontFamily: 'FutureZ, Arial, sans-serif',
            fontSize: 'clamp(2rem, 8vw, 6rem)',
            fontWeight: 'bold',
            textShadow: '2px 2px 4px rgba(0, 0, 0, 0.8)',
            marginBottom: '1.5rem',
            letterSpacing: '1px',
            lineHeight: '1.1'
          }}
        >
          Asteroid Impact Simulator
        </h1>
        
        <button
          onClick={onStart}
          className="welcome-button"
          style={{
            fontFamily: 'FutureZ, Arial, sans-serif',
            fontSize: 'clamp(1.2rem, 4vw, 2.5rem)',
            padding: 'clamp(0.75rem, 2vw, 1rem) clamp(2rem, 6vw, 3rem)',
            backgroundColor: 'rgba(255, 255, 255, 0.1)',
            border: '2px solid rgba(255, 255, 255, 0.3)',
            borderRadius: '8px',
            color: 'white',
            cursor: 'pointer',
            transition: 'all 0.3s ease',
            backdropFilter: 'blur(10px)',
            textShadow: '1px 1px 2px rgba(0, 0, 0, 0.8)',
            letterSpacing: '1px'
          }}
          onMouseEnter={(e) => {
            e.target.style.backgroundColor = 'rgba(255, 255, 255, 0.2)';
            e.target.style.borderColor = 'rgba(255, 255, 255, 0.5)';
            e.target.style.transform = 'scale(1.05)';
          }}
          onMouseLeave={(e) => {
            e.target.style.backgroundColor = 'rgba(255, 255, 255, 0.1)';
            e.target.style.borderColor = 'rgba(255, 255, 255, 0.3)';
            e.target.style.transform = 'scale(1)';
          }}
        >
          Start
        </button>
      </div>
    </div>
  );
};

export default WelcomeOverlay;