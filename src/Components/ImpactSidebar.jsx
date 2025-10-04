import React from 'react';
import { Zap, ShieldCheck, MapPin, Telescope, Gauge, Scale, Wind, ExternalLink } from 'lucide-react';
import { useTranslation } from 'react-i18next';

const InfoSection = ({ title, icon, children, theme, colorblindType = 'deuteranopia' }) => {
  const getColorblindColors = () => {
    switch (colorblindType) {
      case 'protanopia':
        return {
          bg: 'bg-[#4477AA]',
          text: 'text-[#CCBB44]',
          accent: 'text-[#66CCEE]'
        };
      case 'deuteranopia':
        return {
          bg: 'bg-[#332288]',
          text: 'text-[#DDCC77]',
          accent: 'text-[#88CCEE]'
        };
      case 'tritanopia':
        return {
          bg: 'bg-[#004488]',
          text: 'text-[#BB5566]',
          accent: 'text-[#77CCFF]'
        };
      default:
        return {
          bg: 'bg-[#332288]',
          text: 'text-[#DDCC77]',
          accent: 'text-[#88CCEE]'
        };
    }
  };

  const colors = theme === 'colorblind' ? getColorblindColors() : null;

  return (
    <div className={`mb-5 lg:mb-6 p-4 lg:p-5 rounded-lg ${
      theme === 'dark' ? 'bg-gray-700/30' :
      theme === 'colorblind' ? `${colors.bg} border border-white/20` :
      'bg-white shadow-sm border border-gray-200'
    }`}>
      <h3 className={`text-lg lg:text-xl font-semibold flex items-center mb-4 lg:mb-4 ${
        theme === 'dark' ? 'text-gray-300' :
        theme === 'colorblind' ? (
          colorblindType === 'protanopia' ? 'text-[#66CCEE]' :
          colorblindType === 'deuteranopia' ? 'text-[#88CCEE]' :
          'text-[#77CCFF]'
        ) :
        'text-gray-800'
      }`}>
        {React.cloneElement(icon, { 
          className: `mr-2 ${
            theme === 'dark' ? 'text-cyan-400' :
            theme === 'colorblind' ? colors.accent :
            'text-cyan-600'
          }`
        })}
        {title}
      </h3>
      <div className="space-y-2">
        {children}
      </div>
    </div>
  );
};

const StatItem = ({ label, value, valueColor = 'text-gray-900', icon = null, theme, colorblindType = 'deuteranopia' }) => {
  const getColorblindColors = () => {
    switch (colorblindType) {
      case 'protanopia':
        return {
          bg: 'bg-[#4477AA]',
          label: 'text-[#CCBB44]',
          value: 'text-[#66CCEE]',
          icon: 'text-[#CCBB44]',
          warning: 'text-[#CCBB44]'
        };
      case 'deuteranopia':
        return {
          bg: 'bg-[#332288]',
          label: 'text-[#DDCC77]',
          value: 'text-[#88CCEE]',
          icon: 'text-[#DDCC77]',
          warning: 'text-[#DDCC77]'
        };
      case 'tritanopia':
        return {
          bg: 'bg-[#004488]',
          label: 'text-[#BB5566]',
          value: 'text-[#77CCFF]',
          icon: 'text-[#BB5566]',
          warning: 'text-[#BB5566]'
        };
      default:
        return {
          bg: 'bg-[#332288]',
          label: 'text-[#DDCC77]',
          value: 'text-[#88CCEE]',
          icon: 'text-[#DDCC77]',
          warning: 'text-[#DDCC77]'
        };
    }
  };

  const colors = theme === 'colorblind' ? getColorblindColors() : null;

  return (
    <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-2 lg:gap-3 text-base lg:text-sm mb-4 lg:mb-2">
      <p className={`flex items-center min-w-[120px] lg:min-w-[120px] ${
        theme === 'dark' ? 'text-gray-400' :
        theme === 'colorblind' ? colors.label :
        'text-gray-600'
      }`}>
        {icon && <span className={`mr-1 lg:mr-2 w-4 h-4 lg:w-5 lg:h-5 ${
          theme === 'colorblind' ? colors.icon : ''
        }`}>{icon}</span>}
        {label}:
      </p>
      <p className={`font-medium break-words max-w-full lg:max-w-[60%] ${
        theme === 'light' ? 'text-gray-900' :
        theme === 'colorblind' ? (
          valueColor.includes('warning') ? colors.warning : 
          valueColor.includes('#') ? valueColor :
          colors.value
        ) :
        theme === 'dark' ? 'text-white' :
        valueColor
      }`}>{value}</p>
    </div>
  );
};

export default function ImpactSidebar({ impact, resetImpact, theme = 'dark', colorblindType = 'deuteranopia' }) {
  const { t } = useTranslation();

  if (!impact) {
    return (
      <div className="flex-grow flex items-center justify-center p-2 lg:p-4">
        <div className={`text-center p-3 lg:p-4 border-2 border-dashed rounded-lg max-w-xs lg:max-w-sm mx-auto ${
          theme === 'colorblind' ? 'border-white' : 'border-gray-600'
        }`}>
          <p className={`font-medium ${theme === 'colorblind' ? 'text-white' : 'text-gray-300'}`}>
            {t('click-to-simulate')}
          </p>
          <p className={`text-sm mt-2 ${theme === 'colorblind' ? 'text-white/70' : 'text-gray-500'}`}>
            {t('sidebar-description')}
          </p>
        </div>
      </div>
    );
  }

  const { details, position } = impact;
  const { source, consequences, mitigation } = details;

  return (
    <div className="flex-grow overflow-y-auto px-3 lg:px-4 lg:pr-4 xl:pr-6 max-w-full lg:max-w-md lg:max-w-lg xl:max-w-xl mx-auto lg:mx-0 h-[75vh] lg:h-auto pb-4 lg:pb-0">
      <InfoSection title={t('selected-asteroid')} icon={<Telescope className="w-4 lg:w-5 h-4 lg:h-5" />} theme={theme} colorblindType={colorblindType}>
        <StatItem label={t('name')} value={source.name} theme={theme} colorblindType={colorblindType} />
        <StatItem label={t('est_diameter')} value={source.diameter} theme={theme} colorblindType={colorblindType} />
        <StatItem label={t('relative-velocity')} value={source.velocity} theme={theme} colorblindType={colorblindType} />
        <StatItem label={t('close-approach')} value={source.closeApproachDate} theme={theme} colorblindType={colorblindType} />
        <StatItem label={t('miss-distance')} value={source.missDistance} theme={theme} colorblindType={colorblindType} />
        <StatItem label={t('abs-magnitude')} value={source.absoluteMagnitude} theme={theme} colorblindType={colorblindType} />
        <StatItem
          label={t('potentially-hazardous')}
          value={source.isPotentiallyHazardous ? `${t('yes')}` : `${t('no')}`}
          valueColor={
            theme === 'colorblind'
              ? source.isPotentiallyHazardous
                ? colorblindType === 'protanopia'
                  ? 'text-[#CCBB44]'
                  : colorblindType === 'deuteranopia'
                    ? 'text-[#DDCC77]'
                    : 'text-[#BB5566]'
                : 'text-white'
              : source.isPotentiallyHazardous
                ? 'text-red-500'
                : 'text-green-500'
          }
          theme={theme}
        />

        <a 
          href={source.jplUrl} 
          target="_blank" 
          rel="noopener noreferrer" 
          className={`text-base lg:text-sm flex items-center mt-4 lg:mt-3 py-2 lg:py-0 transition-colors ${
            theme === 'colorblind'
              ? 'text-white hover:text-white/80'
              : 'text-cyan-400 hover:text-cyan-300'
          }`}
        >
          {t('view-jpl-database')} <ExternalLink className="w-4 h-4 ml-2" />
        </a>
      </InfoSection>

      <InfoSection title={t('consequences')} icon={<Zap className="w-5 h-5" />} theme={theme} colorblindType={colorblindType}>
        <StatItem 
          label={t('impact-location')} 
          value={`${t('lat')} ${position.lat.toFixed(3)}, ${t('lng')} ${position.lng.toFixed(3)}`} 
          icon={<MapPin size={16} />}
          theme={theme}
          colorblindType={colorblindType} 
        />
        <StatItem 
          label={t('kinetic-energy')} 
          value={consequences.impactEnergy} 
          icon={<Gauge size={16} />}
          theme={theme}
          colorblindType={colorblindType}
        />
        <StatItem 
          label={t('seismic-effect')} 
          value={consequences.seismicEffect} 
          icon={<Scale size={16} />}
          theme={theme}
          colorblindType={colorblindType}
        />
        <StatItem 
          label={t('air-blast')} 
          value={consequences.airBlast} 
          icon={<Wind size={16} />}
          theme={theme}
          colorblindType={colorblindType} 
        />
      </InfoSection>

      <InfoSection title={t('mitigation-report')} icon={<ShieldCheck className="w-5 h-5" />} theme={theme} colorblindType={colorblindType}>
        <StatItem
          label={t('threat-level')}
          value={t(`mitigation.threatlevel.${mitigation.threatLevel}`)}
          valueColor={
            theme === 'colorblind'
              ? source.isPotentiallyHazardous
                ? colorblindType === 'protanopia'
                  ? 'text-[#CCBB44] font-bold'
                  : colorblindType === 'deuteranopia'
                    ? 'text-[#DDCC77] font-bold'
                    : 'text-[#BB5566] font-bold'
                : 'text-white'
              : source.isPotentiallyHazardous
                ? theme === 'light'
                  ? 'text-amber-600 font-bold'
                  : 'text-yellow-400 font-bold'
                : theme === 'light'
                  ? 'text-gray-600'
                  : 'text-gray-300'
          }
          theme={theme}
          colorblindType={colorblindType}
        />
        <StatItem 
          label={t('recommended-action')} 
          value={mitigation.recommendedAction}
          theme={theme} 
          colorblindType={colorblindType}
        />
      </InfoSection>

      <div className="hidden lg:flex justify-center mt-6 lg:mt-6">
        <button 
          onClick={resetImpact} 
          className={`w-full lg:w-auto px-4 lg:px-4 py-3 lg:py-2 rounded-lg text-sm lg:text-sm transform transition duration-200 hover:-translate-y-1 hover:shadow-md ${
            theme === 'light' 
              ? 'border border-gray-200 bg-white text-gray-600 hover:bg-gray-50' 
              : theme === 'colorblind'
                ? 'border border-white bg-white/10 text-white hover:bg-white/20'
                : 'border border-neutral-300 bg-neutral-100 text-neutral-500'
          }`}
        >
          {t('reset-simulation')}
        </button>
      </div>
    </div>
  );
}