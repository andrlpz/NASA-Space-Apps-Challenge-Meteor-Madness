import { useMemo, useState, useEffect } from 'react'
import { Canvas } from '@react-three/fiber'
import { OrbitControls, useTexture, Stars, Line } from '@react-three/drei'
import * as THREE from 'three'
import iday from '../assets/earth/earth_day.jpg'
import inormal from '../assets/earth/earth_normal.png'
import ispec from '../assets/earth/earth_specular.png'
import iclouds from '../assets/earth/earth_clouds.jpg'

function toXYZ(lat, lon, r=1){
  const φ=lat*Math.PI/180
  const λ=lon*Math.PI/180
  return new THREE.Vector3(r*Math.cos(φ)*Math.cos(λ), r*Math.sin(φ), r*Math.cos(φ)*Math.sin(λ))
}
function toLatLng(v){
  const r=v.length()
  return { lat: Math.asin(v.y/r)*180/Math.PI, lng: Math.atan2(v.z,v.x)*180/Math.PI }
}
function offsetLatLng(lat, lon, km, bearingDeg){
  const R=6371
  const br=bearingDeg*Math.PI/180
  const φ1=lat*Math.PI/180
  const λ1=lon*Math.PI/180
  const δ=km/R
  const φ2=Math.asin(Math.sin(φ1)*Math.cos(δ)+Math.cos(φ1)*Math.sin(δ)*Math.cos(br))
  const λ2=λ1+Math.atan2(Math.sin(br)*Math.sin(δ)*Math.cos(φ1),Math.cos(δ)-Math.sin(φ1)*Math.sin(φ2))
  return {lat:φ2*180/Math.PI,lng:((λ2*180/Math.PI+540)%360)-180}
}
function ClickMarker({ lat, lng }){
  const pos=useMemo(()=>toXYZ(lat,lng,1.005),[lat,lng])
  return (
    <mesh position={pos}>
      <sphereGeometry args={[0.012,16,16]} />
      <meshStandardMaterial color="#22d3ee" emissive="#22d3ee" emissiveIntensity={0.6}/>
    </mesh>
  )
}
function ImpactRing({ lat, lng, radiusMeters, color='#ef4444' }){
  const km=radiusMeters/1000
  const pts=useMemo(()=>{
    return Array.from({length:256},(_,i)=>i).map(i=>{
      const b=i*360/256
      const p=offsetLatLng(lat,lng,km,b)
      return toXYZ(p.lat,p.lng,1.005)
    })
  },[lat,lng,km])
  return <Line points={pts} lineWidth={1} color={color} />
}
function Earth({ onHover, onPick }){
  const [day, normal, spec, clouds]=useTexture([iday,inormal,ispec,iclouds])
  day.colorSpace=THREE.SRGBColorSpace
  const [down,setDown]=useState([0,0])
  return (
    <group>
      <mesh
        onPointerDown={e=>setDown([e.clientX,e.clientY])}
        onPointerMove={e=>onHover(toLatLng(e.point))}
        onPointerUp={e=>{
          const dx=Math.abs(e.clientX-down[0]),dy=Math.abs(e.clientY-down[1])
          if(dx<3&&dy<3) onPick(toLatLng(e.point))
        }}
      >
        <sphereGeometry args={[1,128,128]} />
        <meshPhongMaterial map={day} normalMap={normal} specularMap={spec} shininess={12} />
      </mesh>
      <mesh raycast={null}>
        <sphereGeometry args={[1.004,128,128]} />
        <meshPhongMaterial map={clouds} transparent opacity={0.6} depthWrite={false} />
      </mesh>
    </group>
  )
}
export default function Globe3D({ impact, onMapClick }){
  const [hover,setHover]=useState({lat:0,lng:0})
  const [picked,setPicked]=useState(null)
  useEffect(()=>{ if(!impact) setPicked(null) },[impact])
  return (
    <div className="relative w-full h-full">
      <Canvas camera={{position:[0,0,3.2], fov:45}}>
        <color attach="background" args={['#0B1220']} />
        <ambientLight intensity={0.6}/>
        <directionalLight position={[5,3,5]} intensity={1.2}/>
        <Stars radius={100} depth={50} count={5000} factor={2} fade />
        <Earth onHover={setHover} onPick={(p)=>{setPicked(p); onMapClick && onMapClick(p)}} />
        {picked && <ClickMarker lat={picked.lat} lng={picked.lng} />}
        {impact && <ImpactRing lat={impact.position.lat} lng={impact.position.lng} radiusMeters={impact.radius} />}
        <OrbitControls enablePan={false} />
      </Canvas>
      <div className="absolute top-3 left-3 bg-black/60 text-white text-xs px-3 py-2 rounded">
        <div>Hover: {hover.lat.toFixed(3)}°, {hover.lng.toFixed(3)}°</div>
        <div>Pick: {picked ? `${picked.lat.toFixed(3)}°, ${picked.lng.toFixed(3)}°` : '—'}</div>
      </div>
    </div>
  )
}
