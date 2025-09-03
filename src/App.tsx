// src/App.tsx
import { useEffect } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import NotFound from './pages/NotFound';
import LoginForm from './pages/Login';
import { EventCalendar } from './components/calendar';
import UserCreateForm from './pages/CreateUser';
import { useAuth } from './context';
import EstadosEventosPage from './pages/EventStatus';
import LockScreen from './pages/LockScreen';
import EventList from './pages/EventList';
// import LoginNuevo from './pages/LoginNuevo';

const App = () => {
  const { checkToken } = useAuth()

  useEffect(() => {
    checkToken()
  }, [])

  return (
    <LockScreen>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/eventos" element={<EventList />} />
          <Route path="/login" element={<LoginForm />} />
          <Route path="/calendario" element={< EventCalendar />} />
          <Route path="/no" element={<NotFound />} />
          <Route path="/user" element={<UserCreateForm/>} />
          <Route path="/estados" element={<EstadosEventosPage/>} />
        </Routes>
      </BrowserRouter>
    </LockScreen>
  );
};

export default App;
