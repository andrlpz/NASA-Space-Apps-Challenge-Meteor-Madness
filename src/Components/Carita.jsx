import React, { useMemo, useState, useEffect } from 'react'
import { useSelector } from 'react-redux'
import { useTranslation } from 'react-i18next'
import COUNTRIES_DATA from '../assets/countries.json'

function Confetti({ show }) {
  // no hooks here — safe to mount/unmount
  if (!show) return null
  const pieces = Array.from({ length: 140 }).map((_, i) => {
    const left = Math.random() * 100
    const size = 6 + Math.random() * 10
    const dur = 6 + Math.random() * 4
    const delay = Math.random() * 0.8
    const rot = Math.random() * 360
    const hue = Math.floor(Math.random() * 360)
    return { left, size, dur, delay, rot, color: `hsl(${hue} 90% 60%)` }
  })
  return (
    <div className="fixed inset-0 pointer-events-none z-[13000] overflow-hidden">
      {pieces.map((p, i) => (
        <span
          key={i}
          style={{
            position: 'absolute',
            top: '-10vh',
            left: `${p.left}%`,
            width: p.size,
            height: p.size * 1.6,
            background: p.color,
            transform: `rotate(${p.rot}deg)`,
            animation: `cf-fall ${p.dur}s linear ${p.delay}s forwards`
          }}
        />
      ))}
      <style>{`
        @keyframes cf-fall {
          0% { transform: translate3d(0,-100vh,0) rotate(0deg); opacity: 1 }
          100% { transform: translate3d(0,120vh,0) rotate(720deg); opacity: 1 }
        }
      `}</style>
    </div>
  )
}

function SadFace({ show }) {
  if (!show) return null
  return (
    <div className="fixed inset-0 pointer-events-none z-[13000] flex items-center justify-center">
      <div className="text-8xl animate-bounce">😢</div>
    </div>
  )
}

export default function Carita({ goodThreshold = 100000, excellentThreshold = 10000 }) {
  // Always call hooks in the same order:
  const { t } = useTranslation()
  const impact = useSelector(s => s.impact.impactEvent)
  const sliderDiameterMeters = useSelector(s => s.impact.diameter)
  const sliderVelocityKms = useSelector(s => s.impact.velocity)
  const { country } = useSelector((state) => state.impact);
  
  const [isConfigOpen, setIsConfigOpen] = useState(false);

  useEffect(() => {
    const handleClick = (e) => {
      // Check if click is on settings button or config panel
      const isSettingsButton = e.target.closest('button')?.title?.toLowerCase().includes('settings') ||
                              e.target.closest('button')?.querySelector('svg')?.classList.contains('lucide-settings') ||
                              e.target.closest('[title*="settings"]');
      
      const isConfigPanel = e.target.closest('div')?.classList.contains('z-[9000]') ||
                           e.target.closest('[class*="fixed"][class*="bg-gray-800"]');

      if (isSettingsButton) {
        setIsConfigOpen(prev => !prev);
      } else if (!isConfigPanel && isConfigOpen) {
        // Click outside config panel, close it
        setIsConfigOpen(false);
      }
    };

    document.addEventListener('click', handleClick);
    return () => document.removeEventListener('click', handleClick);
  }, [isConfigOpen]);

  const center = impact?.position ? { lat: impact.position.lat, lng: impact.position.lng } : null

  const diameterMeters = useMemo(() => {
    if (Number.isFinite(sliderDiameterMeters)) return sliderDiameterMeters
    const s = impact?.details?.source?.diameter
    if (typeof s === 'string') {
      const n = parseFloat(s.replace(/[^0-9.]/g, ''))
      if (!isNaN(n)) return n
    }
    return 1000
  }, [sliderDiameterMeters, impact])

  const velocityKms = useMemo(() => {
    if (Number.isFinite(sliderVelocityKms)) return sliderVelocityKms
    const s = impact?.details?.source?.velocity
    if (typeof s === 'string') {
      const n = parseFloat(s.replace(/[^0-9.]/g, ''))
      if (!isNaN(n)) return n
    }
    return 20
  }, [sliderVelocityKms, impact])

  const diameterKm = useMemo(() => diameterMeters / 1000, [diameterMeters])
  const impactRadiusKm = useMemo(() => {
    const base = Math.max(0.5, diameterKm * 4.5)
    const vf = Math.pow(Math.max(velocityKms, 1) / 20, 2 / 3)
    return Math.round(base * vf)
  }, [diameterKm, velocityKms])

  const circleAreaKm2 = useMemo(() => Math.PI * impactRadiusKm * impactRadiusKm, [impactRadiusKm])

  // Get country data from Redux state
  const countryData = useMemo(() => {
    if (!country) return null
    const countryCode = country.toUpperCase()
    return COUNTRIES_DATA[countryCode] || null
  }, [country])

  const countryName = countryData?.name || null
  const population = countryData?.population || null
  const areaKm2 = countryData?.areaKm2 || null

  // These hooks must run every render (even if center is null)
  const density = population && areaKm2 ? population / areaKm2 : null
  const estimatedAffected = density ? Math.round(density * circleAreaKm2) : null
  // Check if sliders were used (Custom Asteroid Simulation)
  const isSliderSimulation = useMemo(() => {
    return impact?.details?.source?.name === 'Custom Asteroid Simulation'
  }, [impact])

  const outcome = useMemo(() => {
    if (estimatedAffected == null) return null
    if (estimatedAffected <= 500) return 'excellent' // Show confetti for 500 or fewer people
    if (estimatedAffected <= goodThreshold) return 'good'
    return 'bad'
  }, [estimatedAffected, goodThreshold])

  // Now it's safe to hide when there is no center or config is open,
  // because all hooks above have already been called in the same order.
  if (!center || isConfigOpen) return null

  return (
    <>
      <div className="fixed bottom-2 sm:bottom-4 right-2 sm:right-4 z-[12050] max-w-xs sm:max-w-sm w-[95vw] sm:w-[92vw] lg:w-[28rem] rounded-xl border border-white/10 bg-gray-900/90 backdrop-blur px-3 sm:px-4 py-2 sm:py-3 text-white shadow-2xl">
        <div className="flex items-center justify-between">
          <div className="font-semibold text-xs sm:text-sm">{t('impact-snapshot')}</div>
          <div className="text-xs text-gray-400">{impactRadiusKm} {t('km-radius')}</div>
        </div>
        <div className="mt-1 sm:mt-2 text-xs text-gray-300">{t('lat')} {center.lat.toFixed(3)}°, {t('lng')} {center.lng.toFixed(3)}°</div>
        <div className="mt-1 text-[10px] sm:text-[11px] text-gray-400">{t('velocity')} {velocityKms.toFixed(1)} km/s • {t('diameter')} {(diameterKm).toFixed(2)} km</div>

        {country && (
          <>
            <div className="mt-2 sm:mt-3 grid grid-cols-2 gap-2 sm:gap-3">
              <div className="rounded-lg bg-black/30 p-2 sm:p-3">
                <div className="text-[10px] sm:text-[11px] text-gray-400">{t('country')}</div>
                <div className="text-xs sm:text-sm font-semibold truncate">{countryName || '—'}</div>
              </div>
              <div className="rounded-lg bg-black/30 p-2 sm:p-3">
                <div className="text-[10px] sm:text-[11px] text-gray-400">{t('people-per-km2')}</div>
                <div className="text-sm sm:text-lg font-semibold">
                  {population && areaKm2 ? Math.round(population / areaKm2).toLocaleString() : '—'}
                </div>
              </div>
              <div className="rounded-lg bg-black/30 p-2 sm:p-3">
                <div className="text-[10px] sm:text-[11px] text-gray-400">{t('population')}</div>
                <div className="text-sm sm:text-lg font-semibold">{population != null ? population.toLocaleString() : '—'}</div>
              </div>
              <div className="rounded-lg bg-black/30 p-2 sm:p-3">
                <div className="text-[10px] sm:text-[11px] text-gray-400">{t('circle-area')}</div>
                <div className="text-sm sm:text-lg font-semibold">{Math.round(Math.PI * impactRadiusKm * impactRadiusKm).toLocaleString()} km²</div>
              </div>
              <div className={`rounded-lg p-2 sm:p-3 ${outcome === 'bad' ? 'bg-red-500/20' : outcome === 'good' ? 'bg-emerald-500/20' : 'bg-cyan-500/20'} col-span-2`}>
                <div className="text-[10px] sm:text-[11px] text-gray-100">{t('estimated-affected')}</div>
                <div className="text-xl sm:text-2xl font-bold">
                  {estimatedAffected != null ? estimatedAffected.toLocaleString() : '—'}
                </div>
                <div className="text-xs mt-1">
                  {outcome === 'excellent' && t('excellent-outcome')}
                  {outcome === 'good' && t('good-outcome')}
                  {outcome === 'bad' && t('bad-outcome')}
                </div>
              </div>
            </div>

            <div className="mt-2 sm:mt-3 flex gap-2">
              <span className="text-[10px] sm:text-[11px] text-gray-400">{t('tip')}</span>
              <span className="text-[10px] sm:text-[11px] text-gray-200">{t('tip-message')}</span>
            </div>
          </>
        )}

        {!country && (
          <div className="mt-2 sm:mt-3 text-xs sm:text-sm text-gray-400">
            {t('no-country-data')}
          </div>
        )}
      </div>

      <Confetti show={outcome === 'excellent' && isSliderSimulation} />
      <SadFace show={outcome === 'bad' && isSliderSimulation} />

      {outcome === 'bad' && isSliderSimulation && (
        <div className="fixed inset-x-2 sm:inset-x-0 top-4 z-[12040] mx-auto w-max max-w-[90vw] sm:max-w-none rounded-full bg-red-600 text-white text-xs sm:text-sm px-3 sm:px-4 py-2 shadow-lg">
          {t('many-lives-risk')}
        </div>
      )}
    </>
  )
}
