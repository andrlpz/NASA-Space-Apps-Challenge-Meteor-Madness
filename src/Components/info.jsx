import React, { useState, useEffect, useRef } from 'react';
import { Info } from 'lucide-react';
import { useTranslation } from 'react-i18next';

// Add custom styles for animations
const tooltipStyles = `
  @keyframes fadeIn {
    from { opacity: 0; transform: translateY(-100%) scale(0.95); }
    to { opacity: 1; transform: translateY(-100%) scale(1); }
  }
  
  .animate-fade-in {
    animation: fadeIn 0.2s ease-out;
  }
`;

// Inject styles if not already present
if (typeof document !== 'undefined' && !document.getElementById('tooltip-styles')) {
  const styleSheet = document.createElement('style');
  styleSheet.id = 'tooltip-styles';
  styleSheet.textContent = tooltipStyles;
  document.head.appendChild(styleSheet);
}

// Definitions for all terms that appear in the ImpactSidebar
const definitions = {
  en: {
    "name": "The designation given to the asteroid by the International Astronomical Union (IAU). Usually includes a year of discovery and a unique identifier.",
    "est_diameter": "The estimated size of the asteroid across its widest point, calculated from brightness observations and assumed albedo (reflectivity).",
    "relative-velocity": "The speed at which the asteroid moves relative to Earth at its closest approach point, measured in kilometers per second.",
    "close-approach": "The date and time when the asteroid passes closest to Earth in its orbital path around the Sun.",
    "miss-distance": "The minimum distance between the asteroid and Earth's center during the close approach, typically measured in kilometers or lunar distances.",
    "abs-magnitude": "A measure of the asteroid's intrinsic brightness, denoted as 'H'. Lower values indicate brighter (and typically larger) objects.",
    "potentially-hazardous": "Objects larger than 140 meters that come within 7.5 million kilometers of Earth's orbit. This doesn't mean they will hit Earth.",
    "impact-location": "The geographical coordinates (latitude and longitude) where the simulated asteroid impact occurs on Earth's surface.",
    "kinetic-energy": "The energy released upon impact, calculated from the asteroid's mass and velocity. Measured in megatons of TNT equivalent.",
    "seismic-effect": "The magnitude of ground shaking and earthquake-like effects that would result from the impact, measured on the Richter scale.",
    "air-blast": "The atmospheric shock wave created by the impact, which can cause damage over large areas even without direct impact.",
    "threat-level": "An assessment of the potential danger posed by the asteroid impact, ranging from low monitoring required to high immediate action needed.",
    "recommended-action": "The suggested response or preparation measures based on the calculated impact effects and threat assessment.",
    "selected-asteroid": "Data about the Near-Earth Object (NEO) currently chosen for impact simulation, sourced from NASA's database.",
    "consequences": "The predicted physical effects and damage that would result from the simulated asteroid impact on Earth.",
    "mitigation-report": "An analysis of the threat level and recommended actions to prepare for or prevent the potential impact event.",
    "diameter": "The size parameter used in custom asteroid simulation, representing the object's width in meters.",
    "velocity": "The speed parameter used in custom asteroid simulation, representing impact velocity in kilometers per second."
  },
  es: {
    "name": "La designación dada al asteroide por la Unión Astronómica Internacional (UAI). Usualmente incluye un año de descubrimiento y un identificador único.",
    "est_diameter": "El tamaño estimado del asteroide en su punto más ancho, calculado a partir de observaciones de brillo y albedo asumido (reflectividad).",
    "relative-velocity": "La velocidad a la que se mueve el asteroide en relación con la Tierra en su punto de aproximación más cercano, medida en kilómetros por segundo.",
    "close-approach": "La fecha y hora cuando el asteroide pasa más cerca de la Tierra en su trayectoria orbital alrededor del Sol.",
    "miss-distance": "La distancia mínima entre el asteroide y el centro de la Tierra durante la aproximación cercana, típicamente medida en kilómetros o distancias lunares.",
    "abs-magnitude": "Una medida del brillo intrínseco del asteroide, denotado como 'H'. Valores más bajos indican objetos más brillantes (y típicamente más grandes).",
    "potentially-hazardous": "Objetos mayores a 140 metros que se acercan a menos de 7.5 millones de kilómetros de la órbita terrestre. Esto no significa que impactarán la Tierra.",
    "impact-location": "Las coordenadas geográficas (latitud y longitud) donde ocurre el impacto simulado del asteroide en la superficie terrestre.",
    "kinetic-energy": "La energía liberada al impacto, calculada a partir de la masa y velocidad del asteroide. Medida en megatones equivalentes de TNT.",
    "seismic-effect": "La magnitud del temblor del suelo y efectos similares a terremotos que resultarían del impacto, medidos en la escala de Richter.",
    "air-blast": "La onda de choque atmosférica creada por el impacto, que puede causar daños en áreas extensas incluso sin impacto directo.",
    "threat-level": "Una evaluación del peligro potencial representado por el impacto del asteroide, desde monitoreo bajo requerido hasta acción inmediata alta necesaria.",
    "recommended-action": "Las medidas de respuesta o preparación sugeridas basadas en los efectos de impacto calculados y evaluación de amenaza.",
    "selected-asteroid": "Datos sobre el Objeto Cercano a la Tierra (NEO) actualmente elegido para simulación de impacto, obtenidos de la base de datos de NASA.",
    "consequences": "Los efectos físicos y daños predichos que resultarían del impacto simulado del asteroide en la Tierra.",
    "mitigation-report": "Un análisis del nivel de amenaza y acciones recomendadas para prepararse o prevenir el evento de impacto potencial.",
    "diameter": "El parámetro de tamaño usado en la simulación de asteroide personalizado, representando el ancho del objeto en metros.",
    "velocity": "El parámetro de velocidad usado en la simulación de asteroide personalizado, representando la velocidad de impacto en kilómetros por segundo."
  },
  fr: {
    "name": "La désignation donnée à l'astéroïde par l'Union Astronomique Internationale (UAI). Inclut généralement une année de découverte et un identifiant unique.",
    "est_diameter": "La taille estimée de l'astéroïde à son point le plus large, calculée à partir d'observations de luminosité et d'albédo assumé (réflectivité).",
    "relative-velocity": "La vitesse à laquelle l'astéroïde se déplace par rapport à la Terre à son point d'approche le plus proche, mesurée en kilomètres par seconde.",
    "close-approach": "La date et l'heure où l'astéroïde passe au plus près de la Terre dans sa trajectoire orbitale autour du Soleil.",
    "miss-distance": "La distance minimale entre l'astéroïde et le centre de la Terre lors de l'approche proche, généralement mesurée en kilomètres ou distances lunaires.",
    "abs-magnitude": "Une mesure de la luminosité intrinsèque de l'astéroïde, notée 'H'. Des valeurs plus faibles indiquent des objets plus brillants (et généralement plus grands).",
    "potentially-hazardous": "Objets de plus de 140 mètres qui s'approchent à moins de 7,5 millions de kilomètres de l'orbite terrestre. Cela ne signifie pas qu'ils frapperont la Terre.",
    "impact-location": "Les coordonnées géographiques (latitude et longitude) où l'impact simulé de l'astéroïde se produit sur la surface terrestre.",
    "kinetic-energy": "L'énergie libérée lors de l'impact, calculée à partir de la masse et de la vitesse de l'astéroïde. Mesurée en mégatonnes d'équivalent TNT.",
    "seismic-effect": "L'ampleur des secousses du sol et des effets similaires aux tremblements de terre qui résulteraient de l'impact, mesurés sur l'échelle de Richter.",
    "air-blast": "L'onde de choc atmosphérique créée par l'impact, qui peut causer des dommages sur de vastes zones même sans impact direct.",
    "threat-level": "Une évaluation du danger potentiel posé par l'impact de l'astéroïde, allant de surveillance faible requise à action immédiate élevée nécessaire.",
    "recommended-action": "Les mesures de réponse ou de préparation suggérées basées sur les effets d'impact calculés et l'évaluation de la menace.",
    "selected-asteroid": "Données sur l'Objet Proche de la Terre (NEO) actuellement choisi pour la simulation d'impact, provenant de la base de données de la NASA.",
    "consequences": "Les effets physiques et dommages prédits qui résulteraient de l'impact simulé de l'astéroïde sur Terre.",
    "mitigation-report": "Une analyse du niveau de menace et des actions recommandées pour se préparer ou prévenir l'événement d'impact potentiel.",
    "diameter": "Le paramètre de taille utilisé dans la simulation d'astéroïde personnalisé, représentant la largeur de l'objet en mètres.",
    "velocity": "Le paramètre de vitesse utilisé dans la simulation d'astéroïde personnalisé, représentant la vitesse d'impact en kilomètres par seconde."
  }
};

// Tooltip component that shows definition
const DefinitionTooltip = ({ term, language, position }) => {
  const definition = definitions[language]?.[term] || definitions.en[term] || "Definition not available.";
  
  return (
    <div 
      className="absolute z-50 bg-gray-800 border border-cyan-400/50 rounded-lg p-3 max-w-xs shadow-xl animate-fade-in pointer-events-none"
      style={{
        top: position.top - 10,
        left: position.left,
        transform: 'translateY(-100%)',
      }}
    >
      <div className="flex items-center space-x-2 mb-2">
        <div className="w-2 h-2 bg-cyan-400 rounded-full"></div>
        <h4 className="text-sm font-semibold text-cyan-400 capitalize">
          {term.replace(/-/g, ' ')}
        </h4>
      </div>
      <p className="text-gray-200 text-xs leading-relaxed">
        {definition}
      </p>
      {/* Tooltip arrow */}
      <div className="absolute top-full left-4 w-0 h-0 border-l-4 border-r-4 border-t-4 border-l-transparent border-r-transparent border-t-cyan-400/50"></div>
    </div>
  );
};

// Info button component
const InfoButton = ({ term, className = "" }) => {
  const [showTooltip, setShowTooltip] = useState(false);
  const [tooltipPosition, setTooltipPosition] = useState({ top: 0, left: 0 });
  const buttonRef = useRef(null);
  const { i18n } = useTranslation();
  const currentLanguage = i18n.language || 'en';
  
  // Check if definition exists for this term
  const hasDefinition = definitions[currentLanguage]?.[term] || definitions.en[term];
  
  if (!hasDefinition) {
    return null;
  }

  const handleMouseEnter = () => {
    if (buttonRef.current) {
      const rect = buttonRef.current.getBoundingClientRect();
      setTooltipPosition({
        top: rect.top + window.scrollY,
        left: rect.left + window.scrollX + rect.width / 2,
      });
      setShowTooltip(true);
    }
  };

  const handleMouseLeave = () => {
    setShowTooltip(false);
  };
  
  return (
    <>
      <button
        ref={buttonRef}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        className={`inline-flex items-center justify-center w-4 h-4 ml-2 text-gray-400 hover:text-cyan-400 rounded-full transition-all duration-200 opacity-0 group-hover:opacity-100 ${className}`}
        title="Hover for definition"
      >
        <Info className="w-3 h-3" />
      </button>
      
      {showTooltip && (
        <DefinitionTooltip 
          term={term}
          language={currentLanguage}
          position={tooltipPosition}
        />
      )}
    </>
  );
};

// Hook to add info buttons to elements
export const useInfoButton = () => {
  return { InfoButton };
};

// HOC to wrap components with info functionality
export const withInfoButton = (WrappedComponent) => {
  return (props) => {
    return <WrappedComponent {...props} InfoButton={InfoButton} />;
  };
};

export default InfoButton;
export { DefinitionTooltip };
