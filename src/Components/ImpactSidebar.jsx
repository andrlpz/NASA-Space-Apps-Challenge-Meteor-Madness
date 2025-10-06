import React, { useState } from 'react';
import { Zap, ShieldCheck, MapPin, Telescope, Gauge, Scale, Wind, ExternalLink, Ruler, Activity, AlertTriangle, Globe, Waves, Mountain } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import InfoButton from './info';

export default function ImpactSidebar({ impact, resetImpact }) {
  if (!impact) {
    return (
      <div className="flex-grow flex items-center justify-center p-2 sm:p-4">
        <div className="text-center p-3 sm:p-4 border-2 border-dashed border-gray-600 rounded-lg">
          <p className="text-gray-300 font-medium text-sm sm:text-base">Click on the map to simulate an impact.</p>
          <p className="text-xs sm:text-sm text-gray-500 mt-2">
            The sidebar will populate with real data from a selected Near-Earth Object.
          </p>
        </div>
      </div>
    );
  }

  const { t } = useTranslation();
  const { details, position } = impact;
  const { source, consequences, mitigation } = details;
  
  const isCustomSimulation = source.name === 'Custom Asteroid Simulation';

  return (
    <div className="flex-grow overflow-y-auto pr-1 sm:pr-2 space-y-3 sm:space-y-4 lg:space-y-6 scrollbar-thin scrollbar-track-gray-800 scrollbar-thumb-gray-600 hover:scrollbar-thumb-gray-500">
      <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-xl lg:rounded-2xl p-3 sm:p-4 lg:p-6 border border-gray-600 shadow-2xl">
        <div className="flex items-center justify-between mb-2 sm:mb-3 lg:mb-4">
          <h2 className="text-lg sm:text-xl lg:text-2xl font-bold text-white flex items-center">
            <div className="w-2 h-2 sm:w-3 sm:h-3 bg-red-500 rounded-full mr-2 sm:mr-3 animate-pulse"></div>
            {t('impactAnalysis')}
          </h2>
          <div className="w-8 h-8 sm:w-10 sm:h-10 lg:w-12 lg:h-12 bg-red-500/20 rounded-full flex items-center justify-center border-2 border-red-500">
            <AlertTriangle className="w-4 h-4 sm:w-5 sm:h-5 lg:w-6 lg:h-6 text-red-400" />
          </div>
        </div>
        <p className="text-gray-300 text-xs sm:text-sm">{t('detailedSimulationResults')}</p>
      </div>

      <InfoSection 
        title={t('selected-asteroid')} 
        icon={<Telescope className="w-6 h-6" />} 
        bgColor="from-blue-600/20 to-purple-600/20"
        borderColor="border-blue-500/50"
        iconBg="bg-blue-500/20"
        iconBorder="border-blue-500"
        infoTerm="selected-asteroid"
      >
        <StatItem 
          label={t('name')} 
          value={source.name} 
          valueColor="text-blue-300 font-bold"
          icon={<div className="w-2 h-2 bg-blue-400 rounded-full"></div>}
          infoTerm="name" 
        />
        <StatItem 
          label={t('est_diameter')} 
          value={source.diameter} 
          valueColor="text-green-300 font-semibold"
          icon={<Ruler size={14} className="text-green-400" />}
          infoTerm="est_diameter" 
        />
        <StatItem 
          label={t('relative-velocity')} 
          value={source.velocity} 
          valueColor="text-orange-300 font-semibold"
          icon={<Activity size={14} className="text-orange-400" />}
          infoTerm="relative-velocity" 
        />
        {!isCustomSimulation && (
          <>
            <StatItem 
              label={t('close-approach')} 
              value={source.closeApproachDate} 
              valueColor="text-yellow-300 font-medium"
              icon={<div className="w-2 h-2 bg-yellow-400 rounded-full"></div>}
              infoTerm="close-approach" 
            />
            <StatItem 
              label={t('miss-distance')} 
              value={source.missDistance} 
              valueColor="text-cyan-300 font-medium"
              icon={<div className="w-2 h-2 bg-cyan-400 rounded-full"></div>}
              infoTerm="miss-distance" 
            />
          </>
        )}
        <StatItem 
          label={t('abs-magnitude')} 
          value={source.absoluteMagnitude} 
          valueColor="text-purple-300 font-medium"
          icon={<div className="w-2 h-2 bg-purple-400 rounded-full"></div>}
          infoTerm="abs-magnitude" 
        />
        <StatItem
          label={t('potentially-hazardous')}
          value={source.isPotentiallyHazardous ? `${t('yes')}` : `${t('no')}`}
          valueColor={source.isPotentiallyHazardous ? 'text-red-400 font-bold' : 'text-green-400 font-bold'}
          icon={source.isPotentiallyHazardous ? 
            <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse"></div> : 
            <div className="w-3 h-3 bg-green-500 rounded-full"></div>
          }
          infoTerm="potentially-hazardous"
        />

        {source.jplUrl && source.jplUrl !== 'N/A' && source.jplUrl !== null && (
          <div className="mt-4 pt-4 border-t border-gray-600">
            <a 
              href={source.jplUrl} 
              target="_blank" 
              rel="noopener noreferrer" 
              className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600 text-white font-semibold rounded-full text-sm transition-all duration-300 transform hover:scale-105 hover:shadow-lg"
            >
              <ExternalLink className="w-4 h-4 mr-2" />
              {t('view-jpl-database')}
            </a>
          </div>
        )}
      </InfoSection>

      {details.surface && (
        <InfoSection 
          title={t('surface-analysis')} 
          icon={details.surface.type === 'water' ? <Waves className="w-6 h-6" /> : <Mountain className="w-6 h-6" />}
          bgColor={details.surface.type === 'water' ? "from-blue-600/20 to-cyan-600/20" : "from-green-600/20 to-emerald-600/20"}
          borderColor={details.surface.type === 'water' ? "border-blue-500/50" : "border-green-500/50"}
          iconBg={details.surface.type === 'water' ? "bg-blue-500/20" : "bg-green-500/20"}
          iconBorder={details.surface.type === 'water' ? "border-blue-500" : "border-green-500"}
          infoTerm="surface-analysis"
        >
          <StatItem 
            label={t('surface-type')} 
            value={details.surface.description} 
            valueColor={details.surface.type === 'water' ? 'text-blue-300 font-bold' : 'text-green-300 font-bold'}
            icon={details.surface.type === 'water' ? <Waves size={16} className="text-blue-400" /> : <Mountain size={16} className="text-green-400" />}
            infoTerm="surface-type"
          />
          <StatItem 
            label={t('location')} 
            value={details.surface.location} 
            valueColor="text-cyan-300 font-semibold"
            icon={<Globe size={16} className="text-cyan-400" />}
            infoTerm="location"
          />
          <StatItem 
            label={t('confidence')} 
            value={details.surface.confidence === 'high' ? t('high') || 'Alta' : t('medium') || 'Media'} 
            valueColor={details.surface.confidence === 'high' ? 'text-green-300 font-semibold' : 'text-yellow-300 font-semibold'}
            icon={<div className={`w-2 h-2 ${details.surface.confidence === 'high' ? 'bg-green-400' : 'bg-yellow-400'} rounded-full`}></div>}
            infoTerm="confidence"
          />
          <StatItem 
            label={t('data-source')} 
            value={details.surface.source === 'pafodev_api' ? 'PafoDev API' : 
                   details.surface.source === 'local_detection' ? t('local-detection') || 'Detección Local' : 
                   details.surface.source === 'OpenStreetMap' ? (
                     <a 
                       href="https://www.openstreetmap.org" 
                       target="_blank" 
                       rel="noopener noreferrer"
                       className="text-purple-300 hover:text-purple-200 underline hover:no-underline transition-colors"
                     >
                       OpenStreetMap
                     </a>
                   ) : details.surface.source} 
            valueColor="text-purple-300 font-medium"
            icon={<div className="w-2 h-2 bg-purple-400 rounded-full"></div>}
            infoTerm="data-source"
          />
          
          {details.surface.countryInfo && details.surface.countryInfo.country && (
            <>
              <StatItem 
                label={t('country')} 
                value={details.surface.countryInfo.country} 
                valueColor="text-indigo-300 font-bold"
                icon={<Globe size={16} className="text-indigo-400" />}
                infoTerm="country"
              />
              {details.surface.countryInfo.population && (
                <StatItem 
                  label={t('population')} 
                  value={details.surface.countryInfo.population?.toLocaleString() || 'N/A'} 
                  valueColor="text-indigo-300 font-medium"
                  icon={<div className="w-2 h-2 bg-indigo-400 rounded-full"></div>}
                  infoTerm="population"
                />
              )}
              {details.surface.countryInfo.region && (
                <StatItem 
                  label={t('region')} 
                  value={details.surface.countryInfo.region} 
                  valueColor="text-indigo-300 font-medium"
                  icon={<div className="w-2 h-2 bg-indigo-400 rounded-full"></div>}
                  infoTerm="region"
                />
              )}
              {details.surface.countryInfo.city && (
                <StatItem 
                  label={t('city')} 
                  value={details.surface.countryInfo.city} 
                  valueColor="text-indigo-300 font-medium"
                  icon={<div className="w-2 h-2 bg-indigo-400 rounded-full"></div>}
                  infoTerm="city"
                />
              )}
              {details.surface.countryInfo.capital && (
                <StatItem 
                  label={t('capital') || 'Capital'} 
                  value={details.surface.countryInfo.capital} 
                  valueColor="text-indigo-300 font-medium"
                  icon={<div className="w-2 h-2 bg-indigo-400 rounded-full"></div>}
                  infoTerm="capital"
                />
              )}
              {details.surface.countryInfo.area && (
                <StatItem 
                  label={t('area') || 'Área'} 
                  value={`${details.surface.countryInfo.area.toLocaleString()} km²`} 
                  valueColor="text-indigo-300 font-medium"
                  icon={<div className="w-2 h-2 bg-indigo-400 rounded-full"></div>}
                  infoTerm="area"
                />
              )}
            </>
          )}
        </InfoSection>
      )}

      <InfoSection 
        title={t('consequences')} 
        icon={<Zap className="w-6 h-6" />}
        bgColor="from-red-600/20 to-orange-600/20"
        borderColor="border-red-500/50"
        iconBg="bg-red-500/20"
        iconBorder="border-red-500"
        infoTerm="consequences"
      >
        <StatItem 
          label={t('impact-location')} 
          value={`${t('lat')} ${position.lat.toFixed(3)}, ${t('lng')} ${position.lng.toFixed(3)}`} 
          valueColor="text-red-300 font-semibold"
          icon={<MapPin size={16} className="text-red-400" />} 
          infoTerm="impact-location" 
        />
        <StatItem 
          label={t('kinetic-energy')} 
          value={consequences.impactEnergy} 
          valueColor="text-orange-300 font-bold"
          icon={<Gauge size={16} className="text-orange-400" />} 
          infoTerm="kinetic-energy" 
        />
        <StatItem 
          label={t('seismic-effect')} 
          value={consequences.seismicEffect} 
          valueColor="text-yellow-300 font-semibold"
          icon={<Scale size={16} className="text-yellow-400" />} 
          infoTerm="seismic-effect" 
        />
        <StatItem 
          label={t('air-blast')} 
          value={consequences.airBlast} 
          valueColor="text-pink-300 font-semibold"
          icon={<Wind size={16} className="text-pink-400" />} 
          infoTerm="air-blast" 
        />
        
        {consequences.primaryEffect && (
          <StatItem 
            label={t('primary-effect')} 
            value={consequences.primaryEffect} 
            valueColor={consequences.primaryEffect.includes('Tsunami') || consequences.primaryEffect.includes('tsunami') ? 'text-blue-300 font-bold' : 'text-orange-300 font-bold'}
            icon={consequences.primaryEffect.includes('Tsunami') || consequences.primaryEffect.includes('tsunami') ? 
              <Waves size={16} className="text-blue-400" /> : 
              <Mountain size={16} className="text-orange-400" />
            }
            infoTerm="primary-effect"
          />
        )}

        {consequences.tsunamiHeight && (
          <>
            <StatItem 
              label={t('tsunami-height')} 
              value={consequences.tsunamiHeight} 
              valueColor="text-blue-300 font-bold"
              icon={<Waves size={16} className="text-blue-400" />}
              infoTerm="tsunami-height"
            />
            <StatItem 
              label={t('tsunami-range')} 
              value={consequences.tsunamiRange} 
              valueColor="text-blue-300 font-semibold"
              icon={<div className="w-2 h-2 bg-blue-400 rounded-full"></div>}
              infoTerm="tsunami-range"
            />
            <StatItem 
              label={t('coastal-impact')} 
              value={consequences.coastalImpact} 
              valueColor={consequences.coastalImpact === 'CRÍTICO' ? 'text-red-300 font-bold' : 'text-yellow-300 font-semibold'}
              icon={<div className={`w-3 h-3 ${consequences.coastalImpact === 'CRÍTICO' ? 'bg-red-500 animate-pulse' : 'bg-yellow-400'} rounded-full`}></div>}
              infoTerm="coastal-impact"
            />
          </>
        )}

        {consequences.fireballRadius && (
          <>
            <StatItem 
              label={t('fireball-radius')} 
              value={consequences.fireballRadius} 
              valueColor="text-orange-300 font-bold"
              icon={<div className="w-3 h-3 bg-orange-500 rounded-full animate-pulse"></div>}
              infoTerm="fireball-radius"
            />
            <StatItem 
              label={t('seismic-range')} 
              value={consequences.seismicRange} 
              valueColor="text-orange-300 font-semibold"
              icon={<Scale size={16} className="text-orange-400" />}
              infoTerm="seismic-range"
            />
            <StatItem 
              label={t('ground-effect')} 
              value={consequences.groundEffect} 
              valueColor={consequences.groundEffect?.includes('TOTAL') ? 'text-red-300 font-bold' : 'text-yellow-300 font-semibold'}
              icon={<div className={`w-3 h-3 ${consequences.groundEffect?.includes('TOTAL') ? 'bg-red-500 animate-pulse' : 'bg-yellow-400'} rounded-full`}></div>}
              infoTerm="ground-effect"
            />
          </>
        )}

        {consequences.craterInfo && (
          <StatItem 
            label={t('crater-info')} 
            value={consequences.craterInfo} 
            valueColor="text-gray-300 font-semibold"
            icon={<Ruler size={16} className="text-gray-400" />}
            infoTerm="crater-info"
          />
        )}

        {consequences.devastationRadius && (
          <StatItem 
            label={t('devastation-radius')} 
            value={consequences.devastationRadius} 
            valueColor="text-red-300 font-bold"
            icon={<div className="w-3 h-3 bg-red-500 rounded-full animate-pulse"></div>}
            infoTerm="devastation-radius"
          />
        )}

        {consequences.specialEffects && consequences.specialEffects.length > 0 && (
          <div className="mt-4 p-3 bg-gray-700/50 rounded-lg border border-gray-600">
            <p className="text-gray-300 text-sm font-semibold mb-2 flex items-center">
              <AlertTriangle size={16} className="text-yellow-400 mr-2" />
              {t('special-effects')}:
              <InfoButton term="special-effects" />
            </p>
            <ul className="text-xs text-gray-300 space-y-1">
              {consequences.specialEffects.map((effect, index) => (
                <li key={index} className="flex items-center">
                  <div className="w-1 h-1 bg-cyan-400 rounded-full mr-2 animate-pulse"></div>
                  <span className="text-cyan-200">{effect}</span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </InfoSection>

      <InfoSection 
        title={t('mitigation-report')} 
        icon={<ShieldCheck className="w-6 h-6" />}
        bgColor="from-green-600/20 to-emerald-600/20"
        borderColor="border-green-500/50"
        iconBg="bg-green-500/20"
        iconBorder="border-green-500"
        infoTerm="mitigation-report"
      >
        <StatItem
          label={t('threat-level')}
          value={t(`mitigation.threatlevel.${mitigation.threatLevel}`)}
          valueColor={source.isPotentiallyHazardous ? 'text-yellow-300 font-bold text-lg' : 'text-green-300 font-bold'}
          icon={source.isPotentiallyHazardous ? 
            <div className="w-4 h-4 bg-yellow-500 rounded-full animate-pulse"></div> : 
            <div className="w-4 h-4 bg-green-500 rounded-full"></div>
          }
          infoTerm="threat-level"
        />
        <StatItemWide 
          label={t('recommended-action')} 
          value={mitigation.recommendedAction} 
          valueColor="text-emerald-300 font-medium"
          icon={<ShieldCheck size={16} className="text-emerald-400" />}
          infoTerm="recommended-action" 
        />
        
        {mitigation.evacuationRadius && mitigation.evacuationRadius !== 'N/A km' && (
          <StatItem 
            label={t('evacuation-radius')} 
            value={mitigation.evacuationRadius} 
            valueColor="text-red-300 font-bold"
            icon={<div className="w-3 h-3 bg-red-500 rounded-full animate-pulse"></div>}
            infoTerm="evacuation-radius"
          />
        )}
      </InfoSection>

      <div className="flex justify-center pt-2 sm:pt-3 lg:pt-4">
        <button 
          onClick={resetImpact}
          className="group relative px-4 sm:px-6 lg:px-8 py-2 sm:py-2.5 lg:py-3 bg-gradient-to-r from-gray-700 to-gray-800 hover:from-gray-600 hover:to-gray-700 text-white font-bold rounded-full border-2 border-gray-500 hover:border-gray-400 transition-all duration-300 transform hover:scale-105 hover:shadow-xl text-sm sm:text-base"
        >
          <span className="flex items-center">
            <div className="w-2 h-2 bg-red-400 rounded-full mr-2 sm:mr-3 group-hover:animate-ping"></div>
            {t('reset-simulation')}
          </span>
        </button>
      </div>
    </div>
  );
}

const InfoSection = ({ title, icon, children, infoTerm, bgColor, borderColor, iconBg, iconBorder }) => (
  <div className={`bg-gradient-to-br ${bgColor} backdrop-blur-sm rounded-xl lg:rounded-2xl p-3 sm:p-4 lg:p-6 border-2 ${borderColor} shadow-xl hover:shadow-2xl transition-all duration-300 group hover:scale-[1.02]`}>
    <div className="flex items-center mb-2 sm:mb-3 lg:mb-4">
      <div className={`w-8 h-8 sm:w-10 sm:h-10 lg:w-12 lg:h-12 ${iconBg} rounded-full flex items-center justify-center border-2 ${iconBorder} mr-3 sm:mr-4 group-hover:scale-110 transition-transform duration-300`}>
        {React.cloneElement(icon, { className: "text-current w-4 h-4 sm:w-5 sm:h-5 lg:w-6 lg:h-6" })}
      </div>
      <div className="flex-1 min-w-0">
        <h3 className="text-sm sm:text-lg lg:text-xl font-bold text-white flex items-center">
          <span className="truncate">{title}</span>
          {infoTerm && <InfoButton term={infoTerm} />}
        </h3>
        <div className="w-12 sm:w-14 lg:w-16 h-0.5 sm:h-1 bg-gradient-to-r from-cyan-400 to-blue-500 rounded-full mt-1"></div>
      </div>
    </div>
    <div className="space-y-2 sm:space-y-3 pl-1 sm:pl-2">
      {children}
    </div>
  </div>
);

const StatItem = ({ label, value, valueColor = 'text-white', icon = null, infoTerm }) => (
  <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center p-2 sm:p-3 bg-gray-800/30 rounded-lg sm:rounded-xl border border-gray-600/50 hover:bg-gray-700/30 transition-all duration-200 group">
    <div className="flex items-center mb-1 sm:mb-0">
      {icon && <span className="mr-2 sm:mr-3 flex-shrink-0">{icon}</span>}
      <p className="text-gray-300 font-medium flex items-center text-xs sm:text-sm">
        {label}:
        {infoTerm && <InfoButton term={infoTerm} />}
      </p>
    </div>
    <p className={`font-bold text-left sm:text-right ${valueColor} group-hover:scale-105 transition-transform duration-200 text-xs sm:text-sm break-words`}>
      {value}
    </p>
  </div>
);

const StatItemWide = ({ label, value, valueColor = 'text-white', icon = null, infoTerm }) => (
  <div className="p-3 sm:p-4 bg-gray-800/30 rounded-lg sm:rounded-xl border border-gray-600/50 hover:bg-gray-700/30 transition-all duration-200 group">
    <div className="flex items-center mb-2 sm:mb-3">
      {icon && <span className="mr-2 sm:mr-3 flex-shrink-0">{icon}</span>}
      <p className="text-gray-300 font-medium flex items-center text-xs sm:text-sm">
        {label}:
        {infoTerm && <InfoButton term={infoTerm} />}
      </p>
    </div>
    <div className={`${valueColor} font-medium leading-relaxed group-hover:scale-[1.02] transition-transform duration-200 pl-0 sm:pl-1 text-xs sm:text-sm break-words`}>
      {value}
    </div>
  </div>
);
