import { Routes, Route } from 'react-router-dom';
import Layout from "./components/Layout";
import Auth from "./pages/auth/Auth";
import Dashboard from './pages/dashboard/Dashboard';
import Music from "./pages/music_album/Music";
import MusicDetail from "./pages/music_album/MusicDetail"
import Album from './pages/music_album/Album';
import AlbumDetail from './pages/music_album/AlbumDetail';
import Artist from './pages/artist/Artist';
import Chart from './pages/chart/Chart';
import Users from "./pages/users/Users";
import UsersDetail from "./pages/users/UserDetail";
import SubscriptionPlans from './pages/subscription_plan/SubscriptionPlans';
import Playlists from "./pages/playlists/Playlists";
import PlaylistDetail from "./pages/playlists/PlaylistDetail";
import Transaction from './pages/transaction/Transaction';
import Overview from './pages/report/Overview';
import Content from './pages/report/Content';
import Recommendation from './pages/report/Recommendation';

function App() {

  return (
      <Routes>
        <Route element={<Layout/>}>
          <Route path="/" element={<Dashboard/>} />
          <Route path="/music" element={<Music/>} />
          <Route path="/music/:id/" element={<MusicDetail/>}/>
          <Route path="/album" element={<Album/>} />
          <Route path="/album/:id/" element={<AlbumDetail/>}/>
          <Route path="/artist" element={<Artist/>} />
          <Route path="/chart" element={<Chart/>} />
          <Route path="/user" element={<Users/>} />
          <Route path="/subscription" element={<SubscriptionPlans/>} />
          <Route path="/playlist" element={<Playlists/>} />
          <Route path="/playlist/:id" element={<PlaylistDetail/>} />
          <Route path="/transaction" element={<Transaction/>} />
          <Route path="/report/overview" element={<Overview/>} />
          <Route path="/report/content" element={<Content/>} />
          <Route path="/report/recommendation" element={<Recommendation/>} />
        </Route>
        <Route path="/auth" element={<Auth/>} />
      </Routes>
  )
}

export default App
