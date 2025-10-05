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
    "surface-analysis": "Analysis of the surface characteristics at the impact location, including terrain type and geographical features.",
    "surface-type": "The classification of the terrain where the impact occurs (land, water, ice, etc.), affecting impact consequences.",
    "location": "The specific geographical location where the impact is simulated, including coordinates and regional information.",
    "confidence": "The reliability level of the surface detection data, indicating how certain the system is about the surface classification.",
    "data-source": "The origin of the geographical and surface information used in the impact analysis (satellite data, mapping services, etc.).",
    "country": "The nation where the simulated impact occurs, providing political and geographical context.",
    "population": "The number of people living in the country or region affected by the simulated impact.",
    "region": "The administrative or geographical subdivision within the country where the impact is located.",
    "city": "The nearest urban center to the impact location, relevant for evacuation planning and damage assessment.",
    "capital": "The capital city of the country where the impact occurs, important for governmental response coordination.",
    "area": "The total land area of the country or region, measured in square kilometers, providing scale context.",
    "primary-effect": "The main type of damage or phenomenon expected from the impact based on surface characteristics.",
    "tsunami-height": "The estimated height of tsunami waves generated by an ocean impact, critical for coastal warning systems.",
    "tsunami-range": "The distance that tsunami waves are expected to travel from the impact site, affecting evacuation zones.",
    "coastal-impact": "The specific effects on coastal areas and communities from a water-based asteroid impact.",
    "fireball-radius": "The distance from ground zero where the atmospheric fireball and intense heat radiation extend.",
    "seismic-range": "The area affected by earthquake-like ground shaking and structural damage from the impact.",
    "ground-effect": "The specific consequences for terrestrial impacts, including cratering, debris ejection, and local destruction.",
    "crater-info": "Details about the crater that would be formed, including diameter, depth, and geological characteristics.",
    "devastation-radius": "The area around the impact where severe damage and destruction would occur, requiring evacuation.",
    "evacuation-radius": "The recommended distance for evacuating populations to ensure safety from impact effects."
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
    "surface-analysis": "Análisis de las características de la superficie en la ubicación del impacto, incluyendo tipo de terreno y características geográficas.",
    "surface-type": "La clasificación del terreno donde ocurre el impacto (tierra, agua, hielo, etc.), que afecta las consecuencias del impacto.",
    "location": "La ubicación geográfica específica donde se simula el impacto, incluyendo coordenadas e información regional.",
    "confidence": "El nivel de confiabilidad de los datos de detección de superficie, indicando qué tan seguro está el sistema sobre la clasificación de superficie.",
    "data-source": "El origen de la información geográfica y de superficie utilizada en el análisis de impacto (datos satelitales, servicios de mapeo, etc.).",
    "country": "La nación donde ocurre el impacto simulado, proporcionando contexto político y geográfico.",
    "population": "El número de personas que viven en el país o región afectada por el impacto simulado.",
    "region": "La subdivisión administrativa o geográfica dentro del país donde se encuentra el impacto.",
    "city": "El centro urbano más cercano a la ubicación del impacto, relevante para la planificación de evacuación y evaluación de daños.",
    "capital": "La ciudad capital del país donde ocurre el impacto, importante para la coordinación de respuesta gubernamental.",
    "area": "El área total del país o región, medida en kilómetros cuadrados, proporcionando contexto de escala.",
    "primary-effect": "El tipo principal de daño o fenómeno esperado del impacto basado en las características de la superficie.",
    "tsunami-height": "La altura estimada de las olas de tsunami generadas por un impacto oceánico, crítica para los sistemas de alerta costera.",
    "tsunami-range": "La distancia que se espera que las olas de tsunami viajen desde el sitio de impacto, afectando las zonas de evacuación.",
    "coastal-impact": "Los efectos específicos en áreas costeras y comunidades de un impacto de asteroide en el agua.",
    "fireball-radius": "La distancia desde el punto cero donde se extiende la bola de fuego atmosférica y la radiación de calor intensa.",
    "seismic-range": "El área afectada por temblores similares a terremotos y daño estructural del impacto.",
    "ground-effect": "Las consecuencias específicas para impactos terrestres, incluyendo formación de cráteres, expulsión de escombros y destrucción local.",
    "crater-info": "Detalles sobre el cráter que se formaría, incluyendo diámetro, profundidad y características geológicas.",
    "devastation-radius": "El área alrededor del impacto donde ocurriría daño severo y destrucción, requiriendo evacuación.",
    "evacuation-radius": "La distancia recomendada para evacuar poblaciones para asegurar la seguridad de los efectos del impacto."
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
    "surface-analysis": "Analyse des caractéristiques de surface au lieu d'impact, incluant le type de terrain et les caractéristiques géographiques.",
    "surface-type": "La classification du terrain où l'impact se produit (terre, eau, glace, etc.), affectant les conséquences de l'impact.",
    "location": "L'emplacement géographique spécifique où l'impact est simulé, incluant les coordonnées et informations régionales.",
    "confidence": "Le niveau de fiabilité des données de détection de surface, indiquant à quel point le système est certain de la classification de surface.",
    "data-source": "L'origine des informations géographiques et de surface utilisées dans l'analyse d'impact (données satellitaires, services de cartographie, etc.).",
    "country": "La nation où l'impact simulé se produit, fournissant un contexte politique et géographique.",
    "population": "Le nombre de personnes vivant dans le pays ou la région affectée par l'impact simulé.",
    "region": "La subdivision administrative ou géographique dans le pays où l'impact est situé.",
    "city": "Le centre urbain le plus proche de l'emplacement d'impact, pertinent pour la planification d'évacuation et l'évaluation des dommages.",
    "capital": "La ville capitale du pays où l'impact se produit, importante pour la coordination de réponse gouvernementale.",
    "area": "La superficie totale du pays ou de la région, mesurée en kilomètres carrés, fournissant un contexte d'échelle.",
    "primary-effect": "Le type principal de dommage ou phénomène attendu de l'impact basé sur les caractéristiques de surface.",
    "tsunami-height": "La hauteur estimée des vagues de tsunami générées par un impact océanique, critique pour les systèmes d'alerte côtière.",
    "tsunami-range": "La distance que les vagues de tsunami devraient parcourir depuis le site d'impact, affectant les zones d'évacuation.",
    "coastal-impact": "Les effets spécifiques sur les zones côtières et communautés d'un impact d'astéroïde dans l'eau.",
    "fireball-radius": "La distance depuis le point zéro où la boule de feu atmosphérique et le rayonnement de chaleur intense s'étendent.",
    "seismic-range": "La zone affectée par des secousses similaires aux tremblements de terre et des dommages structurels de l'impact.",
    "ground-effect": "Les conséquences spécifiques pour les impacts terrestres, incluant la cratérisation, l'éjection de débris et la destruction locale.",
    "crater-info": "Détails sur le cratère qui serait formé, incluant diamètre, profondeur et caractéristiques géologiques.",
    "devastation-radius": "La zone autour de l'impact où des dommages sévères et la destruction se produiraient, nécessitant une évacuation.",
    "evacuation-radius": "La distance recommandée pour évacuer les populations afin d'assurer la sécurité des effets d'impact."
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
