import { Routes, Route } from 'react-router-dom';
import Layout from "./components/Layout";
import Dashboard from './pages/Dashboard';
import MusicDetail from "./pages/music_album/MusicDetail"
import Music from "./pages/music_album/Music";
import Album from './pages/music_album/Album';
import AlbumDetail from './pages/music_album/AlbumDetail';
import Users from './pages/users/Users';
import UserDetail from './pages/users/UserDetail';
import Playlists from "./pages/playlists/Playlists";
import PlaylistDetail from "./pages/playlists/PlaylistDetail";
import Overview from "./pages/overview/Overview";
function App() {

  return (
      <Routes>
        <Route element={<Layout/>}>

        <Route path="/" element={<Dashboard/>} />
        <Route path="/music" element={<Music/>} />
        <Route path="/music/:id/" element={<MusicDetail/>}/>
        <Route path="/users" element={<Users/>} />
        <Route path="/album" element={<Album/>} />
        <Route path="/album/:id" element={<AlbumDetail/>} />
        <Route path="/users" element={<Users/>}/>
        <Route path="/users/:id" element={<UserDetail/>}/>
        <Route path="/playlists" element={<Playlists/>} />
        <Route path="/playlists/:id" element={<PlaylistDetail/>} />
        <Route path="/reports/overview" element={<Overview/>} />
        </Route>
      </Routes>
  )
}

export default App
