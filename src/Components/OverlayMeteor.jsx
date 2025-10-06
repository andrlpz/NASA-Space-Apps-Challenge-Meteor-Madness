
import React, { Suspense, useEffect, useMemo, useRef, useState, useLayoutEffect } from 'react'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { OrthographicCamera, useGLTF } from '@react-three/drei'
import * as THREE from 'three'
import asteroidUrl from '../assets/asteroid.glb'

function useViewportSize() {
  const [s,setS]=useState({w:window.innerWidth,h:window.innerHeight})
  useEffect(()=>{
    const r=()=>setS({w:window.innerWidth,h:window.innerHeight})
    window.addEventListener('resize',r)
    return()=>window.removeEventListener('resize',r)
  },[])
  return s
}

function ResponsiveOrthoCamera() {
  const { size } = useThree()
  const cam = useRef()
  useLayoutEffect(()=>{
    const w=size.width, h=size.height
    cam.current.left = -w/2
    cam.current.right = w/2
    cam.current.top = h/2
    cam.current.bottom = -h/2
    cam.current.near = -1000
    cam.current.far = 1000
    cam.current.position.set(0,0,10)
    cam.current.updateProjectionMatrix()
  },[size])
  return <OrthographicCamera ref={cam} makeDefault />
}

function FallbackRock({ scale=1 }) {
  return (
    <mesh scale={scale}>
      <icosahedronGeometry args={[40, 1]} />
      <meshStandardMaterial color="#a3bffa" roughness={0.8} metalness={0.1} />
    </mesh>
  )
}

function AsteroidMesh({ scale=1 }) {
  let gltf
  try { gltf = useGLTF(asteroidUrl) } catch(e) { console.error('GLB load error:', e) }
  if (!gltf?.scene) return <FallbackRock scale={scale*1.2} />
  const cloned = useMemo(()=>{
    const c=gltf.scene.clone()
    c.traverse(ch=>{ if(ch.isMesh){ ch.castShadow=true; ch.receiveShadow=true } })
    return c
  },[gltf])
  return <primitive object={cloned} scale={scale} rotation={[0.4,0.2,0]} />
}

function easeOutCubic(t){ return 1 - Math.pow(1 - t, 3) }

function OverlayMeteorInner({ targetPx, duration, from, sizeScale, onComplete, controlOffset, showCrosshair }) {
  const { w,h } = useViewportSize()
  const group = useRef()
  const t0 = useRef(0)
  const [done,setDone]=useState(false)

  const startPx = useMemo(()=>{
    if(from==='left') return {x:-160,y:targetPx.y}
    if(from==='right') return {x:w+160,y:targetPx.y}
    if(from==='bottom') return {x:targetPx.x,y:h+180}
    return {x:targetPx.x,y:-180}
  },[from,targetPx,w,h])

  const toWorld = (x,y)=>new THREE.Vector3(x - w/2, h/2 - y, 0)

  const p0 = useMemo(()=>toWorld(startPx.x,startPx.y),[startPx,w,h])
  const p2 = useMemo(()=>toWorld(targetPx.x,targetPx.y),[targetPx,w,h])
  const p1 = useMemo(()=>{
    const cx = startPx.x + (targetPx.x - startPx.x)*0.5
    const cy = startPx.y + (targetPx.y - startPx.y)*(0.5 - controlOffset)
    return toWorld(cx,cy)
  },[startPx,targetPx,w,h,controlOffset])

  useEffect(()=>{ t0.current = performance.now(); setDone(false) },[targetPx.x,targetPx.y,duration,from])


  
  const shrinkStart = useRef(null)
  const shrinkDuration = 1000 

  useFrame((_,delta)=>{
    if(done) {
      
      console.log("Shrinking animation started")
      if(shrinkStart.current && group.current) {
        const shrinkElapsed = performance.now() - shrinkStart.current
        const shrinkProgress = Math.min(shrinkElapsed / shrinkDuration, 1)
        const shrinkT = easeOutCubic(shrinkProgress)
        
        const startShrinkScale = sizeScale * 10
        const currentScale = startShrinkScale - (startShrinkScale - 1) * shrinkT
        group.current.scale.setScalar(currentScale)
        
        group.current.rotation.x += delta*1.6
        group.current.rotation.y += delta*1.2
        
        if (shrinkProgress >= 1 && onComplete) {
          onComplete()
        }
      }
      return
    }
    
    const tt = (performance.now() - t0.current)/duration
    const t = tt>=1?1:easeOutCubic(Math.max(0,Math.min(1,tt)))
    
    const a=(1-t)*(1-t), b=2*(1-t)*t, c=t*t
    const x=a*p0.x + b*p1.x + c*p2.x
    const y=a*p0.y + b*p1.y + c*p2.y
    const z=-40 + 40*(1-t)
    if(group.current){
      group.current.position.set(x,y,z)
      group.current.rotation.x += delta*1.6
      group.current.rotation.y += delta*1.2
      const s = sizeScale * (100 - 90 * t)
      group.current.scale.setScalar(s)
    }
    
    if (tt >= 1) {
      if (!done) {
        setDone(true)
        shrinkStart.current = performance.now()
      }
    }
  })

  return (
    <>
      {showCrosshair && (
        <group position={[p2.x,p2.y,0]}>
          <mesh><boxGeometry args={[6,2,0]} /><meshBasicMaterial color="white" /></mesh>
          <mesh position={[0,0,0]} rotation={[0,0,Math.PI/2]}><boxGeometry args={[6,2,0]} /><meshBasicMaterial color="white" /></mesh>
        </group>
      )}
      <group ref={group}>
        <Suspense fallback={<FallbackRock />}>
          <AsteroidMesh />
        </Suspense>
      </group>
    </>
  )
}

export default function OverlayMeteor({
  target,
  duration=1400,
  from='top',
  scale=1,
  onComplete,
  followElementId,
  followElement,
  zIndex=12000,
  controlOffset=0.25,
  enabled=true,
  showCrosshair=false
}) {
  console.log('OverlayMeteor rendered with:', { target, enabled, from, scale, duration });
  const [targetPx,setTargetPx]=useState({x:window.innerWidth/2,y:window.innerHeight/2})

  useEffect(()=>{
    if(target){
      setTargetPx(target)
      return
    }
    const el = followElement || (followElementId ? document.getElementById(followElementId) : null)
    if(!el) return
    const rect = el.getBoundingClientRect()
    setTargetPx({ x: rect.left + rect.width/2, y: rect.top + rect.height/2 })
  },[target,followElementId,followElement])

  if(!enabled) return null

  return (
    <div style={{position:'fixed',inset:0,pointerEvents:'none',zIndex}}>
      <Canvas
        gl={{ alpha:true, antialias:true }}
        dpr={[1,2]}
        style={{ width:'100%',height:'100%',pointerEvents:'none' }}
        onCreated={({ gl })=>{ gl.setClearColor(0x000000, 0) }}
      >
        <ResponsiveOrthoCamera />
        <ambientLight intensity={0.9} />
        <directionalLight position={[200,200,200]} intensity={1.2} />
        <OverlayMeteorInner
          targetPx={targetPx}
          duration={duration}
          from={from}
          sizeScale={scale}
          onComplete={onComplete}
          controlOffset={controlOffset}
          showCrosshair={showCrosshair}
        />
      </Canvas>
    </div>
  )
}

useGLTF.preload(asteroidUrl)