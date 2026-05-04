import { Routes, Route } from 'react-router-dom';
import Layout from "./components/Layout";
import Dashboard from './pages/Dashboard';
import MusicDetail from "./pages/music_album/MusicDetail"
import Music from "./pages/music_album/Music";
import Users from "./pages/users/Users";
import Playlists from "./pages/playlists/Playlists";
import PlaylistDetail from "./pages/playlists/PlaylistDetail";

function App() {

  return (
      <Routes>
        <Route element={<Layout/>}>
          <Route path="/" element={<Dashboard/>} />
          <Route path="/music" element={<Music/>} />
          <Route path="/music/:id/" element={<MusicDetail/>}/>
          <Route path="/users" element={<Users/>} />
          <Route path="/playlists" element={<Playlists/>} />
          <Route path="/playlists/:id" element={<PlaylistDetail/>} />
        </Route>
      </Routes>
  )
}

export default App
