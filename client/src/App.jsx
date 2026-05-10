// แก้ไขบรรทัด import ด้านบนสุด
import { Routes, Route, Navigate } from 'react-router-dom';
import Layout from "./components/Layout";
import Auth from "./pages/auth/Auth";
import Dashboard from "./pages/dashboard/Dashboard";
import Music from "./pages/music_album/Music";
import MusicDetail from "./pages/music_album/MusicDetail";
import Album from "./pages/music_album/Album";
import AlbumDetail from "./pages/music_album/AlbumDetail";
import Artist from "./pages/artist/Artist";
import ArtistDetail from "./pages/artist/ArtistDetail";
import Chart from "./pages/chart/Chart";
import Users from "./pages/users/Users";
import UsersDetail from "./pages/users/UserDetail";
import SubscriptionPlan from "./pages/subscription_plan/SubscriptionPlans";
import Playlists from "./pages/playlists/Playlists";
import PlaylistDetail from "./pages/playlists/PlaylistDetail";
import Transaction from './pages/transaction/Transaction';
import Overview from './pages/report/Overview';
import Content from './pages/report/Content';
import Recommendation from './pages/report/Recommendation';

function App() {

  const checkAuth = () => !!localStorage.getItem('token');

  return (
      <Routes>
        <Route path="/auth" element={!checkAuth() ? <Auth/> : <Navigate to="/" replace />}/>

        <Route element={checkAuth() ? <Layout /> : <Navigate to="/auth" replace />}>
          <Route path="/" element={<Dashboard/>} />
          <Route path="/music" element={<Music/>} />
          <Route path="/music/:id/" element={<MusicDetail/>}/>
          <Route path="/album" element={<Album/>} />
          <Route path="/album/:id/" element={<AlbumDetail/>}/>
          <Route path="/artist" element={<Artist/>} />
          <Route path="/artist/:id" element={<ArtistDetail/>} />
          <Route path="/chart" element={<Chart/>} />
          <Route path="/users" element={<Users/>} />
          <Route path="/users/:id" element={<UsersDetail/>} />
          <Route path="/subscription-plan" element={<SubscriptionPlan/>} />
          <Route path="/playlist" element={<Playlists/>} />
          <Route path="/playlist/:id" element={<PlaylistDetail/>} />
          <Route path="/transaction" element={<Transaction/>} />
          <Route path="/reports/overview" element={<Overview/>} />
          <Route path="/reports/content" element={<Content/>} />
          <Route path="/reports/recommendation" element={<Recommendation/>} />
        </Route>
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
  )
}

export default App;
