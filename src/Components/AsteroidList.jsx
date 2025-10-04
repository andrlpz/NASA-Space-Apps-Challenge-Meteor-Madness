import React, { useState } from "react";
import { useTranslation } from 'react-i18next'
import i18next from 'i18next'
import cookies from 'js-cookie'



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
    <div className="flex flex-col h-[45vh] md:h-96">
      <p className={`text-sm font-semibold mb-2 ${styles.text}`}>
        {t('current')} {selectedName}
      </p>
      <div className="flex-1 overflow-y-auto mt-2 sm:mt-4 space-y-1.5 sm:space-y-2">
        {asteroids.map((a) => {
          const diameter = a.estimated_diameter.meters.estimated_diameter_max.toFixed(0);
          const velocity = parseFloat(
            a.close_approach_data[0].relative_velocity.kilometers_per_second
          ).toFixed(1);

          const isSelected = selectedId === a.id;

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
        <p className={`text-xs mt-2 ${theme === 'light' ? 'text-green-600' : 'text-green-500'}`}>
          {t('click_stimulate')}
        </p>
      )}
    </div>
  );
}