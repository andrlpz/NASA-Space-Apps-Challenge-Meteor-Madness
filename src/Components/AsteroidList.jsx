import React, { useState } from "react";
import { useTranslation } from 'react-i18next'
import i18next from 'i18next'
import cookies from 'js-cookie'



export default function AsteroidList({ asteroids, onSelect }) {

  const [selectedId, setSelectedId] = useState(null);
  const [selectedName, setSelectedName] = useState(null);

  const selectedStyle = "bg-gray-600";
  const normalStyle = "bg-gray-700";
  
  const { t } = useTranslation()

  return (
    <div className="flex flex-col h-96">
      <p className="text-sm font-semibold mb-2">{t('current')} {selectedName} </p>
      <div className="flex-1 overflow-y-auto mt-4 space-y-2">

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
              className={`w-full p-3 ${isSelected ? selectedStyle : normalStyle
                } hover:bg-gray-500 rounded-lg text-left`}
            >
              <p className="font-semibold">{a.name.replace(/[()]/g, "")}</p>
              <p className="text-sm text-gray-400">
                {t('size')}: {diameter} m | {t('velocity')}: {velocity} km/s
              </p>
              {a.is_potentially_hazardous_asteroid && (
                <p className="text-xs text-red-400">⚠ {t('hazardous')}</p>
              )}
            </button>
          );
        })}

      </div>
      {selectedName && (
        <p className="text-xs text-green-600 mt-2">{t('click_stimulate')}</p>)}
    </div>
  );
}