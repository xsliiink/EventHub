import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Register from "./pages/register/Register";
import Login from './pages/login/Login';
import Home from './pages/home/Home';


function App() {
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
