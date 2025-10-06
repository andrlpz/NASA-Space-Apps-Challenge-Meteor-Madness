import React, { useMemo } from 'react'
import { useSelector } from 'react-redux'
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
  const impact = useSelector(s => s.impact.impactEvent)
  const sliderDiameterMeters = useSelector(s => s.impact.diameter)
  const sliderVelocityKms = useSelector(s => s.impact.velocity)
  const { country } = useSelector((state) => state.impact);

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

  // Now it's safe to hide when there is no center,
  // because all hooks above have already been called in the same order.
  if (!center) return null

  return (
    <>
      <div className="fixed bottom-4 right-4 z-[12050] max-w-sm w-[92vw] sm:w-[28rem] rounded-xl border border-white/10 bg-gray-900/90 backdrop-blur px-4 py-3 text-white shadow-2xl">
        <div className="flex items-center justify-between">
          <div className="font-semibold text-sm">Impact Snapshot</div>
          <div className="text-xs text-gray-400">{impactRadiusKm} km radius</div>
        </div>
        <div className="mt-2 text-xs text-gray-300">Lat {center.lat.toFixed(3)}°, Lng {center.lng.toFixed(3)}°</div>
        <div className="mt-1 text-[11px] text-gray-400">Velocity {velocityKms.toFixed(1)} km/s • Diameter {(diameterKm).toFixed(2)} km</div>

        {country && (
          <>
            <div className="mt-3 grid grid-cols-2 gap-3">
              <div className="rounded-lg bg-black/30 p-3">
                <div className="text-[11px] text-gray-400">Country</div>
                <div className="text-sm font-semibold">{countryName || '—'}</div>
              </div>
              <div className="rounded-lg bg-black/30 p-3">
                <div className="text-[11px] text-gray-400">People/km²</div>
                <div className="text-lg font-semibold">
                  {population && areaKm2 ? Math.round(population / areaKm2).toLocaleString() : '—'}
                </div>
              </div>
              <div className="rounded-lg bg-black/30 p-3">
                <div className="text-[11px] text-gray-400">Population</div>
                <div className="text-lg font-semibold">{population != null ? population.toLocaleString() : '—'}</div>
              </div>
              <div className="rounded-lg bg-black/30 p-3">
                <div className="text-[11px] text-gray-400">Circle area</div>
                <div className="text-lg font-semibold">{Math.round(Math.PI * impactRadiusKm * impactRadiusKm).toLocaleString()} km²</div>
              </div>
              <div className={`rounded-lg p-3 ${outcome === 'bad' ? 'bg-red-500/20' : outcome === 'good' ? 'bg-emerald-500/20' : 'bg-cyan-500/20'} col-span-2`}>
                <div className="text-[11px] text-gray-100">Estimated affected</div>
                <div className="text-2xl font-bold">
                  {estimatedAffected != null ? estimatedAffected.toLocaleString() : '—'}
                </div>
                <div className="text-xs mt-1">
                  {outcome === 'excellent' && '🎉 Excellent! Minimal casualties. Great job!'}
                  {outcome === 'good' && 'Good outcome. You reduced the impact significantly.'}
                  {outcome === 'bad' && '😢 High impact. Many lives at risk. Reduce velocity or size!'}
                </div>
              </div>
            </div>

            <div className="mt-3 flex gap-2">
              <span className="text-[11px] text-gray-400">Tip:</span>
              <span className="text-[11px] text-gray-200">Lower velocity or diameter to shrink the impact radius.</span>
            </div>
          </>
        )}

        {!country && (
          <div className="mt-3 text-sm text-gray-400">
            No country data available for this location
          </div>
        )}
      </div>

      <Confetti show={outcome === 'excellent' && isSliderSimulation} />
      <SadFace show={outcome === 'bad' && isSliderSimulation} />

      {outcome === 'bad' && isSliderSimulation && (
        <div className="fixed inset-x-0 top-4 z-[12040] mx-auto w-max rounded-full bg-red-600 text-white text-sm px-4 py-2 shadow-lg">
          😢 Many lives at risk! Try lowering velocity or size to save more people
        </div>
      )}
    </>
  )
}
