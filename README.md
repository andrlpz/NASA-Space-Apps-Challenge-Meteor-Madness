# 🌍 Meteor Madness - Asteroid Impact Simulator

![Meteor Madness](https://img.shields.io/badge/NASA%20Space%20Apps-Challenge%202024-blue)
![React](https://img.shields.io/badge/React-19.1.1-61dafb)
![Vite](https://img.shields.io/badge/Vite-5.2-646cff)
![License](https://img.shields.io/badge/License-MIT-green)

**An interactive asteroid impact simulator developed for the NASA Space Apps Challenge 2024**

Meteor Madness allows users to explore near-Earth objects (NEOs) and simulate potential asteroid impacts on Earth in real-time. Experience the power of space science through an immersive 3D/2D interactive experience that combines real NASA data with advanced impact modeling.

## 🚀 Live Demo

[🌍 **Try Meteor Madness Now**](https://your-demo-link.com) _(Replace with actual deployment URL)_

## 📋 Table of Contents

- [Features](#-features)
- [Technologies Used](#️-technologies-used)
- [Installation](#-installation)
- [Usage](#-usage)
- [Project Structure](#-project-structure)
- [API Integration](#-api-integration)
- [Configuration](#️-configuration)
- [Contributing](#-contributing)
- [NASA Space Apps Challenge](#-nasa-space-apps-challenge)
- [Team](#-team)
- [License](#-license)

## ✨ Features

### 🎯 **Core Simulation Features**
- **Real NASA Data Integration**: Live Near-Earth Object (NEO) data from NASA's JPL database
- **Interactive Impact Simulation**: Click anywhere on Earth to simulate asteroid impacts
- **Dynamic Surface Detection**: Automatic land/water detection with country identification
- **Real-time Consequence Modeling**: Calculate kinetic energy, seismic effects, and air blast parameters

### 🌍 **Interactive Mapping**
- **Dual Map Modes**: Seamless switching between 3D globe and 2D satellite views
- **Smart Zoom Detection**: Automatic mode switching based on zoom level
- **Country Code Detection**: Precise 2-letter ISO country code extraction for impact locations
- **Visual Impact Effects**: Animated meteor trails and impact visualizations

### 🎮 **User Experience**
- **Welcome Screen**: Immersive entry experience with NASA and GitHub integration
- **Multi-language Support**: English, Spanish, and French translations
- **Responsive Design**: Optimized for desktop and mobile devices
- **Dark/Light Mode**: Toggle between viewing modes
- **Shareable URLs**: Generate and share specific simulation states

### 📊 **Asteroid Database**
- **Comprehensive NEO Catalog**: Browse and select from NASA's asteroid database
- **Detailed Asteroid Information**: Diameter, velocity, trajectory, and hazard classification
- **Custom Parameters**: Adjust diameter and velocity for hypothetical scenarios
- **Sorting and Filtering**: Organize asteroids by date, size, and threat level

### 📈 **Impact Analysis**
- **Threat Level Assessment**: Automated risk categorization (Low, Monitoring Required, High)
- **Mitigation Recommendations**: Suggested actions based on impact severity
- **Scientific Calculations**: Physics-based impact modeling and consequence prediction
- **Export Capabilities**: Share simulation results and parameters

## 🛠️ Technologies Used

### **Frontend Framework**
- **React 19.1.1** - Modern component-based UI framework
- **Vite 5.2** - Fast build tool and development server
- **Redux Toolkit** - State management for complex application state
- **React Router DOM** - Client-side routing and navigation

### **3D Graphics & Visualization**
- **Three.js** - 3D graphics rendering and animations
- **React Three Fiber** - React renderer for Three.js
- **React Three Drei** - Useful helpers for R3F

### **Mapping & Geolocation**
- **Leaflet** - Interactive 2D mapping library
- **React Leaflet** - React components for Leaflet maps
- **Leaflet.heat** - Heatmap visualizations
- **Geoapify API** - Reverse geocoding and surface detection

### **Styling & UI**
- **Tailwind CSS 4.1.12** - Utility-first CSS framework
- **Lucide React** - Modern icon library
- **Custom CSS animations** - Smooth transitions and effects

### **Internationalization**
- **i18next** - Internationalization framework
- **react-i18next** - React bindings for i18next
- **Browser language detection** - Automatic locale detection

### **Development Tools**
- **ESLint** - Code linting and style enforcement
- **TypeScript support** - Type checking and better IDE experience
- **Hot Module Replacement** - Instant development feedback

## 🚀 Installation

### Prerequisites
- **Node.js** (v16 or higher)
- **npm** or **yarn** package manager
- **Git** for version control

### Quick Start

1. **Clone the repository**
```bash
git clone https://github.com/andrlpz/NASA-Space-Apps-Challenge-Meteor-Madness.git
cd NASA-Space-Apps-Challenge-Meteor-Madness
```

2. **Install dependencies**
```bash
npm install
```

3. **Set up environment variables**
```bash
# Create .env file in root directory
echo "VITE_NASA_API_KEY=your_nasa_api_key_here" > .env
```

4. **Start development server**
```bash
npm run dev
```

5. **Open your browser**
Navigate to `http://localhost:5173` to see the application running.

### Production Build

```bash
# Build for production
npm run build

# Preview production build
npm run preview
```

## 🎮 Usage

### Getting Started

1. **Welcome Screen**: Click "Start Simulation" to enter the main application
2. **Select an Asteroid**: 
   - Browse the asteroid list on the right sidebar
   - Click on any asteroid to select it for simulation
   - View detailed information including size, velocity, and threat level

3. **Simulate Impact**:
   - Click anywhere on the Earth map to simulate an asteroid impact
   - The system automatically detects if you clicked on land or water
   - For land impacts, the country is automatically identified

4. **View Results**:
   - Examine predicted consequences in the left sidebar
   - Review threat level and mitigation recommendations
   - Share your simulation using the generated URL

### Advanced Features

#### **Custom Asteroid Parameters**
```javascript
// Access parameter sliders
1. Toggle "Adjust Parameters" in the sidebar
2. Modify diameter (meters) and velocity (km/s)
3. Click on map to simulate with custom values
```

#### **Map Controls**
- **Zoom In/Out**: Mouse wheel or touch gestures
- **Pan**: Click and drag
- **Mode Switch**: Automatic 3D ↔ 2D based on zoom level
- **Reset View**: Click the reset button in controls

#### **Language Support**
Switch between English, Spanish, and French using the language selector in the top navigation.

## 📁 Project Structure

```
├── public/
│   ├── assets/
│   │   └── locales/           # Translation files
│   │       ├── en/
│   │       ├── es/
│   │       └── fr/
│   └── vite.svg
├── src/
│   ├── Components/            # React components
│   │   ├── AsteroidList.jsx   # NEO browser and selector
│   │   ├── Asteroids.jsx     # Asteroid data management
│   │   ├── Globe3D.jsx       # 3D Earth visualization
│   │   ├── GlobeComponent.jsx # Globe wrapper component
│   │   ├── ImpactSidebar.jsx  # Impact results display
│   │   ├── InteractiveMap.jsx # 2D Leaflet map
│   │   ├── MeteorProvider.jsx # Meteor animation context
│   │   ├── OverlayMeteor.jsx  # Meteor overlay effects
│   │   ├── RangeSlider.jsx    # Parameter adjustment sliders
│   │   ├── Sliders.jsx        # Slider container
│   │   ├── WelcomeOverlay.jsx # Welcome screen component
│   │   ├── Wexio.jsx          # Main application component
│   │   └── configuration.jsx  # App configuration
│   ├── assets/                # Static assets
│   │   ├── earth/            # Earth textures for 3D globe
│   │   ├── asteroid.glb      # 3D asteroid model
│   │   ├── BackgroundStart.jpg
│   │   ├── FutureZ.ttf       # Custom font
│   │   └── nasalogo.png
│   ├── lib/                   # Utility libraries
│   │   ├── surfaceDetection.js # Land/water detection logic
│   │   ├── urlUtils.js        # URL parameter management
│   │   └── utils.js           # General utilities
│   ├── store/                 # Redux state management
│   │   ├── impactSlice.js     # Impact simulation state
│   │   └── store.js           # Redux store configuration
│   ├── App.jsx                # Root application component
│   ├── index.css              # Global styles
│   └── main.jsx               # Application entry point
├── eslint.config.js           # ESLint configuration
├── index.html                 # HTML template
├── package.json               # Dependencies and scripts
├── requirements.txt           # Python dependencies (unused)
├── vite.config.js             # Vite configuration
└── README.md                  # Project documentation
```

## 🔌 API Integration

### NASA NEO API
The application integrates with NASA's Near-Earth Object Web Service through a custom API endpoint:

```javascript
// API Configuration
const API_URL = 'https://api.pafodev.com/nasaapi/neo2';
const API_KEY = process.env.VITE_NASA_API_KEY;

// Example API Response
{
  "near_earth_objects": {
    "2024-10-05": [
      {
        "id": "2000433",
        "name": "433 Eros",
        "nasa_jpl_url": "https://ssd.jpl.nasa.gov/...",
        "estimated_diameter": {
          "meters": {
            "estimated_diameter_min": 16730,
            "estimated_diameter_max": 37400
          }
        },
        "close_approach_data": [...],
        "is_potentially_hazardous_asteroid": false
      }
    ]
  }
}
```

### Geoapify Reverse Geocoding
For surface detection and country identification:

```javascript
// Surface Detection API
const response = await fetch(
  `https://api.geoapify.com/v1/geocode/reverse?lat=${lat}&lon=${lng}&format=json&apiKey=${API_KEY}`
);

// Returns country code and surface type
{
  "results": [{
    "country_code": "US",
    "country": "United States",
    "surface_type": "land"
  }]
}
```

## ⚙️ Configuration

### Environment Variables

Create a `.env` file in the root directory:

```bash
# NASA API Key (required)
VITE_NASA_API_KEY=your_nasa_api_key_here

# Geoapify API Key (required for surface detection)
VITE_GEOAPIFY_API_KEY=your_geoapify_api_key_here

# Optional: Custom API endpoints
VITE_NEO_API_URL=https://api.pafodev.com/nasaapi/neo2
```

### Vite Configuration

Key configurations in `vite.config.js`:

```javascript
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'

export default defineConfig({
  plugins: [react()],
  build: {
    rollupOptions: {
      output: {
        assetFileNames: 'assets/[name].[hash][extname]'
      }
    }
  },
  assetsInclude: ['**/*.glb'] // Include 3D models
})
```

### Redux Store Structure

```javascript
// Global Application State
{
  impact: {
    country: null,              // 2-letter country code
    impactEvent: null,          // Current simulation data
    showSliders: false,         // Parameter adjustment UI
    showAsteroidList: true,     // Asteroid browser visibility
    diameter: 550,              // Asteroid diameter (m)
    velocity: 42,               // Impact velocity (km/s)
    selectedAsteroid: null,     // Currently selected NEO
    is3DMap: true,              // 3D vs 2D map mode
    currentZoomLevel: 2,        // Map zoom level
    // ... additional state properties
  }
}
```

## 🤝 Contributing

We welcome contributions from the community! Here's how you can help:

### Development Workflow

1. **Fork the repository**
```bash
git fork https://github.com/andrlpz/NASA-Space-Apps-Challenge-Meteor-Madness.git
```

2. **Create a feature branch**
```bash
git checkout -b feature/amazing-new-feature
```

3. **Make your changes**
   - Follow the existing code style and conventions
   - Add tests for new functionality
   - Update documentation as needed

4. **Test your changes**
```bash
npm run dev    # Test in development
npm run build  # Test production build
npm run lint   # Check code style
```

5. **Submit a pull request**
   - Provide a clear description of changes
   - Include screenshots for UI changes
   - Reference any related issues

### Code Style Guidelines

- **JavaScript/JSX**: Follow ESLint configuration
- **CSS**: Use Tailwind utilities when possible
- **Components**: Keep components focused and reusable
- **State Management**: Use Redux for global state, local state for component-specific data

### Reporting Issues

Found a bug or have a feature request? Please create an issue with:
- Clear description of the problem/request
- Steps to reproduce (for bugs)
- Expected vs actual behavior
- Screenshots or screen recordings when helpful

## 🌌 NASA Space Apps Challenge

This project was developed for the **NASA Space Apps Challenge 2024**, an international hackathon focused on solving challenges related to space exploration and Earth science.

### Challenge: Orrery Web App

**Objective**: Create an interactive web application that allows users to explore and visualize near-Earth objects (NEOs) and their potential impact scenarios.

### Our Solution

Meteor Madness addresses the challenge by providing:

1. **Educational Value**: Interactive learning about asteroid threats and planetary defense
2. **Real Data Integration**: Live NASA NEO database connectivity
3. **Scientific Accuracy**: Physics-based impact modeling and consequence prediction
4. **Public Engagement**: Gamified experience that makes space science accessible
5. **Awareness Building**: Promotes understanding of planetary defense importance

### Awards and Recognition

*This section will be updated based on challenge results*

## 👥 Team

### Development Team

- **[Andrlpz](https://github.com/andrlpz)** - Lead Developer & Project Architect
  - Full-stack development
  - NASA API integration
  - 3D visualization implementation

### Contributors

We thank all contributors who have helped improve Meteor Madness:

- **Community Contributors**: [View all contributors](https://github.com/andrlpz/NASA-Space-Apps-Challenge-Meteor-Madness/contributors)

### Special Thanks

- **NASA JPL** - For providing comprehensive NEO data and APIs
- **Open Source Community** - For the amazing tools and libraries that made this project possible
- **NASA Space Apps Challenge Organizers** - For creating this incredible opportunity to contribute to space science

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

```
MIT License

Copyright (c) 2024 Andrlpz and Contributors

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.
```

## 🔗 Links & Resources

### Project Links
- **GitHub Repository**: [NASA-Space-Apps-Challenge-Meteor-Madness](https://github.com/andrlpz/NASA-Space-Apps-Challenge-Meteor-Madness)
- **Live Demo**: [Meteor Madness Simulator](#) *(Update with deployment URL)*
- **NASA Space Apps**: [Challenge Details](https://www.spaceappschallenge.org/)

### NASA Resources
- **NASA NEO Program**: [Near-Earth Object Program](https://cneos.jpl.nasa.gov/)
- **JPL Small-Body Database**: [SSD Database](https://ssd.jpl.nasa.gov/tools/sbdb_lookup.html)
- **Planetary Defense**: [NASA Planetary Defense](https://www.nasa.gov/planetarydefense/)

### Technical Documentation
- **React Documentation**: [React.dev](https://react.dev/)
- **Three.js Documentation**: [Threejs.org](https://threejs.org/)
- **Vite Documentation**: [Vitejs.dev](https://vitejs.dev/)

---

**Made with 🚀 for the NASA Space Apps Challenge 2024**

*Protecting Earth through education, simulation, and awareness*
