import React from 'react';
import BackgroundImage from '../assets/BackgroundStart.jpg';

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
      {/* Darkened background */}
      <div 
        className="absolute inset-0 bg-black"
        style={{ opacity: 0.7 }}
      />
      
      {/* Background image with opacity */}
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
      
      {/* Content */}
      <div className="relative z-10 text-center text-white">
        <h1 
          className="welcome-title mb-8"
          style={{
            fontFamily: 'FutureZ, Arial, sans-serif',
            fontSize: 'clamp(3rem, 8vw, 6rem)',
            fontWeight: 'bold',
            textShadow: '2px 2px 4px rgba(0, 0, 0, 0.8)',
            marginBottom: '2rem',
            letterSpacing: '2px'
          }}
        >
          Asteroid Impact Simulator
        </h1>
        
        <button
          onClick={onStart}
          className="welcome-button"
          style={{
            fontFamily: 'FutureZ, Arial, sans-serif',
            fontSize: 'clamp(1.5rem, 4vw, 2.5rem)',
            padding: '1rem 3rem',
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