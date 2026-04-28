import { Routes, Route } from 'react-router-dom';
import Layout from "./components/Layout";
import Dashboard from './pages/Dashboard';
import Music from "./pages/music_album/Music";
import Users from "./pages/users/Users";
function App() {
  
  return (
    
      <Routes>
        <Route element={<Layout/>}>

        <Route path="/" element={<Dashboard/>} />
        <Route path="/music" element={<Music/>} />
        <Route path="/users" element={<Users/>} />
        {/* <Route path="/subscription-plans" element={<SubscriptionPlans/>} /> */}

        </Route>
        
      </Routes>
  )
}

export default App
