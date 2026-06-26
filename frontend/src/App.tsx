// import { Routes, Route } from 'react-router-dom';
// import Login from './pages/Auth/Login.js';
// import Registration from './pages/Auth/Registration.js';
// import Dashboard from './pages/Dashboard/Dashboard.js';

// function App() {
//   return (
//     <Routes>
//       <Route path="/" element={<Login />} />
//       <Route path="/Login" element={<Login />} />
//       <Route path="/registration" element={<Registration />} />
//       <Route path='/Dashboard' element={<Dashboard />} />
//     </Routes>
//   );
// }

// export default App;
import { Routes, Route } from 'react-router-dom';
import Login from './pages/Auth/Login.js';
import Registration from './pages/Auth/Registration.js';
import Dashboard from './pages/Dashboard/Dashboard.js';

// 👉 Bas ye ek line add ki hai aapka dashboard import karne ke liye
import { FinanceDashboard } from './components/finance-dashboard/FinanceDashboard';

function App() {
  return (
    <Routes>
      {/* Teammate ke purane routes (Bilkul safe hain) */}
      <Route path="/" element={<Login />} />
      <Route path="/Login" element={<Login />} />
      <Route path="/registration" element={<Registration />} />
      <Route path='/Dashboard' element={<Dashboard />} />
      
      {/* 👉 Bas ye ek naya route add kiya hai aapke liye */}
      <Route path='/finance' element={<FinanceDashboard />} />
    </Routes>
  );
}

export default App;