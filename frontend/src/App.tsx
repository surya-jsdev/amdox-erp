import { Routes, Route } from 'react-router-dom';
import Login from './pages/Auth/Login.js';
import Registration from './pages/Auth/Registration.js';
import Dashboard from './pages/Dashboard/Dashboard.js';
import FinanceLedger from './pages/FinanceLedger';
import AdminUsers from './pages/AdminUsers';

function App() {
  return (
    <Routes>
      <Route path="/" element={<Dashboard />} />
      <Route path="/Login" element={<Login />} />
      <Route path="/registration" element={<Registration />} />
      <Route path='/Dashboard' element={<Dashboard />} />
      <Route path='/finance-ledger' element={<FinanceLedger />} />
      <Route path='/admin/users' element={<AdminUsers />} />
    </Routes>
  );
}

export default App;