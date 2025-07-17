// src/App.tsx
import { useEffect } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import NotFound from './pages/NotFound';
import LoginForm from './pages/Login';
import { EventCalendar } from './components/calendar';
import UserCreateForm from './pages/CreateUser';
import { useAuth } from './context';

const App = () => {
  const { checkToken } = useAuth()

  useEffect(() => {
    checkToken()
  }, [])

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<LoginForm />} />
        <Route path="/calendario" element={< EventCalendar />} />
        <Route path="/no" element={<NotFound />} />
        <Route path="/user" element={<UserCreateForm/>} />
      </Routes>
    </BrowserRouter>
  );
};

export default App;
