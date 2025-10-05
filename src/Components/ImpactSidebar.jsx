import React from 'react';

import { Zap, ShieldCheck, MapPin, Telescope, Gauge, Scale, Wind, ExternalLink, Ruler, Globe, Waves, Mountain } from 'lucide-react';

import { useTranslation } from 'react-i18next'

export default function ImpactSidebar({ impact, resetImpact }) {

  if (!impact) {
    return (
      <div className="flex-grow flex items-center justify-center p-4">
        <div className="text-center p-4 border-2 border-dashed border-gray-600 rounded-lg">
          <p className="text-gray-300 font-medium">Click on the map to simulate an impact.</p>
          <p className="text-sm text-gray-500 mt-2">
            The sidebar will populate with real data from a selected Near-Earth Object.
          </p>
        </div>
      </div>
    );
  }

  const { t } = useTranslation()

  const { details, position } = impact;
  const { source, consequences, mitigation } = details;
  
  // Verificar si es una simulación personalizada
  const isCustomSimulation = source.name === 'Custom Asteroid Simulation';

  return (
    <div className="flex-grow overflow-y-auto pr-2">

      <InfoSection title={t('selected-asteroid')} icon={<Telescope className="w-5 h-5" />}>
        <StatItem label={t('name')} value={source.name} />
        <StatItem label={t('est_diameter')} value={source.diameter} />
        <StatItem label={t('relative-velocity')} value={source.velocity} />
        
        {!isCustomSimulation && (
          <>
            <StatItem label={t('close-approach')} value={source.closeApproachDate} />
            <StatItem label={t('miss-distance')} value={source.missDistance} />
          </>
        )}

        <StatItem label={t('abs-magnitude')} value={source.absoluteMagnitude} />
        <StatItem 
          label={t('potentially-hazardous')}
          value={source.isPotentiallyHazardous ? `${t('yes')}` : `${t('no')}`}
          valueColor={source.isPotentiallyHazardous ? 'text-red-400' : 'text-green-400'}
        />

        {source.jplUrl && source.jplUrl !== 'N/A' && source.jplUrl !== null && (
          <a href={source.jplUrl} target="_blank" rel="noopener noreferrer" className="text-cyan-400 hover:text-cyan-300 text-sm flex items-center mt-3 transition-colors">
            {t('view-jpl-database')} <ExternalLink className="w-4 h-4 ml-2" />
          </a>
        )}
      </InfoSection>

      {/* Nueva sección de información de superficie */}
      {details.surface && (
        <InfoSection 
          title={t('surface-analysis')} 
          icon={details.surface.type === 'water' ? <Waves className="w-5 h-5" /> : <Mountain className="w-5 h-5" />}
        >
          <StatItem 
            label={t('surface-type')} 
            value={details.surface.description} 
            valueColor={details.surface.type === 'water' ? 'text-blue-400' : 'text-green-400'}
            icon={details.surface.type === 'water' ? <Waves size={16} className="text-blue-400" /> : <Mountain size={16} className="text-green-400" />}
          />
          <StatItem 
            label={t('location')} 
            value={details.surface.location} 
            icon={<Globe size={16} className="text-gray-400" />}
          />
          <StatItem 
            label={t('confidence')} 
            value={details.surface.confidence === 'high' ? t('high') || 'Alta' : t('medium') || 'Media'} 
            valueColor={details.surface.confidence === 'high' ? 'text-green-400' : 'text-yellow-400'}
          />
          <StatItem 
            label={t('data-source')} 
            value={details.surface.source === 'pafodev_api' ? 'PafoDev API' : details.surface.source === 'local_detection' ? t('local-detection') || 'Detección Local' : details.surface.source} 
            valueColor="text-cyan-400"
          />
          
          {/* Información adicional del país si está disponible */}
          {details.surface.countryInfo && details.surface.countryInfo.country && (
            <>
              <StatItem 
                label={t('country')} 
                value={details.surface.countryInfo.country} 
                valueColor="text-purple-400"
                icon={<Globe size={16} className="text-purple-400" />}
              />
              {details.surface.countryInfo.population && (
                <StatItem 
                  label={t('population')} 
                  value={details.surface.countryInfo.population?.toLocaleString() || 'N/A'} 
                  valueColor="text-purple-400"
                />
              )}
              {details.surface.countryInfo.region && (
                <StatItem 
                  label={t('region')} 
                  value={details.surface.countryInfo.region} 
                  valueColor="text-purple-400"
                />
              )}
              {details.surface.countryInfo.city && (
                <StatItem 
                  label={t('city')} 
                  value={details.surface.countryInfo.city} 
                  valueColor="text-purple-400"
                />
              )}
              {details.surface.countryInfo.capital && (
                <StatItem 
                  label={t('capital') || 'Capital'} 
                  value={details.surface.countryInfo.capital} 
                  valueColor="text-purple-400"
                />
              )}
              {details.surface.countryInfo.area && (
                <StatItem 
                  label={t('area') || 'Área'} 
                  value={`${details.surface.countryInfo.area.toLocaleString()} km²`} 
                  valueColor="text-purple-400"
                />
              )}
            </>
          )}
        </InfoSection>
      )}

      <InfoSection title={t('consequences')} icon={<Zap className="w-5 h-5" />}>
        <StatItem label={t('impact-location')} value={`${t('lat')} ${position.lat.toFixed(3)}, ${t('lng')} ${position.lng.toFixed(3)}`} icon={<MapPin size={16} className="text-gray-400" />} />
        <StatItem label={t('kinetic-energy')} value={consequences.impactEnergy} icon={<Gauge size={16} className="text-gray-400" />} />
        <StatItem label={t('seismic-effect')} value={consequences.seismicEffect} icon={<Scale size={16} className="text-gray-400" />} />
        
        {/* Mostrar efecto primario */}
        {consequences.primaryEffect && (
          <StatItem 
            label={t('primary-effect')} 
            value={consequences.primaryEffect} 
            valueColor={consequences.primaryEffect.includes('Tsunami') ? 'text-blue-400 font-bold' : 'text-orange-400 font-bold'}
            icon={consequences.primaryEffect.includes('Tsunami') ? <Waves size={16} className="text-blue-400" /> : <Mountain size={16} className="text-orange-400" />}
          />
        )}

        {/* Información específica de agua */}
        {consequences.tsunamiHeight && (
          <>
            <StatItem 
              label={t('tsunami-height')} 
              value={consequences.tsunamiHeight} 
              valueColor="text-blue-400 font-bold"
              icon={<Waves size={16} className="text-blue-400" />}
            />
            <StatItem 
              label={t('tsunami-range')} 
              value={consequences.tsunamiRange} 
              valueColor="text-blue-400"
            />
            <StatItem 
              label={t('coastal-impact')} 
              value={consequences.coastalImpact} 
              valueColor={consequences.coastalImpact === 'CRÍTICO' ? 'text-red-400 font-bold' : 'text-yellow-400'}
            />
          </>
        )}

        {/* Información específica de tierra */}
        {consequences.fireballRadius && (
          <>
            <StatItem 
              label={t('fireball-radius')} 
              value={consequences.fireballRadius} 
              valueColor="text-orange-400 font-bold"
            />
            <StatItem 
              label={t('seismic-range')} 
              value={consequences.seismicRange} 
              valueColor="text-orange-400"
            />
            <StatItem 
              label={t('ground-effect')} 
              value={consequences.groundEffect} 
              valueColor={consequences.groundEffect?.includes('TOTAL') ? 'text-red-400 font-bold' : 'text-yellow-400'}
            />
          </>
        )}

        {/* Información de cráter */}
        {consequences.craterInfo && (
          <StatItem 
            label={t('crater-info')} 
            value={consequences.craterInfo} 
            icon={<Ruler size={16} className="text-gray-400" />}
          />
        )}

        {consequences.devastationRadius && (
          <StatItem 
            label={t('devastation-radius')} 
            value={consequences.devastationRadius} 
            valueColor="text-red-400"
          />
        )}

        <StatItem label={t('air-blast')} value={consequences.airBlast} icon={<Wind size={16} className="text-gray-400" />} />

        {/* Efectos especiales */}
        {consequences.specialEffects && consequences.specialEffects.length > 0 && (
          <div className="mt-3">
            <p className="text-gray-400 text-sm mb-2">{t('special-effects')}:</p>
            <ul className="text-xs text-gray-300 space-y-1">
              {consequences.specialEffects.map((effect, index) => (
                <li key={index} className="flex items-center">
                  <span className="w-1 h-1 bg-cyan-400 rounded-full mr-2"></span>
                  {effect}
                </li>
              ))}
            </ul>
          </div>
        )}
      </InfoSection>

      <InfoSection title={t('mitigation-report')} icon={<ShieldCheck className="w-5 h-5" />}>
        <StatItem
          label={t('threat-level')}
          value={t(`mitigation.threatlevel.${mitigation.threatLevel}`)}
          valueColor={source.isPotentiallyHazardous ? 'text-yellow-400 font-bold' : 'text-gray-300'}
        />
        <StatItem label={t('recommended-action')} value={mitigation.recommendedAction} />
        {mitigation.evacuationRadius && mitigation.evacuationRadius !== 'N/A km' && (
          <StatItem 
            label={t('evacuation-radius')} 
            value={mitigation.evacuationRadius} 
            valueColor="text-red-400 font-bold"
            icon={<ShieldCheck size={16} className="text-red-400" />}
          />
        )}
      </InfoSection>

      <div className="flex justify-center mt-4">
        <button onClick={() => { resetImpact() }} className="px-4 py-2 rounded-md border border-neutral-300 bg-neutral-100 text-neutral-500 text-sm hover:-translate-y-1 transform transition duration-200 hover:shadow-md ">
          {t('reset-simulation')}
        </button>
      </div>
    </div>
  );
}


const InfoSection = ({ title, icon, children }) => (
  <div className="mb-6 bg-gray-700/30 p-4 rounded-lg">
    <h3 className="text-lg font-semibold text-gray-300 flex items-center mb-3">
      {React.cloneElement(icon, { className: "mr-2 text-cyan-400" })}
      {title}
    </h3>
    <div className="space-y-2">
      {children}
    </div>
  </div>
);

const StatItem = ({ label, value, valueColor = 'text-white', icon = null }) => (
  <div className="flex justify-between items-center text-sm">
    <p className="text-gray-400 flex items-center">
      {icon && <span className="mr-2">{icon}</span>}
      {label}:
    </p>
    <p className={`font-medium ${valueColor}`}>{value}</p>
  </div>
);
