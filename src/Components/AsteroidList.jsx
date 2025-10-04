import React, { useState, useCallback, useEffect, useMemo } from "react";
import { useTranslation } from 'react-i18next';

export default function AsteroidList({ asteroids, onSelect }) {
  const { t } = useTranslation();
  const [selectedAsteroid, setSelectedAsteroid] = useState(null);
  const [filter, setFilter] = useState("none"); // 'size', 'velocity', 'hazardous'

  const selectedStyle = "bg-gray-600";
  const normalStyle = "bg-gray-700";

  const formatName = (name) => name.replace(/[()]/g, "");

  const handleSelect = useCallback((a) => {
    onSelect(a);
    setSelectedAsteroid(a);
  }, [onSelect]);

  useEffect(() => {
    if (selectedAsteroid) {
      const el = document.getElementById(selectedAsteroid.id);
      el?.scrollIntoView({ behavior: "smooth", block: "center" });
    }
  }, [selectedAsteroid]);

  const sortedAsteroids = useMemo(() => {
    if (!asteroids) return [];

    switch (filter) {
      case "size":
        return [...asteroids].sort((a, b) =>
          b.estimated_diameter.meters.estimated_diameter_max -
          a.estimated_diameter.meters.estimated_diameter_max
        );
      case "velocity":
        return [...asteroids].sort((a, b) =>
          parseFloat(b.close_approach_data[0].relative_velocity.kilometers_per_second) -
          parseFloat(a.close_approach_data[0].relative_velocity.kilometers_per_second)
        );
      case "hazardous":
        return [...asteroids].sort((a, b) =>
          (b.is_potentially_hazardous_asteroid ? 1 : 0) -
          (a.is_potentially_hazardous_asteroid ? 1 : 0)
        );
      default:
        return asteroids;
    }
  }, [asteroids, filter]);

  return (
    <div className="flex flex-col h-96">
      <div className="flex space-x-2 mb-2">
        <label>{t('sortby')}:</label>
        <select
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          className="bg-gray-700 text-white rounded p-1"
        >
          <option value="none">{t('none')}</option>
          <option value="size">{t('size')}</option>
          <option value="velocity">{t('velocity')}</option>
          <option value="hazardous">{t('hazardous')}</option>
        </select>
      </div>

      <p className="text-sm font-semibold mb-2">
        {t('current')} {selectedAsteroid ? formatName(selectedAsteroid.name) : ''}
      </p>

      <div className="flex-1 overflow-y-auto mt-2 space-y-2">
        {sortedAsteroids.map((a) => {
          const diameter = a.estimated_diameter.meters.estimated_diameter_max.toFixed(0);
          const velocity = parseFloat(a.close_approach_data[0].relative_velocity.kilometers_per_second).toFixed(1);
          const isSelected = selectedAsteroid?.id === a.id;

          return (
            <button
              key={a.id}
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
                <p className="text-xs text-red-400">⚠ {t('hazardous')}</p>
              )}
            </button>
          );
        })}
      </div>

      {selectedAsteroid && (
        <p className="text-xs text-green-600 mt-2">{t('click_stimulate')}</p>
      )}
    </div>
  );
}
