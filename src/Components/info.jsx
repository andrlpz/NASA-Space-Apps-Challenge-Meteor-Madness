import React, { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { Info } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import cookies from 'js-cookie';

// Add custom styles for animations and scrollbars
const tooltipStyles = `
  @keyframes fadeIn {
    from { opacity: 0; transform: translateY(-100%) scale(0.95); }
    to { opacity: 1; transform: translateY(-100%) scale(1); }
  }
  
  .animate-fade-in {
    animation: fadeIn 0.2s ease-out;
  }

  /* Beautiful scrollbar styles */
  .custom-scrollbar::-webkit-scrollbar {
    width: 8px;
    height: 8px;
  }

  .custom-scrollbar::-webkit-scrollbar-track {
    background: rgba(31, 41, 55, 0.5);
    border-radius: 10px;
    border: 1px solid rgba(75, 85, 99, 0.3);
  }

  .custom-scrollbar::-webkit-scrollbar-thumb {
    background: linear-gradient(45deg, #3b82f6, #06b6d4);
    border-radius: 10px;
    border: 1px solid rgba(59, 130, 246, 0.3);
    box-shadow: 0 0 10px rgba(59, 130, 246, 0.3);
  }

  .custom-scrollbar::-webkit-scrollbar-thumb:hover {
    background: linear-gradient(45deg, #2563eb, #0891b2);
    box-shadow: 0 0 15px rgba(59, 130, 246, 0.5);
  }

  .custom-scrollbar::-webkit-scrollbar-corner {
    background: rgba(31, 41, 55, 0.5);
  }

  /* Firefox scrollbar styling */
  .custom-scrollbar {
    scrollbar-width: thin;
    scrollbar-color: #3b82f6 rgba(31, 41, 55, 0.5);
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
    "velocity": "The speed parameter used in custom asteroid simulation, representing impact velocity in kilometers per second.",
    "surface-analysis": "Analysis of the surface type and characteristics at the impact location to predict impact effects.",
    "surface-type": "The type of surface (land or water) where the impact occurs, affecting the nature of consequences.",
    "location": "The geographic location or region where the impact is predicted to occur.",
    "confidence": "The level of certainty in the surface analysis data and predictions.",
    "data-source": "The source of geographic and surface data used for impact analysis.",
    "country": "The country where the impact would occur, if on land.",
    "population": "The population count of the affected country or region.",
    "region": "The specific geographic region within the country.",
    "city": "The nearest major city to the impact location.",
    "capital": "The capital city of the affected country.",
    "area": "The total land area of the affected country in square kilometers.",
    "primary-effect": "The main consequence expected from the impact based on surface type and asteroid characteristics.",
    "tsunami-height": "The predicted height of tsunami waves generated by an ocean impact.",
    "tsunami-range": "The distance that tsunami waves would travel from the impact point.",
    "coastal-impact": "The severity of impact on coastal areas from tsunami waves.",
    "fireball-radius": "The radius of the initial fireball created by the asteroid's atmospheric entry and impact.",
    "seismic-range": "The distance over which significant seismic effects would be felt.",
    "ground-effect": "The type and severity of ground damage expected from the impact.",
    "crater-info": "Information about the crater that would be formed by the impact.",
    "devastation-radius": "The radius of area that would experience severe damage from the impact.",
    "special-effects": "Additional effects specific to the impact scenario, such as climate impacts.",
    "evacuation-radius": "The recommended distance for evacuation of people from the impact zone."
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
    "velocity": "El parámetro de velocidad usado en la simulación de asteroide personalizado, representando la velocidad de impacto en kilómetros por segundo.",
    "surface-analysis": "Análisis del tipo de superficie y características en la ubicación del impacto para predecir efectos del impacto.",
    "surface-type": "El tipo de superficie (tierra o agua) donde ocurre el impacto, afectando la naturaleza de las consecuencias.",
    "location": "La ubicación geográfica o región donde se predice que ocurrirá el impacto.",
    "confidence": "El nivel de certeza en los datos de análisis de superficie y predicciones.",
    "data-source": "La fuente de datos geográficos y de superficie utilizados para el análisis de impacto.",
    "country": "El país donde ocurriría el impacto, si es en tierra.",
    "population": "El conteo de población del país o región afectada.",
    "region": "La región geográfica específica dentro del país.",
    "city": "La ciudad principal más cercana a la ubicación del impacto.",
    "capital": "La ciudad capital del país afectado.",
    "area": "El área total de tierra del país afectado en kilómetros cuadrados.",
    "primary-effect": "La consecuencia principal esperada del impacto basada en el tipo de superficie y características del asteroide.",
    "tsunami-height": "La altura predicha de las olas de tsunami generadas por un impacto oceánico.",
    "tsunami-range": "La distancia que las olas de tsunami viajarían desde el punto de impacto.",
    "coastal-impact": "La severidad del impacto en áreas costeras por las olas de tsunami.",
    "fireball-radius": "El radio de la bola de fuego inicial creada por la entrada atmosférica e impacto del asteroide.",
    "seismic-range": "La distancia sobre la cual se sentirían efectos sísmicos significativos.",
    "ground-effect": "El tipo y severidad del daño al suelo esperado del impacto.",
    "crater-info": "Información sobre el cráter que sería formado por el impacto.",
    "devastation-radius": "El radio del área que experimentaría daño severo del impacto.",
    "special-effects": "Efectos adicionales específicos al escenario de impacto, como impactos climáticos.",
    "evacuation-radius": "La distancia recomendada para evacuación de personas de la zona de impacto."
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
    "velocity": "Le paramètre de vitesse utilisé dans la simulation d'astéroïde personnalisé, représentant la vitesse d'impact en kilomètres par seconde.",
    "surface-analysis": "Analyse du type de surface et des caractéristiques à l'emplacement d'impact pour prédire les effets d'impact.",
    "surface-type": "Le type de surface (terre ou eau) où l'impact se produit, affectant la nature des conséquences.",
    "location": "L'emplacement géographique ou la région où l'impact est prédit de se produire.",
    "confidence": "Le niveau de certitude dans les données d'analyse de surface et les prédictions.",
    "data-source": "La source des données géographiques et de surface utilisées pour l'analyse d'impact.",
    "country": "Le pays où l'impact se produirait, si sur terre.",
    "population": "Le décompte de population du pays ou de la région affectée.",
    "region": "La région géographique spécifique au sein du pays.",
    "city": "La ville principale la plus proche de l'emplacement d'impact.",
    "capital": "La ville capitale du pays affecté.",
    "area": "La superficie totale du pays affecté en kilomètres carrés.",
    "primary-effect": "La conséquence principale attendue de l'impact basée sur le type de surface et les caractéristiques de l'astéroïde.",
    "tsunami-height": "La hauteur prédite des vagues de tsunami générées par un impact océanique.",
    "tsunami-range": "La distance que les vagues de tsunami voyageraient depuis le point d'impact.",
    "coastal-impact": "La sévérité de l'impact sur les zones côtières par les vagues de tsunami.",
    "fireball-radius": "Le rayon de la boule de feu initiale créée par l'entrée atmosphérique et l'impact de l'astéroïde.",
    "seismic-range": "La distance sur laquelle des effets sismiques significatifs seraient ressentis.",
    "ground-effect": "Le type et la sévérité des dommages au sol attendus de l'impact.",
    "crater-info": "Informations sur le cratère qui serait formé par l'impact.",
    "devastation-radius": "Le rayon de la zone qui subirait des dommages sévères de l'impact.",
    "special-effects": "Effets additionnels spécifiques au scénario d'impact, comme les impacts climatiques.",
    "evacuation-radius": "La distance recommandée pour l'évacuation des personnes de la zone d'impact."
  }
};

// Tooltip component that shows definition - Fixed positioning relative to viewport
const DefinitionTooltip = ({ term, language, buttonRef }) => {
  const definition = definitions[language]?.[term] || definitions.en[term] || "Definition not available.";
  
  // Calculate fixed position based on button's viewport position
  const [position, setPosition] = useState({ top: 0, left: 0 });
  
  useEffect(() => {
    if (buttonRef?.current) {
      const updatePosition = () => {
        const rect = buttonRef.current.getBoundingClientRect();
        const tooltipWidth = 320; // w-80 = 320px
        const tooltipHeight = 120; // approximate height
        
        // Position tooltip above the button, centered horizontally
        let left = rect.left + rect.width / 2 - tooltipWidth / 2;
        let top = rect.top - tooltipHeight - 10; // 10px gap
        
        // Keep tooltip within viewport bounds
        const viewportWidth = window.innerWidth;
        const viewportHeight = window.innerHeight;
        
        // Adjust horizontal position if needed
        if (left < 10) left = 10;
        if (left + tooltipWidth > viewportWidth - 10) left = viewportWidth - tooltipWidth - 10;
        
        // If tooltip would go above viewport, position it below the button
        if (top < 10) {
          top = rect.bottom + 10;
        }
        
        setPosition({ top, left });
      };
      
      updatePosition();
      window.addEventListener('scroll', updatePosition);
      window.addEventListener('resize', updatePosition);
      
      return () => {
        window.removeEventListener('scroll', updatePosition);
        window.removeEventListener('resize', updatePosition);
      };
    }
  }, [buttonRef]);
  
  return createPortal(
    <div 
      className="fixed z-[99999] bg-gray-800/95 backdrop-blur-sm border border-cyan-400/50 rounded-lg p-4 w-80 shadow-2xl animate-fade-in pointer-events-none custom-scrollbar"
      style={{ 
        top: position.top, 
        left: position.left,
        isolation: 'isolate'
      }}
    >
      <div className="flex items-center space-x-2 mb-2">
        <div className="w-2 h-2 bg-cyan-400 rounded-full animate-pulse"></div>
        <h4 className="text-sm font-semibold text-cyan-400 capitalize">
          {term.replace(/-/g, ' ')}
        </h4>
      </div>
      <p className="text-gray-200 text-xs leading-relaxed max-h-32 overflow-y-auto">
        {definition}
      </p>
      
      {/* Arrow pointing to the button */}
      <div 
        className="absolute w-0 h-0 border-l-4 border-r-4 border-t-4 border-l-transparent border-r-transparent border-t-cyan-400/50"
        style={{ 
          top: '100%', 
          left: '50%', 
          transform: 'translateX(-50%)'
        }}
      ></div>
    </div>,
    document.body
  );
};

// Info button component
const InfoButton = ({ term, className = "" }) => {
  const [showTooltip, setShowTooltip] = useState(false);
  const buttonRef = useRef(null);
  const { i18n } = useTranslation();
  
  // Get current language from cookies and i18n with fallback
  const currentLanguageCode = cookies.get('i18next') || i18n.language || 'en';
  
  // Normalize language code to match our definitions structure
  let currentLanguage = 'en'; // default
  if (currentLanguageCode.startsWith('es') || currentLanguageCode === 'es') {
    currentLanguage = 'es';
  } else if (currentLanguageCode.startsWith('fr') || currentLanguageCode === 'fr') {
    currentLanguage = 'fr';
  }
  
  // Check if definition exists for this term
  const hasDefinition = definitions[currentLanguage]?.[term] || definitions.en[term];
  
  if (!hasDefinition) {
    console.warn(`No definition found for term: ${term} in language: ${currentLanguage}`);
    return null;
  }

  const handleMouseEnter = () => {
    setShowTooltip(true);
  };

  const handleMouseLeave = () => {
    setShowTooltip(false);
  };

  const handleClick = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setShowTooltip(!showTooltip);
  };

  // Close tooltip when clicking outside or pressing Escape
  useEffect(() => {
    const handleOutsideClick = (e) => {
      if (buttonRef.current && !buttonRef.current.contains(e.target)) {
        setShowTooltip(false);
      }
    };

    const handleEscape = (e) => {
      if (e.key === 'Escape') {
        setShowTooltip(false);
      }
    };

    if (showTooltip) {
      document.addEventListener('mousedown', handleOutsideClick);
      document.addEventListener('keydown', handleEscape);
      
      return () => {
        document.removeEventListener('mousedown', handleOutsideClick);
        document.removeEventListener('keydown', handleEscape);
      };
    }
  }, [showTooltip]);
  
  return (
    <>
      <button
        ref={buttonRef}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        onClick={handleClick}
        className={`inline-flex items-center justify-center w-6 h-6 ml-1 text-gray-400 hover:text-cyan-400 rounded-full transition-all duration-200 opacity-70 group-hover:opacity-100 hover:opacity-100 hover:bg-cyan-400/10 p-1 ${className}`}
        title="Click or hover for definition"
        type="button"
        aria-label={`Definition for ${term.replace(/-/g, ' ')}`}
      >
        <Info className="w-3 h-3" />
      </button>
      
      {showTooltip && (
        <DefinitionTooltip 
          term={term}
          language={currentLanguage}
          buttonRef={buttonRef}
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
