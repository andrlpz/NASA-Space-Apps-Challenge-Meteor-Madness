import Globe3D from './Globe3D'




export default function GlobePage({ impact, onMapClick }) {
  return <div className="h-full w-full bg-gray-900"><Globe3D impact={impact} onMapClick={onMapClick} /></div>
}