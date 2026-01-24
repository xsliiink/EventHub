import { useEffect } from 'react';
import { socket } from './socket';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Register from "./pages/register/Register";
import Login from './pages/login/Login';
import Home from './pages/home/Home';


function App() {

  useEffect(() => {
      // Эта штука сработает один раз при запуске приложения
      socket.on('connect', () => {
        console.log('✅ Соединение с сервером установлено! ID:', socket.id);
      });

      return () => {
        socket.off('connect');
      };
    }, []);

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/register" element={<Register />} />
        <Route path="/login" element={<Login />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
