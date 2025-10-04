import React from 'react';

import { Zap, ShieldCheck, MapPin, Telescope, Gauge, Scale, Wind, ExternalLink, Ruler } from 'lucide-react';

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

  return (
    <div className="flex-grow overflow-y-auto pr-2">

      <InfoSection title={t('selected-asteroid')} icon={<Telescope className="w-5 h-5" />}>
        <StatItem label={t('name')} value={source.name} />
        <StatItem label={t('est_diameter')} value={source.diameter} />
        <StatItem label={t('relative-velocity')} value={source.velocity} />
        <StatItem label={t('close-approach')} value={source.closeApproachDate} />

        <StatItem label={t('miss-distance')} value={source.missDistance} />

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

      <InfoSection title={t('consequences')} icon={<Zap className="w-5 h-5" />}>
        <StatItem label={t('impact-location')} value={`${t('lat')} ${position.lat.toFixed(3)}, ${t('lng')} ${position.lng.toFixed(3)}`} icon={<MapPin size={16} className="text-gray-400" />} />
        <StatItem label={t('kinetic-energy')} value={consequences.impactEnergy} icon={<Gauge size={16} className="text-gray-400" />} />
        <StatItem label={t('seismic-effect')} value={consequences.seismicEffect} icon={<Scale size={16} className="text-gray-400" />} />
        <StatItem label={t('air-blast')} value={consequences.airBlast} icon={<Wind size={16} className="text-gray-400" />} />
      </InfoSection>

      <InfoSection title={t('mitigation-report')} icon={<ShieldCheck className="w-5 h-5" />}>
        <StatItem
          label={t('threat-level')}
          value={t(`mitigation.threatlevel.${mitigation.threatLevel}`)}
          valueColor={source.isPotentiallyHazardous ? 'text-yellow-400 font-bold' : 'text-gray-300'}
        />
        <StatItem label={t('recommended-action')} value={mitigation.recommendedAction} />
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
