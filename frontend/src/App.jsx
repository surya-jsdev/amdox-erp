import { Routes, Route } from 'react-router-dom';
import Login from './pages/Auth/Login';
// import Register from './pages/Auth/Register';

function App() {
  return (
    <Routes>
      <Route path="/" element={<Login />} />
      {/* <Route path="/register" element={<Register />} /> */}
    </Routes>
  );
}

export default App;