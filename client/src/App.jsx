import { Routes, Route } from 'react-router-dom';
import Layout from "./components/Layout";
import Dashboard from './pages/Dashboard';
import Music from "./pages/Music";
function App() {
  
  return (
    
      <Routes>
        <Route element={<Layout/>}>

        <Route path="/" element={<Dashboard/>} />
        <Route path="/music" element={<Music/>} />

        </Route>
        
      </Routes>
  )
}

export default App
