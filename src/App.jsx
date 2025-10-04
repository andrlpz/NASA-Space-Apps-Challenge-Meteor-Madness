
import Asteroids from './Components/Asteroids';
import Wexio from './Components/Wexio';
import { Routes, Route, Link } from 'react-router-dom';


function App() {

  return (
    <>

    <Routes>
      <Route path="/" element={<Wexio />} />
      <Route path="/Asteroids" element={<Asteroids />} />

    </Routes>
      
    </>
  );  


}

export default App;
