
import Asteroids from './Components/Asteroids';
import Globe3D from './Components/Globe3D';
import GlobePage from './Components/GlobeComponent';
import Wexio from './Components/Wexio';
import { Routes, Route, Link } from 'react-router-dom';


function App() {

  return (
    <>

    <Routes>
      <Route path="/" element={<Wexio />} />
      <Route path="/Asteroids" element={<Asteroids />} />
      <Route path="/Globe" element={<GlobePage />} />

    </Routes>
      
    </>
  );  


}

export default App;
