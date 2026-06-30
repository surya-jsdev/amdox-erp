import { Routes, Route } from 'react-router-dom';
import Login from './pages/Auth/Login.js';
import Registration from './pages/Auth/Registration.js';
import Dashboard from './pages/Dashboard/Dashboard.js';
import FinanceLedger from './pages/Finance/FinanceLedger.js';
import AdminUsers from './pages/AdminUsers';
import Hrpayroll from './pages/Hr/Hrpayroll.js';
import Profile from './pages/Profile/Profile.js';

function App() {
  return (
    <Routes>
      <Route path="/" element={<Login />} />
      <Route path="/Login" element={<Login />} />
      <Route path="/registration" element={<Registration />} />
      <Route path='/Dashboard' element={<Dashboard />} />
      <Route path='/finance-ledger' element={<FinanceLedger />} />
      <Route path='/admin/users' element={<AdminUsers />} />
      <Route path='/hr-payroll' element={<Hrpayroll />} />
      <Route path='/Profile' element={<Profile />} />
    </Routes>
  );
}

export default App;