import { Routes, Route } from 'react-router-dom';
import Layout from "./components/Layout";
import Dashboard from './pages/Dashboard';
import Music from "./pages/Music";
import MusicDetail from "./pages/MusicDetail"
function App() {
  
  return (
    
      <Routes>
        <Route element={<Layout/>}>

        <Route path="/" element={<Dashboard/>} />
        <Route path="/music" element={<Music/>} />
        <Route path="/music/:id/" element={<MusicDetail/>}/>
        </Route>
        
      </Routes>
  )
}

export default App
