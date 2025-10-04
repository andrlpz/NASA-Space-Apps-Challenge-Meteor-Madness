import React, { useEffect, useState, useMemo } from 'react'
import { Canvas } from '@react-three/fiber'
import { OrbitControls, useGLTF } from '@react-three/drei'

import asteroide from '../assets/asteroid.glb'


const AsteroidMesh = ({ scale }) => {

  const { scene } = useGLTF(asteroide)


  const clonedScene = useMemo(() => {
    const clone = scene.clone()

    clone.traverse((child) => {
      if (child.isMesh) {
        child.castShadow = true
        child.receiveShadow = true
      }
    })
    return clone
  }, [scene])

  return <primitive object={clonedScene} scale={scale} rotation={[0.4, 0.2, 0]} />
}

const Asteroids = () => {
  const [allAsteroids, setAllAsteroids] = useState([])
  const [asteroid, setAsteroid] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchAsteroids = async () => {
      try {

        const res = await fetch(
          'https://api.pafodev.com/nasaapi/neo1'
        )
        const data = await res.json()
        const asteroidsList = data.near_earth_objects
        setAllAsteroids(asteroidsList)
        setAsteroid(asteroidsList[0])
        setLoading(false)
      } catch (error) {
        console.error('Error fetching asteroid data:', error)
        setLoading(false)
      }
    }

    fetchAsteroids()
  }, [])


  const averageDiameter = useMemo(() => {
    if (!asteroid) return 1;
    const min = asteroid.estimated_diameter.meters.estimated_diameter_min;
    const max = asteroid.estimated_diameter.meters.estimated_diameter_max;
    return (min + max) / 2;
  }, [asteroid]);


  const handleAsteroidChange = (event) => {
    const selectedId = event.target.value
    const selected = allAsteroids.find((a) => a.id === selectedId)
    setAsteroid(selected)
  }

  if (loading) {
    return (
        <div className="w-screen h-screen bg-black flex items-center justify-center">
            <p className="text-gray-400">Loading asteroid data...</p>
        </div>
    );
  }

  if (!asteroid) {
    return (
        <div className="w-screen h-screen bg-black flex items-center justify-center">
            <p className="text-red-500">Failed to load asteroid data.</p>
        </div>
    );
  }

  return (
    <div className="w-screen h-screen bg-black relative">
      <Canvas camera={{ position: [3, 3, 3], fov: 60 }} shadows>

        <ambientLight intensity={0.5} />
        <directionalLight
          position={[10, 10, 5]}
          intensity={1.5}
          castShadow
          shadow-mapSize-width={2048}
          shadow-mapSize-height={2048}
        />


        <AsteroidMesh scale={averageDiameter / 100} />


        <OrbitControls enablePan={true} enableZoom={true} enableRotate={true} />
      </Canvas>

      <div className="absolute top-4 left-4 bg-gray-900 bg-opacity-70 text-white p-4 rounded-lg shadow-lg max-w-xs">
        <label htmlFor="asteroid-select" className="block text-sm font-medium text-gray-300">
          Select Asteroid
        </label>
        <select
          id="asteroid-select"
          value={asteroid.id}
          onChange={handleAsteroidChange}
          className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-600 bg-gray-800 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
        >
          {allAsteroids.map((a) => (
            <option key={a.id} value={a.id}>
              {a.name}
            </option>
          ))}
        </select>

        <h2 className="text-lg font-bold mt-4">{asteroid.name}</h2>
        <p className="text-sm">Magnitude: {asteroid.absolute_magnitude_h}</p>
        <p className="text-sm">
          Diameter: {asteroid.estimated_diameter.meters.estimated_diameter_min.toFixed(1)} -{' '}
          {asteroid.estimated_diameter.meters.estimated_diameter_max.toFixed(1)} m
        </p>
        <p className="text-sm">
          Hazardous: {asteroid.is_potentially_hazardous_asteroid ? 'Yes' : 'No'}
        </p>
        {asteroid.close_approach_data.length > 0 && (
          <>
            <p className="text-sm mt-2 font-semibold">Next Close Approach:</p>
            <p className="text-sm">
              {asteroid.close_approach_data[0].close_approach_date_full}
            </p>
            <p className="text-sm">
              Velocity:{' '}
              {parseFloat(
                asteroid.close_approach_data[0].relative_velocity.kilometers_per_second
              ).toFixed(2)}{' '}
              km/s
            </p>
            <p className="text-sm">
              Miss Distance:{' '}
              {parseFloat(
                asteroid.close_approach_data[0].miss_distance.kilometers
              ).toLocaleString()}{' '}
              km
            </p>
          </>
        )}
      </div>

    </div>
  )
}


export default Asteroids
