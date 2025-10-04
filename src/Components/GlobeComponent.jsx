import Globe3D from './Globe3D'



export default function GlobePage({ impact, onMapClick, resetImpact }) {
  return <div className="h-full w-full bg-gray-900"><Globe3D impact={impact} onMapClick={onMapClick} resetImpact={resetImpact}/></div>
}