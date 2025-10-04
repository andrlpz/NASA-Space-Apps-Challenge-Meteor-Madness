import React, { useState, useCallback, useEffect, useMemo } from "react";
import { useTranslation } from 'react-i18next';

export default function AsteroidList({ asteroids, onSelect, theme = 'dark', colorblindType = 'deuteranopia' }) {

  const [selectedId, setSelectedId] = useState(null);
  const [selectedName, setSelectedName] = useState(null);

  const getStyles = () => {
    if (theme === 'dark') {
      return {
        selected: 'bg-gray-600',
        normal: 'bg-gray-700',
        hover: 'hover:bg-gray-500',
        text: 'text-white',
        secondaryText: 'text-gray-400'
      };
    } else if (theme === 'colorblind') {
      const colors = {
        protanopia: {
          text: 'text-white',
          background: 'bg-[#4477AA]',
          selected: 'bg-[#66CCEE]',
          secondary: 'bg-[#228833]',
          warning: 'text-[#CCBB44]'
        },
        deuteranopia: {
          text: 'text-white',
          background: 'bg-[#332288]',
          selected: 'bg-[#88CCEE]',
          secondary: 'bg-[#44AA99]',
          warning: 'text-[#DDCC77]'
        },
        tritanopia: {
          text: 'text-white',
          background: 'bg-[#004488]',
          selected: 'bg-[#77CCFF]',
          secondary: 'bg-[#DDAA33]',
          warning: 'text-[#BB5566]'
        }
      }[colorblindType] || colors.deuteranopia;

      return {
        selected: colors.selected,
        normal: colors.background,
        hover: colors.secondary.replace('bg-', 'hover:bg-'),
        text: colors.text,
        secondaryText: 'text-white/70',
        warning: colors.warning
      };
    } else { // light
      return {
        selected: 'bg-white border-2 border-cyan-500',
        normal: 'bg-white border border-gray-200',
        hover: 'hover:bg-gray-50',
        text: 'text-gray-900',
        secondaryText: 'text-gray-600'
      };
    }
  };

  const styles = getStyles();
  const { t } = useTranslation()

  return (
    <div className="flex flex-col h-[40vh] lg:h-96">
      <p className={`text-sm font-semibold mb-2 ${styles.text}`}>
        {t('current')} {selectedName}
      </p>
      <div className="flex-1 overflow-y-auto mt-2 lg:mt-4 space-y-1.5 lg:space-y-2">
        {asteroids.map((a) => {
          const diameter = a.estimated_diameter.meters.estimated_diameter_max.toFixed(0);
          const velocity = parseFloat(
            a.close_approach_data[0].relative_velocity.kilometers_per_second
          ).toFixed(1);

      <div className="flex-1 overflow-y-auto mt-2 space-y-2">
        {sortedAsteroids.map((a) => {
          const diameter = a.estimated_diameter.meters.estimated_diameter_max.toFixed(0);
          const velocity = parseFloat(a.close_approach_data[0].relative_velocity.kilometers_per_second).toFixed(1);
          const isSelected = selectedAsteroid?.id === a.id;

          return (
            <button
              key={a.id}
              onClick={() => {
                onSelect(a);
                setSelectedId(a.id);
                setSelectedName(a.name.replace(/[()]/g, ""));
              }}
              className={`w-full p-3 ${isSelected ? styles.selected : styles.normal
                } ${styles.hover} rounded-lg text-left shadow-sm transition-colors`}
            >
              <p className={`font-semibold ${styles.text}`}>
                {a.name.replace(/[()]/g, "")}
              </p>
              <p className={`text-sm ${styles.secondaryText}`}>
              id={a.id}
              aria-pressed={isSelected}
              title={formatName(a.name)}
              onClick={() => handleSelect(a)}
              className={`w-full p-3 ${isSelected ? selectedStyle : normalStyle} hover:bg-gray-500 rounded-lg text-left`}
            >
              <p className="font-semibold">{formatName(a.name)}</p>
              <p className="text-sm text-gray-400">
                {t('size')}: {diameter} m | {t('velocity')}: {velocity} km/s
              </p>
              {a.is_potentially_hazardous_asteroid && (
                <p className={`text-xs ${
                  theme === 'light' 
                    ? 'text-red-500' 
                    : theme === 'colorblind'
                      ? styles.warning
                      : 'text-red-400'
                }`}>
                  ⚠ {t('hazardous')}
                </p>
              )}
            </button>
          );
        })}
      </div>
      {selectedName && (
        <p className={`text-[10px] lg:text-xs mt-1.5 lg:mt-2 ${theme === 'light' ? 'text-green-600' : 'text-green-500'}`}>
          {t('click_stimulate')}
        </p>

      {selectedAsteroid && (
        <p className="text-xs text-green-600 mt-2">{t('click_stimulate')}</p>
      )}
    </div>
  );
}
