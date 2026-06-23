import { Routes, Route } from 'react-router-dom';
import Login from './pages/Auth/Login';
import Registration from './pages/Auth/Registration';
import Dashboard from './pages/Dashboard/Dashboard';

function App() {
  return (
    <Routes>
      <Route path="/" element={<Login />} />
      <Route path="/Login" element={<Login />} />
      <Route path="/registration" element={<Registration />} />
      <Route path='/Dashboard' element={<Dashboard />} />
    </Routes>
  );
}

export default App;