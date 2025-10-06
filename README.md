# 🌍 Asteroid Impact Explorer: Interactive Simulator

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
1. Toggle "Sliders" in the sidebar
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
├── .gitignore                 # Git ignore patterns
├── eslint.config.js           # ESLint configuration
├── index.html                 # HTML template
├── package.json               # Dependencies and scripts
├── package-lock.json          # Dependency lock file
├── README.md                  # Project documentation
├── requirements.txt           # Python dependencies (unused)
├── vite.config.js             # Vite configuration
├── public/
│   ├── logo.png              # Public logo asset
│   ├── vite.svg              # Vite default icon
│   └── assets/
│       └── locales/          # Translation files
│           ├── en/
│           │   └── translation.json
│           ├── es/
│           │   └── translation.json
│           └── fr/
│               └── translation.json
├── src/
│   ├── App.jsx               # Root application component
│   ├── index.css             # Global styles
│   ├── main.jsx              # Application entry point
│   ├── Components/           # React components
│   │   ├── AsteroidList.jsx  # NEO browser and selector
│   │   ├── Asteroids.jsx    # Asteroid data management
│   │   ├── Carita.jsx       # Data Prediction component
│   │   ├── Globe3D.jsx      # 3D Earth visualization
│   │   ├── GlobeComponent.jsx # Globe wrapper component
│   │   ├── ImpactSidebar.jsx # Impact results display
│   │   ├── InteractiveMap.jsx # 2D Leaflet map
│   │   ├── InteractiveMap.css # Map-specific styles
│   │   ├── MeteorProvider.jsx # Meteor animation context
│   │   ├── OverlayMeteor.jsx # Meteor overlay effects
│   │   ├── RangeSlider.jsx   # Parameter adjustment sliders
│   │   ├── Sliders.jsx       # Slider container
│   │   ├── WelcomeOverlay.jsx # Welcome screen component
│   │   ├── Wexio.jsx         # Main application component
│   │   ├── configuration.jsx # App configuration
│   │   └── info.jsx          # Information modal component
│   ├── assets/               # Static assets
│   │   ├── asteroid.glb      # 3D asteroid model
│   │   ├── BackgroundStart.jpg # Welcome background image
│   │   ├── countries.json    # Country data
│   │   ├── FutureZ.ttf       # Custom font
│   │   ├── logo.png          # Application logo
│   │   ├── nasalogo.png      # NASA logo
│   │   ├── react.svg         # React icon
│   │   ├── data/
│   │   │   └── countries.geojson # Geographic country data
│   │   └── earth/            # Earth textures for 3D globe
│   │       ├── earth_clouds.jpg
│   │       ├── earth_day.jpg
│   │       ├── earth_night.jpg
│   │       ├── earth_normal.png
│   │       ├── earth_normal.tif
│   │       ├── earth_specular.png
│   │       └── earth_specular.tif
│   ├── lib/                  # Utility libraries
│   │   ├── surfaceDetection.js # Land/water detection logic
│   │   ├── urlUtils.js       # URL parameter management
│   │   └── utils.js          # General utilities
│   └── store/                # Redux state management
│       ├── impactSlice.js    # Impact simulation state
│       └── store.js          # Redux store configuration
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

This project was developed for the **NASA Space Apps Challenge 2025**, responding to the critical threat posed by newly identified near-Earth asteroid "Impactor-2025" and the need for public understanding and decision-making tools.

### Challenge: Asteroid Impact Visualization & Simulation

**Objective**: Develop an interactive visualization and simulation tool using real NASA and USGS data to help users model asteroid impact scenarios, predict consequences, and evaluate potential mitigation strategies for threats like "Impactor-2025."

### Our Solution

Meteor Madness addresses the challenge by providing:

1. **Integrated Data Visualization**: Seamlessly combines NASA asteroid datasets with USGS geological information
2. **Real-time Impact Modeling**: Interactive simulation tool for asteroid impact scenario planning
3. **Consequence Prediction Engine**: Physics-based modeling of impact effects using real geological data
4. **Decision Support System**: Enables public and decision makers to evaluate mitigation strategies
5. **Risk Communication Platform**: Makes complex asteroid threat data accessible for effective decision making

### Awards and Recognition

*This section will be updated based on challenge results*

## 👥 Team

### Development Team

- **[pafolol](https://github.com/pafolol)** - 🎯 Team Representative 
  - Frontend magic and user experience architect
  - Meteor trajectory calculator and impact predictor
  - Diplomatic liaison between humans and machines
  - Professional bug squasher and feature conjurer
- **[Andrlpz](https://github.com/andrlpz)** - 🚀 Team Member 
  - Full-stack sorcery and digital alchemy
  - NASA API whisperer and data enchanter
  - Master of 3D universes and virtual worlds
  - Coffee-to-code conversion specialist
- **[leosangue](https://github.com/leosangue)** - 🌍 Team Member 
  - Backend infrastructure and server orchestrator
  - Geospatial data scientist and country code detective
  - Speed demon and efficiency enthusiast
  - Keeper of the sacred Redux state management

- **[Emidolo](https://github.com/Emidolo)** - 🎨 Team Member
  - UI/UX designer and pixel perfectionist
  - Three.js and WebGL sculptor
  - Master of smooth transitions and eye candy
  - Champion of responsive design across all devices
  

### Special Thanks

- **NASA JPL** - For providing comprehensive NEO data and APIs
- **Open Source Community** - For the amazing tools and libraries that made this project possible
- **NASA Space Apps Challenge Organizers** - For creating this incredible opportunity to contribute to space science


## 🔗 Links & Resources

### Project Links
- **GitHub Repository**: [NASA-Space-Apps-Challenge-Meteor-Madness](https://github.com/andrlpz/NASA-Space-Apps-Challenge-Meteor-Madness)
- **Live Demo**: [Meteor Madness Simulator](#) *(Update with deployment URL)*
- **NASA Space Apps**: [Challenge Details](https://www.spaceappschallenge.org/2025/challenges/meteor-madness/)

### NASA Resources
- **NASA NEO Program**: [Near-Earth Object Program](https://cneos.jpl.nasa.gov/)
- **JPL Small-Body Database**: [SSD Database](https://ssd.jpl.nasa.gov/tools/sbdb_lookup.html)
- **Planetary Defense**: [NASA Planetary Defense](https://www.nasa.gov/planetarydefense/)

### Technical Documentation
- **React Documentation**: [React.dev](https://react.dev/)
- **Three.js Documentation**: [Threejs.org](https://threejs.org/)
- **Vite Documentation**: [Vitejs.dev](https://vitejs.dev/)

---

**Made with 🚀 for the NASA Space Apps Challenge 2025**

*Protecting Earth through education, simulation, and awareness*
