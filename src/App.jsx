import Asteroids from './Components/Asteroids';
import Globe3D from './Components/Globe3D';
import GlobePage from './Components/GlobeComponent';
import OverlayMeteor from './Components/OverlayMeteor';
import Wexio from './Components/Wexio';
import { MeteorProvider } from './Components/MeteorProvider';
import { Routes, Route, Link } from 'react-router-dom';




function App() {

  return (
     <MeteorProvider>
      <Routes>
        <Route path="/" element={<Wexio />} />
        <Route path="/Asteroids" element={<Asteroids />} />
      </Routes>
    </MeteorProvider>
  );  


}

export default App;