import { Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Auth/Login.js';
import Registration from './pages/Auth/Registration.js';
import Dashboard from './pages/Dashboard/Dashboard.js';
import FinanceLedger from './pages/Finance/FinanceLedger.js';
import AdminUsers from './pages/Admin/AdminUsers.js';
import Hrpayroll from './pages/Hr/Hrpayroll.js';
import Supplychain from './pages/Supplychain/Supplychain.js';
import PurchaseOrderPage from './pages/Supplychain/PurchaseOrder';
import Inventory from './pages/Supplychain/Inventory.js';
import Profile from './pages/Profile/Profile.js';
import ProjectPage from './pages/Project/Project.js';
import BusinessIntelligence from './pages/BusinessIntelligence/BusinessIntelligence';

function App() {
  const isLoggedIn = localStorage.getItem("isLoggedIn") === "true";
  // const navigate=useNavigate();
  return (
    <Routes>
      <Route path="/" element={isLoggedIn ? <Navigate to="/Dashboard" /> : <Login />} />
      <Route path="/Login" element={<Login />} />
      <Route path="/registration" element={<Registration />} />
      <Route path='/Dashboard' element={<Dashboard />} />
      <Route path='/dashboard' element={<Navigate to="/Dashboard" replace />} />
      <Route path='/finance-ledger' element={<FinanceLedger />} />
      <Route path='/vendors' element={<Supplychain />} />
      <Route path='/inventory' element={<Inventory />} />
      <Route path='/purchase-orders' element={<PurchaseOrderPage />} />
      <Route path='/projects' element={<ProjectPage />} />
      <Route path='/admin/users' element={<AdminUsers />} />
      <Route path='/hr-payroll' element={<Hrpayroll />} />
      <Route path='/profile' element={<Profile />} />
      <Route path='/business-intelligence' element={<BusinessIntelligence />} />
    </Routes>
  );
}

export default App;