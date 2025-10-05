import React, { useEffect, useMemo, useState } from 'react'
import { useSelector } from 'react-redux'

const MOCK_COUNTRIES = {
  US: { name: 'United States', population: 331002651, areaKm2: 9833520 },
  MX: { name: 'Mexico', population: 128932753, areaKm2: 1964375 },
  BR: { name: 'Brazil', population: 212559417, areaKm2: 8515767 },
  ES: { name: 'Spain', population: 47351567, areaKm2: 505944 },
  FR: { name: 'France', population: 65273511, areaKm2: 551695 },
  IN: { name: 'India', population: 1380004385, areaKm2: 3287263 },
  CN: { name: 'China', population: 1444216107, areaKm2: 9596961 },
  NG: { name: 'Nigeria', population: 206139589, areaKm2: 923768 },
}

function mockReverseGeocode(lat, lng) {
  if (lat >= 25 && lat <= 49 && lng >= -125 && lng <= -66) return { code: 'US', name: MOCK_COUNTRIES.US.name }
  if (lat >= 14 && lat <= 32 && lng >= -118 && lng <= -86) return { code: 'MX', name: MOCK_COUNTRIES.MX.name }
  if (lat >= -34 && lat <= 6 && lng >= -74 && lng <= -34) return { code: 'BR', name: MOCK_COUNTRIES.BR.name }
  if (lat >= 36 && lat <= 44 && lng >= -9.5 && lng <= 3.5) return { code: 'ES', name: MOCK_COUNTRIES.ES.name }
  if (lat >= 42 && lat <= 51 && lng >= -5 && lng <= 8) return { code: 'FR', name: MOCK_COUNTRIES.FR.name }
  if (lat >= 6 && lat <= 36 && lng >= 68 && lng <= 98) return { code: 'IN', name: MOCK_COUNTRIES.IN.name }
  if (lat >= 18 && lat <= 53 && lng >= 73 && lng <= 135) return { code: 'CN', name: MOCK_COUNTRIES.CN.name }
  if (lat >= 4 && lat <= 14 && lng >= 2 && lng <= 15) return { code: 'NG', name: MOCK_COUNTRIES.NG.name }
  return { code: 'US', name: MOCK_COUNTRIES.US.name }
}

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

export default function Carita({ mock = true, goodThreshold = 100000, excellentThreshold = 10000 }) {
  // Always call hooks in the same order:
  const impact = useSelector(s => s.impact.impactEvent)
  const sliderDiameterMeters = useSelector(s => s.impact.diameter)
  const sliderVelocityKms = useSelector(s => s.impact.velocity)

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

  const [countryCode, setCountryCode] = useState(null)
  const [countryName, setCountryName] = useState(null)
  const [population, setPopulation] = useState(null)
  const [areaKm2, setAreaKm2] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  // This effect always exists; it short-circuits if no center.
  useEffect(() => {
    let stop = false
    async function run() {
      if (!center) return
      setLoading(true)
      setError(null)
      setCountryCode(null)
      setCountryName(null)
      setPopulation(null)
      setAreaKm2(null)
      try {
        if (mock) {
          const m = mockReverseGeocode(center.lat, center.lng)
          if (stop) return
          setCountryCode(m.code)
          setCountryName(m.name)
          const row = MOCK_COUNTRIES[m.code]
          setPopulation(row.population)
          setAreaKm2(row.areaKm2)
        } else {
          const rev = await fetch(`https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${center.lat}&lon=${center.lng}&zoom=5`)
          const rj = await rev.json()
          const code = (rj?.address?.country_code || '').toUpperCase()
          const name = rj?.address?.country || rj?.display_name || 'Unknown'
          if (stop) return
          setCountryCode(code || null)
          setCountryName(name || null)
          if (code) {
            const rc = await fetch(`https://restcountries.com/v3.1/alpha/${code}`)
            const arr = await rc.json()
            const item = Array.isArray(arr) ? arr[0] : null
            const pop = item?.population ?? null
            const area = item?.area ?? null
            if (stop) return
            setPopulation(typeof pop === 'number' ? pop : null)
            setAreaKm2(typeof area === 'number' ? area : null)
          }
        }
      } catch (e) {
        if (!stop) setError('Failed to fetch')
      } finally {
        if (!stop) setLoading(false)
      }
    }
    run()
    return () => { stop = true }
  }, [center, mock])

  // These hooks must run every render (even if center is null)
  const density = population && areaKm2 ? population / areaKm2 : null
  const estimatedAffected = density ? Math.round(density * circleAreaKm2) : null
  const outcome = useMemo(() => {
    if (estimatedAffected == null) return null
    if (estimatedAffected <= excellentThreshold) return 'excellent'
    if (estimatedAffected <= goodThreshold) return 'good'
    return 'bad'
  }, [estimatedAffected, goodThreshold, excellentThreshold])

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

        {loading && <div className="mt-3 text-sm">Loading…</div>}
        {error && <div className="mt-3 text-sm text-red-400">{error}</div>}

        {!loading && !error && (
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
                <div className="text+[11px] text-gray-400">Population</div>
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
                  {outcome === 'excellent' && 'Excellent outcome. Great mitigation!'}
                  {outcome === 'good' && 'Good outcome. You reduced the impact.'}
                  {outcome === 'bad' && 'High impact. Reduce velocity or size to improve.'}
                </div>
              </div>
            </div>

            <div className="mt-3 flex gap-2">
              <span className="text-[11px] text-gray-400">Tip:</span>
              <span className="text-[11px] text-gray-200">Lower velocity or diameter to shrink the impact radius.</span>
            </div>
          </>
        )}
      </div>

      <Confetti show={outcome === 'excellent' || outcome === 'good'} />

      {outcome === 'bad' && (
        <div className="fixed inset-x-0 top-4 z-[12040] mx-auto w-max rounded-full bg-red-600 text-white text-sm px-4 py-2 shadow-lg">
          Try lowering velocity or size to save more people
        </div>
      )}
    </>
  )
}
